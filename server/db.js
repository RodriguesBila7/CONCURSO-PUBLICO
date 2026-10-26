import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'sernic_concurso.sqlite');

const db = new Database(dbPath);

// Enable WAL mode for high performance & reliability
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nuit TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'candidate',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS candidaturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_candidatura TEXT UNIQUE NOT NULL,
    nuit TEXT NOT NULL,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    carreira TEXT NOT NULL,
    nivel_academico TEXT NOT NULL,
    bi_numero TEXT,
    status TEXT DEFAULT 'Submetida',
    data_submissao DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vagas (
    id TEXT PRIMARY KEY,
    codigo_edital TEXT NOT NULL,
    titulo TEXT NOT NULL,
    carreira TEXT NOT NULL,
    regime TEXT NOT NULL,
    vagas INTEGER NOT NULL,
    local TEXT NOT NULL,
    data_abertura TEXT NOT NULL,
    data_limite TEXT NOT NULL,
    status TEXT DEFAULT 'Aberto',
    remuneracao TEXT,
    requisitos_gerais TEXT,
    requisitos_especificos TEXT
  );

  CREATE TABLE IF NOT EXISTS listas_publicadas (
    id TEXT PRIMARY KEY,
    edital TEXT NOT NULL,
    vaga_titulo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    titulo_lista TEXT NOT NULL,
    data_publicacao TEXT NOT NULL,
    total_candidatos INTEGER NOT NULL,
    arquivo_nome TEXT,
    arquivo_tamanho TEXT,
    observacoes TEXT
  );

  CREATE TABLE IF NOT EXISTS configuracoes (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS logs_acesso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nuit TEXT,
    acao TEXT NOT NULL,
    detalhes TEXT,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Pre-seed default test users if empty
const countUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (countUsers.count === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (nuit, name, password, email, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run(
    '100234567',
    'Armando Carlos Mondlane',
    bcrypt.hashSync('sernic2026', 10),
    'armando.carlos@concurso.mz',
    'candidate'
  );

  insertUser.run(
    'candidato',
    'Maria Helena Nhantumbo',
    bcrypt.hashSync('123456', 10),
    'm.nhantumbo@concurso.mz',
    'candidate'
  );

  insertUser.run(
    'admin',
    'Direcção de Recursos Humanos - SERNIC',
    bcrypt.hashSync('admin123', 10),
    'drh@sernic.gov.mz',
    'admin'
  );

  insertUser.run(
    'gestor',
    'Gestor de Recursos Humanos - SERNIC',
    bcrypt.hashSync('admin123', 10),
    'gestor@sernic.gov.mz',
    'admin'
  );

  console.log('[SQLite] Contas predefinidas criadas com sucesso no banco de dados!');
}

// Pre-seed a sample application if empty
const countCandidaturas = db.prepare('SELECT COUNT(*) as count FROM candidaturas').get();
if (countCandidaturas.count === 0) {
  const insertCandidatura = db.prepare(`
    INSERT INTO candidaturas (
      codigo_candidatura, nuit, nome_completo, email, telefone, carreira, nivel_academico, bi_numero, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCandidatura.run(
    'SERNIC-2026-00849',
    '100234567',
    'Armando Carlos Mondlane',
    'armando.carlos@concurso.mz',
    '+258 84 123 4567',
    'Investigador Criminal de 2ª Classe',
    'Licenciatura em Direito / Ciências Policiais',
    '110100234567M',
    'Em Análise Documental'
  );

  insertCandidatura.run(
    'SERNIC-2026-00122',
    '100345678',
    'Maria Helena Nhantumbo',
    'm.nhantumbo@concurso.mz',
    '+258 84 987 6543',
    'Especialista em Cibersegurança e Crimes Cibernéticos',
    'Licenciatura em Engenharia Informática',
    '100200345678A',
    'Em Análise Documental'
  );

  console.log('[SQLite] Candidaturas de demonstração registadas (Em Análise Documental).');
}

// Pre-seed vagas if empty
const countVagas = db.prepare('SELECT COUNT(*) as count FROM vagas').get();
if (countVagas.count === 0) {
  const insertVaga = db.prepare(`
    INSERT INTO vagas (
      id, codigo_edital, titulo, carreira, regime, vagas, local, data_abertura, data_limite, status, remuneracao
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVaga.run(
    'VAG-2026-01',
    'Aviso n.º 01/SERNIC-DG/DRH/2026',
    'Investigador Criminal de 2ª Classe',
    'Investigação Criminal e Instrução Processual',
    'Carreira de Regime Especial - SERNIC',
    120,
    'Nacional (Delegações Provinciais do SERNIC)',
    '2026-10-01',
    '2026-11-30',
    'Aberto',
    'Tabela Salarial Única (TSU) + Subsídio de Risco e Investigação'
  );

  insertVaga.run(
    'VAG-2026-02',
    'Aviso n.º 02/SERNIC-DG/DRH/2026',
    'Perito Forense Balístico e Dactiloscópico',
    'Laboratório Central de Criminalística (Polícia Científica)',
    'Carreira Técnica Superior de Investigação',
    35,
    'Maputo, Beira e Nampula',
    '2026-10-05',
    '2026-12-15',
    'Aberto',
    'TSU compatível com Carreira Especial Forense'
  );

  insertVaga.run(
    'VAG-2026-03',
    'Aviso n.º 03/SERNIC-DG/DRH/2026',
    'Especialista em Cibersegurança e Crimes Cibernéticos',
    'Divisão de Investigação de Cibercrimes e Inteligência Digital',
    'Carreira Técnica Superior Especializada',
    45,
    'Direcção Geral - Maputo',
    '2026-10-10',
    '2026-12-10',
    'Aberto',
    'TSU + Bónus Especial de Peritagem Digital'
  );

  insertVaga.run(
    'VAG-2026-04',
    'Aviso n.º 04/SERNIC-DG/DRH/2026',
    'Técnico Superior de Medicina Legal e Toxicologia Forense',
    'Departamento de Tanatologia e Toxicologia',
    'Carreira Especial da Saúde Forense',
    20,
    'Maputo, Matola, Beira, Nampula e Tete',
    '2026-10-15',
    '2026-11-20',
    'Aberto',
    'TSU Especial Saúde / Investigação Forense'
  );

  insertVaga.run(
    'VAG-2025-08',
    'Aviso n.º 08/SERNIC-DG/DRH/2025',
    'Agente Técnico de Apoio Operacional e Vigilância',
    'Corpo Técnico Operativo',
    'Carreira de Apoio Policial',
    80,
    'Nacional',
    '2025-11-01',
    '2025-12-31',
    'Encerrado',
    'TSU Padrão Nível Médio'
  );

  console.log('[SQLite] Vagas e concursos pré-semeados com sucesso.');
}

// Pre-seed listas_publicadas if empty
const countListas = db.prepare('SELECT COUNT(*) as count FROM listas_publicadas').get();
if (countListas.count === 0) {
  const insertLista = db.prepare(`
    INSERT INTO listas_publicadas (
      id, edital, vaga_titulo, tipo, titulo_lista, data_publicacao, total_candidatos, arquivo_nome, arquivo_tamanho, observacoes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLista.run(
    'LST-01',
    'Aviso n.º 01/SERNIC-DG/DRH/2026',
    'Investigador Criminal de 2ª Classe',
    'Admitidos',
    'Lista Definitiva de Candidatos Admitidos às Provas Escritas de Conhecimentos',
    '2026-10-18',
    342,
    'SERNIC_Admitidos_Investigador_Criminal_2026.pdf',
    '2.4 MB',
    'Os candidatos admitidos devem comparecer munidos de Bilhete de Identidade original e esferográfica azul ou preta.'
  );

  insertLista.run(
    'LST-02',
    'Aviso n.º 01/SERNIC-DG/DRH/2026',
    'Investigador Criminal de 2ª Classe',
    'Convocados',
    'Convocatória para Provas Físicas e Inspecção Médica (Lote 1 - Maputo e Matola)',
    '2026-10-20',
    150,
    'SERNIC_Convocados_Provas_Fisicas_Lote1.pdf',
    '1.8 MB',
    'Local: Campo Desportivo da ACIPOL, Michafutene, às 06:30 horas da manhã.'
  );

  insertLista.run(
    'LST-03',
    'Aviso n.º 02/SERNIC-DG/DRH/2026',
    'Perito Forense Balístico e Dactiloscópico',
    'Admitidos',
    'Lista de Candidatos Qualificados para a Prova Teórico-Prática de Criminalística',
    '2026-10-14',
    85,
    'SERNIC_Qualificados_Perito_Balistico.pdf',
    '1.2 MB',
    'Prova prática a realizar no Laboratório Central de Criminalística, Av. Vladimir Lenine.'
  );

  insertLista.run(
    'LST-04',
    'Aviso Geral n.º 01/SERNIC/2026',
    'Todas as Carreiras',
    'Excluídos',
    'Relação de Candidaturas Não Admitidas com Respetivos Fundamentos Legais',
    '2026-10-12',
    48,
    'SERNIC_Candidatos_Nao_Admitidos_Fundamentos.pdf',
    '1.5 MB',
    'Período de reclamação de 5 dias úteis a contar da data de publicação do presente edital.'
  );

  console.log('[SQLite] Listas publicadas pré-semeadas com sucesso.');
}

export default db;
