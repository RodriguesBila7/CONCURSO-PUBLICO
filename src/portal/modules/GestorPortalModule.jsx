import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  ExternalLink,
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
  PieChart
} from 'lucide-react';
import { 
  INITIAL_VAGAS, 
  PROVINCIAS_MOCAMBIQUE,
  getCandidatePhotoUrl,
  deduplicateCandidaturas,
  getStoredCandidaturas, 
  saveStoredCandidaturas,
  resetStoredCandidaturasParaInicio,
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
  getGenderText
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
    setCursos(getStoredCursos());
    setLocais(getStoredLocais());
    setDefinicoes(getStoredDefinicoes());
    setPaletasCores(getStoredPaletasCores());
    if (onNotify) {
      onNotify('success', 'Base de dados do concurso sincronizada com sucesso!');
    }
  };

  // Sincronização entre abas
  useEffect(() => {
    const handleSync = () => {
      setVagas(getStoredVagas());
      setCandidatos(deduplicateCandidaturas(getStoredCandidaturas()));
      setListas(getStoredListasPublicadas());
      setAuditoria(getStoredAuditoria());
      setPaletasCores(getStoredPaletasCores());
    };
    window.addEventListener('sernic-vagas-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sernic-vagas-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // ========================================================
  // ESTADOS DO MÓDULO "DEFINIÇÕES DO SISTEMA"
  // ========================================================
  // Sub-abas geridas a partir da Barra Lateral: 'cursos' | 'locais' | 'temas' | 'idioma' | 'geral'
  const [internalDefinicoesSubTab, setInternalDefinicoesSubTab] = useState('cursos');
  const definicoesSubTab = propDefinicoesSubTab || internalDefinicoesSubTab;
  const setDefinicoesSubTab = (tab) => {
    if (onDefinicoesSubTabChange) {
      onDefinicoesSubTabChange(tab);
    }
    setInternalDefinicoesSubTab(tab);
  };

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
  const [deliberandoCandidato, setDeliberandoCandidato] = useState(null);
  const [novoEstado, setNovoEstado] = useState('Admitido na Análise Documental');
  const [motivoExclusao, setMotivoExclusao] = useState('Falta de Certificado de Habilitações autenticado');
  const [outroMotivo, setOutroMotivo] = useState('');
  const [parecerJuri, setParecerJuri] = useState('');
  const [notaFinal, setNotaFinal] = useState('16.0');
  const [eventoData, setEventoData] = useState('15 de Novembro de 2026 às 08h30');
  const [eventoLocal, setEventoLocal] = useState('Direcção Geral do SERNIC - Sala de Conferências n.º 1, Maputo');
  const [tipoProva, setTipoProva] = useState('Entrevista Profissional e de Competências');

  // MODO FILTRO E PESQUISA NA AVALIAÇÃO DOS CANDIDATOS
  const [filtroDeliberacaoModo, setFiltroDeliberacaoModo] = useState('todos'); // 'todos' | 'admitidos' | 'excluidos' | 'convocados' | 'pendentes' | 'suplentes'
  const [buscaDeliberacao, setBuscaDeliberacao] = useState('');
  const [filtroDeliberacaoVaga, setFiltroDeliberacaoVaga] = useState('todas');
  const [filtroDeliberacaoProvincia, setFiltroDeliberacaoProvincia] = useState('todas');

  // ========================================================
  // DELIBERAÇÃO DIRETA DENTRO DA SUB-ABA DO DOSSIER (SEM SAIR DO MODAL)
  // ========================================================
  const handleInlineDeliberacao = (candidato, status) => {
    let parecerPadrao = '';
    let motivoFinal = null;
    let evData = null;
    let evLocal = null;
    let evTitulo = null;
    let nota = null;

    const isFem = detectCandidateGender(candidato) === 'Feminino';
    if (status === 'Admitido na Análise Documental' || status === 'Admitida na Análise Documental' || status === 'Entrevista Profissional') {
      parecerPadrao = `Candidatura admitida na 1ª Fase (Análise Documental). ${isFem ? 'Convocada' : 'Convocado'} formalmente para a Entrevista Profissional no local e data indicados.`;
      evData = candidato.detalhesFase?.dataEvento || '15 de Novembro de 2026 às 08h30';
      evLocal = candidato.detalhesFase?.local || `Gabinete Provincial de Entrevistas do SERNIC - ${candidato.provincia || 'Maputo'}`;
      evTitulo = 'Entrevista Profissional e de Competências';
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

    const operadorNome = currentUser?.name || 'Dr. Alberto Chissano (Presidente do Júri)';
    const updated = updateStoredCandidatura(candidato.codigoCandidatura, updates, operadorNome);
    if (updated) {
      reloadData();
      setSelectedDossier(updated);
      if (onNotify) onNotify('success', `Candidatura de ${candidato.nomeCompleto} atualizada para "${status}" com sucesso!`);
    }
  };

  const handleInlineDeleteCandidato = (codigo) => {
    if (window.confirm(`Tem a certeza que deseja eliminar permanentemente a candidatura ${codigo}?`)) {
      const ok = deleteStoredCandidatura(codigo, currentUser?.name || 'Comissão de Júri SERNIC');
      if (ok) {
        reloadData();
        setSelectedDossier(null);
        if (onNotify) onNotify('info', `Candidatura ${codigo} eliminada com sucesso.`);
      }
    }
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
    const entrevista = uniqueCandidatos.filter(c => c.status === 'Entrevista Profissional' || c.status === 'Convocada para provas' || c.status === 'Convocado para provas' || c.status === 'Admitido na Análise Documental' || c.status === 'Admitida na Análise Documental').length;
    
    // Admitidos na 1ª fase (Documental) e na 3ª fase (Efetivo na Vaga)
    const admitidosFase1 = uniqueCandidatos.filter(c => c.status === 'Admitido na Análise Documental' || c.status === 'Admitida na Análise Documental').length;
    const admitidosEfetivos = uniqueCandidatos.filter(c => c.status === 'Admitido' || c.status === 'Admitida').length;
    const admitidosTotal = admitidosFase1 + admitidosEfetivos;
    
    // Suplentes (Lista de reserva de recrutamento)
    const suplentesTotal = uniqueCandidatos.filter(c => c.status === 'Aprovado (Suplente)' || c.status === 'Aprovada (Suplente)').length;
    
    // Excluídos na 1ª Fase e na Entrevista (< 10 valores)
    const excluidosFase1 = uniqueCandidatos.filter(c => c.status === 'Excluído na Análise Documental' || c.status === 'Excluída na Análise Documental').length;
    const excluidosEntrevista = uniqueCandidatos.filter(c => c.status === 'Excluído na Entrevista' || c.status === 'Excluída na Entrevista' || (c.deliberacaoJuri?.notaFinal && parseFloat(c.deliberacaoJuri.notaFinal) < 10)).length;
    const excluidosTotal = uniqueCandidatos.filter(c => (c.status && c.status.includes('Excluíd'))).length;

    const convocadosTotal = entrevista;
    const pendentesTotal = analise;

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
      // Busca
      const search = buscaInscrito.trim().toLowerCase();
      if (search) {
        const codMatch = (c.codigoCandidatura || '').toLowerCase().includes(search);
        const nomeMatch = (c.nomeCompleto || '').toLowerCase().includes(search);
        const biMatch = (c.biNumero || '').toLowerCase().includes(search);
        const nuitMatch = (c.nuit || '').toLowerCase().includes(search);
        if (!codMatch && !nomeMatch && !biMatch && !nuitMatch) return false;
      }

      // Vaga
      if (filtroVaga !== 'todas' && c.vagaTitulo !== filtroVaga) return false;

      // Província
      if (filtroProvincia !== 'todas' && c.provincia !== filtroProvincia) return false;

      // Status
      if (filtroStatus !== 'todos') {
        if (filtroStatus === 'Em Análise Documental') {
          if (c.status !== 'Em Análise Documental' && c.status !== 'Em análise' && c.status !== 'Submetida') return false;
        } else if (filtroStatus === 'Admitido na Análise Documental') {
          if (c.status !== 'Admitido na Análise Documental' && c.status !== 'Admitida na Análise Documental') return false;
        } else if (filtroStatus === 'Excluído na Análise Documental') {
          if (c.status !== 'Excluído na Análise Documental' && c.status !== 'Excluída na Análise Documental') return false;
        } else if (filtroStatus === 'Entrevista Profissional') {
          if (c.status !== 'Entrevista Profissional' && c.status !== 'Convocada para provas' && c.status !== 'Convocado para provas' && c.status !== 'Admitido na Análise Documental' && c.status !== 'Admitida na Análise Documental') return false;
        } else if (filtroStatus === 'Excluído na Entrevista') {
          if (c.status !== 'Excluído na Entrevista' && c.status !== 'Excluída na Entrevista' && !(c.deliberacaoJuri?.notaFinal && parseFloat(c.deliberacaoJuri.notaFinal) < 10)) return false;
        } else if (filtroStatus === 'Admitido') {
          if (c.status !== 'Admitido' && c.status !== 'Admitida') return false;
        } else if (filtroStatus === 'Aprovado (Suplente)') {
          if (c.status !== 'Aprovado (Suplente)' && c.status !== 'Aprovada (Suplente)') return false;
        } else if (filtroStatus === 'Excluído') {
          if (!c.status?.includes('Excluíd')) return false;
        } else if (c.status !== filtroStatus) {
          return false;
        }
      }

      // Género
      if (filtroGenero !== 'todos' && c.genero !== filtroGenero) return false;

      return true;
    });
  }, [candidatos, buscaInscrito, filtroVaga, filtroProvincia, filtroStatus, filtroGenero]);

  // ========================================================
  // FILTRAGEM DO MÓDULO "AVALIAÇÃO DOS CANDIDATOS" (MODO FILTRO COM UNICIDADE ESTRITA)
  // ========================================================
  const filteredDeliberacaoCandidatos = useMemo(() => {
    const uniqueCandidatos = deduplicateCandidaturas(candidatos);
    return uniqueCandidatos.filter(c => {
      // Modo Filtro por Abas
      if (filtroDeliberacaoModo === 'admitidos') {
        const isAdmitido = c.status === 'Admitido na Análise Documental' || 
          c.status === 'Admitida na Análise Documental' || 
          c.status === 'Admitido' || 
          c.status === 'Admitida';
        if (!isAdmitido) return false;
      } else if (filtroDeliberacaoModo === 'excluidos') {
        const isExcluido = (c.status && c.status.includes('Excluíd')) ||
          (c.deliberacaoJuri?.notaFinal && parseFloat(c.deliberacaoJuri.notaFinal) < 10);
        if (!isExcluido) return false;
      } else if (filtroDeliberacaoModo === 'convocados') {
        const isConvocado = c.status === 'Admitido na Análise Documental' || 
          c.status === 'Admitida na Análise Documental' || 
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

  // ========================================================
  // ABRIR DELIBERAÇÃO PARA UM CANDIDATO ESPECÍFICO
  // ========================================================
  const iniciarDeliberacao = (candidato) => {
    setDeliberandoCandidato(candidato);
    const isFase1 = candidato.faseAtual === 1 || candidato.status === 'Em Análise Documental' || candidato.status === 'Em análise' || candidato.status === 'Submetida';
    const isFase2 = candidato.faseAtual === 2 || candidato.status === 'Admitido na Análise Documental' || candidato.status === 'Admitida na Análise Documental' || candidato.status === 'Entrevista Profissional' || candidato.status === 'Convocada para provas';

    const isFem = detectCandidateGender(candidato) === 'Feminino';
    if (isFase1) {
      setNovoEstado(isFem ? 'Admitida na Análise Documental' : 'Admitido na Análise Documental');
      setParecerJuri(`Candidatura com documentação em conformidade. ${isFem ? 'Admitida' : 'Admitido'} na Análise Documental (1ª Fase) e convocada para a Entrevista Profissional.`);
      setEventoLocal(candidato.detalhesFase?.local || `Gabinete Provincial de Entrevistas do SERNIC - ${candidato.provincia || 'Maputo'}`);
      setEventoData(candidato.detalhesFase?.dataEvento || '15 de Novembro de 2026 às 08h30');
    } else if (isFase2) {
      const currentNota = candidato.deliberacaoJuri?.notaFinal ? parseFloat(candidato.deliberacaoJuri.notaFinal) : 16.0;
      if (currentNota < 10.0) {
        setNovoEstado(isFem ? 'Excluída na Entrevista' : 'Excluído na Entrevista');
        setParecerJuri(`Classificação de ${currentNota} valores na Entrevista Profissional (< 10 valores). Candidato reprovado e obrigatoriamente excluído.`);
        setMotivoExclusao('Nota inferior a 10 valores na Entrevista Profissional');
      } else {
        setNovoEstado(isFem ? 'Admitida' : 'Admitido');
        setParecerJuri(`${isFem ? 'Candidata demonstrou' : 'Candidato demonstrou'} excelente domínio técnico na Entrevista Profissional com nota de ${currentNota} valores. Proposta para provimento efetivo da vaga.`);
      }
      setNotaFinal(String(currentNota));
    } else {
      setNovoEstado(candidato.status);
      setParecerJuri(candidato.deliberacaoJuri?.parecer || '');
    }

    if (candidato.deliberacaoJuri?.motivoExclusao) {
      setMotivoExclusao(candidato.deliberacaoJuri.motivoExclusao);
    }
    if (candidato.deliberacaoJuri?.notaFinal) {
      setNotaFinal(candidato.deliberacaoJuri.notaFinal);
    }
    if (candidato.detalhesFase?.local) {
      setEventoLocal(candidato.detalhesFase.local);
    }
    if (candidato.detalhesFase?.dataEvento) {
      setEventoData(candidato.detalhesFase.dataEvento);
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
    const isExclusao = novoEstado.includes('Excluíd') || novoEstado === 'Excluído' || novoEstado === 'Excluída';

    const motivoFinal = isExclusao
      ? (motivoExclusao === 'Outro fundamento legal com descrição detalhada' || motivoExclusao === 'Outro motivo detalhado' ? outroMotivo : motivoExclusao)
      : null;

    if (isExclusao && !motivoFinal) {
      if (onNotify) onNotify('error', 'É obrigatório indicar o fundamento ou motivo para a exclusão do candidato.');
      return;
    }

    // Regra Eliminatória da Entrevista: Se a nota for < 10 valores, é estritamente proibido admitir ou aprovar como suplente!
    const notaNum = parseFloat(notaFinal);
    if (!isNaN(notaNum) && (novoEstado === 'Admitido' || novoEstado === 'Admitida' || novoEstado === 'Aprovado (Suplente)' || novoEstado === 'Aprovada (Suplente)')) {
      if (notaNum < 10.0) {
        if (onNotify) onNotify('error', 'Regra Eliminatória SERNIC: Candidatos com nota inferior a 10 valores reprovam na entrevista e devem ser excluídos.');
        return;
      }
    }

    // Validação da 1ª Fase (Admitido na Análise Documental): Local e data da entrevista são obrigatórios
    if (novoEstado === 'Admitido na Análise Documental' || novoEstado === 'Admitida na Análise Documental' || novoEstado === 'Entrevista Profissional') {
      if (!eventoLocal.trim() || !eventoData.trim()) {
        if (onNotify) onNotify('error', 'É obrigatório comunicar o Local e a Data/Hora da Entrevista Profissional para os admitidos na 1ª Fase.');
        return;
      }
    }

    const updates = {
      status: novoEstado,
      parecer: parecerJuri || (
        (novoEstado === 'Admitido na Análise Documental' || novoEstado === 'Admitida na Análise Documental' || novoEstado === 'Entrevista Profissional')
          ? `Candidatura aprovada e admitida na Análise Documental. ${isFem ? 'Convocada' : 'Convocado'} para a 2ª Fase (Entrevista Profissional).`
          : (novoEstado === 'Admitido' || novoEstado === 'Admitida')
          ? `${isFem ? 'Aprovada' : 'Aprovado'} na entrevista com nota ${notaFinal} valores para provimento de vaga.`
          : (novoEstado === 'Aprovado (Suplente)' || novoEstado === 'Aprovada (Suplente)')
          ? `${isFem ? 'Aprovada' : 'Aprovado'} na entrevista com nota ${notaFinal} valores para a lista de reserva (suplente).`
          : (novoEstado === 'Excluído na Análise Documental' || novoEstado === 'Excluída na Análise Documental')
          ? `Exclusão na Análise Documental: ${motivoFinal}.`
          : (novoEstado === 'Excluído na Entrevista' || novoEstado === 'Excluída na Entrevista')
          ? `Reprovado na Entrevista com classificação de ${notaFinal} valores: ${motivoFinal}.`
          : 'Decisão gravada com sucesso.'
      ),
      motivoExclusao: motivoFinal,
      notaFinal: (novoEstado === 'Admitido' || novoEstado === 'Admitida' || novoEstado === 'Aprovado (Suplente)' || novoEstado === 'Aprovada (Suplente)' || novoEstado === 'Excluído na Entrevista' || novoEstado === 'Excluída na Entrevista') ? notaFinal : null,
      eventoData: (novoEstado === 'Admitido na Análise Documental' || novoEstado === 'Admitida na Análise Documental' || novoEstado === 'Entrevista Profissional') ? eventoData : null,
      eventoLocal: (novoEstado === 'Admitido na Análise Documental' || novoEstado === 'Admitida na Análise Documental' || novoEstado === 'Entrevista Profissional') ? eventoLocal : null,
      eventoTitulo: (novoEstado === 'Admitido na Análise Documental' || novoEstado === 'Admitida na Análise Documental' || novoEstado === 'Entrevista Profissional') ? tipoProva : null
    };

    const operadorNome = currentUser?.name || 'Dr. Alberto Chissano (Presidente do Júri)';
    const updated = updateStoredCandidatura(deliberandoCandidato.codigoCandidatura, updates, operadorNome);

    if (updated) {
      reloadData();
      if (onNotify) onNotify('success', `Decisão guardada com sucesso para ${deliberandoCandidato.nomeCompleto}!`);
      setDeliberandoCandidato(updated);
    }
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
  // EXPORTAR LISTA DE INSCRITOS PARA CSV
  // ========================================================
  const handleExportCSV = () => {
    const headers = ['Protocolo', 'Nome Completo', 'BI', 'NUIT', 'Carreira', 'Provincia', 'Data Submissao', 'Estado'];
    const rows = filteredCandidatos.map(c => [
      c.codigoCandidatura,
      `"${c.nomeCompleto}"`,
      c.biNumero,
      c.nuit,
      `"${c.carreira || c.vagaTitulo}"`,
      c.provincia || 'Maputo',
      c.dataSubmissao ? c.dataSubmissao.split('T')[0] : '',
      c.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SERNIC_Inscritos_Concurso_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onNotify) onNotify('success', `${filteredCandidatos.length} registos exportados com sucesso.`);
  };

  // ========================================================
  // HANDLERS DO MÓDULO DE DEFINIÇÕES
  // ========================================================
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
                  className="gestor-action-btn secondary"
                  onClick={() => navigate('/portal-recrutamento')}
                  title="Ir para a visão pública do candidato"
                >
                  <ExternalLink size={16} />
                  <span>Ver como Candidato</span>
                </button>
                <button
                  type="button"
                  className="gestor-action-btn primary"
                  onClick={() => {
                    reloadData();
                    if (onNotify) onNotify('info', 'Dados sincronizados com sucesso.');
                  }}
                  title="Actualizar dados da base de dados"
                >
                  <RefreshCw size={16} />
                  <span>Sincronizar Base</span>
                </button>
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
                onChange={(e) => setBuscaInscrito(e.target.value)}
                className="gestor-search-input"
              />
              {buscaInscrito && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setBuscaInscrito('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="gestor-filters-row">
              <div className="gestor-filter-select-group">
                <label>Carreira:</label>
                <select value={filtroVaga} onChange={(e) => setFiltroVaga(e.target.value)}>
                  <option value="todas">Todas as Carreiras</option>
                  {INITIAL_VAGAS.map(v => (
                    <option key={v.id} value={v.titulo}>{v.titulo}</option>
                  ))}
                </select>
              </div>

              <div className="gestor-filter-select-group">
                <label>Província:</label>
                <select value={filtroProvincia} onChange={(e) => setFiltroProvincia(e.target.value)}>
                  <option value="todas">Todas as Províncias</option>
                  {PROVINCIAS_MOCAMBIQUE.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="gestor-filter-select-group">
                <label>Fase / Estado:</label>
                <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                  <option value="todos">Todos os Estados</option>
                  <option value="Em Análise Documental">1ª Fase: Em Análise Documental</option>
                  <option value="Admitido na Análise Documental">1ª Fase: Admitido(a) na Análise Documental</option>
                  <option value="Excluído na Análise Documental">1ª Fase: Excluído(a) na Análise Documental</option>
                  <option value="Entrevista Profissional">2ª Fase: Convocado(a) p/ Entrevista</option>
                  <option value="Excluído na Entrevista">2ª Fase: Excluído(a) na Entrevista (&lt; 10 val)</option>
                  <option value="Admitido">3ª Fase: Admitido(a) (Vaga Efetiva)</option>
                  <option value="Aprovado (Suplente)">3ª Fase: Aprovado(a) (Suplente / Reserva)</option>
                  <option value="Excluído">Excluídos do Concurso (Todos)</option>
                </select>
              </div>

              <div className="gestor-filter-select-group">
                <label>Género:</label>
                <select value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)}>
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
                    if (window.confirm('Tem a certeza que deseja repor todos os candidatos no estado inicial de candidatura (1ª Fase: Em Análise Documental), sem qualquer intervenção ou deliberação do júri?')) {
                      const fresh = resetStoredCandidaturasParaInicio();
                      setCandidatos(fresh);
                      if (onNotify) {
                        onNotify('success', 'Todas as candidaturas foram repostas na 1ª Fase (Em Análise Documental), prontas para avaliação pelo júri!');
                      }
                    }
                  }}
                  title="Repor todos os candidatos no estado inicial da candidatura (sem deliberações do júri para fazermos de novo)"
                >
                  <RefreshCw size={15} />
                  <span>Repor em Análise (Sem Júri)</span>
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
                  onClick={() => window.print()}
                  title="Imprimir listagem de inscritos"
                >
                  <Printer size={15} />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          </div>

          {/* CONTADOR DE RESULTADOS */}
          <div className="gestor-results-meta">
            <span>A exibir <strong>{filteredCandidatos.length}</strong> de <strong>{candidatos.length}</strong> candidatos inscritos</span>
            {(filtroVaga !== 'todas' || filtroProvincia !== 'todas' || filtroStatus !== 'todos' || filtroGenero !== 'todos' || buscaInscrito) && (
              <button
                type="button"
                className="btn-reset-filters"
                onClick={() => {
                  setBuscaInscrito('');
                  setFiltroVaga('todas');
                  setFiltroProvincia('todas');
                  setFiltroStatus('todos');
                  setFiltroGenero('todos');
                }}
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
                {filteredCandidatos.map(c => {
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
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredCandidatos.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                      <AlertCircle size={36} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                      <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--portal-text-main)' }}>
                        Nenhum candidato encontrado com os filtros selecionados.
                      </p>
                      <p style={{ color: 'var(--portal-text-muted)', fontSize: '0.9rem' }}>
                        Tente ajustar a sua pesquisa ou limpe os filtros aplicados.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 3: DELIBERAÇÃO DO JÚRI ("AVALIAÇÃO DOS CANDIDATOS")
          ======================================================== */}
      {gestorTab === 'deliberacao' && (
        <div className="gestor-tab-content fadeIn">
          {/* CABEÇALHO DO MÓDULO DE AVALIAÇÃO DOS CANDIDATOS */}
          <div className="deliberacao-module-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="deliberacao-module-header-info" style={{ maxWidth: '800px' }}>
                <div className="deliberacao-header-badge">
                  <ShieldCheck size={16} />
                  <span>COMISSÃO CENTRAL DE JÚRI • SERNIC 2026</span>
                </div>
                <h2>Módulo de Avaliação e Deliberação dos Candidatos</h2>
                <p>
                  Avaliação documental, agendamento de entrevistas e deliberação formal da comissão de júri.
                </p>
              </div>

              <button
                type="button"
                className="btn-action-view"
                style={{
                  background: 'rgba(195, 32, 38, 0.08)',
                  borderColor: 'rgba(195, 32, 38, 0.3)',
                  color: '#c32026',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
                title="Repor todos os candidatos fictícios na fase inicial de candidatura (Em Análise Documental) para reiniciar o teste do júri de concurso"
                onClick={() => {
                  if (window.confirm('Deseja repor todos os candidatos fictícios na fase inicial de candidatura (1ª Fase: Em Análise Documental), sem qualquer intervenção ou deliberação do júri, para recomeçar o processo de avaliação do zero?')) {
                    const fresh = resetStoredCandidaturasParaInicio();
                    setCandidatos(fresh);
                    setDeliberandoCandidato(fresh[0] || null);
                    if (onNotify) {
                      onNotify('success', 'Todas as candidaturas foram repostas na 1ª Fase (Em Análise Documental), sem qualquer intervenção do júri!');
                    }
                  }
                }}
              >
                <RefreshCw size={15} />
                <span>Repor Candidaturas para Teste Inicial</span>
              </button>
            </div>
          </div>

          {/* MODO FILTRO: SEPARAÇÃO CLARA ENTRE PENDENTES, ADMITIDOS, EXCLUÍDOS, CONVOCADOS E SUPLENTES */}
          <div className="deliberacao-filter-toolbar">
            <div className="deliberacao-filter-tabs">
              <button
                type="button"
                className={`deliberacao-filter-pill ${filtroDeliberacaoModo === 'todos' ? 'active' : ''}`}
                onClick={() => setFiltroDeliberacaoModo('todos')}
              >
                <span>📋 Todos os Inscritos</span>
                <span className="pill-counter">{candidatos.length}</span>
              </button>

              {/* 2ª ABA: PENDENTES (EM ANÁLISE) LOGO APÓS TODOS OS INSCRITOS */}
              <button
                type="button"
                className={`deliberacao-filter-pill pendentes ${filtroDeliberacaoModo === 'pendentes' ? 'active' : ''}`}
                onClick={() => setFiltroDeliberacaoModo('pendentes')}
              >
                <span className="dot dot-pendente" />
                <span>🟡 Pendentes (Em Análise)</span>
                <span className="pill-counter">{stats.pendentesTotal}</span>
              </button>

              <button
                type="button"
                className={`deliberacao-filter-pill admitidos ${filtroDeliberacaoModo === 'admitidos' ? 'active' : ''}`}
                onClick={() => setFiltroDeliberacaoModo('admitidos')}
              >
                <span className="dot dot-admitido" />
                <span>🟢 Admitidos</span>
                <span className="pill-counter">{stats.admitidosTotal}</span>
              </button>

              <button
                type="button"
                className={`deliberacao-filter-pill excluidos ${filtroDeliberacaoModo === 'excluidos' ? 'active' : ''}`}
                onClick={() => setFiltroDeliberacaoModo('excluidos')}
              >
                <span className="dot dot-excluido" />
                <span>🔴 Excluídos</span>
                <span className="pill-counter">{stats.excluidosTotal}</span>
              </button>

              <button
                type="button"
                className={`deliberacao-filter-pill convocados ${filtroDeliberacaoModo === 'convocados' ? 'active' : ''}`}
                onClick={() => setFiltroDeliberacaoModo('convocados')}
              >
                <span className="dot dot-convocado" />
                <span>🔵 Convocados p/ Entrevista</span>
                <span className="pill-counter">{stats.convocadosTotal}</span>
              </button>

              <button
                type="button"
                className={`deliberacao-filter-pill suplentes ${filtroDeliberacaoModo === 'suplentes' ? 'active' : ''}`}
                onClick={() => setFiltroDeliberacaoModo('suplentes')}
              >
                <span className="dot dot-suplente" />
                <span>🟠 Suplentes (Reserva)</span>
                <span className="pill-counter">{stats.suplentesTotal}</span>
              </button>
            </div>
          </div>

          <div className="deliberacao-container-grid">
            {/* LADO ESQUERDO: SELEÇÃO DE CANDIDATO COM MODO FILTRO E NOTAS VISÍVEIS */}
            <div className="deliberacao-sidebar-card">
              <div className="deliberacao-sidebar-header">
                <div>
                  <h3>
                    <Users size={17} color="#c32026" />
                    <span>Candidatos para Avaliação</span>
                  </h3>
                  <span className="sidebar-count">
                    A exibir <strong>{filteredDeliberacaoCandidatos.length}</strong> de {candidatos.length}
                  </span>
                </div>
              </div>

              {/* BUSCA RÁPIDA E FILTROS NA SIDEBAR */}
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

              {/* LISTAGEM DE CANDIDATOS COM NOTAS EM DESTAQUE */}
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
                          setParecerJuri(`Documentos em conformidade. ${isFem ? 'Admitida' : 'Admitido'} na Análise Documental (1ª Fase) e ${isFem ? 'convocada' : 'convocado'} para a Entrevista Profissional.`);
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
                            setParecerJuri(`Excelente domínio técnico na Entrevista Profissional com nota de ${currentNota} valores. Proposta para provimento efetivo da vaga.`);
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img 
                            src={c.fotoUrl || getCandidatePhotoUrl(c.genero, c.nomeCompleto.length)} 
                            alt={c.nomeCompleto}
                            className="candidato-avatar-mini"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getCandidatePhotoUrl(c.genero, 0);
                            }}
                          />
                          <span className="item-name">{c.nomeCompleto}</span>
                        </div>
                        <span 
                          className="item-status-dot" 
                          style={{ backgroundColor: b.color }} 
                          title={b.label}
                        />
                      </div>

                      <div className="item-sub">
                        <span>{c.vagaTitulo} • {c.provincia || 'Maputo'}</span>
                      </div>

                      {/* NOTAS EM DESTAQUE NO CARTÃO (APENAS QUANDO ATRIBUÍDAS) */}
                      <div className="deliberacao-item-scores-wrap">
                        {hasInterviewNota ? (
                          <div className={`deliberacao-card-score ${notaNum >= 10 ? 'positive' : 'negative'}`}>
                            <Award size={11} />
                            <span>Nota Entrevista: <strong>{c.deliberacaoJuri.notaFinal} val.</strong> {notaNum >= 10 ? '✓' : '✗ (<10)'}</span>
                          </div>
                        ) : null}

                        <div className="deliberacao-card-media">
                          <span>Média Acad.: <strong>{c.habilitacoes?.mediaFinal || '14.0'} val.</strong></span>
                        </div>
                      </div>

                      <div className="item-meta">
                        <span className="item-protocolo">{c.codigoCandidatura}</span>
                        <span className="item-status-text" style={{ color: b.color, fontWeight: 700 }}>{b.label}</span>
                      </div>
                    </div>
                  );
                })}

                {filteredDeliberacaoCandidatos.length === 0 && (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--portal-text-muted)' }}>
                    <AlertCircle size={28} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>
                      Nenhum candidato encontrado no filtro "{filtroDeliberacaoModo}".
                    </p>
                    <button
                      type="button"
                      className="btn-reset-filters"
                      style={{ marginTop: '0.6rem' }}
                      onClick={() => {
                        setFiltroDeliberacaoModo('todos');
                        setBuscaDeliberacao('');
                        setFiltroDeliberacaoVaga('todas');
                        setFiltroDeliberacaoProvincia('todas');
                      }}
                    >
                      Ver Todos os Inscritos
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* LADO DIREITO: ESTAÇÃO FORMAL DE DELIBERAÇÃO COM REGRAS E NOTAS */}
            <div className="deliberacao-main-panel">
              {deliberandoCandidato ? (
                <div className="deliberacao-form-card">
                  {/* CABEÇALHO DO CANDIDATO SELECIONADO */}
                  <div className="deliberacao-candidate-header">
                    <div className="candidate-summary-left">
                      <div className="candidate-photo-header-wrap">
                        <img 
                          src={deliberandoCandidato.fotoUrl || getCandidatePhotoUrl(deliberandoCandidato.genero, deliberandoCandidato.nomeCompleto.length)} 
                          alt={deliberandoCandidato.nomeCompleto}
                          className="candidate-header-photo-round"
                        />
                      </div>
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
                                {b.icon}
                                <span>{b.label}</span>
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

                    <button
                      type="button"
                      className="btn-view-dossier-small"
                      onClick={() => setSelectedDossier(deliberandoCandidato)}
                    >
                      <Eye size={15} />
                      <span>Abrir Dossier Completo</span>
                    </button>
                  </div>

                  {/* PAINEL DE NOTAS E APROVEITAMENTO ACADÉMICO */}
                  <div className="deliberacao-kpi-summary-grid">
                    <div className="deliberacao-kpi-box">
                      <span className="kpi-title">Média Académica de Ingresso</span>
                      <strong className="kpi-score green">
                        {deliberandoCandidato.habilitacoes?.mediaFinal || '14.0'} <span className="kpi-unit">/ 20.0 val.</span>
                      </strong>
                      <span className="kpi-desc">{deliberandoCandidato.habilitacoes?.curso || 'Habilitações Homologadas'}</span>
                    </div>

                    <div className={`deliberacao-kpi-box ${deliberandoCandidato.deliberacaoJuri?.notaFinal ? (parseFloat(deliberandoCandidato.deliberacaoJuri.notaFinal) >= 10 ? 'positive-border' : 'negative-border') : ''}`}>
                      <span className="kpi-title">Nota da Entrevista (2ª Fase)</span>
                      {deliberandoCandidato.deliberacaoJuri?.notaFinal ? (
                        <strong className={`kpi-score ${parseFloat(deliberandoCandidato.deliberacaoJuri.notaFinal) >= 10 ? 'green' : 'red'}`}>
                          {deliberandoCandidato.deliberacaoJuri.notaFinal} <span className="kpi-unit">/ 20.0 val.</span>
                        </strong>
                      ) : (
                        <strong className="kpi-score gray">Pendente</strong>
                      )}
                      <span className="kpi-desc">
                        {deliberandoCandidato.deliberacaoJuri?.notaFinal 
                          ? (parseFloat(deliberandoCandidato.deliberacaoJuri.notaFinal) >= 10 ? 'Aprovado (≥ 10 valores)' : 'Reprovado / Excluído (< 10 valores)')
                          : 'Aguardando lançamento oficial'}
                      </span>
                    </div>

                    <div className="deliberacao-kpi-box">
                      <span className="kpi-title">Convocatória de Entrevista</span>
                      <strong className="kpi-location">
                        {deliberandoCandidato.faseAtual >= 2 || deliberandoCandidato.status?.includes('Admitid') ? '📍 Agendada' : '⏳ Fase Documental'}
                      </strong>
                      <span className="kpi-desc">
                        {deliberandoCandidato.faseAtual >= 2 || deliberandoCandidato.status?.includes('Admitid')
                          ? (deliberandoCandidato.detalhesFase?.dataEvento || eventoData || 'Conforme Convocatória')
                          : 'Definida na deliberação da 1ª Fase'}
                      </span>
                    </div>
                  </div>

                  {/* FORMULÁRIO DE DELIBERAÇÃO FORMAL */}
                  <form onSubmit={handleGravarDeliberacao} className="deliberacao-form-body">
                    {(() => {
                      const candFase = deliberandoCandidato.faseAtual || (
                        (deliberandoCandidato.status === 'Em Análise Documental' || deliberandoCandidato.status === 'Em análise' || deliberandoCandidato.status === 'Submetida') ? 1 :
                        (deliberandoCandidato.status === 'Admitido na Análise Documental' || deliberandoCandidato.status === 'Admitida na Análise Documental' || deliberandoCandidato.status === 'Entrevista Profissional' || deliberandoCandidato.status === 'Convocada para provas') ? 2 : 3
                      );

                      const isDelibFem = detectCandidateGender(deliberandoCandidato) === 'Feminino';
                      const notaAtualNum = parseFloat(notaFinal);
                      const isReprovadoNota = !isNaN(notaAtualNum) && notaAtualNum < 10.0;

                      return (
                        <>
                          {/* INDICADOR DISCRETO DA FASE DO CONCURSO */}
                          <div className={`deliberacao-phase-badge-compact fase${candFase}`}>
                            <ShieldCheck size={16} />
                            <span>
                              {candFase === 1 && '1ª Fase: Análise Documental (Triagem e Validação Estatutária)'}
                              {candFase === 2 && '2ª Fase: Entrevista Profissional (Nota Mínima Regulamentar: 10.0 valores)'}
                              {candFase === 3 && `3ª Fase: Resultado Final Homologado (${deliberandoCandidato.status})`}
                            </span>
                          </div>

                          <div className="deliberacao-choice-title">
                            <FileSignature size={18} color="#c32026" />
                            <span>
                              {candFase === 1 && 'Decisão da 1ª Fase (Análise Documental):'}
                              {candFase >= 2 && 'Registo da Nota e Decisão da Entrevista Profissional:'}
                            </span>
                          </div>

                          {/* OPÇÕES DA 1ª FASE: EXATAMENTE 2 OPÇÕES */}
                          {candFase === 1 && (
                            <div className="deliberacao-options-grid">
                              {/* OPÇÃO 1A: ADMITIR NA ANÁLISE DOCUMENTAL */}
                              <label 
                                className={`deliberacao-radio-card option-admitido ${(novoEstado === 'Admitido na Análise Documental' || novoEstado === 'Admitida na Análise Documental' || novoEstado === 'Entrevista Profissional') ? 'checked' : ''}`}
                                onClick={() => {
                                  setNovoEstado(isDelibFem ? 'Admitida na Análise Documental' : 'Admitido na Análise Documental');
                                  if (!parecerJuri || parecerJuri.includes('exclu')) {
                                    setParecerJuri(`Documentação em conformidade. ${isDelibFem ? 'Admitida' : 'Admitido'} na Análise Documental (1ª Fase) e ${isDelibFem ? 'convocada' : 'convocado'} para a Entrevista Profissional.`);
                                  }
                                }}
                              >
                                <input
                                  type="radio"
                                  name="estadoDeliberacao"
                                  value="Admitido na Análise Documental"
                                  checked={novoEstado === 'Admitido na Análise Documental' || novoEstado === 'Admitida na Análise Documental' || novoEstado === 'Entrevista Profissional'}
                                  onChange={() => {}}
                                />
                                <div className="radio-content">
                                  <div className="radio-header">
                                    <CheckCircle2 size={18} className="radio-icon" />
                                    <strong>ADMITIR NA ANÁLISE DOCUMENTAL</strong>
                                  </div>
                                  <p>Documentos completos e em conformidade. O candidato avança para a Entrevista Profissional.</p>
                                </div>
                              </label>

                              {/* OPÇÃO 1B: EXCLUIR NA ANÁLISE DOCUMENTAL */}
                              <label 
                                className={`deliberacao-radio-card option-excluido ${(novoEstado === 'Excluído na Análise Documental' || novoEstado === 'Excluída na Análise Documental' || novoEstado === 'Excluído' || novoEstado === 'Excluída') ? 'checked' : ''}`}
                                onClick={() => {
                                  setNovoEstado(isDelibFem ? 'Excluída na Análise Documental' : 'Excluído na Análise Documental');
                                  if (!parecerJuri || parecerJuri.includes('Admitid')) {
                                    setParecerJuri(`Candidatura ${isDelibFem ? 'excluída' : 'excluído'} na 1ª Fase por documentação incompleta ou inconformidade regulamentar.`);
                                  }
                                }}
                              >
                                <input
                                  type="radio"
                                  name="estadoDeliberacao"
                                  value="Excluído na Análise Documental"
                                  checked={novoEstado === 'Excluído na Análise Documental' || novoEstado === 'Excluída na Análise Documental' || novoEstado === 'Excluído' || novoEstado === 'Excluída'}
                                  onChange={() => {}}
                                />
                                <div className="radio-content">
                                  <div className="radio-header">
                                    <XCircle size={18} className="radio-icon" />
                                    <strong>EXCLUIR NA ANÁLISE DOCUMENTAL</strong>
                                  </div>
                                  <p>Documentos incompletos ou inconformidades com os requisitos estatutários do Edital.</p>
                                </div>
                              </label>
                            </div>
                          )}

                          {/* CAMPOS ESPECÍFICOS DA 1ª FASE: CONVOCATÓRIA DE LOCAL E DATA DA ENTREVISTA */}
                          {(novoEstado === 'Admitido na Análise Documental' || novoEstado === 'Admitida na Análise Documental' || novoEstado === 'Entrevista Profissional') && (
                            <div className="deliberacao-extra-box info-box">
                              <div className="extra-box-title" style={{ color: '#1d4ed8' }}>
                                <Calendar size={17} />
                                <span>Agendamento da Entrevista Profissional (2ª Fase)</span>
                              </div>
                              <div className="extra-box-grid-two">
                                <div className="form-field">
                                  <label>Data e Hora da Entrevista *:</label>
                                  <input
                                    type="text"
                                    value={eventoData}
                                    onChange={(e) => setEventoData(e.target.value)}
                                    placeholder="Ex: 15 de Novembro de 2026 às 08h30"
                                    required
                                  />
                                </div>

                                <div className="form-field">
                                  <label>Local Oficial da Entrevista *:</label>
                                  <input
                                    type="text"
                                    value={eventoLocal}
                                    onChange={(e) => setEventoLocal(e.target.value)}
                                    placeholder="Ex: Gabinete Provincial de Entrevistas do SERNIC - Maputo"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* OPÇÕES DA 2ª E 3ª FASE: ENTRADA DE NOTA E REGRA ESTRITA (< 10 EXCLUI, >= 10 APROVA/ADMITE) */}
                          {candFase >= 2 && (
                            <>
                              {/* CAMPO OBRIGATÓRIO DE NOTA DA ENTREVISTA */}
                              <div className="deliberacao-score-input-card">
                                <div className="score-input-header">
                                  <Award size={20} color="#c32026" />
                                  <div>
                                    <label style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--portal-text-main)' }}>
                                      Nota Obtida na Entrevista Profissional (Escala de 0.0 a 20.0 valores) *:
                                    </label>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--portal-text-muted)', margin: '0.15rem 0 0 0' }}>
                                      Regra Estatutária: <strong>Nota &lt; 10.0 valores = Reprovação e Exclusão Obrigatória</strong> • <strong>Nota ≥ 10.0 valores = Aprovado / Admitido por Vagas</strong>
                                    </p>
                                  </div>
                                </div>

                                <div className="score-input-flex">
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
                                          setNovoEstado(isDelibFem ? 'Excluída na Entrevista' : 'Excluído na Entrevista');
                                          setMotivoExclusao('Nota inferior a 10 valores na Entrevista Profissional');
                                          setParecerJuri(`Classificação na Entrevista Profissional de ${val} valores. Candidatura reprovada por nota inferior a 10.0 valores. Exclusão obrigatória.`);
                                        } else {
                                          if (novoEstado.includes('Excluíd')) {
                                            setNovoEstado(isDelibFem ? 'Admitida' : 'Admitido');
                                            setParecerJuri(`Excelente aproveitamento na Entrevista Profissional com nota de ${val} valores. Proposta para provimento efetivo da vaga.`);
                                          }
                                        }
                                      }
                                    }}
                                    className={`input-nota-grande ${isReprovadoNota ? 'reprovado' : 'aprovado'}`}
                                  />
                                  <div className="score-status-indicator">
                                    {isReprovadoNota ? (
                                      <span className="score-tag-reprovado">
                                        <XCircle size={16} /> Nota Negativa (&lt; 10 val) • Reprovado
                                      </span>
                                    ) : (
                                      <span className="score-tag-aprovado">
                                        <CheckCircle2 size={16} /> Nota Positiva (≥ 10 val) • Aprovado
                                      </span>
                                    )}
                                    <span style={{ fontSize: '0.78rem', color: 'var(--portal-text-muted)' }}>
                                      Média Académica de Ingresso: <strong>{deliberandoCandidato.habilitacoes?.mediaFinal || '14.0'} val.</strong>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* ALERTA ESTATUTÁRIO DINÂMICO CONFORME A NOTA */}
                              {isReprovadoNota ? (
                                <div className="deliberacao-statutory-alert danger">
                                  <AlertCircle size={18} className="alert-icon" />
                                  <div>
                                    <strong>REPROVADO COM NOTA INFERIOR A 10 VALORES ({notaFinal} VAL.)</strong>
                                    <p>Pelo regulamento oficial, candidatos com classificação inferior a 10 valores são obrigatoriamente excluídos.</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="deliberacao-statutory-alert success">
                                  <CheckCircle2 size={18} className="alert-icon" />
                                  <div>
                                    <strong>CANDIDATO APROVADO COM NOTA POSITIVA ({notaFinal} VAL.)</strong>
                                    <p>Pontuação regulamentar atingida. Selecione Admissão Efetiva (conforme as vagas) ou Suplente.</p>
                                  </div>
                                </div>
                              )}

                              {/* CARTÕES DE DECISÃO DA ENTREVISTA */}
                              <div className="deliberacao-options-grid three-cards">
                                {/* OPÇÃO 2A: ADMITIR (VAGA EFETIVA) - BLOQUEADO SE NOTA < 10 */}
                                <label 
                                  className={`deliberacao-radio-card option-admitido ${(novoEstado === 'Admitido' || novoEstado === 'Admitida') ? 'checked' : ''} ${isReprovadoNota ? 'disabled-locked' : ''}`}
                                  onClick={() => {
                                    if (isReprovadoNota) {
                                      if (onNotify) onNotify('error', 'Candidatos com nota abaixo de 10 valores não podem ser admitidos!');
                                      return;
                                    }
                                    setNovoEstado(isDelibFem ? 'Admitida' : 'Admitido');
                                    setParecerJuri(`${isDelibFem ? 'Candidata' : 'Candidato'} com excelente nota de ${notaFinal} valores na Entrevista Profissional. Proposta para provimento efetivo da vaga.`);
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="estadoDeliberacao"
                                    value="Admitido"
                                    checked={novoEstado === 'Admitido' || novoEstado === 'Admitida'}
                                    disabled={isReprovadoNota}
                                    onChange={() => {}}
                                  />
                                  <div className="radio-content">
                                    <div className="radio-header">
                                      <CheckCircle2 size={20} className="radio-icon" />
                                      <strong>{isDelibFem ? 'ADMITIDA (VAGA EFETIVA)' : 'ADMITIDO (VAGA EFETIVA)'}</strong>
                                    </div>
                                    <p>
                                      {isReprovadoNota 
                                        ? 'Bloqueado: Requer nota mínima de 10.0 valores.' 
                                        : 'Aprovado com nota positiva para preencher a vaga pela sequência de vagas do Edital.'}
                                    </p>
                                  </div>
                                </label>

                                {/* OPÇÃO 2B: APROVADO SUPLENTE - BLOQUEADO SE NOTA < 10 */}
                                <label 
                                  className={`deliberacao-radio-card option-suplente ${(novoEstado === 'Aprovado (Suplente)' || novoEstado === 'Aprovada (Suplente)') ? 'checked' : ''} ${isReprovadoNota ? 'disabled-locked' : ''}`}
                                  onClick={() => {
                                    if (isReprovadoNota) {
                                      if (onNotify) onNotify('error', 'Candidatos com nota abaixo de 10 valores não podem ser aprovados como suplentes!');
                                      return;
                                    }
                                    setNovoEstado(isDelibFem ? 'Aprovada (Suplente)' : 'Aprovado (Suplente)');
                                    setParecerJuri(`${isDelibFem ? 'Candidata aprovada' : 'Candidato aprovado'} com nota de ${notaFinal} valores. Integrado na lista de reserva / suplente.`);
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="estadoDeliberacao"
                                    value="Aprovado (Suplente)"
                                    checked={novoEstado === 'Aprovado (Suplente)' || novoEstado === 'Aprovada (Suplente)'}
                                    disabled={isReprovadoNota}
                                    onChange={() => {}}
                                  />
                                  <div className="radio-content">
                                    <div className="radio-header">
                                      <Award size={20} className="radio-icon" />
                                      <strong>APROVADO COMO SUPLENTE</strong>
                                    </div>
                                    <p>
                                      {isReprovadoNota 
                                        ? 'Bloqueado: Requer nota mínima de 10.0 valores.' 
                                        : 'Aprovado na entrevista. Fica na lista de reserva após preenchimento das vagas imediatas.'}
                                    </p>
                                  </div>
                                </label>

                                {/* OPÇÃO 2C: EXCLUÍDO DA ENTREVISTA */}
                                <label 
                                  className={`deliberacao-radio-card option-excluido ${(novoEstado === 'Excluído na Entrevista' || novoEstado === 'Excluída na Entrevista' || novoEstado === 'Excluído' || novoEstado === 'Excluída') ? 'checked' : ''}`}
                                  onClick={() => {
                                    setNovoEstado(isDelibFem ? 'Excluída na Entrevista' : 'Excluído na Entrevista');
                                    setMotivoExclusao(isReprovadoNota ? 'Nota inferior a 10 valores na Entrevista Profissional' : 'Perfil não adequado para as funções exigidas');
                                    setParecerJuri(`Candidatura reprovada e excluída na 2ª Fase de Entrevista Profissional (${notaFinal} valores).`);
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="estadoDeliberacao"
                                    value="Excluído na Entrevista"
                                    checked={novoEstado === 'Excluído na Entrevista' || novoEstado === 'Excluída na Entrevista' || novoEstado === 'Excluído' || novoEstado === 'Excluída'}
                                    onChange={() => {}}
                                  />
                                  <div className="radio-content">
                                    <div className="radio-header">
                                      <XCircle size={20} className="radio-icon" />
                                      <strong>EXCLUIR NA ENTREVISTA</strong>
                                    </div>
                                    <p>Reprovado com nota &lt; 10 valores, falta de comparência ou inaptidão física/técnica no teste.</p>
                                  </div>
                                </label>
                              </div>
                            </>
                          )}

                          {/* CAMPOS ESPECÍFICOS: MOTIVO DA EXCLUSÃO */}
                          {(novoEstado.includes('Excluíd') || novoEstado === 'Excluído' || novoEstado === 'Excluída') && (
                            <div className="deliberacao-extra-box danger-box">
                              <div className="extra-box-title" style={{ color: '#c32026' }}>
                                <XCircle size={18} />
                                <span>Fundamento e Motivo Legal da Exclusão do Candidato</span>
                              </div>
                              <div className="extra-box-grid">
                                <div className="form-field full-width">
                                  <label>Motivo Oficial da Exclusão *:</label>
                                  <select 
                                    value={motivoExclusao} 
                                    onChange={(e) => setMotivoExclusao(e.target.value)}
                                    className="select-danger"
                                  >
                                    <optgroup label="1ª Fase - Análise de Documentos (Inconformidades)">
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
                                    <optgroup label="2ª Fase - Entrevista Profissional (Nota Eliminatória)">
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
                                  <div className="form-field full-width">
                                    <label>Descreva detalhadamente o fundamento da exclusão:</label>
                                    <input
                                      type="text"
                                      placeholder="Indique claramente os motivos factuais e legais..."
                                      value={outroMotivo}
                                      onChange={(e) => setOutroMotivo(e.target.value)}
                                      required
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* OBSERVAÇÕES E PARECER DO JÚRI */}
                    <div className="form-field full-width" style={{ marginTop: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.84rem' }}>
                        <FileCheck size={15} color="#c32026" />
                        Observações / Parecer Formal da Comissão de Júri:
                      </label>
                      <textarea
                        rows={2}
                        value={parecerJuri}
                        onChange={(e) => setParecerJuri(e.target.value)}
                        placeholder="Fundamentação sucinta da deliberação da comissão de júri..."
                        className="gestor-textarea"
                      />
                    </div>

                    {/* BOTÃO DE CONFIRMAÇÃO OFICIAL */}
                    <div className="deliberacao-submit-row">
                      <div className="deliberacao-auditor-info">
                        <ShieldCheck size={16} color="#15803d" />
                        <span>Decisão a homologar por: <strong>{currentUser?.name || 'Dr. Alberto Chissano (Presidente do Júri)'}</strong></span>
                      </div>

                      <button
                        type="submit"
                        className="btn-salvar-deliberacao-red"
                      >
                        <FileSignature size={18} />
                        <span>Homologar e Guardar Decisão</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="deliberacao-empty-state">
                  <FileSignature size={48} color="#94a3b8" />
                  <h3>Selecione um Candidato para Avaliação</h3>
                  <p>Utilize a lista ou os filtros à esquerda para abrir a estação de análise documental ou registar a nota da entrevista profissional.</p>
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
          <div className="vagas-gestor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3>Quotas e Editais Oficiais Autorizados</h3>
              <p>Quadro de vagas fixado pelo Ministério da Economia e Finanças para o Concurso SERNIC 2026.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <div className="total-vagas-badge">
                Total Autorizado: <strong>{vagas.reduce((acc, v) => acc + (Number(v.vagas) || 0), 0)} Vagas</strong>
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
            </div>
          </div>

          <div className="vagas-gestor-grid">
            {vagas.map(vaga => {
              const countInscritos = candidatos.filter(c => c.vagaTitulo === vaga.titulo).length;
              const ratio = vaga.vagas > 0 ? (countInscritos / vaga.vagas).toFixed(1) : '0';

              return (
                <div key={vaga.id} className="vaga-gestor-card">
                  <div className="vaga-gestor-top">
                    <span className="vaga-edital-cod">{vaga.codigoEdital}</span>
                    <span 
                      className={`vaga-status-chip ${vaga.status === 'Aberto' ? 'aberto' : 'fechado'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleVagaStatusGestor(vaga.id)}
                      title="Clique para alternar estado Aberto / Encerrado"
                    >
                      {vaga.status} (Alternar)
                    </span>
                  </div>

                  <h4>{vaga.titulo}</h4>
                  <p className="vaga-carreira-desc">{vaga.carreira}</p>

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
                      <Calendar size={14} color="#64748b" />
                      <span>Prazo: {vaga.dataLimite}</span>
                    </div>
                  </div>

                  <div className="vaga-gestor-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="sub-aba-btn-action"
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => handleOpenEditConcursoGestor(vaga)}
                      >
                        <Edit3 size={13} color="#c32026" />
                        <span>Editar Concurso</span>
                      </button>
                      <button
                        type="button"
                        className="sub-aba-btn-action danger"
                        onClick={() => handleDeleteVagaGestor(vaga.id)}
                        title="Excluir este concurso"
                      >
                        <Trash2 size={13} />
                        <span>Excluir</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn-ver-edital-action"
                      onClick={() => navigate('/portal-recrutamento/recrutamento')}
                    >
                      <span>Ver Aviso de Abertura Completo</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
            <button
              type="button"
              className="gestor-btn-outline"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              <span>Imprimir Livro de Atas</span>
            </button>
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
                {auditoria.map(item => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 7: MÓDULO DE DEFINIÇÕES DO CONCURSO (SOLICITADO)
          ======================================================== */}
      {gestorTab === 'definicoes' && (
        <div className="gestor-tab-content fadeIn definicoes-tab-container">
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
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
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

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedDossier(null)}
              >
                ✕
              </button>
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
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.55rem', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}>
                        Resultado Final: {selectedDossier.status}
                      </span>
                      <button
                        type="button"
                        className="sub-aba-btn-action"
                        style={{ color: '#475569', borderColor: '#cbd5e1' }}
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
                  onClick={() => handleInlineDeleteCandidato(selectedDossier.codigoCandidatura)}
                  title="Eliminar este registo de candidatura definitivamente"
                >
                  <Trash2 size={13} />
                  <span>Eliminar Registo</span>
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
            </div>

            {/* RODAPÉ DO DOSSIER */}
            <div className="dossier-modal-footer">
              <button
                type="button"
                className="gestor-btn-outline"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Imprimir Ficha Completa</span>
              </button>

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
        <div className="gestor-modal-overlay fadeIn" style={{ zIndex: 1200 }} onClick={() => setPreviewDoc(null)}>
          <DraggableSubAba className="gestor-modal-card doc-preview-modal" moveHandleLabel="Mover Visualização">
            <div className="dossier-modal-header">
              <div>
                <h3>Visualização de Documento Anexado</h3>
                <p>{previewDoc.doc.tipo} • Candidato: {previewDoc.candidato.nomeCompleto}</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPreviewDoc(null)}
              >
                ✕
              </button>
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
        <div className="gestor-modal-overlay fadeIn" onClick={() => setIsNovoEditalModalOpen(false)}>
          <DraggableSubAba className="gestor-modal-card novo-edital-modal" moveHandleLabel="Mover Novo Edital">
            <div className="dossier-modal-header">
              <div>
                <h3>Publicação Oficial de Pauta / Edital</h3>
                <p>O edital ficará imediatamente disponível para consulta pública e download pelos candidatos.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsNovoEditalModalOpen(false)}
              >
                ✕
              </button>
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
        <div className="gestor-modal-overlay fadeIn" onClick={() => setSelectedPautaPrint(null)}>
          <DraggableSubAba className="gestor-modal-card pauta-timbrada-modal" moveHandleLabel="Mover Pauta Oficial">
            <div className="dossier-modal-header">
              <div>
                <h3>Edital Oficial do Concurso Público</h3>
                <p>Documento Timbrado • Direcção Geral do SERNIC</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedPautaPrint(null)}
              >
                ✕
              </button>
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
        <div className="gestor-modal-overlay fadeIn" onClick={() => setIsCursoModalOpen(false)}>
          <DraggableSubAba className="gestor-modal-card definicoes-modal" moveHandleLabel="Mover Especialidade">
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
              <button
                type="button"
                className="dossier-close-btn"
                onClick={() => setIsCursoModalOpen(false)}
              >
                ✕
              </button>
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
        <div className="gestor-modal-overlay fadeIn" onClick={() => setIsLocalModalOpen(false)}>
          <DraggableSubAba className="gestor-modal-card definicoes-modal" moveHandleLabel="Mover Local de Prova">
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
              <button
                type="button"
                className="dossier-close-btn"
                onClick={() => setIsLocalModalOpen(false)}
              >
                ✕
              </button>
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
        <div className="gestor-modal-overlay fadeIn" onClick={() => setIsPaletaModalOpen(false)}>
          <DraggableSubAba className="gestor-modal-card definicoes-modal" moveHandleLabel="Mover Paleta de Cores">
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
              <button
                type="button"
                className="dossier-close-btn"
                onClick={() => setIsPaletaModalOpen(false)}
              >
                ✕
              </button>
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
              <button
                type="button"
                className="dossier-close-btn"
                onClick={() => setGestorVagaModal(null)}
              >
                ✕
              </button>
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
    </div>
  );
}
