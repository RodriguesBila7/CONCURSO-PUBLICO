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
  CheckCircle2
} from 'lucide-react';
import { INITIAL_VAGAS } from '../mockData';
import sernicLogo from '../../assets/sernic-logo.png';

export default function RecrutamentoModule({ navigate, onSelectVagaParaCandidatura }) {
  const [vagas, setVagas] = useState(INITIAL_VAGAS);
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos' | 'aberto' | 'encerrado'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVagaModal, setSelectedVagaModal] = useState(null);
  const [viewEditalModal, setViewEditalModal] = useState(null);

  // Carregar vagas da API do SQLite (se disponível) ou fallback para mock
  useEffect(() => {
    async function fetchVagas() {
      try {
        const res = await fetch('/api/vagas');
        const data = await res.json();
        if (data.success && data.vagas && data.vagas.length > 0) {
          setVagas(data.vagas);
        }
      } catch {
        // Usa INITIAL_VAGAS predefinidas
      }
    }
    fetchVagas();
  }, []);

  // Filtragem
  const filteredVagas = vagas.filter(vaga => {
    const matchStatus = filterStatus === 'todos' || vaga.status.toLowerCase() === filterStatus.toLowerCase();
    const matchSearch = vaga.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        vaga.carreira.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (vaga.codigoEdital && vaga.codigoEdital.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const handleCandidatarClick = (vaga) => {
    if (vaga.status !== 'Aberto') return;
    if (onSelectVagaParaCandidatura) {
      onSelectVagaParaCandidatura(vaga);
    }
    navigate('/portal-recrutamento/candidatura');
  };

  return (
    <div className="module-page-container">
      {/* 1. CABEÇALHO DO MÓDULO */}
      <div className="module-page-header">
        <div className="module-page-title-group">
          <h2>
            <Briefcase size={26} color="#c59b27" />
            Concursos e Vagas Abertas • SERNIC 2026
          </h2>
          <p>
            Consulte os editais oficiais, categorias de carreira, requisitos específicos e submeta a sua candidatura.
          </p>
        </div>

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
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
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
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--portal-text-main)' }}>Nenhum concurso encontrado</h4>
            <p>Tente ajustar os termos de pesquisa ou os filtros seleccionados.</p>
          </div>
        ) : (
          filteredVagas.map((vaga) => {
            const isAberto = vaga.status === 'Aberto';
            return (
              <div key={vaga.id} className="vaga-card">
                <div className="vaga-main-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className={`vaga-badge-status ${isAberto ? 'vaga-status-aberto' : 'vaga-status-encerrado'}`}>
                      {vaga.status}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                      {vaga.codigoEdital}
                    </span>
                  </div>

                  <h3 className="vaga-title">{vaga.titulo}</h3>
                  <div className="vaga-carreira">{vaga.carreira}</div>

                  <div className="vaga-meta-row">
                    <div className="vaga-meta-item">
                      <Users size={15} color="#c59b27" />
                      <span><strong>{vaga.vagas}</strong> Vagas</span>
                    </div>

                    <div className="vaga-meta-item">
                      <MapPin size={15} color="#c59b27" />
                      <span>{vaga.local}</span>
                    </div>

                    <div className="vaga-meta-item">
                      <Calendar size={15} color={isAberto ? '#15803d' : '#ef4444'} />
                      <span>Prazo: <strong>{new Date(vaga.dataLimite).toLocaleDateString('pt-MZ')}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="vaga-actions">
                  {isAberto ? (
                    <button
                      type="button"
                      className="btn-vaga-candidatar"
                      onClick={() => handleCandidatarClick(vaga)}
                    >
                      <ArrowRight size={16} />
                      <span>Candidatar-me</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-vaga-candidatar"
                      disabled
                      style={{ opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#94a3b8' }}
                    >
                      <span>Prazo Expirado</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-vaga-detalhes"
                    onClick={() => setSelectedVagaModal(vaga)}
                  >
                    <span>Ver Requisitos</span>
                    <ChevronRight size={16} />
                  </button>

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

      {/* 4. MODAL DETALHES COMPLETOS DA VAGA */}
      {selectedVagaModal && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', zIndex: 1000 }}>
          <div className="modal-content-card" style={{ maxWidth: '720px', padding: '2.2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="vaga-badge-status vaga-status-aberto" style={{ marginBottom: '0.4rem' }}>
                  {selectedVagaModal.status} • {selectedVagaModal.codigoEdital}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--portal-text-main)' }}>
                  {selectedVagaModal.titulo}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#b0891e', fontWeight: 600 }}>
                  {selectedVagaModal.carreira}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVagaModal(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="#475569" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: 'var(--portal-card-inner)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--portal-border)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--portal-text-muted)', display: 'block' }}>Vagas Abertas</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--portal-text-main)' }}>{selectedVagaModal.vagas} Postos</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--portal-text-muted)', display: 'block' }}>Data Limite</span>
                <strong style={{ fontSize: '1.1rem', color: '#c32026' }}>{new Date(selectedVagaModal.dataLimite).toLocaleDateString('pt-MZ')}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--portal-text-muted)', display: 'block' }}>Âmbito Geográfico</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--portal-text-main)' }}>{selectedVagaModal.local}</strong>
              </div>
            </div>

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

            {selectedVagaModal.fasesConcurso && (
              <div style={{ marginBottom: '1.6rem' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '0.6rem' }}>
                  Fases do Concurso
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedVagaModal.fasesConcurso.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#334155' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#0f2042', color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {f.fase}
                      </span>
                      <span>{f.nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.2rem' }}>
              <button
                type="button"
                className="btn-draft"
                onClick={() => setSelectedVagaModal(null)}
              >
                Fechar
              </button>
              {selectedVagaModal.status === 'Aberto' && (
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL DE VISUALIZAÇÃO E DOWNLOAD DO EDITAL OFICIAL */}
      {viewEditalModal && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', zIndex: 1000 }}>
          <div className="comprovativo-print-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
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
          </div>
        </div>
      )}
    </div>
  );
}
