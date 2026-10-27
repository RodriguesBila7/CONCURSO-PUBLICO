import db from './db.js';

const MAX_PROCESSO_BYTES = 200 * 1024;
const CODIGO_REGEX = /^[A-Z0-9-]{6,40}$/;

const texto = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Campos que só o júri pode definir; removidos quando o processo vem do candidato
const CAMPOS_DO_JURI = ['deliberacaoJuri', 'admitidoPor', 'notas', 'notaFinal', 'classificacao', 'homologado'];

export function validarProcesso(processo) {
  if (!processo || typeof processo !== 'object' || Array.isArray(processo)) {
    return 'Processo de candidatura inválido.';
  }
  const codigo = texto(processo.codigoCandidatura, 40).toUpperCase();
  if (!CODIGO_REGEX.test(codigo)) return 'Código de candidatura inválido.';
  if (!texto(processo.nomeCompleto)) return 'O processo não tem o nome do candidato.';
  if (!texto(processo.nuit, 20)) return 'O processo não tem o NUIT do candidato.';
  if (Buffer.byteLength(JSON.stringify(processo), 'utf8') > MAX_PROCESSO_BYTES) {
    return 'O processo excede o tamanho máximo permitido.';
  }
  return null;
}

export function limparProcessoDoCandidato(processo, estadoInicial) {
  const limpo = { ...processo };
  for (const campo of CAMPOS_DO_JURI) delete limpo[campo];
  limpo.status = estadoInicial;
  limpo.faseAtual = 1;
  return limpo;
}

function colunasDoProcesso(p) {
  return {
    codigo: texto(p.codigoCandidatura, 40).toUpperCase(),
    nuit: texto(p.nuit, 20),
    nome: texto(p.nomeCompleto, 150),
    email: texto(p.email, 120),
    telefone: texto(p.telefone, 30),
    carreira: texto(p.vagaTitulo || p.carreira, 150),
    nivel: texto(p.habilitacoes?.grau || p.nivelAcademico, 80) || 'Não indicado',
    bi: texto(p.biNumero || p.bi, 20).toUpperCase(),
    status: texto(p.status, 80) || 'Em Análise Documental'
  };
}

function linhaParaProcesso(row) {
  if (row.dados_json) {
    try {
      const p = JSON.parse(row.dados_json);
      return { ...p, codigoCandidatura: row.codigo_candidatura, status: row.status };
    } catch {
      // JSON corrompido: usa as colunas
    }
  }
  return {
    codigoCandidatura: row.codigo_candidatura,
    nomeCompleto: row.nome_completo,
    nuit: row.nuit,
    biNumero: row.bi_numero,
    email: row.email,
    telefone: row.telefone,
    vagaTitulo: row.carreira,
    carreira: row.carreira,
    habilitacoes: { grau: row.nivel_academico },
    status: row.status,
    faseAtual: 1,
    dataSubmissao: row.data_submissao ? `${String(row.data_submissao).replace(' ', 'T')}Z` : null,
    origem: 'servidor'
  };
}

export function listarProcessos() {
  return db.prepare('SELECT * FROM candidaturas ORDER BY data_submissao DESC').all().map(linhaParaProcesso);
}

export function obterProcesso(codigo) {
  const row = db.prepare('SELECT * FROM candidaturas WHERE codigo_candidatura = ?').get(codigo);
  return row ? linhaParaProcesso(row) : null;
}

/** Cria ou actualiza o processo; devolve { criado, estadoAnterior, estadoNovo }. */
export function gravarProcesso(processo) {
  const c = colunasDoProcesso(processo);
  const json = JSON.stringify({ ...processo, codigoCandidatura: c.codigo });
  const existente = db.prepare('SELECT status FROM candidaturas WHERE codigo_candidatura = ?').get(c.codigo);

  if (existente) {
    db.prepare(`
      UPDATE candidaturas
      SET nuit = ?, nome_completo = ?, email = ?, telefone = ?, carreira = ?, nivel_academico = ?,
          bi_numero = ?, status = ?, dados_json = ?, atualizado_em = CURRENT_TIMESTAMP
      WHERE codigo_candidatura = ?
    `).run(c.nuit, c.nome, c.email, c.telefone, c.carreira, c.nivel, c.bi, c.status, json, c.codigo);
    return { criado: false, estadoAnterior: existente.status, estadoNovo: c.status };
  }

  db.prepare(`
    INSERT INTO candidaturas (codigo_candidatura, nuit, nome_completo, email, telefone, carreira,
      nivel_academico, bi_numero, status, dados_json, atualizado_em)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(c.codigo, c.nuit, c.nome, c.email, c.telefone, c.carreira, c.nivel, c.bi, c.status, json);
  return { criado: true, estadoAnterior: null, estadoNovo: c.status };
}

export function eliminarProcesso(codigo) {
  const row = db.prepare('SELECT nome_completo, status FROM candidaturas WHERE codigo_candidatura = ?').get(codigo);
  if (!row) return null;
  db.prepare('DELETE FROM candidaturas WHERE codigo_candidatura = ?').run(codigo);
  return row;
}

/** Mantém o JSON coerente quando o estado é alterado pela coluna (painel de Controlo). */
export function sincronizarEstadoNoJson(id, estado) {
  const row = db.prepare('SELECT dados_json FROM candidaturas WHERE id = ?').get(id);
  if (!row?.dados_json) return;
  try {
    const p = JSON.parse(row.dados_json);
    p.status = estado;
    db.prepare('UPDATE candidaturas SET dados_json = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?')
      .run(JSON.stringify(p), id);
  } catch {
    // ignora JSON inválido
  }
}
