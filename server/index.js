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

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Hash fictício para igualar o tempo de resposta quando o utilizador não existe
const DUMMY_HASH = bcrypt.hashSync('sernic-timing-equaliser', 10);

app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use(securityHeaders);
app.use(cors(corsOptions()));
app.use(express.json({ limit: '100kb' }));

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

    const { expectedRole } = req.body;
    if (expectedRole === 'gestor' && user.role !== 'admin') {
      logAudit(identifier, 'LOGIN_FALHOU', 'Tentativa de acesso de gestor com perfil de candidato');
      return res.status(403).json({
        success: false,
        message: 'Acesso restrito: Estas credenciais pertencem a um Candidato. Por favor, utilize a opção "ENTRAR COMO CANDIDATO".'
      });
    }

    // Fetch candidaturas (all if admin/gestor, or user-specific if candidate)
    let candidaturas = [];
    if (user.role === 'admin') {
      candidaturas = db.prepare(`
        SELECT * FROM candidaturas ORDER BY data_submissao DESC
      `).all();
    } else {
      candidaturas = db.prepare(`
        SELECT * FROM candidaturas WHERE nuit = ? ORDER BY data_submissao DESC
      `).all(user.nuit);
    }

    logAudit(user.nuit, 'LOGIN_SUCESSO', `Acesso efectuado com perfil ${user.role}`);

    const { password: _, ...userSafe } = user;
    return res.json({
      success: true,
      message: user.role === 'admin' ? `Painel de Gestor activo: Bem-vindo(a), ${user.name}!` : `Bem-vindo(a), ${user.name}!`,
      user: userSafe,
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
  const passwordError = validatePasswordPolicy(password);
  if (passwordError) {
    return res.status(400).json({ success: false, message: passwordError });
  }

  try {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const codigoCandidatura = `SERNIC-2026-${randomNum}`;

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

    const hashedPass = bcrypt.hashSync(password, 10);

    const existingUser = db.prepare('SELECT id FROM users WHERE nuit = ?').get(nuit);
    if (!existingUser) {
      db.prepare(`
        INSERT INTO users (nuit, name, password, email, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(nuit, nomeCompleto, hashedPass, email, 'candidate');
    }

    // Insert candidature
    db.prepare(`
      INSERT INTO candidaturas (
        codigo_candidatura, nuit, nome_completo, email, telefone, carreira, nivel_academico, bi_numero, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      codigoCandidatura,
      nuit,
      nomeCompleto,
      email,
      telefone,
      carreira,
      nivelAcademico || 'Médio / Superior',
      bi || '',
      'Submetida com Sucesso'
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

app.listen(PORT, () => {
  console.log(`[SERNIC Backend] Servidor activo na porta ${PORT} com base de dados SQLite.`);
});
