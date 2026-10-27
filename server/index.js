import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './db.js';
import {
  corsOptions,
  securityHeaders,
  createRateLimiter,
  asTrimmedString,
  validatePasswordPolicy,
  EMAIL_REGEX,
  NUIT_REGEX,
  BI_REGEX,
  HEX_COLOR_REGEX
} from './security.js';
import {
  createSession,
  destroySession,
  destroyUserSessions,
  requireAuth,
  requireGestor,
  isGestorRole,
  resolveSession,
  purgeExpiredSessions
} from './sessions.js';
import {
  validarProcesso,
  limparProcessoDoCandidato,
  listarProcessos,
  obterProcesso,
  gravarProcesso,
  eliminarProcesso,
  sincronizarEstadoNoJson
} from './processos.js';

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Hash fictício para igualar o tempo de resposta quando o utilizador não existe
const DUMMY_HASH = bcrypt.hashSync('sernic-timing-equaliser', 10);

app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use(securityHeaders);
app.use(cors(corsOptions()));
// A importação de processos do navegador precisa de um limite maior que os restantes pedidos
app.use('/api/gestor/processos/importar', express.json({ limit: '10mb' }));
app.use(express.json({ limit: '300kb' }));

app.use('/api', createRateLimiter({
  windowMs: 60 * 1000,
  max: 300,
  message: 'Demasiados pedidos. Aguarde um momento e tente novamente.'
}));

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyFn: req => `${req.ip}|${asTrimmedString(req.body?.identifier, 120).toLowerCase()}`,
  message: 'Demasiadas tentativas de autenticação. Aguarde 15 minutos antes de tentar novamente.'
});

const sensitiveLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Demasiados pedidos para esta operação. Aguarde alguns minutos.'
});

// Log access helper
function logAudit(nuit, acao, detalhes) {
  try {
    const stmt = db.prepare('INSERT INTO logs_acesso (nuit, acao, detalhes) VALUES (?, ?, ?)');
    stmt.run(nuit || 'ANONIMO', acao, detalhes || '');
  } catch (err) {
    console.error('Erro ao registar log de auditoria:', err);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'SERNIC - Plataforma de Candidaturas',
    timestamp: new Date().toISOString()
  });
});

// User login endpoint
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const identifier = asTrimmedString(req.body?.identifier, 120);
  const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, 128) : '';

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, informe o NUIT / Nome do Perfil e a Senha.'
    });
  }

  try {
    const user = db.prepare(`
      SELECT id, nuit, name, email, role, password, created_at
      FROM users
      WHERE nuit = ? OR lower(email) = lower(?) OR name = ?
    `).get(identifier, identifier, identifier);

    const passwordOk = bcrypt.compareSync(password, user ? user.password : DUMMY_HASH);

    if (!user || !passwordOk) {
      logAudit(identifier, 'LOGIN_FALHOU', user ? 'Senha incorrecta' : 'Utilizador não encontrado');
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas. Verifique o NUIT / E-mail e a senha.'
      });
    }

    // Modos separados: gestores só entram pela Área de Gestão e candidatos pelo Portal
    const modo = req.body?.expectedRole === 'gestor' ? 'gestor' : 'candidate';
    const eGestor = isGestorRole(user.role);
    if (modo === 'gestor' && !eGestor) {
      logAudit(user.nuit, 'LOGIN_FALHOU', 'Candidato tentou entrar na Área de Gestão');
      return res.status(403).json({
        success: false,
        message: 'Estas credenciais pertencem a um candidato. Utilize o Portal de Recrutamento.'
      });
    }
    if (modo === 'candidate' && eGestor) {
      logAudit(user.nuit, 'LOGIN_FALHOU', 'Gestor tentou entrar pelo Portal do Candidato');
      return res.status(403).json({
        success: false,
        message: 'Contas de gestão devem entrar pela Área de Gestão e Júri.'
      });
    }

    const candidaturas = eGestor ? [] : db.prepare(`
      SELECT * FROM candidaturas WHERE nuit = ? ORDER BY data_submissao DESC
    `).all(user.nuit);

    const token = createSession(user.id);
    logAudit(user.nuit, eGestor ? 'LOGIN_GESTOR' : 'LOGIN_SUCESSO', `Acesso efectuado com perfil ${user.role}`);

    const { password: _, ...userSafe } = user;
    return res.json({
      success: true,
      message: eGestor ? `Painel de Gestão activo: Bem-vindo(a), ${user.name}!` : `Bem-vindo(a), ${user.name}!`,
      user: userSafe,
      token,
      candidaturas
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar autenticação.'
    });
  }
});

// Google OAuth Login / Registo
app.post('/api/auth/google', loginLimiter, (req, res) => {
  const cleanEmail = asTrimmedString(req.body?.email, 120).toLowerCase();
  const name = asTrimmedString(req.body?.name, 120);
  const nuit = asTrimmedString(req.body?.nuit, 9);

  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: 'O endereço de correio eletrónico Google é obrigatório.'
    });
  }

  try {
    let user = db.prepare('SELECT id, nuit, name, email, role, created_at FROM users WHERE lower(email) = ?').get(cleanEmail);

    // Contas de gestão só podem autenticar-se com senha
    if (user && user.role !== 'candidate') {
      logAudit(user.nuit, 'LOGIN_GOOGLE_BLOQUEADO', 'Tentativa de acesso a conta de gestão via Google');
      return res.status(403).json({
        success: false,
        message: 'Esta conta só pode ser acedida com NUIT / E-mail e senha.'
      });
    }

    if (!user) {
      // Registo automático com conta Google
      const generatedNuit = NUIT_REGEX.test(nuit) ? nuit : ('10' + Math.floor(1000000 + Math.random() * 9000000));
      const userName = name || cleanEmail.split('@')[0];

      const insert = db.prepare(`
        INSERT INTO users (nuit, name, password, email, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(generatedNuit, userName, 'google_oauth_verified', cleanEmail, 'candidate');

      user = {
        id: insert.lastInsertRowid,
        nuit: generatedNuit,
        name: userName,
        email: cleanEmail,
        role: 'candidate',
        authProvider: 'google',
        googleVerified: true
      };

      logAudit(user.nuit, 'REGISTO_GOOGLE', `Nova conta de candidato criada via Google (${cleanEmail})`);
    } else {
      user.authProvider = 'google';
      user.googleVerified = true;
      logAudit(user.nuit, 'LOGIN_GOOGLE', `Autenticação efetuada com sucesso via Google (${cleanEmail})`);
    }

    // Buscar candidaturas associadas
    const candidaturas = db.prepare(`
      SELECT * FROM candidaturas WHERE nuit = ? OR email = ? ORDER BY data_submissao DESC
    `).all(user.nuit, user.email);

    return res.json({
      success: true,
      message: `Bem-vindo(a), ${user.name}! Sessão iniciada com a conta Google.`,
      user,
      candidaturas
    });
  } catch (err) {
    console.error('Erro na autenticação Google:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro ao autenticar com a Google.'
    });
  }
});

// Sessão actual (restaurar após recarregar a página)
app.get('/api/auth/sessao', requireAuth, (req, res) => {
  res.json({ success: true, user: req.session.user });
});

app.post('/api/auth/logout', (req, res) => {
  const session = resolveSession(req);
  if (session) {
    destroySession(session.token);
    logAudit(session.user.nuit, 'LOGOUT', 'Sessão terminada pelo utilizador');
  }
  res.json({ success: true });
});

app.post('/api/auth/alterar-senha', requireAuth, loginLimiter, (req, res) => {
  const senhaActual = typeof req.body?.senhaActual === 'string' ? req.body.senhaActual : '';
  const novaSenha = typeof req.body?.novaSenha === 'string' ? req.body.novaSenha : '';
  const { user, token } = req.session;

  const row = db.prepare('SELECT password FROM users WHERE id = ?').get(user.id);
  if (!row || !bcrypt.compareSync(senhaActual, row.password)) {
    logAudit(user.nuit, 'ALTERAR_SENHA_FALHOU', 'Senha actual incorrecta');
    return res.status(400).json({ success: false, message: 'A senha actual está incorrecta.' });
  }
  const erro = validatePasswordPolicy(novaSenha);
  if (erro) return res.status(400).json({ success: false, message: erro });
  if (bcrypt.compareSync(novaSenha, row.password)) {
    return res.status(400).json({ success: false, message: 'A nova senha deve ser diferente da actual.' });
  }

  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(novaSenha, 10), user.id);
  destroyUserSessions(user.id, token);
  logAudit(user.nuit, 'ALTERAR_SENHA', 'Senha alterada; outras sessões terminadas');
  res.json({ success: true, message: 'Senha alterada com sucesso. As outras sessões abertas foram terminadas.' });
});

// ====================== ÁREA DE GESTÃO (apenas gestores) ======================
app.get('/api/gestor/resumo', requireGestor, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS n FROM candidaturas').get().n;
  const porEstado = db.prepare('SELECT status, COUNT(*) AS n FROM candidaturas GROUP BY status ORDER BY n DESC').all();
  const porCarreira = db.prepare('SELECT carreira, COUNT(*) AS n FROM candidaturas GROUP BY carreira ORDER BY n DESC').all();
  const falhasLogin24h = db.prepare(`
    SELECT COUNT(*) AS n FROM logs_acesso
    WHERE acao LIKE '%FALHOU%' AND data_hora >= datetime('now', '-1 day')
  `).get().n;
  res.json({ success: true, resumo: { total, porEstado, porCarreira, falhasLogin24h } });
});

app.get('/api/gestor/candidaturas', requireGestor, (req, res) => {
  const busca = asTrimmedString(req.query.busca, 80);
  const estado = asTrimmedString(req.query.estado, 80);
  const where = [];
  const params = [];
  if (busca) {
    where.push('(nome_completo LIKE ? OR nuit LIKE ? OR codigo_candidatura LIKE ? OR bi_numero LIKE ? OR email LIKE ?)');
    const like = `%${busca}%`;
    params.push(like, like, like, like, like);
  }
  if (estado) {
    where.push('status = ?');
    params.push(estado);
  }
  const rows = db.prepare(`
    SELECT id, codigo_candidatura, nuit, nome_completo, email, telefone, carreira, nivel_academico, bi_numero, status, data_submissao
    FROM candidaturas ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY data_submissao DESC LIMIT 500
  `).all(...params);
  res.json({ success: true, candidaturas: rows });
});

const ESTADOS_CANDIDATURA = [
  'Submetida com Sucesso',
  'Em Análise Documental',
  'Admitido na Análise Documental',
  'Admitida na Análise Documental',
  'Entrevista Profissional',
  'Admitido',
  'Admitida',
  'Aprovado (Suplente)',
  'Aprovada (Suplente)',
  'Excluído na Análise Documental',
  'Excluída na Análise Documental',
  'Excluído na Entrevista',
  'Excluída na Entrevista',
  'Excluído',
  'Excluída'
];

app.post('/api/gestor/candidaturas/:id/estado', requireGestor, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const estado = asTrimmedString(req.body?.estado, 80);
  const motivo = asTrimmedString(req.body?.motivo, 500);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'Candidatura inválida.' });
  }
  if (!ESTADOS_CANDIDATURA.includes(estado)) {
    return res.status(400).json({ success: false, message: 'Estado de candidatura inválido.' });
  }
  if (estado.startsWith('Exclu') && motivo.length < 5) {
    return res.status(400).json({ success: false, message: 'Indique o fundamento da exclusão.' });
  }

  const cand = db.prepare('SELECT codigo_candidatura, status FROM candidaturas WHERE id = ?').get(id);
  if (!cand) return res.status(404).json({ success: false, message: 'Candidatura não encontrada.' });

  db.prepare('UPDATE candidaturas SET status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?').run(estado, id);
  sincronizarEstadoNoJson(id, estado);
  logAudit(
    req.session.user.nuit,
    'ALTERAR_ESTADO_CANDIDATURA',
    `${cand.codigo_candidatura}: "${cand.status}" → "${estado}"${motivo ? ` (Fundamento: ${motivo})` : ''}`
  );
  res.json({ success: true, message: `Estado da candidatura ${cand.codigo_candidatura} actualizado para "${estado}".` });
});

// Processos completos usados pelas abas Inscritos e Avaliação dos Candidatos
app.get('/api/gestor/processos', requireGestor, (req, res) => {
  res.json({ success: true, processos: listarProcessos() });
});

function registarAlteracaoProcesso(nuitGestor, processo, resultado) {
  const alvo = `${processo.codigoCandidatura} (${asTrimmedString(processo.nomeCompleto, 120)})`;
  if (resultado.criado) {
    logAudit(nuitGestor, 'PROCESSO_CRIADO', `${alvo} registado com estado "${resultado.estadoNovo}"`);
  } else if (resultado.estadoAnterior !== resultado.estadoNovo) {
    const motivo = asTrimmedString(processo.deliberacaoJuri?.motivoExclusao || processo.deliberacaoJuri?.parecer, 300);
    logAudit(
      nuitGestor,
      'ALTERAR_ESTADO_CANDIDATURA',
      `${alvo}: "${resultado.estadoAnterior}" → "${resultado.estadoNovo}"${motivo ? ` (Fundamento: ${motivo})` : ''}`
    );
  }
}

app.put('/api/gestor/processos/:codigo', requireGestor, (req, res) => {
  const codigo = asTrimmedString(req.params.codigo, 40).toUpperCase();
  const processo = req.body?.processo;
  const erro = validarProcesso(processo);
  if (erro) return res.status(400).json({ success: false, message: erro });
  if (asTrimmedString(processo.codigoCandidatura, 40).toUpperCase() !== codigo) {
    return res.status(400).json({ success: false, message: 'O código do processo não corresponde ao endereço.' });
  }

  try {
    const resultado = gravarProcesso(processo);
    registarAlteracaoProcesso(req.session.user.nuit, processo, resultado);
    res.json({ success: true, criado: resultado.criado });
  } catch (err) {
    console.error('Erro ao gravar processo:', err);
    res.status(500).json({ success: false, message: 'Não foi possível gravar o processo no servidor.' });
  }
});

app.post('/api/gestor/processos/importar', requireGestor, (req, res) => {
  const lista = Array.isArray(req.body?.processos) ? req.body.processos.slice(0, 1000) : null;
  if (!lista) return res.status(400).json({ success: false, message: 'Lista de processos inválida.' });

  const invalidos = [];
  let importados = 0;
  const importar = db.transaction(() => {
    for (const p of lista) {
      const erro = validarProcesso(p);
      if (erro) {
        invalidos.push({ codigo: asTrimmedString(p?.codigoCandidatura, 40), erro });
        continue;
      }
      // A importação nunca substitui processos que já existem no servidor
      if (obterProcesso(asTrimmedString(p.codigoCandidatura, 40).toUpperCase())) continue;
      gravarProcesso(p);
      importados += 1;
    }
  });

  try {
    importar();
    if (importados > 0) {
      logAudit(req.session.user.nuit, 'PROCESSOS_IMPORTADOS', `${importados} processo(s) enviados do navegador para o servidor`);
    }
    res.json({ success: true, importados, invalidos });
  } catch (err) {
    console.error('Erro ao importar processos:', err);
    res.status(500).json({ success: false, message: 'Não foi possível importar os processos.' });
  }
});

app.delete('/api/gestor/processos/:codigo', requireGestor, (req, res) => {
  const codigo = asTrimmedString(req.params.codigo, 40).toUpperCase();
  const removido = eliminarProcesso(codigo);
  if (!removido) return res.status(404).json({ success: false, message: 'Candidatura não encontrada.' });
  logAudit(req.session.user.nuit, 'PROCESSO_ELIMINADO', `${codigo} (${removido.nome_completo}) eliminado; estado anterior "${removido.status}"`);
  res.json({ success: true });
});

app.get('/api/gestor/estados', requireGestor, (req, res) => {
  res.json({ success: true, estados: ESTADOS_CANDIDATURA });
});

app.get('/api/gestor/acessos', requireGestor, (req, res) => {
  const filtro = asTrimmedString(req.query.filtro, 40);
  const params = [];
  let where = '';
  if (filtro === 'falhas') where = "WHERE acao LIKE '%FALHOU%' OR acao LIKE '%BLOQUEADO%'";
  else if (filtro === 'gestao') {
    where = "WHERE acao IN ('LOGIN_GESTOR', 'ALTERAR_ESTADO_CANDIDATURA', 'ALTERAR_SENHA', 'LOGOUT')";
  }
  const logs = db.prepare(`
    SELECT id, nuit, acao, detalhes, data_hora FROM logs_acesso ${where}
    ORDER BY id DESC LIMIT 300
  `).all(...params);
  res.json({ success: true, logs });
});

// Solicitar Acesso / Nova Candidatura
app.post('/api/candidaturas/solicitar', sensitiveLimiter, (req, res) => {
  const body = req.body || {};
  const nuit = asTrimmedString(body.nuit, 9);
  const nomeCompleto = asTrimmedString(body.nomeCompleto, 150);
  const email = asTrimmedString(body.email, 120).toLowerCase();
  const telefone = asTrimmedString(body.telefone, 20);
  const bi = asTrimmedString(body.bi, 13).toUpperCase();
  const carreira = asTrimmedString(body.carreira, 150);
  const nivelAcademico = asTrimmedString(body.nivelAcademico, 80);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!nuit || !nomeCompleto || !email || !telefone || !carreira) {
    return res.status(400).json({
      success: false,
      message: 'Todos os campos obrigatórios devem ser preenchidos.'
    });
  }
  if (!NUIT_REGEX.test(nuit)) {
    return res.status(400).json({ success: false, message: 'NUIT inválido: deve conter 9 dígitos.' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: 'Endereço de e-mail inválido.' });
  }
  if (bi && !BI_REGEX.test(bi)) {
    return res.status(400).json({ success: false, message: 'BI inválido: 12 dígitos seguidos de 1 letra.' });
  }
  // A senha só é exigida quando o pedido também cria a conta de acesso do candidato
  if (password) {
    const passwordError = validatePasswordPolicy(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }
  }

  try {
    const codigoCliente = asTrimmedString(body.codigoCandidatura, 40);
    const codigoCandidatura = /^SERNIC-2026-(REC-)?\d{5}$/.test(codigoCliente) &&
      !db.prepare('SELECT 1 FROM candidaturas WHERE codigo_candidatura = ?').get(codigoCliente)
      ? codigoCliente
      : `SERNIC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    // Regra estrita: cada candidato é único, sem repetições
    const existingCandidatura = db.prepare(`
      SELECT codigo_candidatura, bi_numero, nuit FROM candidaturas 
      WHERE nuit = ? OR (bi_numero IS NOT NULL AND bi_numero != '' AND bi_numero = ?)
    `).get(nuit, bi || '');

    if (existingCandidatura) {
      logAudit(nuit, 'TENTATIVA_DUPLICACAO', `Candidato tentou reinscrever-se. Já possui candidatura ${existingCandidatura.codigo_candidatura}`);
      return res.status(409).json({
        success: false,
        message: `Já existe uma candidatura registada no sistema para este candidato (Protocolo: ${existingCandidatura.codigo_candidatura}). Cada candidato é único e não são permitidas duplicações de candidaturas.`
      });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE nuit = ?').get(nuit);
    if (!existingUser && password) {
      db.prepare(`
        INSERT INTO users (nuit, name, password, email, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(nuit, nomeCompleto, bcrypt.hashSync(password, 10), email, 'candidate');
    }

    // Processo completo enviado pelo formulário (documentos, habilitações, fotografia)
    const ESTADO_INICIAL = 'Em Análise Documental';
    let dadosJson = null;
    if (body.processo && !validarProcesso({ ...body.processo, codigoCandidatura: codigoCandidatura })) {
      const limpo = limparProcessoDoCandidato(
        { ...body.processo, codigoCandidatura: codigoCandidatura, nuit, nomeCompleto, email, telefone },
        ESTADO_INICIAL
      );
      dadosJson = JSON.stringify(limpo);
    }

    db.prepare(`
      INSERT INTO candidaturas (
        codigo_candidatura, nuit, nome_completo, email, telefone, carreira, nivel_academico, bi_numero, status,
        dados_json, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      codigoCandidatura,
      nuit,
      nomeCompleto,
      email,
      telefone,
      carreira,
      nivelAcademico || 'Médio / Superior',
      bi || '',
      dadosJson ? ESTADO_INICIAL : 'Submetida com Sucesso',
      dadosJson
    );

    logAudit(nuit, 'NOVA_CANDIDATURA', `Candidatura ${codigoCandidatura} registada para ${carreira}`);

    return res.json({
      success: true,
      message: 'Solicitação de acesso e candidatura registadas com sucesso no sistema!',
      codigoCandidatura,
      detalhes: {
        nuit,
        nome: nomeCompleto,
        carreira,
        protocolo: codigoCandidatura
      }
    });
  } catch (err) {
    console.error('Erro ao registar candidatura:', err);
    return res.status(500).json({
      success: false,
      message: 'Ocorreu um erro ao submeter a candidatura.'
    });
  }
});

// Recuperar senha
app.post('/api/auth/recuperar-senha', sensitiveLimiter, (req, res) => {
  const identifier = asTrimmedString(req.body?.identifier, 120);

  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: 'Informe o NUIT ou o E-mail registado.'
    });
  }

  try {
    const user = db.prepare(`
      SELECT nuit, name, email FROM users WHERE nuit = ? OR lower(email) = lower(?)
    `).get(identifier, identifier);

    // Resposta idêntica exista ou não a conta, para não revelar utilizadores registados
    const response = {
      success: true,
      message: 'Se existir uma conta associada a estes dados, as instruções de redefinição foram enviadas para o contacto registado.'
    };

    if (user) {
      logAudit(user.nuit, 'RECUPERACAO_SENHA', 'Código de recuperação gerado');
      if (!IS_PRODUCTION) {
        response.codigoVerificacaoDemo = 'SRNC-' + Math.floor(1000 + Math.random() * 9000);
      }
    } else {
      logAudit(identifier, 'RECUPERACAO_SENHA_DESCONHECIDO', 'Pedido para identificador inexistente');
    }

    return res.json(response);
  } catch (err) {
    console.error('Erro na recuperação:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro no servidor ao processar recuperação de senha.'
    });
  }
});

// Salvar / Obter configurações de tema
app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT chave, valor FROM configuracoes').all();
    const config = {};
    rows.forEach(r => {
      try {
        config[r.chave] = JSON.parse(r.valor);
      } catch {
        config[r.chave] = r.valor;
      }
    });
    res.json({ success: true, config });
  } catch (err) {
    res.json({ success: true, config: {} });
  }
});

app.post('/api/settings', (req, res) => {
  const { theme, customColor, language, randomColors } = req.body || {};

  if (
    (theme !== undefined && !['default_red', 'dark', 'light'].includes(theme)) ||
    (customColor !== undefined && !(typeof customColor === 'string' && HEX_COLOR_REGEX.test(customColor))) ||
    (language !== undefined && !['pt', 'en'].includes(language)) ||
    (randomColors !== undefined && typeof randomColors !== 'boolean')
  ) {
    return res.status(400).json({ success: false, message: 'Configuração inválida.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO configuracoes (chave, valor, atualizado_em)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_em = CURRENT_TIMESTAMP
    `);

    if (theme !== undefined) stmt.run('theme', JSON.stringify(theme));
    if (customColor !== undefined) stmt.run('customColor', JSON.stringify(customColor));
    if (language !== undefined) stmt.run('language', JSON.stringify(language));
    if (randomColors !== undefined) stmt.run('randomColors', JSON.stringify(randomColors));

    res.json({ success: true, message: 'Configurações guardadas com sucesso!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao guardar configurações.' });
  }
});

// Obter Vagas e Concursos Oficiais
app.get('/api/vagas', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM vagas ORDER BY data_abertura DESC').all();
    const vagas = rows.map(r => ({
      id: r.id,
      codigoEdital: r.codigo_edital,
      titulo: r.titulo,
      carreira: r.carreira,
      regime: r.regime,
      vagas: r.vagas,
      local: r.local,
      dataAbertura: r.data_abertura,
      dataLimite: r.data_limite,
      status: r.status,
      remuneracao: r.remuneracao
    }));
    res.json({ success: true, vagas });
  } catch (err) {
    console.error('Erro ao consultar vagas:', err);
    res.status(500).json({ success: false, message: 'Erro ao consultar vagas.' });
  }
});

// Obter Listas Públicas Publicadas
app.get('/api/listas-publicadas', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM listas_publicadas ORDER BY data_publicacao DESC').all();
    const listas = rows.map(r => ({
      id: r.id,
      edital: r.edital,
      vagaTitulo: r.vaga_titulo,
      tipo: r.tipo,
      tituloLista: r.titulo_lista,
      dataPublicacao: r.data_publicacao,
      totalCandidatos: r.total_candidatos,
      arquivoNome: r.arquivo_nome,
      arquivoTamanho: r.arquivo_tamanho,
      observacoes: r.observacoes
    }));
    res.json({ success: true, listas });
  } catch (err) {
    console.error('Erro ao consultar listas publicadas:', err);
    res.status(500).json({ success: false, message: 'Erro ao consultar listas publicadas.' });
  }
});

// Consultar Candidatura por Código ou BI
app.get('/api/candidaturas/consulta', sensitiveLimiter, (req, res) => {
  const codigo = asTrimmedString(req.query.codigo, 40);
  const bi = asTrimmedString(req.query.bi, 13);
  if (!codigo && !bi) {
    return res.status(400).json({ success: false, message: 'Informe o código da candidatura ou o número do BI.' });
  }
  try {
    let query = 'SELECT * FROM candidaturas WHERE ';
    const params = [];
    if (codigo && bi) {
      query += '(codigo_candidatura = ? OR bi_numero = ?)';
      params.push(codigo.trim(), bi.trim());
    } else if (codigo) {
      query += 'codigo_candidatura = ?';
      params.push(codigo.trim());
    } else {
      query += 'bi_numero = ?';
      params.push(bi.trim());
    }
    const candidatura = db.prepare(query).get(...params);
    if (!candidatura) {
      return res.status(404).json({ success: false, message: 'Nenhuma candidatura encontrada com os dados fornecidos.' });
    }
    res.json({ success: true, candidatura });
  } catch (err) {
    console.error('Erro ao consultar candidatura:', err);
    res.status(500).json({ success: false, message: 'Erro ao consultar candidatura.' });
  }
});

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Recurso não encontrado.' });
});

app.use((err, req, res, next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Pedido demasiado grande.' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Pedido mal formatado.' });
  }
  console.error('Erro não tratado:', err);
  res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
});

purgeExpiredSessions();
setInterval(purgeExpiredSessions, 15 * 60 * 1000).unref();

app.listen(PORT, () => {
  console.log(`[SERNIC Backend] Servidor activo na porta ${PORT} com base de dados SQLite.`);
});
