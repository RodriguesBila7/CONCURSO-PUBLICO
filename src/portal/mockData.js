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

// Candidaturas de Demonstração para Consulta Instantânea e Gestão do Concurso
export const INITIAL_CANDIDATURAS_CONSULTA = [
  {
    codigoCandidatura: 'SERNIC-2026-00849',
    biNumero: '110100234567M',
    nuit: '100234567',
    nomeCompleto: 'Armando Carlos Mondlane',
    genero: 'Masculino',
    dataNascimento: '1998-05-14',
    idade: 28,
    telefone: '+258 84 123 4567',
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
    status: 'Convocada para provas', // 'Em análise' | 'Admitida' | 'Convocada para provas' | 'Aprovada' | 'Excluída'
    faseAtual: 4,
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
      titulo: 'Convocado(a) para Prova Escrita e Teste de Aptidão',
      dataEvento: '15 de Novembro de 2026 às 08h00',
      local: 'Academia de Ciências Policiais (ACIPOL), Bloco C, Sala 14 - Michafutene, Maputo',
      observacoes: 'Apresentação obrigatória com o documento de identificação original (BI/Passaporte) e cópia impressa do Comprovativo de Candidatura.',
      mensagemComissao: 'A sua candidatura cumpriu todos os critérios da triagem curricular e validação documental. O candidato encontra-se devidamente admitido para a fase de provas de conhecimento.'
    },
    deliberacaoJuri: {
      decisao: 'Convocada para provas',
      dataDeliberacao: '2026-10-20T10:15:00Z',
      operador: 'Dr. Alberto Chissano (Presidente do Júri)',
      parecer: 'Candidato apto e em conformidade com as exigências do Aviso n.º 01/2026. Convocado para exame escrito na ACIPOL.'
    },
    historico: [
      { data: '2026-10-04', etapa: 'Candidatura Submetida', descricao: 'Processo registado com sucesso no portal oficial do SERNIC.' },
      { data: '2026-10-09', etapa: 'Triagem Documental Concluída', descricao: 'Certificados e registo criminal validados em conformidade com o Estatuto do SERNIC.' },
      { data: '2026-10-15', etapa: 'Candidatura Admitida', descricao: 'Aprovada para a lista preliminar de candidatos elegíveis.' },
      { data: '2026-10-20', etapa: 'Convocação para Provas', descricao: 'Convocado para o exame escrito de conhecimentos e avaliação de perfil.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00122',
    biNumero: '100200345678A',
    nuit: '100345678',
    nomeCompleto: 'Maria Helena Nhantumbo',
    genero: 'Feminino',
    dataNascimento: '1996-08-22',
    idade: 30,
    telefone: '+258 82 987 6543',
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
    status: 'Admitida',
    faseAtual: 3,
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
      titulo: 'Candidatura Admitida - Aguarda Convocação de Prova Prática',
      dataEvento: 'A publicar até 30 de Outubro de 2026',
      local: 'Aviso a ser emitido no portal oficial e enviado por SMS',
      observacoes: 'A análise curricular e a certificação profissional em segurança da informação foram aprovadas com distinção.',
      mensagemComissao: 'Candidato homologado como apto para participar na fase de provas laboratoriais práticas.'
    },
    deliberacaoJuri: {
      decisao: 'Admitida',
      dataDeliberacao: '2026-10-19T14:20:00Z',
      operador: 'Dr. Alberto Chissano (Presidente do Júri)',
      parecer: 'Requisitos plenamente validados. Excelente perfil técnico em perícia digital.'
    },
    historico: [
      { data: '2026-10-11', etapa: 'Candidatura Submetida', descricao: 'Processo enviado online.' },
      { data: '2026-10-16', etapa: 'Validação Curricular', descricao: 'Aptidão técnica aprovada pelo júri de telecomunicações forenses.' },
      { data: '2026-10-19', etapa: 'Candidatura Admitida', descricao: 'Homologação oficial publicada.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00567',
    biNumero: '120300456789B',
    nuit: '100876543',
    nomeCompleto: 'Eusébio João Sitoe',
    genero: 'Masculino',
    dataNascimento: '1995-12-03',
    idade: 31,
    telefone: '+258 84 555 4321',
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
    status: 'Excluída',
    faseAtual: 2,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Química Industrial',
      instituicao: 'Universidade Pedagógica de Moçambique (UP)',
      anoConclusao: 2020,
      mediaFinal: '14.0'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.1 MB', data: '2026-10-08' },
      { id: 'doc-cert', tipo: 'Certificado de Habilitações (Incompleto)', status: 'Rejeitado', tamanho: '1.9 MB', data: '2026-10-08' }
    ],
    detalhesFase: {
      titulo: 'Candidatura Excluída do Processo Selectivo',
      dataEvento: 'Publicado a 16 de Outubro de 2026',
      local: 'Departamento de Recursos Humanos do SERNIC',
      observacoes: 'Prazo para interposição de recurso: 5 (cinco) dias úteis a contar da notificação.',
      motivoExclusao: 'Documento de Habilitações Literárias incompleto: Não foi anexado o Certificado de Homologação de Grau Académico obtido no exterior, contrariando o estabelecido no Ponto 4.2 do Edital n.º 02/2026.',
      mensagemComissao: 'Lamentamos informar que a documentação apresentada não satisfaz os requisitos legais obrigatórios previstos no edital do concurso.'
    },
    deliberacaoJuri: {
      decisao: 'Excluída',
      dataDeliberacao: '2026-10-16T11:45:00Z',
      operador: 'Dra. Elsa Manjate (Vogal do Júri)',
      motivoExclusao: 'Falta de Certificado de Habilitações autenticado ou sem homologação',
      parecer: 'Excluído nos termos do Ponto 4.2 do Edital por não submissão da homologação ministerial do diploma estrangeiro.'
    },
    historico: [
      { data: '2026-10-08', etapa: 'Candidatura Submetida', descricao: 'Processo registado no portal.' },
      { data: '2026-10-16', etapa: 'Exclusão Documental', descricao: 'Falta de documento obrigatório (Equivalência/Homologação do Certificado).' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00990',
    biNumero: '090400567890C',
    nuit: '100555444',
    nomeCompleto: 'Zito Alberto Macuácua',
    genero: 'Masculino',
    dataNascimento: '1997-03-19',
    idade: 29,
    telefone: '+258 87 234 5678',
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
    status: 'Em análise',
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
      titulo: 'Processo em Fase de Análise Documental e Confirmação de Registo',
      dataEvento: 'Previsão de conclusão: 28 de Outubro de 2026',
      local: 'Comissão de Avaliação Documental do SERNIC',
      observacoes: 'A sua documentação está actualmente a ser verificada junto da Ordem dos Médicos e instituições de ensino.',
      mensagemComissao: 'O seu processo de candidatura encontra-se sob apreciação do corpo de júri técnico.'
    },
    deliberacaoJuri: {
      decisao: 'Em análise',
      dataDeliberacao: null,
      operador: null,
      parecer: 'A aguardar confirmação de inscrição activa na Ordem dos Médicos de Moçambique.'
    },
    historico: [
      { data: '2026-10-19', etapa: 'Candidatura Submetida', descricao: 'Registo inicial com sucesso.' },
      { data: '2026-10-21', etapa: 'Aguardando Análise Documental', descricao: 'Processo em processamento pela mesa de júri.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00311',
    biNumero: '030200889912D',
    nuit: '100443322',
    nomeCompleto: 'Fátima Abdul Remane',
    genero: 'Feminino',
    dataNascimento: '1999-11-05',
    idade: 27,
    telefone: '+258 84 333 9988',
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
    status: 'Aprovada',
    faseAtual: 6,
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
      titulo: 'Candidata Aprovada com Distinção para Provimento de Vaga',
      dataEvento: 'Homologação oficial: 22 de Outubro de 2026',
      local: 'Direcção Geral do SERNIC - Maputo',
      observacoes: 'Apurada em 1º Lugar na Delegação Provincial de Nampula. Convocada para tomada de posse.',
      mensagemComissao: 'Parabéns! Obteve a classificação final de 18.5 valores nas provas escritas, físicas e psicotécnicas.'
    },
    deliberacaoJuri: {
      decisao: 'Aprovada',
      dataDeliberacao: '2026-10-21T16:00:00Z',
      operador: 'Dr. Alberto Chissano (Presidente do Júri)',
      notaFinal: '18.5',
      parecer: 'Aprovada com mérito. Recomendada para a Delegação Provincial do SERNIC de Nampula.'
    },
    historico: [
      { data: '2026-10-02', etapa: 'Candidatura Submetida', descricao: 'Inscrição submetida.' },
      { data: '2026-10-07', etapa: 'Triagem Documental Concluída', descricao: 'Homologada.' },
      { data: '2026-10-14', etapa: 'Provas Escritas e Físicas', descricao: 'Classificação de 18.5 valores.' },
      { data: '2026-10-21', etapa: 'Aprovação Final e Provimento', descricao: 'Apurada para colocação.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00445',
    biNumero: '110500112233E',
    nuit: '100667788',
    nomeCompleto: 'Cecília Mário Langa',
    genero: 'Feminino',
    dataNascimento: '2000-01-18',
    idade: 26,
    telefone: '+258 86 112 3344',
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
    status: 'Admitida',
    faseAtual: 3,
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
      titulo: 'Candidatura Admitida - Aguarda Convocação de Provas',
      dataEvento: 'Convocatória prevista para Novembro de 2026',
      local: 'Michafutene - ACIPOL',
      observacoes: 'Documentação validada pelo departamento de recursos humanos.',
      mensagemComissao: 'Candidata apta para prosseguir às fases seguintes.'
    },
    deliberacaoJuri: {
      decisao: 'Admitida',
      dataDeliberacao: '2026-10-18T09:30:00Z',
      operador: 'Dr. Alberto Chissano (Presidente do Júri)',
      parecer: 'Documentação em conformidade com o EGFAE e edital.'
    },
    historico: [
      { data: '2026-10-06', etapa: 'Candidatura Submetida', descricao: 'Inscrição efetuada.' },
      { data: '2026-10-18', etapa: 'Candidatura Admitida', descricao: 'Triagem documental favorável.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00678',
    biNumero: '070300998877F',
    nuit: '100998811',
    nomeCompleto: 'Tomás Manuel Chivambo',
    genero: 'Masculino',
    dataNascimento: '1984-04-12',
    idade: 42,
    telefone: '+258 85 444 7766',
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
    status: 'Excluída',
    faseAtual: 2,
    habilitacoes: {
      grau: 'Licenciatura',
      curso: 'Engenharia de Redes e Telecomunicações',
      instituicao: 'Instituto Superior Politécnico de Tete (ISPT)',
      anoConclusao: 2012,
      mediaFinal: '14.5'
    },
    documentos: [
      { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.2 MB', data: '2026-10-09' }
    ],
    detalhesFase: {
      titulo: 'Candidatura Excluída por Limite de Idade',
      dataEvento: 'Publicado a 17 de Outubro de 2026',
      local: 'SERNIC - Comissão Central de Concurso',
      observacoes: 'Prazo legal de reclamação: 5 dias úteis.',
      motivoExclusao: 'Art. 35 do EGFAE - Idade superior a 40 anos à data de fecho do concurso.',
      mensagemComissao: 'Lamentamos informar a exclusão nos termos do regime geral de ingresso na Função Pública.'
    },
    deliberacaoJuri: {
      decisao: 'Excluída',
      dataDeliberacao: '2026-10-17T11:00:00Z',
      operador: 'Dra. Elsa Manjate (Vogal do Júri)',
      motivoExclusao: 'Art. 35 do EGFAE - Idade superior a 40 anos à data limite',
      parecer: 'Excluído em cumprimento ao Art. 35 do EGFAE conjugado com o Edital n.º 03/2026 (limite de 40 anos).'
    },
    historico: [
      { data: '2026-10-09', etapa: 'Candidatura Submetida', descricao: 'Registo efetuado.' },
      { data: '2026-10-17', etapa: 'Candidatura Excluída', descricao: 'Exclusão por limite de idade.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00812',
    biNumero: '040800334455G',
    nuit: '100778899',
    nomeCompleto: 'Graça Fernando Buque',
    genero: 'Feminino',
    dataNascimento: '1997-09-30',
    idade: 29,
    telefone: '+258 84 990 1122',
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
    status: 'Em análise',
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
      titulo: 'Documentação Sob Apreciação Técnica',
      dataEvento: 'Conclusão prevista para 31 de Outubro',
      local: 'Laboratório Central de Criminalística',
      observacoes: 'Verificação da equivalência de unidades curriculares em química forense.',
      mensagemComissao: 'Processo na fase de conferência curricular pela comissão de júri.'
    },
    deliberacaoJuri: {
      decisao: 'Em análise',
      dataDeliberacao: null,
      operador: null,
      parecer: 'A aguardar parecer dos peritos de química forense sobre a grade curricular.'
    },
    historico: [
      { data: '2026-10-14', etapa: 'Candidatura Submetida', descricao: 'Processo registado.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00234',
    biNumero: '020100778899H',
    nuit: '100112244',
    nomeCompleto: 'Salvador Paulo Mucavele',
    genero: 'Masculino',
    dataNascimento: '1998-07-11',
    idade: 28,
    telefone: '+258 87 665 4321',
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
    status: 'Convocada para provas',
    faseAtual: 4,
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
      titulo: 'Convocado para Prova Teórico-Prática de Toxicologia',
      dataEvento: '18 de Novembro de 2026 às 09h00',
      local: 'Hospital Provincial de Pemba - Gabinete Médico-Legal',
      observacoes: 'Trajar vestuário adequado de laboratório e portar documento de identificação original.',
      mensagemComissao: 'Candidato admitido e formalmente convocado para os exames práticos.'
    },
    deliberacaoJuri: {
      decisao: 'Convocada para provas',
      dataDeliberacao: '2026-10-20T14:00:00Z',
      operador: 'Dr. Alberto Chissano (Presidente do Júri)',
      parecer: 'Processo conforme. Convocado para prova prática no Hospital Provincial de Pemba.'
    },
    historico: [
      { data: '2026-10-05', etapa: 'Candidatura Submetida', descricao: 'Inscrição realizada.' },
      { data: '2026-10-12', etapa: 'Candidatura Admitida', descricao: 'Triagem favorável.' },
      { data: '2026-10-20', etapa: 'Convocação para Provas', descricao: 'Convocado para prova prática de toxicologia.' }
    ]
  },
  {
    codigoCandidatura: 'SERNIC-2026-00789',
    biNumero: '110900445566I',
    nuit: '100334455',
    nomeCompleto: 'Ângela Beatriz Cossa',
    genero: 'Feminino',
    dataNascimento: '1999-02-14',
    idade: 27,
    telefone: '+258 82 443 2199',
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
    status: 'Aprovada',
    faseAtual: 6,
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
      titulo: 'Candidata Aprovada para Ingresso na Divisão de Cibercrimes',
      dataEvento: 'Cerimónia de Apresentação: 1 de Dezembro de 2026',
      local: 'Direcção Geral do SERNIC - Maputo',
      observacoes: 'Apurada com nota final de 17.8 valores. Notificação oficial expedida.',
      mensagemComissao: 'Classificada para o provimento da vaga de Especialista em Cibersegurança.'
    },
    deliberacaoJuri: {
      decisao: 'Aprovada',
      dataDeliberacao: '2026-10-21T17:30:00Z',
      operador: 'Dr. Alberto Chissano (Presidente do Júri)',
      notaFinal: '17.8',
      parecer: 'Aprovada por unanimidade pelo corpo de júri técnico forense digital.'
    },
    historico: [
      { data: '2026-10-03', etapa: 'Candidatura Submetida', descricao: 'Processo enviado.' },
      { data: '2026-10-10', etapa: 'Triagem Documental Concluída', descricao: 'Homologação favorável.' },
      { data: '2026-10-16', etapa: 'Provas Práticas de Laboratório', descricao: 'Excelente desempenho prático.' },
      { data: '2026-10-21', etapa: 'Aprovação Final', descricao: 'Apurada com 17.8 valores.' }
    ]
  }
];

// Províncias e Distritos de Moçambique para selects estruturados
export const PROVINCIAS_MOCAMBIQUE = [
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

// Helper para validar NUIT Moçambicano (9 dígitos numéricos)
export function validarNUIT(nuit) {
  const limpo = String(nuit || '').replace(/\D/g, '');
  return limpo.length === 9;
}

// Helper para validar BI Moçambicano (12 dígitos numéricos seguidos de 1 letra, ex: 110100234567M)
export function validarBI(bi) {
  const padrao = /^[0-9]{12}[A-Za-z]$/;
  return padrao.test(String(bi || '').trim());
}

// Helper para validar telefone moçambicano (+258 8X XXX XXXX ou 8X XXX XXXX)
export function validarTelefoneMZ(tel) {
  const limpo = String(tel || '').replace(/\D/g, '');
  if (limpo.startsWith('258') && limpo.length === 12) {
    const ddd = limpo.substring(3, 5);
    return ['82', '83', '84', '85', '86', '87'].includes(ddd);
  }
  if (limpo.length === 9) {
    const ddd = limpo.substring(0, 2);
    return ['82', '83', '84', '85', '86', '87'].includes(ddd);
  }
  return false;
}

// ========================================================
// PERSISTÊNCIA EM LOCALSTORAGE & HELPERS DE CONEXÃO
// ========================================================

const STORAGE_KEY_CANDIDATURAS = 'sernic_concurso_candidaturas_v2';
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

export function getStoredCandidaturas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CANDIDATURAS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Erro ao ler candidaturas do localStorage', e);
  }
  // Inicializa com as candidaturas padrão
  try {
    localStorage.setItem(STORAGE_KEY_CANDIDATURAS, JSON.stringify(INITIAL_CANDIDATURAS_CONSULTA));
  } catch {}
  return INITIAL_CANDIDATURAS_CONSULTA;
}

export function saveStoredCandidaturas(list) {
  try {
    localStorage.setItem(STORAGE_KEY_CANDIDATURAS, JSON.stringify(list));
  } catch (e) {
    console.warn('Erro ao salvar candidaturas no localStorage', e);
  }
  return list;
}

export function updateStoredCandidatura(codigo, updates, operador = 'Comissão de Júri SERNIC') {
  const list = getStoredCandidaturas();
  const index = list.findIndex(c => c.codigoCandidatura === codigo);
  if (index === -1) return null;

  const current = list[index];
  const nowStr = new Date().toISOString();
  const dateFormatted = new Date().toISOString().split('T')[0];

  // Novo histórico
  const novoHistorico = [...(current.historico || [])];
  let novaEtapa = 'Deliberação da Comissão';
  let descEtapa = `Estado atualizado para: ${updates.status || current.status}.`;

  if (updates.status === 'Admitida') {
    novaEtapa = 'Candidatura Admitida';
    descEtapa = updates.parecer || 'Aprovada na triagem documental e homologada pela comissão de júri.';
  } else if (updates.status === 'Convocada para provas') {
    novaEtapa = 'Convocação Oficial para Provas';
    descEtapa = updates.eventoLocal ? `Convocado para provas em ${updates.eventoLocal}.` : 'Convocado para realização de exames oficiais.';
  } else if (updates.status === 'Aprovada') {
    novaEtapa = 'Aprovação Final e Provimento de Vaga';
    descEtapa = `Aprovado com a nota final de ${updates.notaFinal || '18.0'} valores para provimento de vaga.`;
  } else if (updates.status === 'Excluída') {
    novaEtapa = 'Candidatura Não Admitida / Excluída';
    descEtapa = updates.motivoExclusao || updates.parecer || 'Não admissão fundamentada por não conformidade com o edital.';
  }

  novoHistorico.push({
    data: dateFormatted,
    etapa: novaEtapa,
    descricao: descEtapa
  });

  const updatedCandidate = {
    ...current,
    ...updates,
    historico: novoHistorico,
    deliberacaoJuri: {
      decisao: updates.status || current.status,
      dataDeliberacao: nowStr,
      operador: operador,
      motivoExclusao: updates.motivoExclusao || null,
      notaFinal: updates.notaFinal || null,
      parecer: updates.parecer || current.deliberacaoJuri?.parecer || ''
    },
    detalhesFase: {
      ...current.detalhesFase,
      titulo: updates.status === 'Admitida' 
        ? 'Candidatura Admitida no Concurso' 
        : updates.status === 'Convocada para provas'
        ? (updates.eventoTitulo || 'Convocado(a) para Provas e Exames')
        : updates.status === 'Aprovada'
        ? 'Candidato(a) Aprovado(a) para Provimento de Vaga'
        : updates.status === 'Excluída'
        ? 'Candidatura Excluída do Processo Selectivo'
        : 'Processo em Fase de Apreciação',
      dataEvento: updates.eventoData || current.detalhesFase?.dataEvento || 'Conforme Edital Publicado',
      local: updates.eventoLocal || current.detalhesFase?.local || 'Instalações Oficiais do SERNIC / ACIPOL',
      observacoes: updates.observacoes || current.detalhesFase?.observacoes || '',
      motivoExclusao: updates.motivoExclusao || current.detalhesFase?.motivoExclusao || null,
      mensagemComissao: updates.parecer || current.detalhesFase?.mensagemComissao || ''
    }
  };

  list[index] = updatedCandidate;
  saveStoredCandidaturas(list);

  // Registar na auditoria
  addStoredAuditoria({
    acao: 'Deliberação de Candidatura',
    candidato: `${current.nomeCompleto} (${codigo})`,
    estadoAnterior: current.status,
    novoEstado: updates.status || current.status,
    motivo: updates.motivoExclusao || updates.parecer || 'Deliberação regular da mesa de júri',
    operador: operador
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
      acao: 'Deliberação de Candidatura',
      candidato: 'Ângela Beatriz Cossa (SERNIC-2026-00789)',
      estadoAnterior: 'Convocada para provas',
      novoEstado: 'Aprovada',
      motivo: 'Aprovada com nota 17.8 valores pelo júri de cibersegurança'
    },
    {
      id: 'AUD-002',
      dataHora: '2026-10-21 16:00',
      operador: 'Dr. Alberto Chissano (Presidente do Júri)',
      acao: 'Deliberação de Candidatura',
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
    responsavel: 'Inspetor Chefe Manhique (+258 84 321 0001)'
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
    responsavel: 'Superintendente Tembe (+258 82 456 0002)'
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
    responsavel: 'Perito Principal Dr. Langa (+258 84 789 0003)'
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
    responsavel: 'Inspetor Regional Nhantumbo (+258 84 999 0004)'
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
    responsavel: 'Inspetor Regional Remane (+258 86 111 0005)'
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
    responsavel: 'Dr. Mucavele (+258 87 222 0006)'
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

