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
    bi TEXT,
    telefone TEXT,
    provincia TEXT,
    google_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Garantir colunas adicionais para bases de dados já existentes
try { db.exec("ALTER TABLE users ADD COLUMN bi TEXT;"); } catch (_) {}
try { db.exec("ALTER TABLE users ADD COLUMN telefone TEXT;"); } catch (_) {}
try { db.exec("ALTER TABLE users ADD COLUMN provincia TEXT;"); } catch (_) {}
try { db.exec("ALTER TABLE users ADD COLUMN google_verified INTEGER DEFAULT 0;"); } catch (_) {}

db.exec(`
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

  CREATE TABLE IF NOT EXISTS sessoes (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    criada_em INTEGER NOT NULL,
    expira_em INTEGER NOT NULL,
    ultimo_acesso INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessoes_user ON sessoes(user_id);
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
    '123922328',
    'Direcção de Recursos Humanos - SERNIC',
    bcrypt.hashSync('buenaverte7', 10),
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

// Processo completo da candidatura (documentos, deliberação do júri, histórico) em JSON
{
  const colunas = db.prepare('PRAGMA table_info(candidaturas)').all().map(c => c.name);
  if (!colunas.includes('dados_json')) {
    db.exec('ALTER TABLE candidaturas ADD COLUMN dados_json TEXT');
  }
  if (!colunas.includes('atualizado_em')) {
    db.exec('ALTER TABLE candidaturas ADD COLUMN atualizado_em DATETIME');
  }
}

// Migrar senhas legadas guardadas em texto simples para bcrypt (mantém a mesma senha)
{
  const legacy = db.prepare(`SELECT id, password FROM users WHERE password IS NOT NULL AND password NOT LIKE '$2%'`).all()
    .filter(u => u.password !== 'google_oauth_verified');
  if (legacy.length > 0) {
    const update = db.prepare('UPDATE users SET password = ? WHERE id = ?');
    db.transaction(() => {
      for (const u of legacy) update.run(bcrypt.hashSync(u.password, 10), u.id);
    })();
    console.log(`[SQLite] ${legacy.length} senha(s) legada(s) convertida(s) para hash bcrypt.`);
  }
}

// Pre-seed 20 candidaturas oficiais no estado inicial de inscrição caso existam menos de 20
const countCandidaturas = db.prepare('SELECT COUNT(*) as count FROM candidaturas').get();
if (countCandidaturas.count < 20) {
  const insertCandidatura = db.prepare(`
    INSERT OR REPLACE INTO candidaturas (
      codigo_candidatura, nuit, nome_completo, email, telefone, carreira, nivel_academico, bi_numero, status, data_submissao
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const candidatosBase20 = [
    { codigo: 'SERNIC-2026-00001', nome: 'Armando Carlos Mondlane', bi: '110100234567M', nuit: '100234567', tel: '+258 84 123 4567', email: 'armando.mondlane@gmail.com', carreira: 'Investigação Criminal', curso: 'Licenciatura em Direito e Ciências Criminais', dataSub: '2026-10-04 09:30:00' },
    { codigo: 'SERNIC-2026-00002', nome: 'Maria Helena Nhantumbo', bi: '100200345678A', nuit: '100345678', tel: '+258 84 987 6543', email: 'maria.nhantumbo@outlook.com', carreira: 'Inteligência Digital e Cibercrime', curso: 'Licenciatura em Engenharia Informática e Telecomunicações', dataSub: '2026-10-05 14:15:00' },
    { codigo: 'SERNIC-2026-00003', nome: 'Eusébio João Sitoe', bi: '120300456789B', nuit: '100876543', tel: '+258 82 456 7890', email: 'eusebio.sitoe@gmail.com', carreira: 'Investigação Criminal', curso: 'Licenciatura em Direito e Legislação Penal', dataSub: '2026-10-06 11:00:00' },
    { codigo: 'SERNIC-2026-00004', nome: 'Fátima Zaida Abdala', bi: '030400567890C', nuit: '100456789', tel: '+258 86 345 6789', email: 'fatima.abdala@hotmail.com', carreira: 'Criminalística e Ciências Forenses', curso: 'Licenciatura em Química Forense e Balística', dataSub: '2026-10-07 08:45:00' },
    { codigo: 'SERNIC-2026-00005', nome: 'Rogério Américo Chissano', bi: '110500678901D', nuit: '100987654', tel: '+258 87 234 5678', email: 'rogerio.chissano@gmail.com', carreira: 'Investigação Criminal', curso: 'Licenciatura em Ciências Policiais e Investigação Criminal', dataSub: '2026-10-08 10:10:00' },
    { codigo: 'SERNIC-2026-00006', nome: 'Cecília Marta Manjate', bi: '100600789012E', nuit: '100567890', tel: '+258 84 876 5432', email: 'cecilia.manjate@gmail.com', carreira: 'Medicina Legal e Toxicologia Forense', curso: 'Licenciatura em Biologia e Bioquímica Clínica', dataSub: '2026-10-09 13:20:00' },
    { codigo: 'SERNIC-2026-00007', nome: 'Celso Salvador Tembe', bi: '110700890123F', nuit: '100678901', tel: '+258 82 765 4321', email: 'celso.tembe@outlook.com', carreira: 'Investigação Criminal', curso: 'Licenciatura em Direito Público e Processual', dataSub: '2026-10-10 09:15:00' },
    { codigo: 'SERNIC-2026-00008', nome: 'Amina Zainabo Mussa', bi: '040800901234G', nuit: '100789012', tel: '+258 84 654 3210', email: 'amina.mussa@gmail.com', carreira: 'Inteligência Digital e Cibercrime', curso: 'Licenciatura em Tecnologias de Informação e Criptografia', dataSub: '2026-10-11 15:40:00' },
    { codigo: 'SERNIC-2026-00009', nome: 'Nelson Paulo Macamo', bi: '110900012345H', nuit: '100890123', tel: '+258 86 543 2109', email: 'nelson.macamo@yahoo.com', carreira: 'Criminalística e Ciências Forenses', curso: 'Licenciatura em Física Aplicada e Peritagem Balística', dataSub: '2026-10-12 11:25:00' },
    { codigo: 'SERNIC-2026-00010', nome: 'Dulce Esperança Langa', bi: '101000123456I', nuit: '100901234', tel: '+258 87 432 1098', email: 'dulce.langa@gmail.com', carreira: 'Investigação Criminal', curso: 'Licenciatura em Criminologia e Segurança Pública', dataSub: '2026-10-13 10:00:00' },
    { codigo: 'SERNIC-2026-00011', nome: 'Dr. Inácio Bernardo Cossa', bi: '111100234567J', nuit: '100012345', tel: '+258 84 321 0987', email: 'inacio.cossa@med.uem.mz', carreira: 'Medicina Legal e Toxicologia Forense', curso: 'Licenciatura em Medicina Geral e Patologia Forense', dataSub: '2026-10-14 08:30:00' },
    { codigo: 'SERNIC-2026-00012', nome: 'Sónia Patrícia Mabunda', bi: '101200345678K', nuit: '100123456', tel: '+258 82 210 9876', email: 'sonia.mabunda@gmail.com', carreira: 'Investigação Criminal', curso: 'Licenciatura em Direito Forense e Direitos Fundamentais', dataSub: '2026-10-15 12:00:00' },
    { codigo: 'SERNIC-2026-00013', nome: 'Alberto Zacarias Guambe', bi: '111300456789L', nuit: '100234560', tel: '+258 84 109 8765', email: 'alberto.guambe@gmail.com', carreira: 'Investigação Criminal', curso: 'Licenciatura em Sociologia e Investigação Criminal', dataSub: '2026-10-16 14:50:00' },
    { codigo: 'SERNIC-2026-00014', nome: 'Vanessa Beatriz Chauque', bi: '101400567890M', nuit: '100345670', tel: '+258 86 098 7654', email: 'vanessa.chauque@isctem.ac.mz', carreira: 'Inteligência Digital e Cibercrime', curso: 'Licenciatura em Segurança Informática e Computação Forense', dataSub: '2026-10-17 09:40:00' },
    { codigo: 'SERNIC-2026-00015', nome: 'Tomás Gabriel Muthemba', bi: '111500678901N', nuit: '100456780', tel: '+258 87 987 6540', email: 'tomas.muthemba@gmail.com', carreira: 'Investigação Criminal', curso: 'Licenciatura em Administração Pública e Criminologia', dataSub: '2026-10-18 11:10:00' },
    { codigo: 'SERNIC-2026-00016', nome: 'Tânia Celeste Macuácua', bi: '101600789012O', nuit: '100567891', tel: '+258 84 876 5430', email: 'tania.macuacua@gmail.com', carreira: 'Medicina Legal e Toxicologia Forense', curso: 'Licenciatura em Análises Clínicas e Toxicologia Forense', dataSub: '2026-10-19 13:30:00' },
    { codigo: 'SERNIC-2026-00017', nome: 'Hipólito Manuel Mabote', bi: '111700890123P', nuit: '100678902', tel: '+258 82 765 4320', email: 'hipolito.mabote@outlook.com', carreira: 'Criminalística e Ciências Forenses', curso: 'Licenciatura em Ciências Forenses e Identificação Dactiloscópica', dataSub: '2026-10-20 10:45:00' },
    { codigo: 'SERNIC-2026-00018', nome: 'Elsa Carina Chirindza', bi: '101800901234Q', nuit: '100789013', tel: '+258 84 654 3219', email: 'elsa.chirindza@gmail.com', carreira: 'Investigação Criminal', curso: 'Licenciatura em Direito Processual Penal', dataSub: '2026-10-21 09:00:00' },
    { codigo: 'SERNIC-2026-00019', nome: 'Jaime Osvaldo Bila', bi: '111900012345R', nuit: '100890124', tel: '+258 86 543 2108', email: 'jaime.bila@ucm.ac.mz', carreira: 'Investigação Criminal', curso: 'Licenciatura em Direito e Investigação Forense', dataSub: '2026-10-22 14:10:00' },
    { codigo: 'SERNIC-2026-00020', nome: 'Leila Zainab Daúde', bi: '032000123456S', nuit: '100901235', tel: '+258 87 432 1097', email: 'leila.daude@unilurio.ac.mz', carreira: 'Inteligência Digital e Cibercrime', curso: 'Licenciatura em Engenharia Informática e Defesa de Redes', dataSub: '2026-10-23 11:35:00' }
  ];

  db.transaction(() => {
    for (const c of candidatosBase20) {
      insertCandidatura.run(
        c.codigo,
        c.nuit,
        c.nome,
        c.email,
        c.tel,
        c.carreira,
        c.curso,
        c.bi,
        'Em Análise Documental',
        c.dataSub
      );
    }
  })();

  console.log('[SQLite] 20 Candidaturas oficiais de demonstração inseridas na fase inicial (Em Análise Documental).');
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
