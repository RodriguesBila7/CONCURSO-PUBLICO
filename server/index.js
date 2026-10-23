import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
  const sqliteVersion = db.prepare('SELECT sqlite_version() as ver').get();
  res.json({
    status: 'online',
    system: 'SERNIC - Plataforma de Candidaturas',
    nodeVersion: process.version,
    sqliteVersion: sqliteVersion.ver,
    timestamp: new Date().toISOString()
  });
});

// User login endpoint
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;

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
      WHERE nuit = ? OR email = ? OR name = ?
    `).get(identifier.trim(), identifier.trim(), identifier.trim());

    if (!user) {
      logAudit(identifier, 'LOGIN_FALHOU', 'Utilizador não encontrado');
      return res.status(401).json({
        success: false,
        message: 'NUIT / Perfil ou senha incorrectos. Verifique os seus dados.'
      });
    }

    if (user.password !== password) {
      logAudit(identifier, 'LOGIN_FALHOU', 'Senha incorrecta');
      return res.status(401).json({
        success: false,
        message: 'Senha incorrecta. Tente novamente ou recupere a sua senha.'
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

// Solicitar Acesso / Nova Candidatura
app.post('/api/candidaturas/solicitar', (req, res) => {
  const { nuit, nomeCompleto, email, telefone, bi, carreira, nivelAcademico, password } = req.body;

  if (!nuit || !nomeCompleto || !email || !telefone || !carreira) {
    return res.status(400).json({
      success: false,
      message: 'Todos os campos obrigatórios devem ser preenchidos.'
    });
  }

  try {
    // Generate unique candidature protocol code
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const codigoCandidatura = `SERNIC-2026-${randomNum}`;
    const userPass = password || 'sernic2026';

    // Insert or update user
    const existingUser = db.prepare('SELECT id FROM users WHERE nuit = ?').get(nuit);
    if (!existingUser) {
      db.prepare(`
        INSERT INTO users (nuit, name, password, email, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(nuit, nomeCompleto, userPass, email, 'candidate');
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
      message: 'Ocorreu um erro ao submeter a candidatura. ' + err.message
    });
  }
});

// Recuperar senha
app.post('/api/auth/recuperar-senha', (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: 'Informe o NUIT ou o E-mail registado.'
    });
  }

  try {
    const user = db.prepare(`
      SELECT nuit, name, email FROM users WHERE nuit = ? OR email = ?
    `).get(identifier.trim(), identifier.trim());

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Nenhum registo encontrado com o NUIT ou E-mail fornecido.'
      });
    }

    logAudit(user.nuit, 'RECUPERACAO_SENHA', 'Código de recuperação gerado');

    return res.json({
      success: true,
      message: `As instruções de redefinição e o código seguro foram enviados para o contacto associado: ${user.email}.`,
      codigoVerificacaoDemo: 'SRNC-' + Math.floor(1000 + Math.random() * 9000)
    });
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
  const { theme, customColor, language, randomColors } = req.body;
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
    res.status(500).json({ success: false, message: 'Erro ao consultar vagas.', error: err.message });
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
    res.status(500).json({ success: false, message: 'Erro ao consultar listas publicadas.', error: err.message });
  }
});

// Consultar Candidatura por Código ou BI
app.get('/api/candidaturas/consulta', (req, res) => {
  const { codigo, bi } = req.query;
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
    res.status(500).json({ success: false, message: 'Erro ao consultar candidatura.', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[SERNIC Backend] Servidor activo na porta ${PORT} com base de dados SQLite.`);
});
