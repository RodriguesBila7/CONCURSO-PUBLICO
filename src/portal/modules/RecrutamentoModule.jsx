import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Users, 
  FileText, 
  Download, 
  X, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Award, 
  Printer,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  Copy,
  Save,
  AlertTriangle,
  Check,
  RefreshCw,
  Plus,
  FileCheck,
  Lock
} from 'lucide-react';
import { 
  INITIAL_VAGAS, 
  getStoredVagas, 
  saveStoredVagas, 
  createStoredVaga, 
  updateStoredVaga, 
  deleteStoredVaga,
  isPrazoSubmissaoExpirado,
  formatarDataLimiteExtenso,
  getStatusEfetivoVaga
} from '../mockData';
import sernicLogo from '../../assets/sernic-logo.png';
import DraggableSubAba from '../components/DraggableSubAba';

export default function RecrutamentoModule({ navigate, onSelectVagaParaCandidatura, currentUser }) {
  // Determinar se o utilizador autenticado possui perfil de Gestor / Júri
  const isGestor = Boolean(
    currentUser && (
      currentUser.role === 'admin' || 
      currentUser.role === 'gestor' || 
      currentUser.isGestor === true
    )
  );

  // Lista de vagas sincronizada
  const [vagas, setVagas] = useState(() => getStoredVagas());
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos' | 'aberto' | 'encerrado'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sub-Aba Modal State: null | VagaObject
  const [selectedVagaModal, setSelectedVagaModal] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit' | 'create'
  
  // Confirmação de Exclusão dentro da sub-aba
  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false);
  
  // Formulário CRUD da Vaga / Concurso
  const [vagaForm, setVagaForm] = useState({
    id: '',
    codigoEdital: '',
    titulo: '',
    carreira: 'Investigação Criminal e Instrução Processual',
    regime: 'Carreira de Regime Especial - SERNIC',
    vagas: 20,
    local: 'Nacional',
    dataAbertura: new Date().toISOString().split('T')[0],
    dataLimite: '2026-12-31',
    status: 'Aberto',
    remuneracao: 'Tabela Salarial Única (TSU) + Subsídio de Risco e Investigação',
    requisitosGerais: [],
    requisitosEspecificos: [],
    fasesConcurso: []
  });

  // Campos temporários para adicionar novos requisitos
  const [novoReqGeral, setNovoReqGeral] = useState('');
  const [novoReqEsp, setNovoReqEsp] = useState('');

  // Modal de Visualização de Edital Timbrado
  const [viewEditalModal, setViewEditalModal] = useState(null);

  // Toast de feedback
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Carregar vagas persistidas ou API
  const reloadVagas = () => {
    const list = getStoredVagas();
    setVagas(list);
  };

  useEffect(() => {
    async function fetchVagas() {
      try {
        const res = await fetch('/api/vagas');
        const data = await res.json();
        if (data.success && data.vagas && data.vagas.length > 0) {
          setVagas(data.vagas);
          saveStoredVagas(data.vagas);
          return;
        }
      } catch {
        // Usa getStoredVagas()
      }
      setVagas(getStoredVagas());
    }
    fetchVagas();

    // Ouvinte para sincronização entre abas
    const handleSync = () => setVagas(getStoredVagas());
    window.addEventListener('sernic-vagas-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sernic-vagas-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Abrir sub-aba em Modo de Leitura
  const handleOpenVagaView = (vaga) => {
    setSelectedVagaModal(vaga);
    setModalMode('view');
    setIsDeletingConfirm(false);
    setVagaForm({
      ...vaga,
      requisitosGerais: Array.isArray(vaga.requisitosGerais) ? [...vaga.requisitosGerais] : [],
      requisitosEspecificos: Array.isArray(vaga.requisitosEspecificos) ? [...vaga.requisitosEspecificos] : [],
      fasesConcurso: Array.isArray(vaga.fasesConcurso) ? [...vaga.fasesConcurso] : []
    });
  };

  // Abrir sub-aba em Modo de Edição
  const handleOpenVagaEdit = (vaga) => {
    setSelectedVagaModal(vaga);
    setModalMode('edit');
    setIsDeletingConfirm(false);
    setVagaForm({
      ...vaga,
      requisitosGerais: Array.isArray(vaga.requisitosGerais) ? [...vaga.requisitosGerais] : [],
      requisitosEspecificos: Array.isArray(vaga.requisitosEspecificos) ? [...vaga.requisitosEspecificos] : [],
      fasesConcurso: Array.isArray(vaga.fasesConcurso) ? [...vaga.fasesConcurso] : []
    });
  };

  // Abrir sub-aba para Criar Nova Vaga
  const handleOpenNovaVaga = () => {
    const year = new Date().getFullYear();
    const nextNum = vagas.length + 1;
    const initialNew = {
      id: `VAG-${year}-${String(nextNum).padStart(2, '0')}`,
      codigoEdital: `Aviso n.º 0${nextNum}/SERNIC-DG/DRH/${year}`,
      titulo: '',
      carreira: 'Investigação Criminal e Instrução Processual',
      regime: 'Carreira de Regime Especial - SERNIC',
      vagas: 25,
      local: 'Nacional (Delegações Provinciais do SERNIC)',
      dataAbertura: new Date().toISOString().split('T')[0],
      dataLimite: '2026-12-31',
      status: 'Aberto',
      remuneracao: 'Tabela Salarial Única (TSU) + Subsídio de Risco e Investigação',
      requisitosGerais: [
        'Nacionalidade Moçambicana originária;',
        'Idade compreendida entre os 21 e os 35 anos;',
        'Situação militar regularizada e sem registo criminal.'
      ],
      requisitosEspecificos: [
        'Licenciatura na área correspondente ao cargo;',
        'Aptidão física e robustez mental atestada por junta médica.'
      ],
      fasesConcurso: [
        { fase: 1, nome: 'Triagem Documental e Homologação' },
        { fase: 2, nome: 'Prova Escrita de Conhecimentos' },
        { fase: 3, nome: 'Testes Psicotécnicos e Médicos' },
        { fase: 4, nome: 'Curso de Formação Básica na ACIPOL' }
      ]
    };
    setSelectedVagaModal(initialNew);
    setVagaForm(initialNew);
    setModalMode('create');
    setIsDeletingConfirm(false);
  };

  // Alternar Estado Aberto / Encerrado com 1 clique (CRUD Rápido)
  const handleQuickToggleStatus = (id) => {
    const target = vagas.find(v => v.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Aberto' ? 'Encerrado' : 'Aberto';
    const updated = updateStoredVaga(id, { status: nextStatus });
    if (updated) {
      reloadVagas();
      if (selectedVagaModal && selectedVagaModal.id === id) {
        setSelectedVagaModal(updated);
        setVagaForm(prev => ({ ...prev, status: nextStatus }));
      }
      showToast('success', `Estado do concurso alterado para "${nextStatus}".`);
    }
  };

  // Duplicar Vaga (Clonar como novo modelo)
  const handleDuplicateVaga = (vaga) => {
    const year = new Date().getFullYear();
    const nextNum = vagas.length + 1;
    const duplicated = {
      ...vaga,
      id: `VAG-${year}-${String(nextNum).padStart(2, '0')}`,
      codigoEdital: `Aviso n.º 0${nextNum}/SERNIC-DG/DRH/${year} (Cópia)`,
      titulo: `${vaga.titulo} (Novo Lote)`,
      status: 'Aberto',
      dataAbertura: new Date().toISOString().split('T')[0]
    };
    setSelectedVagaModal(duplicated);
    setVagaForm(duplicated);
    setModalMode('create');
    showToast('info', 'Modelo duplicado. Faça os ajustes e clique em "Publicar Novo Concurso".');
  };

  // Adicionar Requisito Geral
  const handleAddReqGeral = () => {
    if (!novoReqGeral.trim()) return;
    setVagaForm(prev => ({
      ...prev,
      requisitosGerais: [...prev.requisitosGerais, novoReqGeral.trim()]
    }));
    setNovoReqGeral('');
  };

  // Remover Requisito Geral
  const handleRemoveReqGeral = (idx) => {
    setVagaForm(prev => ({
      ...prev,
      requisitosGerais: prev.requisitosGerais.filter((_, i) => i !== idx)
    }));
  };

  // Adicionar Requisito Específico
  const handleAddReqEsp = () => {
    if (!novoReqEsp.trim()) return;
    setVagaForm(prev => ({
      ...prev,
      requisitosEspecificos: [...prev.requisitosEspecificos, novoReqEsp.trim()]
    }));
    setNovoReqEsp('');
  };

  // Remover Requisito Específico
  const handleRemoveReqEsp = (idx) => {
    setVagaForm(prev => ({
      ...prev,
      requisitosEspecificos: prev.requisitosEspecificos.filter((_, i) => i !== idx)
    }));
  };

  // Submeter Criação ou Atualização da Vaga (CRUD: Create / Update)
  const handleSaveVagaForm = (e) => {
    if (e) e.preventDefault();
    if (!vagaForm.titulo.trim()) {
      showToast('error', 'Por favor indique a designação oficial da carreira / vaga.');
      return;
    }

    if (modalMode === 'create') {
      const created = createStoredVaga(vagaForm);
      reloadVagas();
      setSelectedVagaModal(created);
      setModalMode('view');
      showToast('success', `Concurso "${created.titulo}" criado e publicado com sucesso!`);
    } else {
      const updated = updateStoredVaga(vagaForm.id, vagaForm);
      reloadVagas();
      setSelectedVagaModal(updated);
      setModalMode('view');
      showToast('success', `Concurso "${updated.titulo}" atualizado com sucesso!`);
    }
  };

  // Excluir Vaga (CRUD: Delete)
  const handleConfirmDelete = () => {
    if (!selectedVagaModal) return;
    const ok = deleteStoredVaga(selectedVagaModal.id);
    if (ok) {
      reloadVagas();
      setSelectedVagaModal(null);
      setIsDeletingConfirm(false);
      showToast('info', `Concurso "${selectedVagaModal.titulo}" revogado e excluído.`);
    }
  };

  // Filtragem de vagas para visualização
  const filteredVagas = vagas.filter(vaga => {
    const matchStatus = filterStatus === 'todos' || vaga.status.toLowerCase() === filterStatus.toLowerCase();
    const matchSearch = vaga.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        vaga.carreira.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (vaga.codigoEdital && vaga.codigoEdital.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const handleCandidatarClick = (vaga) => {
    if (vaga.status !== 'Aberto' || isPrazoSubmissaoExpirado(vaga.dataLimite)) {
      setToastMessage({
        type: 'error',
        text: `Submissão Bloqueada: O prazo legal para envio de documentos para "${vaga.titulo}" encerrou a ${formatarDataLimiteExtenso(vaga.dataLimite)}.`
      });
      return;
    }
    if (onSelectVagaParaCandidatura) {
      onSelectVagaParaCandidatura(vaga);
    }
    navigate('/portal-recrutamento/candidatura');
  };

  return (
    <div className="module-page-container">
      {/* FEEDBACK TOAST FLUTUANTE */}
      {toastMessage && (
        <div 
          className={`toast-notification toast-${toastMessage.type}`} 
          style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999999 }}
        >
          {toastMessage.type === 'success' && <CheckCircle2 size={18} color="#22c55e" />}
          {toastMessage.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
          {toastMessage.type === 'info' && <RefreshCw size={18} color="#3b82f6" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. CABEÇALHO DO MÓDULO */}
      <div className="module-page-header">
        <div className="module-page-title-group">
          <h2>
            <Briefcase size={26} color="#c59b27" />
            Concursos e Vagas Abertas • SERNIC 2026
          </h2>
          <p>
            Consulte os editais oficiais, categorias de carreira, requisitos específicos e faça a gestão profissional das quotas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* BOTÃO PARA CRIAR NOVA VAGA (CRUD: CREATE) - RESTRITO AO GESTOR */}
          {isGestor && (
            <button
              type="button"
              className="gestor-action-btn primary"
              onClick={handleOpenNovaVaga}
              style={{ padding: '0.65rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}
              title="Acesso de Gestor: Criar nova vaga ou aviso oficial"
            >
              <PlusCircle size={18} />
              <span>Lançar Novo Concurso / Vaga</span>
            </button>
          )}

          <button
            type="button"
            className="btn-vaga-candidatar"
            onClick={() => navigate('/portal-recrutamento/candidatura')}
            style={{ width: 'auto', padding: '0.65rem 1.3rem' }}
          >
            <FileText size={18} />
            <span>Formulário de Candidatura</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE PESQUISA E FILTROS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="filter-tabs-bar" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`filter-tab-btn ${filterStatus === 'todos' ? 'active' : ''}`}
            onClick={() => setFilterStatus('todos')}
          >
            <Briefcase size={15} />
            <span>Todas as Vagas ({vagas.length})</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${filterStatus === 'aberto' ? 'active' : ''}`}
            onClick={() => setFilterStatus('aberto')}
          >
            <CheckCircle2 size={15} />
            <span>Abertas ({vagas.filter(v => v.status === 'Aberto').length})</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${filterStatus === 'encerrado' ? 'active' : ''}`}
            onClick={() => setFilterStatus('encerrado')}
          >
            <Clock size={15} />
            <span>Encerradas ({vagas.filter(v => v.status === 'Encerrado').length})</span>
          </button>
        </div>

        {/* Input de Pesquisa */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--portal-text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Pesquisar carreira ou aviso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* 3. LISTA DE VAGAS */}
      <div className="vagas-list">
        {filteredVagas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--portal-text-muted)', background: 'var(--portal-card-bg)', borderRadius: '16px', border: '1px solid var(--portal-border)' }}>
            <AlertCircle size={44} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--portal-text-main)' }}>Nenhum concurso encontrado</h4>
            <p style={{ marginBottom: '1.2rem' }}>Tente ajustar os termos de pesquisa ou clique abaixo para criar um novo concurso.</p>
            <button
              type="button"
              className="gestor-action-btn primary"
              onClick={handleOpenNovaVaga}
              style={{ margin: '0 auto' }}
            >
              <PlusCircle size={16} />
              <span>Lançar Novo Concurso Oficial</span>
            </button>
          </div>
        ) : (
          filteredVagas.map((vaga) => {
            const isExpirado = isPrazoSubmissaoExpirado(vaga.dataLimite);
            const isAberto = vaga.status === 'Aberto' && !isExpirado;
            return (
              <div key={vaga.id} className="vaga-card">
                <div className="vaga-main-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span 
                      className={`vaga-badge-status ${isAberto ? 'vaga-status-aberto' : 'vaga-status-encerrado'}`}
                      style={{ cursor: isGestor ? 'pointer' : 'default' }}
                      onClick={() => isGestor && handleQuickToggleStatus(vaga.id)}
                      title={isGestor ? "Clique para alternar estado Aberto / Encerrado" : isExpirado ? "Prazo legal de submissão de documentos expirado" : vaga.status}
                    >
                      {isExpirado ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} /> Prazo Expirado
                        </span>
                      ) : (
                        `${vaga.status}${isGestor ? ' (Clique p/ alternar)' : ''}`
                      )}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--portal-text-muted)', fontFamily: 'monospace' }}>
                      {vaga.codigoEdital}
                    </span>
                  </div>

                  <h3 className="vaga-title">{vaga.titulo}</h3>
                  <p className="vaga-carreira">{vaga.carreira}</p>

                  <div className="vaga-meta-grid">
                    <div className="vaga-meta-item">
                      <Users size={16} color="#c59b27" />
                      <span><strong>{vaga.vagas}</strong> vagas autorizadas</span>
                    </div>
                    <div className="vaga-meta-item">
                      <MapPin size={16} color="#c59b27" />
                      <span>{vaga.local}</span>
                    </div>
                    <div className="vaga-meta-item">
                      <Calendar size={16} color={isExpirado ? '#dc2626' : '#c32026'} />
                      <span>
                        Limite: <strong>{new Date(vaga.dataLimite).toLocaleDateString('pt-MZ')}</strong>
                        {isExpirado && <span style={{ color: '#dc2626', fontWeight: 800, marginLeft: '0.35rem' }}>(Terminado)</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO NA LINHA DA VAGA */}
                <div className="vaga-actions-group">
                  {isAberto ? (
                    <button
                      type="button"
                      className="btn-vaga-candidatar"
                      onClick={() => handleCandidatarClick(vaga)}
                    >
                      <span>Candidatar</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-vaga-candidatar"
                      disabled
                      style={{ opacity: 0.65, cursor: 'not-allowed', background: '#dc2626', borderColor: '#b91c1c' }}
                      title={`Submissões encerradas: O prazo legal para envio de documentos expirou a ${formatarDataLimiteExtenso(vaga.dataLimite)}`}
                    >
                      <Lock size={14} />
                      <span>Submissões Encerradas</span>
                    </button>
                  )}

                  {/* ABRIR SUB-ABA COMPLETA DE REQUISITOS (PARA CANDIDATO E GESTOR) */}
                  <button
                    type="button"
                    className="btn-vaga-detalhes"
                    onClick={() => handleOpenVagaView(vaga)}
                    title="Ver requisitos estatutários e detalhes oficiais"
                  >
                    <span>Ver Requisitos</span>
                    <ChevronRight size={16} />
                  </button>

                  {/* CAMPO EDITAR VAGA: RESTRITO EXCLUSIVAMENTE AO GESTOR (NÃO APARECE PARA CANDIDATO) */}
                  {isGestor && (
                    <button
                      type="button"
                      className="sub-aba-btn-action gestor-edit-pill"
                      onClick={() => handleOpenVagaEdit(vaga)}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                      title="Área Administrativa: Editar informações e quotas deste concurso"
                    >
                      <Edit3 size={13} color="#c32026" />
                      <span>Editar Vaga (Gestor)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setViewEditalModal(vaga)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--portal-gold)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      padding: '0.2rem'
                    }}
                  >
                    <Download size={13} color="#c59b27" />
                    <span>Edital Oficial (PDF)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================
          4. SUB-ABA PROFISSIONAL COM CRUD COMPLETO
          (CREATE, READ, UPDATE, DELETE + MOVIMENTAÇÃO E RESIZE)
          ======================================================== */}
      {selectedVagaModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            // Fecha apenas se clicou no backdrop, não no interior da sub-aba
            if (e.target === e.currentTarget) {
              setSelectedVagaModal(null);
            }
          }}
        >
          <DraggableSubAba 
            className="modal-content-card" 
            moveHandleLabel={isGestor ? "Mover Sub-Aba de Gestão da Vaga" : "Mover Sub-Aba • Requisitos do Concurso"}
            onClose={() => setSelectedVagaModal(null)}
          >
            {/* 4.1 TOOLBAR DE CRUD: RESTRITA EXCLUSIVAMENTE AO GESTOR */}
            {isGestor ? (
              <div className="sub-aba-crud-toolbar">
                <div className="sub-aba-mode-tabs">
                  <button
                    type="button"
                    className={`sub-aba-mode-btn ${modalMode === 'view' ? 'active' : ''}`}
                    onClick={() => setModalMode('view')}
                  >
                    <Eye size={14} />
                    <span>Visualização (Read)</span>
                  </button>
                  <button
                    type="button"
                    className={`sub-aba-mode-btn ${modalMode === 'edit' || modalMode === 'create' ? 'active' : ''}`}
                    onClick={() => setModalMode(modalMode === 'create' ? 'create' : 'edit')}
                  >
                    <Edit3 size={14} />
                    <span>{modalMode === 'create' ? 'Criar Nova Vaga' : 'Editar Dados (Update)'}</span>
                  </button>
                </div>

                {/* Ações Rápidas na Toolbar da Sub-Aba */}
                <div className="sub-aba-quick-actions">
                  {modalMode !== 'create' && (
                    <>
                      <button
                        type="button"
                        className="sub-aba-btn-action"
                        onClick={() => handleQuickToggleStatus(selectedVagaModal.id)}
                        title="Alternar estado entre Aberto e Encerrado"
                      >
                        <RefreshCw size={13} />
                        <span>Status: {vagaForm.status}</span>
                      </button>

                      <button
                        type="button"
                        className="sub-aba-btn-action"
                        onClick={() => handleDuplicateVaga(selectedVagaModal)}
                        title="Duplicar concurso como novo modelo"
                      >
                        <Copy size={13} />
                        <span>Duplicar</span>
                      </button>

                      <button
                        type="button"
                        className="sub-aba-btn-action danger"
                        onClick={() => setIsDeletingConfirm(true)}
                        title="Eliminar este concurso do sistema"
                      >
                        <Trash2 size={13} />
                        <span>Excluir</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="sub-aba-btn-action"
                    onClick={() => setViewEditalModal(selectedVagaModal)}
                    title="Visualizar documento timbrado oficial em PDF"
                  >
                    <Printer size={13} />
                    <span>Edital PDF</span>
                  </button>
                </div>
              </div>
            ) : (
              /* CABEÇALHO OFICIAL INSTITUCIONAL PARA O CANDIDATO (SEM QUALQUER OPÇÃO DE EDIÇÃO) */
              <div className="sub-aba-candidato-header-bar">
                <div className="candidato-header-badge">
                  <ShieldCheck size={16} color="#c32026" />
                  <span>AVISO OFICIAL DE ABERTURA • SERVIÇO NACIONAL DE INVESTIGAÇÃO CRIMINAL</span>
                </div>
                <button
                  type="button"
                  className="sub-aba-btn-action"
                  onClick={() => setViewEditalModal(selectedVagaModal)}
                  title="Baixar Edital Oficial em formato PDF"
                >
                  <Download size={13} color="#c59b27" />
                  <span>Baixar Edital (PDF)</span>
                </button>
              </div>
            )}

            {/* 4.2 BANNER DE CONFIRMAÇÃO DE EXCLUSÃO (DELETE) */}
            {isDeletingConfirm && (
              <div className="sub-aba-delete-dialog">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <AlertTriangle size={24} color="#c32026" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.3rem 0', color: '#c32026', fontSize: '0.98rem', fontWeight: 800 }}>
                      Tem a certeza que deseja revogar e excluir este concurso?
                    </h4>
                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.84rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                      Esta ação removerá o edital <strong>{selectedVagaModal.codigoEdital}</strong> ({selectedVagaModal.titulo}) da consulta pública de todos os cidadãos e registará a operação no Livro de Atas e Auditoria do SERNIC.
                    </p>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button
                        type="button"
                        onClick={handleConfirmDelete}
                        style={{ background: '#c32026', color: '#ffffff', border: 'none', padding: '0.45rem 1rem', borderRadius: '7px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                      >
                        Sim, Confirmar Exclusão
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDeletingConfirm(false)}
                        style={{ background: '#ffffff', color: 'var(--portal-text-sub)', border: '1px solid var(--portal-border)', padding: '0.45rem 0.9rem', borderRadius: '7px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4.3 MODO DE VISUALIZAÇÃO (READ) */}
            {modalMode === 'view' && !isDeletingConfirm && (
              <div className="sub-aba-view-mode">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--portal-border)', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span 
                      className={`vaga-badge-status ${selectedVagaModal.status === 'Aberto' ? 'vaga-status-aberto' : 'vaga-status-encerrado'}`} 
                      style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      {selectedVagaModal.status === 'Aberto' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {selectedVagaModal.status} • {selectedVagaModal.codigoEdital}
                    </span>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--portal-text-main)', margin: '0.2rem 0' }}>
                      {selectedVagaModal.titulo}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--portal-gold)', fontWeight: 700, margin: 0 }}>
                      {selectedVagaModal.carreira} • {selectedVagaModal.regime}
                    </p>
                  </div>
                  
                  {isGestor && (
                    <button
                      type="button"
                      onClick={() => setModalMode('edit')}
                      className="gestor-action-btn secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                    >
                      <Edit3 size={14} />
                      <span>Editar Concurso (Gestor)</span>
                    </button>
                  )}
                </div>

                {/* Aviso Regulamentar de Prazo Expirado */}
                {isPrazoSubmissaoExpirado(selectedVagaModal.dataLimite) && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1.5px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    color: '#b91c1c'
                  }}>
                    <Lock size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                      <strong>Submissões Encerradas:</strong> O prazo limite para envio de documentos desta vaga expirou a <strong>{formatarDataLimiteExtenso(selectedVagaModal.dataLimite)}</strong>. Novas candidaturas não são admitidas pelo sistema.
                    </span>
                  </div>
                )}

                {/* Métricas e Prazos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: 'var(--portal-card-inner)', padding: '1.1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--portal-border)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--portal-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Vagas Abertas</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--portal-text-main)' }}>{selectedVagaModal.vagas} Postos</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--portal-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Data Limite</span>
                    <strong style={{ fontSize: '1.15rem', color: '#c32026' }}>{new Date(selectedVagaModal.dataLimite).toLocaleDateString('pt-MZ')}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--portal-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Colocação Geográfica</span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--portal-text-main)' }}>{selectedVagaModal.local}</strong>
                  </div>
                </div>

                {/* Remuneração */}
                {selectedVagaModal.remuneracao && (
                  <div style={{ background: 'rgba(197, 155, 39, 0.08)', border: '1px solid rgba(197, 155, 39, 0.25)', borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1.4rem' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--portal-gold)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Enquadramento Salarial</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--portal-text-main)' }}>{selectedVagaModal.remuneracao}</strong>
                  </div>
                )}

                {/* Requisitos Gerais */}
                <div style={{ marginBottom: '1.4rem' }}>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={18} color="#c59b27" /> Requisitos Gerais Obrigatórios
                  </h4>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--portal-text-muted)', lineHeight: 1.6 }}>
                    {selectedVagaModal.requisitosGerais && selectedVagaModal.requisitosGerais.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Requisitos Específicos */}
                <div style={{ marginBottom: '1.4rem' }}>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={18} color="#c59b27" /> Requisitos Específicos & Habilitações
                  </h4>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--portal-text-muted)', lineHeight: 1.6 }}>
                    {selectedVagaModal.requisitosEspecificos && selectedVagaModal.requisitosEspecificos.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Fases do Concurso */}
                {selectedVagaModal.fasesConcurso && selectedVagaModal.fasesConcurso.length > 0 && (
                  <div style={{ marginBottom: '1.6rem' }}>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '0.6rem' }}>
                      Fases Oficiais do Concurso
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {selectedVagaModal.fasesConcurso.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--portal-text-main)' }}>
                          <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#0f2042', color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {f.fase}
                          </span>
                          <span>{f.nome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rodapé da Sub-Aba no Modo Visualização */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--portal-border)', paddingTop: '1.2rem', marginTop: 'auto' }}>
                  {isGestor ? (
                    <button
                      type="button"
                      className="gestor-btn-outline"
                      onClick={() => handleOpenVagaEdit(selectedVagaModal)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Edit3 size={15} />
                      <span>Editar Informações (Gestor)</span>
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: 'var(--portal-text-muted)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FileCheck size={16} color="#15803d" />
                      <span>Documento Oficial Homologado • SERNIC DRH 2026</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button
                      type="button"
                      className="btn-draft"
                      onClick={() => setSelectedVagaModal(null)}
                    >
                      Fechar
                    </button>
                    {selectedVagaModal.status === 'Aberto' && (!isPrazoSubmissaoExpirado(selectedVagaModal.dataLimite) ? (
                      <button
                        type="button"
                        className="btn-vaga-candidatar"
                        onClick={() => {
                          const vaga = selectedVagaModal;
                          setSelectedVagaModal(null);
                          handleCandidatarClick(vaga);
                        }}
                      >
                        <ArrowRight size={16} />
                        <span>Candidatar-me a esta Vaga</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-vaga-candidatar"
                        disabled
                        style={{ opacity: 0.65, cursor: 'not-allowed', background: '#dc2626', borderColor: '#b91c1c' }}
                        title={`Submissões encerradas: O prazo expirou a ${formatarDataLimiteExtenso(selectedVagaModal.dataLimite)}`}
                      >
                        <Lock size={15} />
                        <span>Submissões Encerradas</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4.4 MODO DE EDIÇÃO / CRIAÇÃO (CRUD: CREATE & UPDATE) */}
            {(modalMode === 'edit' || modalMode === 'create') && !isDeletingConfirm && (
              <form onSubmit={handleSaveVagaForm} className="sub-aba-crud-form">
                <div style={{ borderBottom: '1px solid var(--portal-border)', paddingBottom: '0.9rem', marginBottom: '1.4rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--portal-text-main)' }}>
                    {modalMode === 'create' ? 'Lançar Novo Concurso Público / Vaga' : `Editar Concurso: ${vagaForm.titulo}`}
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--portal-text-muted)' }}>
                    Actualize os parâmetros estatutários, quotas provinciais e requisitos que serão apresentados aos candidatos.
                  </p>
                </div>

                {/* ========================================================
                    FORMULÁRIO DE GESTÃO ORGANIZADO POR SECÇÕES INSTITUCIONAIS
                    ======================================================== */}
                
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
                        Designação da carreira, código do edital no Boletim da República e enquadramento estatutário
                      </p>
                    </div>
                  </div>

                  <div className="vaga-section-grid full" style={{ marginBottom: '0.9rem' }}>
                    <div className="sub-aba-form-field">
                      <label>Designação Oficial do Cargo / Carreira</label>
                      <input
                        type="text"
                        className="sub-aba-input"
                        placeholder="Ex: Investigador Criminal de 2ª Classe"
                        value={vagaForm.titulo}
                        onChange={(e) => setVagaForm({ ...vagaForm, titulo: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="vaga-section-grid">
                    <div className="sub-aba-form-field">
                      <label>Código do Edital / Aviso Oficial</label>
                      <input
                        type="text"
                        className="sub-aba-input"
                        placeholder="Ex: Aviso n.º 01/SERNIC-DG/DRH/2026"
                        value={vagaForm.codigoEdital}
                        onChange={(e) => setVagaForm({ ...vagaForm, codigoEdital: e.target.value })}
                        required
                      />
                    </div>

                    <div className="sub-aba-form-field">
                      <label>Regime de Carreira</label>
                      <input
                        type="text"
                        className="sub-aba-input"
                        placeholder="Ex: Carreira de Regime Especial - SERNIC"
                        value={vagaForm.regime}
                        onChange={(e) => setVagaForm({ ...vagaForm, regime: e.target.value })}
                      />
                    </div>

                    <div className="sub-aba-form-field" style={{ gridColumn: '1 / -1' }}>
                      <label>Área / Ramo do SERNIC</label>
                      <select
                        className="sub-aba-select"
                        value={vagaForm.carreira}
                        onChange={(e) => setVagaForm({ ...vagaForm, carreira: e.target.value })}
                      >
                        <option value="Investigação Criminal e Instrução Processual">Investigação Criminal e Instrução Processual</option>
                        <option value="Laboratório Central de Criminalística (Polícia Científica)">Polícia Científica (Laboratório Forense)</option>
                        <option value="Divisão de Investigação de Cibercrimes e Inteligência Digital">Inteligência Digital e Cibersegurança</option>
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
                        Número de postos homologados pelo Ministério e províncias / delegações de destino
                      </p>
                    </div>
                  </div>

                  <div className="vaga-section-grid">
                    <div className="sub-aba-form-field">
                      <label>Quotas de Vagas Autorizadas</label>
                      <input
                        type="number"
                        min="1"
                        className="sub-aba-input"
                        value={vagaForm.vagas}
                        onChange={(e) => setVagaForm({ ...vagaForm, vagas: e.target.value })}
                        required
                      />
                    </div>

                    <div className="sub-aba-form-field">
                      <label>Estado Operacional do Concurso</label>
                      <select
                        className="sub-aba-select"
                        value={vagaForm.status}
                        onChange={(e) => setVagaForm({ ...vagaForm, status: e.target.value })}
                      >
                        <option value="Aberto">Aberto (Candidaturas Activas)</option>
                        <option value="Encerrado">Encerrado (Inscrições Terminadas)</option>
                        <option value="Em Breve">Em Breve (Fase de Homologação)</option>
                      </select>
                    </div>

                    <div className="sub-aba-form-field" style={{ gridColumn: '1 / -1' }}>
                      <label>Local / Delegações de Colocação</label>
                      <input
                        type="text"
                        className="sub-aba-input"
                        placeholder="Ex: Nacional ou Maputo, Beira, Nampula"
                        value={vagaForm.local}
                        onChange={(e) => setVagaForm({ ...vagaForm, local: e.target.value })}
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
                        <span>Cronograma Oficial & Prazos do Edital</span>
                      </h4>
                      <p className="vaga-form-section-subtitle">
                        Período de abertura e prazo limite improrrogável de receção de candidaturas
                      </p>
                    </div>
                  </div>

                  <div className="vaga-section-grid">
                    <div className="sub-aba-form-field">
                      <label>Data de Publicação / Abertura</label>
                      <input
                        type="date"
                        className="sub-aba-input"
                        value={vagaForm.dataAbertura}
                        onChange={(e) => setVagaForm({ ...vagaForm, dataAbertura: e.target.value })}
                      />
                    </div>

                    <div className="sub-aba-form-field">
                      <label>Data Limite de Candidaturas</label>
                      <input
                        type="date"
                        className="sub-aba-input"
                        value={vagaForm.dataLimite}
                        onChange={(e) => setVagaForm({ ...vagaForm, dataLimite: e.target.value })}
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
                        <span>Enquadramento Salarial & Benefícios TSU</span>
                      </h4>
                      <p className="vaga-form-section-subtitle">
                        Nível de vencimento na Tabela Salarial Única e subsídios inerentes ao regime especial
                      </p>
                    </div>
                  </div>

                  <div className="vaga-section-grid full">
                    <div className="sub-aba-form-field">
                      <label>Enquadramento Salarial e Benefícios Estatutários</label>
                      <input
                        type="text"
                        className="sub-aba-input"
                        placeholder="Ex: Tabela Salarial Única (TSU) + Subsídio de Risco e Investigação"
                        value={vagaForm.remuneracao}
                        onChange={(e) => setVagaForm({ ...vagaForm, remuneracao: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* SECÇÃO 5: REQUISITOS E CRITÉRIOS DE ADMISSÃO */}
                <div className="vaga-form-section">
                  <div className="vaga-form-section-header">
                    <div className="vaga-form-section-badge">5</div>
                    <div className="vaga-form-section-title-wrap">
                      <h4 className="vaga-form-section-title">
                        <ShieldCheck size={17} color="#c59b27" />
                        <span>Requisitos Estatutários & Critérios de Admissão</span>
                      </h4>
                      <p className="vaga-form-section-subtitle">
                        Requisitos eliminatórios gerais previstos na Lei e habilitações específicas para o posto
                      </p>
                    </div>
                  </div>

                  {/* Requisitos Gerais */}
                  <div style={{ marginBottom: '1.4rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--portal-text-main)', display: 'block', marginBottom: '0.4rem' }}>
                      Requisitos Gerais Obrigatórios ({vagaForm.requisitosGerais.length} definidos)
                    </label>
                    <div className="sub-aba-req-list-editor">
                      {vagaForm.requisitosGerais.map((req, idx) => (
                        <div key={idx} className="sub-aba-req-item-row">
                          <span style={{ flex: 1 }}>{req}</span>
                          <button
                            type="button"
                            className="sub-aba-req-delete-btn"
                            onClick={() => handleRemoveReqGeral(idx)}
                            title="Remover requisito"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <div className="sub-aba-add-input-group">
                        <input
                          type="text"
                          className="sub-aba-input"
                          placeholder="Escreva um novo requisito geral..."
                          value={novoReqGeral}
                          onChange={(e) => setNovoReqGeral(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddReqGeral();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="sub-aba-btn-add"
                          onClick={handleAddReqGeral}
                        >
                          <Plus size={14} />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Requisitos Específicos */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--portal-text-main)', display: 'block', marginBottom: '0.4rem' }}>
                      Requisitos Específicos & Habilitações ({vagaForm.requisitosEspecificos.length} definidos)
                    </label>
                    <div className="sub-aba-req-list-editor">
                      {vagaForm.requisitosEspecificos.map((req, idx) => (
                        <div key={idx} className="sub-aba-req-item-row">
                          <span style={{ flex: 1 }}>{req}</span>
                          <button
                            type="button"
                            className="sub-aba-req-delete-btn"
                            onClick={() => handleRemoveReqEsp(idx)}
                            title="Remover requisito"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <div className="sub-aba-add-input-group">
                        <input
                          type="text"
                          className="sub-aba-input"
                          placeholder="Escreva um novo requisito específico..."
                          value={novoReqEsp}
                          onChange={(e) => setNovoReqEsp(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddReqEsp();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="sub-aba-btn-add"
                          onClick={handleAddReqEsp}
                        >
                          <Plus size={14} />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTÕES DE GRAVAÇÃO DO FORMULÁRIO */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--portal-border)', paddingTop: '1.2rem', marginTop: 'auto' }}>
                  <button
                    type="button"
                    className="btn-draft"
                    onClick={() => {
                      if (modalMode === 'create') {
                        setSelectedVagaModal(null);
                      } else {
                        setModalMode('view');
                      }
                    }}
                  >
                    Cancelar
                  </button>

                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    {modalMode === 'edit' && (
                      <button
                        type="button"
                        className="sub-aba-btn-action danger"
                        onClick={() => setIsDeletingConfirm(true)}
                      >
                        <Trash2 size={15} />
                        <span>Excluir Concurso</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      className="gestor-btn-primary-red"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem' }}
                    >
                      <Save size={16} />
                      <span>{modalMode === 'create' ? 'Publicar Novo Concurso' : 'Guardar Alterações'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </DraggableSubAba>
        </div>,
        document.body
      )}

      {/* ========================================================
          5. MODAL DE VISUALIZAÇÃO E DOWNLOAD DO EDITAL OFICIAL
          ======================================================== */}
      {viewEditalModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewEditalModal(null);
          }}
        >
          <DraggableSubAba 
            className="comprovativo-print-modal" 
            moveHandleLabel="Mover Documento Oficial"
            onClose={() => setViewEditalModal(null)}
          >
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f2042' }}>
                Edital Oficial em PDF • Visualização
              </span>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#0f2042', color: '#ffffff', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  <Printer size={15} />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewEditalModal(null)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '0.45rem 0.8rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* DOCUMENTO OFICIAL FORMATADO */}
            <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
              <img src={sernicLogo} alt="SERNIC Logo" style={{ width: '70px', height: '70px', margin: '0 auto 0.5rem auto' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
                República de Moçambique
              </h3>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', margin: '0.2rem 0' }}>
                Procuradoria-Geral da República
              </h4>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', margin: '0.2rem 0', color: '#0f2042' }}>
                Serviço Nacional de Investigação Criminal
              </h5>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: '0.2rem 0' }}>
                DIRECÇÃO GERAL • DIRECÇÃO DE RECURSOS HUMANOS
              </p>
              <div style={{ width: '120px', height: '2px', backgroundColor: '#c59b27', margin: '0.8rem auto' }}></div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#c32026', margin: '0.6rem 0' }}>
                {viewEditalModal.codigoEdital}
              </h2>
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', fontWeight: 600 }}>
                Abertura de Concurso Público de Ingresso para o provimento de vagas no SERNIC
              </p>
            </div>

            <div style={{ fontSize: '0.88rem', lineHeight: 1.7, textAlign: 'justify', color: '#1e293b' }}>
              <p style={{ marginBottom: '1rem' }}>
                Em cumprimento do despacho de Sua Excelência o Procurador-Geral da República e nos termos conjugados do Estatuto dos Funcionários e Agentes do Estado (EFAE) e da Lei Orgânica do SERNIC, faz-se público que se encontra aberto pelo período de 30 (trinta) dias o concurso público de ingresso para a carreira de <strong>{viewEditalModal.titulo}</strong>.
              </p>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '1rem 0 0.4rem 0' }}>1. NÚMERO DE VAGAS E COLOCAÇÃO:</h4>
              <p>São postas a concurso <strong>{viewEditalModal.vagas} vagas</strong> com colocação em {viewEditalModal.local}.</p>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '1rem 0 0.4rem 0' }}>2. REQUISITOS GERAIS DE ADMISSÃO:</h4>
              <ul style={{ paddingLeft: '1.4rem' }}>
                {viewEditalModal.requisitosGerais && viewEditalModal.requisitosGerais.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '1rem 0 0.4rem 0' }}>3. REQUISITOS ESPECÍFICOS E FORMAÇÃO:</h4>
              <ul style={{ paddingLeft: '1.4rem' }}>
                {viewEditalModal.requisitosEspecificos && viewEditalModal.requisitosEspecificos.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '1rem 0 0.4rem 0' }}>4. SUBMISSÃO DE CANDIDATURAS:</h4>
              <p>
                As candidaturas são submetidas obrigatoriamente através da plataforma digital do SERNIC em <strong>https://recrutamento.sernic.gov.mz</strong> até às 23:59 horas do dia <strong>{new Date(viewEditalModal.dataLimite).toLocaleDateString('pt-MZ')}</strong>.
              </p>

              <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Autenticação Eletrónica</p>
                  <strong style={{ fontSize: '0.8rem', color: '#0f2042' }}>CHAVE DIGITAL MZ-SERNIC-2026</strong>
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem' }}>Maputo, aos {viewEditalModal.dataAbertura}</p>
                  <p style={{ fontWeight: 800, marginTop: '0.8rem' }}>O Director de Recursos Humanos do SERNIC</p>
                </div>
              </div>
            </div>
          </DraggableSubAba>
        </div>,
        document.body
      )}
    </div>
  );
}
