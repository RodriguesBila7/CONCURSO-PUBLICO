/**
 * SERNIC - Plataforma de Candidaturas ao Concurso Público
 * Mock Data & API Helpers
 * 
 * 📌 CONEXÃO COM A BASE DE DADOS (SQLite):
 * O frontend tenta primeiro comunicar com a API backend (Node.js/Express + SQLite em /api/...).
 * Caso o servidor backend não esteja a correr, o sistema utiliza automaticamente estes dados mock
 * como salvaguarda (fallback), garantindo que a aplicação funciona perfeitamente em qualquer ambiente.
 * 
 * Endpoints no Backend (server/index.js):
 * - GET    /api/vagas                -> Tabela 'vagas' no SQLite
 * - GET    /api/vagas/:id            -> Detalhes de uma vaga específica
 * - GET    /api/candidaturas/consulta -> Pesquisa por codigo e bi_numero
 * - GET    /api/listas-publicadas    -> Tabela 'listas_publicadas' no SQLite
 * - POST   /api/candidaturas/submeter -> Inserção na tabela 'candidaturas'
 * - POST   /api/auth/candidato/login -> Autenticação contra tabela 'users'
 * - POST   /api/auth/candidato/registro -> Criação de utilizador na tabela 'users'
 */

// Vagas e Concursos Oficiais Abertos (SERNIC)
export const INITIAL_VAGAS = [
  {
    id: 'VAG-2026-01',
    codigoEdital: 'Aviso n.º 01/SERNIC-DG/DRH/2026',
    titulo: 'Investigador Criminal de 2ª Classe',
    carreira: 'Investigação Criminal e Instrução Processual',
    regime: 'Carreira de Regime Especial - SERNIC',
    vagas: 120,
    local: 'Nacional (Delegações Provinciais do SERNIC)',
    dataAbertura: '2026-10-01',
    dataLimite: '2026-11-30',
    status: 'Aberto', // 'Aberto' | 'Encerrado'
    remuneracao: 'Tabela Salarial Única (TSU) + Subsídio de Risco e Investigação',
    requisitosGerais: [
      'Nacionalidade Moçambicana originária;',
      'Idade compreendida entre os 21 e os 35 anos à data de encerramento das candidaturas;',
      'Não ter sido condenado por crime doloso ou sujeito a pena de prisão maior;',
      'Situação militar regularizada;',
      'Idoneidade cívica e moral comprovada por atestado e registo criminal limpo.',
    ],
    requisitosEspecificos: [
      'Licenciatura em Direito, Ciências Policiais, Criminologia, Psicologia Forense ou áreas afins;',
      'Aptidão física e robustez mental atestada por junta médica oficial;',
      'Altura mínima de 1.65m para homens e 1.60m para mulheres;',
      'Disponibilidade para trabalhar em regime de escala e colocação em qualquer província do país.',
    ],
    fasesConcurso: [
      { fase: 1, nome: 'Triagem Documental e Homologação de Candidaturas' },
      { fase: 2, nome: 'Prova Escrita de Conhecimentos Gerais e Específicos' },
      { fase: 3, nome: 'Testes Psicotécnicos e de Personalidade' },
      { fase: 4, nome: 'Inspecção Médica e Provas de Aptidão Física' },
      { fase: 5, nome: 'Inquérito de Investigação Social e Verificação de Antecedentes' },
      { fase: 6, nome: 'Curso de Formação Básica na ACIPOL' }
    ]
  },
  {
    id: 'VAG-2026-02',
    codigoEdital: 'Aviso n.º 02/SERNIC-DG/DRH/2026',
    titulo: 'Perito Forense Balístico e Dactiloscópico',
    carreira: 'Laboratório Central de Criminalística (Polícia Científica)',
    regime: 'Carreira Técnica Superior de Investigação',
    vagas: 35,
    local: 'Maputo (Laboratório Central) e Beira / Nampula (Laboratórios Regionais)',
    dataAbertura: '2026-10-05',
    dataLimite: '2026-12-15',
    status: 'Aberto',
    remuneracao: 'TSU compatível com Carreira Especial Forense',
    requisitosGerais: [
      'Nacionalidade Moçambicana;',
      'Idade máxima de 38 anos;',
      'Sanidade física e mental;',
      'Ausência de antecedentes disciplinares ou criminais.'
    ],
    requisitosEspecificos: [
      'Licenciatura em Física, Química, Engenharia Mecânica, Biologia Forense ou Bioquímica;',
      'Conhecimento prático no manuseamento de microscopia comparativa e reagentes químicos;',
      'Capacidade de elaboração de relatórios e laudos periciais criminais.'
    ],
    fasesConcurso: [
      { fase: 1, nome: 'Validação Curricular' },
      { fase: 2, nome: 'Prova Teórico-Prática de Criminalística' },
      { fase: 3, nome: 'Exames Médicos e Psicotécnicos' },
      { fase: 4, nome: 'Entrevista Técnica de Especialidade' }
    ]
  },
  {
    id: 'VAG-2026-03',
    codigoEdital: 'Aviso n.º 03/SERNIC-DG/DRH/2026',
    titulo: 'Especialista em Cibersegurança e Crimes Cibernéticos',
    carreira: 'Divisão de Investigação de Cibercrimes e Inteligência Digital',
    regime: 'Carreira Técnica Superior Especializada',
    vagas: 45,
    local: 'Direcção Geral - Maputo',
    dataAbertura: '2026-10-10',
    dataLimite: '2026-12-10',
    status: 'Aberto',
    remuneracao: 'TSU + Bónus Especial de Peritagem Digital',
    requisitosGerais: [
      'Nacionalidade Moçambicana;',
      'Idade entre 21 e 40 anos;',
      'Compromisso deontológico com sigilo profissional e protecção de dados.'
    ],
    requisitosEspecificos: [
      'Licenciatura em Engenharia Informática, Ciência da Computação, Segurança de Redes ou Telecomunicações;',
      'Experiência em computação forense (EnCase, Autopsy, Wireshark, extração de dados móveis FTK/Cellebrite);',
      'Certificações na área de cibersegurança (CEH, CompTIA Security+, CHFI) são factor de preferência.'
    ],
    fasesConcurso: [
      { fase: 1, nome: 'Avaliação Documental' },
      { fase: 2, nome: 'Prova Prática em Ambiente de Laboratório Digital' },
      { fase: 3, nome: 'Avaliação Psicológica' },
      { fase: 4, nome: 'Investigação de Segurança e Credenciação' }
    ]
  },
  {
    id: 'VAG-2026-04',
    codigoEdital: 'Aviso n.º 04/SERNIC-DG/DRH/2026',
    titulo: 'Técnico Superior de Medicina Legal e Toxicologia Forense',
    carreira: 'Departamento de Tanatologia e Toxicologia',
    regime: 'Carreira Especial da Saúde Forense',
    vagas: 20,
    local: 'Maputo, Matola, Beira, Nampula e Tete',
    dataAbertura: '2026-10-15',
    dataLimite: '2026-11-20',
    status: 'Aberto',
    remuneracao: 'TSU Especial Saúde / Investigação Forense',
    requisitosGerais: [
      'Nacionalidade Moçambicana;',
      'Registo activo na Ordem dos Médicos ou Conselho Profissional;',
      'Sem registo criminal.'
    ],
    requisitosEspecificos: [
      'Licenciatura em Medicina Geral (com apetência para Medicina Legal) ou Farmácia/Toxicologia;',
      'Disponibilidade para deslocações urgentes em locais de crime e autópsias medico-legais.'
    ],
    fasesConcurso: [
      { fase: 1, nome: 'Análise Curricular' },
      { fase: 2, nome: 'Prova de Conhecimentos Médico-Legais' },
      { fase: 3, nome: 'Entrevista Profissional' }
    ]
  },
  {
    id: 'VAG-2025-08',
    codigoEdital: 'Aviso n.º 08/SERNIC-DG/DRH/2025',
    titulo: 'Agente Técnico de Apoio Operacional e Vigilância',
    carreira: 'Corpo Técnico Operativo',
    regime: 'Carreira de Apoio Policial',
    vagas: 80,
    local: 'Nacional',
    dataAbertura: '2025-11-01',
    dataLimite: '2025-12-31',
    status: 'Encerrado',
    remuneracao: 'TSU Padrão Nível Médio',
    requisitosGerais: [
      'Nacionalidade Moçambicana;',
      '12ª Classe Concluída do SNE;',
      'Idade entre 18 e 30 anos.'
    ],
    requisitosEspecificos: [
      'Robustez física atestada por provas de aptidão física;',
      'Carta de condução válida constitui vantagem.'
    ],
    fasesConcurso: [
      { fase: 1, nome: 'Processo Concluído - Listas Finais Publicadas' }
    ]
  }
];

// Listas Públicas Publicadas (Apurados, Admitidos, Excluídos)
export const INITIAL_LISTAS_PUBLICADAS = [
  {
    id: 'LST-01',
    edital: 'Aviso n.º 01/SERNIC-DG/DRH/2026',
    vagaTitulo: 'Investigador Criminal de 2ª Classe',
    tipo: 'Admitidos',
    tituloLista: 'Lista Definitiva de Candidatos Admitidos às Provas Escritas de Conhecimentos',
    dataPublicacao: '2026-10-18',
    totalCandidatos: 342,
    arquivoNome: 'SERNIC_Admitidos_Investigador_Criminal_2026.pdf',
    arquivoTamanho: '2.4 MB',
    observacoes: 'Os candidatos admitidos devem comparecer munidos de Bilhete de Identidade original e esferográfica azul ou preta.'
  },
  {
    id: 'LST-02',
    edital: 'Aviso n.º 01/SERNIC-DG/DRH/2026',
    vagaTitulo: 'Investigador Criminal de 2ª Classe',
    tipo: 'Convocados',
    tituloLista: 'Convocatória para Provas Físicas e Inspecção Médica (Lote 1 - Maputo e Matola)',
    dataPublicacao: '2026-10-20',
    totalCandidatos: 150,
    arquivoNome: 'SERNIC_Convocados_Provas_Fisicas_Lote1.pdf',
    arquivoTamanho: '1.8 MB',
    observacoes: 'Local: Campo Desportivo da ACIPOL, Michafutene, às 06:30 horas da manhã.'
  },
  {
    id: 'LST-03',
    edital: 'Aviso n.º 02/SERNIC-DG/DRH/2026',
    vagaTitulo: 'Perito Forense Balístico e Dactiloscópico',
    tipo: 'Admitidos',
    tituloLista: 'Lista de Candidatos Qualificados para a Prova Teórico-Prática de Criminalística',
    dataPublicacao: '2026-10-14',
    totalCandidatos: 85,
    arquivoNome: 'SERNIC_Qualificados_Perito_Balistico.pdf',
    arquivoTamanho: '1.2 MB',
    observacoes: 'Prova prática a realizar no Laboratório Central de Criminalística, Av. Vladimir Lenine.'
  },
  {
    id: 'LST-04',
    edital: 'Aviso Geral n.º 01/SERNIC/2026',
    vagaTitulo: 'Todas as Carreiras',
    tipo: 'Excluídos',
    tituloLista: 'Relação de Candidaturas Não Admitidas com Respetivos Fundamentos Legais',
    dataPublicacao: '2026-10-12',
    totalCandidatos: 48,
    arquivoNome: 'SERNIC_Candidatos_Nao_Admitidos_Fundamentos.pdf',
    arquivoTamanho: '1.5 MB',
    observacoes: 'Período de reclamação de 5 dias úteis a contar da data de publicação do presente edital.'
  }
];

// Fotografias Oficiais Tipo Passe com Análise de Rosto e Iluminação (SERNIC VisionAI)
export const CANDIDATO_PHOTOS_MALE = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'
];

export const CANDIDATO_PHOTOS_FEMALE = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80'
];

export function getCandidatePhotoUrl(genero, idx = 0) {
  if (genero === 'Feminino') {
    return CANDIDATO_PHOTOS_FEMALE[idx % CANDIDATO_PHOTOS_FEMALE.length];
  }
  return CANDIDATO_PHOTOS_MALE[idx % CANDIDATO_PHOTOS_MALE.length];
}

export function getDefaultValidacaoFacial(status = 'Em análise') {
  const isExcluido = status === 'Excluído' || status === 'Excluída';
  return {
    status: isExcluido ? 'Requer Revisão' : 'Aprovada',
    scoreBiometrico: isExcluido ? 82 : 98,
    rostoEnquadrado: true,
    iluminacao: isExcluido ? 'Regular (Luz lateral)' : 'Excelente (Luz Difusa Equilibrada)',
    iluminacaoScore: isExcluido ? 84 : 97,
    fundoNeutro: true,
    olhosAbertos: true,
    expressaoNeutra: true,
    resolucaoHd: true,
    dataVerificacao: '2026-10-15T09:30:00Z',
    motorIa: 'SERNIC VisionAI v3.4 (Biometria Facial)'
  };
}

export function detectCandidateGender(candidato) {
  if (!candidato) return 'Masculino';
  
  // 1. Verificação direta pelo campo genero
  if (typeof candidato.genero === 'string') {
    const g = candidato.genero.trim().toLowerCase();
    if (g === 'feminino' || g === 'f' || g === 'mulher') return 'Feminino';
    if (g === 'masculino' || g === 'm' || g === 'homem') return 'Masculino';
  }

  // 2. Inteligência por correspondência de foto no catálogo
  if (candidato.fotoUrl) {
    if (CANDIDATO_PHOTOS_FEMALE.includes(candidato.fotoUrl)) return 'Feminino';
    if (CANDIDATO_PHOTOS_MALE.includes(candidato.fotoUrl)) return 'Masculino';
  }

  // 3. Inteligência onomástica (nomes próprios femininos)
  if (candidato.nomeCompleto) {
    const primeiro = candidato.nomeCompleto.trim().split(' ')[0].toLowerCase();
    const nomesFemininos = [
      'maria', 'helena', 'fatima', 'fátima', 'cecilia', 'cecília', 'graca', 'graça', 
      'amelia', 'amélia', 'ana', 'julia', 'júlia', 'isabel', 'lucia', 'lúcia', 
      'teresa', 'terezinha', 'sonia', 'sónia', 'patricia', 'patrícia', 'marta', 
      'luisa', 'luísa', 'joana', 'beatriz', 'carla', 'alberta', 'esperanca', 'esperança',
      'dulce', 'celeste', 'zaida', 'amina', 'zainabo', 'aida', 'leila', 'rosa', 'ivone',
      'elsa', 'aurora', 'paula', 'vanessa', 'claudia', 'cláudia', 'telma', 'tânia'
    ];
    if (nomesFemininos.includes(primeiro)) return 'Feminino';
    if (primeiro.endsWith('a') && !['juca', 'mussá', 'issa', 'luca', 'sousa', 'baptista'].includes(primeiro)) {
      return 'Feminino';
    }
  }

  return 'Masculino';
}

export function getGenderText(candidato, tipo) {
  const isFem = detectCandidateGender(candidato) === 'Feminino';
  switch (tipo) {
    case 'convocado_titulo':
      return isFem ? 'Convocada para a 2ª Fase: Entrevista Profissional' : 'Convocado para a 2ª Fase: Entrevista Profissional';
    case 'convocado_badge':
      return isFem ? '2ª Fase: Convocada para Entrevista Profissional' : '2ª Fase: Convocado para Entrevista Profissional';
    case 'convocado_timeline':
      return isFem ? 'Convocada' : 'Convocado';
    case 'convocado_mensagem':
      return isFem 
        ? 'Parabéns! A sua candidatura foi aprovada na 1ª Fase de Avaliação Documental. Foi formalmente convocada para a 2ª Fase: Entrevista Profissional perante a Comissão de Júri.'
        : 'Parabéns! A sua candidatura foi aprovada na 1ª Fase de Avaliação Documental. Foi formalmente convocado para a 2ª Fase: Entrevista Profissional perante a Comissão de Júri.';
    case 'admitido_titulo':
      return isFem ? '3ª Fase: Candidata Admitida na Vaga' : '3ª Fase: Candidato Admitido na Vaga';
    case 'admitido_badge':
      return isFem ? '3ª Fase: Admitida - Provimento Efetivo' : '3ª Fase: Admitido - Provimento Efetivo';
    case 'admitido_timeline':
      return isFem ? 'Admitida 🎉' : 'Admitido 🎉';
    case 'admitido_card':
      return isFem ? 'Candidata Admitida com Sucesso!' : 'Candidato Admitido com Sucesso!';
    case 'suplente_titulo':
      return isFem ? '3ª Fase: Aprovada como Suplente (Lista de Reserva)' : '3ª Fase: Aprovado como Suplente (Lista de Reserva)';
    case 'suplente_badge':
      return isFem ? '3ª Fase: Aprovada - Suplente (Lista de Reserva)' : '3ª Fase: Aprovado - Suplente (Lista de Reserva)';
    case 'excluido_titulo':
      return isFem ? 'Candidata Não Aprovada no Concurso' : 'Candidato Não Aprovado no Concurso';
    case 'excluido_badge':
      return isFem ? 'Candidata Excluída do Concurso' : 'Candidato Excluído do Concurso';
    case 'excluido_timeline':
      return isFem ? 'Excluída' : 'Excluído';
    case 'candidato':
      return isFem ? 'Candidata' : 'Candidato';
    default:
      return isFem ? 'Convocada' : 'Convocado';
  }
}

// Candidaturas de Demonstração para Consulta Instantânea e Gestão do Concurso
// Estrutura Oficial SERNIC:
// 1ª Fase: 'Em Análise Documental'
// 2ª Fase: 'Entrevista Profissional' (Aprovado na 1ª fase documental)
// 3ª Fase / Desfecho Final: 'Admitido' | 'Aprovado (Suplente)' | 'Excluído'
export const INITIAL_CANDIDATURAS_CONSULTA = [
  {
    codigoCandidatura: 'SERNIC-2026-00849',
    biNumero: '110100234567M',
    nuit: '100234567',
    nomeCompleto: 'Armando Carlos Mondlane',
    fotoUrl: CANDIDATO_PHOTOS_MALE[0],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Masculino',
    dataNascimento: '1998-05-14',
    idade: 28,
    telefone: '+258 000 000 000',
    email: 'armando.mondlane@gmail.com',
    provincia: 'Maputo Cidade',
    distrito: 'KaMpfumo',
    morada: 'Av. Eduardo Mondlane, Prédio 45, 3º Andar',
    filiacaoPai: 'Carlos Alberto Mondlane',
    filiacaoMae: 'Amélia Rosa Sitoe',
    estadoCivil: 'Solteiro(a)',
    vagaId: 'VAG-2026-01',
    vagaTitulo: 'Investigador Criminal de 2ª Classe',
    carreira: 'Investigação Criminal',
    dataSubmissao: '2026-10-04T09:30:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Direito e Ciências Criminais',
      instituicao: 'Universidade Eduardo Mondlane (UEM)',
      anoConclusao: 2022,
      mediaFinal: '16.5'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.2 MB', data: '2026-10-04' },
      { id: 'doc-cert', tipo: 'Certificado de Habilitações Literárias', status: 'Validado', tamanho: '2.4 MB', data: '2026-10-04' },
      { id: 'doc-crim', tipo: 'Certidão de Registo Criminal', status: 'Validado', tamanho: '850 KB', data: '2026-10-04' },
      { id: 'doc-med', tipo: 'Atestado Médico de Aptidão Física/Mental', status: 'Validado', tamanho: '920 KB', data: '2026-10-04' },
      { id: 'doc-mil', tipo: 'Declaração de Serviço Militar', status: 'Validado', tamanho: '1.1 MB', data: '2026-10-04' },
      { id: 'doc-cv', tipo: 'Curriculum Vitae e Carta de Motivação', status: 'Validado', tamanho: '1.8 MB', data: '2026-10-04' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Comissão de Júri - Maputo Cidade',
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'A sua candidatura foi registada com sucesso e encontra-se na 1ª Fase de Avaliação Documental a aguardar apreciação do Júri.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Processo na fila de triagem documental da comissão de júri.'
    },
    historico: [
      { data: '2026-10-04', etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: '2026-10-04', etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00122',
    biNumero: '100200345678A',
    nuit: '100345678',
    nomeCompleto: 'Maria Helena Nhantumbo',
    fotoUrl: CANDIDATO_PHOTOS_FEMALE[0],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Feminino',
    dataNascimento: '1996-08-22',
    idade: 30,
    telefone: '+258 000 000 000',
    email: 'maria.nhantumbo@outlook.com',
    provincia: 'Sofala',
    distrito: 'Beira',
    morada: 'Bairro do Chaimite, Rua das Acácias, Casa 12',
    filiacaoPai: 'Helena Nhantumbo',
    filiacaoMae: 'Júlia Manuel Cossa',
    estadoCivil: 'Solteiro(a)',
    vagaId: 'VAG-2026-03',
    vagaTitulo: 'Especialista em Cibersegurança e Crimes Cibernéticos',
    carreira: 'Inteligência Digital e Cibercrime',
    dataSubmissao: '2026-10-11T14:15:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Engenharia Informática e Telecomunicações',
      instituicao: 'Universidade Zambeze (UniZambeze)',
      anoConclusao: 2021,
      mediaFinal: '17.2'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.4 MB', data: '2026-10-11' },
      { id: 'doc-cert', tipo: 'Certificado de Habilitações Literárias', status: 'Validado', tamanho: '2.1 MB', data: '2026-10-11' },
      { id: 'doc-crim', tipo: 'Certidão de Registo Criminal', status: 'Validado', tamanho: '780 KB', data: '2026-10-11' },
      { id: 'doc-med', tipo: 'Atestado Médico Oficial', status: 'Validado', tamanho: '890 KB', data: '2026-10-11' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Comissão Provincial de Júri - Sofala (Beira)',
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'A sua candidatura foi registada com sucesso e encontra-se na 1ª Fase de Avaliação Documental a aguardar apreciação do Júri.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Processo na fila de triagem documental da Comissão Provincial de Sofala.'
    },
    historico: [
      { data: '2026-10-11', etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: '2026-10-11', etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00567',
    biNumero: '120300456789B',
    nuit: '100876543',
    nomeCompleto: 'Eusébio João Sitoe',
    fotoUrl: CANDIDATO_PHOTOS_MALE[1],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Masculino',
    dataNascimento: '1995-12-03',
    idade: 31,
    telefone: '+258 000 000 000',
    email: 'eusebio.sitoe@gmail.com',
    provincia: 'Gaza',
    distrito: 'Xai-Xai',
    morada: 'Av. Samora Machel, Quarteirão 8, Casa 14',
    filiacaoPai: 'João Gabriel Sitoe',
    filiacaoMae: 'Marta Afonso Tembe',
    estadoCivil: 'Casado(a)',
    vagaId: 'VAG-2026-02',
    vagaTitulo: 'Perito Forense Balístico e Dactiloscópico',
    carreira: 'Polícia Científica',
    dataSubmissao: '2026-10-08T11:00:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Química Industrial',
      instituicao: 'Universidade Pedagógica de Moçambique (UP)',
      anoConclusao: 2020,
      mediaFinal: '14.0'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.1 MB', data: '2026-10-08' },
      { id: 'doc-cert', tipo: 'Certificado de Habilitações Literárias', status: 'Sob Análise', tamanho: '1.9 MB', data: '2026-10-08', obs: 'Pendente de Certidão de Equivalência do Grau Académico do exterior' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Comissão de Recrutamento do SERNIC - Gaza',
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'A sua candidatura foi registada com sucesso e encontra-se na 1ª Fase de Avaliação Documental a aguardar apreciação do Júri.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Processo na fila de triagem documental da comissão de júri.'
    },
    historico: [
      { data: '2026-10-08', etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: '2026-10-08', etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00990',
    biNumero: '090400567890C',
    nuit: '100555444',
    nomeCompleto: 'Zito Alberto Macuácua',
    fotoUrl: CANDIDATO_PHOTOS_MALE[2],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Masculino',
    dataNascimento: '1997-03-19',
    idade: 29,
    telefone: '+258 000 000 000',
    email: 'zito.macuacua@med.uem.mz',
    provincia: 'Inhambane',
    distrito: 'Maxixe',
    morada: 'Bairro Agostinho Neto, Rua 3, Casa 55',
    filiacaoPai: 'Alberto Macuácua',
    filiacaoMae: 'Constância Fernando',
    estadoCivil: 'Solteiro(a)',
    vagaId: 'VAG-2026-04',
    vagaTitulo: 'Técnico Superior de Medicina Legal e Toxicologia Forense',
    carreira: 'Medicina Legal',
    dataSubmissao: '2026-10-19T16:45:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Medicina Geral',
      instituicao: 'Faculdade de Medicina - UEM',
      anoConclusao: 2023,
      mediaFinal: '15.8'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Sob Análise', tamanho: '1.3 MB', data: '2026-10-19' },
      { id: 'doc-cert', tipo: 'Certificado de Conclusão e Carteira Médica', status: 'Sob Análise', tamanho: '2.5 MB', data: '2026-10-19' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Comissão Provincial de Júri - Inhambane',
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'O seu processo de candidatura encontra-se sob apreciação da comissão de avaliação documental.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'A aguardar conferência de inscrição na Ordem dos Médicos e requisitos do edital.'
    },
    historico: [
      { data: '2026-10-19', etapa: 'Inscrição Submetida', descricao: 'Registo inicial no módulo Inscritos no Concurso.' },
      { data: '2026-10-19', etapa: '1ª Fase: Em Análise Documental', descricao: 'Aguardando validação dos requisitos e diplomas.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00311',
    biNumero: '030200889912D',
    nuit: '100443322',
    nomeCompleto: 'Fátima Abdul Remane',
    fotoUrl: CANDIDATO_PHOTOS_FEMALE[1],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Feminino',
    dataNascimento: '1999-11-05',
    idade: 27,
    telefone: '+258 000 000 000',
    email: 'fatima.remane@yahoo.com',
    provincia: 'Nampula',
    distrito: 'Nampula Cidade',
    morada: 'Av. do Trabalho, Bloco 18, Apt 2B',
    filiacaoPai: 'Abdul Remane Cassimo',
    filiacaoMae: 'Amina Momed',
    estadoCivil: 'Solteiro(a)',
    vagaId: 'VAG-2026-01',
    vagaTitulo: 'Investigador Criminal de 2ª Classe',
    carreira: 'Investigação Criminal',
    dataSubmissao: '2026-10-02T08:15:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Ciências Policiais e Segurança Pública',
      instituicao: 'Academia de Ciências Policiais (ACIPOL)',
      anoConclusao: 2022,
      mediaFinal: '18.2'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.2 MB', data: '2026-10-02' },
      { id: 'doc-cert', tipo: 'Certificado ACIPOL', status: 'Validado', tamanho: '3.1 MB', data: '2026-10-02' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Delegação Provincial do SERNIC - Nampula',
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'A sua candidatura foi registada com sucesso e encontra-se na 1ª Fase de Avaliação Documental a aguardar apreciação do Júri.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Processo na fila de triagem documental da comissão de júri.'
    },
    historico: [
      { data: '2026-10-02', etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: '2026-10-02', etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00445',
    biNumero: '110500112233E',
    nuit: '100667788',
    nomeCompleto: 'Cecília Mário Langa',
    fotoUrl: CANDIDATO_PHOTOS_FEMALE[2],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Feminino',
    dataNascimento: '2000-01-18',
    idade: 26,
    telefone: '+258 000 000 000',
    email: 'cecilia.langa@hotmail.com',
    provincia: 'Maputo Província',
    distrito: 'Matola',
    morada: 'Fomento, Rua da Paz, Casa 89',
    filiacaoPai: 'Mário Langa',
    filiacaoMae: 'Ana Paula Matsinhe',
    estadoCivil: 'Solteiro(a)',
    vagaId: 'VAG-2026-01',
    vagaTitulo: 'Investigador Criminal de 2ª Classe',
    carreira: 'Investigação Criminal',
    dataSubmissao: '2026-10-06T10:20:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Psicologia Forense',
      instituicao: 'Universidade São Tomás de Moçambique',
      anoConclusao: 2023,
      mediaFinal: '16.0'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.0 MB', data: '2026-10-06' },
      { id: 'doc-cert', tipo: 'Certificado de Licenciatura', status: 'Validado', tamanho: '2.0 MB', data: '2026-10-06' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Comissão Provincial de Júri - Maputo Província',
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'A sua candidatura foi registada com sucesso e encontra-se na 1ª Fase de Avaliação Documental a aguardar apreciação do Júri.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Processo na fila de triagem documental da comissão de júri.'
    },
    historico: [
      { data: '2026-10-06', etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: '2026-10-06', etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00678',
    biNumero: '070300998877F',
    nuit: '100998811',
    nomeCompleto: 'Tomás Manuel Chivambo',
    fotoUrl: CANDIDATO_PHOTOS_MALE[3],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Masculino',
    dataNascimento: '1984-04-12',
    idade: 42,
    telefone: '+258 000 000 000',
    email: 'tomas.chivambo@gmail.com',
    provincia: 'Tete',
    distrito: 'Tete Cidade',
    morada: 'Bairro Josina Machel, Rua 5, Casa 3',
    filiacaoPai: 'Manuel Chivambo',
    filiacaoMae: 'Teresa Manhique',
    estadoCivil: 'Casado(a)',
    vagaId: 'VAG-2026-03',
    vagaTitulo: 'Especialista em Cibersegurança e Crimes Cibernéticos',
    carreira: 'Inteligência Digital e Cibercrime',
    dataSubmissao: '2026-10-09T15:40:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Engenharia de Redes e Telecomunicações',
      instituicao: 'Instituto Superior Politécnico de Tete (ISPT)',
      anoConclusao: 2020,
      mediaFinal: '14.5'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.2 MB', data: '2026-10-09' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Comissão Central do Concurso - Tete',
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'A sua candidatura foi registada com sucesso e encontra-se na 1ª Fase de Avaliação Documental a aguardar apreciação do Júri.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Processo na fila de triagem documental da comissão de júri.'
    },
    historico: [
      { data: '2026-10-09', etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: '2026-10-09', etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00812',
    biNumero: '040800334455G',
    nuit: '100778899',
    nomeCompleto: 'Graça Fernando Buque',
    fotoUrl: CANDIDATO_PHOTOS_FEMALE[3],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Feminino',
    dataNascimento: '1997-09-30',
    idade: 29,
    telefone: '+258 000 000 000',
    email: 'graca.buque@gmail.com',
    provincia: 'Zambézia',
    distrito: 'Quelimane',
    morada: 'Av. Marginal, Bairro Aeroporto, Casa 20',
    filiacaoPai: 'Fernando Buque',
    filiacaoMae: 'Isabel Chissano',
    estadoCivil: 'Solteiro(a)',
    vagaId: 'VAG-2026-02',
    vagaTitulo: 'Perito Forense Balístico e Dactiloscópico',
    carreira: 'Polícia Científica',
    dataSubmissao: '2026-10-14T12:00:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Bioquímica e Análises Clínicas',
      instituicao: 'Universidade Licungo',
      anoConclusao: 2021,
      mediaFinal: '15.4'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.3 MB', data: '2026-10-14' },
      { id: 'doc-cert', tipo: 'Certificado de Bioquímica', status: 'Sob Análise', tamanho: '2.2 MB', data: '2026-10-14' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Delegação Provincial da Zambézia (Quelimane)',
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'Processo na 1ª Fase de triagem documental da comissão examinadora.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'A aguardar conclusão da conferência curricular pela banca de peritagem.'
    },
    historico: [
      { data: '2026-10-14', etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: '2026-10-14', etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00234',
    biNumero: '020100778899H',
    nuit: '100112244',
    nomeCompleto: 'Salvador Paulo Mucavele',
    fotoUrl: CANDIDATO_PHOTOS_MALE[4],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Masculino',
    dataNascimento: '1998-07-11',
    idade: 28,
    telefone: '+258 000 000 000',
    email: 'salvador.mucavele@gmail.com',
    provincia: 'Cabo Delgado',
    distrito: 'Pemba',
    morada: 'Bairro Natite, Rua 12, Casa 4',
    filiacaoPai: 'Paulo Mucavele',
    filiacaoMae: 'Filomena Da Costa',
    estadoCivil: 'Solteiro(a)',
    vagaId: 'VAG-2026-04',
    vagaTitulo: 'Técnico Superior de Medicina Legal e Toxicologia Forense',
    carreira: 'Medicina Legal',
    dataSubmissao: '2026-10-05T13:45:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Farmácia e Toxicologia',
      instituicao: 'Universidade Lúrio (UniLúrio)',
      anoConclusao: 2022,
      mediaFinal: '16.8'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.2 MB', data: '2026-10-05' },
      { id: 'doc-cert', tipo: 'Certificado de Farmácia', status: 'Validado', tamanho: '2.3 MB', data: '2026-10-05' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Hospital Provincial de Pemba - Gabinete do Júri',
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'A sua candidatura foi registada com sucesso e encontra-se na 1ª Fase de Avaliação Documental a aguardar apreciação do Júri.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Processo documental conforme. A aguardar deliberação do júri.'
    },
    historico: [
      { data: '2026-10-05', etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: '2026-10-05', etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00789',
    biNumero: '110900445566I',
    nuit: '100334455',
    nomeCompleto: 'Ângela Beatriz Cossa',
    fotoUrl: CANDIDATO_PHOTOS_FEMALE[4],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Feminino',
    dataNascimento: '1999-02-14',
    idade: 27,
    telefone: '+258 000 000 000',
    email: 'angela.cossa@gmail.com',
    provincia: 'Maputo Cidade',
    distrito: 'KaMavota',
    morada: 'Bairro de Albasine, Casa 104',
    filiacaoPai: 'Beatriz Cossa',
    filiacaoMae: 'Leonor Tivane',
    estadoCivil: 'Solteiro(a)',
    vagaId: 'VAG-2026-03',
    vagaTitulo: 'Especialista em Cibersegurança e Crimes Cibernéticos',
    carreira: 'Inteligência Digital e Cibercrime',
    dataSubmissao: '2026-10-03T11:10:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Ciência da Computação e Segurança da Informação',
      instituicao: 'Instituto Superior de Transportes e Comunicações (ISUTC)',
      anoConclusao: 2022,
      mediaFinal: '17.9'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.1 MB', data: '2026-10-03' },
      { id: 'doc-cert', tipo: 'Diploma ISUTC e Certificação CEH', status: 'Validado', tamanho: '3.4 MB', data: '2026-10-03' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Direcção Geral do SERNIC - Maputo',
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'A sua candidatura foi registada com sucesso e encontra-se na 1ª Fase de Avaliação Documental a aguardar apreciação do Júri.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Processo na fila de triagem documental da comissão de júri.'
    },
    historico: [
      { data: '2026-10-03', etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: '2026-10-03', etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00312',
    biNumero: '110500123456K',
    nuit: '100456123',
    nomeCompleto: 'Bernardo Zacarias Chongo',
    fotoUrl: CANDIDATO_PHOTOS_MALE[5],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Masculino',
    dataNascimento: '1994-06-18',
    idade: 32,
    telefone: '+258 000 000 000',
    email: 'bernardo.chongo@gmail.com',
    provincia: 'Direcção Geral',
    distrito: 'Sede Central (Maputo)',
    morada: 'Av. Vladimir Lenine, n.º 1234, Maputo',
    filiacaoPai: 'Zacarias Chongo',
    filiacaoMae: 'Albertina Langa',
    estadoCivil: 'Casado(a)',
    vagaId: 'VAG-2026-01',
    vagaTitulo: 'Investigador Criminal de 2ª Classe',
    carreira: 'Investigação Criminal',
    dataSubmissao: '2026-10-06T08:45:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Direito e Segurança Pública',
      instituicao: 'Universidade Eduardo Mondlane (UEM)',
      anoConclusao: 2021,
      mediaFinal: '16.8'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.2 MB', data: '2026-10-06' },
      { id: 'doc-cert', tipo: 'Certificado de Licenciatura', status: 'Validado', tamanho: '2.0 MB', data: '2026-10-06' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Direcção Geral do SERNIC - Maputo',
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'A sua candidatura foi registada com sucesso e encontra-se na 1ª Fase de Avaliação Documental a aguardar apreciação do Júri.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Processo na fila de triagem documental da comissão de júri.'
    },
    historico: [
      { data: '2026-10-06', etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: '2026-10-06', etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00428',
    biNumero: '060200789012L',
    nuit: '100654321',
    nomeCompleto: 'Graça Inês Machava',
    fotoUrl: CANDIDATO_PHOTOS_FEMALE[5],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Feminino',
    dataNascimento: '1997-11-20',
    idade: 29,
    telefone: '+258 000 000 000',
    email: 'graca.machava@outlook.com',
    provincia: 'Manica',
    distrito: 'Chimoio',
    morada: 'Bairro 25 de Junho, Casa 18, Chimoio',
    filiacaoPai: 'Inácio Machava',
    filiacaoMae: 'Filomena Sitoe',
    estadoCivil: 'Solteiro(a)',
    vagaId: 'VAG-2026-02',
    vagaTitulo: 'Perito Forense Balístico e Dactiloscópico',
    carreira: 'Criminalística e Ciências Forenses',
    dataSubmissao: '2026-10-08T10:20:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Química e Peritagem Forense',
      instituicao: 'Universidade Pedagógica de Moçambique',
      anoConclusao: 2022,
      mediaFinal: '15.4'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.0 MB', data: '2026-10-08' },
      { id: 'doc-cert', tipo: 'Certificado de Habilitações', status: 'Validado', tamanho: '1.8 MB', data: '2026-10-08' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Delegação Provincial do SERNIC de Manica - Chimoio',
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'A sua candidatura foi registada com sucesso e encontra-se na 1ª Fase de Avaliação Documental a aguardar apreciação do Júri.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Processo na fila de triagem documental da comissão de júri.'
    },
    historico: [
      { data: '2026-10-08', etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: '2026-10-08', etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00652',
    biNumero: '090800345678N',
    nuit: '100987654',
    nomeCompleto: 'Aníbal Salvador Muando',
    fotoUrl: CANDIDATO_PHOTOS_MALE[6],
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    genero: 'Masculino',
    dataNascimento: '1996-03-12',
    idade: 30,
    telefone: '+258 000 000 000',
    email: 'anibal.muando@gmail.com',
    provincia: 'Niassa',
    distrito: 'Lichinga',
    morada: 'Bairro Popular, Rua do Aeroporto, Lichinga',
    filiacaoPai: 'Salvador Muando',
    filiacaoMae: 'Joana Nhavene',
    estadoCivil: 'Solteiro(a)',
    vagaId: 'VAG-2026-04',
    vagaTitulo: 'Técnico Superior de Medicina Legal e Toxicologia Forense',
    carreira: 'Medicina Legal e Toxicologia Forense',
    dataSubmissao: '2026-10-12T16:10:00Z',
    status: 'Em Análise Documental',
    faseAtual: 1,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Biologia e Análises Clínicas',
      instituicao: 'Universidade Lúrio (UniLúrio)',
      anoConclusao: 2023,
      mediaFinal: '15.9'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.3 MB', data: '2026-10-12' },
      { id: 'doc-cert', tipo: 'Certificado de Conclusão', status: 'Validado', tamanho: '2.2 MB', data: '2026-10-12' }
    ],
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: 'Delegação Provincial do SERNIC - Lichinga',
      observacoes: 'Aguardando parecer final do júri examinador.',
      mensagemComissao: 'Processo na 1ª Fase de avaliação documental pelo corpo técnico.'
    },
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Em fase de conferência documental pela mesa de júri.'
    },
    historico: [
      { data: '2026-10-12', etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: '2026-10-12', etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  }
];

// 11 Províncias Oficiais de Moçambique (Nascimento, Naturalidade e Residência Geográfica)
export const PROVINCIAS_GEOGRAFICAS = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Cabo Delgado',
  'Niassa'
];

// Províncias e Unidades de Lotação do SERNIC: 12 unidades (Direcção Geral + 11 Províncias)
export const PROVINCIAS_MOCAMBIQUE = [
  'Direcção Geral',
  ...PROVINCIAS_GEOGRAFICAS
];

// Helper para validar NUIT Moçambicano (9 dígitos numéricos)
export function validarNUIT(nuit) {
  const limpo = String(nuit || '').replace(/\D/g, '');
  return limpo.length === 9;
}

// Helper para validar BI Moçambicano (12 dígitos numéricos seguidos de 1 letra, ex: 000000000000M)
export function validarBI(bi) {
  const padrao = /^[0-9]{12}[A-Za-z]$/;
  return padrao.test(String(bi || '').trim());
}

// Helper para validar telefone moçambicano (+258 8X XXX XXXX ou 8X XXX XXXX ou exemplo fictício +258 000 000 000)
export function validarTelefoneMZ(tel) {
  const limpo = String(tel || '').replace(/\D/g, '');
  if (limpo.startsWith('258') && limpo.length === 12) {
    const ddd = limpo.substring(3, 5);
    return ['82', '83', '84', '85', '86', '87', '00'].includes(ddd);
  }
  if (limpo.length === 9) {
    const ddd = limpo.substring(0, 2);
    return ['82', '83', '84', '85', '86', '87', '00'].includes(ddd);
  }
  return false;
}

// Helper para formatar o telefone mantendo o prefixo fixo +258 e padrão +258 000 000 000
export function formatTelefoneMZInput(val) {
  if (val === undefined || val === null) return '+258 000 000 000';
  let str = String(val);
  if (!str.trim()) return '+258 ';

  let raw = str.trim();
  if (raw.startsWith('+258')) {
    raw = raw.slice(4);
  } else if (raw.startsWith('258')) {
    raw = raw.slice(3);
  } else if (raw.startsWith('+')) {
    raw = raw.slice(1);
  }

  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (!digits) {
    return '+258 ';
  }
  if (digits.length <= 3) {
    return `+258 ${digits}`;
  }
  if (digits.length <= 6) {
    return `+258 ${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  return `+258 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
}

// Avaliador de Segurança da Palavra-passe: Baixo (não aceita), Médio / Normal (aceita), Forte (aceita)
export function evaluatePasswordStrength(password) {
  const pwd = String(password || '');
  if (!pwd) {
    return {
      level: 'Vazia',
      label: 'Insira a palavra-passe',
      color: '#94a3b8',
      percent: 0,
      isValid: false,
      feedback: 'A senha deve atingir pelo menos o nível Médio / Normal para ser aceite.'
    };
  }

  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 8) score += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

  if (score <= 2 || pwd.length < 6) {
    return {
      level: 'Baixo',
      label: 'Nível: Baixo (Não aceite)',
      color: '#ef4444',
      percent: 33,
      isValid: false,
      feedback: 'Fraca / Básica. Misture letras maiúsculas, números ou símbolos para atingir o nível Médio.'
    };
  } else if (score === 3 || score === 4) {
    return {
      level: 'Normal',
      label: 'Nível: Médio / Normal (Aceite)',
      color: '#f59e0b',
      percent: 66,
      isValid: true,
      feedback: 'Segurança adequada e aceite para o registo no sistema.'
    };
  } else {
    return {
      level: 'Forte',
      label: 'Nível: Forte (Excelente)',
      color: '#16a34a',
      percent: 100,
      isValid: true,
      feedback: 'Excelente protecção de segurança recomendada.'
    };
  }
}

// ========================================================
// PERSISTÊNCIA EM LOCALSTORAGE & HELPERS DE CONEXÃO
// ========================================================

const STORAGE_KEY_CANDIDATURAS = 'sernic_concurso_candidaturas_v8';
const STORAGE_KEY_LISTAS = 'sernic_concurso_listas_v2';
const STORAGE_KEY_AUDITORIA = 'sernic_concurso_auditoria_v2';
const STORAGE_KEY_VAGAS = 'sernic_concurso_vagas_v2';

// ========================================================
// CRUD DE VAGAS / CONCURSOS OFICIAIS
// ========================================================

export function getStoredVagas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VAGAS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Erro ao ler vagas do localStorage', e);
  }
  try {
    localStorage.setItem(STORAGE_KEY_VAGAS, JSON.stringify(INITIAL_VAGAS));
  } catch {}
  return INITIAL_VAGAS;
}

export function saveStoredVagas(list) {
  try {
    localStorage.setItem(STORAGE_KEY_VAGAS, JSON.stringify(list));
    // Dispara evento para sincronização instantânea entre abas e módulos
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sernic-vagas-updated', { detail: list }));
    }
  } catch (e) {
    console.warn('Erro ao salvar vagas no localStorage', e);
  }
  return list;
}

export function createStoredVaga(vagaData, operador = 'Direcção de Recursos Humanos - SERNIC') {
  const list = getStoredVagas();
  const year = new Date().getFullYear();
  const nextNum = list.length + 1;
  const newId = vagaData.id || `VAG-${year}-${String(nextNum).padStart(2, '0')}`;
  
  const novaVaga = {
    id: newId,
    codigoEdital: vagaData.codigoEdital || `Aviso n.º 0${nextNum}/SERNIC-DG/DRH/${year}`,
    titulo: vagaData.titulo || 'Nova Carreira SERNIC',
    carreira: vagaData.carreira || 'Investigação Criminal e Instrução Processual',
    regime: vagaData.regime || 'Carreira de Regime Especial - SERNIC',
    vagas: Number(vagaData.vagas) || 10,
    local: vagaData.local || 'Nacional',
    dataAbertura: vagaData.dataAbertura || new Date().toISOString().split('T')[0],
    dataLimite: vagaData.dataLimite || '2026-12-31',
    status: vagaData.status || 'Aberto',
    remuneracao: vagaData.remuneracao || 'Tabela Salarial Única (TSU) + Subsídio de Risco',
    requisitosGerais: Array.isArray(vagaData.requisitosGerais) ? vagaData.requisitosGerais : [
      'Nacionalidade Moçambicana originária;',
      'Idade entre 21 e 35 anos;',
      'Registo criminal limpo e idoneidade moral comprovada.'
    ],
    requisitosEspecificos: Array.isArray(vagaData.requisitosEspecificos) ? vagaData.requisitosEspecificos : [
      'Licenciatura ou formação específica na área correspondente;',
      'Robustez física e psicológica comprovada por junta médica.'
    ],
    fasesConcurso: Array.isArray(vagaData.fasesConcurso) && vagaData.fasesConcurso.length > 0 ? vagaData.fasesConcurso : [
      { fase: 1, nome: 'Triagem Documental e Homologação' },
      { fase: 2, nome: 'Prova Escrita de Conhecimentos' },
      { fase: 3, nome: 'Exames Médicos e Psicotécnicos' },
      { fase: 4, nome: 'Curso de Formação Básica Oficial' }
    ]
  };

  const updatedList = [novaVaga, ...list];
  saveStoredVagas(updatedList);

  addStoredAuditoria({
    acao: 'Abertura de Novo Concurso / Vaga',
    candidato: `${novaVaga.titulo} (${novaVaga.codigoEdital})`,
    estadoAnterior: 'Inexistente',
    novoEstado: novaVaga.status,
    motivo: `Criação de concurso com quota de ${novaVaga.vagas} vagas para ${novaVaga.local}`,
    operador: operador
  });

  return novaVaga;
}

export function updateStoredVaga(id, updates, operador = 'Direcção de Recursos Humanos - SERNIC') {
  const list = getStoredVagas();
  const index = list.findIndex(v => v.id === id);
  if (index === -1) return null;

  const current = list[index];
  const updatedVaga = {
    ...current,
    ...updates,
    vagas: updates.vagas !== undefined ? Number(updates.vagas) : current.vagas
  };

  list[index] = updatedVaga;
  saveStoredVagas(list);

  addStoredAuditoria({
    acao: 'Atualização de Concurso / Edital',
    candidato: `${updatedVaga.titulo} (${updatedVaga.codigoEdital})`,
    estadoAnterior: current.status,
    novoEstado: updatedVaga.status,
    motivo: updates.motivoAudit || `Atualização de parâmetros e requisitos da carreira (${updatedVaga.vagas} vagas)`,
    operador: operador
  });

  return updatedVaga;
}

export function deleteStoredVaga(id, operador = 'Direcção de Recursos Humanos - SERNIC') {
  const list = getStoredVagas();
  const target = list.find(v => v.id === id);
  if (!target) return false;

  const updatedList = list.filter(v => v.id !== id);
  saveStoredVagas(updatedList);

  addStoredAuditoria({
    acao: 'Revogação / Exclusão de Concurso',
    candidato: `${target.titulo} (${target.codigoEdital})`,
    estadoAnterior: target.status,
    novoEstado: 'Revogado / Excluído',
    motivo: `Cancelamento ou remoção do edital do catálogo público`,
    operador: operador
  });

  return true;
}

/**
 * Garante unicidade estrita de cada candidato no concurso público.
 * Cada candidato é único: elimina quaisquer repetições ou duplicações por Bilhete de Identidade (BI), NUIT ou Código de Candidatura.
 */
export function deduplicateCandidaturas(list) {
  if (!Array.isArray(list)) return [];
  const seenBi = new Set();
  const seenNuit = new Set();
  const seenCodigo = new Set();
  const uniqueList = [];

  for (const c of list) {
    if (!c) continue;
    
    // Normalização das chaves únicas do cidadão moçambicano
    const bi = c.biNumero ? String(c.biNumero).trim().toUpperCase() : null;
    const nuit = c.nuit ? String(c.nuit).trim() : null;
    const codigo = c.codigoCandidatura ? String(c.codigoCandidatura).trim().toUpperCase() : null;

    // Se já foi registado por BI, NUIT ou Código, é uma repetição/duplicado -> ignora
    if (bi && seenBi.has(bi)) continue;
    if (nuit && seenNuit.has(nuit)) continue;
    if (codigo && seenCodigo.has(codigo)) continue;

    if (bi) seenBi.add(bi);
    if (nuit) seenNuit.add(nuit);
    if (codigo) seenCodigo.add(codigo);

    uniqueList.push(c);
  }

  return uniqueList;
}

/**
 * Retorna o número de candidato sequencial (00001 assim em diante)
 * de acordo com a ordem de submissão do concurso.
 */
export function getCandidateSeqNumber(candidato, allCandidatos = null) {
  if (!candidato) return '00001';
  if (candidato.numeroCandidato) {
    const num = parseInt(candidato.numeroCandidato, 10);
    if (!isNaN(num) && num > 0) return String(num).padStart(5, '0');
  }
  const list = allCandidatos || getStoredCandidaturas();
  const index = list.findIndex(c => 
    (c.codigoCandidatura && candidato.codigoCandidatura && c.codigoCandidatura === candidato.codigoCandidatura) ||
    (c.biNumero && candidato.biNumero && c.biNumero.trim().toUpperCase() === candidato.biNumero.trim().toUpperCase()) ||
    (c.nuit && candidato.nuit && c.nuit.trim() === candidato.nuit.trim())
  );
  const seq = index >= 0 ? index + 1 : list.length + 1;
  return String(seq).padStart(5, '0');
}

export function getStoredCandidaturas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CANDIDATURAS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Aplica deduplicação estrita de imediato para eliminar quaisquer repetições
        const uniqueParsed = deduplicateCandidaturas(parsed);
        let hasChanges = uniqueParsed.length !== parsed.length;

        const normalized = uniqueParsed.map((c, i) => {
          let updated = { ...c };
          const isFem = detectCandidateGender(c) === 'Feminino';

          // Assegura número sequencial 00001 em diante
          if (!updated.numeroCandidato) {
            hasChanges = true;
            updated.numeroCandidato = String(i + 1).padStart(5, '0');
          }

          if (!updated.fotoUrl || !updated.validacaoFacial) {
            hasChanges = true;
            const fallback = INITIAL_CANDIDATURAS_CONSULTA.find(x => x.codigoCandidatura === c.codigoCandidatura) || INITIAL_CANDIDATURAS_CONSULTA[i % INITIAL_CANDIDATURAS_CONSULTA.length];
            updated.fotoUrl = updated.fotoUrl || fallback?.fotoUrl || getCandidatePhotoUrl(updated.genero, i);
            updated.validacaoFacial = updated.validacaoFacial || fallback?.validacaoFacial || getDefaultValidacaoFacial(updated.status);
          }

          // Garantir que candidatos admitidos contêm o perfil do homologador
          if (
            (updated.status?.includes('Admitid') || updated.status === 'Entrevista Profissional' || updated.status?.includes('Suplente')) &&
            !updated.admitidoPor
          ) {
            hasChanges = true;
            updated.admitidoPor = {
              nome: 'Dr. Alberto Chissano',
              cargo: 'Presidente do Júri de Seleção',
              perfil: 'Gestor Autorizado DRH / SERNIC',
              despacho: `DSP-HOM-SERNIC-2026/${updated.numeroCandidato || '00001'}`,
              dataHomologacao: '20/10/2026 às 14:30',
              timestamp: '2026-10-20T12:30:00Z'
            };
          }

          // Normalizar títulos e mensagens para remover Convocado(a) e aplicar gênero inteligente
          if (updated.detalhesFase?.titulo?.includes('Convocado(a)') || updated.detalhesFase?.mensagemComissao?.includes('convocado(a)')) {
            hasChanges = true;
            updated.detalhesFase = {
              ...updated.detalhesFase,
              titulo: isFem ? 'Convocada para 2ª Fase: Entrevista Profissional' : 'Convocado para 2ª Fase: Entrevista Profissional',
              mensagemComissao: isFem
                ? 'Parabéns! A sua candidatura foi aprovada na 1ª Fase de Avaliação Documental. Foi formalmente convocada para a 2ª Fase: Entrevista Profissional perante a Comissão de Júri.'
                : 'Parabéns! A sua candidatura foi aprovada na 1ª Fase de Avaliação Documental. Foi formalmente convocado para a 2ª Fase: Entrevista Profissional perante a Comissão de Júri.'
            };
          }
          return updated;
        });

        if (hasChanges) {
          saveStoredCandidaturas(normalized);
        }
        return normalized;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler candidaturas do localStorage', e);
  }
  // Inicializa com as candidaturas padrão com unicidade garantida e número sequencial
  const deduplicatedInitial = deduplicateCandidaturas(INITIAL_CANDIDATURAS_CONSULTA).map((c, i) => ({
    ...c,
    numeroCandidato: String(i + 1).padStart(5, '0')
  }));
  try {
    localStorage.setItem(STORAGE_KEY_CANDIDATURAS, JSON.stringify(deduplicatedInitial));
  } catch {}
  return deduplicatedInitial;
}

export function saveStoredCandidaturas(list) {
  try {
    // Garante que cada candidato é estritamente único antes de persistir
    const uniqueList = deduplicateCandidaturas(list);
    localStorage.setItem(STORAGE_KEY_CANDIDATURAS, JSON.stringify(uniqueList));
    // Dispara evento para sincronização instantânea entre abas e módulos
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sernic-candidaturas-updated', { detail: uniqueList }));
    }
    return uniqueList;
  } catch (e) {
    console.warn('Erro ao salvar candidaturas no localStorage', e);
  }
  return list;
}

/**
 * Repõe todas as candidaturas no estado inicial (1ª Fase: Em Análise Documental),
 * sem qualquer intervenção ou deliberação do júri, para permitir testar todo o processo de novo.
 */
export function resetStoredCandidaturasParaInicio() {
  const freshList = INITIAL_CANDIDATURAS_CONSULTA.map((c, i) => ({
    ...c,
    numeroCandidato: String(i + 1).padStart(5, '0'),
    status: 'Em Análise Documental',
    faseAtual: 1,
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Processo na fila de triagem documental da comissão de júri.'
    },
    admitidoPor: null,
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: `Comissão Provincial de Júri - ${c.provincia}`,
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'A sua candidatura foi registada com sucesso e encontra-se na 1ª Fase de Avaliação Documental a aguardar apreciação do Júri.'
    },
    historico: [
      { data: c.dataSubmissao.split('T')[0], etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
      { data: c.dataSubmissao.split('T')[0], etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
    ]
  }));

  try {
    localStorage.removeItem('sernic_homologacao_desbloqueada');
  } catch {}

  saveStoredCandidaturas(freshList);
  return freshList;
}

/**
 * Repõe individualmente um candidato no estado inicial (1ª Fase: Em Análise Documental),
 * limpando notas, histórico de deliberações e perfil de admissão para reavaliação do zero.
 */
export function resetStoredCandidaturaIndividual(codigo, operador = 'Comissão de Júri SERNIC') {
  const list = getStoredCandidaturas();
  const index = list.findIndex(c => c.codigoCandidatura === codigo);
  if (index === -1) return null;

  const current = list[index];
  const operadorNome = typeof operador === 'object' ? (operador.name || 'Presidente do Júri') : operador;

  const resetCandidate = {
    ...current,
    status: 'Em Análise Documental',
    faseAtual: 1,
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),
    deliberacaoJuri: {
      decisao: 'Em Análise Documental',
      dataDeliberacao: null,
      operador: null,
      notaFinal: null,
      motivoExclusao: null,
      parecer: 'Processo na fila de triagem documental da comissão de júri.'
    },
    admitidoPor: null,
    detalhesFase: {
      titulo: '1ª Fase: Avaliação Documental em Curso',
      dataEvento: 'Conforme calendário oficial do Edital',
      local: `Comissão Provincial de Júri - ${current.provincia || 'Maputo'}`,
      observacoes: 'A aguardar validação dos requisitos e certidões pelo júri examinador.',
      mensagemComissao: 'A sua candidatura foi registada com sucesso e encontra-se na 1ª Fase de Avaliação Documental a aguardar apreciação do Júri.'
    },
    historico: [
      ...(current.historico?.slice(0, 2) || [
        { data: (current.dataSubmissao || new Date().toISOString()).split('T')[0], etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
        { data: (current.dataSubmissao || new Date().toISOString()).split('T')[0], etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
      ]),
      {
        data: new Date().toISOString().split('T')[0],
        etapa: 'Reposição de Candidatura',
        descricao: `Candidatura reposta para a 1ª Fase (Em Análise Documental) por ${operadorNome}. Todas as avaliações foram reiniciadas.`
      }
    ]
  };

  list[index] = resetCandidate;
  saveStoredCandidaturas(list);

  addStoredAuditoria({
    acao: 'Reposição Individual de Candidatura',
    candidato: `${current.nomeCompleto} (${current.codigoCandidatura})`,
    estadoAnterior: current.status,
    novoEstado: 'Em Análise Documental (1ª Fase)',
    motivo: 'Reposição individual solicitada pelo gestor para nova apreciação do candidato',
    operador: operadorNome
  });

  return resetCandidate;
}

export function updateStoredCandidatura(codigo, updates, operador = 'Comissão de Júri SERNIC') {
  const list = getStoredCandidaturas();
  const index = list.findIndex(c => c.codigoCandidatura === codigo);
  if (index === -1) return null;

  const current = list[index];
  const nowStr = new Date().toISOString();
  const dateFormatted = new Date().toISOString().split('T')[0];

  const operadorNome = typeof operador === 'object' ? (operador.name || 'Presidente do Júri') : operador;
  const operadorCargo = typeof operador === 'object' ? (operador.cargo || 'Presidente do Júri de Seleção') : 'Presidente do Júri de Seleção';
  const operadorPerfil = typeof operador === 'object' ? (operador.perfil || operador.role || 'Gestor Autorizado DRH / SERNIC') : 'Gestor Autorizado DRH / SERNIC';

  // Novo histórico
  const novoHistorico = [...(current.historico || [])];
  let novaEtapa = 'Decisão da Avaliação';
  let descEtapa = `Estado atualizado para: ${updates.status || current.status}.`;
  let novaFaseAtual = current.faseAtual || 1;

  const isFem = detectCandidateGender(current) === 'Feminino';

  if (updates.status === 'Entrevista Profissional' || updates.status === 'Convocada para provas' || updates.status === 'Admitido na Análise Documental' || updates.status === 'Admitida na Análise Documental') {
    novaEtapa = isFem ? '1ª Fase: Admitida na Análise Documental (Convocada)' : '1ª Fase: Admitido na Análise Documental (Convocado)';
    descEtapa = updates.parecer || (updates.eventoLocal ? `Admitido na análise. Entrevista agendada em ${updates.eventoLocal} para ${updates.eventoData || 'data a definir'}.` : (isFem ? 'Documentos aprovados. Convocada para a Entrevista Profissional.' : 'Documentos aprovados. Convocado para a Entrevista Profissional.'));
    novaFaseAtual = 2;
  } else if (updates.status === 'Admitido' || updates.status === 'Admitida' || updates.status === 'Aprovada') {
    novaEtapa = isFem ? '3ª Fase: Candidata Admitida (Vaga Efetiva)' : '3ª Fase: Candidato Admitido (Vaga Efetiva)';
    descEtapa = `Aprovado na Entrevista com nota de ${updates.notaFinal || '18.0'} valores. Selecionado para provimento efetivo da vaga.`;
    novaFaseAtual = 3;
  } else if (updates.status === 'Aprovado (Suplente)' || updates.status === 'Aprovada (Suplente)') {
    novaEtapa = isFem ? '3ª Fase: Aprovada como Suplente (Reserva)' : '3ª Fase: Aprovado como Suplente (Reserva)';
    descEtapa = `Aprovado na Entrevista com nota de ${updates.notaFinal || '14.0'} valores. Integrado na lista de reserva / suplente.`;
    novaFaseAtual = 3;
  } else if (updates.status === 'Excluído na Análise Documental' || updates.status === 'Excluída na Análise Documental') {
    novaEtapa = isFem ? '1ª Fase: Excluída na Análise Documental' : '1ª Fase: Excluído na Análise Documental';
    descEtapa = updates.motivoExclusao || updates.parecer || 'Exclusão por falta de documentos ou inconformidade regulamentar.';
    novaFaseAtual = 1;
  } else if (updates.status === 'Excluído na Entrevista' || updates.status === 'Excluída na Entrevista') {
    novaEtapa = isFem ? '2ª Fase: Excluída na Entrevista Profissional' : '2ª Fase: Excluído na Entrevista Profissional';
    descEtapa = updates.motivoExclusao || `Reprovado com nota de ${updates.notaFinal || '8.0'} valores (inferior ao mínimo exigido de 10.0 valores).`;
    novaFaseAtual = 2;
  } else if (updates.status === 'Excluído' || updates.status === 'Excluída') {
    novaEtapa = isFem ? 'Candidata Excluída' : 'Candidatura Excluída';
    descEtapa = updates.motivoExclusao || updates.parecer || 'Não cumpre os requisitos do concurso.';
    novaFaseAtual = current.faseAtual === 2 ? 2 : 1;
  } else if (updates.status === 'Em Análise Documental' || updates.status === 'Em análise') {
    novaEtapa = '1ª Fase: Análise de Documentos';
    descEtapa = 'Documentos a serem verificados.';
    novaFaseAtual = 1;
  }

  novoHistorico.push({
    data: dateFormatted,
    etapa: novaEtapa,
    descricao: descEtapa
  });

  const finalStatus = updates.status || current.status;

  // Gestão do Perfil do Homologador Oficial (admitidoPor)
  const isAdmissao = (
    finalStatus.includes('Admitid') ||
    finalStatus === 'Entrevista Profissional' ||
    finalStatus.includes('Suplente')
  );

  let admitidoPorInfo = current.admitidoPor || null;
  if (isAdmissao) {
    admitidoPorInfo = updates.admitidoPor || {
      nome: operadorNome,
      cargo: operadorCargo,
      perfil: operadorPerfil,
      despacho: `DSP-HOM-SERNIC-2026/${current.numeroCandidato || '00001'}`,
      dataHomologacao: new Date().toLocaleDateString('pt-MZ') + ' às ' + new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
      timestamp: nowStr
    };
  } else if (finalStatus.includes('Excluíd') || finalStatus === 'Em Análise Documental') {
    admitidoPorInfo = null;
  }

  const updatedCandidate = {
    ...current,
    ...updates,
    status: finalStatus,
    faseAtual: novaFaseAtual,
    historico: novoHistorico,
    admitidoPor: admitidoPorInfo,
    deliberacaoJuri: {
      decisao: finalStatus,
      dataDeliberacao: nowStr,
      operador: operadorNome,
      motivoExclusao: updates.motivoExclusao || null,
      notaFinal: updates.notaFinal || null,
      parecer: updates.parecer || current.deliberacaoJuri?.parecer || ''
    },
    detalhesFase: {
      ...current.detalhesFase,
      titulo: (finalStatus === 'Admitido na Análise Documental' || finalStatus === 'Admitida na Análise Documental' || finalStatus === 'Entrevista Profissional')
        ? (isFem ? '1ª Fase: Admitida na Análise Documental (Convocada p/ Entrevista)' : '1ª Fase: Admitido na Análise Documental (Convocado p/ Entrevista)')
        : finalStatus === 'Admitido' || finalStatus === 'Admitida'
        ? (isFem ? '3ª Fase: Candidata Admitida na Vaga' : '3ª Fase: Candidato Admitido na Vaga')
        : finalStatus === 'Aprovado (Suplente)' || finalStatus === 'Aprovada (Suplente)'
        ? (isFem ? '3ª Fase: Aprovada como Suplente (Lista de Reserva)' : '3ª Fase: Aprovado como Suplente (Lista de Reserva)')
        : finalStatus === 'Excluído na Análise Documental' || finalStatus === 'Excluída na Análise Documental'
        ? (isFem ? '1ª Fase: Excluída na Análise Documental' : '1ª Fase: Excluído na Análise Documental')
        : finalStatus === 'Excluído na Entrevista' || finalStatus === 'Excluída na Entrevista'
        ? (isFem ? '2ª Fase: Excluída na Entrevista Profissional (< 10 val)' : '2ª Fase: Excluído na Entrevista Profissional (< 10 val)')
        : finalStatus === 'Excluído' || finalStatus === 'Excluída'
        ? (isFem ? 'Candidata Não Aprovada no Concurso' : 'Candidato Não Aprovado no Concurso')
        : '1ª Fase: Análise de Documentos em Curso',
      dataEvento: updates.eventoData || current.detalhesFase?.dataEvento || 'Conforme Edital Publicado',
      local: updates.eventoLocal || current.detalhesFase?.local || 'Instalações do SERNIC',
      observacoes: updates.observacoes || current.detalhesFase?.observacoes || '',
      motivoExclusao: updates.motivoExclusao || current.detalhesFase?.motivoExclusao || null,
      mensagemComissao: updates.parecer || (
        (finalStatus === 'Entrevista Profissional' || finalStatus === 'Admitido na Análise Documental' || finalStatus === 'Admitida na Análise Documental')
          ? (isFem 
              ? 'Parabéns! A sua candidatura foi ADMITIDA na 1ª Fase de Avaliação Documental. Foi formalmente convocada para a 2ª Fase: Entrevista Profissional perante a Comissão de Júri no local e data indicados.' 
              : 'Parabéns! A sua candidatura foi ADMITIDA na 1ª Fase de Avaliação Documental. Foi formalmente convocado para a 2ª Fase: Entrevista Profissional perante a Comissão de Júri no local e data indicados.')
          : current.detalhesFase?.mensagemComissao || ''
      )
    }
  };

  list[index] = updatedCandidate;
  saveStoredCandidaturas(list);

  // Registar na auditoria
  addStoredAuditoria({
    acao: 'Avaliação de Candidato',
    candidato: `${current.nomeCompleto} (${current.codigoCandidatura})`,
    estadoAnterior: current.status,
    novoEstado: finalStatus,
    motivo: updates.motivoExclusao || updates.parecer || `Decisão gravada (${finalStatus})`,
    operador: operadorNome
  });

  return updatedCandidate;
}

export function deleteStoredCandidatura(codigo, operador = 'Comissão de Júri SERNIC') {
  const list = getStoredCandidaturas();
  const target = list.find(c => c.codigoCandidatura === codigo);
  if (!target) return false;

  const updatedList = list.filter(c => c.codigoCandidatura !== codigo);
  saveStoredCandidaturas(updatedList);

  addStoredAuditoria({
    acao: 'Remoção de Inscrição / Candidatura',
    candidato: `${target.nomeCompleto} (${codigo})`,
    estadoAnterior: target.status,
    novoEstado: 'Registo Eliminado',
    motivo: 'Eliminação administrativa de registo por decisão do júri',
    operador: operador
  });

  return true;
}

export function getStoredListasPublicadas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LISTAS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Erro ao ler listas publicadas', e);
  }
  try {
    localStorage.setItem(STORAGE_KEY_LISTAS, JSON.stringify(INITIAL_LISTAS_PUBLICADAS));
  } catch {}
  return INITIAL_LISTAS_PUBLICADAS;
}

export function saveStoredListasPublicadas(list) {
  try {
    localStorage.setItem(STORAGE_KEY_LISTAS, JSON.stringify(list));
  } catch (e) {
    console.warn('Erro ao salvar listas publicadas', e);
  }
  return list;
}

export function deleteStoredLista(id, operador = 'Presidente do Júri SERNIC') {
  const list = getStoredListasPublicadas();
  const target = list.find(l => l.id === id);
  if (!target) return false;

  const updatedList = list.filter(l => l.id !== id);
  saveStoredListasPublicadas(updatedList);

  addStoredAuditoria({
    acao: 'Revogação de Edital / Pauta Oficial',
    candidato: `${target.tituloLista} (${target.edital})`,
    estadoAnterior: 'Publicado',
    novoEstado: 'Revogado / Despublicado',
    motivo: `Retirada do edital de circulação pública`,
    operador: operador
  });

  return true;
}

export function getStoredAuditoria() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDITORIA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  
  const initialAuditoria = [
    {
      id: 'AUD-001',
      dataHora: '2026-10-21 17:30',
      operador: 'Dr. Alberto Chissano (Presidente do Júri)',
      acao: 'Avaliação de Candidato',
      candidato: 'Ângela Beatriz Cossa (SERNIC-2026-00789)',
      estadoAnterior: 'Convocada para provas',
      novoEstado: 'Aprovada',
      motivo: 'Aprovada com nota 17.8 valores pelo júri de cibersegurança'
    },
    {
      id: 'AUD-002',
      dataHora: '2026-10-21 16:00',
      operador: 'Dr. Alberto Chissano (Presidente do Júri)',
      acao: 'Avaliação de Candidato',
      candidato: 'Fátima Abdul Remane (SERNIC-2026-00311)',
      estadoAnterior: 'Convocada para provas',
      novoEstado: 'Aprovada',
      motivo: 'Classificada em 1º Lugar com nota 18.5 valores'
    },
    {
      id: 'AUD-003',
      dataHora: '2026-10-20 14:00',
      operador: 'Dr. Alberto Chissano (Presidente do Júri)',
      acao: 'Convocação para Exame',
      candidato: 'Salvador Paulo Mucavele (SERNIC-2026-00234)',
      estadoAnterior: 'Admitida',
      novoEstado: 'Convocada para provas',
      motivo: 'Convocado para prova prática no Hospital Provincial de Pemba'
    },
    {
      id: 'AUD-004',
      dataHora: '2026-10-18 10:00',
      operador: 'Dr. Alberto Chissano (Presidente do Júri)',
      acao: 'Publicação de Edital',
      candidato: 'Edital Geral n.º 01/2026',
      estadoAnterior: 'Rascunho',
      novoEstado: 'Publicado',
      motivo: 'Publicação oficial de candidatos admitidos na página inicial do portal'
    }
  ];

  try {
    localStorage.setItem(STORAGE_KEY_AUDITORIA, JSON.stringify(initialAuditoria));
  } catch {}
  return initialAuditoria;
}

export function addStoredAuditoria(entry) {
  const list = getStoredAuditoria();
  const now = new Date();
  const dateFormatted = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  
  const newEntry = {
    id: `AUD-${String(list.length + 1).padStart(3, '0')}`,
    dataHora: dateFormatted,
    ...entry
  };
  
  list.unshift(newEntry);
  try {
    localStorage.setItem(STORAGE_KEY_AUDITORIA, JSON.stringify(list));
  } catch {}
  return list;
}

// ========================================================
// MÓDULO DE DEFINIÇÕES: CURSOS, LOCAIS DE TESTE E PARÂMETROS
// ========================================================

const STORAGE_KEY_CURSOS = 'sernic_concurso_cursos_v1';
const STORAGE_KEY_LOCAIS = 'sernic_concurso_locais_v1';
const STORAGE_KEY_DEFINICOES = 'sernic_concurso_definicoes_v1';

export const INITIAL_CURSOS_ACEITES = [
  {
    id: 'CUR-01',
    nome: 'Direito e Ciências Criminais',
    grau: 'Licenciatura',
    carreira: 'Investigação Criminal e Instrução Processual',
    notaMinima: '14.0',
    status: 'Activo'
  },
  {
    id: 'CUR-02',
    nome: 'Ciências Policiais e Segurança Pública',
    grau: 'Licenciatura',
    carreira: 'Investigação Criminal e Instrução Processual',
    notaMinima: '14.0',
    status: 'Activo'
  },
  {
    id: 'CUR-03',
    nome: 'Criminologia e Psicologia Forense',
    grau: 'Licenciatura',
    carreira: 'Investigação Criminal e Instrução Processual',
    notaMinima: '15.0',
    status: 'Activo'
  },
  {
    id: 'CUR-04',
    nome: 'Engenharia Informática, Redes e Cibersegurança',
    grau: 'Licenciatura',
    carreira: 'Inteligência Digital e Cibercrime',
    notaMinima: '14.0',
    status: 'Activo'
  },
  {
    id: 'CUR-05',
    nome: 'Ciência da Computação e Telecomunicações',
    grau: 'Licenciatura',
    carreira: 'Inteligência Digital e Cibercrime',
    notaMinima: '14.0',
    status: 'Activo'
  },
  {
    id: 'CUR-06',
    nome: 'Química Industrial e Bioquímica',
    grau: 'Licenciatura',
    carreira: 'Polícia Científica (Laboratório Forense)',
    notaMinima: '14.0',
    status: 'Activo'
  },
  {
    id: 'CUR-07',
    nome: 'Física Forense e Mecânica Comparativa',
    grau: 'Licenciatura',
    carreira: 'Polícia Científica (Laboratório Forense)',
    notaMinima: '14.0',
    status: 'Activo'
  },
  {
    id: 'CUR-08',
    nome: 'Medicina Geral e Patologia Forense',
    grau: 'Licenciatura',
    carreira: 'Medicina Legal e Toxicologia Forense',
    notaMinima: '15.0',
    status: 'Activo'
  },
  {
    id: 'CUR-09',
    nome: 'Farmácia e Toxicologia Laboratorial',
    grau: 'Licenciatura',
    carreira: 'Medicina Legal e Toxicologia Forense',
    notaMinima: '14.0',
    status: 'Activo'
  },
  {
    id: 'CUR-10',
    nome: '12ª Classe do Sistema Nacional de Educação (SNE)',
    grau: 'Nível Médio',
    carreira: 'Corpo Técnico Operativo e Apoio',
    notaMinima: '12.0',
    status: 'Activo'
  }
];

export const INITIAL_LOCAIS_EXAME = [
  {
    id: 'LOC-01',
    nome: 'Academia de Ciências Policiais (ACIPOL)',
    provincia: 'Maputo Província',
    cidade: 'Michafutene',
    endereco: 'Bloco C e Pavilhão Desportivo Principal',
    capacidade: 650,
    tiposProva: ['Prova Escrita de Conhecimentos', 'Testes Psicotécnicos'],
    dataPrevista: '15 de Novembro de 2026 às 08h00',
    responsavel: 'Inspetor Chefe Manhique (+258 000 000 000)'
  },
  {
    id: 'LOC-02',
    nome: 'Escola Prática de Polícia (EPP) - Matalana',
    provincia: 'Maputo Província',
    cidade: 'Matalana',
    endereco: 'Pista de Obstáculos e Pista de Atletismo Militar',
    capacidade: 500,
    tiposProva: ['Provas de Aptidão Física e Robustez'],
    dataPrevista: '22 de Novembro de 2026 às 06h30',
    responsavel: 'Superintendente Tembe (+258 000 000 000)'
  },
  {
    id: 'LOC-03',
    nome: 'Laboratório Central de Criminalística (SERNIC)',
    provincia: 'Maputo Cidade',
    cidade: 'Maputo',
    endereco: 'Av. Vladimir Lenine, n.º 1234, 2º Andar',
    capacidade: 120,
    tiposProva: ['Prova Prática Laboratorial de Perícia', 'Cibersegurança'],
    dataPrevista: '18 de Novembro de 2026 às 09h00',
    responsavel: 'Perito Principal Dr. Langa (+258 000 000 000)'
  },
  {
    id: 'LOC-04',
    nome: 'Delegação Provincial do SERNIC de Sofala',
    provincia: 'Sofala',
    cidade: 'Beira',
    endereco: 'Av. das FPLM, n.º 450, Centro da Cidade',
    capacidade: 300,
    tiposProva: ['Prova Escrita de Conhecimentos', 'Inspecção Médica'],
    dataPrevista: '15 de Novembro de 2026 às 08h00',
    responsavel: 'Inspetor Regional Nhantumbo (+258 000 000 000)'
  },
  {
    id: 'LOC-05',
    nome: 'Delegação Provincial do SERNIC de Nampula',
    provincia: 'Nampula',
    cidade: 'Nampula',
    endereco: 'Rua de Moçambique, n.º 88',
    capacidade: 350,
    tiposProva: ['Prova Escrita de Conhecimentos', 'Testes Psicotécnicos'],
    dataPrevista: '15 de Novembro de 2026 às 08h00',
    responsavel: 'Inspetor Regional Remane (+258 000 000 000)'
  },
  {
    id: 'LOC-06',
    nome: 'Gabinete Médico-Legal do Hospital Provincial de Pemba',
    provincia: 'Cabo Delgado',
    cidade: 'Pemba',
    endereco: 'Hospital Provincial de Pemba, Pavilhão de Patologia',
    capacidade: 80,
    tiposProva: ['Inspecção Médica e Prova Toxicológica'],
    dataPrevista: '25 de Novembro de 2026 às 09h00',
    responsavel: 'Dr. Mucavele (+258 000 000 000)'
  }
];

export const INITIAL_DEFINICOES_SISTEMA = {
  tituloConcurso: 'Concurso Público Nacional de Ingresso no SERNIC 2026',
  codigoEdital: 'Aviso n.º 01/SERNIC-DG/DRH/2026',
  dataAbertura: '2026-10-01',
  dataEncerramento: '2026-11-30',
  idadeMinima: 18,
  idadeMaximaGeral: 35,
  idadeMaximaEspecialistas: 40,
  alturaMinimaHomem: '1.65',
  alturaMinimaMulher: '1.60',
  prazoRecursoDias: 5,
  notificacoesSmsAtivas: true,
  notificacoesEmailAtivas: true,
  temaPadrao: 'claro',
  corDestaque: '#c32026',
  opacidadeMarcaAgua: 'normal',
  idiomaPadrao: 'pt',
  fusoHorario: 'CAT (UTC+2) - Maputo'
};

export function getStoredCursos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURSOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  try {
    localStorage.setItem(STORAGE_KEY_CURSOS, JSON.stringify(INITIAL_CURSOS_ACEITES));
  } catch {}
  return INITIAL_CURSOS_ACEITES;
}

export function saveStoredCursos(list) {
  try {
    localStorage.setItem(STORAGE_KEY_CURSOS, JSON.stringify(list));
  } catch (e) {}
  return list;
}

export function getStoredLocais() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAIS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  try {
    localStorage.setItem(STORAGE_KEY_LOCAIS, JSON.stringify(INITIAL_LOCAIS_EXAME));
  } catch {}
  return INITIAL_LOCAIS_EXAME;
}

export function saveStoredLocais(list) {
  try {
    localStorage.setItem(STORAGE_KEY_LOCAIS, JSON.stringify(list));
  } catch (e) {}
  return list;
}

export function getStoredDefinicoes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEFINICOES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.tituloConcurso) return parsed;
    }
  } catch (e) {}
  try {
    localStorage.setItem(STORAGE_KEY_DEFINICOES, JSON.stringify(INITIAL_DEFINICOES_SISTEMA));
  } catch {}
  return INITIAL_DEFINICOES_SISTEMA;
}

export function saveStoredDefinicoes(defs) {
  try {
    localStorage.setItem(STORAGE_KEY_DEFINICOES, JSON.stringify(defs));
  } catch (e) {}
  return defs;
}

// ========================================================
// GESTÃO DE PALETAS DE CORES & TEMAS (CRUD)
// ========================================================
export const INITIAL_PALETAS_CORES = [
  { id: 'PAL-01', nome: 'Vermelho SERNIC (Oficial)', cor: '#c32026', desc: 'Identidade Constitucional SERNIC', categoria: 'Oficial' },
  { id: 'PAL-02', nome: 'Dourado República', cor: '#c59b27', desc: 'Emblema & Brasão Nacional', categoria: 'Institucional' },
  { id: 'PAL-03', nome: 'Azul Marinho Forense', cor: '#1e3a8a', desc: 'Polícia Científica e Investigação', categoria: 'Forense' },
  { id: 'PAL-04', nome: 'Verde Moçambique', cor: '#059669', desc: 'Cores da Bandeira Nacional', categoria: 'Nacional' },
  { id: 'PAL-05', nome: 'Bordo Nobre', cor: '#881337', desc: 'Procuradoria-Geral da República', categoria: 'Justiça' },
  { id: 'PAL-06', nome: 'Grafite Tático', cor: '#334155', desc: 'Forças Especiais e Operações', categoria: 'Tático' },
  { id: 'PAL-07', nome: 'Púrpura Criminológica', cor: '#6b21a8', desc: 'Inteligência Forense Digital', categoria: 'Cibercrime' }
];

const STORAGE_KEY_PALETAS = 'sernic_paletas_cores_v1';

export function getStoredPaletasCores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PALETAS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  try {
    localStorage.setItem(STORAGE_KEY_PALETAS, JSON.stringify(INITIAL_PALETAS_CORES));
  } catch {}
  return INITIAL_PALETAS_CORES;
}

export function saveStoredPaletasCores(list) {
  try {
    localStorage.setItem(STORAGE_KEY_PALETAS, JSON.stringify(list));
  } catch (e) {}
  return list;
}

export function createStoredPaleta(paleta) {
  const current = getStoredPaletasCores();
  const nextNum = current.length + 1;
  const newPaleta = {
    id: paleta.id || `PAL-${String(nextNum).padStart(2, '0')}`,
    nome: paleta.nome || 'Nova Paleta de Cores',
    cor: paleta.cor || '#c32026',
    desc: paleta.desc || 'Paleta personalizada pelo utilizador',
    categoria: paleta.categoria || 'Personalizado'
  };
  const updated = [newPaleta, ...current];
  saveStoredPaletasCores(updated);
  return newPaleta;
}

export function updateStoredPaleta(id, updates) {
  const current = getStoredPaletasCores();
  const updated = current.map(p => p.id === id ? { ...p, ...updates } : p);
  saveStoredPaletasCores(updated);
  return updated.find(p => p.id === id);
}

export function deleteStoredPaleta(id) {
  const current = getStoredPaletasCores();
  const filtered = current.filter(p => p.id !== id);
  saveStoredPaletasCores(filtered);
  return filtered;
}

