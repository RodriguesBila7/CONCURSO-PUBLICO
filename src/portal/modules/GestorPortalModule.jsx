import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import GestorServidorPanel from '../components/GestorServidorPanel';
import { iniciarSincronizacao, pararSincronizacao } from '../processosSync';

const ROTULO_SYNC = {
  'a-carregar': 'A carregar...',
  'a-gravar': 'A gravar no servidor...',
  sincronizado: 'Gravado no servidor',
  local: 'Base local sincronizada',
  erro: 'Base local ativa'
};
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  Award, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Eye, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Edit3, 
  Layers, 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  FileCheck, 
  History, 
  Sparkles, 
  RefreshCw, 
  SlidersHorizontal, 
  CheckSquare, 
  FileSpreadsheet, 
  BookOpen, 
  Send, 
  Info,
  Phone,
  Mail,
  UserCheck,
  UserX,
  FileSignature,
  FilePlus2,
  ChevronDown,
  Palette,
  Globe,
  Settings,
  Plus,
  Trash2,
  Save,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  Building,
  AlertTriangle,
  Sun,
  Moon,
  PieChart,
  RotateCcw,
  KeyRound,
  ShieldAlert,
  Lock,
  Unlock,
  EyeOff
} from 'lucide-react';
import { 
  INITIAL_VAGAS, 
  PROVINCIAS_MOCAMBIQUE,
  getCandidatePhotoUrl,
  deduplicateCandidaturas,
  getStoredCandidaturas, 
  saveStoredCandidaturas,
  resetStoredCandidaturasParaInicio,
  resetStoredCandidaturaIndividual,
  updateStoredCandidatura,
  deleteStoredCandidatura,
  getStoredListasPublicadas, 
  saveStoredListasPublicadas,
  deleteStoredLista,
  getStoredAuditoria, 
  addStoredAuditoria,
  getStoredCursos,
  saveStoredCursos,
  getStoredLocais,
  saveStoredLocais,
  getStoredDefinicoes,
  saveStoredDefinicoes,
  getStoredVagas,
  saveStoredVagas,
  createStoredVaga,
  updateStoredVaga,
  deleteStoredVaga,
  getStoredPaletasCores,
  saveStoredPaletasCores,
  createStoredPaleta,
  updateStoredPaleta,
  deleteStoredPaleta,
  detectCandidateGender,
  getGenderText,
  isPrazoSubmissaoExpirado,
  formatarDataLimiteExtenso,
  getStatusEfetivoVaga,
  INITIAL_CARREIRAS,
  getStoredCarreiras,
  saveStoredCarreiras,
  createStoredCarreira,
  updateStoredCarreira,
  deleteStoredCarreira,
  INITIAL_PERFIS_EQUIPA,
  INITIAL_ACESSIBILIDADE,
  getStoredPerfis,
  saveStoredPerfis,
  createStoredPerfil,
  updateStoredPerfil,
  deleteStoredPerfil,
  getStoredAcessibilidade,
  saveStoredAcessibilidade,
  LOCAIS_DIRECCOES_PROVINCIAIS,
  homologarEPublicarCandidatura,
  homologarEPublicarTodasCandidaturas
} from '../mockData';
import sernicLogo from '../../assets/sernic-logo.png';
import DraggableSubAba from '../components/DraggableSubAba';

export default function GestorPortalModule({ 
  currentUser, 
  navigate, 
  onNotify, 
  onLogout,
  gestorTab: propGestorTab,
  onGestorTabChange,
  definicoesSubTab: propDefinicoesSubTab,
  onDefinicoesSubTabChange
}) {
  // Aba ativa do Gestor:
  // 'dashboard' | 'inscritos' | 'deliberacao' | 'pautas' | 'vagas' | 'auditoria' | 'definicoes'
  const [internalGestorTab, setInternalGestorTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const h = window.location.hash.replace('#', '');
      if (['dashboard', 'inscritos', 'deliberacao', 'pautas', 'vagas', 'auditoria', 'definicoes'].includes(h)) {
        return h;
      }
    }
    return 'dashboard';
  });

  const gestorTab = propGestorTab || internalGestorTab;
  const setGestorTab = (tab) => {
    if (onGestorTabChange) {
      onGestorTabChange(tab);
    }
    setInternalGestorTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  };

  // Dados sincronizados a partir do localStorage com garantia de unicidade estrita
  const [candidatos, setCandidatos] = useState(() => deduplicateCandidaturas(getStoredCandidaturas()));
  const [listas, setListas] = useState(() => getStoredListasPublicadas());
  const [auditoria, setAuditoria] = useState(() => getStoredAuditoria());
  const [vagas, setVagas] = useState(() => getStoredVagas());
  const [carreiras, setCarreiras] = useState(() => getStoredCarreiras());
  const [perfis, setPerfis] = useState(() => getStoredPerfis());
  const [acessibilidade, setAcessibilidade] = useState(() => getStoredAcessibilidade());

  // Dados do Módulo de Definições
  const [cursos, setCursos] = useState(() => getStoredCursos());
  const [locais, setLocais] = useState(() => getStoredLocais());
  const [definicoes, setDefinicoes] = useState(() => getStoredDefinicoes());
  const [paletasCores, setPaletasCores] = useState(() => getStoredPaletasCores());

  // Recarregar dados
  const reloadData = () => {
    setCandidatos(deduplicateCandidaturas(getStoredCandidaturas()));
    setListas(getStoredListasPublicadas());
    setAuditoria(getStoredAuditoria());
    setVagas(getStoredVagas());
    setCarreiras(getStoredCarreiras());
    setPerfis(getStoredPerfis());
    setAcessibilidade(getStoredAcessibilidade());
    setCursos(getStoredCursos());
    setLocais(getStoredLocais());
    setDefinicoes(getStoredDefinicoes());
    setPaletasCores(getStoredPaletasCores());
    if (onNotify) {
      onNotify('success', 'Base de dados do concurso sincronizada com sucesso!');
    }
  };

  // Ligação ao servidor: os processos das abas Inscritos e Avaliação vivem na base de dados oficial
  const [estadoServidor, setEstadoServidor] = useState({ estado: 'a-carregar', detalhe: '' });

  const sincronizarComServidor = async (manual = false) => {
    setEstadoServidor({ estado: 'a-carregar', detalhe: 'A carregar candidaturas...' });
    try {
      const res = await iniciarSincronizacao({
        onEstado: (estado, detalhe) => {
          if (estado === 'erro') {
            setEstadoServidor({ estado: 'local', detalhe: 'Base de dados local segura ativa' });
          } else {
            setEstadoServidor({ estado, detalhe: detalhe || '' });
          }
        },
        onErro: () => {
          setEstadoServidor({ estado: 'local', detalhe: 'Base de dados local ativa' });
        },
        onSessaoExpirada: () => {
          if (onNotify) onNotify('error', 'A sua sessão expirou. Inicie sessão novamente.');
          if (onLogout) onLogout();
        }
      });
      const candidaturasLocais = deduplicateCandidaturas(getStoredCandidaturas());
      setCandidatos(candidaturasLocais);
      setAuditoria(getStoredAuditoria());

      if (res && res.ok) {
        setEstadoServidor({ estado: 'sincronizado', detalhe: 'Gravado no servidor' });
        if (onNotify && manual) {
          onNotify('success', `${candidaturasLocais.length} candidaturas sincronizadas com o servidor.`);
        }
      } else {
        setEstadoServidor({ estado: 'local', detalhe: 'Base de dados local ativa' });
        if (onNotify && manual) {
          onNotify('success', `Base de dados local sincronizada com sucesso (${candidaturasLocais.length} candidaturas disponíveis).`);
        }
      }
    } catch {
      const candidaturasLocais = deduplicateCandidaturas(getStoredCandidaturas());
      setCandidatos(candidaturasLocais);
      setAuditoria(getStoredAuditoria());
      setEstadoServidor({ estado: 'local', detalhe: 'Base de dados local ativa' });
      if (onNotify && manual) {
        onNotify('success', `Base de dados local atualizada (${candidaturasLocais.length} candidaturas carregadas).`);
      }
    }
  };

  useEffect(() => {
    sincronizarComServidor();
    return () => pararSincronizacao();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sincronização entre abas
  useEffect(() => {
    const handleSync = () => {
      setVagas(getStoredVagas());
      setCarreiras(getStoredCarreiras());
      setPerfis(getStoredPerfis());
      setAcessibilidade(getStoredAcessibilidade());
      setCandidatos(deduplicateCandidaturas(getStoredCandidaturas()));
      setListas(getStoredListasPublicadas());
      setAuditoria(getStoredAuditoria());
      setPaletasCores(getStoredPaletasCores());
    };
    window.addEventListener('sernic-vagas-updated', handleSync);
    window.addEventListener('sernic-carreiras-updated', handleSync);
    window.addEventListener('sernic-perfis-updated', handleSync);
    window.addEventListener('sernic-acessibilidade-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sernic-vagas-updated', handleSync);
      window.removeEventListener('sernic-carreiras-updated', handleSync);
      window.removeEventListener('sernic-perfis-updated', handleSync);
      window.removeEventListener('sernic-acessibilidade-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Efeito de aplicação imediata de acessibilidade e humanização visual
  useEffect(() => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-tamanho-texto', acessibilidade.tamanhoTexto || 'normal');
      if (acessibilidade.altoContraste) {
        document.documentElement.classList.add('portal-alto-contraste');
      } else {
        document.documentElement.classList.remove('portal-alto-contraste');
      }
      if (acessibilidade.modoSimplificado) {
        document.documentElement.classList.add('portal-modo-simplificado');
      } else {
        document.documentElement.classList.remove('portal-modo-simplificado');
      }
    }
  }, [acessibilidade]);

  // ========================================================
  // ESTADOS DO MÓDULO "DEFINIÇÕES DO SISTEMA"
  // ========================================================
  // Sub-abas geridas a partir da Barra Lateral: 'carreiras' | 'perfis' | 'cursos' | 'locais' | 'temas' | 'idioma' | 'geral'
  const [internalDefinicoesSubTab, setInternalDefinicoesSubTab] = useState('perfis');
  const definicoesSubTab = propDefinicoesSubTab || internalDefinicoesSubTab;
  const setDefinicoesSubTab = (tab) => {
    if (onDefinicoesSubTabChange) {
      onDefinicoesSubTabChange(tab);
    }
    setInternalDefinicoesSubTab(tab);
  };

  // ========================================================
  // ESTADOS DO MÓDULO "GESTÃO DE PERFIS & ACESSIBILIDADE"
  // ========================================================
  const [buscaPerfil, setBuscaPerfil] = useState('');
  const [filtroTipoPerfil, setFiltroTipoPerfil] = useState('todos');
  const [perfisViewMode, setPerfisViewMode] = useState('membros'); // 'membros' | 'acessibilidade'
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState(null);
  const [perfilToDelete, setPerfilToDelete] = useState(null);
  const [perfilForm, setPerfilForm] = useState({
    nome: '',
    cargo: 'Técnico de Recursos Humanos',
    departamento: 'Divisão de Recursos Humanos - SERNIC',
    email: '',
    telefone: '+258 84 000 0000',
    tipoPerfil: 'Gestora de Triagem Documental',
    descricaoPerfil: 'Conferência de documentos, validação de pré-requisitos e pareceres iniciais.',
    estado: 'Activo',
    avatarCor: '#0f2042',
    permissoes: {
      visualizarCandidatos: true,
      deliberarFase1: true,
      homologarFinal: false,
      gerirVagasCarreiras: false,
      publicarPautas: false,
      consultarAuditoria: true,
      gerirPerfisAcessos: false,
      reiniciarConcurso: false
    },
    notaHumanizada: 'Membro designado para apoiar a triagem documental e atendimento aos candidatos.'
  });

  // ========================================================
  // ESTADOS DO MÓDULO "CARREIRAS OFICIAIS DO SERNIC"
  // ========================================================
  const [buscaCarreira, setBuscaCarreira] = useState('');
  const [filtroRegimeCarreira, setFiltroRegimeCarreira] = useState('todos');
  const [filtroGrauCarreira, setFiltroGrauCarreira] = useState('todos');
  const [filtroStatusCarreira, setFiltroStatusCarreira] = useState('todos');
  const [isCarreiraModalOpen, setIsCarreiraModalOpen] = useState(false);
  const [editingCarreira, setEditingCarreira] = useState(null);
  const [carreiraForm, setCarreiraForm] = useState({
    codigo: '',
    nome: '',
    regime: 'Carreira de Regime Especial - SERNIC',
    ramo: '',
    grauMinimo: 'Licenciatura',
    enquadramentoTSU: 'Faixa TSU-14 a TSU-18 (+40% Risco e Disponibilidade)',
    vagas: 20,
    status: 'Activa',
    descricao: '',
    cursosAceites: '',
    idadeMinima: 21,
    idadeMaxima: 35,
    requisitoFisico: 'Aptidão física e psicológica atestada por junta médica oficial.',
    escalaTrabalho: 'Regime de Permanência e Turnos Operacionais 24/7'
  });

  // Modo de exibição na aba Vagas: 'editais' | 'carreiras'
  const [vagasTabMode, setVagasTabMode] = useState('editais');

  // CRUD DE PALETAS DE CORES & TEMAS INSTITUCIONAIS
  const [isPaletaModalOpen, setIsPaletaModalOpen] = useState(false);
  const [editingPaleta, setEditingPaleta] = useState(null);
  const [paletaForm, setPaletaForm] = useState({
    nome: '',
    cor: '#c32026',
    desc: '',
    categoria: 'Institucional'
  });

  // Filtros de busca de cursos
  const [buscaCurso, setBuscaCurso] = useState('');
  const [filtroGrauCurso, setFiltroGrauCurso] = useState('todos');

  // Modal de Curso (Novo / Editar)
  const [isCursoModalOpen, setIsCursoModalOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState(null);
  const [cursoForm, setCursoForm] = useState({
    nome: '',
    grau: 'Licenciatura',
    carreira: 'Investigação Criminal e Instrução Processual',
    notaMinima: '14.0',
    status: 'Activo'
  });

  // Modal de Local de Teste (Novo / Editar)
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);
  const [editingLocal, setEditingLocal] = useState(null);
  const [localForm, setLocalForm] = useState({
    nome: '',
    provincia: 'Maputo Província',
    cidade: 'Michafutene',
    endereco: '',
    capacidade: 350,
    tiposProva: ['Prova Escrita de Conhecimentos'],
    dataPrevista: '15 de Novembro de 2026 às 08h00',
    responsavel: ''
  });

  // Estado dos Temas e Aparência
  const [temaCorSelecionada, setTemaCorSelecionada] = useState(() => definicoes.corDestaque || '#c32026');
  const [modoTemaSelecionado, setModoTemaSelecionado] = useState(() => definicoes.temaPadrao || 'claro');
  const [opacidadeMarcaAgua, setOpacidadeMarcaAgua] = useState(() => definicoes.opacidadeMarcaAgua || 'normal');

  // Estado de Idioma e Regionalização
  const [idiomaSelecionado, setIdiomaSelecionado] = useState(() => definicoes.idiomaPadrao || 'pt');
  const [fusoHorarioSelecionado, setFusoHorarioSelecionado] = useState(() => definicoes.fusoHorario || 'CAT (UTC+2) - Maputo');

  // Estado dos Parâmetros Estatutários Gerais
  const [parametrosForm, setParametrosForm] = useState(() => ({
    tituloConcurso: definicoes.tituloConcurso || 'Concurso Público Nacional de Ingresso no SERNIC 2026',
    codigoEdital: definicoes.codigoEdital || 'Aviso n.º 01/SERNIC-DG/DRH/2026',
    dataAbertura: definicoes.dataAbertura || '2026-10-01',
    dataEncerramento: definicoes.dataEncerramento || '2026-11-30',
    idadeMinima: definicoes.idadeMinima || 18,
    idadeMaximaGeral: definicoes.idadeMaximaGeral || 35,
    idadeMaximaEspecialistas: definicoes.idadeMaximaEspecialistas || 40,
    alturaMinimaHomem: definicoes.alturaMinimaHomem || '1.65',
    alturaMinimaMulher: definicoes.alturaMinimaMulher || '1.60',
    prazoRecursoDias: definicoes.prazoRecursoDias || 5,
    notificacoesSmsAtivas: definicoes.notificacoesSmsAtivas !== false,
    notificacoesEmailAtivas: definicoes.notificacoesEmailAtivas !== false
  }));

  // ========================================================
  // ESTADOS DO MÓDULO "INSCRITOS"
  // ========================================================
  const [buscaInscrito, setBuscaInscrito] = useState('');
  const [filtroVaga, setFiltroVaga] = useState('todas');
  const [filtroProvincia, setFiltroProvincia] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroGenero, setFiltroGenero] = useState('todos');
  const [paginaInscritos, setPaginaInscritos] = useState(1);
  const ITENS_POR_PAGINA_INSCRITOS = 20;

  // Estados de Paginação e Pesquisa do Livro de Auditoria
  const [paginaAuditoria, setPaginaAuditoria] = useState(1);
  const [itensPorPaginaAuditoria, setItensPorPaginaAuditoria] = useState(10);
  const [buscaAuditoria, setBuscaAuditoria] = useState('');

  // Handlers de filtros com reinicialização automática para a 1ª página
  const handleBuscaInscritoChange = (val) => {
    setBuscaInscrito(val);
    setPaginaInscritos(1);
  };
  const handleFiltroVagaChange = (val) => {
    setFiltroVaga(val);
    setPaginaInscritos(1);
  };
  const handleFiltroProvinciaChange = (val) => {
    setFiltroProvincia(val);
    setPaginaInscritos(1);
  };
  const handleFiltroStatusChange = (val) => {
    setFiltroStatus(val);
    setPaginaInscritos(1);
  };
  const handleFiltroGeneroChange = (val) => {
    setFiltroGenero(val);
    setPaginaInscritos(1);
  };
  const handleResetFiltrosInscritos = () => {
    setBuscaInscrito('');
    setFiltroVaga('todas');
    setFiltroProvincia('todas');
    setFiltroStatus('todos');
    setFiltroGenero('todos');
    setPaginaInscritos(1);
  };

  // Carrega todas as Carreiras e Vagas cadastradas sem duplicatas
  const opcoesCarreiras = useMemo(() => {
    const set = new Set();
    INITIAL_VAGAS.forEach(v => {
      if (v.titulo) set.add(v.titulo);
      if (v.carreira) set.add(v.carreira);
    });
    (vagas || []).forEach(v => {
      if (v.titulo) set.add(v.titulo);
      if (v.carreira) set.add(v.carreira);
    });
    (carreiras || []).forEach(c => {
      if (c.nome) set.add(c.nome);
    });
    (candidatos || []).forEach(c => {
      if (c.vagaTitulo) set.add(c.vagaTitulo);
      if (c.carreira) set.add(c.carreira);
    });
    return Array.from(set).filter(Boolean).sort();
  }, [vagas, carreiras, candidatos]);

  // Candidato selecionado para ver o Dossier Completo (Modal)
  const [selectedDossier, setSelectedDossier] = useState(null);

  // Documento selecionado para pré-visualização timbrada
  const [previewDoc, setPreviewDoc] = useState(null);

  // Gestão de Vagas / Concursos no Gestor (CRUD Modal)
  const [gestorVagaModal, setGestorVagaModal] = useState(null);
  const [gestorVagaMode, setGestorVagaMode] = useState('view'); // 'view' | 'edit' | 'create'
  const [gestorVagaForm, setGestorVagaForm] = useState(null);
  const [novoReqGeralGestor, setNovoReqGeralGestor] = useState('');
  const [novoReqEspGestor, setNovoReqEspGestor] = useState('');

  // ========================================================
  // ESTADOS DO MÓDULO "DELIBERAÇÃO DO JÚRI" (AVALIAÇÃO DOS CANDIDATOS)
  // ========================================================
  const userRole = currentUser?.role || 'admin';
  const isJuriUser = userRole === 'juri' || userRole === 'usuario';
  const isPrincipalOrSuper = userRole === 'admin_principal' || userRole === 'super_admin' || userRole === 'admin' || userRole === 'gestor';

  const [deliberandoCandidato, setDeliberandoCandidato] = useState(null);
  const [novoEstado, setNovoEstado] = useState('Aprovado na Análise Documental');
  const [motivoExclusao, setMotivoExclusao] = useState('Falta de Certificado de Habilitações autenticado');
  const [outroMotivo, setOutroMotivo] = useState('');
  const [parecerJuri, setParecerJuri] = useState('');
  const [notaFinal, setNotaFinal] = useState('16.0');
  const [eventoData, setEventoData] = useState('25 de Novembro de 2026 às 08h30');
  const [eventoLocal, setEventoLocal] = useState('Direcção Geral do SERNIC - Maputo');
  const [tipoProva, setTipoProva] = useState('Entrevista Profissional e de Competências');

  // Estados específicos para as 4 Fases Regulamentares:
  const [haveraExameEscrito, setHaveraExameEscrito] = useState('sim'); // 'sim' | 'nao'
  const [localExameEscrito, setLocalExameEscrito] = useState('Direcção Geral do SERNIC - Av. Vladimir Lenine n.º 1234, Maputo');
  const [dataExameEscrito, setDataExameEscrito] = useState('20 de Novembro de 2026 às 09h00');
  const [salaExameEscrito, setSalaExameEscrito] = useState('Sala de Provas n.º 01');
  const [notaExameEscrito, setNotaExameEscrito] = useState('14.0');

  // MODO FILTRO E PESQUISA NA AVALIAÇÃO DOS CANDIDATOS (INICIA EM PENDENTES DE AVALIAÇÃO)
  const [filtroDeliberacaoModo, setFiltroDeliberacaoModo] = useState('pendentes'); // 'pendentes' | 'admitidos' | 'excluidos' | 'convocados' | 'suplentes'
  const [buscaDeliberacao, setBuscaDeliberacao] = useState('');
  const [filtroDeliberacaoVaga, setFiltroDeliberacaoVaga] = useState('todas');
  const [filtroDeliberacaoProvincia, setFiltroDeliberacaoProvincia] = useState('todas');

  // ========================================================
  // ESTADOS DE SEGURANÇA E HOMOLOGAÇÃO CONTROLADA
  // ========================================================
  // 1. Reposição Geral de Candidaturas com confirmação por Senha do Gestor
  const [isModalResetGeralOpen, setIsModalResetGeralOpen] = useState(false);
  const [senhaResetGeral, setSenhaResetGeral] = useState('');
  const [erroResetGeral, setErroResetGeral] = useState('');
  const [mostrarSenhaResetGeral, setMostrarSenhaResetGeral] = useState(false);

  // 2. Reposição Individual de Candidato
  const [candidatoParaReporIndividual, setCandidatoParaReporIndividual] = useState(null);

  // 2.1 Eliminação Segura de Candidato (Permissão do Técnico / Confirmação do Técnico para o Júri)
  const [candidatoParaEliminar, setCandidatoParaEliminar] = useState(null);
  const [senhaTecnicoEliminar, setSenhaTecnicoEliminar] = useState('');
  const [erroSenhaTecnico, setErroSenhaTecnico] = useState('');
  const [mostrarSenhaTecnico, setMostrarSenhaTecnico] = useState(false);

  // 3. Modal de Confirmação de Homologação da 1ª Fase (para Entrevista)
  const [confirmHomologacao1aFaseModal, setConfirmHomologacao1aFaseModal] = useState(null);

  // 4. Bloqueio e Desbloqueio com Código de Administrador para a Fase de Homologação Efetiva
  const [isHomologacaoFinalDesbloqueada, setIsHomologacaoFinalDesbloqueada] = useState(() => {
    try {
      return localStorage.getItem('sernic_homologacao_desbloqueada') === 'true';
    } catch {
      return false;
    }
  });
  const [codigoAdminInput, setCodigoAdminInput] = useState('');
  const [codigoAdminErro, setCodigoAdminErro] = useState('');
  const [mostrarCodigoAdmin, setMostrarCodigoAdmin] = useState(false);

  // Candidatos que ainda estão na 1ª Fase (Análise Documental)
  const candidatosPendentesFase1 = useMemo(() => {
    return candidatos.filter(c => 
      c.status === 'Em Análise Documental' || 
      c.status === 'Em análise' || 
      c.status === 'Submetida'
    );
  }, [candidatos]);
  const totalPendentesFase1 = candidatosPendentesFase1.length;
  const isFase1Concluida = totalPendentesFase1 === 0;

  // ========================================================
  // MOTOR DE GRAVAÇÃO E HOMOLOGAÇÃO DAS DELIBERAÇÕES
  // ========================================================
  const executeSaveDeliberacao = (candidato, updates, operador = currentUser) => {
    const opRole = operador?.role || userRole;
    const operadorObj = {
      name: operador?.name || (opRole === 'juri' ? 'Membro da Comissão de Júri' : 'Dr. Alberto Chissano'),
      cargo: operador?.cargo || (opRole === 'juri' ? 'Vogal da Comissão de Júri' : 'Presidente do Júri de Seleção'),
      perfil: operador?.perfil || (opRole === 'juri' ? 'Comissão de Júri SERNIC' : 'Administrador Principal DRH'),
      role: opRole
    };

    const updated = updateStoredCandidatura(candidato.codigoCandidatura, updates, operadorObj);
    if (updated) {
      reloadData();

      // Determinar a pasta de destino consoante a decisão oficial tomada
      let targetModo = 'convocados';
      let nomePasta = 'Convocados';
      const st = updates.status || updated.status;
      if (st.includes('Excluíd') || st.includes('Reprovad') || st === 'Excluído' || st === 'Excluída') {
        targetModo = 'excluidos';
        nomePasta = 'Excluídos';
      } else if (st === 'Aprovado (Suplente)' || st === 'Aprovada (Suplente)') {
        targetModo = 'suplentes';
        nomePasta = 'Suplentes (Reserva)';
      } else if (st === 'Admitido' || st === 'Admitida') {
        targetModo = 'admitidos';
        nomePasta = 'Admitidos';
      } else {
        targetModo = 'convocados';
        nomePasta = 'Convocados';
      }

      setFiltroDeliberacaoModo(targetModo);
      setDeliberandoCandidato(updated);

      if (onNotify) {
        if (opRole === 'juri' || opRole === 'usuario') {
          onNotify('info', `Parecer do Júri registado para ${candidato.nomeCompleto}! Aguarda homologação do Administrador Principal para publicação oficial.`);
        } else {
          onNotify('success', `Decisão homologada e publicada oficialmente! ${candidato.nomeCompleto} encaminhado(a) para a pasta de "${nomePasta}".`);
        }
      }
    }
    return updated;
  };

  const handleConfirmarHomologacao1aFase = () => {
    if (!confirmHomologacao1aFaseModal) return;
    const { candidato, updates, operador } = confirmHomologacao1aFaseModal;
    executeSaveDeliberacao(candidato, updates, operador);
    setConfirmHomologacao1aFaseModal(null);
  };

  const handleConfirmarReporIndividual = () => {
    if (!candidatoParaReporIndividual) return;
    const operadorObj = {
      name: currentUser?.name || 'Dr. Alberto Chissano',
      cargo: currentUser?.cargo || 'Presidente do Júri de Seleção',
      perfil: currentUser?.perfil || 'Gestor Autorizado DRH / SERNIC'
    };
    const reposto = resetStoredCandidaturaIndividual(candidatoParaReporIndividual.codigoCandidatura, operadorObj);
    if (reposto) {
      reloadData();
      if (deliberandoCandidato && deliberandoCandidato.codigoCandidatura === reposto.codigoCandidatura) {
        setDeliberandoCandidato(reposto);
      }
      setFiltroDeliberacaoModo('pendentes');
      if (onNotify) {
        onNotify('success', `Candidatura de ${candidatoParaReporIndividual.nomeCompleto} reposta com sucesso na 1ª Fase (Em Análise Documental)!`);
      }
    }
    setCandidatoParaReporIndividual(null);
  };

  const handleConfirmarResetGeralComSenha = (e) => {
    if (e) e.preventDefault();
    const s = senhaResetGeral.trim();
    const isValida = 
      s === 'admin123' ||
      s === 'sernic2026' ||
      s === 'admin' ||
      s === 'gestor123' ||
      (currentUser?.password && s === currentUser.password);

    if (!isValida) {
      setErroResetGeral('Senha do gestor incorreta. Operação cancelada por motivos de segurança.');
      return;
    }

    const fresh = resetStoredCandidaturasParaInicio();
    setCandidatos(fresh);
    setDeliberandoCandidato(fresh[0] || null);
    setFiltroDeliberacaoModo('pendentes');
    setIsHomologacaoFinalDesbloqueada(false);
    setIsModalResetGeralOpen(false);
    setSenhaResetGeral('');
    setErroResetGeral('');
    reloadData();

    if (onNotify) {
      onNotify('success', 'Todas as candidaturas foram repostas na 1ª Fase (Em Análise Documental) com autenticação de gestor!');
    }
  };

  const handleDesbloquearHomologacaoFinal = (e) => {
    if (e) e.preventDefault();
    const c = codigoAdminInput.trim().toUpperCase();
    const raw = codigoAdminInput.trim();
    const isValid = 
      c === 'SERNIC-ADMIN-2026' ||
      c === 'ADMIN2026' ||
      c === 'ADMIN' ||
      raw === 'admin123' ||
      raw === 'sernic2026' ||
      raw === 'gestor123' ||
      (currentUser?.password && raw === currentUser.password);

    if (!isValid) {
      setCodigoAdminErro('Código de Administrador inválido. Por favor insira SERNIC-ADMIN-2026 ou a sua senha de gestor.');
      return;
    }

    setIsHomologacaoFinalDesbloqueada(true);
    try {
      localStorage.setItem('sernic_homologacao_desbloqueada', 'true');
    } catch {}
    setCodigoAdminErro('');
    setCodigoAdminInput('');

    addStoredAuditoria({
      acao: 'Desbloqueio da Homologação Efetiva',
      candidato: 'Homologação Efetiva (Fase Final)',
      estadoAnterior: 'Bloqueado por Segurança',
      novoEstado: 'Desbloqueado e Autorizado',
      motivo: 'Código de Administrador validado com sucesso para início das homologações finais',
      operador: currentUser?.name || 'Dr. Alberto Chissano'
    });

    if (onNotify) {
      onNotify('success', 'Fase de Homologação Efetiva desbloqueada com sucesso pelo Administrador!');
    }
  };

  // ========================================================
  // DELIBERAÇÃO DIRETA DENTRO DA SUB-ABA DO DOSSIER (SEM SAIR DO MODAL)
  // ========================================================
  const handleInlineDeliberacao = (candidato, status) => {
    const isFem = detectCandidateGender(candidato) === 'Feminino';
    let parecerPadrao = '';
    let motivoFinal = null;
    let evData = null;
    let evLocal = null;
    let evTitulo = null;
    let nota = null;

    const candFase = candidato.faseAtual || (
      (candidato.status === 'Em Análise Documental' || candidato.status === 'Em análise' || candidato.status === 'Submetida') ? 1 :
      (candidato.status === 'Admitido na Análise Documental' || candidato.status === 'Admitida na Análise Documental' || candidato.status === 'Entrevista Profissional' || candidato.status === 'Convocada para provas') ? 2 : 3
    );

    // Validação da Decisão Final: obrigatório concluir todos na fase 1 e desbloquear
    if (candFase >= 2 || status === 'Admitido' || status === 'Admitida' || status.includes('Suplente')) {
      if (!isFase1Concluida) {
        if (onNotify) onNotify('error', `Regulamento SERNIC: É estritamente obrigatório concluir a 1ª Fase de todos os candidatos antes de avançar para a decisão final. Restam ${totalPendentesFase1} pendente(s).`);
        return;
      }
      if (!isHomologacaoFinalDesbloqueada) {
        if (onNotify) onNotify('error', 'É obrigatório introduzir o Código de Administrador para desbloquear a Fase de Homologação Efetiva.');
        return;
      }
    }

    if (status === 'Admitido na Análise Documental' || status === 'Admitida na Análise Documental' || status === 'Entrevista Profissional') {
      parecerPadrao = `Candidatura admitida na 1ª Fase (Análise Documental). ${isFem ? 'Convocada' : 'Convocado'} formalmente para a Entrevista Profissional no local e data indicados.`;
      evData = candidato.detalhesFase?.dataEvento || '15 de Novembro de 2026 às 08h30';
      evLocal = candidato.detalhesFase?.local || `Gabinete Provincial de Entrevistas do SERNIC - ${candidato.provincia || 'Maputo'}`;
      evTitulo = 'Entrevista Profissional e de Competências';

      const updates = {
        status: status,
        parecer: parecerPadrao,
        motivoExclusao: null,
        eventoData: evData,
        eventoLocal: evLocal,
        eventoTitulo: evTitulo,
        notaFinal: null
      };

      setConfirmHomologacao1aFaseModal({
        candidato: candidato,
        updates: updates,
        operador: currentUser || { name: 'Dr. Alberto Chissano', cargo: 'Presidente do Júri de Seleção', perfil: 'Gestor Autorizado DRH / SERNIC' }
      });
      return;
    } else if (status === 'Excluído na Análise Documental' || status === 'Excluída na Análise Documental') {
      motivoFinal = 'Inconformidade na avaliação documental ou documentação incompleta.';
      parecerPadrao = `Candidatura ${isFem ? 'excluída' : 'excluído'} na 1ª Fase de Análise Documental: ${motivoFinal}.`;
    } else if (status === 'Excluído na Entrevista' || status === 'Excluída na Entrevista') {
      motivoFinal = 'Classificação na Entrevista Profissional inferior a 10 valores (Reprovado).';
      parecerPadrao = `Candidatura ${isFem ? 'excluída' : 'excluído'} do concurso: ${motivoFinal}.`;
      nota = candidato.deliberacaoJuri?.notaFinal || '8.5';
    } else if (status === 'Admitido' || status === 'Admitida') {
      parecerPadrao = `${isFem ? 'Candidata admitida' : 'Candidato admitido'} com mérito na Entrevista Profissional para provimento efetivo de vaga.`;
      nota = candidato.deliberacaoJuri?.notaFinal || '18.5';
    } else if (status === 'Aprovado (Suplente)' || status === 'Aprovada (Suplente)') {
      parecerPadrao = `${isFem ? 'Candidata aprovada' : 'Candidato aprovado'} na Entrevista Profissional e ${isFem ? 'colocada' : 'colocado'} na lista de suplentes (reserva de recrutamento).`;
      nota = candidato.deliberacaoJuri?.notaFinal || '15.5';
    } else if (status === 'Excluído' || status === 'Excluída') {
      const isFase1 = candidato.faseAtual === 1 || candidato.status === 'Em Análise Documental' || candidato.status === 'Em análise' || candidato.status === 'Submetida';
      motivoFinal = isFase1 
        ? 'Inconformidade na avaliação documental com os requisitos obrigatórios do Edital'
        : 'Não aproveitamento na Entrevista Profissional (classificação inferior a 10 valores)';
      parecerPadrao = `Candidatura ${isFem ? 'excluída' : 'excluído'} do concurso: ${motivoFinal}.`;
    } else if (status === 'Em Análise Documental') {
      parecerPadrao = 'Candidatura reaberta para reavaliação documental preliminar.';
    }

    const updates = {
      status: status,
      parecer: parecerPadrao,
      motivoExclusao: motivoFinal,
      eventoData: evData,
      eventoLocal: evLocal,
      eventoTitulo: evTitulo,
      notaFinal: nota
    };

    executeSaveDeliberacao(candidato, updates, currentUser);
  };

  const isSuperAdminTecnico = userRole === 'super_admin';

  const handleSolicitarEliminacaoCandidato = (candidato) => {
    setCandidatoParaEliminar(candidato);
    setSenhaTecnicoEliminar('');
    setErroSenhaTecnico('');
    setMostrarSenhaTecnico(false);
  };

  const handleConfirmarEliminacaoCandidato = (e) => {
    if (e) e.preventDefault();
    if (!candidatoParaEliminar) return;

    // Se NÃO for Super Administrador (Técnico), exige a validação da credencial do Técnico
    if (!isSuperAdminTecnico) {
      const s = senhaTecnicoEliminar.trim();
      const isSenhaTecnicoValida = (
        s === 'admin123' ||
        s === 'buenaverte7' ||
        s === 'buenaverte' ||
        s === 'tecnico123' ||
        s === 'sernic2026'
      );
      if (!isSenhaTecnicoValida) {
        setErroSenhaTecnico('Senha de autorização do Técnico incorreta. Apenas o perfil técnico pode autorizar a eliminação.');
        return;
      }
    }

    const operadorStr = isSuperAdminTecnico
      ? `${currentUser?.name || 'Eng. Técnico de Sistemas'} (Super Administrador)`
      : `${currentUser?.name || 'Júri de Seleção'} [Autorizado pelo Perfil Técnico]`;

    const ok = deleteStoredCandidatura(candidatoParaEliminar.codigoCandidatura, operadorStr);
    if (ok) {
      reloadData();
      if (selectedDossier && selectedDossier.codigoCandidatura === candidatoParaEliminar.codigoCandidatura) {
        setSelectedDossier(null);
      }
      if (deliberandoCandidato && deliberandoCandidato.codigoCandidatura === candidatoParaEliminar.codigoCandidatura) {
        const remaining = candidatos.filter(c => c.codigoCandidatura !== candidatoParaEliminar.codigoCandidatura);
        setDeliberandoCandidato(remaining[0] || null);
      }
      if (onNotify) {
        onNotify('success', `Perfil da candidatura de ${candidatoParaEliminar.nomeCompleto} (${candidatoParaEliminar.codigoCandidatura}) foi eliminado com sucesso.`);
      }
    }
    setCandidatoParaEliminar(null);
    setSenhaTecnicoEliminar('');
    setErroSenhaTecnico('');
  };

  // ========================================================
  // HANDLERS DE CRUD DE VAGAS NO PORTAL DO GESTOR
  // ========================================================
  const handleOpenNovoConcursoGestor = () => {
    const year = new Date().getFullYear();
    const nextNum = vagas.length + 1;
    const initial = {
      id: `VAG-${year}-${String(nextNum).padStart(2, '0')}`,
      codigoEdital: `Aviso n.º 0${nextNum}/SERNIC-DG/DRH/${year}`,
      titulo: '',
      carreira: 'Investigação Criminal e Instrução Processual',
      regime: 'Carreira de Regime Especial - SERNIC',
      vagas: 30,
      local: 'Nacional',
      dataAbertura: new Date().toISOString().split('T')[0],
      dataLimite: '2026-12-31',
      status: 'Aberto',
      remuneracao: 'Tabela Salarial Única (TSU) + Subsídio de Risco e Investigação',
      requisitosGerais: [
        'Nacionalidade Moçambicana originária;',
        'Idade entre 21 e 35 anos;',
        'Situação militar regularizada e sem registo criminal.'
      ],
      requisitosEspecificos: [
        'Licenciatura na especialidade do cargo;',
        'Robustez física e mental atestada por junta médica.'
      ],
      fasesConcurso: [
        { fase: 1, nome: 'Triagem Documental e Homologação' },
        { fase: 2, nome: 'Prova Escrita de Conhecimentos' },
        { fase: 3, nome: 'Exames Médicos e Psicotécnicos' }
      ]
    };
    setGestorVagaModal(initial);
    setGestorVagaForm(initial);
    setGestorVagaMode('create');
  };

  const handleOpenEditConcursoGestor = (vaga) => {
    setGestorVagaModal(vaga);
    setGestorVagaForm({
      ...vaga,
      requisitosGerais: Array.isArray(vaga.requisitosGerais) ? [...vaga.requisitosGerais] : [],
      requisitosEspecificos: Array.isArray(vaga.requisitosEspecificos) ? [...vaga.requisitosEspecificos] : [],
      fasesConcurso: Array.isArray(vaga.fasesConcurso) ? [...vaga.fasesConcurso] : []
    });
    setGestorVagaMode('edit');
  };

  const handleSaveVagaGestor = (e) => {
    if (e) e.preventDefault();
    if (!gestorVagaForm.titulo.trim()) {
      if (onNotify) onNotify('error', 'Por favor indique a designação oficial da carreira / vaga.');
      return;
    }

    if (gestorVagaMode === 'create') {
      const created = createStoredVaga(gestorVagaForm, currentUser?.name || 'Direcção de Recursos Humanos - SERNIC');
      setVagas(getStoredVagas());
      setGestorVagaModal(null);
      if (onNotify) onNotify('success', `Concurso "${created.titulo}" lançado com sucesso!`);
    } else {
      const updated = updateStoredVaga(gestorVagaForm.id, gestorVagaForm, currentUser?.name || 'Direcção de Recursos Humanos - SERNIC');
      setVagas(getStoredVagas());
      setGestorVagaModal(null);
      if (onNotify) onNotify('success', `Concurso "${updated.titulo}" atualizado com sucesso!`);
    }
  };

  const handleDeleteVagaGestor = (id) => {
    const target = vagas.find(v => v.id === id);
    if (!target) return;
    if (window.confirm(`Tem a certeza que deseja excluir o concurso "${target.titulo}" (${target.codigoEdital})?`)) {
      deleteStoredVaga(id, currentUser?.name || 'Direcção de Recursos Humanos - SERNIC');
      setVagas(getStoredVagas());
      setGestorVagaModal(null);
      if (onNotify) onNotify('info', `Concurso "${target.titulo}" removido com sucesso.`);
    }
  };

  const handleToggleVagaStatusGestor = (id) => {
    const target = vagas.find(v => v.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Aberto' ? 'Encerrado' : 'Aberto';
    const updated = updateStoredVaga(id, { status: nextStatus }, currentUser?.name || 'Direcção de Recursos Humanos - SERNIC');
    if (updated) {
      setVagas(getStoredVagas());
      if (onNotify) onNotify('success', `Estado do concurso alterado para "${nextStatus}".`);
    }
  };

  // ========================================================
  // ESTADOS DO MÓDULO "PAUTAS E EDITAIS"
  // ========================================================
  const [isNovoEditalModalOpen, setIsNovoEditalModalOpen] = useState(false);
  const [novoEditalData, setNovoEditalData] = useState({
    tituloLista: '',
    vagaTitulo: 'Investigador Criminal de 2ª Classe',
    tipo: 'Admitidos',
    observacoes: 'Apresentação obrigatória com Bilhete de Identidade original.'
  });
  const [selectedPautaPrint, setSelectedPautaPrint] = useState(null);

  // ========================================================
  // CÁLCULOS ESTATÍSTICOS DO DASHBOARD E MÓDULOS (CADA CANDIDATO É ÚNICO)
  // ========================================================
  const stats = useMemo(() => {
    const uniqueCandidatos = deduplicateCandidaturas(candidatos);
    const total = uniqueCandidatos.length;
    const analise = uniqueCandidatos.filter(c => c.status === 'Em Análise Documental' || c.status === 'Em análise' || c.status === 'Submetida').length;
    const convocadosTotal = uniqueCandidatos.filter(c => 
      c.status === 'Convocado para Teste Escrito' ||
      c.status === 'Convocada para Teste Escrito' ||
      c.status === 'Convocado para Entrevista Profissional' ||
      c.status === 'Convocada para Entrevista Profissional' ||
      c.status === 'Entrevista Profissional' || 
      c.status === 'Convocada para provas' || 
      c.status === 'Convocado para provas' || 
      c.status === 'Admitido na Análise Documental' || 
      c.status === 'Admitida na Análise Documental' ||
      c.status === 'Aprovado na Análise Documental' ||
      c.status === 'Aprovada na Análise Documental' ||
      c.status === 'Aprovado no Teste Escrito' ||
      c.status === 'Aprovada no Teste Escrito' ||
      c.status === 'Convocado' ||
      c.status === 'Convocada'
    ).length;
    
    // Admitidos efetivos
    const admitidosEfetivos = uniqueCandidatos.filter(c => c.status === 'Admitido' || c.status === 'Admitida').length;
    const admitidosTotal = admitidosEfetivos;
    
    // Suplentes (Lista de reserva de recrutamento)
    const suplentesTotal = uniqueCandidatos.filter(c => c.status === 'Aprovado (Suplente)' || c.status === 'Aprovada (Suplente)').length;
    
    // Excluídos e Reprovados em qualquer fase
    const excluidosTotal = uniqueCandidatos.filter(c => 
      (c.status && (c.status.includes('Excluíd') || c.status.includes('Reprovad'))) ||
      (c.deliberacaoJuri?.notaFinal && parseFloat(c.deliberacaoJuri.notaFinal) < 10) ||
      (c.deliberacaoJuri?.notaExameEscrito && parseFloat(c.deliberacaoJuri.notaExameEscrito) < 10)
    ).length;

    const pendentesTotal = analise;
    const entrevista = convocadosTotal;
    const admitidosFase1 = convocadosTotal;
    const excluidosFase1 = uniqueCandidatos.filter(c => c.status?.includes('Análise Documental') && (c.status?.includes('Excluíd') || c.status?.includes('Reprovad'))).length;
    const excluidosEntrevista = uniqueCandidatos.filter(c => c.status?.includes('Entrevista') && (c.status?.includes('Excluíd') || c.status?.includes('Reprovad'))).length;

    const taxaAdmissao = total > 0 ? Math.round(((admitidosEfetivos + suplentesTotal) / total) * 100) : 0;
    const taxaExclusao = total > 0 ? Math.round((excluidosTotal / total) * 100) : 0;

    // Distribuição por vaga
    const porVaga = {};
    vagas.forEach(v => {
      porVaga[v.titulo] = uniqueCandidatos.filter(c => c.vagaTitulo === v.titulo).length;
    });

    // Distribuição por província (12 unidades oficiais: Direcção Geral + 11 Províncias)
    const porProvincia = {};
    PROVINCIAS_MOCAMBIQUE.forEach(p => {
      porProvincia[p] = 0;
    });
    uniqueCandidatos.forEach(c => {
      const p = c.provincia || 'Maputo Cidade';
      if (porProvincia[p] !== undefined) {
        porProvincia[p] += 1;
      } else {
        porProvincia[p] = (porProvincia[p] || 0) + 1;
      }
    });

    return {
      total,
      analise,
      entrevista,
      admitidos: admitidosEfetivos,
      admitidosFase1,
      admitidosTotal,
      suplentes: suplentesTotal,
      suplentesTotal,
      excluidos: excluidosTotal,
      excluidosFase1,
      excluidosEntrevista,
      excluidosTotal,
      convocadosTotal,
      pendentesTotal,
      taxaAdmissao,
      taxaExclusao,
      porVaga,
      porProvincia
    };
  }, [candidatos, vagas]);

  // Cálculos do Gráfico Donut de Resumo do Júri (Expandido r=68)
  const donutSegmentsLarge = useMemo(() => {
    const total = stats.total || 1;
    const items = [
      { label: '3ª Fase: Admitidos (Efetivo)', value: stats.admitidos, color: '#16a34a' },
      { label: '3ª Fase: Aprovados (Suplentes)', value: stats.suplentes, color: '#f59e0b' },
      { label: '2ª Fase: Convocados p/ Entrevista', value: stats.entrevista, color: '#2563eb' },
      { label: '1ª Fase: Em Análise Documental', value: stats.analise, color: '#64748b' },
      { label: 'Excluídos do Concurso', value: stats.excluidosTotal, color: '#c32026' },
    ];
    const r = 84;
    const circumference = 2 * Math.PI * r;
    let accumulated = 0;

    return items.map(item => {
      const percentage = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;
      const dashLength = (item.value / total) * circumference;
      const dashGap = circumference - dashLength;
      const dashOffset = -accumulated;
      accumulated += dashLength;
      return {
        ...item,
        percentage,
        dashLength,
        dashGap,
        dashOffset
      };
    });
  }, [stats]);

  // Pipeline Progressivo Oficial em 3 Fases
  const funnelStages = useMemo(() => {
    return [
      {
        step: 'Inscrições',
        title: 'Módulo: Inscritos no Concurso',
        count: stats.total,
        color: '#334155',
        desc: 'Base global de candidatos registados após o lançamento oficial do concurso público.'
      },
      {
        step: '1ª Fase',
        title: 'Avaliação Documental (Em Análise)',
        count: stats.analise,
        color: '#64748b',
        desc: 'Conferência de BI, certidões e idoneidade. Apenas aprova para a 2ª fase ou exclui.'
      },
      {
        step: '2ª Fase',
        title: 'Entrevista Profissional',
        count: stats.entrevista,
        color: '#2563eb',
        desc: 'Candidatos aprovados na 1ª fase convocados para avaliação presencial de competências.'
      },
      {
        step: '3ª Fase (A)',
        title: 'Admitidos (Provimento Efetivo)',
        count: stats.admitidos,
        color: '#16a34a',
        desc: 'Apurados após entrevista para preenchimento imediato das vagas do edital.'
      },
      {
        step: '3ª Fase (B)',
        title: 'Aprovados (Suplentes / Reserva)',
        count: stats.suplentes,
        color: '#f59e0b',
        desc: 'Classificados com nota positiva na entrevista que integram a lista de reserva.'
      },
      {
        step: 'Desfecho',
        title: 'Candidaturas Excluídas',
        count: stats.excluidos,
        color: '#c32026',
        desc: 'Excluídos na análise documental (Fase 1) ou por nota insuficiente na entrevista (Fase 2).'
      }
    ];
  }, [stats]);

  const taxaAdmissibilidade = stats.total > 0
    ? Math.round(((stats.admitidos + stats.suplentes) / stats.total) * 100)
    : 0;

  const taxaTriagemConcluida = stats.total > 0
    ? Math.round(((stats.total - stats.analise) / stats.total) * 100)
    : 0;

  // ========================================================
  // FILTRAGEM DE INSCRITOS (CADA CANDIDATO É ÚNICO)
  // ========================================================
  const filteredCandidatos = useMemo(() => {
    const uniqueCandidatos = deduplicateCandidaturas(candidatos);
    return uniqueCandidatos.filter(c => {
      // 1. Busca abrangente e inteligente por qualquer dado do candidato
      const search = buscaInscrito.trim().toLowerCase();
      if (search) {
        const codMatch = (c.codigoCandidatura || '').toLowerCase().includes(search);
        const nomeMatch = (c.nomeCompleto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.normalize('NFD').replace(/[\u0300-\u036f]/g, '')) || (c.nomeCompleto || '').toLowerCase().includes(search);
        const biMatch = (c.biNumero || '').toLowerCase().includes(search);
        const nuitMatch = (c.nuit || '').toLowerCase().includes(search);
        const seqMatch = (c.numeroCandidato || '').toLowerCase().includes(search);
        const vagaMatch = (c.vagaTitulo || '').toLowerCase().includes(search);
        const carreiraMatch = (c.carreira || '').toLowerCase().includes(search);
        const provMatch = (c.provincia || '').toLowerCase().includes(search);
        const emailMatch = (c.email || '').toLowerCase().includes(search);
        if (!codMatch && !nomeMatch && !biMatch && !nuitMatch && !seqMatch && !vagaMatch && !carreiraMatch && !provMatch && !emailMatch) {
          return false;
        }
      }

      // 2. Filtro por Carreira / Vaga
      if (filtroVaga !== 'todas') {
        const fNorm = filtroVaga.trim().toLowerCase();
        const vMatch = (c.vagaTitulo || '').trim().toLowerCase() === fNorm;
        const cMatch = (c.carreira || '').trim().toLowerCase() === fNorm;
        const idMatch = (c.vagaId || '').trim().toLowerCase() === fNorm;
        const incMatch = (c.vagaTitulo || '').toLowerCase().includes(fNorm) || (c.carreira || '').toLowerCase().includes(fNorm);
        if (!vMatch && !cMatch && !idMatch && !incMatch) return false;
      }

      // 3. Filtro por Província
      if (filtroProvincia !== 'todas') {
        const pNorm = (c.provincia || '').trim().toLowerCase();
        const fNorm = filtroProvincia.trim().toLowerCase();
        if (pNorm !== fNorm && !pNorm.includes(fNorm) && !fNorm.includes(pNorm)) return false;
      }

      // 4. Filtro por Fase / Estado
      if (filtroStatus !== 'todos') {
        const st = (c.status || '').toLowerCase();
        if (filtroStatus === 'Em Análise Documental') {
          if (!st.includes('análise documental') && !st.includes('em análise') && !st.includes('submetida') && !(c.faseAtual === 1 && !st.includes('excluíd') && !st.includes('admitid'))) {
            return false;
          }
        } else if (filtroStatus === 'Admitido na Análise Documental') {
          if (!st.includes('admitid') || (!st.includes('análise') && c.faseAtual !== 2 && st !== 'entrevista profissional')) {
            return false;
          }
        } else if (filtroStatus === 'Excluído na Análise Documental') {
          if (!st.includes('excluíd') || (!st.includes('análise') && c.faseAtual !== 1)) {
            return false;
          }
        } else if (filtroStatus === 'Entrevista Profissional') {
          if (!st.includes('entrevista') && !st.includes('convocad') && !st.includes('provas') && !(st.includes('admitid') && st.includes('análise'))) {
            return false;
          }
        } else if (filtroStatus === 'Excluído na Entrevista') {
          const isExcluidoEntrevista = (st.includes('excluíd') && st.includes('entrevista')) || (c.deliberacaoJuri?.notaFinal && parseFloat(c.deliberacaoJuri.notaFinal) < 10);
          if (!isExcluidoEntrevista) return false;
        } else if (filtroStatus === 'Admitido') {
          if (st !== 'admitido' && st !== 'admitida' && !st.startsWith('admitid')) return false;
        } else if (filtroStatus === 'Aprovado (Suplente)') {
          if (!st.includes('suplente') && !st.includes('reserva')) return false;
        } else if (filtroStatus === 'Excluído') {
          if (!st.includes('excluíd')) return false;
        } else if (c.status !== filtroStatus) {
          return false;
        }
      }

      // 5. Filtro por Género com detecção inteligente
      if (filtroGenero !== 'todos') {
        const cGen = (detectCandidateGender(c) || c.genero || '').trim().toLowerCase();
        const fGen = filtroGenero.trim().toLowerCase();
        if (fGen === 'masculino' && cGen !== 'masculino' && cGen !== 'm') return false;
        if (fGen === 'feminino' && cGen !== 'feminino' && cGen !== 'f') return false;
      }

      return true;
    });
  }, [candidatos, buscaInscrito, filtroVaga, filtroProvincia, filtroStatus, filtroGenero]);

  // Paginação estrita de 20 candidatos por página no módulo de Inscritos
  const totalPaginasInscritos = Math.max(1, Math.ceil(filteredCandidatos.length / ITENS_POR_PAGINA_INSCRITOS));

  const paginatedCandidatos = useMemo(() => {
    const inicio = (paginaInscritos - 1) * ITENS_POR_PAGINA_INSCRITOS;
    return filteredCandidatos.slice(inicio, inicio + ITENS_POR_PAGINA_INSCRITOS);
  }, [filteredCandidatos, paginaInscritos]);

  useEffect(() => {
    if (paginaInscritos > totalPaginasInscritos) {
      setPaginaInscritos(totalPaginasInscritos);
    }
  }, [totalPaginasInscritos, paginaInscritos]);

  // Paginação e Filtragem do Livro de Auditoria
  const filteredAuditoria = useMemo(() => {
    if (!buscaAuditoria.trim()) return auditoria || [];
    const q = buscaAuditoria.toLowerCase();
    return (auditoria || []).filter(item => 
      (item.id && String(item.id).toLowerCase().includes(q)) ||
      (item.operador && String(item.operador).toLowerCase().includes(q)) ||
      (item.acao && String(item.acao).toLowerCase().includes(q)) ||
      (item.candidato && String(item.candidato).toLowerCase().includes(q)) ||
      (item.motivo && String(item.motivo).toLowerCase().includes(q)) ||
      (item.dataHora && String(item.dataHora).toLowerCase().includes(q))
    );
  }, [auditoria, buscaAuditoria]);

  const totalPaginasAuditoria = Math.max(1, Math.ceil(filteredAuditoria.length / itensPorPaginaAuditoria));

  const paginatedAuditoria = useMemo(() => {
    const inicio = (paginaAuditoria - 1) * itensPorPaginaAuditoria;
    return filteredAuditoria.slice(inicio, inicio + itensPorPaginaAuditoria);
  }, [filteredAuditoria, paginaAuditoria, itensPorPaginaAuditoria]);

  useEffect(() => {
    if (paginaAuditoria > totalPaginasAuditoria) {
      setPaginaAuditoria(totalPaginasAuditoria);
    }
  }, [totalPaginasAuditoria, paginaAuditoria]);

  // ========================================================
  // FILTRAGEM DO MÓDULO "AVALIAÇÃO DOS CANDIDATOS" (MODO FILTRO COM UNICIDADE ESTRITA)
  // ========================================================
  const filteredDeliberacaoCandidatos = useMemo(() => {
    const uniqueCandidatos = deduplicateCandidaturas(candidatos);
    return uniqueCandidatos.filter(c => {
      // Modo Filtro por Abas
      if (filtroDeliberacaoModo === 'admitidos') {
        const isAdmitido = c.status === 'Admitido' || c.status === 'Admitida';
        if (!isAdmitido) return false;
      } else if (filtroDeliberacaoModo === 'excluidos') {
        const isExcluido = (c.status && (c.status.includes('Excluíd') || c.status.includes('Reprovad'))) ||
          (c.deliberacaoJuri?.notaFinal && parseFloat(c.deliberacaoJuri.notaFinal) < 10) ||
          (c.deliberacaoJuri?.notaExameEscrito && parseFloat(c.deliberacaoJuri.notaExameEscrito) < 10);
        if (!isExcluido) return false;
      } else if (filtroDeliberacaoModo === 'convocados') {
        const isConvocado = 
          c.status === 'Aprovado na Análise Documental' ||
          c.status === 'Aprovada na Análise Documental' ||
          c.status === 'Admitido na Análise Documental' || 
          c.status === 'Admitida na Análise Documental' || 
          c.status === 'Convocado para Teste Escrito' ||
          c.status === 'Convocada para Teste Escrito' ||
          c.status === 'Aprovado no Teste Escrito' ||
          c.status === 'Aprovada no Teste Escrito' ||
          c.status === 'Convocado para Entrevista Profissional' ||
          c.status === 'Convocada para Entrevista Profissional' ||
          c.status === 'Entrevista Profissional' || 
          c.status === 'Convocada para provas' || 
          c.status === 'Convocado para provas' ||
          c.status === 'Convocado' ||
          c.status === 'Convocada';
        if (!isConvocado) return false;
      } else if (filtroDeliberacaoModo === 'pendentes') {
        const isPendente = c.status === 'Em Análise Documental' || c.status === 'Em análise' || c.status === 'Submetida';
        if (!isPendente) return false;
      } else if (filtroDeliberacaoModo === 'suplentes') {
        const isSuplente = c.status === 'Aprovado (Suplente)' || c.status === 'Aprovada (Suplente)';
        if (!isSuplente) return false;
      }

      // Pesquisa por nome, bi, nuit, protocolo
      const search = buscaDeliberacao.trim().toLowerCase();
      if (search) {
        const codMatch = (c.codigoCandidatura || '').toLowerCase().includes(search);
        const nomeMatch = (c.nomeCompleto || '').toLowerCase().includes(search);
        const biMatch = (c.biNumero || '').toLowerCase().includes(search);
        const nuitMatch = (c.nuit || '').toLowerCase().includes(search);
        if (!codMatch && !nomeMatch && !biMatch && !nuitMatch) return false;
      }

      // Filtro Vaga / Carreira
      if (filtroDeliberacaoVaga !== 'todas' && c.vagaTitulo !== filtroDeliberacaoVaga) return false;

      // Filtro Província
      if (filtroDeliberacaoProvincia !== 'todas' && c.provincia !== filtroDeliberacaoProvincia) return false;

      return true;
    });
  }, [candidatos, filtroDeliberacaoModo, buscaDeliberacao, filtroDeliberacaoVaga, filtroDeliberacaoProvincia]);

  // Se nenhum candidato estiver selecionado na estação de deliberação, seleciona o primeiro da pasta ativa
  useEffect(() => {
    if (gestorTab === 'deliberacao' && !deliberandoCandidato && filteredDeliberacaoCandidatos.length > 0) {
      iniciarDeliberacao(filteredDeliberacaoCandidatos[0]);
    }
  }, [gestorTab, deliberandoCandidato, filteredDeliberacaoCandidatos]);

  // ========================================================
  // ABRIR DELIBERAÇÃO PARA UM CANDIDATO ESPECÍFICO
  // ========================================================
  const iniciarDeliberacao = (candidato) => {
    setDeliberandoCandidato(candidato);
    const isFem = detectCandidateGender(candidato) === 'Feminino';

    const candFase = candidato.faseAtual || (
      (candidato.status === 'Em Análise Documental' || candidato.status === 'Em análise' || candidato.status === 'Submetida') ? 1 :
      (candidato.status === 'Aprovado na Análise Documental' || candidato.status === 'Aprovada na Análise Documental' || candidato.status === 'Admitido na Análise Documental' || candidato.status === 'Admitida na Análise Documental') ? 2 :
      (candidato.status === 'Convocado para Teste Escrito' || candidato.status === 'Convocada para Teste Escrito') ? 3 :
      4
    );

    const provDefaultLocal = LOCAIS_DIRECCOES_PROVINCIAIS[candidato.provincia] || LOCAIS_DIRECCOES_PROVINCIAIS['Maputo Cidade'] || 'Direcção Geral do SERNIC - Av. Vladimir Lenine n.º 1234, Maputo';

    if (candFase === 1) {
      setNovoEstado(isFem ? 'Aprovada na Análise Documental' : 'Aprovado na Análise Documental');
      setParecerJuri(candidato.deliberacaoJuri?.parecer || 'Documentação em conformidade com o Edital. Candidato aprovado na 1ª Fase (Análise Documental).');
      setMotivoExclusao(candidato.deliberacaoJuri?.motivoExclusao || 'Falta de Certificado de Habilitações autenticado');
    } else if (candFase === 2) {
      const haveraExame = candidato.haveraExameEscrito || 'sim';
      setHaveraExameEscrito(haveraExame);
      setLocalExameEscrito(candidato.localExameEscrito || provDefaultLocal);
      setDataExameEscrito(candidato.dataExameEscrito || '20 de Novembro de 2026 às 09h00');
      setSalaExameEscrito(candidato.salaExameEscrito || 'Sala de Provas n.º 01');
      setEventoLocal(candidato.detalhesFase?.local || provDefaultLocal);
      setEventoData(candidato.detalhesFase?.dataEvento || '25 de Novembro de 2026 às 08h30');
      if (haveraExame === 'nao') {
        setNovoEstado(isFem ? 'Convocada para Entrevista Profissional' : 'Convocado para Entrevista Profissional');
        setParecerJuri(candidato.deliberacaoJuri?.parecer || 'Dispensado de teste escrito. Convocado diretamente para a Entrevista Profissional.');
      } else {
        setNovoEstado(isFem ? 'Convocada para Teste Escrito' : 'Convocado para Teste Escrito');
        setParecerJuri(candidato.deliberacaoJuri?.parecer || `Convocado para realização de Teste Escrito em ${provDefaultLocal}.`);
      }
    } else if (candFase === 3) {
      const curNotaE = candidato.deliberacaoJuri?.notaExameEscrito || '14.0';
      setNotaExameEscrito(curNotaE);
      setEventoLocal(candidato.detalhesFase?.local || provDefaultLocal);
      setEventoData(candidato.detalhesFase?.dataEvento || '25 de Novembro de 2026 às 08h30');
      if (parseFloat(curNotaE) < 10.0) {
        setNovoEstado(isFem ? 'Reprovada no Teste Escrito' : 'Reprovado no Teste Escrito');
        setMotivoExclusao('Classificação inferior a 10 valores no Teste Escrito (Reprovação Eliminatória)');
        setParecerJuri(`Classificação de ${curNotaE} valores no Teste Escrito (< 10 valores). Reprovado.`);
      } else {
        setNovoEstado(isFem ? 'Aprovada no Teste Escrito' : 'Aprovado no Teste Escrito');
        setParecerJuri(candidato.deliberacaoJuri?.parecer || `Aprovado no Teste Escrito com ${curNotaE} valores. Avança para a Entrevista Profissional.`);
      }
    } else {
      // candFase === 4
      const curNotaF = candidato.deliberacaoJuri?.notaFinal || '16.0';
      setNotaFinal(curNotaF);
      if (parseFloat(curNotaF) < 10.0) {
        setNovoEstado(isFem ? 'Reprovada na Entrevista' : 'Reprovado na Entrevista');
        setMotivoExclusao('Nota inferior a 10 valores na Entrevista Profissional');
        setParecerJuri(`Classificação de ${curNotaF} valores na Entrevista Profissional (< 10 valores). Reprovado.`);
      } else if (candidato.status?.includes('Suplente')) {
        setNovoEstado(isFem ? 'Aprovada (Suplente)' : 'Aprovado (Suplente)');
        setParecerJuri(candidato.deliberacaoJuri?.parecer || `Aprovado na Entrevista com ${curNotaF} valores. Integrado na lista de suplentes.`);
      } else {
        setNovoEstado(isFem ? 'Admitida' : 'Admitido');
        setParecerJuri(candidato.deliberacaoJuri?.parecer || `Aprovado na Entrevista com nota de ${curNotaF} valores. Proposta para provimento efetivo da vaga.`);
      }
    }

    if (candidato.deliberacaoJuri?.motivoExclusao) {
      setMotivoExclusao(candidato.deliberacaoJuri.motivoExclusao);
    }
    if (candidato.deliberacaoJuri?.notaFinal) {
      setNotaFinal(candidato.deliberacaoJuri.notaFinal);
    }

    // Ajusta a pasta ativa na estação de avaliação para o estado do candidato
    if (candidato.status === 'Em Análise Documental' || candidato.status === 'Em análise' || candidato.status === 'Submetida') {
      setFiltroDeliberacaoModo('pendentes');
    } else if (candidato.status === 'Admitido' || candidato.status === 'Admitida') {
      setFiltroDeliberacaoModo('admitidos');
    } else if (candidato.status?.includes('Excluíd') || candidato.status?.includes('Reprovad')) {
      setFiltroDeliberacaoModo('excluidos');
    } else if (candidato.status?.includes('Suplente')) {
      setFiltroDeliberacaoModo('suplentes');
    } else {
      setFiltroDeliberacaoModo('convocados');
    }

    setGestorTab('deliberacao');
    setSelectedDossier(null);
  };

  // ========================================================
  // EXECUTAR DELIBERAÇÃO OFICIAL
  // ========================================================
  const handleGravarDeliberacao = (e) => {
    if (e) e.preventDefault();
    if (!deliberandoCandidato) return;

    const isFem = deliberandoCandidato ? (detectCandidateGender(deliberandoCandidato) === 'Feminino') : false;
    const isExclusao = novoEstado.includes('Excluíd') || novoEstado.includes('Reprovad') || novoEstado === 'Excluído' || novoEstado === 'Excluída';

    const motivoFinal = isExclusao
      ? (motivoExclusao === 'Outro fundamento legal com descrição detalhada' || motivoExclusao === 'Outro motivo detalhado' ? outroMotivo : motivoExclusao)
      : null;

    if (isExclusao && !motivoFinal) {
      if (onNotify) onNotify('error', 'É obrigatório indicar o fundamento ou motivo para a exclusão/reprovação do candidato.');
      return;
    }

    const candFase = deliberandoCandidato.faseAtual || (
      (deliberandoCandidato.status === 'Em Análise Documental' || deliberandoCandidato.status === 'Em análise' || deliberandoCandidato.status === 'Submetida') ? 1 :
      (deliberandoCandidato.status === 'Aprovado na Análise Documental' || deliberandoCandidato.status === 'Aprovada na Análise Documental' || deliberandoCandidato.status === 'Admitido na Análise Documental' || deliberandoCandidato.status === 'Admitida na Análise Documental') ? 2 :
      (deliberandoCandidato.status === 'Convocado para Teste Escrito' || deliberandoCandidato.status === 'Convocada para Teste Escrito') ? 3 :
      4
    );

    let updates = {};

    if (candFase === 1) {
      // FASE 1: ANÁLISE DOCUMENTAL (Aprovado ou Reprovado)
      if (novoEstado.includes('Aprovad') || novoEstado.includes('Admitid')) {
        updates = {
          status: isFem ? 'Aprovada na Análise Documental' : 'Aprovado na Análise Documental',
          faseAtual: 2,
          motivoExclusao: null,
          parecer: parecerJuri || 'Candidatura com documentação em conformidade com o Edital. Aprovado na 1ª Fase (Análise Documental).'
        };
      } else {
        updates = {
          status: isFem ? 'Reprovada na Análise Documental' : 'Reprovado na Análise Documental',
          faseAtual: 1,
          motivoExclusao: motivoFinal,
          parecer: parecerJuri || `Reprovado na Análise Documental: ${motivoFinal}.`
        };
      }
    } else if (candFase === 2) {
      // FASE 2: CONVOCATÓRIA (Opção de Teste Escrito: Sim/Não)
      if (haveraExameEscrito === 'sim') {
        if (!localExameEscrito.trim() || !dataExameEscrito.trim()) {
          if (onNotify) onNotify('error', 'É obrigatório selecionar a Direcção/Local e a Data/Hora do Teste Escrito.');
          return;
        }
        updates = {
          status: isFem ? 'Convocada para Teste Escrito' : 'Convocado para Teste Escrito',
          faseAtual: 3,
          haveraExameEscrito: 'sim',
          localExameEscrito: localExameEscrito,
          dataExameEscrito: dataExameEscrito,
          salaExameEscrito: salaExameEscrito,
          eventoLocal: localExameEscrito,
          eventoData: dataExameEscrito,
          eventoTitulo: 'Teste Escrito de Conhecimentos',
          motivoExclusao: null,
          parecer: parecerJuri || `Convocado para Teste Escrito em ${localExameEscrito} (${salaExameEscrito}) no dia ${dataExameEscrito}.`
        };
      } else {
        if (!eventoLocal.trim() || !eventoData.trim()) {
          if (onNotify) onNotify('error', 'É obrigatório indicar o Local e a Data/Hora da Entrevista Profissional.');
          return;
        }
        updates = {
          status: isFem ? 'Convocada para Entrevista Profissional' : 'Convocado para Entrevista Profissional',
          faseAtual: 4,
          haveraExameEscrito: 'nao',
          eventoLocal: eventoLocal,
          eventoData: eventoData,
          eventoTitulo: 'Entrevista Profissional e de Competências',
          motivoExclusao: null,
          parecer: parecerJuri || `Dispensado de teste escrito. Convocado diretamente para a Entrevista Profissional em ${eventoLocal} no dia ${eventoData}.`
        };
      }
    } else if (candFase === 3) {
      // FASE 3: TESTE ESCRITO (Aprovado ou Reprovado)
      const notaE = parseFloat(notaExameEscrito);
      if (isNaN(notaE)) {
        if (onNotify) onNotify('error', 'Por favor insira uma classificação válida no Teste Escrito (0.0 a 20.0).');
        return;
      }
      if (notaE < 10.0 && novoEstado.includes('Aprovad')) {
        if (onNotify) onNotify('error', 'Regra Eliminatória SERNIC: Candidato com nota inferior a 10 valores reprova no teste escrito.');
        return;
      }

      if (notaE >= 10.0 && (novoEstado.includes('Aprovad') || !novoEstado.includes('Reprovad'))) {
        updates = {
          status: isFem ? 'Aprovada no Teste Escrito' : 'Aprovado no Teste Escrito',
          faseAtual: 4,
          notaExameEscrito: notaExameEscrito,
          motivoExclusao: null,
          eventoLocal: eventoLocal || LOCAIS_DIRECCOES_PROVINCIAIS[deliberandoCandidato.provincia] || 'Gabinete Provincial de Entrevistas',
          eventoData: eventoData || '25 de Novembro de 2026 às 08h30',
          eventoTitulo: 'Entrevista Profissional e de Competências',
          parecer: parecerJuri || `Aprovado no Teste Escrito com ${notaExameEscrito} valores. Convocado para a 4ª Fase (Entrevista Profissional).`
        };
      } else {
        updates = {
          status: isFem ? 'Reprovada no Teste Escrito' : 'Reprovado no Teste Escrito',
          faseAtual: 3,
          notaExameEscrito: notaExameEscrito,
          motivoExclusao: motivoFinal || 'Classificação inferior a 10 valores no Teste Escrito (Reprovação Eliminatória)',
          parecer: parecerJuri || `Reprovado no Teste Escrito com ${notaExameEscrito} valores (< 10 valores).`
        };
      }
    } else {
      // FASE 4: ENTREVISTA PROFISSIONAL (Admitido, Suplente, Reprovado)
      const notaF = parseFloat(notaFinal);
      if (isNaN(notaF)) {
        if (onNotify) onNotify('error', 'Por favor insira uma nota válida na Entrevista (0.0 a 20.0).');
        return;
      }

      if ((novoEstado === 'Admitido' || novoEstado === 'Admitida' || novoEstado.includes('Suplente')) && notaF < 10.0) {
        if (onNotify) onNotify('error', 'Regra Eliminatória SERNIC: Candidatos com nota inferior a 10 valores não podem ser admitidos nem ficar suplentes.');
        return;
      }

      if (novoEstado === 'Admitido' || novoEstado === 'Admitida') {
        updates = {
          status: isFem ? 'Admitida' : 'Admitido',
          faseAtual: 4,
          notaFinal: notaFinal,
          motivoExclusao: null,
          parecer: parecerJuri || `Aprovado na Entrevista Profissional com nota de ${notaFinal} valores. Selecionado para provimento efetivo da vaga.`
        };
      } else if (novoEstado.includes('Suplente')) {
        updates = {
          status: isFem ? 'Aprovada (Suplente)' : 'Aprovado (Suplente)',
          faseAtual: 4,
          notaFinal: notaFinal,
          motivoExclusao: null,
          parecer: parecerJuri || `Aprovado na Entrevista com nota de ${notaFinal} valores. Integrado na lista de reserva (suplente).`
        };
      } else {
        updates = {
          status: isFem ? 'Reprovada na Entrevista' : 'Reprovado na Entrevista',
          faseAtual: 4,
          notaFinal: notaFinal,
          motivoExclusao: motivoFinal || 'Nota inferior a 10 valores na Entrevista Profissional (Reprovação Eliminatória)',
          parecer: parecerJuri || `Reprovado na Entrevista Profissional com ${notaFinal} valores: ${motivoFinal || 'Inaptidão técnica'}.`
        };
      }
    }

    executeSaveDeliberacao(deliberandoCandidato, updates, currentUser);
  };

  // ========================================================
  // CRIAR E PUBLICAR NOVO EDITAL
  // ========================================================
  const handlePublicarEdital = (e) => {
    if (e) e.preventDefault();
    if (!novoEditalData.tituloLista.trim()) {
      if (onNotify) onNotify('error', 'Por favor informe o título oficial da pauta ou edital.');
      return;
    }

    const currentListas = getStoredListasPublicadas();
    const countAtingidos = candidatos.filter(c => {
      if (novoEditalData.tipo === 'Admitidos') return c.status === 'Admitido' || c.status === 'Admitida';
      if (novoEditalData.tipo === 'Convocados') return c.status === 'Entrevista Profissional' || c.status === 'Convocada para provas';
      if (novoEditalData.tipo === 'Suplentes') return c.status === 'Aprovado (Suplente)';
      if (novoEditalData.tipo === 'Excluídos') return c.status === 'Excluído' || c.status === 'Excluída';
      return true;
    }).length;

    const novaPauta = {
      id: `LST-${String(currentListas.length + 1).padStart(2, '0')}`,
      edital: 'Aviso de Concurso n.º 01/SERNIC-DG/DRH/2026',
      vagaTitulo: novoEditalData.vagaTitulo,
      tipo: novoEditalData.tipo,
      tituloLista: novoEditalData.tituloLista,
      dataPublicacao: new Date().toISOString().split('T')[0],
      totalCandidatos: countAtingidos || 12,
      arquivoNome: `SERNIC_${novoEditalData.tipo}_Oficial_2026.pdf`,
      arquivoTamanho: '1.9 MB',
      observacoes: novoEditalData.observacoes || 'Publicado pela Comissão de Recrutamento do SERNIC.'
    };

    const updatedList = [novaPauta, ...currentListas];
    saveStoredListasPublicadas(updatedList);
    
    addStoredAuditoria({
      acao: 'Publicação de Edital Oficial',
      candidato: novoEditalData.tituloLista,
      estadoAnterior: 'Não Publicado',
      novoEstado: 'Publicado no Portal',
      motivo: `Publicação de lista de ${novoEditalData.tipo} para consulta pública`,
      operador: currentUser?.name || 'Dr. Alberto Chissano'
    });

    reloadData();
    setIsNovoEditalModalOpen(false);
    setNovoEditalData({
      tituloLista: '',
      vagaTitulo: 'Investigador Criminal de 2ª Classe',
      tipo: 'Admitidos',
      observacoes: 'Apresentação obrigatória com Bilhete de Identidade original.'
    });

    if (onNotify) onNotify('success', 'Edital Oficial publicado com sucesso! Já está visível na Consulta Pública dos candidatos.');
  };

  // ========================================================
  // EXPORTAR LISTA DE INSCRITOS PARA CSV COM TIMBRE E BOM UTF-8
  // ========================================================
  const handleExportCSV = () => {
    const headers = ['Nº', 'Código de Protocolo', 'Nome Completo', 'BI', 'NUIT', 'Género', 'Carreira Pretendida', 'Província', 'Data de Inscrição', 'Estado Oficial', 'Média do Curso', 'Nota da Entrevista'];
    const rows = filteredCandidatos.map((c, i) => [
      i + 1,
      `"${c.codigoCandidatura || ''}"`,
      `"${(c.nomeCompleto || '').replace(/"/g, '""')}"`,
      `"${c.biNumero || ''}"`,
      `"${c.nuit || ''}"`,
      `"${c.genero || ''}"`,
      `"${(c.carreira || c.vagaTitulo || '').replace(/"/g, '""')}"`,
      `"${c.provincia || ''}"`,
      `"${c.dataSubmissao ? c.dataSubmissao.split('T')[0] : ''}"`,
      `"${(c.status || '').replace(/"/g, '""')}"`,
      `"${c.habilitacoes?.mediaFinal || ''}"`,
      `"${c.deliberacaoJuri?.notaFinal || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SERNIC_Inscritos_Concurso_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onNotify) onNotify('success', `${filteredCandidatos.length} registos exportados em CSV com sucesso.`);
  };

  // ========================================================
  // IMPRESSÃO OFICIAL DA PAUTA DOS CANDIDATOS INSCRITOS (SERNIC)
  // ========================================================
  const handleImprimirPautaInscritos = () => {
    const dataHoje = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaHoje = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    const filtroCarreiraTxt = filtroVaga === 'todas' ? 'Todas as Carreiras' : filtroVaga;
    const filtroProvinciaTxt = filtroProvincia === 'todas' ? 'Todas as Províncias' : filtroProvincia;
    const filtroStatusTxt = filtroStatus === 'todos' ? 'Todos os Estados' : filtroStatus;
    const filtroGeneroTxt = filtroGenero === 'todos' ? 'Todos' : filtroGenero;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <title>SERNIC - Pauta Oficial dos Candidatos Inscritos</title>
        <style>
          @page { size: A4 landscape; margin: 10mm 12mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 12px; color: #0f172a; background: #fff; font-size: 11px; }
          .header { text-align: center; border-bottom: 2px solid #c32026; padding-bottom: 8px; margin-bottom: 12px; }
          .header h1 { font-size: 13px; margin: 0 0 3px 0; text-transform: uppercase; letter-spacing: 0.05em; color: #0f172a; }
          .header h2 { font-size: 12px; margin: 0 0 3px 0; color: #c32026; font-weight: 800; }
          .header h3 { font-size: 10px; margin: 0; color: #475569; font-weight: 600; }
          .title { font-size: 12px; font-weight: 800; text-align: center; margin: 8px 0; color: #0f172a; text-transform: uppercase; }
          .meta-box { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 10px; margin-bottom: 12px; border-radius: 4px; font-size: 9.5px; }
          .meta-col { display: flex; gap: 15px; flex-wrap: wrap; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 5px 6px; text-align: left; font-size: 9px; }
          th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; text-transform: uppercase; font-size: 8.5px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .signature-box { text-align: center; width: 260px; }
          .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; font-size: 9.5px; font-weight: bold; }
          .signature-role { font-size: 8.5px; color: #64748b; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>República de Moçambique • Ministério do Interior</h1>
          <h2>Serviço Nacional de Investigação Criminal (SERNIC)</h2>
          <h3>Direcção dos Recursos Humanos • Comissão do Concurso Público</h3>
          <div class="title">PAUTA OFICIAL DOS CANDIDATOS INSCRITOS • CONCURSO 2026</div>
        </div>
        <div class="meta-box">
          <div class="meta-col">
            <span><strong>Carreira:</strong> ${filtroCarreiraTxt}</span>
            <span><strong>Província:</strong> ${filtroProvinciaTxt}</span>
            <span><strong>Estado:</strong> ${filtroStatusTxt}</span>
            <span><strong>Género:</strong> ${filtroGeneroTxt}</span>
          </div>
          <div>
            <span><strong>Total de Candidatos:</strong> ${filteredCandidatos.length}</span> | 
            <span><strong>Data:</strong> ${dataHoje} ${horaHoje}</span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 25px; text-align: center;">Nº</th>
              <th>Protocolo</th>
              <th>Nome Completo</th>
              <th>BI</th>
              <th>NUIT</th>
              <th>Género</th>
              <th>Província</th>
              <th>Carreira Pretendida</th>
              <th>Data Inscrição</th>
              <th>Estado Oficial</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            ${filteredCandidatos.map((c, idx) => `
              <tr>
                <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="font-family: monospace; font-weight: bold; color: #c32026;">${c.codigoCandidatura || '-'}</td>
                <td style="font-weight: 600;">${c.nomeCompleto || '-'}</td>
                <td>${c.biNumero || '-'}</td>
                <td>${c.nuit || '-'}</td>
                <td>${c.genero || '-'}</td>
                <td>${c.provincia || '-'}</td>
                <td>${c.carreira || c.vagaTitulo || '-'}</td>
                <td>${c.dataSubmissao ? new Date(c.dataSubmissao).toLocaleDateString('pt-PT') : '-'}</td>
                <td><strong>${c.status || 'Em Análise'}</strong></td>
                <td>${c.deliberacaoJuri?.notaFinal ? c.deliberacaoJuri.notaFinal + ' val.' : (c.habilitacoes?.mediaFinal ? c.habilitacoes.mediaFinal + ' val.' : '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <div class="signature-box">
            <div class="signature-line">Presidente do Júri de Seleção</div>
            <div class="signature-role">Direcção dos Recursos Humanos • SERNIC</div>
          </div>
          <div style="text-align: center; font-size: 8.5px; color: #64748b; margin-top: 45px;">
            Documento emitido eletronicamente pela Plataforma Oficial SERNIC • Homologação Regulamentar
          </div>
          <div class="signature-box">
            <div class="signature-line">Director Nacional dos Recursos Humanos</div>
            <div class="signature-role">Serviço Nacional de Investigação Criminal</div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // ========================================================
  // HANDLERS DO MÓDULO DE DEFINIÇÕES
  // ========================================================
  // GESTÃO DE PERFIS & ACESSIBILIDADE
  const filteredPerfis = useMemo(() => {
    return perfis.filter(p => {
      const q = buscaPerfil.toLowerCase().trim();
      const matchBusca = !q || 
        p.nome.toLowerCase().includes(q) || 
        p.cargo.toLowerCase().includes(q) || 
        p.email.toLowerCase().includes(q) ||
        p.tipoPerfil.toLowerCase().includes(q) ||
        (p.departamento && p.departamento.toLowerCase().includes(q));
      
      const matchTipo = filtroTipoPerfil === 'todos' || p.tipoPerfil === filtroTipoPerfil;
      return matchBusca && matchTipo;
    });
  }, [perfis, buscaPerfil, filtroTipoPerfil]);

  const handleOpenNovoPerfil = () => {
    setEditingPerfil(null);
    setPerfilForm({
      nome: '',
      cargo: 'Técnico de Recursos Humanos',
      departamento: 'Divisão de Recursos Humanos - SERNIC',
      email: '',
      telefone: '+258 84 000 0000',
      tipoPerfil: 'Gestora de Triagem Documental',
      descricaoPerfil: 'Conferência de documentos, validação de pré-requisitos e pareceres iniciais.',
      estado: 'Activo',
      avatarCor: '#0f2042',
      permissoes: {
        visualizarCandidatos: true,
        deliberarFase1: true,
        homologarFinal: false,
        gerirVagasCarreiras: false,
        publicarPautas: false,
        consultarAuditoria: true,
        gerirPerfisAcessos: false,
        reiniciarConcurso: false
      },
      notaHumanizada: 'Membro designado para apoiar a triagem documental e atendimento aos candidatos.'
    });
    setIsPerfilModalOpen(true);
  };

  const handleOpenEditPerfil = (p) => {
    setEditingPerfil(p);
    setPerfilForm({
      nome: p.nome || '',
      cargo: p.cargo || '',
      departamento: p.departamento || '',
      email: p.email || '',
      telefone: p.telefone || '+258 84 000 0000',
      tipoPerfil: p.tipoPerfil || 'Gestora de Triagem Documental',
      descricaoPerfil: p.descricaoPerfil || '',
      estado: p.estado || 'Activo',
      avatarCor: p.avatarCor || '#0f2042',
      permissoes: {
        visualizarCandidatos: true,
        deliberarFase1: false,
        homologarFinal: false,
        gerirVagasCarreiras: false,
        publicarPautas: false,
        consultarAuditoria: true,
        gerirPerfisAcessos: false,
        reiniciarConcurso: false,
        ...(p.permissoes || {})
      },
      notaHumanizada: p.notaHumanizada || ''
    });
    setIsPerfilModalOpen(true);
  };

  const handleApplyRoleTemplate = (roleType) => {
    const templates = {
      'Administrador Geral': {
        tipoPerfil: 'Administrador Geral',
        descricaoPerfil: 'Acesso pleno para coordenar, deliberar, publicar listas e homologar o concurso.',
        permissoes: {
          visualizarCandidatos: true,
          deliberarFase1: true,
          homologarFinal: true,
          gerirVagasCarreiras: true,
          publicarPautas: true,
          consultarAuditoria: true,
          gerirPerfisAcessos: true,
          reiniciarConcurso: true
        }
      },
      'Gestora de Triagem Documental': {
        tipoPerfil: 'Gestora de Triagem Documental',
        descricaoPerfil: 'Foco na verificação de certificados, BI, NUIT e admissão documental da 1ª fase.',
        permissoes: {
          visualizarCandidatos: true,
          deliberarFase1: true,
          homologarFinal: false,
          gerirVagasCarreiras: false,
          publicarPautas: true,
          consultarAuditoria: true,
          gerirPerfisAcessos: false,
          reiniciarConcurso: false
        }
      },
      'Examinador Técnico & Psicotécnico': {
        tipoPerfil: 'Examinador Técnico & Psicotécnico',
        descricaoPerfil: 'Lançamento de notas de provas escritas, exames práticos e aptidão técnica.',
        permissoes: {
          visualizarCandidatos: true,
          deliberarFase1: true,
          homologarFinal: false,
          gerirVagasCarreiras: false,
          publicarPautas: false,
          consultarAuditoria: true,
          gerirPerfisAcessos: false,
          reiniciarConcurso: false
        }
      },
      'Avaliadora Médica & Saúde': {
        tipoPerfil: 'Avaliadora Médica & Saúde',
        descricaoPerfil: 'Registo e conferência de atestados médicos, junta de saúde e aptidão física.',
        permissoes: {
          visualizarCandidatos: true,
          deliberarFase1: false,
          homologarFinal: false,
          gerirVagasCarreiras: false,
          publicarPautas: false,
          consultarAuditoria: true,
          gerirPerfisAcessos: false,
          reiniciarConcurso: false
        }
      },
      'Auditor de Conformidade': {
        tipoPerfil: 'Auditor de Conformidade',
        descricaoPerfil: 'Fiscalização e consulta aos registos de auditoria, estatísticas e atas oficiais.',
        permissoes: {
          visualizarCandidatos: true,
          deliberarFase1: false,
          homologarFinal: false,
          gerirVagasCarreiras: false,
          publicarPautas: false,
          consultarAuditoria: true,
          gerirPerfisAcessos: false,
          reiniciarConcurso: false
        }
      }
    };

    if (templates[roleType]) {
      setPerfilForm(prev => ({
        ...prev,
        ...templates[roleType],
        permissoes: { ...templates[roleType].permissoes }
      }));
    }
  };

  const handleSavePerfil = (e) => {
    if (e) e.preventDefault();
    if (!perfilForm.nome.trim()) {
      if (onNotify) onNotify('warning', 'Por favor indique o nome completo do membro da equipa.');
      return;
    }

    const operador = currentUser?.name ? `${currentUser.name} (${currentUser.cargo || 'Gestor'})` : 'Dr. Alberto Chissano';

    if (editingPerfil) {
      updateStoredPerfil(editingPerfil.id, perfilForm, operador);
      setPerfis(getStoredPerfis());
      if (onNotify) onNotify('success', `Perfil de "${perfilForm.nome}" atualizado com sucesso!`);
    } else {
      createStoredPerfil(perfilForm, operador);
      setPerfis(getStoredPerfis());
      if (onNotify) onNotify('success', `Novo membro "${perfilForm.nome}" cadastrado com sucesso!`);
    }

    setIsPerfilModalOpen(false);
    setEditingPerfil(null);
  };

  const handleTogglePerfilStatus = (id) => {
    const target = perfis.find(p => p.id === id);
    if (!target) return;
    const novoEstado = target.estado === 'Activo' ? 'Em Pausa' : 'Activo';
    const operador = currentUser?.name || 'Dr. Alberto Chissano';

    updateStoredPerfil(id, { estado: novoEstado }, operador);
    setPerfis(getStoredPerfis());
    if (onNotify) onNotify('info', `Estado de ${target.nome} alterado para "${novoEstado}".`);
  };

  const handleRequestDeletePerfil = (id) => {
    const target = perfis.find(p => p.id === id);
    if (!target) return;
    setPerfilToDelete(target);
  };

  const handleConfirmDeletePerfil = () => {
    if (!perfilToDelete) return;
    const operador = currentUser?.name ? `${currentUser.name} (${currentUser.cargo || 'Gestor'})` : 'Dr. Alberto Chissano';
    deleteStoredPerfil(perfilToDelete.id, operador);
    setPerfis(getStoredPerfis());
    if (onNotify) onNotify('success', `Credenciamento de "${perfilToDelete.nome}" revogado com sucesso e lavrado no Livro de Atas.`);
    setPerfilToDelete(null);
  };

  const handleUpdateAcessibilidade = (updates) => {
    const updated = { ...acessibilidade, ...updates };
    setAcessibilidade(updated);
    saveStoredAcessibilidade(updated);
    if (onNotify) onNotify('info', 'Definição de acessibilidade aplicada com sucesso!');
  };

  const handleResetAcessibilidade = () => {
    setAcessibilidade(INITIAL_ACESSIBILIDADE);
    saveStoredAcessibilidade(INITIAL_ACESSIBILIDADE);
    if (onNotify) onNotify('success', 'Preferências de acessibilidade restauradas para o padrão.');
  };

  // 0. Carreiras Oficiais do SERNIC
  const filteredCarreiras = useMemo(() => {
    return carreiras.filter(c => {
      const q = buscaCarreira.toLowerCase().trim();
      const matchBusca = !q || 
        c.nome.toLowerCase().includes(q) || 
        c.codigo.toLowerCase().includes(q) ||
        (c.ramo && c.ramo.toLowerCase().includes(q)) ||
        (c.enquadramentoTSU && c.enquadramentoTSU.toLowerCase().includes(q)) ||
        (c.cursosAceites && c.cursosAceites.toLowerCase().includes(q));
      
      const matchRegime = filtroRegimeCarreira === 'todos' || c.regime === filtroRegimeCarreira;
      const matchGrau = filtroGrauCarreira === 'todos' || c.grauMinimo === filtroGrauCarreira;
      const matchStatus = filtroStatusCarreira === 'todos' || c.status === filtroStatusCarreira;

      return matchBusca && matchRegime && matchGrau && matchStatus;
    });
  }, [carreiras, buscaCarreira, filtroRegimeCarreira, filtroGrauCarreira, filtroStatusCarreira]);

  const handleOpenNovaCarreira = () => {
    setEditingCarreira(null);
    setCarreiraForm({
      codigo: `SERNIC-CAR-0${carreiras.length + 1}`,
      nome: '',
      regime: 'Carreira de Regime Especial - SERNIC',
      ramo: 'Investigação Criminal e Instrução Processual Penal',
      grauMinimo: 'Licenciatura',
      enquadramentoTSU: 'Faixa TSU-14 a TSU-18 (+40% Risco e Disponibilidade)',
      vagas: 25,
      status: 'Activa',
      descricao: '',
      cursosAceites: 'Direito, Ciências Policiais, Criminologia, Psicologia Forense',
      idadeMinima: 21,
      idadeMaxima: 35,
      requisitoFisico: 'Aptidão física e psíquica comprovada por junta médica oficial.',
      escalaTrabalho: 'Regime de Permanência e Turnos Operacionais 24/7'
    });
    setIsCarreiraModalOpen(true);
  };

  const handleOpenEditCarreira = (carreira) => {
    setEditingCarreira(carreira);
    setCarreiraForm({
      codigo: carreira.codigo || `SERNIC-CAR-01`,
      nome: carreira.nome || '',
      regime: carreira.regime || 'Carreira de Regime Especial - SERNIC',
      ramo: carreira.ramo || '',
      grauMinimo: carreira.grauMinimo || 'Licenciatura',
      enquadramentoTSU: carreira.enquadramentoTSU || '',
      vagas: carreira.vagas !== undefined ? carreira.vagas : 10,
      status: carreira.status || 'Activa',
      descricao: carreira.descricao || '',
      cursosAceites: carreira.cursosAceites || '',
      idadeMinima: carreira.idadeMinima || 21,
      idadeMaxima: carreira.idadeMaxima || 35,
      requisitoFisico: carreira.requisitoFisico || '',
      escalaTrabalho: carreira.escalaTrabalho || ''
    });
    setIsCarreiraModalOpen(true);
  };

  const handleSaveCarreira = (e) => {
    if (e) e.preventDefault();
    if (!carreiraForm.nome.trim()) {
      if (onNotify) onNotify('warning', 'O nome da carreira é de preenchimento obrigatório.');
      return;
    }

    const operador = currentUser?.name ? `${currentUser.name} (${currentUser.cargo || 'Presidente do Júri'})` : 'Direcção de Recursos Humanos - SERNIC';

    if (editingCarreira) {
      updateStoredCarreira(editingCarreira.id, carreiraForm, operador);
      setCarreiras(getStoredCarreiras());
      if (onNotify) onNotify('success', `Carreira "${carreiraForm.nome}" atualizada com sucesso!`);
    } else {
      createStoredCarreira(carreiraForm, operador);
      setCarreiras(getStoredCarreiras());
      if (onNotify) onNotify('success', `Carreira "${carreiraForm.nome}" cadastrada no quadro com sucesso!`);
    }

    setIsCarreiraModalOpen(false);
    setEditingCarreira(null);
  };

  const handleToggleCarreiraStatus = (id) => {
    const target = carreiras.find(c => c.id === id);
    if (!target) return;
    const novoStatus = target.status === 'Activa' ? 'Inactiva' : 'Activa';
    const operador = currentUser?.name ? `${currentUser.name} (${currentUser.cargo || 'Presidente do Júri'})` : 'Comissão do Concurso - SERNIC';
    
    updateStoredCarreira(id, { status: novoStatus }, operador);
    setCarreiras(getStoredCarreiras());
    if (onNotify) {
      onNotify('info', `Carreira "${target.nome}" passou para estado: ${novoStatus}.`);
    }
  };

  const handleDeleteCarreira = (id) => {
    const target = carreiras.find(c => c.id === id);
    if (!target) return;

    if (window.confirm(`Tem a certeza de que deseja eliminar a carreira "${target.nome}" (${target.codigo})? O registo será lavrado no Livro de Atas.`)) {
      const operador = currentUser?.name ? `${currentUser.name} (${currentUser.cargo || 'Presidente do Júri'})` : 'Comissão do Concurso - SERNIC';
      deleteStoredCarreira(id, operador);
      setCarreiras(getStoredCarreiras());
      if (onNotify) onNotify('success', `Carreira "${target.nome}" eliminada com sucesso.`);
    }
  };

  // 1. Cursos Homologados
  const filteredCursos = useMemo(() => {
    return cursos.filter(c => {
      const matchBusca = !buscaCurso || 
        c.nome.toLowerCase().includes(buscaCurso.toLowerCase()) || 
        c.carreira.toLowerCase().includes(buscaCurso.toLowerCase()) ||
        c.id.toLowerCase().includes(buscaCurso.toLowerCase());
      const matchGrau = filtroGrauCurso === 'todos' || c.grau === filtroGrauCurso;
      return matchBusca && matchGrau;
    });
  }, [cursos, buscaCurso, filtroGrauCurso]);

  const handleOpenNovoCurso = () => {
    setEditingCurso(null);
    setCursoForm({
      nome: '',
      grau: 'Licenciatura',
      carreira: 'Investigação Criminal e Instrução Processual',
      notaMinima: '14.0',
      status: 'Activo'
    });
    setIsCursoModalOpen(true);
  };

  const handleEditCurso = (c) => {
    setEditingCurso(c);
    setCursoForm({
      nome: c.nome,
      grau: c.grau,
      carreira: c.carreira,
      notaMinima: c.notaMinima || '14.0',
      status: c.status || 'Activo'
    });
    setIsCursoModalOpen(true);
  };

  const handleSaveCurso = (e) => {
    if (e) e.preventDefault();
    if (!cursoForm.nome.trim()) {
      if (onNotify) onNotify('error', 'Por favor indique a designação oficial do curso.');
      return;
    }

    let updatedList;
    if (editingCurso) {
      updatedList = cursos.map(c => c.id === editingCurso.id ? { ...c, ...cursoForm } : c);
      addStoredAuditoria({
        acao: 'Atualização de Curso Homologado',
        candidato: cursoForm.nome,
        estadoAnterior: editingCurso.status,
        novoEstado: cursoForm.status,
        motivo: `Edição dos requisitos do curso ${cursoForm.nome} (${cursoForm.grau})`,
        operador: currentUser?.name || 'Dr. Alberto Chissano'
      });
      if (onNotify) onNotify('success', `Curso "${cursoForm.nome}" atualizado com sucesso!`);
    } else {
      const novo = {
        id: `CUR-${String(cursos.length + 1).padStart(2, '0')}`,
        ...cursoForm
      };
      updatedList = [novo, ...cursos];
      addStoredAuditoria({
        acao: 'Homologação de Novo Curso',
        candidato: cursoForm.nome,
        estadoAnterior: 'Inexistente',
        novoEstado: 'Homologado',
        motivo: `Inclusão do curso ${cursoForm.nome} para a carreira ${cursoForm.carreira}`,
        operador: currentUser?.name || 'Dr. Alberto Chissano'
      });
      if (onNotify) onNotify('success', `Novo curso "${cursoForm.nome}" homologado com sucesso!`);
    }

    setCursos(updatedList);
    saveStoredCursos(updatedList);
    setIsCursoModalOpen(false);
  };

  const handleToggleStatusCurso = (id) => {
    const target = cursos.find(c => c.id === id);
    if (!target) return;
    const novoStatus = target.status === 'Activo' ? 'Inactivo' : 'Activo';
    const updated = cursos.map(c => c.id === id ? { ...c, status: novoStatus } : c);
    setCursos(updated);
    saveStoredCursos(updated);
    addStoredAuditoria({
      acao: 'Alteração de Estado de Curso',
      candidato: target.nome,
      estadoAnterior: target.status,
      novoEstado: novoStatus,
      motivo: `Alteração do estado de aceitação do curso ${target.nome}`,
      operador: currentUser?.name || 'Dr. Alberto Chissano'
    });
    if (onNotify) onNotify('info', `Curso marcado como ${novoStatus}.`);
  };

  const handleDeleteCurso = (id) => {
    const target = cursos.find(c => c.id === id);
    if (!target) return;
    if (window.confirm(`Tem a certeza que deseja remover o curso "${target.nome}" da lista de qualificações aceites?`)) {
      const updated = cursos.filter(c => c.id !== id);
      setCursos(updated);
      saveStoredCursos(updated);
      addStoredAuditoria({
        acao: 'Remoção de Curso Homologado',
        candidato: target.nome,
        estadoAnterior: target.status,
        novoEstado: 'Removido',
        motivo: `Exclusão do curso das qualificações elegíveis`,
        operador: currentUser?.name || 'Dr. Alberto Chissano'
      });
      if (onNotify) onNotify('info', `Curso "${target.nome}" removido das opções.`);
    }
  };

  // 2. Centros e Locais de Testes
  const handleOpenNovoLocal = () => {
    setEditingLocal(null);
    setLocalForm({
      nome: '',
      provincia: 'Maputo Província',
      cidade: 'Michafutene',
      endereco: '',
      capacidade: 350,
      tiposProva: ['Prova Escrita de Conhecimentos'],
      dataPrevista: '15 de Novembro de 2026 às 08h00',
      responsavel: ''
    });
    setIsLocalModalOpen(true);
  };

  const handleEditLocal = (loc) => {
    setEditingLocal(loc);
    setLocalForm({
      nome: loc.nome,
      provincia: loc.provincia,
      cidade: loc.cidade,
      endereco: loc.endereco,
      capacidade: loc.capacidade,
      tiposProva: loc.tiposProva || ['Prova Escrita de Conhecimentos'],
      dataPrevista: loc.dataPrevista,
      responsavel: loc.responsavel || ''
    });
    setIsLocalModalOpen(true);
  };

  const handleSaveLocal = (e) => {
    if (e) e.preventDefault();
    if (!localForm.nome.trim()) {
      if (onNotify) onNotify('error', 'Por favor indique o nome do centro de testes.');
      return;
    }

    let updatedList;
    if (editingLocal) {
      updatedList = locais.map(l => l.id === editingLocal.id ? { ...l, ...localForm } : l);
      addStoredAuditoria({
        acao: 'Atualização de Centro de Exames',
        candidato: localForm.nome,
        estadoAnterior: editingLocal.provincia,
        novoEstado: localForm.provincia,
        motivo: `Edição do centro de provas em ${localForm.provincia} (${localForm.capacidade} vagas)`,
        operador: currentUser?.name || 'Dr. Alberto Chissano'
      });
      if (onNotify) onNotify('success', `Centro "${localForm.nome}" atualizado com sucesso!`);
    } else {
      const novo = {
        id: `LOC-${String(locais.length + 1).padStart(2, '0')}`,
        ...localForm
      };
      updatedList = [novo, ...locais];
      addStoredAuditoria({
        acao: 'Cadastro de Centro de Provas',
        candidato: localForm.nome,
        estadoAnterior: 'Novo',
        novoEstado: 'Activo',
        motivo: `Credenciação do centro de provas em ${localForm.provincia} (${localForm.capacidade} vagas)`,
        operador: currentUser?.name || 'Dr. Alberto Chissano'
      });
      if (onNotify) onNotify('success', `Novo centro de testes "${localForm.nome}" cadastrado com sucesso!`);
    }

    setLocais(updatedList);
    saveStoredLocais(updatedList);
    setIsLocalModalOpen(false);
  };

  const handleDeleteLocal = (id) => {
    const target = locais.find(l => l.id === id);
    if (!target) return;
    if (window.confirm(`Tem a certeza que deseja remover o local "${target.nome}"?`)) {
      const updated = locais.filter(l => l.id !== id);
      setLocais(updated);
      saveStoredLocais(updated);
      addStoredAuditoria({
        acao: 'Remoção de Centro de Provas',
        candidato: target.nome,
        estadoAnterior: target.provincia,
        novoEstado: 'Removido',
        motivo: `Desativação de centro de provas para o concurso`,
        operador: currentUser?.name || 'Dr. Alberto Chissano'
      });
      if (onNotify) onNotify('info', `Centro "${target.nome}" removido.`);
    }
  };

  // 3. CRUD DE PALETAS DE CORES & TEMAS INSTITUCIONAIS
  const handleOpenNovaPaleta = () => {
    setEditingPaleta(null);
    setPaletaForm({
      nome: '',
      cor: '#c32026',
      desc: '',
      categoria: 'Institucional'
    });
    setIsPaletaModalOpen(true);
  };

  const handleOpenEditPaleta = (p) => {
    setEditingPaleta(p);
    setPaletaForm({
      nome: p.nome,
      cor: p.cor,
      desc: p.desc || '',
      categoria: p.categoria || 'Institucional'
    });
    setIsPaletaModalOpen(true);
  };

  const handleSavePaleta = (e) => {
    if (e) e.preventDefault();
    if (!paletaForm.nome.trim()) {
      if (onNotify) onNotify('error', 'Indique o nome oficial da paleta de cores.');
      return;
    }
    if (!paletaForm.cor.trim()) {
      if (onNotify) onNotify('error', 'Selecione ou insira um código hexadecimal de cor válido.');
      return;
    }

    if (editingPaleta) {
      updateStoredPaleta(editingPaleta.id, paletaForm);
      setPaletasCores(getStoredPaletasCores());
      setIsPaletaModalOpen(false);
      if (temaCorSelecionada === editingPaleta.cor) {
        handleApplyThemeColor(paletaForm.cor);
      }
      addStoredAuditoria({
        acao: 'Edição de Paleta de Cores',
        candidato: paletaForm.nome,
        estadoAnterior: editingPaleta.cor,
        novoEstado: paletaForm.cor,
        motivo: `Atualização de parâmetros visuais da paleta ${editingPaleta.id}`,
        operador: currentUser?.name || 'Dr. Alberto Chissano'
      });
      if (onNotify) onNotify('success', `Paleta "${paletaForm.nome}" atualizada com sucesso!`);
    } else {
      const created = createStoredPaleta(paletaForm);
      setPaletasCores(getStoredPaletasCores());
      setIsPaletaModalOpen(false);
      addStoredAuditoria({
        acao: 'Criação de Paleta de Cores',
        candidato: created.nome,
        estadoAnterior: 'N/A',
        novoEstado: created.cor,
        motivo: `Criação da paleta ${created.id} - ${created.categoria}`,
        operador: currentUser?.name || 'Dr. Alberto Chissano'
      });
      if (onNotify) onNotify('success', `Nova paleta "${created.nome}" homologada com sucesso!`);
    }
  };

  const handleDeletePaleta = (id) => {
    const target = paletasCores.find(p => p.id === id);
    if (!target) return;
    deleteStoredPaleta(id);
    setPaletasCores(getStoredPaletasCores());
    if (temaCorSelecionada === target.cor) {
      handleApplyThemeColor('#c32026');
    }
    addStoredAuditoria({
      acao: 'Eliminação de Paleta de Cores',
      candidato: target.nome,
      estadoAnterior: target.cor,
      novoEstado: 'Eliminada',
      motivo: `Revogação da paleta institucional ${target.id}`,
      operador: currentUser?.name || 'Dr. Alberto Chissano'
    });
    if (onNotify) onNotify('info', `Paleta "${target.nome}" eliminada do sistema.`);
  };

  // 3.2 Aplicar Cor Institucional / Modo / Marca d'água
  const handleApplyThemeColor = (cor) => {
    setTemaCorSelecionada(cor);
    document.documentElement.style.setProperty('--sernic-primary', cor);
    document.documentElement.style.setProperty('--portal-primary', cor);
    try {
      localStorage.setItem('sernic_portal_theme_color', cor);
    } catch {}
    const updated = { ...definicoes, corDestaque: cor };
    setDefinicoes(updated);
    saveStoredDefinicoes(updated);
    if (onNotify) onNotify('success', `Cor institucional aplicada.`);
  };

  const handleApplyThemeMode = (mode) => {
    setModoTemaSelecionado(mode);
    try {
      localStorage.setItem('sernic_portal_theme', mode);
      const bg = mode === 'preto' ? '#0f172a' : '#f3f4f6';
      document.documentElement.style.setProperty('--dynamic-bg', bg);
      document.documentElement.style.backgroundColor = bg;
      document.body.style.backgroundColor = bg;
    } catch {}
    const updated = { ...definicoes, temaPadrao: mode };
    setDefinicoes(updated);
    saveStoredDefinicoes(updated);
    if (onNotify) onNotify('info', `Modo alternado para: ${mode === 'preto' ? 'Modo Preto' : 'Modo Claro'}.`);
  };

  const handleApplyWatermarkOpacity = (nivel) => {
    setOpacidadeMarcaAgua(nivel);
    const updated = { ...definicoes, opacidadeMarcaAgua: nivel };
    setDefinicoes(updated);
    saveStoredDefinicoes(updated);
    if (onNotify) onNotify('success', `Intensidade da marca d'água ajustada para "${nivel}".`);
  };

  // 4. Idioma e Regionalização
  const handleSaveRegionalConfig = (e) => {
    if (e) e.preventDefault();
    const updated = {
      ...definicoes,
      idiomaPadrao: idiomaSelecionado,
      fusoHorario: fusoHorarioSelecionado
    };
    setDefinicoes(updated);
    saveStoredDefinicoes(updated);
    addStoredAuditoria({
      acao: 'Configuração Regional',
      candidato: 'Idioma & Fuso',
      estadoAnterior: definicoes.idiomaPadrao,
      novoEstado: idiomaSelecionado,
      motivo: `Atualização de parâmetros regionais: ${idiomaSelecionado.toUpperCase()} / ${fusoHorarioSelecionado}`,
      operador: currentUser?.name || 'Dr. Alberto Chissano'
    });
    if (onNotify) onNotify('success', 'Configurações de Idioma e Fuso Horário guardadas com sucesso!');
  };

  // 5. Parâmetros Estatutários Gerais
  const handleSaveParametrosGerais = (e) => {
    if (e) e.preventDefault();
    const updated = {
      ...definicoes,
      ...parametrosForm
    };
    setDefinicoes(updated);
    saveStoredDefinicoes(updated);
    addStoredAuditoria({
      acao: 'Parâmetros Gerais do Concurso',
      candidato: parametrosForm.codigoEdital,
      estadoAnterior: definicoes.dataEncerramento,
      novoEstado: parametrosForm.dataEncerramento,
      motivo: `Atualização de prazos e critérios estatutários do concurso`,
      operador: currentUser?.name || 'Dr. Alberto Chissano'
    });
    if (onNotify) onNotify('success', 'Parâmetros oficiais do concurso guardados com sucesso!');
  };

  // Helper de badges de status oficiais em 3 fases com flexão inteligente de gênero
  const getBadgeStyle = (status, candidate = null) => {
    const isFem = candidate ? (detectCandidateGender(candidate) === 'Feminino') : false;
    switch (status) {
      case 'Admitido na Análise Documental':
      case 'Admitida na Análise Documental':
        return { 
          bg: '#ecfdf5', 
          color: '#047857', 
          border: '#a7f3d0', 
          label: isFem ? '1ª Fase: Admitida na Análise' : '1ª Fase: Admitido na Análise', 
          icon: <CheckCircle2 size={14} /> 
        };
      case 'Excluído na Análise Documental':
      case 'Excluída na Análise Documental':
        return { 
          bg: '#fee2e2', 
          color: '#dc2626', 
          border: '#fca5a5', 
          label: isFem ? '1ª Fase: Excluída (Documentos)' : '1ª Fase: Excluído (Documentos)', 
          icon: <XCircle size={14} /> 
        };
      case 'Excluído na Entrevista':
      case 'Excluída na Entrevista':
        return { 
          bg: '#fef2f2', 
          color: '#991b1b', 
          border: '#fecaca', 
          label: isFem ? '2ª Fase: Excluída (< 10 val)' : '2ª Fase: Excluído (< 10 val)', 
          icon: <XCircle size={14} /> 
        };
      case 'Admitido':
      case 'Admitida':
        return { 
          bg: '#dcfce7', 
          color: '#15803d', 
          border: '#86efac', 
          label: isFem ? '3ª Fase: Admitida (Efetiva)' : '3ª Fase: Admitido (Efetivo)', 
          icon: <CheckCircle2 size={14} /> 
        };
      case 'Aprovado (Suplente)':
      case 'Aprovada (Suplente)':
        return { 
          bg: '#fef3c7', 
          color: '#b45309', 
          border: '#fde68a', 
          label: isFem ? '3ª Fase: Suplente (Aprovada)' : '3ª Fase: Suplente (Aprovado)', 
          icon: <Award size={14} /> 
        };
      case 'Entrevista Profissional':
      case 'Convocada para provas':
      case 'Convocado para provas':
      case 'Convocado':
      case 'Convocada':
        return { 
          bg: '#dbeafe', 
          color: '#1d4ed8', 
          border: '#bfdbfe', 
          label: isFem ? '2ª Fase: Convocada' : '2ª Fase: Convocado', 
          icon: <Calendar size={14} /> 
        };
      case 'Excluído':
      case 'Excluída':
        return { 
          bg: '#fee2e2', 
          color: '#c32026', 
          border: '#fecaca', 
          label: isFem ? 'Excluída' : 'Excluído', 
          icon: <XCircle size={14} /> 
        };
      case 'Em Análise Documental':
      case 'Em análise':
      case 'Submetida':
      default:
        return { 
          bg: '#f1f5f9', 
          color: '#475569', 
          border: '#cbd5e1', 
          label: '1ª Fase: Em Análise', 
          icon: <Clock size={14} /> 
        };
    }
  };

  return (
    <div className="module-page-container gestor-portal-main">
      {/* ========================================================
          ABA 1: DASHBOARD / PAINEL GERAL (COM BANNER DE BOAS-VINDAS)
          ======================================================== */}
      {gestorTab === 'dashboard' && (
        <div className="gestor-tab-content fadeIn">
          {/* BANNER EXECUTIVO EXCLUSIVO DO DASHBOARD / PAINEL GERAL */}
          <div className="gestor-hero-banner">
            <div className="gestor-hero-top-info">
              <div className="gestor-hero-badge-pill">
                <ShieldCheck size={16} />
                <span>ÁREA ADMINISTRATIVA RESTRITA • COMISSÃO NACIONAL DE RECRUTAMENTO</span>
              </div>
              <div className="gestor-session-user">
                <div className="gestor-user-dot active" />
                <span>Sessão: <strong>{currentUser?.name || 'Dr. Alberto Chissano'}</strong> ({currentUser?.cargo || 'Presidente do Júri'})</span>
              </div>
            </div>

            <div className="gestor-hero-content-flex">
              <div className="gestor-hero-titles">
                <h2>
                  Plataforma de Gestão & Triagem do Concurso Público
                </h2>
                <p>
                  Serviço Nacional de Investigação Criminal • Direcção Geral • Direcção de Recursos Humanos.
                  Avaliação de candidaturas, conferência de documentos e publicação dos resultados oficiais.
                </p>
              </div>

              <div className="gestor-hero-quick-actions">
                <button
                  type="button"
                  className="gestor-action-btn primary"
                  onClick={() => sincronizarComServidor(true)}
                  disabled={estadoServidor.estado === 'a-carregar'}
                  title="Carregar do servidor as candidaturas mais recentes"
                >
                  <RefreshCw size={16} />
                  <span>{estadoServidor.estado === 'a-carregar' ? 'A sincronizar...' : 'Sincronizar Base'}</span>
                </button>
                <span className={`gestor-sync-pill ${estadoServidor.estado}`} role="status" title={estadoServidor.detalhe || ''}>
                  {ROTULO_SYNC[estadoServidor.estado] || 'Servidor'}
                </span>
              </div>
            </div>
          </div>
          {/* CARDS DE KPIS */}
          <div className="gestor-kpi-grid">
            <div 
              className="gestor-kpi-card"
              onClick={() => {
                setFiltroStatus('todos');
                setGestorTab('inscritos');
              }}
              style={{ cursor: 'pointer' }}
              title="Clique para abrir e gerir a lista completa de inscritos"
            >
              <div className="gestor-kpi-header">
                <span className="gestor-kpi-label">Inscritos no Concurso</span>
                <span className="gestor-kpi-icon-wrap primary"><Users size={20} /></span>
              </div>
              <div className="gestor-kpi-value">{stats.total}</div>
              <div className="gestor-kpi-footer">
                <span className="gestor-kpi-sub">Total global • Ver Lista Completa ➔</span>
              </div>
            </div>

            <div 
              className="gestor-kpi-card"
              onClick={() => {
                setFiltroStatus('Em Análise Documental');
                setGestorTab('inscritos');
              }}
              style={{ cursor: 'pointer' }}
              title="Clique para filtrar inscritos em análise documental"
            >
              <div className="gestor-kpi-header">
                <span className="gestor-kpi-label">1ª Fase: Em Análise</span>
                <span className="gestor-kpi-icon-wrap warning"><Clock size={20} /></span>
              </div>
              <div className="gestor-kpi-value text-warning">{stats.analise}</div>
              <div className="gestor-kpi-footer">
                <span className="gestor-kpi-sub">Validação documental • Ver Candidatos ➔</span>
              </div>
            </div>

            <div 
              className="gestor-kpi-card"
              onClick={() => {
                setFiltroStatus('Entrevista Profissional');
                setGestorTab('inscritos');
              }}
              style={{ cursor: 'pointer' }}
              title="Clique para filtrar convocados para entrevista"
            >
              <div className="gestor-kpi-header">
                <span className="gestor-kpi-label">2ª Fase: Entrevista</span>
                <span className="gestor-kpi-icon-wrap info"><Calendar size={20} /></span>
              </div>
              <div className="gestor-kpi-value text-info">{stats.entrevista}</div>
              <div className="gestor-kpi-footer">
                <span className="gestor-kpi-sub">Aprovados fase 1 • Ver Convocados ➔</span>
              </div>
            </div>

            <div 
              className="gestor-kpi-card"
              onClick={() => {
                setFiltroStatus('Admitido');
                setGestorTab('inscritos');
              }}
              style={{ cursor: 'pointer' }}
              title="Clique para filtrar candidatos admitidos"
            >
              <div className="gestor-kpi-header">
                <span className="gestor-kpi-label">3ª Fase: Admitidos</span>
                <span className="gestor-kpi-icon-wrap success"><CheckCircle2 size={20} /></span>
              </div>
              <div className="gestor-kpi-value text-success">{stats.admitidos}</div>
              <div className="gestor-kpi-footer">
                <span className="gestor-kpi-sub">Provimento efetivo • Ver Admitidos ➔</span>
              </div>
            </div>

            <div 
              className="gestor-kpi-card"
              onClick={() => {
                setFiltroStatus('Aprovado (Suplente)');
                setGestorTab('inscritos');
              }}
              style={{ cursor: 'pointer' }}
              title="Clique para filtrar candidatos suplentes"
            >
              <div className="gestor-kpi-header">
                <span className="gestor-kpi-label">3ª Fase: Suplentes</span>
                <span className="gestor-kpi-icon-wrap warning"><Award size={20} /></span>
              </div>
              <div className="gestor-kpi-value text-warning">{stats.suplentes}</div>
              <div className="gestor-kpi-footer">
                <span className="gestor-kpi-sub">Reserva • Ver Suplentes ➔</span>
              </div>
            </div>

            <div 
              className="gestor-kpi-card"
              onClick={() => {
                setFiltroStatus('Excluído');
                setGestorTab('inscritos');
              }}
              style={{ cursor: 'pointer' }}
              title="Clique para filtrar candidaturas excluídas"
            >
              <div className="gestor-kpi-header">
                <span className="gestor-kpi-label">Candidaturas Excluídas</span>
                <span className="gestor-kpi-icon-wrap danger"><XCircle size={20} /></span>
              </div>
              <div className="gestor-kpi-value text-danger">{stats.excluidos}</div>
              <div className="gestor-kpi-footer">
                <span className="gestor-kpi-sub">Com fundamentação • Ver Excluídos ➔</span>
              </div>
            </div>
          </div>

          {/* SECÇÃO CENTRAL DE GRÁFICOS E ANÁLISE */}
          <div className="gestor-dashboard-cols">
            {/* Coluna 1: Distribuição por Vaga / Concorrência */}
            <div className="gestor-panel-card">
              <div className="gestor-panel-header">
                <h3>
                  <Briefcase size={18} color="#c32026" />
                  Concorrência por Carreira / Aviso de Abertura
                </h3>
                <span className="gestor-panel-tag">Vagas vs Inscritos</span>
              </div>
              <div className="gestor-panel-body">
                {INITIAL_VAGAS.map(vaga => {
                  const inscritosCount = stats.porVaga[vaga.titulo] || 0;
                  const percentVagas = Math.min(100, Math.round((inscritosCount / (vaga.vagas || 1)) * 100));
                  const ratio = vaga.vagas > 0 ? (inscritosCount / vaga.vagas).toFixed(1) : '0';

                  return (
                    <div key={vaga.id} className="gestor-progress-item">
                      <div className="gestor-progress-labels">
                        <span className="vaga-name">{vaga.titulo}</span>
                        <span className="vaga-numbers">
                          <strong>{inscritosCount}</strong> inscritos / <strong>{vaga.vagas}</strong> vagas 
                          <span className="ratio-tag">({ratio}:1)</span>
                        </span>
                      </div>
                      <div className="gestor-progress-bar-bg">
                        <div 
                          className="gestor-progress-bar-fill" 
                          style={{ width: `${Math.max(12, Math.min(100, percentVagas))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coluna 2: Distribuição por Província (12 Unidades: Direcção Geral + 11 Províncias) */}
            <div className="gestor-panel-card">
              <div className="gestor-panel-header">
                <h3>
                  <MapPin size={18} color="#c32026" />
                  Distribuição Territorial de Candidaturas
                </h3>
                <span className="gestor-panel-tag">12 Direcções Oficiais</span>
              </div>
              <div className="gestor-panel-body">
                <div className="gestor-prov-grid">
                  {Object.entries(stats.porProvincia).map(([prov, qtd]) => (
                    <div key={prov} className={`gestor-prov-chip ${prov === 'Direcção Geral' ? 'is-dg' : ''}`}>
                      <span className="prov-name">{prov}</span>
                      <span className="prov-count">{qtd}</span>
                    </div>
                  ))}
                </div>

                <div className="gestor-quick-card-banner">
                  <h4>Avaliação em Curso</h4>
                  <p>Existem <strong>{stats.analise}</strong> candidaturas a aguardar conferência de documentos.</p>
                  <button
                    type="button"
                    className="gestor-btn-primary-red"
                    onClick={() => {
                      const primeiroPendente = candidatos.find(c => c.status === 'Em Análise Documental' || c.status === 'Em análise' || c.status === 'Submetida');
                      if (primeiroPendente) {
                        iniciarDeliberacao(primeiroPendente);
                      } else {
                        setGestorTab('deliberacao');
                      }
                    }}
                  >
                    <FileSignature size={16} />
                    <span>Avaliar Candidatos Pendentes</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================
              SECÇÃO EM DESTAQUE ABAIXO: FUNIL DO CONCURSO EXPANDIDO
              ======================================================== */}
          <div className="gestor-funnel-full-card fadeIn">
            <div className="gestor-funnel-header">
              <div className="gestor-funnel-header-titles">
                <div className="gestor-funnel-icon-wrap">
                  <PieChart size={22} color="#ffffff" />
                </div>
                <div>
                  <h3>Progresso dos Candidatos no Concurso</h3>
                  <p>
                    Acompanhamento simples de todos os candidatos: desde a inscrição inicial, passando pela entrevista, até ao resultado final.
                  </p>
                </div>
              </div>

              <div className="gestor-funnel-header-tags">
                <span className="funnel-badge-live">
                  <span className="live-dot" /> Sincronização em Tempo Real
                </span>
                <span className="funnel-badge-count">
                  {stats.total} Candidaturas Processadas
                </span>
              </div>
            </div>

            {/* CONTEÚDO PRINCIPAL EXPANDIDO DO FUNIL */}
            <div className="gestor-funnel-expanded-body">
              {/* LADO 1: GRÁFICO DONUT GRANDE & PROEMINENTE */}
              <div className="funnel-expanded-donut-col">
                <div className="gestor-donut-svg-container large">
                  <svg viewBox="0 0 240 240" className="gestor-donut-svg">
                    <circle
                      cx="120"
                      cy="120"
                      r="84"
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.2)"
                      strokeWidth="26"
                    />
                    {donutSegmentsLarge.map((seg, idx) => (
                      <circle
                        key={idx}
                        cx="120"
                        cy="120"
                        r="84"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="26"
                        strokeDasharray={`${seg.dashLength} ${seg.dashGap}`}
                        strokeDashoffset={seg.dashOffset}
                        strokeLinecap="butt"
                        transform="rotate(-90 120 120)"
                        className="donut-segment"
                      >
                        <title>{`${seg.label}: ${seg.value} (${seg.percentage}%)`}</title>
                      </circle>
                    ))}
                  </svg>
                  <div className="gestor-donut-center-content">
                    <span className="donut-center-num large">{stats.total}</span>
                    <span className="donut-center-txt">Candidaturas</span>
                    <span className="donut-center-sub">100% Auditadas</span>
                  </div>
                </div>

                <div className="donut-quick-summary">
                  <div className="donut-summary-row">
                    <span className="dot-circle" style={{ backgroundColor: '#16a34a' }} />
                    <span>Admitidos + Suplentes:</span>
                    <strong>{stats.admitidos + stats.suplentes} ({stats.total > 0 ? Math.round(((stats.admitidos + stats.suplentes) / stats.total) * 100) : 0}%)</strong>
                  </div>
                  <div className="donut-summary-row">
                    <span className="dot-circle" style={{ backgroundColor: '#2563eb' }} />
                    <span>Em Entrevista:</span>
                    <strong>{stats.entrevista} ({stats.total > 0 ? Math.round((stats.entrevista / stats.total) * 100) : 0}%)</strong>
                  </div>
                  <div className="donut-summary-row">
                    <span className="dot-circle" style={{ backgroundColor: '#64748b' }} />
                    <span>Em Análise Documental:</span>
                    <strong>{stats.analise} ({stats.total > 0 ? Math.round((stats.analise / stats.total) * 100) : 0}%)</strong>
                  </div>
                </div>
              </div>

              {/* LADO 2: PIPELINE PROGRESSIVO DAS FASES DO FUNIL */}
              <div className="funnel-expanded-pipeline-col">
                <h4 className="pipeline-col-title">Etapas de Avaliação do Concurso</h4>
                
                <div className="pipeline-stages-list">
                  {funnelStages.map((stage, idx) => {
                    const pct = stats.total > 0 ? Math.round((stage.count / stats.total) * 100) : 0;
                    return (
                      <div key={idx} className="pipeline-stage-card">
                        <div className="stage-top-meta">
                          <div className="stage-left-info">
                            <span className="stage-step-pill" style={{ backgroundColor: stage.color }}>
                              {stage.step}
                            </span>
                            <span className="stage-name">{stage.title}</span>
                          </div>
                          <div className="stage-numbers">
                            <strong className="stage-count">{stage.count}</strong>
                            <span className="stage-pct">({pct}%)</span>
                          </div>
                        </div>

                        <div className="stage-bar-track">
                          <div
                            className="stage-bar-fill"
                            style={{
                              width: `${Math.max(6, pct)}%`,
                              backgroundColor: stage.color
                            }}
                          />
                        </div>

                        <div className="stage-desc">{stage.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LADO 3: CARTÕES DE EFICIÊNCIA & INDICADORES ESTRATÉGICOS */}
              <div className="funnel-expanded-kpis-col">
                <h4 className="pipeline-col-title">Indicadores Principais</h4>

                <div className="funnel-kpi-card green">
                  <div className="funnel-kpi-top">
                    <span className="kpi-label">Taxa de Sucesso</span>
                    <ShieldCheck size={20} className="kpi-icon" />
                  </div>
                  <div className="funnel-kpi-value">{taxaAdmissibilidade}%</div>
                  <div className="funnel-kpi-footnote">Candidatos admitidos ou suplentes</div>
                </div>

                <div className="funnel-kpi-card blue">
                  <div className="funnel-kpi-top">
                    <span className="kpi-label">Processos Já Avaliados</span>
                    <CheckCircle2 size={20} className="kpi-icon" />
                  </div>
                  <div className="funnel-kpi-value">{taxaTriagemConcluida}%</div>
                  <div className="funnel-kpi-footnote">{stats.total - stats.analise} de {stats.total} candidaturas analisadas</div>
                </div>

                <div className="funnel-kpi-card red">
                  <div className="funnel-kpi-top">
                    <span className="kpi-label">Taxa de Exclusão</span>
                    <XCircle size={20} className="kpi-icon" />
                  </div>
                  <div className="funnel-kpi-value">{stats.taxaExclusao}%</div>
                  <div className="funnel-kpi-footnote">{stats.excluidos} excluídos por não cumprirem os requisitos</div>
                </div>

                <div className="funnel-kpi-card gold">
                  <div className="funnel-kpi-top">
                    <span className="kpi-label">Tempo Médio de Avaliação</span>
                    <Clock size={20} className="kpi-icon" />
                  </div>
                  <div className="funnel-kpi-value">2.4 Dias</div>
                  <div className="funnel-kpi-footnote">Média de resposta para cada etapa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 2: INSCRITOS NO CONCURSO ("VER OS QUE SE INSCREVERAM")
          ======================================================== */}
      {gestorTab === 'inscritos' && (
        <div className="gestor-tab-content fadeIn">
          {/* BARRA DE FILTROS E BUSCA */}
          <div className="gestor-toolbar-card">
            <div className="gestor-search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Pesquisar por Nome, Número de BI, NUIT ou Código de Protocolo..."
                value={buscaInscrito}
                onChange={(e) => handleBuscaInscritoChange(e.target.value)}
                className="gestor-search-input"
              />
              {buscaInscrito && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => handleBuscaInscritoChange('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="gestor-filters-row">
              <div className="gestor-filter-select-group">
                <label>Carreira:</label>
                <select value={filtroVaga} onChange={(e) => handleFiltroVagaChange(e.target.value)}>
                  <option value="todas">Todas as Carreiras</option>
                  {opcoesCarreiras.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="gestor-filter-select-group">
                <label>Província:</label>
                <select value={filtroProvincia} onChange={(e) => handleFiltroProvinciaChange(e.target.value)}>
                  <option value="todas">Todas as Províncias</option>
                  {PROVINCIAS_MOCAMBIQUE.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="gestor-filter-select-group">
                <label>Fase / Estado:</label>
                <select value={filtroStatus} onChange={(e) => handleFiltroStatusChange(e.target.value)}>
                  <option value="todos">Todos os Estados</option>
                  <option value="Em Análise Documental">1ª Fase: Em Análise Documental</option>
                  <option value="Admitido na Análise Documental">1ª Fase: Admitido(a) na Análise Documental</option>
                  <option value="Excluído na Análise Documental">1ª Fase: Excluído(a) na Análise Documental</option>
                  <option value="Entrevista Profissional">2ª Fase: Convocado(a) p/ Entrevista</option>
                  <option value="Excluído na Entrevista">2ª Fase: Excluído(a) na Entrevista</option>
                  <option value="Admitido">3ª Fase: Admitido(a) (Vaga Efetiva)</option>
                  <option value="Aprovado (Suplente)">3ª Fase: Aprovado(a) (Suplente / Reserva)</option>
                  <option value="Excluído">Excluídos do Concurso (Todos)</option>
                </select>
              </div>

              <div className="gestor-filter-select-group">
                <label>Género:</label>
                <select value={filtroGenero} onChange={(e) => handleFiltroGeneroChange(e.target.value)}>
                  <option value="todos">Todos</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>

              <div className="gestor-toolbar-actions">
                <button
                  type="button"
                  className="gestor-btn-outline"
                  style={{ color: '#c32026', borderColor: 'rgba(195, 32, 38, 0.35)', background: 'rgba(195, 32, 38, 0.05)' }}
                  onClick={() => {
                    setSenhaResetGeral('');
                    setErroResetGeral('');
                    setIsModalResetGeralOpen(true);
                  }}
                  title="Repor todos os candidatos no estado inicial de teste (requer confirmação com senha do gestor)"
                >
                  <RefreshCw size={15} />
                  <span>Repor Candidaturas (Requer Senha)</span>
                </button>
                <button
                  type="button"
                  className="gestor-btn-outline"
                  onClick={handleExportCSV}
                  title="Descarregar lista em formato CSV"
                >
                  <Download size={15} />
                  <span>Exportar CSV</span>
                </button>
                <button
                  type="button"
                  className="gestor-btn-outline"
                  onClick={handleImprimirPautaInscritos}
                  title="Imprimir listagem oficial timbrada de candidatos inscritos"
                >
                  <Printer size={15} />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  className="gestor-btn-outline"
                  onClick={() => sincronizarComServidor(true)}
                  disabled={estadoServidor.estado === 'a-carregar'}
                  title="Carregar do servidor ou sincronizar base de dados local"
                >
                  <RefreshCw size={15} />
                  <span>Actualizar do servidor</span>
                </button>
                <span className={`gestor-sync-pill on-card ${estadoServidor.estado}`} role="status" title={estadoServidor.detalhe || ''}>
                  {ROTULO_SYNC[estadoServidor.estado] || 'Base local sincronizada'}
                </span>
              </div>
            </div>
          </div>

          {/* CONTADOR DE RESULTADOS E PAGINAÇÃO */}
          <div className="gestor-results-meta">
            <span>
              {filteredCandidatos.length > 0 ? (
                <>
                  A exibir <strong>{(paginaInscritos - 1) * ITENS_POR_PAGINA_INSCRITOS + 1}</strong> a <strong>{Math.min(paginaInscritos * ITENS_POR_PAGINA_INSCRITOS, filteredCandidatos.length)}</strong> de <strong>{filteredCandidatos.length}</strong> candidatos inscritos (Página <strong>{paginaInscritos}</strong> de <strong>{totalPaginasInscritos}</strong>)
                </>
              ) : (
                <>A exibir <strong>0</strong> de <strong>{candidatos.length}</strong> candidatos inscritos</>
              )}
            </span>
            {(filtroVaga !== 'todas' || filtroProvincia !== 'todas' || filtroStatus !== 'todos' || filtroGenero !== 'todos' || buscaInscrito) && (
              <button
                type="button"
                className="btn-reset-filters"
                onClick={handleResetFiltrosInscritos}
              >
                Limpar filtros
              </button>
            )}
          </div>

          {/* TABELA DE INSCRITOS */}
          <div className="gestor-table-wrapper">
            <table className="gestor-table">
              <thead>
                <tr>
                  <th>Candidato / Identificação</th>
                  <th>Carreira Pretendida</th>
                  <th>Província</th>
                  <th>Data de Inscrição</th>
                  <th>Estado Oficial</th>
                  <th>Classificação / Notas</th>
                  <th style={{ textAlign: 'center' }}>Ações de Gestão</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCandidatos.map(c => {
                  const b = getBadgeStyle(c.status, c);
                  const hasInterviewNota = c.deliberacaoJuri?.notaFinal !== undefined && c.deliberacaoJuri?.notaFinal !== null && c.deliberacaoJuri?.notaFinal !== '';
                  const notaNum = hasInterviewNota ? parseFloat(c.deliberacaoJuri.notaFinal) : null;

                  return (
                    <tr key={c.codigoCandidatura}>
                      <td>
                        <div className="candidato-cell">
                          <div className="candidato-avatar-wrap" title={`Biometria: ${c.validacaoFacial?.scoreBiometrico || 98}% • ${c.validacaoFacial?.iluminacao || 'Iluminação Ideal'}`}>
                            <img 
                              src={c.fotoUrl || getCandidatePhotoUrl(c.genero, c.nomeCompleto.length)} 
                              alt={c.nomeCompleto}
                              className="candidato-avatar-round"
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getCandidatePhotoUrl(c.genero, 0);
                              }}
                            />
                            <span className="candidato-ai-badge" title="Rosto Identificado & Iluminação Homologada por IA">
                              <Sparkles size={9} />
                            </span>
                          </div>
                          <div className="candidato-info">
                            <span className="candidato-nome">{c.nomeCompleto}</span>
                            <span className="candidato-sub">
                              BI: <strong>{c.biNumero}</strong> • NUIT: {c.nuit} • {c.idade || 28} anos
                            </span>
                            <span className="candidato-protocolo">{c.codigoCandidatura}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="vaga-cell">
                          <span className="vaga-title-table">{c.vagaTitulo}</span>
                          <span className="vaga-carreira-sub">{c.carreira}</span>
                        </div>
                      </td>
                      <td>
                        <span className="provincia-tag">
                          <MapPin size={13} />
                          {c.provincia || 'Maputo Cidade'}
                        </span>
                      </td>
                      <td>
                        <span className="data-submissao">
                          {c.dataSubmissao ? new Date(c.dataSubmissao).toLocaleDateString('pt-PT') : '2026-10-15'}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="gestor-status-pill"
                          style={{ backgroundColor: b.bg, color: b.color, borderColor: b.border }}
                        >
                          {b.icon}
                          <span>{b.label}</span>
                        </span>
                        {c.detalhesFase?.local && (c.status === 'Admitido na Análise Documental' || c.status === 'Entrevista Profissional') && (
                          <div style={{ fontSize: '0.72rem', color: '#1d4ed8', marginTop: '0.25rem', fontWeight: 700 }}>
                            📍 Entrevista: {c.detalhesFase.dataEvento || '15/11/2026'}
                          </div>
                        )}
                        {c.admitidoPor && (
                          <div className="table-admitido-por-sub" title={`Homologado por: ${c.admitidoPor.nome} • ${c.admitidoPor.cargo}`}>
                            <ShieldCheck size={11} color="#15803d" />
                            <span>Admitido(a) por: <strong>{c.admitidoPor.nome}</strong></span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="table-notas-cell">
                          {hasInterviewNota ? (
                            <div className={`table-nota-badge ${notaNum >= 10 ? 'positive' : 'negative'}`}>
                              <Award size={13} />
                              <span>Entrevista: <strong>{c.deliberacaoJuri.notaFinal} val.</strong></span>
                            </div>
                          ) : (
                            <span className="table-nota-pendente">Entrevista por realizar</span>
                          )}
                          <div className="table-media-sub">
                            <span>Média Curso: <strong>{c.habilitacoes?.mediaFinal || '14.0'} val.</strong></span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="gestor-row-actions">
                          <button
                            type="button"
                            className="btn-action-view"
                            onClick={() => setSelectedDossier(c)}
                            title="Ver Dossier Completo do Candidato"
                          >
                            <Eye size={15} />
                            <span>Dossier</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action-deliberar"
                            onClick={() => iniciarDeliberacao(c)}
                            title="Avaliar candidato no módulo Avaliação dos Candidatos"
                          >
                            <FileSignature size={15} />
                            <span>Avaliar Candidato</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action-repor"
                            onClick={() => setCandidatoParaReporIndividual(c)}
                            title="Repor este candidato no estado inicial de candidatura (1ª Fase: Em Análise Documental)"
                          >
                            <RotateCcw size={14} />
                            <span>Repor</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action-repor"
                            style={{ color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.3)', background: 'rgba(220, 38, 38, 0.05)' }}
                            onClick={() => handleSolicitarEliminacaoCandidato(c)}
                            title={isSuperAdminTecnico ? "Apagar perfil do candidato definitivamente (Super Administrador)" : "Apagar perfil do candidato (requer autorização do Técnico)"}
                          >
                            <Trash2 size={14} />
                            <span>Apagar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredCandidatos.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                      <AlertCircle size={38} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                      <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--portal-text-main)' }}>
                        Nenhum candidato encontrado com os filtros selecionados.
                      </p>
                      <p style={{ color: 'var(--portal-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Tente ajustar a sua pesquisa ou limpe os filtros aplicados.
                      </p>
                      <button
                        type="button"
                        className="gestor-btn-outline"
                        style={{ margin: '0 auto' }}
                        onClick={handleResetFiltrosInscritos}
                      >
                        Limpar todos os filtros
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* BARRA DE PAGINAÇÃO OFICIAL (20 CANDIDATOS POR PÁGINA) */}
            {filteredCandidatos.length > 0 && (
              <div className="gestor-pagination-wrapper">
                <div className="gestor-pagination-info">
                  <span>A exibir página <strong>{paginaInscritos}</strong> de <strong>{totalPaginasInscritos}</strong></span>
                  <span className="gestor-pagination-badge">20 candidatos por página</span>
                </div>

                <div className="gestor-pagination-controls">
                  <button
                    type="button"
                    className="gestor-page-btn"
                    onClick={() => setPaginaInscritos(1)}
                    disabled={paginaInscritos === 1}
                    title="Primeira Página"
                  >
                    « Primeira
                  </button>
                  <button
                    type="button"
                    className="gestor-page-btn"
                    onClick={() => setPaginaInscritos(p => Math.max(1, p - 1))}
                    disabled={paginaInscritos === 1}
                    title="Página Anterior"
                  >
                    ‹ Anterior
                  </button>

                  {/* Botões numéricos de páginas */}
                  {Array.from({ length: totalPaginasInscritos }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`gestor-page-btn ${paginaInscritos === pageNum ? 'active' : ''}`}
                      onClick={() => setPaginaInscritos(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="gestor-page-btn"
                    onClick={() => setPaginaInscritos(p => Math.min(totalPaginasInscritos, p + 1))}
                    disabled={paginaInscritos === totalPaginasInscritos}
                    title="Página Seguinte"
                  >
                    Seguinte ›
                  </button>
                  <button
                    type="button"
                    className="gestor-page-btn"
                    onClick={() => setPaginaInscritos(totalPaginasInscritos)}
                    disabled={paginaInscritos === totalPaginasInscritos}
                    title="Última Página"
                  >
                    Última »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 3: DELIBERAÇÃO DO JÚRI ("AVALIAÇÃO DOS CANDIDATOS")
          ======================================================== */}
      {gestorTab === 'deliberacao' && (
        <div className="gestor-tab-content fadeIn">
          {/* CABEÇALHO SÓBRIO E SEM POLUIÇÃO (REGRA 1) */}
          <div className="deliberacao-module-header">
            <div className="deliberacao-header-row">
              <div className="deliberacao-header-left">
                <h2>Avaliação de Candidatos</h2>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {isPrincipalOrSuper && (
                  <button
                    type="button"
                    className="btn-deliberacao-primary-green"
                    title="Homologar e publicar oficialmente todas as deliberações pendentes nas contas dos candidatos"
                    onClick={() => {
                      const count = homologarEPublicarTodasCandidaturas(currentUser);
                      reloadData();
                      if (onNotify) {
                        if (count > 0) {
                          onNotify('success', `${count} deliberação(ões) homologada(s) e publicada(s) oficialmente com sucesso!`);
                        } else {
                          onNotify('info', 'Todas as candidaturas já se encontram homologadas e publicadas.');
                        }
                      }
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>Homologar e Publicar Todos</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-deliberacao-secondary"
                  title="Repor todos os candidatos de teste na fase inicial com confirmação por senha"
                  onClick={() => {
                    setSenhaResetGeral('');
                    setErroResetGeral('');
                    setIsModalResetGeralOpen(true);
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Repor dados de teste</span>
                </button>
              </div>
            </div>
          </div>

          {/* ABAS DE CATEGORIA LIMPAS (SEM EMOJIS, CONFORME REGRA 1) */}
          <div className="deliberacao-filter-toolbar">
            <div className="deliberacao-filter-tabs">
              <button
                type="button"
                className={`deliberacao-tab-btn ${filtroDeliberacaoModo === 'pendentes' ? 'active' : ''}`}
                onClick={() => {
                  setFiltroDeliberacaoModo('pendentes');
                  const first = candidatos.find(c => c.status === 'Em Análise Documental' || c.status === 'Em análise' || c.status === 'Submetida');
                  if (first) iniciarDeliberacao(first);
                }}
              >
                <span>Pendentes</span>
                <span className="tab-count">{stats.pendentesTotal}</span>
              </button>

              <button
                type="button"
                className={`deliberacao-tab-btn ${filtroDeliberacaoModo === 'convocados' ? 'active' : ''}`}
                onClick={() => {
                  setFiltroDeliberacaoModo('convocados');
                  const first = candidatos.find(c => c.status === 'Entrevista Profissional' || c.status === 'Convocada para provas' || c.status === 'Convocado para provas' || c.status === 'Admitido na Análise Documental' || c.status === 'Admitida na Análise Documental');
                  if (first) iniciarDeliberacao(first);
                }}
              >
                <span>Convocados</span>
                <span className="tab-count">{stats.convocadosTotal}</span>
              </button>

              <button
                type="button"
                className={`deliberacao-tab-btn ${filtroDeliberacaoModo === 'admitidos' ? 'active' : ''}`}
                onClick={() => {
                  setFiltroDeliberacaoModo('admitidos');
                  const first = candidatos.find(c => c.status === 'Admitido na Análise Documental' || c.status === 'Admitida na Análise Documental' || c.status === 'Admitido' || c.status === 'Admitida');
                  if (first) iniciarDeliberacao(first);
                }}
              >
                <span>Admitidos</span>
                <span className="tab-count">{stats.admitidosTotal}</span>
              </button>

              <button
                type="button"
                className={`deliberacao-tab-btn ${filtroDeliberacaoModo === 'suplentes' ? 'active' : ''}`}
                onClick={() => {
                  setFiltroDeliberacaoModo('suplentes');
                  const first = candidatos.find(c => c.status === 'Aprovado (Suplente)' || c.status === 'Aprovada (Suplente)');
                  if (first) iniciarDeliberacao(first);
                }}
              >
                <span>Suplentes</span>
                <span className="tab-count">{stats.suplentesTotal}</span>
              </button>

              <button
                type="button"
                className={`deliberacao-tab-btn ${filtroDeliberacaoModo === 'excluidos' ? 'active' : ''}`}
                onClick={() => {
                  setFiltroDeliberacaoModo('excluidos');
                  const first = candidatos.find(c => (c.status && c.status.includes('Excluíd')) || (c.deliberacaoJuri?.notaFinal && parseFloat(c.deliberacaoJuri.notaFinal) < 10));
                  if (first) iniciarDeliberacao(first);
                }}
              >
                <span>Excluídos</span>
                <span className="tab-count">{stats.excluidosTotal}</span>
              </button>
            </div>
          </div>

          <div className="deliberacao-container-grid">
            {/* LADO ESQUERDO: LISTAGEM DE CANDIDATOS */}
            <div className="deliberacao-sidebar-card">
              <div className="deliberacao-sidebar-header">
                <h3>Candidatos ({filteredDeliberacaoCandidatos.length})</h3>
              </div>

              {/* PESQUISA E FILTROS RÁPIDOS */}
              <div className="deliberacao-sidebar-search">
                <div className="deliberacao-search-box">
                  <Search size={14} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome, BI, NUIT..."
                    value={buscaDeliberacao}
                    onChange={(e) => setBuscaDeliberacao(e.target.value)}
                  />
                  {buscaDeliberacao && (
                    <button type="button" onClick={() => setBuscaDeliberacao('')}>✕</button>
                  )}
                </div>

                <div className="deliberacao-sidebar-filters-row">
                  <select
                    value={filtroDeliberacaoVaga}
                    onChange={(e) => setFiltroDeliberacaoVaga(e.target.value)}
                  >
                    <option value="todas">Todas as Carreiras</option>
                    {INITIAL_VAGAS.map(v => (
                      <option key={v.id} value={v.titulo}>{v.titulo}</option>
                    ))}
                  </select>

                  <select
                    value={filtroDeliberacaoProvincia}
                    onChange={(e) => setFiltroDeliberacaoProvincia(e.target.value)}
                  >
                    <option value="todas">Todas Províncias</option>
                    {PROVINCIAS_MOCAMBIQUE.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LISTAGEM DE CANDIDATOS */}
              <div className="deliberacao-candidatos-list">
                {filteredDeliberacaoCandidatos.map(c => {
                  const b = getBadgeStyle(c.status, c);
                  const isSelected = deliberandoCandidato?.codigoCandidatura === c.codigoCandidatura;
                  const hasInterviewNota = c.deliberacaoJuri?.notaFinal !== undefined && c.deliberacaoJuri?.notaFinal !== null && c.deliberacaoJuri?.notaFinal !== '';
                  const notaNum = hasInterviewNota ? parseFloat(c.deliberacaoJuri.notaFinal) : null;

                  return (
                    <div
                      key={c.codigoCandidatura}
                      className={`deliberacao-candidato-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setDeliberandoCandidato(c);
                        const isF1 = c.faseAtual === 1 || c.status === 'Em Análise Documental' || c.status === 'Em análise' || c.status === 'Submetida';
                        const isF2 = c.faseAtual === 2 || c.status === 'Admitido na Análise Documental' || c.status === 'Admitida na Análise Documental' || c.status === 'Entrevista Profissional' || c.status === 'Convocada para provas';
                        const isFem = detectCandidateGender(c) === 'Feminino';

                        if (isF1) {
                          setNovoEstado(isFem ? 'Admitida na Análise Documental' : 'Admitido na Análise Documental');
                          setParecerJuri(`Candidatura com documentação em conformidade. ${isFem ? 'Admitida' : 'Admitido'} na Análise Documental (1ª Fase) e convocada para a Entrevista Profissional.`);
                          setEventoLocal(c.detalhesFase?.local || `Gabinete Provincial de Entrevistas do SERNIC - ${c.provincia || 'Maputo'}`);
                          setEventoData(c.detalhesFase?.dataEvento || '15 de Novembro de 2026 às 08h30');
                        } else if (isF2) {
                          const currentNota = c.deliberacaoJuri?.notaFinal ? parseFloat(c.deliberacaoJuri.notaFinal) : 16.0;
                          if (currentNota < 10.0) {
                            setNovoEstado(isFem ? 'Excluída na Entrevista' : 'Excluído na Entrevista');
                            setParecerJuri(`Classificação de ${currentNota} valores na Entrevista Profissional (< 10 valores). Candidato reprovado e obrigatoriamente excluído.`);
                            setMotivoExclusao('Nota inferior a 10 valores na Entrevista Profissional');
                          } else {
                            setNovoEstado(isFem ? 'Admitida' : 'Admitido');
                            setParecerJuri(`Excelente aproveitamento na Entrevista Profissional com nota de ${currentNota} valores. Proposta para provimento efetivo da vaga.`);
                          }
                          setNotaFinal(String(currentNota));
                        } else {
                          setNovoEstado(c.status);
                          setParecerJuri(c.deliberacaoJuri?.parecer || '');
                        }

                        if (c.deliberacaoJuri?.motivoExclusao) {
                          setMotivoExclusao(c.deliberacaoJuri.motivoExclusao);
                        }
                        if (c.deliberacaoJuri?.notaFinal) {
                          setNotaFinal(c.deliberacaoJuri.notaFinal);
                        }
                        if (c.detalhesFase?.local) {
                          setEventoLocal(c.detalhesFase.local);
                        }
                        if (c.detalhesFase?.dataEvento) {
                          setEventoData(c.detalhesFase.dataEvento);
                        }
                      }}
                    >
                      <div className="item-top">
                        <span className="item-name">{c.nomeCompleto}</span>
                        <span className="item-status-tag" style={{ color: b.color }}>{b.label}</span>
                      </div>

                      <div className="item-sub">
                        <span>{c.vagaTitulo} • {c.provincia || 'Maputo'}</span>
                      </div>

                      <div className="item-meta">
                        <span className="item-protocolo">{c.codigoCandidatura}</span>
                        {hasInterviewNota && (
                          <span className="item-nota-pill">Nota: {c.deliberacaoJuri.notaFinal} val.</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredDeliberacaoCandidatos.length === 0 && (
                  <div className="deliberacao-empty-list">
                    <p>Nenhum candidato nesta pasta.</p>
                    <button
                      type="button"
                      className="btn-link-action"
                      onClick={() => {
                        setFiltroDeliberacaoModo('pendentes');
                        setBuscaDeliberacao('');
                        setFiltroDeliberacaoVaga('todas');
                        setFiltroDeliberacaoProvincia('todas');
                      }}
                    >
                      Ver pendentes de avaliação
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* LADO DIREITO: ESTAÇÃO FORMAL DE DELIBERAÇÃO */}
            <div className="deliberacao-main-panel">
              {deliberandoCandidato ? (
                <div className="deliberacao-form-card">
                  {/* CABEÇALHO DO CANDIDATO */}
                  <div className="deliberacao-candidate-header">
                    <div className="candidate-summary-left">
                      <img 
                        src={deliberandoCandidato.fotoUrl || getCandidatePhotoUrl(deliberandoCandidato.genero, deliberandoCandidato.nomeCompleto.length)} 
                        alt={deliberandoCandidato.nomeCompleto}
                        className="candidate-header-photo-round"
                      />
                      <div>
                        <div className="candidate-status-flex">
                          <h2>{deliberandoCandidato.nomeCompleto}</h2>
                          {(() => {
                            const b = getBadgeStyle(deliberandoCandidato.status, deliberandoCandidato);
                            return (
                              <span 
                                className="gestor-status-pill"
                                style={{ backgroundColor: b.bg, color: b.color, borderColor: b.border }}
                              >
                                {b.label}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="candidate-summary-sub">
                          Protocolo: <strong>{deliberandoCandidato.codigoCandidatura}</strong> • 
                          BI: <strong>{deliberandoCandidato.biNumero}</strong> • 
                          Idade: <strong>{deliberandoCandidato.idade || 28} anos</strong> • 
                          Província: <strong>{deliberandoCandidato.provincia || 'Maputo'}</strong>
                        </p>
                        <p className="candidate-vaga-text">
                          Candidatura a: <strong>{deliberandoCandidato.vagaTitulo}</strong> ({deliberandoCandidato.carreira})
                        </p>
                      </div>
                    </div>

                    <div className="candidate-header-actions-right">
                      <button
                        type="button"
                        className="btn-action-outline"
                        onClick={() => setSelectedDossier(deliberandoCandidato)}
                      >
                        <Eye size={14} />
                        <span>Abrir Dossier</span>
                      </button>

                      <button
                        type="button"
                        className="btn-action-outline"
                        onClick={() => setCandidatoParaReporIndividual(deliberandoCandidato)}
                        title="Repor este candidato na fase inicial"
                      >
                        <RotateCcw size={14} />
                        <span>Repor</span>
                      </button>

                      <button
                        type="button"
                        className="btn-action-outline"
                        style={{ color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.3)', background: 'rgba(220, 38, 38, 0.05)' }}
                        onClick={() => handleSolicitarEliminacaoCandidato(deliberandoCandidato)}
                        title={isSuperAdminTecnico ? "Apagar este perfil definitivamente" : "Apagar perfil (requer autorização do Técnico)"}
                      >
                        <Trash2 size={14} />
                        <span>Apagar Perfil</span>
                      </button>
                    </div>
                  </div>

                  {/* REGISTO DE HOMOLOGAÇÃO (SE JÁ ADMITIDO) */}
                  {deliberandoCandidato.admitidoPor && (
                    <div className="deliberacao-homologacao-info">
                      <span>Homologado por: <strong>{deliberandoCandidato.admitidoPor.nome}</strong> ({deliberandoCandidato.admitidoPor.cargo}) • {deliberandoCandidato.admitidoPor.dataHomologacao}</span>
                    </div>
                  )}

                  {/* APRESENTAÇÃO DIRECTA DOS DADOS (SEM CARTÕES DECORATIVOS - REGRA 1) */}
                  <div className="deliberacao-dados-strip">
                    <div className="dado-col">
                      <span className="dado-label">Média de Ingresso:</span>
                      <strong className="dado-val">{deliberandoCandidato.habilitacoes?.mediaFinal || '14.0'} val.</strong>
                      <span className="dado-sub">({deliberandoCandidato.habilitacoes?.curso || 'Habilitações'})</span>
                    </div>

                    <div className="dado-col">
                      <span className="dado-label">Fase Atual do Candidato:</span>
                      <strong className="dado-val" style={{ color: '#c32026' }}>
                        {(() => {
                          const cf = deliberandoCandidato.faseAtual || 1;
                          if (cf === 1) return '1ª Fase: Análise Documental';
                          if (cf === 2) return '2ª Fase: Convocatória';
                          if (cf === 3) return '3ª Fase: Teste Escrito';
                          return '4ª Fase: Entrevista Profissional';
                        })()}
                      </strong>
                    </div>

                    <div className="dado-col">
                      <span className="dado-label">Nota do Teste Escrito:</span>
                      <strong className="dado-val">
                        {deliberandoCandidato.deliberacaoJuri?.notaExameEscrito 
                          ? `${deliberandoCandidato.deliberacaoJuri.notaExameEscrito} val.` 
                          : (deliberandoCandidato.haveraExameEscrito === 'nao' ? 'Isento' : 'Pendente')}
                      </strong>
                    </div>

                    <div className="dado-col">
                      <span className="dado-label">Nota da Entrevista:</span>
                      <strong className="dado-val">
                        {deliberandoCandidato.deliberacaoJuri?.notaFinal ? `${deliberandoCandidato.deliberacaoJuri.notaFinal} val.` : 'Pendente'}
                      </strong>
                    </div>
                  </div>

                  {/* NOTIFICAÇÃO DE PARECER DO JÚRI AGUARDANDO HOMOLOGAÇÃO PELO ADMINISTRADOR PRINCIPAL */}
                  {deliberandoCandidato.parecerJuriPendente && isPrincipalOrSuper && (
                    <div className="deliberacao-parecer-pendente-banner">
                      <div className="parecer-info">
                        <span className="parecer-badge">Parecer do Júri Aguardando Homologação</span>
                        <p>
                          <strong>Proposta Técnica:</strong> {deliberandoCandidato.parecerJuriPendente.status}
                          {deliberandoCandidato.parecerJuriPendente.notaExameEscrito && ` • Teste Escrito: ${deliberandoCandidato.parecerJuriPendente.notaExameEscrito} val.`}
                          {deliberandoCandidato.parecerJuriPendente.notaFinal && ` • Entrevista: ${deliberandoCandidato.parecerJuriPendente.notaFinal} val.`}
                        </p>
                        <p className="parecer-desc">
                          {deliberandoCandidato.parecerJuriPendente.parecer}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn-deliberacao-primary-green"
                        onClick={() => {
                          const res = homologarEPublicarCandidatura(deliberandoCandidato.codigoCandidatura, currentUser);
                          if (res) {
                            reloadData();
                            setDeliberandoCandidato(res);
                            if (onNotify) onNotify('success', `Decisão homologada e publicada oficialmente na conta de ${deliberandoCandidato.nomeCompleto}!`);
                          }
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Homologar e Publicar na Conta do Candidato</span>
                      </button>
                    </div>
                  )}

                  {deliberandoCandidato.parecerJuriPendente && isJuriUser && (
                    <div className="deliberacao-parecer-info-banner">
                      <Clock size={16} />
                      <span>O parecer deste candidato foi registado com sucesso e aguarda homologação do Administrador Principal para publicação oficial.</span>
                    </div>
                  )}

                  {/* FORMULÁRIO DE DELIBERAÇÃO FORMAL */}
                  <form onSubmit={handleGravarDeliberacao} className="deliberacao-form-body">
                    {(() => {
                      const candFase = deliberandoCandidato.faseAtual || (
                        (deliberandoCandidato.status === 'Em Análise Documental' || deliberandoCandidato.status === 'Em análise' || deliberandoCandidato.status === 'Submetida') ? 1 :
                        (deliberandoCandidato.status === 'Aprovado na Análise Documental' || deliberandoCandidato.status === 'Aprovada na Análise Documental' || deliberandoCandidato.status === 'Admitido na Análise Documental' || deliberandoCandidato.status === 'Admitida na Análise Documental') ? 2 :
                        (deliberandoCandidato.status === 'Convocado para Teste Escrito' || deliberandoCandidato.status === 'Convocada para Teste Escrito') ? 3 :
                        4
                      );

                      const isDelibFem = detectCandidateGender(deliberandoCandidato) === 'Feminino';

                      return (
                        <>
                          {/* FASE 1: ANÁLISE DOCUMENTAL */}
                          {candFase === 1 && (
                            <div className="deliberacao-section-block">
                              <label className="deliberacao-section-label">1ª Fase: Decisão da Análise Documental</label>
                              <div className="deliberacao-clean-choices">
                                <label className={`deliberacao-choice-btn ${(novoEstado.includes('Aprovad') || novoEstado.includes('Admitid')) ? 'checked' : ''}`}>
                                  <input
                                    type="radio"
                                    name="estadoDeliberacao"
                                    value="Aprovado na Análise Documental"
                                    checked={novoEstado.includes('Aprovad') || novoEstado.includes('Admitid')}
                                    onChange={() => {
                                      setNovoEstado(isDelibFem ? 'Aprovada na Análise Documental' : 'Aprovado na Análise Documental');
                                      setParecerJuri(`Documentação em conformidade com o Edital. Candidato aprovado na 1ª Fase (Análise Documental) e encaminhado para a 2ª Fase.`);
                                    }}
                                  />
                                  <div className="choice-info">
                                    <strong>Aprovado na Análise Documental</strong>
                                    <span>Documentação em conformidade. Candidato avança para a 2ª Fase (Convocatória).</span>
                                  </div>
                                </label>

                                <label className={`deliberacao-choice-btn ${(novoEstado.includes('Reprovad') || novoEstado.includes('Excluíd')) ? 'checked' : ''}`}>
                                  <input
                                    type="radio"
                                    name="estadoDeliberacao"
                                    value="Reprovado na Análise Documental"
                                    checked={novoEstado.includes('Reprovad') || novoEstado.includes('Excluíd')}
                                    onChange={() => {
                                      setNovoEstado(isDelibFem ? 'Reprovada na Análise Documental' : 'Reprovado na Análise Documental');
                                      setParecerJuri(`Candidatura reprovada na Análise Documental por não conformidade dos requisitos regulamentares.`);
                                    }}
                                  />
                                  <div className="choice-info">
                                    <strong>Reprovado na Análise Documental</strong>
                                    <span>Documentos incompletos ou inconformes com os requisitos do Edital.</span>
                                  </div>
                                </label>
                              </div>
                            </div>
                          )}

                          {/* FASE 2: CONVOCATÓRIA E OPÇÃO DE EXAME ESCRITO */}
                          {candFase === 2 && (
                            <div className="deliberacao-section-block">
                              <label className="deliberacao-section-label">2ª Fase: Haverá Exame Escrito para este Candidato / Carreira?</label>
                              <div className="deliberacao-clean-choices">
                                <label className={`deliberacao-choice-btn ${haveraExameEscrito === 'sim' ? 'checked' : ''}`}>
                                  <input
                                    type="radio"
                                    name="haveraExameEscrito"
                                    value="sim"
                                    checked={haveraExameEscrito === 'sim'}
                                    onChange={() => {
                                      setHaveraExameEscrito('sim');
                                      setNovoEstado(isDelibFem ? 'Convocada para Teste Escrito' : 'Convocado para Teste Escrito');
                                      setParecerJuri(`Convocado para Teste Escrito em ${localExameEscrito}.`);
                                    }}
                                  />
                                  <div className="choice-info">
                                    <strong>Sim, haverá Exame Escrito</strong>
                                    <span>Candidato realizará prova escrita e avança para a 3ª Fase (Teste Escrito).</span>
                                  </div>
                                </label>

                                <label className={`deliberacao-choice-btn ${haveraExameEscrito === 'nao' ? 'checked' : ''}`}>
                                  <input
                                    type="radio"
                                    name="haveraExameEscrito"
                                    value="nao"
                                    checked={haveraExameEscrito === 'nao'}
                                    onChange={() => {
                                      setHaveraExameEscrito('nao');
                                      setNovoEstado(isDelibFem ? 'Convocada para Entrevista Profissional' : 'Convocado para Entrevista Profissional');
                                      setParecerJuri(`Dispensado de teste escrito. Convocado diretamente para a Entrevista Profissional.`);
                                    }}
                                  />
                                  <div className="choice-info">
                                    <strong>Não, avança diretamente para a Entrevista Profissional</strong>
                                    <span>Dispensado de prova escrita. Candidato avança diretamente para a 4ª Fase (Entrevista).</span>
                                  </div>
                                </label>
                              </div>

                              {haveraExameEscrito === 'sim' ? (
                                <div className="deliberacao-fields-group" style={{ marginTop: '1.25rem' }}>
                                  <div className="fields-group-title">Convocatória para Teste Escrito (Locais por Direcção)</div>
                                  <div className="form-field full-width">
                                    <label>Direcção Provincial e Local do Teste Escrito *:</label>
                                    <select
                                      value={localExameEscrito}
                                      onChange={(e) => setLocalExameEscrito(e.target.value)}
                                      className="gestor-select"
                                      required
                                    >
                                      {Object.entries(LOCAIS_DIRECCOES_PROVINCIAIS).map(([prov, loc]) => (
                                        <option key={prov} value={loc}>
                                          {prov} — {loc}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="extra-box-grid-two" style={{ marginTop: '0.75rem' }}>
                                    <div className="form-field">
                                      <label>Data e Hora do Teste Escrito *:</label>
                                      <input
                                        type="text"
                                        value={dataExameEscrito}
                                        onChange={(e) => setDataExameEscrito(e.target.value)}
                                        placeholder="Ex: 20 de Novembro de 2026 às 09h00"
                                        required
                                      />
                                    </div>
                                    <div className="form-field">
                                      <label>Sala de Provas *:</label>
                                      <input
                                        type="text"
                                        value={salaExameEscrito}
                                        onChange={(e) => setSalaExameEscrito(e.target.value)}
                                        placeholder="Ex: Sala de Provas n.º 01"
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="deliberacao-fields-group" style={{ marginTop: '1.25rem' }}>
                                  <div className="fields-group-title">Agendamento Direto da Entrevista Profissional (4ª Fase)</div>
                                  <div className="extra-box-grid-two">
                                    <div className="form-field">
                                      <label>Data e Hora da Entrevista *:</label>
                                      <input
                                        type="text"
                                        value={eventoData}
                                        onChange={(e) => setEventoData(e.target.value)}
                                        placeholder="Ex: 25 de Novembro de 2026 às 08h30"
                                        required
                                      />
                                    </div>
                                    <div className="form-field">
                                      <label>Local Oficial da Entrevista *:</label>
                                      <input
                                        type="text"
                                        value={eventoLocal}
                                        onChange={(e) => setEventoLocal(e.target.value)}
                                        placeholder="Ex: Gabinete Provincial de Entrevistas"
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* FASE 3: TESTE ESCRITO */}
                          {candFase === 3 && (
                            <div className="deliberacao-section-block">
                              <label className="deliberacao-section-label">3ª Fase: Avaliação do Teste Escrito</label>
                              <div className="form-field-nota-row">
                                <div className="form-field" style={{ maxWidth: '220px' }}>
                                  <label>Nota do Teste Escrito (0.0 a 20.0 val.) *:</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="20"
                                    value={notaExameEscrito}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setNotaExameEscrito(val);
                                      const num = parseFloat(val);
                                      if (!isNaN(num)) {
                                        if (num < 10.0) {
                                          setNovoEstado(isDelibFem ? 'Reprovada no Teste Escrito' : 'Reprovado no Teste Escrito');
                                          setMotivoExclusao('Classificação inferior a 10 valores no Teste Escrito (Reprovação Eliminatória)');
                                          setParecerJuri(`Classificação de ${val} valores no Teste Escrito (< 10 val.). Reprovado.`);
                                        } else {
                                          setNovoEstado(isDelibFem ? 'Aprovada no Teste Escrito' : 'Aprovado no Teste Escrito');
                                          setParecerJuri(`Aprovado no Teste Escrito com ${val} valores. Candidato avança para a Entrevista Profissional.`);
                                        }
                                      }
                                    }}
                                    className="input-nota-clean"
                                  />
                                </div>
                                <div className="nota-feedback-tag">
                                  {parseFloat(notaExameEscrito) >= 10.0 ? (
                                    <span className="nota-tag-pos">Nota ≥ 10 val. (Aprovado p/ 4ª Fase)</span>
                                  ) : (
                                    <span className="nota-tag-neg">Nota &lt; 10 val. (Reprovado no Teste)</span>
                                  )}
                                </div>
                              </div>

                              <div className="deliberacao-clean-choices" style={{ marginTop: '1rem' }}>
                                <label className={`deliberacao-choice-btn ${novoEstado.includes('Aprovad') ? 'checked' : ''} ${parseFloat(notaExameEscrito) < 10.0 ? 'disabled-locked' : ''}`}>
                                  <input
                                    type="radio"
                                    name="estadoDeliberacao"
                                    value="Aprovado no Teste Escrito"
                                    checked={novoEstado.includes('Aprovad')}
                                    disabled={parseFloat(notaExameEscrito) < 10.0}
                                    onChange={() => {
                                      if (parseFloat(notaExameEscrito) < 10.0) return;
                                      setNovoEstado(isDelibFem ? 'Aprovada no Teste Escrito' : 'Aprovado no Teste Escrito');
                                      setParecerJuri(`Aprovado no Teste Escrito com ${notaExameEscrito} valores. Avança para a 4ª Fase.`);
                                    }}
                                  />
                                  <div className="choice-info">
                                    <strong>Aprovado no Teste Escrito</strong>
                                    <span>{parseFloat(notaExameEscrito) < 10.0 ? 'Bloqueado: requer nota mínima de 10.0 valores.' : 'Aprovado no teste. Candidato avança para a Entrevista Profissional (4ª Fase).'}</span>
                                  </div>
                                </label>

                                <label className={`deliberacao-choice-btn ${novoEstado.includes('Reprovad') ? 'checked' : ''}`}>
                                  <input
                                    type="radio"
                                    name="estadoDeliberacao"
                                    value="Reprovado no Teste Escrito"
                                    checked={novoEstado.includes('Reprovad')}
                                    onChange={() => {
                                      setNovoEstado(isDelibFem ? 'Reprovada no Teste Escrito' : 'Reprovado no Teste Escrito');
                                      setMotivoExclusao('Classificação inferior a 10 valores no Teste Escrito (Reprovação Eliminatória)');
                                      setParecerJuri(`Reprovado no Teste Escrito com classificação de ${notaExameEscrito} valores.`);
                                    }}
                                  />
                                  <div className="choice-info">
                                    <strong>Reprovado no Teste Escrito</strong>
                                    <span>Classificação inferior a 10 valores. Candidato excluído do concurso público.</span>
                                  </div>
                                </label>
                              </div>

                              {novoEstado.includes('Aprovad') && (
                                <div className="deliberacao-fields-group" style={{ marginTop: '1.25rem' }}>
                                  <div className="fields-group-title">Convocatória para a Entrevista Profissional (4ª Fase)</div>
                                  <div className="extra-box-grid-two">
                                    <div className="form-field">
                                      <label>Data e Hora da Entrevista *:</label>
                                      <input
                                        type="text"
                                        value={eventoData}
                                        onChange={(e) => setEventoData(e.target.value)}
                                        placeholder="Ex: 25 de Novembro de 2026 às 08h30"
                                        required
                                      />
                                    </div>
                                    <div className="form-field">
                                      <label>Local Oficial da Entrevista *:</label>
                                      <input
                                        type="text"
                                        value={eventoLocal}
                                        onChange={(e) => setEventoLocal(e.target.value)}
                                        placeholder="Ex: Gabinete Provincial de Entrevistas"
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* FASE 4: ENTREVISTA PROFISSIONAL (ÚLTIMA FASE) */}
                          {candFase === 4 && (
                            <div className="deliberacao-section-block">
                              <label className="deliberacao-section-label">4ª Fase: Entrevista Profissional (Decisão Final)</label>
                              <div className="form-field-nota-row">
                                <div className="form-field" style={{ maxWidth: '220px' }}>
                                  <label>Nota da Entrevista (0.0 a 20.0 val.) *:</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="20"
                                    value={notaFinal}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setNotaFinal(val);
                                      const num = parseFloat(val);
                                      if (!isNaN(num)) {
                                        if (num < 10.0) {
                                          setNovoEstado(isDelibFem ? 'Reprovada na Entrevista' : 'Reprovado na Entrevista');
                                          setMotivoExclusao('Nota inferior a 10 valores na Entrevista Profissional');
                                          setParecerJuri(`Classificação de ${val} valores na Entrevista Profissional (< 10 val.). Reprovado.`);
                                        } else {
                                          if (novoEstado.includes('Reprovad') || novoEstado.includes('Excluíd')) {
                                            setNovoEstado(isDelibFem ? 'Admitida' : 'Admitido');
                                            setParecerJuri(`Aproveitamento de ${val} valores na Entrevista Profissional. Proposta para provimento efetivo da vaga.`);
                                          }
                                        }
                                      }
                                    }}
                                    className="input-nota-clean"
                                  />
                                </div>
                                <div className="nota-feedback-tag">
                                  {parseFloat(notaFinal) >= 10.0 ? (
                                    <span className="nota-tag-pos">Nota ≥ 10 val. (Aprovado)</span>
                                  ) : (
                                    <span className="nota-tag-neg">Nota &lt; 10 val. (Reprovado na Entrevista)</span>
                                  )}
                                </div>
                              </div>

                              <div className="deliberacao-clean-choices" style={{ marginTop: '1rem' }}>
                                {/* ADMITIR EFETIVO */}
                                <label className={`deliberacao-choice-btn ${(novoEstado === 'Admitido' || novoEstado === 'Admitida') ? 'checked' : ''} ${parseFloat(notaFinal) < 10.0 ? 'disabled-locked' : ''}`}>
                                  <input
                                    type="radio"
                                    name="estadoDeliberacao"
                                    value="Admitido"
                                    checked={novoEstado === 'Admitido' || novoEstado === 'Admitida'}
                                    disabled={parseFloat(notaFinal) < 10.0}
                                    onChange={() => {
                                      if (parseFloat(notaFinal) < 10.0) return;
                                      setNovoEstado(isDelibFem ? 'Admitida' : 'Admitido');
                                      setParecerJuri(`${isDelibFem ? 'Candidata admitida' : 'Candidato admitido'} com ${notaFinal} valores na Entrevista Profissional para provimento efetivo da vaga.`);
                                    }}
                                  />
                                  <div className="choice-info">
                                    <strong>Admitido (Vaga Efetiva)</strong>
                                    <span>{parseFloat(notaFinal) < 10.0 ? 'Bloqueado: requer nota mínima de 10.0 valores.' : 'Aprovado para preenchimento de vaga imediata.'}</span>
                                  </div>
                                </label>

                                {/* SUPLENTE */}
                                <label className={`deliberacao-choice-btn ${(novoEstado === 'Aprovado (Suplente)' || novoEstado === 'Aprovada (Suplente)') ? 'checked' : ''} ${parseFloat(notaFinal) < 10.0 ? 'disabled-locked' : ''}`}>
                                  <input
                                    type="radio"
                                    name="estadoDeliberacao"
                                    value="Aprovado (Suplente)"
                                    checked={novoEstado === 'Aprovado (Suplente)' || novoEstado === 'Aprovada (Suplente)'}
                                    disabled={parseFloat(notaFinal) < 10.0}
                                    onChange={() => {
                                      if (parseFloat(notaFinal) < 10.0) return;
                                      setNovoEstado(isDelibFem ? 'Aprovada (Suplente)' : 'Aprovado (Suplente)');
                                      setParecerJuri(`${isDelibFem ? 'Candidata' : 'Candidato'} com nota de ${notaFinal} valores. Integrado na lista de reserva / suplente.`);
                                    }}
                                  />
                                  <div className="choice-info">
                                    <strong>Suplente (Lista de Reserva)</strong>
                                    <span>{parseFloat(notaFinal) < 10.0 ? 'Bloqueado: requer nota mínima de 10.0 valores.' : 'Aprovado para bolsa de reserva de recrutamento.'}</span>
                                  </div>
                                </label>

                                {/* REPROVADO */}
                                <label className={`deliberacao-choice-btn ${(novoEstado.includes('Reprovad') || novoEstado.includes('Excluíd')) ? 'checked' : ''}`}>
                                  <input
                                    type="radio"
                                    name="estadoDeliberacao"
                                    value="Reprovado na Entrevista"
                                    checked={novoEstado.includes('Reprovad') || novoEstado.includes('Excluíd')}
                                    onChange={() => {
                                      setNovoEstado(isDelibFem ? 'Reprovada na Entrevista' : 'Reprovado na Entrevista');
                                      setMotivoExclusao(parseFloat(notaFinal) < 10.0 ? 'Nota inferior a 10 valores na Entrevista Profissional' : 'Perfil técnico não adequado para as funções exigidas');
                                      setParecerJuri(`Reprovado na 4ª Fase de Entrevista Profissional (${notaFinal} valores).`);
                                    }}
                                  />
                                  <div className="choice-info">
                                    <strong>Reprovado na Entrevista</strong>
                                    <span>Reprovação eliminatória por classificação &lt; 10 valores ou inaptidão técnica.</span>
                                  </div>
                                </label>
                              </div>
                            </div>
                          )}

                          {/* MOTIVO DA EXCLUSÃO / REPROVAÇÃO */}
                          {(novoEstado.includes('Excluíd') || novoEstado.includes('Reprovad') || novoEstado === 'Excluído' || novoEstado === 'Excluída') && (
                            <div className="deliberacao-fields-group">
                              <div className="fields-group-title">Fundamentação Legal da Reprovação / Exclusão</div>
                              <div className="form-field full-width">
                                <label>Motivo Regulamentar *:</label>
                                <select 
                                  value={motivoExclusao} 
                                  onChange={(e) => setMotivoExclusao(e.target.value)}
                                  className="gestor-select"
                                >
                                  <optgroup label="1ª Fase - Análise Documental">
                                    <option value="Falta de Certificado de Habilitações autenticado">
                                      Falta de Certificado de Habilitações autenticado
                                    </option>
                                    <option value="Idade superior a 35 anos à data limite do edital">
                                      Idade superior a 35 anos à data limite do edital (Art. 35 do EGFAE)
                                    </option>
                                    <option value="Registo Criminal com antecedentes desfavoráveis ou em falta">
                                      Registo Criminal com antecedentes desfavoráveis ou em falta
                                    </option>
                                    <option value="Não cumpre a altura mínima (1.65m masculino / 1.60m feminino)">
                                      Não cumpre a altura mínima (1.65m masculino / 1.60m feminino)
                                    </option>
                                    <option value="Bilhete de Identidade caducado ou ilegível">
                                      Bilhete de Identidade caducado ou ilegível
                                    </option>
                                    <option value="Falta de Atestado Médico ou inaptidão física comprovada">
                                      Falta de Atestado Médico ou inaptidão física comprovada
                                    </option>
                                  </optgroup>
                                  <optgroup label="3ª Fase - Teste Escrito">
                                    <option value="Classificação inferior a 10 valores no Teste Escrito (Reprovação Eliminatória)">
                                      Classificação inferior a 10 valores no Teste Escrito (Reprovação Eliminatória)
                                    </option>
                                    <option value="Não comparência ao Teste Escrito de Conhecimentos">
                                      Não comparência ao Teste Escrito de Conhecimentos (Falta)
                                    </option>
                                  </optgroup>
                                  <optgroup label="4ª Fase - Entrevista Profissional">
                                    <option value="Nota inferior a 10 valores na Entrevista Profissional">
                                      Nota inferior a 10 valores na Entrevista Profissional (Reprovação Eliminatória)
                                    </option>
                                    <option value="Não compareceu na Entrevista Profissional">
                                      Não compareceu na Entrevista Profissional (Falta injustificada)
                                    </option>
                                    <option value="Perfil técnico não adequado para as funções exigidas">
                                      Perfil técnico não adequado para as funções exigidas
                                    </option>
                                  </optgroup>
                                  <optgroup label="Outro Motivo">
                                    <option value="Outro motivo detalhado">
                                      Outro motivo detalhado...
                                    </option>
                                  </optgroup>
                                </select>
                              </div>

                              {motivoExclusao === 'Outro motivo detalhado' && (
                                <div className="form-field full-width" style={{ marginTop: '0.65rem' }}>
                                  <label>Descreva o fundamento:</label>
                                  <input
                                    type="text"
                                    placeholder="Fundamentação sucinta e legal..."
                                    value={outroMotivo}
                                    onChange={(e) => setOutroMotivo(e.target.value)}
                                    required
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* OBSERVAÇÕES / PARECER DO JÚRI */}
                    <div className="form-field full-width" style={{ marginTop: '1rem' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                        Observações da Comissão de Júri:
                      </label>
                      <textarea
                        rows={2}
                        value={parecerJuri}
                        onChange={(e) => setParecerJuri(e.target.value)}
                        placeholder="Fundamentação da deliberação..."
                        className="gestor-textarea"
                      />
                    </div>

                    {/* BOTÃO DE CONFIRMAÇÃO OFICIAL */}
                    <div className="deliberacao-submit-row">
                      <div className="deliberacao-auditor-info">
                        <span>Operador: <strong>{currentUser?.name || 'Comissão Central de Júri'}</strong> ({isJuriUser ? 'Comissão de Júri' : currentUser?.role === 'super_admin' ? 'Super Administrador' : 'Administrador Principal'})</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                        {isJuriUser ? (
                          <>
                            <button
                              type="submit"
                              className="btn-deliberacao-submit"
                              style={{ backgroundColor: '#0f2042' }}
                            >
                              <FileSignature size={16} />
                              <span>Registar Parecer do Júri</span>
                            </button>
                            <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)' }}>
                              * O parecer aguardará homologação do Administrador Principal para publicação oficial.
                            </span>
                          </>
                        ) : (
                          <button
                            type="submit"
                            className="btn-deliberacao-submit"
                            style={{ backgroundColor: '#c32026' }}
                          >
                            <Award size={16} />
                            <span>Homologar e Publicar Decisão Oficial</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="deliberacao-empty-state">
                  <h3>Selecione um candidato para avaliação</h3>
                  <p>Utilize a lista à esquerda para carregar o processo do candidato.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 4: PAUTAS E EDITAIS OFICIAIS DO CONCURSO
          ======================================================== */}
      {gestorTab === 'pautas' && (
        <div className="gestor-tab-content fadeIn">
          <div className="pautas-header-bar">
            <div>
              <h3>Pautas e Editais Oficiais Publicados</h3>
              <p>Documentos oficiais homologados pela comissão para consulta pública e afixação institucional.</p>
            </div>
            <button
              type="button"
              className="gestor-btn-primary-red"
              onClick={() => setIsNovoEditalModalOpen(true)}
            >
              <FilePlus2 size={16} />
              <span>Publicar Novo Edital Oficial</span>
            </button>
          </div>

          <div className="pautas-cards-grid">
            {listas.map(lista => (
              <div key={lista.id} className="pauta-gestor-card">
                <div className="pauta-gestor-top">
                  <span className={`pauta-tipo-tag tipo-${lista.tipo.toLowerCase()}`}>
                    {lista.tipo}
                  </span>
                  <span className="pauta-data">Publicado: {lista.dataPublicacao}</span>
                </div>

                <h4 className="pauta-titulo">{lista.tituloLista}</h4>
                <p className="pauta-vaga-ref">{lista.vagaTitulo} • {lista.edital}</p>

                <div className="pauta-stats-row">
                  <div className="pauta-stat-chip">
                    <Users size={14} />
                    <span><strong>{lista.totalCandidatos}</strong> Candidatos</span>
                  </div>
                  <div className="pauta-stat-chip">
                    <FileText size={14} />
                    <span>{lista.arquivoNome} ({lista.arquivoTamanho})</span>
                  </div>
                </div>

                {lista.observacoes && (
                  <p className="pauta-obs-text">
                    <strong>Nota da Comissão:</strong> {lista.observacoes}
                  </p>
                )}

                <div className="pauta-actions-footer">
                  <button
                    type="button"
                    className="pauta-btn-print"
                    onClick={() => setSelectedPautaPrint(lista)}
                  >
                    <Printer size={15} />
                    <span>Ver Edital Timbrado</span>
                  </button>
                  <button
                    type="button"
                    className="pauta-btn-download"
                    onClick={() => {
                      if (onNotify) onNotify('success', `A descarregar arquivo oficial ${lista.arquivoNome}...`);
                    }}
                  >
                    <Download size={15} />
                    <span>Baixar PDF</span>
                  </button>
                  <button
                    type="button"
                    className="sub-aba-btn-action danger"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => {
                      if (window.confirm(`Tem a certeza que deseja revogar o edital "${lista.tituloLista}"?`)) {
                        deleteStoredLista(lista.id, currentUser?.name || 'Dr. Alberto Chissano');
                        reloadData();
                        if (onNotify) onNotify('info', `Edital "${lista.tituloLista}" revogado e retirado do portal.`);
                      }
                    }}
                    title="Revogar publicação deste edital"
                  >
                    <Trash2 size={13} />
                    <span>Revogar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 5: VAGAS E QUOTAS DO CONCURSO (CRUD COMPLETO)
          ======================================================== */}
      {gestorTab === 'vagas' && (
        <div className="gestor-tab-content fadeIn">
          {/* TOPO INSTITUCIONAL COM VISUAL SERNIC */}
          <div className="vagas-gestor-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <span className="carreira-badge-regime">
                  <ShieldCheck size={14} />
                  <span>Dotação Orçamental & Estatutos</span>
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--portal-text-muted)' }}>
                  Ministério da Economia e Finanças • SERNIC 2026
                </span>
              </div>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.45rem', fontWeight: 800, color: 'var(--portal-text-main)' }}>
                Quotas, Editais & Carreiras Oficiais Autorizadas
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--portal-text-muted)' }}>
                Gestão integrada do quadro de vagas, editais públicos de admissão e carreiras de investigação criminal.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <div className="total-vagas-badge">
                Total de Vagas: <strong>{vagas.reduce((acc, v) => acc + (Number(v.vagas) || 0), 0)} Autorizadas</strong>
              </div>
              <button
                type="button"
                className="gestor-btn-primary-red"
                onClick={handleOpenNovoConcursoGestor}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.1rem' }}
              >
                <Plus size={16} />
                <span>Lançar Novo Concurso Oficial</span>
              </button>
              <button
                type="button"
                className="gestor-btn-outline"
                onClick={handleOpenNovaCarreira}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.1rem' }}
              >
                <Briefcase size={15} />
                <span>Nova Carreira SERNIC</span>
              </button>
            </div>
          </div>

          {/* ALTERNADOR DE MODO: EDITAIS DE VAGAS vs CARREIRAS OFICIAIS */}
          <div className="vagas-mode-switcher-bar">
            <button
              type="button"
              className={`vagas-mode-pill ${vagasTabMode === 'editais' ? 'active' : ''}`}
              onClick={() => setVagasTabMode('editais')}
            >
              <FileText size={16} />
              <span>Concursos & Quotas de Vagas ({vagas.length})</span>
            </button>
            <button
              type="button"
              className={`vagas-mode-pill ${vagasTabMode === 'carreiras' ? 'active' : ''}`}
              onClick={() => setVagasTabMode('carreiras')}
            >
              <Briefcase size={16} />
              <span>Carreiras Oficiais SERNIC ({carreiras.length})</span>
            </button>
          </div>

          {/* MODO 1: EDITAIS & QUOTAS DE VAGAS */}
          {vagasTabMode === 'editais' && (
            <div className="vagas-gestor-grid fadeIn">
              {vagas.map(vaga => {
                const countInscritos = candidatos.filter(c => c.vagaTitulo === vaga.titulo).length;
                const ratio = vaga.vagas > 0 ? (countInscritos / vaga.vagas).toFixed(1) : '0';
                const correspondenteCarreira = carreiras.find(c => 
                  c.nome.toLowerCase() === (vaga.carreira || '').toLowerCase() ||
                  c.nome.toLowerCase() === vaga.titulo.toLowerCase() ||
                  (vaga.carreira && c.nome.toLowerCase().includes(vaga.carreira.toLowerCase()))
                );

                return (
                  <div key={vaga.id} className="vaga-gestor-card">
                    <div className="vaga-gestor-top">
                      <span className="vaga-edital-cod">{vaga.codigoEdital}</span>
                      <span 
                        className={`vaga-status-chip ${isPrazoSubmissaoExpirado(vaga.dataLimite) ? 'fechado' : vaga.status === 'Aberto' ? 'aberto' : 'fechado'}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleToggleVagaStatusGestor(vaga.id)}
                        title="Clique para alternar estado Aberto / Encerrado"
                      >
                        {isPrazoSubmissaoExpirado(vaga.dataLimite) ? 'Prazo Expirado' : vaga.status} (Alternar)
                      </span>
                    </div>

                    <h4>{vaga.titulo}</h4>
                    <p className="vaga-carreira-desc">
                      <Briefcase size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                      {vaga.carreira}
                    </p>

                    <div className="vaga-metrics-grid">
                      <div className="vaga-metric-box">
                        <span className="label">Vagas Oficiais</span>
                        <strong className="value red">{vaga.vagas}</strong>
                      </div>
                      <div className="vaga-metric-box">
                        <span className="label">Inscritos</span>
                        <strong className="value">{countInscritos}</strong>
                      </div>
                      <div className="vaga-metric-box">
                        <span className="label">Concorrência</span>
                        <strong className="value gold">{ratio} : 1</strong>
                      </div>
                    </div>

                    <div className="vaga-details-box">
                      <div className="detail-line">
                        <MapPin size={14} color="#64748b" />
                        <span>{vaga.local}</span>
                      </div>
                      <div className="detail-line">
                        <Calendar size={14} color={isPrazoSubmissaoExpirado(vaga.dataLimite) ? '#dc2626' : '#64748b'} />
                        <span>
                          Prazo: <strong>{vaga.dataLimite}</strong>
                          {isPrazoSubmissaoExpirado(vaga.dataLimite) ? (
                            <span className="tag-prazo-expirado">
                              <Lock size={11} /> Prazo Expirado
                            </span>
                          ) : (
                            <span className="tag-prazo-aberto">
                              <CheckCircle2 size={11} /> Submissões Abertas
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="vaga-gestor-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="sub-aba-btn-action"
                          style={{ justifyContent: 'center' }}
                          onClick={() => handleOpenEditConcursoGestor(vaga)}
                        >
                          <Edit3 size={13} color="#c32026" />
                          <span>Editar Concurso</span>
                        </button>

                        <button
                          type="button"
                          className="sub-aba-btn-action"
                          style={{ justifyContent: 'center', borderColor: '#c59b27', color: '#b45309' }}
                          onClick={() => {
                            if (correspondenteCarreira) {
                              handleOpenEditCarreira(correspondenteCarreira);
                            } else {
                              handleOpenNovaCarreira();
                            }
                          }}
                          title="Editar os parâmetros estatutários da carreira vinculada"
                        >
                          <Briefcase size={13} color="#c59b27" />
                          <span>Editar Carreira</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn-ver-edital-action"
                          style={{ flex: 1 }}
                          onClick={() => navigate('/portal-recrutamento/recrutamento')}
                        >
                          <span>Ver Aviso de Abertura</span>
                          <ArrowRight size={14} />
                        </button>

                        <button
                          type="button"
                          className="sub-aba-btn-action danger"
                          onClick={() => handleDeleteVagaGestor(vaga.id)}
                          title="Excluir este concurso"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODO 2: CARREIRAS OFICIAIS SERNIC */}
          {vagasTabMode === 'carreiras' && (
            <div className="carreiras-mode-container fadeIn">
              <div className="definicoes-panel-top" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', fontWeight: 800 }}>
                    Carreiras do Quadro do SERNIC
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--portal-text-muted)' }}>
                    Clique em "Editar Carreira" para alterar o regime, enquadramento TSU, requisitos ou quotas.
                  </p>
                </div>

                <button
                  type="button"
                  className="gestor-btn-primary-red"
                  onClick={handleOpenNovaCarreira}
                >
                  <Plus size={16} />
                  <span>Cadastrar Nova Carreira</span>
                </button>
              </div>

              <div className="carreiras-grid">
                {carreiras.map(c => {
                  const vagasCount = Number(c.vagas) || 0;
                  const inscritosCount = candidatos.filter(cand => 
                    cand.vagaTitulo === c.nome || cand.carreira === c.nome
                  ).length;

                  return (
                    <div key={c.id} className="carreira-card-sernic">
                      <div className="carreira-card-header">
                        <div className="carreira-card-meta">
                          <span className="carreira-code-tag">{c.codigo}</span>
                          <span className="carreira-regime-pill">{c.regime}</span>
                        </div>
                        
                        <div 
                          className={`carreira-status-badge ${c.status === 'Activa' ? 'activa' : 'inactiva'}`}
                          onClick={() => handleToggleCarreiraStatus(c.id)}
                          title="Clique para alternar estado"
                        >
                          <span className="status-dot" />
                          <span>{c.status}</span>
                        </div>
                      </div>

                      <div className="carreira-card-body">
                        <h4 className="carreira-title">{c.nome}</h4>

                        <div className="carreira-indicators-box">
                          <div className="carreira-indicator-item">
                            <span className="ind-label">Grau Mínimo</span>
                            <strong className="ind-val">{c.grauMinimo}</strong>
                          </div>
                          <div className="carreira-indicator-item">
                            <span className="ind-label">Quotas</span>
                            <strong className="ind-val red">{vagasCount} Vagas</strong>
                          </div>
                          <div className="carreira-indicator-item">
                            <span className="ind-label">Idade</span>
                            <strong className="ind-val">{c.idadeMinima} a {c.idadeMaxima}a</strong>
                          </div>
                          <div className="carreira-indicator-item">
                            <span className="ind-label">Inscritos</span>
                            <strong className="ind-val gold">{inscritosCount}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="carreira-card-footer">
                        <button
                          type="button"
                          className="carreira-btn-action edit"
                          onClick={() => handleOpenEditCarreira(c)}
                        >
                          <Edit3 size={14} />
                          <span>Editar Carreira</span>
                        </button>

                        <button
                          type="button"
                          className={`carreira-btn-action toggle ${c.status === 'Activa' ? 'desativar' : 'ativar'}`}
                          onClick={() => handleToggleCarreiraStatus(c.id)}
                        >
                          <SlidersHorizontal size={14} />
                          <span>{c.status === 'Activa' ? 'Suspender' : 'Activar'}</span>
                        </button>

                        <button
                          type="button"
                          className="carreira-btn-action delete"
                          onClick={() => handleDeleteCarreira(c.id)}
                          title="Eliminar carreira"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          ABA 6: LIVRO DE AUDITORIA & REGISTO DE ATAS
          ======================================================== */}
      {gestorTab === 'auditoria' && (
        <div className="gestor-tab-content fadeIn">
          <div className="auditoria-header-bar">
            <div>
              <h3>Histórico e Registo de Atividades</h3>
              <p>Todas as decisões, avaliações e publicações ficam guardadas com data, hora e responsável.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', color: 'var(--portal-text-muted)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Pesquisar registo..."
                  value={buscaAuditoria}
                  onChange={(e) => {
                    setBuscaAuditoria(e.target.value);
                    setPaginaAuditoria(1);
                  }}
                  style={{
                    height: '38px',
                    paddingLeft: '2.2rem',
                    paddingRight: '0.75rem',
                    fontSize: '0.84rem',
                    borderRadius: '8px',
                    border: '1px solid var(--portal-border)',
                    background: 'var(--portal-card-bg)',
                    color: 'var(--portal-text-main)',
                    outline: 'none',
                    minWidth: '220px'
                  }}
                />
              </div>
              <button
                type="button"
                className="gestor-btn-outline"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Imprimir Livro de Atas</span>
              </button>
            </div>
          </div>

          <div className="auditoria-table-wrap">
            <table className="auditoria-table">
              <thead>
                <tr>
                  <th>Ref.</th>
                  <th>Data & Hora</th>
                  <th>Operador / Júri</th>
                  <th>Tipo de Ação</th>
                  <th>Alvo / Candidato</th>
                  <th>Estado Anterior → Novo</th>
                  <th>Fundamentação / Parecer</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAuditoria.length > 0 ? (
                  paginatedAuditoria.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#c32026' }}>{item.id}</td>
                      <td>{item.dataHora}</td>
                      <td><strong>{item.operador}</strong></td>
                      <td><span className="auditoria-tag">{item.acao}</span></td>
                      <td>{item.candidato}</td>
                      <td>
                        <span className="old-state">{item.estadoAnterior}</span>
                        <span className="arrow-state">→</span>
                        <span className="new-state">{item.novoEstado}</span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{item.motivo}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--portal-text-muted)' }}>
                      Nenhum registo de auditoria encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* BARRA DE PAGINAÇÃO OFICIAL DO LIVRO DE AUDITORIA */}
            {filteredAuditoria.length > 0 && (
              <div className="gestor-pagination-wrapper">
                <div className="gestor-pagination-info">
                  <span>
                    A exibir <strong>{(paginaAuditoria - 1) * itensPorPaginaAuditoria + 1}</strong> a <strong>{Math.min(paginaAuditoria * itensPorPaginaAuditoria, filteredAuditoria.length)}</strong> de <strong>{filteredAuditoria.length}</strong> registos (Página <strong>{paginaAuditoria}</strong> de <strong>{totalPaginasAuditoria}</strong>)
                  </span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--portal-text-muted)' }}>Por página:</span>
                    <select
                      value={itensPorPaginaAuditoria}
                      onChange={(e) => {
                        setItensPorPaginaAuditoria(Number(e.target.value));
                        setPaginaAuditoria(1);
                      }}
                      style={{
                        padding: '0.2rem 0.45rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: '1px solid var(--portal-border)',
                        background: 'var(--portal-card-bg)',
                        color: 'var(--portal-text-main)',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="gestor-pagination-controls">
                  <button
                    type="button"
                    className="gestor-page-btn"
                    onClick={() => setPaginaAuditoria(1)}
                    disabled={paginaAuditoria === 1}
                    title="Primeira Página"
                  >
                    « Primeira
                  </button>
                  <button
                    type="button"
                    className="gestor-page-btn"
                    onClick={() => setPaginaAuditoria(p => Math.max(1, p - 1))}
                    disabled={paginaAuditoria === 1}
                    title="Página Anterior"
                  >
                    ‹ Anterior
                  </button>

                  {/* Botões numéricos de páginas com janela inteligente */}
                  {Array.from({ length: totalPaginasAuditoria }, (_, i) => i + 1)
                    .filter(pageNum => 
                      totalPaginasAuditoria <= 7 ||
                      pageNum === 1 || 
                      pageNum === totalPaginasAuditoria || 
                      Math.abs(pageNum - paginaAuditoria) <= 1
                    )
                    .map((pageNum, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && pageNum - prev > 1;
                      return (
                        <React.Fragment key={pageNum}>
                          {showEllipsis && <span style={{ padding: '0 4px', color: 'var(--portal-text-muted)' }}>...</span>}
                          <button
                            type="button"
                            className={`gestor-page-btn ${paginaAuditoria === pageNum ? 'active' : ''}`}
                            onClick={() => setPaginaAuditoria(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    type="button"
                    className="gestor-page-btn"
                    onClick={() => setPaginaAuditoria(p => Math.min(totalPaginasAuditoria, p + 1))}
                    disabled={paginaAuditoria === totalPaginasAuditoria}
                    title="Página Seguinte"
                  >
                    Seguinte ›
                  </button>
                  <button
                    type="button"
                    className="gestor-page-btn"
                    onClick={() => setPaginaAuditoria(totalPaginasAuditoria)}
                    disabled={paginaAuditoria === totalPaginasAuditoria}
                    title="Última Página"
                  >
                    Última »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 7: MÓDULO DE DEFINIÇÕES DO CONCURSO (SOLICITADO)
          ======================================================== */}
      {gestorTab === 'servidor' && (
        <GestorServidorPanel
          currentUser={currentUser}
          onNotify={onNotify}
          onSessaoExpirada={() => {
            if (onNotify) onNotify('error', 'A sua sessão expirou. Inicie sessão novamente.');
            if (onLogout) onLogout();
          }}
        />
      )}

      {gestorTab === 'definicoes' && (
        <div className="gestor-tab-content fadeIn definicoes-tab-container">
          {/* ========================================================
              SUB-ABA 0: GESTÃO & EDIÇÃO DE CARREIRAS OFICIAIS DO SERNIC
              ======================================================== */}
          {definicoesSubTab === 'carreiras' && (
            <div className="definicoes-panel-body fadeIn">
              <div className="definicoes-panel-top">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <span className="carreira-badge-regime">
                      <ShieldCheck size={14} />
                      <span>Estatuto Orgânico do SERNIC</span>
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--portal-text-muted)' }}>
                      Decreto n.º 24/2017 & EGFAE
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--portal-text-main)' }}>
                    Quadro Geral de Carreiras Oficiais & Parâmetros de Ingresso
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--portal-text-muted)' }}>
                    Gestão, edição de regimes estatutários, graus académicos de acesso, enquadramentos na TSU e quotas autorizadas.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="gestor-btn-outline"
                    onClick={reloadData}
                    title="Recarregar e sincronizar carreiras"
                  >
                    <RefreshCw size={15} />
                    <span>Actualizar</span>
                  </button>
                  <button
                    type="button"
                    className="gestor-btn-primary-red"
                    onClick={handleOpenNovaCarreira}
                  >
                    <Plus size={16} />
                    <span>Homologar Nova Carreira</span>
                  </button>
                </div>
              </div>

              {/* BARRA DE ESTATÍSTICAS E RESUMO DAS CARREIRAS */}
              <div className="carreira-kpi-ribbon">
                <div className="carreira-kpi-pill">
                  <span className="carreira-kpi-num">{carreiras.length}</span>
                  <span className="carreira-kpi-label">Carreiras no Quadro</span>
                </div>
                <div className="carreira-kpi-pill">
                  <span className="carreira-kpi-num green">{carreiras.filter(c => c.status === 'Activa').length}</span>
                  <span className="carreira-kpi-label">Carreiras Activas</span>
                </div>
                <div className="carreira-kpi-pill">
                  <span className="carreira-kpi-num red">{carreiras.reduce((acc, c) => acc + (Number(c.vagas) || 0), 0)}</span>
                  <span className="carreira-kpi-label">Quotas de Vagas Fixadas</span>
                </div>
                <div className="carreira-kpi-pill">
                  <span className="carreira-kpi-num gold">{carreiras.filter(c => (c.regime || '').includes('Especial')).length}</span>
                  <span className="carreira-kpi-label">Regimes Especiais Policiais</span>
                </div>
              </div>

              {/* FILTROS E PESQUISA DE CARREIRAS */}
              <div className="definicoes-filters-group" style={{ marginBottom: '0.5rem' }}>
                <div className="definicoes-search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Pesquisar carreira por nome, código, ramo ou cursos..."
                    value={buscaCarreira}
                    onChange={(e) => setBuscaCarreira(e.target.value)}
                  />
                  {buscaCarreira && (
                    <button type="button" onClick={() => setBuscaCarreira('')} className="btn-clear-search">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  className="definicoes-select"
                  value={filtroRegimeCarreira}
                  onChange={(e) => setFiltroRegimeCarreira(e.target.value)}
                >
                  <option value="todos">Todos os Regimes Estatutários</option>
                  <option value="Carreira de Regime Especial - SERNIC">Regime Especial SERNIC</option>
                  <option value="Carreira Técnica Especial Forense">Técnica Especial Forense</option>
                  <option value="Carreira Técnica Superior Especializada">Técnica Superior Especializada</option>
                  <option value="Carreira Especial de Saúde Forense">Saúde Forense</option>
                  <option value="Carreira de Apoio Policial">Apoio Policial</option>
                  <option value="Carreira de Regime Especial - Intervenção Rápida">Intervenção Rápida</option>
                </select>

                <select
                  className="definicoes-select"
                  value={filtroGrauCarreira}
                  onChange={(e) => setFiltroGrauCarreira(e.target.value)}
                >
                  <option value="todos">Todos os Níveis de Escolaridade</option>
                  <option value="Licenciatura">Licenciatura</option>
                  <option value="12ª Classe / Nível Médio">12ª Classe / Nível Médio</option>
                  <option value="Mestrado">Mestrado</option>
                </select>

                <select
                  className="definicoes-select"
                  value={filtroStatusCarreira}
                  onChange={(e) => setFiltroStatusCarreira(e.target.value)}
                >
                  <option value="todos">Todos os Estados</option>
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>

              {/* LISTA / GRID DE CARREIRAS COM DESIGN INSTITUCIONAL DE ALTO PADRÃO */}
              {filteredCarreiras.length === 0 ? (
                <div className="empty-state-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                  <Briefcase size={42} color="var(--portal-text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--portal-text-main)' }}>Nenhuma carreira encontrada</h4>
                  <p style={{ margin: 0, color: 'var(--portal-text-muted)', fontSize: '0.88rem' }}>
                    Tente ajustar os filtros de busca ou cadastre uma nova carreira para o quadro oficial.
                  </p>
                  <button
                    type="button"
                    className="gestor-btn-primary-red"
                    onClick={handleOpenNovaCarreira}
                    style={{ marginTop: '1.25rem' }}
                  >
                    <Plus size={15} />
                    <span>Cadastrar Carreira Agora</span>
                  </button>
                </div>
              ) : (
                <div className="carreiras-grid">
                  {filteredCarreiras.map(c => {
                    const vagasCount = Number(c.vagas) || 0;
                    const inscritosCount = candidatos.filter(cand => 
                      cand.vagaTitulo === c.nome || cand.carreira === c.nome
                    ).length;

                    return (
                      <div key={c.id} className="carreira-card-sernic">
                        {/* Topo do Card */}
                        <div className="carreira-card-header">
                          <div className="carreira-card-meta">
                            <span className="carreira-code-tag">{c.codigo}</span>
                            <span className="carreira-regime-pill">{c.regime}</span>
                          </div>
                          
                          <div 
                            className={`carreira-status-badge ${c.status === 'Activa' ? 'activa' : 'inactiva'}`}
                            onClick={() => handleToggleCarreiraStatus(c.id)}
                            title="Clique para alternar estado Activa / Inactiva"
                          >
                            <span className="status-dot" />
                            <span>{c.status}</span>
                          </div>
                        </div>

                        {/* Título Oficial da Carreira */}
                        <div className="carreira-card-body">
                          <h4 className="carreira-title">{c.nome}</h4>

                          {/* Mini Grid de Indicadores */}
                          <div className="carreira-indicators-box">
                            <div className="carreira-indicator-item">
                              <span className="ind-label">Grau Mínimo</span>
                              <strong className="ind-val">{c.grauMinimo}</strong>
                            </div>
                            <div className="carreira-indicator-item">
                              <span className="ind-label">Quotas Fixadas</span>
                              <strong className="ind-val red">{vagasCount} Vagas</strong>
                            </div>
                            <div className="carreira-indicator-item">
                              <span className="ind-label">Idade Permitida</span>
                              <strong className="ind-val">{c.idadeMinima} a {c.idadeMaxima} anos</strong>
                            </div>
                            <div className="carreira-indicator-item">
                              <span className="ind-label">Candidatos</span>
                              <strong className="ind-val gold">{inscritosCount}</strong>
                            </div>
                          </div>

                          {/* Cursos Homologados */}
                          {c.cursosAceites && (
                            <div className="carreira-cursos-chip-box">
                              <span className="cursos-label">Formações Elegíveis:</span>
                              <div className="cursos-tags-list">
                                {c.cursosAceites.split(',').map((cur, idx) => (
                                  <span key={idx} className="curso-tag-item">
                                    {cur.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Rodapé com Acções */}
                        <div className="carreira-card-footer">
                          <button
                            type="button"
                            className="carreira-btn-action edit"
                            onClick={() => handleOpenEditCarreira(c)}
                          >
                            <Edit3 size={14} />
                            <span>Editar Carreira</span>
                          </button>

                          <button
                            type="button"
                            className={`carreira-btn-action toggle ${c.status === 'Activa' ? 'desativar' : 'ativar'}`}
                            onClick={() => handleToggleCarreiraStatus(c.id)}
                            title={c.status === 'Activa' ? 'Desactivar esta carreira temporariamente' : 'Activar esta carreira'}
                          >
                            <SlidersHorizontal size={14} />
                            <span>{c.status === 'Activa' ? 'Suspender' : 'Activar'}</span>
                          </button>

                          <button
                            type="button"
                            className="carreira-btn-action delete"
                            onClick={() => handleDeleteCarreira(c.id)}
                            title="Eliminar carreira do catálogo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              SUB-ABA: GESTÃO DE PERFIS & ACESSIBILIDADE DO SISTEMA
              ======================================================== */}
          {definicoesSubTab === 'perfis' && (
            <div className="definicoes-panel-body fadeIn">
              {/* TOPO HUMANIZADO E INSTITUCIONAL */}
              <div className="definicoes-panel-top">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span className="carreira-badge-regime" style={{ borderColor: 'rgba(195, 32, 38, 0.25)', color: '#c32026', background: 'rgba(195, 32, 38, 0.08)' }}>
                      <ShieldCheck size={14} />
                      <span>Governança Humanizada & Segurança Institucional</span>
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--portal-text-muted)' }}>
                      Comissão Central do Concurso • SERNIC Moçambique
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.28rem', fontWeight: 800, color: 'var(--portal-text-main)' }}>
                    Gestão de Perfis de Acesso & Acessibilidade
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--portal-text-muted)', maxWidth: '780px', lineHeight: 1.5 }}>
                    Credenciamento dos membros do júri, delegação de competências deliberativas e calibração de acessibilidade para uma experiência humanizada, simples e transparente.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="gestor-btn-outline"
                    onClick={reloadData}
                    title="Recarregar perfis e definições"
                  >
                    <RefreshCw size={15} />
                    <span>Actualizar</span>
                  </button>
                  {perfisViewMode === 'membros' && (
                    <button
                      type="button"
                      className="gestor-btn-primary-red"
                      onClick={handleOpenNovoPerfil}
                    >
                      <Plus size={16} />
                      <span>Adicionar Membro da Equipa</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ALTERNADOR DE MODO: MEMBROS & PERMISSÕES vs ACESSIBILIDADE */}
              <div className="vagas-mode-switcher-bar" style={{ margin: '0.6rem 0 1.25rem 0' }}>
                <button
                  type="button"
                  className={`vagas-mode-pill ${perfisViewMode === 'membros' ? 'active' : ''}`}
                  onClick={() => setPerfisViewMode('membros')}
                >
                  <Users size={16} />
                  <span>Membros da Equipa & Permissões ({perfis.length})</span>
                </button>
                <button
                  type="button"
                  className={`vagas-mode-pill ${perfisViewMode === 'acessibilidade' ? 'active' : ''}`}
                  onClick={() => setPerfisViewMode('acessibilidade')}
                >
                  <Palette size={16} />
                  <span>Acessibilidade, Conforto Visual & Modo Simplificado</span>
                </button>
              </div>

              {/* MODO 1: GESTÃO DE MEMBROS E PERMISSÕES */}
              {perfisViewMode === 'membros' && (
                <div className="fadeIn">
                  {/* FAIXA DE INDICADORES DA EQUIPA */}
                  <div className="carreira-kpi-ribbon">
                    <div className="carreira-kpi-pill">
                      <span className="carreira-kpi-num">{perfis.length}</span>
                      <span className="carreira-kpi-label">Membros na Equipa</span>
                    </div>
                    <div className="carreira-kpi-pill">
                      <span className="carreira-kpi-num green">{perfis.filter(p => p.estado === 'Activo').length}</span>
                      <span className="carreira-kpi-label">Acessos Activos</span>
                    </div>
                    <div className="carreira-kpi-pill">
                      <span className="carreira-kpi-num red">{perfis.filter(p => p.permissoes?.homologarFinal).length}</span>
                      <span className="carreira-kpi-label">Homologadores Plenos</span>
                    </div>
                    <div className="carreira-kpi-pill">
                      <span className="carreira-kpi-num gold">{perfis.filter(p => p.permissoes?.deliberarFase1).length}</span>
                      <span className="carreira-kpi-label">Avaliadores de Documentos</span>
                    </div>
                  </div>

                  {/* PESQUISA E FILTROS */}
                  <div className="definicoes-filters-group" style={{ marginBottom: '1.25rem' }}>
                    <div className="definicoes-search-box">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Pesquisar por nome, cargo, e-mail ou departamento..."
                        value={buscaPerfil}
                        onChange={(e) => setBuscaPerfil(e.target.value)}
                      />
                      {buscaPerfil && (
                        <button type="button" onClick={() => setBuscaPerfil('')} className="btn-clear-search" title="Limpar pesquisa">
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <select
                      className="definicoes-select"
                      value={filtroTipoPerfil}
                      onChange={(e) => setFiltroTipoPerfil(e.target.value)}
                    >
                      <option value="todos">Todos os Papéis da Equipa</option>
                      <option value="Administrador Geral">Administrador Geral</option>
                      <option value="Gestora de Triagem Documental">Gestora de Triagem Documental</option>
                      <option value="Examinador Técnico & Psicotécnico">Examinador Técnico & Psicotécnico</option>
                      <option value="Avaliadora Médica & Saúde">Avaliadora Médica & Saúde</option>
                      <option value="Auditor de Conformidade">Auditor de Conformidade</option>
                    </select>
                  </div>

                  {/* TABELA INSTITUCIONAL SERNIC LIMPA E SEM POLUIÇÃO */}
                  <div className="definicoes-table-wrap">
                    <table className="definicoes-table">
                      <thead>
                        <tr>
                          <th style={{ width: '85px' }}>Código</th>
                          <th style={{ minWidth: '220px' }}>Membro da Comissão</th>
                          <th style={{ minWidth: '190px' }}>Cargo / Função</th>
                          <th style={{ minWidth: '190px' }}>Papel no Júri</th>
                          <th style={{ minWidth: '180px' }}>Contactos</th>
                          <th style={{ width: '140px', textAlign: 'center' }}>Permissões</th>
                          <th style={{ width: '120px', textAlign: 'center' }}>Estado</th>
                          <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPerfis.length === 0 ? (
                          <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--portal-text-muted)' }}>
                              <AlertCircle size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
                              <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.25rem', color: 'var(--portal-text-main)' }}>Nenhum membro encontrado</strong>
                              <span>Não foram encontrados membros com os filtros de pesquisa aplicados.</span>
                            </td>
                          </tr>
                        ) : (
                          filteredPerfis.map((p) => {
                            const countPermissoes = Object.values(p.permissoes || {}).filter(Boolean).length;
                            const totalPermissoes = Object.keys(p.permissoes || {}).length;
                            const iniciais = p.nome ? p.nome.split(' ').map(n => n[0]).slice(0, 2).join('') : 'U';

                            return (
                              <tr key={p.id}>
                                <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#c32026', fontSize: '0.85rem' }}>
                                  {p.id}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div 
                                      style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '50%',
                                        background: p.avatarCor || '#0f2042',
                                        color: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        fontSize: '0.84rem',
                                        flexShrink: 0,
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                                      }}
                                    >
                                      {iniciais}
                                    </div>
                                    <div>
                                      <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--portal-text-main)' }}>
                                        {p.nome}
                                      </strong>
                                      <span style={{ fontSize: '0.76rem', color: 'var(--portal-text-muted)' }}>
                                        {p.departamento || 'Comissão SERNIC'}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--portal-text-main)' }}>
                                    {p.cargo}
                                  </span>
                                </td>
                                <td>
                                  <span 
                                    className="grau-badge"
                                    style={{
                                      background: p.tipoPerfil?.includes('Administrador') ? 'rgba(195, 32, 38, 0.08)' : 'rgba(15, 32, 66, 0.08)',
                                      color: p.tipoPerfil?.includes('Administrador') ? '#c32026' : '#0f2042',
                                      borderColor: p.tipoPerfil?.includes('Administrador') ? 'rgba(195, 32, 38, 0.25)' : 'rgba(15, 32, 66, 0.25)',
                                      whiteSpace: 'nowrap',
                                      display: 'inline-block'
                                    }}
                                  >
                                    {p.tipoPerfil}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ fontSize: '0.82rem', color: 'var(--portal-text-main)', fontWeight: 500 }}>
                                    {p.email}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--portal-text-muted)' }}>
                                    {p.telefone}
                                  </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span 
                                    style={{ 
                                      display: 'inline-block',
                                      background: countPermissoes >= 5 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(197, 155, 39, 0.1)', 
                                      color: countPermissoes >= 5 ? '#059669' : '#b45309',
                                      border: `1px solid ${countPermissoes >= 5 ? 'rgba(5, 150, 105, 0.25)' : 'rgba(197, 155, 39, 0.25)'}`,
                                      padding: '0.22rem 0.6rem',
                                      borderRadius: '6px',
                                      fontWeight: 800,
                                      fontSize: '0.76rem',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {countPermissoes} de {totalPermissoes} activas
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    className={`status-toggle-btn ${p.estado === 'Activo' ? 'is-active' : 'is-inactive'}`}
                                    onClick={() => handleTogglePerfilStatus(p.id)}
                                    title="Clique para alternar o estado do membro"
                                  >
                                    {p.estado === 'Activo' ? (
                                      <>
                                        <Check size={13} />
                                        <span>Activo</span>
                                      </>
                                    ) : (
                                      <>
                                        <X size={13} />
                                        <span>Em Pausa</span>
                                      </>
                                    )}
                                  </button>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <div className="definicoes-row-actions">
                                    <button
                                      type="button"
                                      className="action-icon-btn edit"
                                      onClick={() => handleOpenEditPerfil(p)}
                                      title="Editar credenciais e permissões"
                                    >
                                      <Edit3 size={15} />
                                    </button>
                                    {p.id !== 'PRF-01' && (
                                      <button
                                        type="button"
                                        className="action-icon-btn delete"
                                        onClick={() => handleRequestDeletePerfil(p.id)}
                                        title="Revogar credenciamento institucional"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODO 2: ACESSIBILIDADE, CONFORTO VISUAL & HUMANIZAÇÃO */}
              {perfisViewMode === 'acessibilidade' && (
                <div className="acessibilidade-panel fadeIn">
                  {/* BANNER INFORMATIVO AMIGÁVEL */}
                  <div className="acessibilidade-hero-box">
                    <div className="hero-icon-bubble">
                      <Sun size={26} color="#c32026" />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.2rem', fontWeight: 800 }}>
                        Ambiente Inclusivo, Confortável e Descomplicado
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--portal-text-muted)', lineHeight: 1.5 }}>
                        O sistema do concurso público do SERNIC foi arquitetado para ser intuitivo e acolhedor para todos.
                        Personalize aqui a sua experiência de leitura, contraste visual e simplicidade de navegação.
                      </p>
                    </div>
                  </div>

                  <div className="acessibilidade-settings-grid">
                    {/* CARTÃO 1: TAMANHO DO TEXTO */}
                    <div className="acessibilidade-card">
                      <div className="acess-card-header">
                        <div className="acess-icon-box">
                          <Eye size={20} color="#c32026" />
                        </div>
                        <div>
                          <h5>Tamanho da Tipografia & Legibilidade</h5>
                          <p>Escolha a escala de texto ideal para diminuir o cansaço visual.</p>
                        </div>
                      </div>

                      <div className="tamanho-texto-options">
                        <button
                          type="button"
                          className={`btn-tamanho-choice ${acessibilidade.tamanhoTexto === 'normal' ? 'active' : ''}`}
                          onClick={() => handleUpdateAcessibilidade({ tamanhoTexto: 'normal' })}
                        >
                          <span className="choice-title">Normal (100%)</span>
                          <span className="choice-sub">Padrão SERNIC</span>
                        </button>
                        <button
                          type="button"
                          className={`btn-tamanho-choice ${acessibilidade.tamanhoTexto === 'confortavel' ? 'active' : ''}`}
                          onClick={() => handleUpdateAcessibilidade({ tamanhoTexto: 'confortavel' })}
                        >
                          <span className="choice-title" style={{ fontSize: '1.05rem' }}>Confortável (+15%)</span>
                          <span className="choice-sub">Leitura relaxada</span>
                        </button>
                        <button
                          type="button"
                          className={`btn-tamanho-choice ${acessibilidade.tamanhoTexto === 'amplo' ? 'active' : ''}`}
                          onClick={() => handleUpdateAcessibilidade({ tamanhoTexto: 'amplo' })}
                        >
                          <span className="choice-title" style={{ fontSize: '1.18rem', fontWeight: 800 }}>Amplo (+30%)</span>
                          <span className="choice-sub">Máxima visibilidade</span>
                        </button>
                      </div>
                    </div>

                    {/* CARTÃO 2: MODO SIMPLIFICADO */}
                    <div className="acessibilidade-card">
                      <div className="acess-card-header">
                        <div className="acess-icon-box">
                          <CheckCircle2 size={20} color="#15803d" />
                        </div>
                        <div>
                          <h5>Modo Simplificado & Navegação Direta</h5>
                          <p>Linguagem humanizada, reduzindo jargões técnicos para facilitar a tomada de decisão.</p>
                        </div>
                      </div>

                      <div className="acess-toggle-row">
                        <div className="acess-toggle-text">
                          <strong>Ativar Interface Simplificada</strong>
                          <span>Oculta dados secundários não essenciais, destacando botões principais e resumos claros.</span>
                        </div>
                        <label className="switch-custom">
                          <input
                            type="checkbox"
                            checked={acessibilidade.modoSimplificado}
                            onChange={(e) => handleUpdateAcessibilidade({ modoSimplificado: e.target.checked })}
                          />
                          <span className="slider-custom round" />
                        </label>
                      </div>
                    </div>

                    {/* CARTÃO 3: ALTO CONTRASTE */}
                    <div className="acessibilidade-card">
                      <div className="acess-card-header">
                        <div className="acess-icon-box">
                          <ShieldCheck size={20} color="#0f2042" />
                        </div>
                        <div>
                          <h5>Alto Contraste & Destaque de Bordas</h5>
                          <p>Excelente para ambientes com muita luz solar ou pessoas com baixa acuidade visual.</p>
                        </div>
                      </div>

                      <div className="acess-toggle-row">
                        <div className="acess-toggle-text">
                          <strong>Reforçar Contraste Visual</strong>
                          <span>Aumenta a separação entre caixas, tabelas e botões com bordas e cores de alto contraste.</span>
                        </div>
                        <label className="switch-custom">
                          <input
                            type="checkbox"
                            checked={acessibilidade.altoContraste}
                            onChange={(e) => handleUpdateAcessibilidade({ altoContraste: e.target.checked })}
                          />
                          <span className="slider-custom round" />
                        </label>
                      </div>
                    </div>

                    {/* CARTÃO 4: FEEDBACK SONORO */}
                    <div className="acessibilidade-card">
                      <div className="acess-card-header">
                        <div className="acess-icon-box">
                          <Clock size={20} color="#c59b27" />
                        </div>
                        <div>
                          <h5>Sons de Confirmação & Alertas Humanizados</h5>
                          <p>Receba sons suaves ao validar deliberações ou quando uma ação for concluída.</p>
                        </div>
                      </div>

                      <div className="acess-toggle-row">
                        <div className="acess-toggle-text">
                          <strong>Sons e Efeitos Sonoros</strong>
                          <span>Confirmação auditiva ao homologar documentos e salvar pareceres oficiais.</span>
                        </div>
                        <label className="switch-custom">
                          <input
                            type="checkbox"
                            checked={acessibilidade.sonsFeedback}
                            onChange={(e) => handleUpdateAcessibilidade({ sonsFeedback: e.target.checked })}
                          />
                          <span className="slider-custom round" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* RODAPÉ DE RESTAURAÇÃO DE ACESSIBILIDADE */}
                  <div className="acessibilidade-footer-box">
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--portal-text-muted)' }}>
                      As preferências ficam guardadas no seu navegador e acompanham todas as abas do sistema.
                    </p>
                    <button
                      type="button"
                      className="gestor-btn-outline"
                      onClick={handleResetAcessibilidade}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                    >
                      <RotateCcw size={14} />
                      <span>Restaurar Preferências Originais</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              SUB-ABA 1: GESTÃO DE CURSOS HOMOLOGADOS
              ======================================================== */}
          {definicoesSubTab === 'cursos' && (
            <div className="definicoes-panel-body fadeIn">
              <div className="definicoes-panel-top">
                <div>
                  <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.15rem', fontWeight: 800 }}>
                    Cursos Homologados para Ingresso no SERNIC
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--portal-text-muted)' }}>
                    Formações académicas autorizadas e médias mínimas para as carreiras policiais e técnicas.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="gestor-btn-outline"
                    onClick={reloadData}
                    title="Recarregar e sincronizar cursos"
                  >
                    <RefreshCw size={15} />
                    <span>Actualizar</span>
                  </button>
                  <button
                    type="button"
                    className="gestor-btn-primary-red"
                    onClick={handleOpenNovoCurso}
                  >
                    <Plus size={16} />
                    <span>Homologar Novo Curso</span>
                  </button>
                </div>
              </div>

              {/* FILTROS E PESQUISA DE CURSOS */}
              <div className="definicoes-filters-group" style={{ marginBottom: '1.25rem' }}>
                <div className="definicoes-search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Pesquisar curso por nome, carreira ou código..."
                    value={buscaCurso}
                    onChange={(e) => setBuscaCurso(e.target.value)}
                  />
                  {buscaCurso && (
                    <button type="button" onClick={() => setBuscaCurso('')} className="btn-clear-search">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  className="definicoes-select"
                  value={filtroGrauCurso}
                  onChange={(e) => setFiltroGrauCurso(e.target.value)}
                >
                  <option value="todos">Todos os Graus Académicos</option>
                  <option value="Licenciatura">Licenciatura</option>
                  <option value="Mestrado">Mestrado</option>
                  <option value="Nível Médio">Nível Médio (12ª Classe)</option>
                </select>
              </div>

              {/* TABELA DE CURSOS */}
              <div className="definicoes-table-wrap">
                <table className="definicoes-table">
                  <thead>
                    <tr>
                      <th style={{ width: '100px' }}>Código</th>
                      <th>Designação do Curso</th>
                      <th>Grau Académico</th>
                      <th>Carreira SERNIC Alocada</th>
                      <th style={{ width: '120px' }}>Média Mínima</th>
                      <th style={{ width: '130px' }}>Estado</th>
                      <th style={{ width: '140px', textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCursos.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--portal-text-muted)' }}>
                          Nenhum curso encontrado com os filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      filteredCursos.map((c) => (
                        <tr key={c.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#c32026' }}>
                            {c.id}
                          </td>
                          <td>
                            <strong>{c.nome}</strong>
                          </td>
                          <td>
                            <span className="grau-badge">{c.grau}</span>
                          </td>
                          <td>
                            <span className="carreira-text">{c.carreira}</span>
                          </td>
                          <td>
                            <span className="nota-min-badge">{c.notaMinima} Val.</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`status-toggle-btn ${c.status === 'Activo' ? 'is-active' : 'is-inactive'}`}
                              onClick={() => handleToggleStatusCurso(c.id)}
                              title="Clique para alternar o estado do curso"
                            >
                              {c.status === 'Activo' ? (
                                <>
                                  <Check size={13} />
                                  <span>Activo</span>
                                </>
                              ) : (
                                <>
                                  <X size={13} />
                                  <span>Inactivo</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="definicoes-row-actions">
                              <button
                                type="button"
                                className="action-icon-btn edit"
                                onClick={() => handleEditCurso(c)}
                                title="Editar dados do curso"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn delete"
                                onClick={() => handleDeleteCurso(c.id)}
                                title="Remover curso da lista homologada"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              SUB-ABA 2: LOCAIS & CENTROS DE TESTES
              ======================================================== */}
          {definicoesSubTab === 'locais' && (
            <div className="definicoes-panel-body fadeIn">
              <div className="definicoes-panel-top">
                <div>
                  <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.15rem', fontWeight: 800 }}>
                    Centros Oficiais de Realização de Exames e Testes
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--portal-text-muted)' }}>
                    Gestão dos locais onde serão realizadas as provas escritas, testes de aptidão física, inspeções médicas e perícias laboratoriais.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="gestor-btn-outline"
                    onClick={reloadData}
                    title="Recarregar centros de exames"
                  >
                    <RefreshCw size={15} />
                    <span>Actualizar</span>
                  </button>
                  <button
                    type="button"
                    className="gestor-btn-primary-red"
                    onClick={handleOpenNovoLocal}
                  >
                    <Building size={16} />
                    <span>Cadastrar Centro de Exames</span>
                  </button>
                </div>
              </div>

              {/* GRID DE LOCAIS */}
              <div className="locais-cards-grid">
                {locais.map((loc) => (
                  <div key={loc.id} className="local-center-card">
                    <div className="local-card-header">
                      <div className="local-card-icon">
                        <MapPin size={20} color="#c32026" />
                      </div>
                      <div className="local-card-title-wrap">
                        <div className="local-card-provincia-badge">{loc.provincia}</div>
                        <h5>{loc.nome}</h5>
                      </div>
                    </div>

                    <div className="local-card-details">
                      <div className="local-detail-line">
                        <strong>Cidade / Endereço:</strong>
                        <span>{loc.cidade} • {loc.endereco}</span>
                      </div>

                      <div className="local-detail-line">
                        <strong>Capacidade de Candidatos:</strong>
                        <span className="capacidade-badge">
                          <Users size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          {loc.capacidade} Candidatos
                        </span>
                      </div>

                      <div className="local-detail-line">
                        <strong>Data Prevista:</strong>
                        <span>{loc.dataPrevista}</span>
                      </div>

                      <div className="local-detail-line">
                        <strong>Responsável SERNIC:</strong>
                        <span>{loc.responsavel || 'Comissão Provincial de Júri'}</span>
                      </div>

                      <div className="local-provas-tags">
                        <strong>Tipos de Provas:</strong>
                        <div className="provas-tags-container">
                          {loc.tiposProva?.map((tp, idx) => (
                            <span key={idx} className="prova-tag-pill">{tp}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="local-card-footer">
                      <button
                        type="button"
                        className="gestor-btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => handleEditLocal(loc)}
                      >
                        <Edit3 size={14} />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        className="gestor-btn-outline danger"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => handleDeleteLocal(loc.id)}
                      >
                        <Trash2 size={14} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              SUB-ABA 3: CORES DOS TEMAS & APARÊNCIA (CRUD COMPLETO)
              ======================================================== */}
          {definicoesSubTab === 'temas' && (
            <div className="definicoes-panel-body fadeIn">
              <div className="temas-config-wrapper">
                {/* 1. CRUD COMPLETO DE PALETAS DE CORES & TEMAS */}
                <div className="config-card">
                  <div className="theme-crud-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div className="vaga-form-section-badge" style={{ backgroundColor: '#c32026' }}>
                        <Palette size={18} color="#ffffff" />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--portal-text-main)' }}>
                          Gestão de Paletas de Cores & Temas Visuais (CRUD)
                        </h4>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--portal-text-muted)' }}>
                          Adicione novas paletas corporativas, edite combinações de cores e ative temas em tempo real no portal.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="gestor-btn-primary-red"
                      onClick={handleOpenNovaPaleta}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.1rem' }}
                    >
                      <Plus size={16} />
                      <span>Homologar Nova Paleta de Cores</span>
                    </button>
                  </div>

                  {/* GRID DO CRUD DE PALETAS */}
                  <div className="theme-color-palette-grid">
                    {paletasCores.map((paleta) => {
                      const isAtivo = temaCorSelecionada.toLowerCase() === paleta.cor.toLowerCase();
                      return (
                        <div
                          key={paleta.id}
                          className={`theme-color-crud-card ${isAtivo ? 'selected' : ''}`}
                        >
                          <div className="theme-card-top-row">
                            <div 
                              className="color-swatch-circle" 
                              style={{ backgroundColor: paleta.cor }}
                              title={`Cor: ${paleta.cor}`}
                            >
                              {isAtivo && <Check size={18} color="#ffffff" strokeWidth={3} />}
                            </div>

                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <span className="theme-category-tag">{paleta.categoria || 'Institucional'}</span>
                                {isAtivo && (
                                  <span className="theme-active-tag">
                                    <CheckCircle2 size={12} />
                                    <span>Activo</span>
                                  </span>
                                )}
                              </div>
                              <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--portal-text-main)', marginTop: '0.2rem' }}>
                                {paleta.nome}
                              </strong>
                              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--portal-text-muted)', lineHeight: 1.4, marginTop: '0.2rem' }}>
                                {paleta.desc}
                              </span>
                              <code style={{ display: 'inline-block', fontSize: '0.76rem', color: paleta.cor, fontWeight: 800, marginTop: '0.35rem' }}>
                                {paleta.cor}
                              </code>
                            </div>
                          </div>

                          {/* AÇÕES DO CRUD: ACTIVAR / EDITAR / ELIMINAR */}
                          <div className="theme-card-actions">
                            <button
                              type="button"
                              className={`theme-btn-activate ${isAtivo ? 'is-active' : ''}`}
                              onClick={() => handleApplyThemeColor(paleta.cor)}
                              title={isAtivo ? 'Este tema está atualmente em vigor no portal' : 'Aplicar esta cor a todo o portal SERNIC'}
                            >
                              {isAtivo ? (
                                <>
                                  <Check size={14} />
                                  <span>Tema em Vigor</span>
                                </>
                              ) : (
                                <span>Activar no Portal</span>
                              )}
                            </button>

                            <button
                              type="button"
                              className="theme-btn-icon-action"
                              onClick={() => handleOpenEditPaleta(paleta)}
                              title="Editar designação, código de cor ou categoria desta paleta"
                            >
                              <Edit3 size={14} />
                            </button>

                            {paletasCores.length > 1 && (
                              <button
                                type="button"
                                className="theme-btn-icon-action danger"
                                onClick={() => handleDeletePaleta(paleta.id)}
                                title="Eliminar esta paleta do sistema"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="custom-color-row" style={{ marginTop: '1.25rem' }}>
                    <label style={{ fontWeight: 700, color: 'var(--portal-text-main)' }}>
                      Aplicar cor hexadecimal direta (teste rápido):
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <input
                        type="color"
                        value={temaCorSelecionada}
                        onChange={(e) => handleApplyThemeColor(e.target.value)}
                        className="custom-color-input"
                      />
                      <span style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--portal-text-main)' }}>
                        {temaCorSelecionada}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. MODO CLARO / PRETO */}
                <div className="config-card">
                  <div className="config-card-header">
                    <Sun size={20} color="#eab308" />
                    <div>
                      <h4>Modo de Visualização & Contraste</h4>
                      <p>Alterne entre o Modo Claro (alta nitidez para impressão) e o Modo Preto (alto contraste tático).</p>
                    </div>
                  </div>

                  <div className="theme-modes-choice-grid">
                    <div
                      className={`theme-mode-choice-card ${modoTemaSelecionado === 'claro' ? 'active' : ''}`}
                      onClick={() => handleApplyThemeMode('claro')}
                    >
                      <div className="mode-choice-icon light">
                        <Sun size={24} color="#eab308" />
                      </div>
                      <h5>Modo Claro (Padrão Institucional)</h5>
                      <p>Fundo suave cinza (#f3f4f6), cartões brancos nítidos e máxima legibilidade para expediente diurno.</p>
                      {modoTemaSelecionado === 'claro' && <span className="active-badge-pill">Activo</span>}
                    </div>

                    <div
                      className={`theme-mode-choice-card ${modoTemaSelecionado === 'preto' ? 'active' : ''}`}
                      onClick={() => handleApplyThemeMode('preto')}
                    >
                      <div className="mode-choice-icon dark">
                        <Moon size={24} color="#38bdf8" />
                      </div>
                      <h5>Modo Preto / Escuro (Tático Noturno)</h5>
                      <p>Fundo midnight dark (#0f172a), cartões de contraste profundo e conforto visual para salas de controle.</p>
                      {modoTemaSelecionado === 'preto' && <span className="active-badge-pill">Activo</span>}
                    </div>
                  </div>
                </div>

                {/* 3. OPACIDADE DA MARCA D'ÁGUA SERNIC */}
                <div className="config-card">
                  <div className="config-card-header">
                    <ShieldCheck size={20} color="#c59b27" />
                    <div>
                      <h4>Intensidade da Marca d'Água Oficial do SERNIC no Fundo</h4>
                      <p>Ajuste o nível de transparência da marca d'água oficial posicionada no centro e nas laterais da página.</p>
                    </div>
                  </div>

                  <div className="watermark-levels-grid">
                    {[
                      { id: 'suave', label: 'Suave & Discreta', opacity: '5%', desc: 'Ideal para leitura prolongada' },
                      { id: 'normal', label: 'Equilibrada (Padrão)', opacity: '8%', desc: 'Visibilidade institucional balanceada' },
                      { id: 'nitida', label: 'Realçada & Nítida', opacity: '15%', desc: 'Maior destaque ao emblema oficial' }
                    ].map((lvl) => (
                      <div
                        key={lvl.id}
                        className={`watermark-level-card ${opacidadeMarcaAgua === lvl.id ? 'active' : ''}`}
                        onClick={() => handleApplyWatermarkOpacity(lvl.id)}
                      >
                        <strong>{lvl.label}</strong>
                        <span className="opacity-val">{lvl.opacity}</span>
                        <p>{lvl.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SUB-ABA 4: IDIOMA & REGIONALIZAÇÃO
              ======================================================== */}
          {definicoesSubTab === 'idioma' && (
            <div className="definicoes-panel-body fadeIn">
              <form onSubmit={handleSaveRegionalConfig} className="config-card regional-card">
                <div className="config-card-header">
                  <Globe size={20} color="#c32026" />
                  <div>
                    <h4>Idioma Oficial e Regionalização do SERNIC</h4>
                    <p>Defina o padrão de língua, fuso horário legal e formatação monetária do concurso.</p>
                  </div>
                </div>

                <div className="regional-settings-grid">
                  <div className="form-group-custom">
                    <label>Idioma Oficial do Sistema</label>
                    <select
                      className="definicoes-select full"
                      value={idiomaSelecionado}
                      onChange={(e) => setIdiomaSelecionado(e.target.value)}
                    >
                      <option value="pt">🇲🇿 Português (Moçambique) — Idioma Oficial Constitucional</option>
                      <option value="en">🇬🇧 English (SADC / International Protocols)</option>
                    </select>
                    <small>Define o idioma padrão das mensagens, cabeçalhos e termos jurídicos do portal.</small>
                  </div>

                  <div className="form-group-custom">
                    <label>Fuso Horário Oficial do Concurso</label>
                    <select
                      className="definicoes-select full"
                      value={fusoHorarioSelecionado}
                      onChange={(e) => setFusoHorarioSelecionado(e.target.value)}
                    >
                      <option value="CAT (UTC+2) - Maputo">Central Africa Time (CAT / UTC+2) — Maputo</option>
                      <option value="UTC (GMT)">UTC — Tempo Universal Coordenado</option>
                    </select>
                    <small>Todas as horas das convocações, prazos e atas oficiais regem-se pelo horário de Maputo.</small>
                  </div>

                  <div className="form-group-custom">
                    <label>Padrão Monetário</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      value="Metical de Moçambique (MZN)"
                      disabled
                    />
                    <small>Moeda legal em conformidade com as finanças públicas e o EGFAE.</small>
                  </div>

                  <div className="form-group-custom">
                    <label>Formato Oficial de Datas</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      value="DD/MM/AAAA (exemplo: 15/11/2026)"
                      disabled
                    />
                    <small>Formato legal utilizado nas pautas e publicações no Boletim da República.</small>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="gestor-btn-primary-red">
                    <Save size={16} />
                    <span>Guardar Configurações Regionais</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================
              SUB-ABA 5: PARÂMETROS GERAIS DO CONCURSO
              ======================================================== */}
          {definicoesSubTab === 'geral' && (
            <div className="definicoes-panel-body fadeIn">
              <form onSubmit={handleSaveParametrosGerais} className="config-card">
                <div className="config-card-header">
                  <SlidersHorizontal size={20} color="#c32026" />
                  <div>
                    <h4>Parâmetros Estatutários & Prazos Oficiais do Concurso</h4>
                    <p>Configuração das datas limites, requisitos de elegibilidade física e estatutária nos termos do EGFAE.</p>
                  </div>
                </div>

                <div className="parametros-grid-fields">
                  <div className="form-group-custom">
                    <label>Título Oficial do Concurso</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      value={parametrosForm.tituloConcurso}
                      onChange={(e) => setParametrosForm({ ...parametrosForm, tituloConcurso: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Código do Aviso / Edital de Abertura</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      value={parametrosForm.codigoEdital}
                      onChange={(e) => setParametrosForm({ ...parametrosForm, codigoEdital: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Data de Abertura das Inscrições</label>
                    <input
                      type="date"
                      className="definicoes-input"
                      value={parametrosForm.dataAbertura}
                      onChange={(e) => setParametrosForm({ ...parametrosForm, dataAbertura: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Data de Encerramento Oficial</label>
                    <input
                      type="date"
                      className="definicoes-input"
                      value={parametrosForm.dataEncerramento}
                      onChange={(e) => setParametrosForm({ ...parametrosForm, dataEncerramento: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Idade Mínima de Ingresso (anos)</label>
                    <input
                      type="number"
                      className="definicoes-input"
                      value={parametrosForm.idadeMinima}
                      onChange={(e) => setParametrosForm({ ...parametrosForm, idadeMinima: Number(e.target.value) })}
                      min="18"
                      max="30"
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Idade Máxima Geral (EGFAE)</label>
                    <input
                      type="number"
                      className="definicoes-input"
                      value={parametrosForm.idadeMaximaGeral}
                      onChange={(e) => setParametrosForm({ ...parametrosForm, idadeMaximaGeral: Number(e.target.value) })}
                      min="25"
                      max="45"
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Idade Máxima para Especialistas Forenses</label>
                    <input
                      type="number"
                      className="definicoes-input"
                      value={parametrosForm.idadeMaximaEspecialistas}
                      onChange={(e) => setParametrosForm({ ...parametrosForm, idadeMaximaEspecialistas: Number(e.target.value) })}
                      min="30"
                      max="50"
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Prazo para Reclamações e Recursos (Dias Úteis)</label>
                    <input
                      type="number"
                      className="definicoes-input"
                      value={parametrosForm.prazoRecursoDias}
                      onChange={(e) => setParametrosForm({ ...parametrosForm, prazoRecursoDias: Number(e.target.value) })}
                      min="1"
                      max="30"
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Altura Mínima Masculina (Metros)</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      value={parametrosForm.alturaMinimaHomem}
                      onChange={(e) => setParametrosForm({ ...parametrosForm, alturaMinimaHomem: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Altura Mínima Feminina (Metros)</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      value={parametrosForm.alturaMinimaMulher}
                      onChange={(e) => setParametrosForm({ ...parametrosForm, alturaMinimaMulher: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="notificacoes-toggles-section">
                  <h5>Canais de Notificação Automática aos Candidatos</h5>
                  
                  <label className="checkbox-toggle-label">
                    <input
                      type="checkbox"
                      checked={parametrosForm.notificacoesSmsAtivas}
                      onChange={(e) => setParametrosForm({ ...parametrosForm, notificacoesSmsAtivas: e.target.checked })}
                    />
                    <span>
                      <strong>Notificações por SMS Institucional</strong>
                      <small>Envia código de confirmação e convocatórias diretamente para o telefone do candidato.</small>
                    </span>
                  </label>

                  <label className="checkbox-toggle-label">
                    <input
                      type="checkbox"
                      checked={parametrosForm.notificacoesEmailAtivas}
                      onChange={(e) => setParametrosForm({ ...parametrosForm, notificacoesEmailAtivas: e.target.checked })}
                    />
                    <span>
                      <strong>Notificações por Correio Electrónico Oficial</strong>
                      <small>Envia comprovativo em PDF e o resultado da avaliação para o e-mail do candidato.</small>
                    </span>
                  </label>
                </div>

                <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="submit" className="gestor-btn-primary-red">
                    <Save size={16} />
                    <span>Guardar Parâmetros Oficiais do Concurso</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL 1: DOSSIER COMPLETO DO CANDIDATO
          ======================================================== */}
      {selectedDossier && typeof document !== 'undefined' && createPortal(
        <div className="gestor-modal-overlay fadeIn" onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedDossier(null);
        }}>
          <DraggableSubAba 
            className="gestor-modal-card dossier-modal" 
            moveHandleLabel="Mover Dossiê"
            onClose={() => setSelectedDossier(null)}
          >
            {/* CABEÇALHO DO DOSSIER */}
            <div className="dossier-modal-header">
              <div className="dossier-header-left">
                <div className="dossier-avatar-wrap">
                  <img 
                    src={selectedDossier.fotoUrl || getCandidatePhotoUrl(selectedDossier.genero, selectedDossier.nomeCompleto.length)} 
                    alt={selectedDossier.nomeCompleto}
                    className="dossier-avatar-round"
                  />
                  <span className="dossier-ai-shield-tag" title="Validação Facial Concluída">
                    <ShieldCheck size={12} />
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3>{selectedDossier.nomeCompleto}</h3>
                    {(() => {
                      const b = getBadgeStyle(selectedDossier.status, selectedDossier);
                      return (
                        <span 
                          className="gestor-status-pill"
                          style={{ backgroundColor: b.bg, color: b.color, borderColor: b.border }}
                        >
                          {b.icon}
                          <span>{b.label}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <p className="dossier-header-sub">
                    Protocolo: <strong>{selectedDossier.codigoCandidatura}</strong> • 
                    Vaga: <strong>{selectedDossier.vagaTitulo}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* TOOLBAR DE AVALIAÇÃO DIRETA DENTRO DA SUB-ABA (INSTANTÂNEO) */}
            <div className="sub-aba-crud-toolbar" style={{ margin: '0.8rem 1.5rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--portal-text-main)' }}>
                Decisão sobre o Candidato:
              </span>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {(() => {
                  const fase = selectedDossier.faseAtual || (
                    (selectedDossier.status === 'Em Análise Documental' || selectedDossier.status === 'Em análise' || selectedDossier.status === 'Submetida') ? 1 :
                    (selectedDossier.status === 'Entrevista Profissional' || selectedDossier.status === 'Convocada para provas') ? 2 : 3
                  );

                  if (fase === 1) {
                    return (
                      <>
                        <button
                          type="button"
                          className="sub-aba-btn-action"
                          style={{ color: '#047857', borderColor: '#a7f3d0', backgroundColor: '#ecfdf5' }}
                          onClick={() => handleInlineDeliberacao(selectedDossier, 'Admitido na Análise Documental')}
                          title="Aprovar e Admitir na Análise Documental com agendamento da Entrevista"
                        >
                          <Check size={13} />
                          <span>Admitir na Análise Documental</span>
                        </button>
                        <button
                          type="button"
                          className="sub-aba-btn-action danger"
                          onClick={() => handleInlineDeliberacao(selectedDossier, 'Excluído na Análise Documental')}
                          title="Excluir de primeira por inconformidades ou falta de documentos"
                        >
                          <UserX size={13} />
                          <span>Excluir na Análise Documental</span>
                        </button>
                      </>
                    );
                  }

                  if (fase === 2) {
                    const notaNum = selectedDossier.deliberacaoJuri?.notaFinal ? parseFloat(selectedDossier.deliberacaoJuri.notaFinal) : null;
                    const isReprovado = notaNum !== null && notaNum < 10.0;

                    if (isReprovado) {
                      return (
                        <>
                          <span style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: 800, padding: '0.2rem 0.5rem', background: '#fee2e2', borderRadius: '6px' }}>
                            Nota: {selectedDossier.deliberacaoJuri.notaFinal} val. (&lt;10 val) • Reprovado
                          </span>
                          <button
                            type="button"
                            className="sub-aba-btn-action danger"
                            onClick={() => handleInlineDeliberacao(selectedDossier, 'Excluído na Entrevista')}
                            title="Excluir por nota inferior a 10 valores na entrevista"
                          >
                            <UserX size={13} />
                            <span>Excluir por Nota &lt; 10</span>
                          </button>
                        </>
                      );
                    }

                    return (
                      <>
                        <button
                          type="button"
                          className="sub-aba-btn-action"
                          style={{ color: '#15803d', borderColor: '#86efac', backgroundColor: '#f0fdf4' }}
                          onClick={() => handleInlineDeliberacao(selectedDossier, 'Admitido')}
                          title="Aprovar para vaga efetiva pela sequência de vagas do edital"
                        >
                          <Check size={13} />
                          <span>Admitir (Vaga Efetiva)</span>
                        </button>
                        <button
                          type="button"
                          className="sub-aba-btn-action"
                          style={{ color: '#b45309', borderColor: '#fde68a', backgroundColor: '#fffbeb' }}
                          onClick={() => handleInlineDeliberacao(selectedDossier, 'Aprovado (Suplente)')}
                          title="Aprovar como suplente para a lista de reserva"
                        >
                          <Award size={13} />
                          <span>Aprovar (Suplente)</span>
                        </button>
                        <button
                          type="button"
                          className="sub-aba-btn-action danger"
                          onClick={() => handleInlineDeliberacao(selectedDossier, 'Excluído na Entrevista')}
                          title="Excluir na fase de entrevista"
                        >
                          <UserX size={13} />
                          <span>Excluir (Entrevista)</span>
                        </button>
                      </>
                    );
                  }

                  return (
                    <>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: '6px', background: '#f1f5f9', color: 'var(--portal-text-sub)' }}>
                        Resultado Final: {selectedDossier.status}
                      </span>
                      <button
                        type="button"
                        className="sub-aba-btn-action"
                        style={{ color: 'var(--portal-text-sub)', borderColor: 'var(--portal-border)' }}
                        onClick={() => handleInlineDeliberacao(selectedDossier, 'Em Análise Documental')}
                        title="Reabrir processo de avaliação do candidato"
                      >
                        <RefreshCw size={13} />
                        <span>Reabrir Avaliação</span>
                      </button>
                    </>
                  );
                })()}

                <button
                  type="button"
                  className="sub-aba-btn-action danger"
                  style={{ backgroundColor: '#fee2e2' }}
                  onClick={() => handleSolicitarEliminacaoCandidato(selectedDossier)}
                  title={isSuperAdminTecnico ? "Apagar perfil do candidato definitivamente (Super Administrador)" : "Apagar perfil do candidato (requer autorização do Técnico)"}
                >
                  <Trash2 size={13} />
                  <span>Apagar Perfil</span>
                </button>
              </div>
            </div>

            {/* CONTEÚDO DO DOSSIER */}
            <div className="dossier-modal-body">
              {/* BLOCO BIOMÉTRICO: AUDITORIA FACIAL INTELIGENTE & ILUMINAÇÃO (SERNIC VisionAI) */}
              <div className="dossier-section-block biometric-audit-card">
                <div className="biometric-audit-header">
                  <div className="biometric-title-group">
                    <div className="biometric-scanner-icon">
                      <Sparkles size={18} color="#c59b27" />
                    </div>
                    <div>
                      <h4 className="dossier-sec-title" style={{ margin: 0, padding: 0, border: 'none' }}>
                        Validação Facial Inteligente & Verificação de Iluminação (SERNIC VisionAI)
                      </h4>
                      <p className="biometric-audit-sub">
                        Auditoria de biometria facial, enquadramento ICAO 9303 e luminância em tempo real
                      </p>
                    </div>
                  </div>
                  <div className="biometric-score-badge">
                    <span className="score-num">{selectedDossier.validacaoFacial?.scoreBiometrico || 98}%</span>
                    <span className="score-lbl">Conformidade IA</span>
                  </div>
                </div>

                <div className="biometric-audit-body-grid">
                  {/* FOTO COM OVERLAY DE SCANNER HUD */}
                  <div className="biometric-photo-hud-frame">
                    <img 
                      src={selectedDossier.fotoUrl || getCandidatePhotoUrl(selectedDossier.genero, selectedDossier.nomeCompleto.length)} 
                      alt={selectedDossier.nomeCompleto}
                      className="biometric-hud-photo"
                    />
                    <div className="hud-corner top-left" />
                    <div className="hud-corner top-right" />
                    <div className="hud-corner bottom-left" />
                    <div className="hud-corner bottom-right" />
                    <div className="hud-crosshair" />
                    <div className="hud-target-oval" />
                    <div className="hud-live-tag">
                      <span className="live-dot" /> ROSTO DETECTADO
                    </div>
                  </div>

                  {/* INDICADORES INTELIGENTES DE ILUMINAÇÃO & ROSTO */}
                  <div className="biometric-metrics-list">
                    <div className="biometric-metric-row">
                      <div className="metric-info">
                        <span className="metric-name">
                          <Sun size={14} color="#f59e0b" />
                          Iluminação & Contraste
                        </span>
                        <span className="metric-desc">
                          {selectedDossier.validacaoFacial?.iluminacao || 'Excelente (Luz Difusa Equilibrada)'}
                        </span>
                      </div>
                      <div className="metric-status success">
                        <CheckCircle2 size={15} />
                        <span>{selectedDossier.validacaoFacial?.iluminacaoScore || 97}% Ideal</span>
                      </div>
                    </div>

                    <div className="biometric-metric-row">
                      <div className="metric-info">
                        <span className="metric-name">
                          <ShieldCheck size={14} color="#16a34a" />
                          Enquadramento Facial
                        </span>
                        <span className="metric-desc">
                          {selectedDossier.validacaoFacial?.rostoEnquadrado !== false ? 'Rosto e ombros 100% centralizados (Padrão ICAO 9303)' : 'Desalinhado'}
                        </span>
                      </div>
                      <div className="metric-status success">
                        <CheckCircle2 size={15} />
                        <span>100% Aprovado</span>
                      </div>
                    </div>

                    <div className="biometric-metric-row">
                      <div className="metric-info">
                        <span className="metric-name">
                          <Palette size={14} color="#2563eb" />
                          Fundo da Fotografia
                        </span>
                        <span className="metric-desc">
                          {selectedDossier.validacaoFacial?.fundoNeutro !== false ? 'Fundo neutro claro / branco homologado' : 'Requer revisão'}
                        </span>
                      </div>
                      <div className="metric-status success">
                        <CheckCircle2 size={15} />
                        <span>Homologado</span>
                      </div>
                    </div>

                    <div className="biometric-metric-row">
                      <div className="metric-info">
                        <span className="metric-name">
                          <Eye size={14} color="#0284c7" />
                          Foco, Olhos e Expressão
                        </span>
                        <span className="metric-desc">
                          Olhos abertos, expressão neutra sem oclusão ou reflexos
                        </span>
                      </div>
                      <div className="metric-status success">
                        <CheckCircle2 size={15} />
                        <span>Conforme</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOCO 1: DADOS PESSOAIS */}
              <div className="dossier-section-block">
                <h4 className="dossier-sec-title">
                  <UserCheck size={16} color="#c32026" />
                  1. Dados Pessoais & Identificação Civil
                </h4>
                <div className="dossier-data-grid">
                  <div className="data-item">
                    <span className="label">Nome Completo:</span>
                    <span className="val">{selectedDossier.nomeCompleto}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Bilhete de Identidade (BI):</span>
                    <span className="val">{selectedDossier.biNumero}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">NUIT:</span>
                    <span className="val">{selectedDossier.nuit}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Data de Nascimento / Idade:</span>
                    <span className="val">{selectedDossier.dataNascimento || '1998-05-14'} ({selectedDossier.idade || 28} anos)</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Género / Estado Civil:</span>
                    <span className="val">{selectedDossier.genero || 'Masculino'} • {selectedDossier.estadoCivil || (selectedDossier.genero === 'Feminino' ? 'Solteira' : 'Solteiro')}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Filiação:</span>
                    <span className="val">{selectedDossier.filiacaoPai || 'Carlos Alberto'} e {selectedDossier.filiacaoMae || 'Amélia Rosa'}</span>
                  </div>
                </div>
              </div>

              {/* BLOCO 2: CONTACTO E RESIDÊNCIA */}
              <div className="dossier-section-block">
                <h4 className="dossier-sec-title">
                  <MapPin size={16} color="#c32026" />
                  2. Contacto & Delegação Provincial de Candidatura
                </h4>
                <div className="dossier-data-grid">
                  <div className="data-item">
                    <span className="label">Telefone:</span>
                    <span className="val">{selectedDossier.telefone || '+258 00 000 0000'}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">E-mail:</span>
                    <span className="val">{selectedDossier.email || 'candidato@gmail.com'}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Província / Distrito:</span>
                    <span className="val">{selectedDossier.provincia || 'Maputo Cidade'} ({selectedDossier.distrito || 'KaMpfumo'})</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Morada de Residência:</span>
                    <span className="val">{selectedDossier.morada || 'Bairro Central, Maputo'}</span>
                  </div>
                </div>
              </div>

              {/* BLOCO 3: HABILITAÇÕES LITERÁRIAS */}
              <div className="dossier-section-block">
                <h4 className="dossier-sec-title">
                  <GraduationCap size={16} color="#c32026" />
                  3. Habilitações Literárias & Formação Académica
                </h4>
                <div className="dossier-data-grid">
                  <div className="data-item">
                    <span className="label">Grau Académico:</span>
                    <span className="val">{selectedDossier.habilitacoes?.grau || 'Licenciatura'}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Curso / Especialidade:</span>
                    <span className="val">{selectedDossier.habilitacoes?.curso || 'Direito e Ciências Criminais'}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Instituição de Ensino:</span>
                    <span className="val">{selectedDossier.habilitacoes?.instituicao || 'Universidade Eduardo Mondlane (UEM)'}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Ano de Conclusão / Média:</span>
                    <span className="val">{selectedDossier.habilitacoes?.anoConclusao || 2022} • Média Final: <strong>{selectedDossier.habilitacoes?.mediaFinal || '16.5'} valores</strong></span>
                  </div>
                </div>
              </div>

              {/* BLOCO 4: DOCUMENTOS ANEXADOS & CONFERÊNCIA */}
              <div className="dossier-section-block">
                <h4 className="dossier-sec-title">
                  <FileCheck size={16} color="#c32026" />
                  4. Conferência dos Documentos Oficiais Submetidos
                </h4>
                <div className="dossier-docs-list">
                  {(selectedDossier.documentos || [
                    { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Validado', tamanho: '1.2 MB' },
                    { id: 'doc-cert', tipo: 'Certificado de Habilitações Literárias', status: 'Validado', tamanho: '2.4 MB' },
                    { id: 'doc-crim', tipo: 'Certidão de Registo Criminal', status: 'Validado', tamanho: '850 KB' },
                    { id: 'doc-med', tipo: 'Atestado Médico de Aptidão Física/Mental', status: 'Validado', tamanho: '920 KB' },
                    { id: 'doc-mil', tipo: 'Declaração de Serviço Militar', status: 'Validado', tamanho: '1.1 MB' },
                    { id: 'doc-cv', tipo: 'Curriculum Vitae e Carta de Motivação', status: 'Validado', tamanho: '1.8 MB' }
                  ]).map((doc, idx) => (
                    <div key={doc.id || idx} className="dossier-doc-card">
                      <div className="doc-icon-wrap">
                        <FileText size={22} color="#c32026" />
                      </div>
                      <div className="doc-meta-info">
                        <span className="doc-name">{doc.tipo}</span>
                        <span className="doc-size-status">
                          {doc.tamanho || '1.5 MB'} • 
                          <strong className={doc.status === 'Validado' ? 'text-success' : (doc.status === 'Rejeitado' ? 'text-danger' : 'text-warning')}>
                            {doc.status}
                          </strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-preview-doc"
                        onClick={() => setPreviewDoc({ doc, candidato: selectedDossier })}
                      >
                        <Eye size={14} />
                        <span>Visualizar</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* BLOCO 5: HISTÓRICO E DELIBERAÇÃO ATUAL */}
              {selectedDossier.historico && (
                <div className="dossier-section-block">
                  <h4 className="dossier-sec-title">
                    <History size={16} color="#c32026" />
                    5. Histórico Cronológico do Processo
                  </h4>
                  <div className="dossier-timeline">
                    {selectedDossier.historico.map((h, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-marker" />
                        <div className="timeline-content">
                          <span className="timeline-date">{h.data}</span>
                          <strong className="timeline-stage">{h.etapa}</strong>
                          <p className="timeline-desc">{h.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BLOCO 6: HOMOLOGAÇÃO DE ADMISSÃO & PERFIL HOMOLOGADOR */}
              {selectedDossier.admitidoPor && (
                <div className="dossier-section-block">
                  <h4 className="dossier-sec-title">
                    <ShieldCheck size={16} color="#15803d" />
                    6. Homologação Oficial de Admissão & Perfil Autorizador
                  </h4>
                  <div className="homologador-badge-card" style={{ margin: 0 }}>
                    <div className="homologador-badge-header">
                      <div className="homologador-badge-title">
                        <ShieldCheck size={20} color="#15803d" />
                        <div>
                          <strong>REGISTO OFICIAL DE HOMOLOGAÇÃO</strong>
                          <span className="homologador-despacho">{selectedDossier.admitidoPor.despacho}</span>
                        </div>
                      </div>
                      <span className="homologador-status-tag">Homologado</span>
                    </div>
                    <div className="homologador-badge-grid">
                      <div className="homologador-field">
                        <span className="field-label">Homologado por:</span>
                        <strong className="field-value">{selectedDossier.admitidoPor.nome}</strong>
                      </div>
                      <div className="homologador-field">
                        <span className="field-label">Cargo / Responsabilidade:</span>
                        <span className="field-value">{selectedDossier.admitidoPor.cargo}</span>
                      </div>
                      <div className="homologador-field">
                        <span className="field-label">Perfil Institucional:</span>
                        <span className="field-value">{selectedDossier.admitidoPor.perfil}</span>
                      </div>
                      <div className="homologador-field">
                        <span className="field-label">Data e Hora da Homologação:</span>
                        <span className="field-value">{selectedDossier.admitidoPor.dataHomologacao}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RODAPÉ DO DOSSIER */}
            <div className="dossier-modal-footer">
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="gestor-btn-outline"
                  onClick={() => window.print()}
                >
                  <Printer size={15} />
                  <span>Imprimir Ficha Completa</span>
                </button>

                <button
                  type="button"
                  className="gestor-btn-outline"
                  style={{ color: '#b45309', borderColor: 'rgba(180, 83, 9, 0.4)', background: 'rgba(180, 83, 9, 0.05)' }}
                  onClick={() => {
                    const target = selectedDossier;
                    setSelectedDossier(null);
                    setCandidatoParaReporIndividual(target);
                  }}
                  title="Repor este candidato no estado inicial da 1ª Fase (Em Análise Documental)"
                >
                  <RotateCcw size={15} />
                  <span>Repor Candidatura</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setSelectedDossier(null)}
                >
                  Fechar
                </button>
                <button
                  type="button"
                  className="gestor-btn-primary-red"
                  onClick={() => iniciarDeliberacao(selectedDossier)}
                >
                  <FileSignature size={16} />
                  <span>Avaliar este Candidato</span>
                </button>
              </div>
            </div>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          MODAL 2: PRÉ-VISUALIZAÇÃO DE DOCUMENTO OFICIAL
          ======================================================== */}
      {previewDoc && typeof document !== 'undefined' && createPortal(
        <div className="gestor-modal-overlay fadeIn" style={{ zIndex: 1200 }} onClick={(e) => { if (e.target === e.currentTarget) setPreviewDoc(null); }}>
          <DraggableSubAba className="gestor-modal-card doc-preview-modal" moveHandleLabel="Mover Visualização">
            <div className="dossier-modal-header">
              <div>
                <h3>Visualização de Documento Anexado</h3>
                <p>{previewDoc.doc.tipo} • Candidato: {previewDoc.candidato.nomeCompleto}</p>
              </div>
            </div>

            <div className="doc-preview-body">
              <div className="document-sheet">
                <div className="doc-sheet-header">
                  <img src={sernicLogo} alt="SERNIC" className="doc-sheet-logo" />
                  <h4>REPÚBLICA DE MOÇAMBIQUE</h4>
                  <h5>MINISTÉRIO DO INTERIOR • SERNIC</h5>
                  <p>CONCURSO PÚBLICO DE INGRESSO 2026</p>
                </div>

                <div className="doc-sheet-content">
                  <div className="doc-sheet-title">{previewDoc.doc.tipo.toUpperCase()}</div>
                  <div className="doc-sheet-watermark">CONFERIDO PELO JÚRI</div>

                  <p><strong>Titular:</strong> {previewDoc.candidato.nomeCompleto}</p>
                  <p><strong>N.º de BI:</strong> {previewDoc.candidato.biNumero}</p>
                  <p><strong>Protocolo de Inscrição:</strong> {previewDoc.candidato.codigoCandidatura}</p>
                  <p><strong>Carreira:</strong> {previewDoc.candidato.vagaTitulo}</p>
                  <p><strong>Data de Homologação:</strong> {new Date().toLocaleDateString('pt-PT')}</p>

                  <div className="doc-simulated-text">
                    [Cópia digitalizada do documento original conforme submetido pelo candidato através da plataforma eletrónica de inscrições do SERNIC. Documento com autenticação notarial conferida nos termos do EGFAE.]
                  </div>
                </div>

                <div className="doc-sheet-stamp">
                  <div className="stamp-circle">
                    <span>SERNIC • DRH</span>
                    <span>CONFERIDO</span>
                    <span>2026</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dossier-modal-footer">
              <button
                type="button"
                className="gestor-btn-primary-red"
                onClick={() => setPreviewDoc(null)}
              >
                Fechar Visualização
              </button>
            </div>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          MODAL 3: PUBLICAR NOVO EDITAL OFICIAL
          ======================================================== */}
      {isNovoEditalModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="gestor-modal-overlay fadeIn" onClick={(e) => { if (e.target === e.currentTarget) setIsNovoEditalModalOpen(false); }}>
          <DraggableSubAba className="gestor-modal-card novo-edital-modal" moveHandleLabel="Mover Novo Edital">
            <div className="dossier-modal-header">
              <div>
                <h3>Publicação Oficial de Pauta / Edital</h3>
                <p>O edital ficará imediatamente disponível para consulta pública e download pelos candidatos.</p>
              </div>
            </div>

            <form onSubmit={handlePublicarEdital} className="novo-edital-form">
              <div className="form-field full-width">
                <label>Título Oficial do Edital:</label>
                <input
                  type="text"
                  placeholder="Ex: Edital n.º 05 - Relação de Candidatos Admitidos às Provas Escritas"
                  value={novoEditalData.tituloLista}
                  onChange={(e) => setNovoEditalData({ ...novoEditalData, tituloLista: e.target.value })}
                  required
                />
              </div>

              <div className="extra-box-grid">
                <div className="form-field">
                  <label>Tipo de Lista:</label>
                  <select
                    value={novoEditalData.tipo}
                    onChange={(e) => setNovoEditalData({ ...novoEditalData, tipo: e.target.value })}
                  >
                    <option value="Admitidos">Admitidos</option>
                    <option value="Convocados">Convocados para Provas</option>
                    <option value="Aprovados">Aprovados / Classificação Final</option>
                    <option value="Excluídos">Excluídos / Não Admitidos</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Carreira / Aviso Associado:</label>
                  <select
                    value={novoEditalData.vagaTitulo}
                    onChange={(e) => setNovoEditalData({ ...novoEditalData, vagaTitulo: e.target.value })}
                  >
                    <option value="Todas as Carreiras">Todas as Carreiras</option>
                    {INITIAL_VAGAS.map(v => (
                      <option key={v.id} value={v.titulo}>{v.titulo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field full-width">
                <label>Instruções / Observações Oficiais para os Candidatos:</label>
                <textarea
                  rows={3}
                  value={novoEditalData.observacoes}
                  onChange={(e) => setNovoEditalData({ ...novoEditalData, observacoes: e.target.value })}
                  placeholder="Ex: Os candidatos convocados devem comparecer munidos de esferográfica azul e documento original..."
                  className="gestor-textarea"
                />
              </div>

              <div className="dossier-modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setIsNovoEditalModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="gestor-btn-primary-red"
                >
                  <FilePlus2 size={16} />
                  <span>Publicar Edital Oficial Agora</span>
                </button>
              </div>
            </form>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          MODAL 4: VISUALIZAÇÃO E IMPRESSÃO DE EDITAL TIMBRADO
          ======================================================== */}
      {selectedPautaPrint && typeof document !== 'undefined' && createPortal(
        <div className="gestor-modal-overlay fadeIn" onClick={(e) => { if (e.target === e.currentTarget) setSelectedPautaPrint(null); }}>
          <DraggableSubAba className="gestor-modal-card pauta-timbrada-modal" moveHandleLabel="Mover Pauta Oficial">
            <div className="dossier-modal-header">
              <div>
                <h3>Edital Oficial do Concurso Público</h3>
                <p>Documento Timbrado • Direcção Geral do SERNIC</p>
              </div>
            </div>

            <div className="pauta-sheet-body">
              <div className="pauta-official-sheet">
                <div className="official-sheet-top">
                  <img src={sernicLogo} alt="SERNIC" className="sheet-logo" />
                  <h4>REPÚBLICA DE MOÇAMBIQUE</h4>
                  <h5>PROCURADORIA-GERAL DA REPÚBLICA</h5>
                  <h6>SERVIÇO NACIONAL DE INVESTIGAÇÃO CRIMINAL</h6>
                  <p>DIRECÇÃO GERAL • DIRECÇÃO DE RECURSOS HUMANOS</p>
                  <div className="sheet-divider" />
                  <h3 className="sheet-edital-title">{selectedPautaPrint.tituloLista}</h3>
                  <span className="sheet-edital-subtitle">{selectedPautaPrint.edital} • {selectedPautaPrint.vagaTitulo}</span>
                </div>

                <div className="sheet-body-text">
                  <p>
                    Em cumprimento ao estabelecido no Estatuto Geral dos Funcionários e Agentes do Estado (EGFAE) e no Regulamento do SERNIC, torna-se pública a presente relação de candidatos referentes ao Concurso Público de Ingresso 2026.
                  </p>

                  <div className="sheet-sample-table">
                    <table>
                      <thead>
                        <tr>
                          <th>N.º</th>
                          <th>Protocolo</th>
                          <th>Nome do Candidato</th>
                          <th>Província</th>
                          <th>Classificação / Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidatos.slice(0, 6).map((c, i) => (
                          <tr key={c.codigoCandidatura}>
                            <td>{i + 1}</td>
                            <td>{c.codigoCandidatura}</td>
                            <td>{c.nomeCompleto}</td>
                            <td>{c.provincia || 'Maputo'}</td>
                            <td><strong>{selectedPautaPrint.tipo}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="sheet-notes">
                    <strong>Observações:</strong> {selectedPautaPrint.observacoes}
                  </p>
                </div>

                <div className="sheet-signatures">
                  <div className="signature-box">
                    <div className="signature-line" />
                    <span>O Presidente do Júri</span>
                    <strong>Dr. Alberto Chissano</strong>
                  </div>

                  <div className="stamp-official-seal">
                    <div className="seal-inner">
                      <span>SERNIC</span>
                      <span>DIRECÇÃO GERAL</span>
                      <span>MAPUTO</span>
                    </div>
                  </div>

                  <div className="signature-box">
                    <div className="signature-line" />
                    <span>A Vogal da Comissão</span>
                    <strong>Dra. Elsa Manjate</strong>
                  </div>
                </div>

                <div className="sheet-footer-date">
                  Maputo, {selectedPautaPrint.dataPublicacao || new Date().toLocaleDateString('pt-PT')}
                </div>
              </div>
            </div>

            <div className="dossier-modal-footer">
              <button
                type="button"
                className="gestor-btn-primary-red"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Imprimir Edital Oficial</span>
              </button>
              <button
                type="button"
                className="gestor-btn-secondary"
                onClick={() => setSelectedPautaPrint(null)}
              >
                Fechar
              </button>
            </div>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          MODAL DE CURSO (HOMOLOGAR NOVO OU EDITAR)
          ======================================================== */}
      {isCursoModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="gestor-modal-overlay fadeIn" onClick={(e) => { if (e.target === e.currentTarget) setIsCursoModalOpen(false); }}>
          <DraggableSubAba 
            className="gestor-modal-card definicoes-modal" 
            moveHandleLabel="Mover Especialidade"
            onClose={() => setIsCursoModalOpen(false)}
          >
            <div className="dossier-modal-header">
              <div className="dossier-header-left">
                <div className="dossier-modal-avatar">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3>{editingCurso ? 'Editar Curso Homologado' : 'Homologar Novo Curso para o Concurso'}</h3>
                  <span className="dossier-protocolo">
                    {editingCurso ? editingCurso.id : 'Novo Cadastro • Concurso SERNIC 2026'}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveCurso} className="dossier-modal-body">
              <div className="form-group-custom">
                <label>Designação Oficial do Curso</label>
                <input
                  type="text"
                  className="definicoes-input"
                  placeholder="Exemplo: Licenciatura em Direito ou Ciências Policiais"
                  value={cursoForm.nome}
                  onChange={(e) => setCursoForm({ ...cursoForm, nome: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-custom">
                  <label>Grau Académico Exigido</label>
                  <select
                    className="definicoes-select full"
                    value={cursoForm.grau}
                    onChange={(e) => setCursoForm({ ...cursoForm, grau: e.target.value })}
                  >
                    <option value="Licenciatura">Licenciatura</option>
                    <option value="Mestrado">Mestrado</option>
                    <option value="Nível Médio">Nível Médio (12ª Classe)</option>
                    <option value="Bacharelato">Bacharelato</option>
                  </select>
                </div>

                <div className="form-group-custom">
                  <label>Nota Mínima de Candidatura (Valores)</label>
                  <input
                    type="text"
                    className="definicoes-input"
                    placeholder="14.0"
                    value={cursoForm.notaMinima}
                    onChange={(e) => setCursoForm({ ...cursoForm, notaMinima: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label>Carreira SERNIC Alocada</label>
                <select
                  className="definicoes-select full"
                  value={cursoForm.carreira}
                  onChange={(e) => setCursoForm({ ...cursoForm, carreira: e.target.value })}
                >
                  <option value="Investigação Criminal e Instrução Processual">Investigação Criminal e Instrução Processual</option>
                  <option value="Polícia Científica (Laboratório Forense)">Polícia Científica (Laboratório Forense)</option>
                  <option value="Inteligência Digital e Cibercrime">Inteligência Digital e Cibercrime</option>
                  <option value="Medicina Legal e Toxicologia Forense">Medicina Legal e Toxicologia Forense</option>
                  <option value="Corpo Técnico Operativo e Apoio">Corpo Técnico Operativo e Apoio</option>
                </select>
              </div>

              <div className="form-group-custom">
                <label>Estado de Homologação</label>
                <select
                  className="definicoes-select full"
                  value={cursoForm.status}
                  onChange={(e) => setCursoForm({ ...cursoForm, status: e.target.value })}
                >
                  <option value="Activo">Activo (Aceite no Concurso)</option>
                  <option value="Inactivo">Inactivo (Suspenso)</option>
                </select>
              </div>

              <div className="dossier-modal-footer" style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="gestor-btn-primary-red">
                  <Save size={15} />
                  <span>Guardar Curso</span>
                </button>
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setIsCursoModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          MODAL DE LOCAL DE TESTES (CADASTRAR NOVO OU EDITAR)
          ======================================================== */}
      {isLocalModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="gestor-modal-overlay fadeIn" onClick={(e) => { if (e.target === e.currentTarget) setIsLocalModalOpen(false); }}>
          <DraggableSubAba 
            className="gestor-modal-card definicoes-modal" 
            moveHandleLabel="Mover Local de Prova"
            onClose={() => setIsLocalModalOpen(false)}
          >
            <div className="dossier-modal-header">
              <div className="dossier-header-left">
                <div className="dossier-modal-avatar">
                  <Building size={24} />
                </div>
                <div>
                  <h3>{editingLocal ? 'Editar Centro de Testes' : 'Cadastrar Centro de Realização de Testes'}</h3>
                  <span className="dossier-protocolo">
                    {editingLocal ? editingLocal.id : 'Novo Local Oficial de Provas'}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveLocal} className="dossier-modal-body">
              <div className="form-group-custom">
                <label>Nome Oficial da Instituição / Centro</label>
                <input
                  type="text"
                  className="definicoes-input"
                  placeholder="Exemplo: Academia de Ciências Policiais (ACIPOL) - Michafutene"
                  value={localForm.nome}
                  onChange={(e) => setLocalForm({ ...localForm, nome: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-custom">
                  <label>Província</label>
                  <select
                    className="definicoes-select full"
                    value={localForm.provincia}
                    onChange={(e) => setLocalForm({ ...localForm, provincia: e.target.value })}
                  >
                    {PROVINCIAS_MOCAMBIQUE.map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-custom">
                  <label>Cidade / Distrito</label>
                  <input
                    type="text"
                    className="definicoes-input"
                    placeholder="Ex: Maputo, Beira, Nampula..."
                    value={localForm.cidade}
                    onChange={(e) => setLocalForm({ ...localForm, cidade: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label>Endereço Detalhado / Instalações</label>
                <input
                  type="text"
                  className="definicoes-input"
                  placeholder="Ex: Av. Vladimir Lenine, Pavilhão Principal, Bloco C"
                  value={localForm.endereco}
                  onChange={(e) => setLocalForm({ ...localForm, endereco: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-custom">
                  <label>Capacidade Máxima de Candidatos</label>
                  <input
                    type="number"
                    className="definicoes-input"
                    value={localForm.capacidade}
                    onChange={(e) => setLocalForm({ ...localForm, capacidade: Number(e.target.value) })}
                    min="10"
                    max="5000"
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label>Data & Hora Prevista das Provas</label>
                  <input
                    type="text"
                    className="definicoes-input"
                    placeholder="15 de Novembro de 2026 às 08h00"
                    value={localForm.dataPrevista}
                    onChange={(e) => setLocalForm({ ...localForm, dataPrevista: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label>Oficial Responsável / Contacto SERNIC</label>
                <input
                  type="text"
                  className="definicoes-input"
                  placeholder="Ex: Inspetor Chefe Manhique (+258 000 000 000)"
                  value={localForm.responsavel}
                  onChange={(e) => setLocalForm({ ...localForm, responsavel: e.target.value })}
                />
              </div>

              <div className="dossier-modal-footer" style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="gestor-btn-primary-red">
                  <Save size={15} />
                  <span>Guardar Centro</span>
                </button>
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setIsLocalModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          MODAL DE PALETA DE CORES & TEMAS (HOMOLOGAR NOVA OU EDITAR)
          ======================================================== */}
      {isPaletaModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="gestor-modal-overlay fadeIn" onClick={(e) => { if (e.target === e.currentTarget) setIsPaletaModalOpen(false); }}>
          <DraggableSubAba 
            className="gestor-modal-card definicoes-modal" 
            moveHandleLabel="Mover Paleta de Cores"
            onClose={() => setIsPaletaModalOpen(false)}
          >
            <div className="dossier-modal-header">
              <div className="dossier-header-left">
                <div className="dossier-modal-avatar">
                  <Palette size={24} />
                </div>
                <div>
                  <h3>{editingPaleta ? 'Editar Paleta de Cores' : 'Homologar Nova Paleta de Cores & Tema'}</h3>
                  <span className="dossier-protocolo">
                    {editingPaleta ? `${editingPaleta.id} • ${editingPaleta.nome}` : 'Novo Registro Visual • Identidade Institucional SERNIC'}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSavePaleta} className="dossier-modal-body">
              <div className="form-group-custom">
                <label>Nome Oficial da Paleta</label>
                <input
                  type="text"
                  className="definicoes-input"
                  placeholder="Ex: Verde Esperança Moçambique ou Dourado Presidencial"
                  value={paletaForm.nome}
                  onChange={(e) => setPaletaForm({ ...paletaForm, nome: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group-custom">
                  <label>Código Hexadecimal da Cor</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <input
                      type="color"
                      className="custom-color-input"
                      value={paletaForm.cor && paletaForm.cor.startsWith('#') && paletaForm.cor.length === 7 ? paletaForm.cor : '#c32026'}
                      onChange={(e) => setPaletaForm({ ...paletaForm, cor: e.target.value })}
                      style={{ width: '46px', height: '40px', padding: 2, cursor: 'pointer', borderRadius: '6px' }}
                    />
                    <input
                      type="text"
                      className="definicoes-input"
                      placeholder="#c32026"
                      value={paletaForm.cor}
                      onChange={(e) => setPaletaForm({ ...paletaForm, cor: e.target.value })}
                      style={{ fontFamily: 'monospace', fontWeight: 700 }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-custom">
                  <label>Categoria de Aplicação</label>
                  <select
                    className="definicoes-select full"
                    value={paletaForm.categoria}
                    onChange={(e) => setPaletaForm({ ...paletaForm, categoria: e.target.value })}
                  >
                    <option value="Institucional">Institucional</option>
                    <option value="Nacional">Nacional / Soberania</option>
                    <option value="Forense">Polícia Forense & Científica</option>
                    <option value="Operacional">Operações & Tático</option>
                    <option value="Inteligência">Inteligência & Cibercrime</option>
                    <option value="Personalizado">Personalizado</option>
                  </select>
                </div>
              </div>

              <div className="form-group-custom">
                <label>Descrição & Finalidade de Uso</label>
                <textarea
                  className="definicoes-textarea"
                  rows={3}
                  placeholder="Ex: Paleta destinada às publicações solenes da Direcção Geral e materiais do concurso."
                  value={paletaForm.desc}
                  onChange={(e) => setPaletaForm({ ...paletaForm, desc: e.target.value })}
                />
              </div>

              {/* LIVE PREVIEW BOX */}
              <div style={{ 
                marginTop: '0.5rem', 
                padding: '0.85rem 1rem', 
                borderRadius: '8px', 
                backgroundColor: 'var(--portal-bg-secondary)', 
                border: '1px solid var(--portal-border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: paletaForm.cor,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  border: '2px solid #ffffff',
                  flexShrink: 0
                }} />
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--portal-text-muted)', display: 'block' }}>
                    Pré-visualização do destaque cromático:
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--portal-text-main)' }}>
                    {paletaForm.nome || 'Nome da paleta...'}
                  </strong>
                  <span style={{ fontSize: '0.76rem', color: paletaForm.cor, fontWeight: 700, marginLeft: '0.5rem' }}>
                    ({paletaForm.cor})
                  </span>
                </div>
              </div>

              <div className="dossier-modal-footer" style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="gestor-btn-primary-red">
                  <Save size={15} />
                  <span>{editingPaleta ? 'Salvar Alterações' : 'Homologar Paleta'}</span>
                </button>
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setIsPaletaModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          MODAL DE CARREIRA OFICIAL (CADASTRAR NOVA OU EDITAR)
          ======================================================== */}
      {isCarreiraModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="gestor-modal-overlay fadeIn" onClick={(e) => {
          if (e.target === e.currentTarget) setIsCarreiraModalOpen(false);
        }}>
          <DraggableSubAba 
            className="gestor-modal-card definicoes-modal carreira-modal-dialog" 
            style={{ width: 'min(860px, 95vw)', maxWidth: 'min(860px, 95vw)' }}
            moveHandleLabel="Mover Ficha de Carreira"
            onClose={() => setIsCarreiraModalOpen(false)}
          >
            <div className="dossier-modal-header" style={{ borderBottom: '2px solid #c32026' }}>
              <div className="dossier-header-left">
                <div className="dossier-modal-avatar" style={{ background: 'linear-gradient(135deg, #0f2042 0%, #c32026 100%)', color: '#fff' }}>
                  <Briefcase size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: '#c32026' }}>
                      REPÚBLICA DE MOÇAMBIQUE • SERNIC
                    </span>
                    <span className={`carreira-badge-status ${carreiraForm.status === 'Activa' ? 'activa' : 'inactiva'}`}>
                      {carreiraForm.status}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--portal-text-main)' }}>
                    {editingCarreira ? `Editar Carreira: ${editingCarreira.nome}` : 'Cadastrar Nova Carreira no Quadro do SERNIC'}
                  </h3>
                  <span className="dossier-protocolo" style={{ fontSize: '0.8rem', color: 'var(--portal-text-muted)' }}>
                    {carreiraForm.codigo || 'SERNIC-CAR-NOVA'} • {carreiraForm.regime}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveCarreira} className="dossier-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '1.5rem' }}>
              
              {/* BLOCO 1: IDENTIFICAÇÃO E REGIME */}
              <div className="carreira-form-section">
                <div className="carreira-section-title">
                  <ShieldCheck size={16} color="#c32026" />
                  <span>Identificação Estatutária da Carreira</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group-custom">
                    <label>Designação Oficial da Carreira *</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      placeholder="Ex: Investigação Criminal e Instrução Processual"
                      value={carreiraForm.nome}
                      onChange={(e) => setCarreiraForm({ ...carreiraForm, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Código Institucional SERNIC</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      placeholder="Ex: SERNIC-CAR-01"
                      value={carreiraForm.codigo}
                      onChange={(e) => setCarreiraForm({ ...carreiraForm, codigo: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr', gap: '1rem', marginTop: '0.75rem' }}>
                  <div className="form-group-custom">
                    <label>Regime Estatutário *</label>
                    <select
                      className="definicoes-select full"
                      value={carreiraForm.regime}
                      onChange={(e) => setCarreiraForm({ ...carreiraForm, regime: e.target.value })}
                    >
                      <option value="Carreira de Regime Especial - SERNIC">Carreira de Regime Especial - SERNIC</option>
                      <option value="Carreira Técnica Especial Forense">Carreira Técnica Especial Forense</option>
                      <option value="Carreira Técnica Superior Especializada">Carreira Técnica Superior Especializada</option>
                      <option value="Carreira Especial de Saúde Forense">Carreira Especial de Saúde Forense</option>
                      <option value="Carreira de Apoio Policial">Carreira de Apoio Policial</option>
                      <option value="Carreira de Regime Especial - Intervenção Rápida">Carreira de Regime Especial - Intervenção Rápida</option>
                      <option value="Regime Geral da Função Pública">Regime Geral da Função Pública</option>
                    </select>
                  </div>

                  <div className="form-group-custom">
                    <label>Ramo / Departamento Orgânico</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      placeholder="Ex: Laboratório Central de Criminalística"
                      value={carreiraForm.ramo}
                      onChange={(e) => setCarreiraForm({ ...carreiraForm, ramo: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* BLOCO 2: ENQUADRAMENTO SALARIAL, QUOTAS E REQUISITOS */}
              <div className="carreira-form-section" style={{ marginTop: '1.25rem' }}>
                <div className="carreira-section-title">
                  <SlidersHorizontal size={16} color="#c59b27" />
                  <span>Enquadramento Salarial (TSU), Vagas & Idade</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-custom">
                    <label>Grau Académico de Ingresso *</label>
                    <select
                      className="definicoes-select full"
                      value={carreiraForm.grauMinimo}
                      onChange={(e) => setCarreiraForm({ ...carreiraForm, grauMinimo: e.target.value })}
                    >
                      <option value="Licenciatura">Licenciatura (Nível Superior)</option>
                      <option value="Mestrado">Mestrado</option>
                      <option value="12ª Classe / Nível Médio">12ª Classe / Nível Médio</option>
                      <option value="Bacharelato">Bacharelato</option>
                    </select>
                  </div>

                  <div className="form-group-custom">
                    <label>Quotas de Vagas Autorizadas</label>
                    <input
                      type="number"
                      className="definicoes-input"
                      value={carreiraForm.vagas}
                      onChange={(e) => setCarreiraForm({ ...carreiraForm, vagas: Number(e.target.value) })}
                      min="1"
                      max="2000"
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Estado da Carreira</label>
                    <select
                      className="definicoes-select full"
                      value={carreiraForm.status}
                      onChange={(e) => setCarreiraForm({ ...carreiraForm, status: e.target.value })}
                    >
                      <option value="Activa">Activa (Apta para Concursos)</option>
                      <option value="Inactiva">Inactiva (Suspensa)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                  <div className="form-group-custom">
                    <label>Enquadramento TSU & Subsídios</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      placeholder="Ex: Faixa TSU-14 a TSU-18 (+40% Risco)"
                      value={carreiraForm.enquadramentoTSU}
                      onChange={(e) => setCarreiraForm({ ...carreiraForm, enquadramentoTSU: e.target.value })}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Idade Mínima</label>
                    <input
                      type="number"
                      className="definicoes-input"
                      value={carreiraForm.idadeMinima}
                      onChange={(e) => setCarreiraForm({ ...carreiraForm, idadeMinima: Number(e.target.value) })}
                      min="18"
                      max="35"
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Idade Máxima</label>
                    <input
                      type="number"
                      className="definicoes-input"
                      value={carreiraForm.idadeMaxima}
                      onChange={(e) => setCarreiraForm({ ...carreiraForm, idadeMaxima: Number(e.target.value) })}
                      min="21"
                      max="55"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCO 3: CURSOS AUTORIZADOS, COMPETÊNCIAS E REQUISITOS OPERATIVOS */}
              <div className="carreira-form-section" style={{ marginTop: '1.25rem' }}>
                <div className="carreira-section-title">
                  <BookOpen size={16} color="#15803d" />
                  <span>Áreas de Formação & Cursos Aceites</span>
                </div>

                <div className="form-group-custom">
                  <label>Cursos e Formações Académicas Aceites (separadas por vírgula)</label>
                  <input
                    type="text"
                    className="definicoes-input"
                    placeholder="Ex: Direito, Ciências Policiais, Criminologia, Psicologia Forense"
                    value={carreiraForm.cursosAceites}
                    onChange={(e) => setCarreiraForm({ ...carreiraForm, cursosAceites: e.target.value })}
                  />
                </div>
              </div>

              {/* RODAPÉ DO FORMULÁRIO */}
              <div className="dossier-modal-footer" style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setIsCarreiraModalOpen(false)}
                >
                  Cancelar
                </button>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {editingCarreira && (
                    <button
                      type="button"
                      className="gestor-btn-outline danger"
                      onClick={() => {
                        handleDeleteCarreira(editingCarreira.id);
                        setIsCarreiraModalOpen(false);
                      }}
                      style={{ color: '#c32026', borderColor: '#fca5a5' }}
                    >
                      <Trash2 size={15} />
                      <span>Eliminar Carreira</span>
                    </button>
                  )}
                  <button type="submit" className="gestor-btn-primary-red">
                    <Save size={15} />
                    <span>{editingCarreira ? 'Salvar Alterações da Carreira' : 'Homologar & Cadastrar Carreira'}</span>
                  </button>
                </div>
              </div>
            </form>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          MODAL DE GESTÃO DE PERFIL & CREDENCIAMENTO (LIMPO & OFICIAL)
          ======================================================== */}
      {isPerfilModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="gestor-modal-overlay fadeIn" onClick={(e) => {
          if (e.target === e.currentTarget) setIsPerfilModalOpen(false);
        }}>
          <DraggableSubAba
            className="gestor-modal-card definicoes-modal"
            style={{ width: 'min(720px, 94vw)', maxWidth: 'min(720px, 94vw)' }}
            moveHandleLabel="Mover Credenciamento de Membro"
            onClose={() => setIsPerfilModalOpen(false)}
          >
            <div className="dossier-modal-header">
              <div className="dossier-header-left">
                <div 
                  className="dossier-modal-avatar" 
                  style={{ 
                    background: perfilForm.avatarCor || '#0f2042', 
                    color: '#ffffff' 
                  }}
                >
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800 }}>
                    {editingPerfil ? `Editar Membro: ${editingPerfil.nome}` : 'Credenciar Novo Membro da Comissão'}
                  </h3>
                  <span className="dossier-protocolo">
                    {editingPerfil ? `${editingPerfil.id} • ${editingPerfil.tipoPerfil}` : 'Novo Cadastro • Comissão do Concurso SERNIC'}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSavePerfil} className="dossier-modal-body">
              {/* ATALHO DE FUNÇÃO RÁPIDA: SELECT NATIVO LIMPO */}
              <div className="form-group-custom" style={{ background: 'var(--portal-bg-hover)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--portal-border)', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: 'var(--portal-gold)' }}>
                  <Sparkles size={15} />
                  <span>Atribuição Rápida de Papel no Júri (Define as permissões ideais)</span>
                </label>
                <select
                  className="definicoes-select full"
                  value={perfilForm.tipoPerfil}
                  onChange={(e) => {
                    const selectedRole = e.target.value;
                    setPerfilForm(prev => ({ ...prev, tipoPerfil: selectedRole }));
                    handleApplyRoleTemplate(selectedRole);
                  }}
                >
                  <option value="Administrador Geral">Administrador Geral (Acesso total ao concurso)</option>
                  <option value="Gestora de Triagem Documental">Gestora de Triagem Documental (1ª Fase & Pautas)</option>
                  <option value="Examinador Técnico & Psicotécnico">Examinador Técnico & Psicotécnico (Notas e Provas)</option>
                  <option value="Avaliadora Médica & Saúde">Avaliadora Médica & Saúde (Junta Médica & Inspeções)</option>
                  <option value="Auditor de Conformidade">Auditor de Conformidade (Livro de Atas & Relatórios)</option>
                </select>
              </div>

              {/* IDENTIFICAÇÃO EM 2 COLUNAS PADRONIZADAS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group-custom">
                  <label>Nome Completo do Membro *</label>
                  <input
                    type="text"
                    className="definicoes-input"
                    required
                    placeholder="Ex: Dra. Maria Helena Tembe"
                    value={perfilForm.nome}
                    onChange={(e) => setPerfilForm({ ...perfilForm, nome: e.target.value })}
                  />
                </div>

                <div className="form-group-custom">
                  <label>Cargo / Função Oficial *</label>
                  <input
                    type="text"
                    className="definicoes-input"
                    required
                    placeholder="Ex: Vogal do Júri de Seleção"
                    value={perfilForm.cargo}
                    onChange={(e) => setPerfilForm({ ...perfilForm, cargo: e.target.value })}
                  />
                </div>

                <div className="form-group-custom">
                  <label>Departamento / Divisão</label>
                  <input
                    type="text"
                    className="definicoes-input"
                    placeholder="Ex: Divisão de Recursos Humanos - SERNIC"
                    value={perfilForm.departamento}
                    onChange={(e) => setPerfilForm({ ...perfilForm, departamento: e.target.value })}
                  />
                </div>

                <div className="form-group-custom">
                  <label>Email Institucional</label>
                  <input
                    type="email"
                    className="definicoes-input"
                    placeholder="Ex: maria.tembe@sernic.gov.mz"
                    value={perfilForm.email}
                    onChange={(e) => setPerfilForm({ ...perfilForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group-custom">
                  <label>Contacto Telefónico</label>
                  <input
                    type="text"
                    className="definicoes-input"
                    placeholder="+258 84 000 0000"
                    value={perfilForm.telefone}
                    onChange={(e) => setPerfilForm({ ...perfilForm, telefone: e.target.value })}
                  />
                </div>

                <div className="form-group-custom">
                  <label>Estado do Acesso</label>
                  <select
                    className="definicoes-select full"
                    value={perfilForm.estado}
                    onChange={(e) => setPerfilForm({ ...perfilForm, estado: e.target.value })}
                  >
                    <option value="Activo">Activo (Credenciado)</option>
                    <option value="Em Pausa">Em Pausa (Suspenso Temporariamente)</option>
                  </select>
                </div>
              </div>

              {/* PERMISSÕES LIMPAS EM CHECKBOXES */}
              <div style={{ marginBottom: '1rem', borderTop: '1px solid var(--portal-border)', paddingTop: '0.85rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: 'var(--portal-text-main)', marginBottom: '0.6rem' }}>
                  Permissões de Acesso no Concurso
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.83rem', cursor: 'pointer', color: 'var(--portal-text-main)' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(perfilForm.permissoes?.visualizarCandidatos)}
                      onChange={(e) => setPerfilForm(prev => ({
                        ...prev,
                        permissoes: { ...prev.permissoes, visualizarCandidatos: e.target.checked }
                      }))}
                    />
                    <span>Consultar e visualizar inscritos</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.83rem', cursor: 'pointer', color: 'var(--portal-text-main)' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(perfilForm.permissoes?.deliberarFase1)}
                      onChange={(e) => setPerfilForm(prev => ({
                        ...prev,
                        permissoes: { ...prev.permissoes, deliberarFase1: e.target.checked }
                      }))}
                    />
                    <span>Triagem documental da 1ª Fase</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.83rem', cursor: 'pointer', color: 'var(--portal-text-main)' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(perfilForm.permissoes?.homologarFinal)}
                      onChange={(e) => setPerfilForm(prev => ({
                        ...prev,
                        permissoes: { ...prev.permissoes, homologarFinal: e.target.checked }
                      }))}
                    />
                    <span>Homologação final de resultados</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.83rem', cursor: 'pointer', color: 'var(--portal-text-main)' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(perfilForm.permissoes?.publicarPautas)}
                      onChange={(e) => setPerfilForm(prev => ({
                        ...prev,
                        permissoes: { ...prev.permissoes, publicarPautas: e.target.checked }
                      }))}
                    />
                    <span>Publicação de pautas oficiais</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.83rem', cursor: 'pointer', color: 'var(--portal-text-main)' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(perfilForm.permissoes?.gerirVagasCarreiras)}
                      onChange={(e) => setPerfilForm(prev => ({
                        ...prev,
                        permissoes: { ...prev.permissoes, gerirVagasCarreiras: e.target.checked }
                      }))}
                    />
                    <span>Gestão de vagas e carreiras</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.83rem', cursor: 'pointer', color: 'var(--portal-text-main)' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(perfilForm.permissoes?.consultarAuditoria)}
                      onChange={(e) => setPerfilForm(prev => ({
                        ...prev,
                        permissoes: { ...prev.permissoes, consultarAuditoria: e.target.checked }
                      }))}
                    />
                    <span>Consulta ao livro de atas e auditoria</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.83rem', cursor: 'pointer', color: 'var(--portal-text-main)' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(perfilForm.permissoes?.gerirPerfisAcessos)}
                      onChange={(e) => setPerfilForm(prev => ({
                        ...prev,
                        permissoes: { ...prev.permissoes, gerirPerfisAcessos: e.target.checked }
                      }))}
                    />
                    <span>Administração e gestão de acessos</span>
                  </label>
                </div>
              </div>

              {/* NOTA INSTITUCIONAL COMPACTA */}
              <div className="form-group-custom" style={{ marginBottom: '1rem' }}>
                <label>Nota de Responsabilidade Institucional</label>
                <input
                  type="text"
                  className="definicoes-input"
                  placeholder="Ex: Membro designado por despacho para coordenar as bancas examinadoras."
                  value={perfilForm.notaHumanizada || ''}
                  onChange={(e) => setPerfilForm({ ...perfilForm, notaHumanizada: e.target.value })}
                />
              </div>

              {/* RODAPÉ OFICIAL SERNIC */}
              <div className="dossier-modal-footer" style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setIsPerfilModalOpen(false)}
                >
                  Cancelar
                </button>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {editingPerfil && editingPerfil.id !== 'PRF-01' && (
                    <button
                      type="button"
                      className="gestor-btn-outline danger"
                      onClick={() => {
                        const target = editingPerfil;
                        setIsPerfilModalOpen(false);
                        setPerfilToDelete(target);
                      }}
                      style={{ color: '#c32026', borderColor: '#fca5a5' }}
                    >
                      <Trash2 size={15} />
                      <span>Remover Membro</span>
                    </button>
                  )}
                  <button type="submit" className="gestor-btn-primary-red">
                    <Save size={15} />
                    <span>{editingPerfil ? 'Salvar Credenciamento' : 'Guardar Credenciamento'}</span>
                  </button>
                </div>
              </div>
            </form>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          SUB-ABA OFICIAL SERNIC: CONFIRMAÇÃO DE REVOGAÇÃO DE PERFIL
          (SUBSTITUI O PROMPT NATIVO DO BROWSER POR SUB-ABA INSTITUCIONAL)
          ======================================================== */}
      {perfilToDelete && typeof document !== 'undefined' && createPortal(
        <div 
          className="gestor-modal-overlay fadeIn" 
          onClick={(e) => {
            if (e.target === e.currentTarget) setPerfilToDelete(null);
          }}
        >
          <DraggableSubAba
            className="gestor-modal-card definicoes-modal confirm-delete-sub-aba"
            style={{ width: 'min(840px, 96vw)', maxWidth: 'min(840px, 96vw)' }}
            onClose={() => setPerfilToDelete(null)}
          >
            {/* CABEÇALHO INSTITUCIONAL TIMBRADO SERNIC */}
            <div 
              className="dossier-modal-header" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(195, 32, 38, 0.08) 0%, rgba(15, 32, 66, 0.05) 100%)',
                borderBottom: '1px solid rgba(195, 32, 38, 0.25)'
              }}
            >
              <div className="dossier-header-left">
                <div 
                  className="dossier-modal-avatar" 
                  style={{ 
                    background: '#c32026', 
                    color: '#ffffff',
                    boxShadow: '0 4px 14px rgba(195, 32, 38, 0.35)' 
                  }}
                >
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#c32026' }}>
                    Revogação de Credenciamento & Acesso
                  </h3>
                  <span className="dossier-protocolo">
                    SERNIC • Deliberação Administrativa do Júri
                  </span>
                </div>
              </div>
            </div>

            {/* CORPO DA SUB-ABA COM DESIGN INSTITUCIONAL DO SISTEMA */}
            <div className="dossier-modal-body" style={{ padding: '1.5rem' }}>
              {/* ALERTA DE AUDITORIA & SEGURANÇA */}
              <div style={{
                background: 'rgba(195, 32, 38, 0.05)',
                border: '1px solid rgba(195, 32, 38, 0.22)',
                borderRadius: '10px',
                padding: '1rem 1.2rem',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.85rem',
                alignItems: 'flex-start'
              }}>
                <ShieldAlert size={26} color="#c32026" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.88rem', color: 'var(--portal-text-main)', lineHeight: 1.55 }}>
                  <strong style={{ color: '#c32026', display: 'block', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    Atenção: Revogação de Acesso Oficial
                  </strong>
                  Tem a certeza de que deseja revogar o credenciamento e acesso deste membro? Esta deliberação administrativa será formalmente lavrada no <strong>Livro de Atas e Auditoria</strong> e as permissões de acesso ao concurso serão revogadas com efeito imediato.
                </div>
              </div>

              {/* CARTÃO RESUMO DO MEMBRO */}
              <div style={{
                background: 'var(--portal-bg-hover)',
                border: '1px solid var(--portal-border)',
                borderRadius: '12px',
                padding: '1.15rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: perfilToDelete.avatarCor || '#0f2042',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)'
                }}>
                  {perfilToDelete.nome ? perfilToDelete.nome.split(' ').map(n => n[0]).slice(0, 2).join('') : 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.2rem' }}>
                    <span style={{ 
                      fontFamily: 'monospace', 
                      fontWeight: 800, 
                      fontSize: '0.78rem', 
                      color: '#c32026', 
                      background: 'rgba(195, 32, 38, 0.08)', 
                      padding: '0.15rem 0.45rem', 
                      borderRadius: '4px' 
                    }}>
                      {perfilToDelete.id}
                    </span>
                    <strong style={{ fontSize: '1.02rem', color: 'var(--portal-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {perfilToDelete.nome}
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--portal-text-muted)', marginBottom: '0.25rem' }}>
                    {perfilToDelete.cargo} • {perfilToDelete.departamento || 'Comissão SERNIC'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="grau-badge" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', whiteSpace: 'nowrap' }}>
                      {perfilToDelete.tipoPerfil}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--portal-text-muted)' }}>
                      {perfilToDelete.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* RODAPÉ OFICIAL SERNIC */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                borderTop: '1px solid var(--portal-border)',
                paddingTop: '1.25rem'
              }}>
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setPerfilToDelete(null)}
                  style={{ minWidth: '130px' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="gestor-btn-primary-red"
                  onClick={handleConfirmDeletePerfil}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem' }}
                >
                  <Trash2 size={16} />
                  <span>Confirmar Revogação</span>
                </button>
              </div>
            </div>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          MODAL 6: GESTÃO E EDIÇÃO DE VAGA / CONCURSO (GESTOR CRUD)
          ======================================================== */}
      {gestorVagaModal && gestorVagaForm && typeof document !== 'undefined' && createPortal(
        <div 
          className="gestor-modal-overlay fadeIn" 
          onClick={(e) => {
            if (e.target === e.currentTarget) setGestorVagaModal(null);
          }}
        >
          <DraggableSubAba 
            className="gestor-modal-card definicoes-modal" 
            style={{ width: 'min(calc(760px + 7cm), 95vw)', maxWidth: 'min(calc(760px + 7cm), 95vw)' }}
            moveHandleLabel="Mover Gestão da Vaga"
            onClose={() => setGestorVagaModal(null)}
          >
            <div className="dossier-modal-header">
              <div className="dossier-header-left">
                <div className="dossier-modal-avatar">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3>
                    {gestorVagaMode === 'create' ? 'Lançar Novo Concurso Oficial' : `Editar Concurso: ${gestorVagaForm.titulo}`}
                  </h3>
                  <span className="dossier-protocolo">
                    {gestorVagaForm.codigoEdital || 'Novo Concurso • SERNIC'}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveVagaGestor} className="dossier-modal-body" style={{ padding: '1.5rem 1.8rem' }}>
              {/* SECÇÃO 1: IDENTIFICAÇÃO OFICIAL E RAMO DO SERNIC */}
              <div className="vaga-form-section">
                <div className="vaga-form-section-header">
                  <div className="vaga-form-section-badge">1</div>
                  <div className="vaga-form-section-title-wrap">
                    <h4 className="vaga-form-section-title">
                      <Briefcase size={17} color="#c32026" />
                      <span>Identificação Oficial do Cargo & Ramo SERNIC</span>
                    </h4>
                    <p className="vaga-form-section-subtitle">
                      Designação da carreira, código do edital oficial e ramo de investigação
                    </p>
                  </div>
                </div>

                <div className="vaga-section-grid full" style={{ marginBottom: '0.9rem' }}>
                  <div className="form-group-custom">
                    <label>Designação Oficial da Carreira / Vaga</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      placeholder="Ex: Investigador Criminal de 2ª Classe"
                      value={gestorVagaForm.titulo}
                      onChange={(e) => setGestorVagaForm({ ...gestorVagaForm, titulo: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="vaga-section-grid">
                  <div className="form-group-custom">
                    <label>Código do Edital / Aviso Oficial</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      placeholder="Ex: Aviso n.º 01/SERNIC-DG/DRH/2026"
                      value={gestorVagaForm.codigoEdital}
                      onChange={(e) => setGestorVagaForm({ ...gestorVagaForm, codigoEdital: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Área / Ramo do SERNIC</label>
                    <select
                      className="definicoes-select full"
                      value={gestorVagaForm.carreira}
                      onChange={(e) => setGestorVagaForm({ ...gestorVagaForm, carreira: e.target.value })}
                    >
                      <option value="Investigação Criminal e Instrução Processual">Investigação Criminal e Instrução Processual</option>
                      <option value="Laboratório Central de Criminalística (Polícia Científica)">Polícia Científica (Laboratório Forense)</option>
                      <option value="Divisão de Investigação de Cibercrimes e Inteligência Digital">Inteligência Digital e Cibercrime</option>
                      <option value="Departamento de Tanatologia e Toxicologia">Medicina Legal e Toxicologia Forense</option>
                      <option value="Corpo Técnico Operativo">Corpo Técnico Operativo e Apoio</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECÇÃO 2: QUOTAS AUTORIZADAS E DISTRIBUIÇÃO TERRITORIAL */}
              <div className="vaga-form-section">
                <div className="vaga-form-section-header">
                  <div className="vaga-form-section-badge">2</div>
                  <div className="vaga-form-section-title-wrap">
                    <h4 className="vaga-form-section-title">
                      <Users size={17} color="#c32026" />
                      <span>Quotas Autorizadas & Colocação Geográfica</span>
                    </h4>
                    <p className="vaga-form-section-subtitle">
                      Postos aprovados pelo Ministério e províncias / delegações de destino
                    </p>
                  </div>
                </div>

                <div className="vaga-section-grid">
                  <div className="form-group-custom">
                    <label>Quotas de Vagas Autorizadas</label>
                    <input
                      type="number"
                      min="1"
                      className="definicoes-input"
                      value={gestorVagaForm.vagas}
                      onChange={(e) => setGestorVagaForm({ ...gestorVagaForm, vagas: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Estado Operacional do Concurso</label>
                    <select
                      className="definicoes-select full"
                      value={gestorVagaForm.status}
                      onChange={(e) => setGestorVagaForm({ ...gestorVagaForm, status: e.target.value })}
                    >
                      <option value="Aberto">Aberto</option>
                      <option value="Encerrado">Encerrado</option>
                      <option value="Em Breve">Em Breve</option>
                    </select>
                  </div>

                  <div className="form-group-custom" style={{ gridColumn: '1 / -1' }}>
                    <label>Colocação Geográfica / Delegações Provinciais</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      value={gestorVagaForm.local}
                      onChange={(e) => setGestorVagaForm({ ...gestorVagaForm, local: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECÇÃO 3: CRONOGRAMA OFICIAL E PRAZOS */}
              <div className="vaga-form-section">
                <div className="vaga-form-section-header">
                  <div className="vaga-form-section-badge">3</div>
                  <div className="vaga-form-section-title-wrap">
                    <h4 className="vaga-form-section-title">
                      <Calendar size={17} color="#c32026" />
                      <span>Cronograma Oficial & Prazos Improrrogáveis</span>
                    </h4>
                    <p className="vaga-form-section-subtitle">
                      Datas de publicação em BR e encerramento oficial de candidaturas
                    </p>
                  </div>
                </div>

                <div className="vaga-section-grid">
                  <div className="form-group-custom">
                    <label>Data de Publicação / Abertura</label>
                    <input
                      type="date"
                      className="definicoes-input"
                      value={gestorVagaForm.dataAbertura}
                      onChange={(e) => setGestorVagaForm({ ...gestorVagaForm, dataAbertura: e.target.value })}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Data Limite de Candidaturas</label>
                    <input
                      type="date"
                      className="definicoes-input"
                      value={gestorVagaForm.dataLimite}
                      onChange={(e) => setGestorVagaForm({ ...gestorVagaForm, dataLimite: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECÇÃO 4: ENQUADRAMENTO SALARIAL E TSU */}
              <div className="vaga-form-section">
                <div className="vaga-form-section-header">
                  <div className="vaga-form-section-badge">4</div>
                  <div className="vaga-form-section-title-wrap">
                    <h4 className="vaga-form-section-title">
                      <Award size={17} color="#c59b27" />
                      <span>Enquadramento Salarial & TSU</span>
                    </h4>
                    <p className="vaga-form-section-subtitle">
                      Tabela Salarial Única e suplementos remuneratórios do estatuto do SERNIC
                    </p>
                  </div>
                </div>

                <div className="vaga-section-grid full">
                  <div className="form-group-custom">
                    <label>Enquadramento Salarial / Nível TSU & Benefícios</label>
                    <input
                      type="text"
                      className="definicoes-input"
                      value={gestorVagaForm.remuneracao}
                      onChange={(e) => setGestorVagaForm({ ...gestorVagaForm, remuneracao: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="dossier-modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {gestorVagaMode === 'edit' && (
                  <button
                    type="button"
                    className="sub-aba-btn-action danger"
                    onClick={() => handleDeleteVagaGestor(gestorVagaForm.id)}
                  >
                    <Trash2 size={14} />
                    <span>Excluir Concurso</span>
                  </button>
                )}
                <div style={{ display: 'flex', gap: '0.6rem', marginLeft: 'auto' }}>
                  <button
                    type="button"
                    className="gestor-btn-secondary"
                    onClick={() => setGestorVagaModal(null)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="gestor-btn-primary-red">
                    <Save size={15} />
                    <span>{gestorVagaMode === 'create' ? 'Publicar Novo Concurso' : 'Guardar Alterações'}</span>
                  </button>
                </div>
              </div>
            </form>
          </DraggableSubAba>
        </div>,
        document.body
      )}
      {/* ========================================================
          MODAL 7: AUTORIZAÇÃO DE SEGURANÇA - REPOSIÇÃO EM MASSA
          ======================================================== */}
      {isModalResetGeralOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="gestor-modal-overlay fadeIn" 
          style={{ zIndex: 1300 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalResetGeralOpen(false);
              setSenhaResetGeral('');
              setErroResetGeral('');
            }
          }}
        >
          <DraggableSubAba 
            className="gestor-modal-card security-modal-card" 
            style={{ width: 'min(840px, 96vw)', maxWidth: 'min(840px, 96vw)' }}
            onClose={() => {
              setIsModalResetGeralOpen(false);
              setSenhaResetGeral('');
              setErroResetGeral('');
            }}
          >
            <div className="dossier-modal-header" style={{ borderBottom: '1px solid rgba(195, 32, 38, 0.2)', background: 'linear-gradient(135deg, rgba(195, 32, 38, 0.08) 0%, rgba(15, 32, 66, 0.05) 100%)' }}>
              <div className="dossier-header-left">
                <div className="modal-security-icon-circle danger">
                  <ShieldAlert size={26} color="#c32026" />
                </div>
                <div>
                  <h3 style={{ color: '#c32026', fontSize: '1.15rem' }}>Autorização de Segurança do Gestor</h3>
                  <span className="dossier-protocolo" style={{ color: 'var(--portal-text-muted)' }}>
                    Reposição Geral de Candidaturas • Teste Inicial SERNIC
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmarResetGeralComSenha} className="dossier-modal-body" style={{ padding: '1.4rem 1.6rem' }}>
              <div className="security-notice-alert" style={{
                background: 'rgba(239, 68, 68, 0.07)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '0.9rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.8rem',
                alignItems: 'flex-start'
              }}>
                <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.85rem', lineHeight: '1.45', color: 'var(--portal-text-main)' }}>
                  <strong>Atenção Regulamentar:</strong> Esta operação irá reverter todas as candidaturas para o estado inicial de <strong>"Em Análise Documental" (1ª Fase)</strong>, apagando deliberações prévias e perfis homologadores para iniciar novo ciclo de triagem.
                </div>
              </div>

              <div className="form-group-custom" style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem' }}>
                  <KeyRound size={16} color="#c32026" />
                  <span>Introduza a Senha do Gestor para Confirmar:</span>
                </label>
                <div style={{ position: 'relative', marginTop: '0.4rem' }}>
                  <input
                    type={mostrarSenhaResetGeral ? 'text' : 'password'}
                    className="definicoes-input"
                    placeholder="Digite sua senha de acesso..."
                    value={senhaResetGeral}
                    onChange={(e) => {
                      setSenhaResetGeral(e.target.value);
                      if (erroResetGeral) setErroResetGeral('');
                    }}
                    autoFocus
                    required
                    style={{ paddingRight: '2.8rem', fontSize: '0.95rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenhaResetGeral(!mostrarSenhaResetGeral)}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--portal-text-muted)'
                    }}
                    title={mostrarSenhaResetGeral ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {mostrarSenhaResetGeral ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {erroResetGeral && (
                  <div style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 600, marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <XCircle size={14} />
                    <span>{erroResetGeral}</span>
                  </div>
                )}
                <div style={{ fontSize: '0.78rem', color: 'var(--portal-text-muted)', marginTop: '0.45rem' }}>
                  Utilize a senha de login do gestor (ex: <code>admin123</code> ou <code>sernic2026</code>).
                </div>
              </div>

              <div className="dossier-modal-footer" style={{ padding: 0, marginTop: '1.4rem' }}>
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => {
                    setIsModalResetGeralOpen(false);
                    setSenhaResetGeral('');
                    setErroResetGeral('');
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="gestor-btn-primary-red"
                  style={{ background: '#b91c1c' }}
                >
                  <RotateCcw size={15} />
                  <span>Confirmar & Repor Tudo para Teste</span>
                </button>
              </div>
            </form>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          MODAL 8: CONFIRMAÇÃO DE REPOSIÇÃO INDIVIDUAL
          ======================================================== */}
      {candidatoParaReporIndividual && typeof document !== 'undefined' && createPortal(
        <div 
          className="gestor-modal-overlay fadeIn" 
          style={{ zIndex: 1300 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCandidatoParaReporIndividual(null);
          }}
        >
          <DraggableSubAba 
            className="gestor-modal-card security-modal-card" 
            style={{ width: 'min(840px, 96vw)', maxWidth: 'min(840px, 96vw)' }}
            onClose={() => setCandidatoParaReporIndividual(null)}
          >
            <div className="dossier-modal-header" style={{ borderBottom: '1px solid rgba(217, 119, 6, 0.25)', background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(15, 32, 66, 0.04) 100%)' }}>
              <div className="dossier-header-left">
                <div className="modal-security-icon-circle warning">
                  <RotateCcw size={24} color="#d97706" />
                </div>
                <div>
                  <h3 style={{ color: '#b45309', fontSize: '1.15rem' }}>Repor Candidatura Individual</h3>
                  <span className="dossier-protocolo" style={{ color: 'var(--portal-text-muted)' }}>
                    {candidatoParaReporIndividual.codigoCandidatura}
                  </span>
                </div>
              </div>
            </div>

            <div className="dossier-modal-body" style={{ padding: '1.4rem 1.6rem' }}>
              <div className="candidate-repor-preview-card">
                <div className="candidate-repor-row">
                  <span className="label">Candidato:</span>
                  <span className="value"><strong>{candidatoParaReporIndividual.nomeCompleto}</strong></span>
                </div>
                <div className="candidate-repor-row">
                  <span className="label">Carreira / Vaga:</span>
                  <span className="value">{candidatoParaReporIndividual.vagaTitulo}</span>
                </div>
                <div className="candidate-repor-row">
                  <span className="label">Estado Atual:</span>
                  <span className="value tag-current-status">{candidatoParaReporIndividual.status}</span>
                </div>
                {candidatoParaReporIndividual.admitidoPor && (
                  <div className="candidate-repor-row">
                    <span className="label">Homologado por:</span>
                    <span className="value" style={{ color: '#166534', fontWeight: 600 }}>
                      {candidatoParaReporIndividual.admitidoPor.nome} ({candidatoParaReporIndividual.admitidoPor.perfil})
                    </span>
                  </div>
                )}
              </div>

              <p style={{ fontSize: '0.86rem', color: 'var(--portal-text-secondary)', lineHeight: '1.5', marginTop: '1rem', marginBottom: '1.4rem' }}>
                Pretende repor este candidato para o estado inicial de <strong>"Em Análise Documental" (1ª Fase)</strong>? 
                A deliberação anterior e a homologação serão reiniciadas, permitindo que a comissão proceda a uma reavaliação completa.
              </p>

              <div className="dossier-modal-footer" style={{ padding: 0 }}>
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setCandidatoParaReporIndividual(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="gestor-btn-primary-red"
                  style={{ background: '#d97706', borderColor: '#b45309' }}
                  onClick={handleConfirmarReporIndividual}
                >
                  <RotateCcw size={15} />
                  <span>Sim, Repor Candidato</span>
                </button>
              </div>
            </div>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          MODAL 8.1: ELIMINAÇÃO SEGURA DO PERFIL DO CANDIDATO
          ======================================================== */}
      {candidatoParaEliminar && typeof document !== 'undefined' && createPortal(
        <div 
          className="gestor-modal-overlay fadeIn" 
          style={{ zIndex: 1350 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCandidatoParaEliminar(null);
          }}
        >
          <DraggableSubAba 
            className="gestor-modal-card security-modal-card" 
            style={{ width: 'min(840px, 96vw)', maxWidth: 'min(840px, 96vw)' }}
            onClose={() => setCandidatoParaEliminar(null)}
          >
            <div className="dossier-modal-header" style={{ borderBottom: '1px solid rgba(220, 38, 38, 0.25)', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(15, 32, 66, 0.04) 100%)' }}>
              <div className="dossier-header-left">
                <div className="modal-security-icon-circle" style={{ background: 'rgba(220, 38, 38, 0.12)', color: '#dc2626' }}>
                  <Trash2 size={24} color="#dc2626" />
                </div>
                <div>
                  <h3 style={{ color: '#dc2626', fontSize: '1.15rem' }}>Apagar Perfil de Candidato</h3>
                  <span className="dossier-protocolo" style={{ color: 'var(--portal-text-muted)' }}>
                    {candidatoParaEliminar.codigoCandidatura} • Eliminação Permanente
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmarEliminacaoCandidato} className="dossier-modal-body" style={{ padding: '1.4rem 1.6rem' }}>
              <div className="candidate-repor-preview-card" style={{ borderColor: 'rgba(220, 38, 38, 0.25)' }}>
                <div className="candidate-repor-row">
                  <span className="label">Candidato:</span>
                  <span className="value"><strong>{candidatoParaEliminar.nomeCompleto}</strong></span>
                </div>
                <div className="candidate-repor-row">
                  <span className="label">N.º de BI:</span>
                  <span className="value">{candidatoParaEliminar.biNumero || 'Não informado'}</span>
                </div>
                <div className="candidate-repor-row">
                  <span className="label">Carreira / Vaga:</span>
                  <span className="value">{candidatoParaEliminar.vagaTitulo}</span>
                </div>
                <div className="candidate-repor-row">
                  <span className="label">Estado Atual:</span>
                  <span className="value tag-current-status">{candidatoParaEliminar.status}</span>
                </div>
              </div>

              {isSuperAdminTecnico ? (
                <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#991b1b', lineHeight: 1.5 }}>
                    <strong>Atenção (Super Administrador / Técnico):</strong> Está prestes a eliminar definitivamente este perfil de candidatura do sistema. Esta ação removerá a inscrição, histórico e anexos.
                  </p>
                </div>
              ) : (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.25)', marginBottom: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.83rem', color: '#b45309', lineHeight: 1.5 }}>
                      <strong>Controlo de Segurança Institucional:</strong> Apenas o perfil do <strong>Técnico (Super Administrador)</strong> tem competência para apagar candidatos. Para autorizar esta exclusão requerida pelo Júri, insira a senha do Técnico.
                    </p>
                  </div>

                  <div className="form-field full-width">
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Senha de Autorização do Técnico *:</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={mostrarSenhaTecnico ? 'text' : 'password'}
                        value={senhaTecnicoEliminar}
                        onChange={(e) => {
                          setSenhaTecnicoEliminar(e.target.value);
                          setErroSenhaTecnico('');
                        }}
                        placeholder="Insira a senha do Técnico (Ex: admin123)"
                        style={{ width: '100%', padding: '0.55rem 2.5rem 0.55rem 0.75rem', borderRadius: '6px', border: '1px solid var(--portal-border)' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenhaTecnico(!mostrarSenhaTecnico)}
                        style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--portal-text-muted)' }}
                      >
                        {mostrarSenhaTecnico ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {erroSenhaTecnico && (
                    <div style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600 }}>
                      {erroSenhaTecnico}
                    </div>
                  )}
                </div>
              )}

              <div className="dossier-modal-footer" style={{ padding: 0, marginTop: '1.4rem' }}>
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setCandidatoParaEliminar(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="gestor-btn-primary-red"
                  style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                >
                  <Trash2 size={15} />
                  <span>{isSuperAdminTecnico ? 'Confirmar e Apagar Candidato' : 'Autorizar e Apagar Candidato'}</span>
                </button>
              </div>
            </form>
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          MODAL 9: CONFIRMAÇÃO DE HOMOLOGAÇÃO DA 1ª FASE
          ======================================================== */}
      {confirmHomologacao1aFaseModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="gestor-modal-overlay fadeIn" 
          style={{ zIndex: 1300 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmHomologacao1aFaseModal(null);
          }}
        >
          <DraggableSubAba 
            className="gestor-modal-card security-modal-card" 
            style={{ width: 'min(840px, 96vw)', maxWidth: 'min(840px, 96vw)' }}
            onClose={() => setConfirmHomologacao1aFaseModal(null)}
          >
            <div className="dossier-modal-header" style={{ borderBottom: '1px solid rgba(22, 101, 52, 0.25)', background: 'linear-gradient(135deg, rgba(22, 101, 52, 0.08) 0%, rgba(15, 32, 66, 0.05) 100%)' }}>
              <div className="dossier-header-left">
                <div className="modal-security-icon-circle success">
                  <ShieldCheck size={26} color="#15803d" />
                </div>
                <div>
                  <h3 style={{ color: '#166534', fontSize: '1.15rem' }}>Homologação da 1ª Fase Documental</h3>
                  <span className="dossier-protocolo" style={{ color: 'var(--portal-text-muted)' }}>
                    Convocação Formal para a Fase de Entrevista • SERNIC
                  </span>
                </div>
              </div>
            </div>

            <div className="dossier-modal-body" style={{ padding: '1.4rem 1.6rem' }}>
              <div className="homologacao-details-box">
                <div className="homologacao-detail-row">
                  <span className="label">Candidato:</span>
                  <span className="val-highlight">{confirmHomologacao1aFaseModal.candidato?.nomeCompleto}</span>
                </div>
                <div className="homologacao-detail-row">
                  <span className="label">Protocolo:</span>
                  <span>{confirmHomologacao1aFaseModal.candidato?.codigoCandidatura}</span>
                </div>
                <div className="homologacao-detail-row">
                  <span className="label">Carreira Concorrida:</span>
                  <span>{confirmHomologacao1aFaseModal.candidato?.vagaTitulo}</span>
                </div>
                <div className="homologacao-detail-row">
                  <span className="label">Deliberação Homologada:</span>
                  <span className="badge-homolog-fase1">
                    <CheckCircle2 size={13} color="#15803d" />
                    <strong>{confirmHomologacao1aFaseModal.updates?.status || 'Admitido para a 2ª Fase'}</strong>
                  </span>
                </div>
                <div className="homologacao-detail-row">
                  <span className="label">Perfil do Homologador:</span>
                  <span className="val-perfil">
                    <strong>{currentUser?.nome || 'Gestor do Concurso'}</strong> • {currentUser?.cargo || 'Director / Inspetor SERNIC'} ({currentUser?.perfil || 'ADMINISTRADOR'})
                  </span>
                </div>
              </div>

              <div style={{
                background: 'rgba(21, 128, 61, 0.06)',
                border: '1px solid rgba(21, 128, 61, 0.25)',
                borderRadius: '8px',
                padding: '0.9rem 1rem',
                margin: '1.1rem 0',
                fontSize: '0.86rem',
                color: 'var(--portal-text-main)',
                lineHeight: '1.45'
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Confirmação Regulamentar:</strong> Tem a certeza de que pretende homologar este candidato na <strong>1ª Fase</strong> e convocá-lo oficialmente para a <strong>Fase de Entrevista</strong>? 
                  O candidato transitará para a pasta correspondente e o seu perfil ficará vinculado ao despacho oficial de homologação.
                </p>
              </div>

              <div className="dossier-modal-footer" style={{ padding: 0 }}>
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setConfirmHomologacao1aFaseModal(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="gestor-btn-primary-red"
                  style={{ background: '#15803d', borderColor: '#166534' }}
                  onClick={handleConfirmarHomologacao1aFase}
                >
                  <CheckCircle2 size={15} />
                  <span>Sim, Homologar para Entrevista</span>
                </button>
              </div>
            </div>
          </DraggableSubAba>
        </div>,
        document.body
      )}
    </div>
  );
}
