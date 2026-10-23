import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  Calendar, 
  XCircle, 
  Printer,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { 
  INITIAL_CANDIDATURAS_CONSULTA, 
  INITIAL_LISTAS_PUBLICADAS,
  getStoredCandidaturas,
  getStoredListasPublicadas
} from '../mockData';
import { Award } from 'lucide-react';
import DraggableSubAba from '../components/DraggableSubAba';

export default function ConsultaModule() {
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' | 'listas'

  // Candidaturas e listas persistidas/sincronizadas
  const [candidaturasList, setCandidaturasList] = useState(() => getStoredCandidaturas());
  const [listasPublicadas, setListasPublicadas] = useState(() => getStoredListasPublicadas());

  // Estado da Pesquisa Individual
  const [codigoInput, setCodigoInput] = useState('');
  const [biInput, setBiInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Estado das Listas Públicas
  const [filterTipoLista, setFilterTipoLista] = useState('todos'); // 'todos' | 'Admitidos' | 'Convocados' | 'Excluídos'
  const [viewListaModal, setViewListaModal] = useState(null);

  // Recarregar dados sincronizados ao focar ou pesquisar
  const refreshData = () => {
    setCandidaturasList(getStoredCandidaturas());
    setListasPublicadas(getStoredListasPublicadas());
  };

  // Executar Pesquisa Individual
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchError('');
    refreshData();

    const codClean = codigoInput.trim().toUpperCase();
    const biClean = biInput.trim().toUpperCase();

    if (!codClean && !biClean) {
      setSearchError('Por favor, informe o Número de Candidatura ou o Número do BI.');
      setSearchResult(null);
      return;
    }

    const currentList = getStoredCandidaturas();
    // Procurar nas candidaturas sincronizadas
    const found = currentList.find(c => {
      const matchCod = codClean ? c.codigoCandidatura.toUpperCase().includes(codClean) : false;
      const matchBi = biClean ? c.biNumero.toUpperCase().includes(biClean) : false;
      return matchCod || matchBi;
    });

    if (found) {
      setSearchResult(found);
    } else {
      setSearchResult(null);
      setSearchError(`Nenhuma candidatura encontrada com o protocolo "${codClean || biClean}". Verifique os dados introduzidos.`);
    }
  };

  // Carregar exemplo para teste rápido
  const handleLoadDemo = (demo) => {
    setCodigoInput(demo.codigoCandidatura);
    setBiInput(demo.biNumero);
    setSearchResult(demo);
    setSearchError('');
  };

  // Obter classe e ícone do estado de acordo com as 3 fases oficiais do concurso
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Admitido':
      case 'Admitida':
      case 'Aprovada':
        return { bg: '#dcfce7', color: '#15803d', icon: <Award size={16} />, label: '3ª Fase: Admitido(a) - Provimento Efetivo' };
      case 'Aprovado (Suplente)':
        return { bg: '#fef9c3', color: '#854d0e', icon: <CheckCircle2 size={16} />, label: '3ª Fase: Aprovado(a) - Suplente (Lista de Reserva)' };
      case 'Entrevista Profissional':
      case 'Convocada para provas':
        return { bg: '#dbeafe', color: '#1e40af', icon: <Calendar size={16} />, label: '2ª Fase: Convocado(a) para Entrevista Profissional' };
      case 'Excluído':
      case 'Excluída':
        return { bg: '#fee2e2', color: '#c32026', icon: <XCircle size={16} />, label: 'Candidatura Excluída do Concurso' };
      case 'Em Análise Documental':
      case 'Em análise':
      case 'Submetida':
      default:
        return { bg: '#fef3c7', color: '#92400e', icon: <Clock size={16} />, label: '1ª Fase: Em Análise Documental' };
    }
  };

  const filteredListas = listasPublicadas.filter(l => {
    if (filterTipoLista === 'todos') return true;
    return l.tipo.toLowerCase() === filterTipoLista.toLowerCase();
  });

  return (
    <div className="module-page-container">
      {/* 1. CABEÇALHO DO MÓDULO */}
      <div className="module-page-header">
        <div className="module-page-title-group">
          <h2>
            <Search size={26} color="#c59b27" />
            Consulta de Candidaturas & Listas Oficiais • SERNIC
          </h2>
          <p>
            Acompanhe o estado do seu processo em tempo real ou consulte as pautas e editais de admitidos e convocados.
          </p>
        </div>

        {/* Alternância de Abas */}
        <div className="filter-tabs-bar" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`filter-tab-btn ${activeTab === 'individual' ? 'active' : ''}`}
            onClick={() => setActiveTab('individual')}
          >
            <Search size={15} />
            <span>Pesquisa por Candidato</span>
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${activeTab === 'listas' ? 'active' : ''}`}
            onClick={() => setActiveTab('listas')}
          >
            <FileText size={15} />
            <span>Listas Públicas Publicadas</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          ABA 1: PESQUISA INDIVIDUAL DE CANDIDATURA
          ======================================================== */}
      {activeTab === 'individual' && (
        <div>
          {/* CAIXA DE PESQUISA */}
          <div className="consulta-search-box">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '0.4rem' }}>
              Consultar Situação da Candidatura
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--portal-text-muted)', marginBottom: '1.2rem' }}>
              Introduza o número de candidatura gerado na inscrição (ex: <code>SERNIC-2026-00849</code>) ou o seu número de Bilhete de Identidade (BI).
            </p>

            <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) 160px', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group">
                <label>N.º de Candidatura</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: SERNIC-2026-00849"
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Bilhete de Identidade (BI)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 110100234567M"
                  value={biInput}
                  onChange={(e) => setBiInput(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-vaga-candidatar"
                style={{ height: '44px', width: '100%', marginBottom: '2px' }}
              >
                <Search size={18} />
                <span>Consultar</span>
              </button>
            </form>

            {searchError && (
              <div style={{ marginTop: '1rem', color: '#c32026', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} />
                <span>{searchError}</span>
              </div>
            )}

            {/* TESTES RÁPIDOS DEMO DISCRETOS */}
            <div style={{ marginTop: '1.2rem', paddingTop: '0.9rem', borderTop: '1px solid var(--portal-border)', fontSize: '0.8rem', color: 'var(--portal-text-muted)' }}>
              <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>Simular por fase oficial:</span>
              <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}>
                <button
                  type="button"
                  onClick={() => handleLoadDemo(INITIAL_CANDIDATURAS_CONSULTA[0])}
                  className="auth-demo-pill"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                >
                  2ª Fase: Entrevista (00849)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadDemo(INITIAL_CANDIDATURAS_CONSULTA[1])}
                  className="auth-demo-pill"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                >
                  1ª Fase: Análise Doc (00122)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadDemo(INITIAL_CANDIDATURAS_CONSULTA[4])}
                  className="auth-demo-pill"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                >
                  3ª Fase: Admitido (00311)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadDemo(INITIAL_CANDIDATURAS_CONSULTA[5])}
                  className="auth-demo-pill"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                >
                  3ª Fase: Suplente (00445)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadDemo(INITIAL_CANDIDATURAS_CONSULTA[2])}
                  className="auth-demo-pill"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                >
                  Excluído Doc (00567)
                </button>
              </div>
            </div>
          </div>

          {/* RESULTADO DA PESQUISA INDIVIDUAL */}
          {searchResult && (
            <div className="consulta-result-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span 
                      style={{ 
                        backgroundColor: getStatusBadge(searchResult.status).bg, 
                        color: getStatusBadge(searchResult.status).color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {getStatusBadge(searchResult.status).icon}
                      {getStatusBadge(searchResult.status).label}
                    </span>
                    <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
                      Protocolo: <strong>{searchResult.codigoCandidatura}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--portal-text-main)' }}>
                    {searchResult.nomeCompleto}
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--portal-gold)', fontWeight: 700 }}>
                    {searchResult.vagaTitulo}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-draft"
                  style={{ padding: '0.5rem 0.9rem' }}
                >
                  <Printer size={16} />
                  <span>Imprimir Ficha</span>
                </button>
              </div>

              {/* TIMELINE VISUAL DE PROGRESSÃO (ESTRUTURA OFICIAL DE 3 ETAPAS) */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--portal-text-main)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                    Etapas Oficiais do Concurso Público SERNIC
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--portal-text-muted)', fontWeight: 700 }}>
                    {searchResult.status === 'Em Análise Documental' || searchResult.status === 'Em análise' ? 'Fase Actual: 1 de 3 (Avaliação Documental)' :
                     searchResult.status === 'Entrevista Profissional' || searchResult.status === 'Convocada para provas' ? 'Fase Actual: 2 de 3 (Entrevista Profissional)' :
                     'Fase Actual: 3 de 3 (Deliberação Final)'}
                  </span>
                </div>
                
                <div className="status-timeline three-steps">
                  <div className="timeline-line" />

                  {/* ETAPA 1: AVALIAÇÃO DOCUMENTAL */}
                  <div className={`timeline-step ${
                    (searchResult.status === 'Excluído' || searchResult.status === 'Excluída') && searchResult.faseAtual === 1 
                      ? 'excluido' 
                      : searchResult.status === 'Em Análise Documental' || searchResult.status === 'Em análise' || searchResult.status === 'Submetida' 
                      ? 'active' 
                      : 'done'
                  }`}>
                    <div className="timeline-circle">1</div>
                    <span className="timeline-label">1ª Fase: Avaliação Documental</span>
                    <span className="timeline-subtext">
                      {(searchResult.status === 'Excluído' || searchResult.status === 'Excluída') && searchResult.faseAtual === 1 
                        ? 'Não Admitido' 
                        : searchResult.status === 'Em Análise Documental' || searchResult.status === 'Em análise' || searchResult.status === 'Submetida' 
                        ? 'Em Triagem' 
                        : 'Aprovado ✓'}
                    </span>
                  </div>

                  {/* ETAPA 2: ENTREVISTA PROFISSIONAL */}
                  <div className={`timeline-step ${
                    searchResult.status === 'Em Análise Documental' || searchResult.status === 'Em análise' || searchResult.status === 'Submetida' 
                      ? '' 
                      : searchResult.status === 'Entrevista Profissional' || searchResult.status === 'Convocada para provas' 
                      ? 'active' 
                      : (searchResult.status === 'Excluído' || searchResult.status === 'Excluída') && searchResult.faseAtual === 2 
                      ? 'excluido' 
                      : 'done'
                  }`}>
                    <div className="timeline-circle">2</div>
                    <span className="timeline-label">2ª Fase: Entrevista Profissional</span>
                    <span className="timeline-subtext">
                      {searchResult.status === 'Em Análise Documental' || searchResult.status === 'Em análise' || searchResult.status === 'Submetida' 
                        ? 'Aguardando 1ª Fase' 
                        : searchResult.status === 'Entrevista Profissional' || searchResult.status === 'Convocada para provas' 
                        ? 'Convocado' 
                        : (searchResult.status === 'Excluído' || searchResult.status === 'Excluída') && searchResult.faseAtual === 2 
                        ? 'Não Apurado' 
                        : 'Aprovado ✓'}
                    </span>
                  </div>

                  {/* ETAPA 3: DELIBERAÇÃO FINAL */}
                  <div className={`timeline-step ${
                    searchResult.status === 'Admitido' || searchResult.status === 'Admitida' || searchResult.status === 'Aprovada'
                      ? 'done'
                      : searchResult.status === 'Aprovado (Suplente)'
                      ? 'suplente'
                      : searchResult.status === 'Excluído' || searchResult.status === 'Excluída'
                      ? 'excluido'
                      : ''
                  }`}>
                    <div className="timeline-circle">3</div>
                    <span className="timeline-label">3ª Fase: Deliberação Final</span>
                    <span className="timeline-subtext">
                      {searchResult.status === 'Admitido' || searchResult.status === 'Admitida' || searchResult.status === 'Aprovada'
                        ? 'Admitido(a) 🎉'
                        : searchResult.status === 'Aprovado (Suplente)'
                        ? 'Suplente (Reserva)'
                        : searchResult.status === 'Excluído' || searchResult.status === 'Excluída'
                        ? 'Excluído'
                        : 'Aguardando'}
                    </span>
                  </div>
                </div>
              </div>

              {/* DETALHES ESPECÍFICOS DO ESTADO ATUAL */}
              <div style={{ backgroundColor: 'var(--portal-card-inner)', border: '1px solid var(--portal-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--portal-text-main)', margin: 0 }}>
                    {searchResult.detalhesFase?.titulo || 'Informações Oficiais do Processo'}
                  </h4>
                  {searchResult.deliberacaoJuri?.notaFinal && (
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, padding: '0.2rem 0.65rem', borderRadius: '6px', background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', border: '1px solid rgba(22, 163, 74, 0.25)' }}>
                      Nota da Entrevista: {searchResult.deliberacaoJuri.notaFinal} Valores
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--portal-text-muted)', lineHeight: 1.6, marginBottom: '1.2rem' }}>
                  {searchResult.detalhesFase?.mensagemComissao}
                </p>

                {/* Se Convocado para Entrevista Profissional: Informações de data e local */}
                {(searchResult.status === 'Entrevista Profissional' || searchResult.status === 'Convocada para provas') && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', backgroundColor: 'var(--portal-card-bg)', padding: '1.1rem', borderRadius: '10px', border: '1px solid var(--portal-border)' }}>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>Data e Horário da Entrevista</span>
                      <strong style={{ display: 'block', fontSize: '0.94rem', color: '#1e40af', marginTop: '0.2rem' }}>
                        {searchResult.detalhesFase?.dataEvento || '15 de Novembro de 2026 às 08h30'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>Local da Entrevista com o Júri</span>
                      <strong style={{ display: 'block', fontSize: '0.94rem', color: 'var(--portal-text-main)', marginTop: '0.2rem' }}>
                        {searchResult.detalhesFase?.local || 'Gabinete Provincial de Entrevistas do SERNIC'}
                      </strong>
                    </div>

                    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--portal-border)', paddingTop: '0.75rem', fontSize: '0.82rem', color: 'var(--portal-text-muted)' }}>
                      <strong>Instruções Obrigatórias:</strong> {searchResult.detalhesFase?.observacoes || 'Apresentação com Bilhete de Identidade original e comprovativo impresso de inscrição.'}
                    </div>
                  </div>
                )}

                {/* Se Admitido para Provimento Efetivo */}
                {(searchResult.status === 'Admitido' || searchResult.status === 'Admitida' || searchResult.status === 'Aprovada') && (
                  <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '1rem 1.25rem', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Award size={22} color="#15803d" style={{ flexShrink: 0 }} />
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#15803d', display: 'block' }}>
                          Provimento Efetivo Autorizado
                        </strong>
                        <p style={{ fontSize: '0.85rem', color: '#166534', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                          O candidato concluiu com mérito todas as etapas eliminatórias (avaliação documental e entrevista profissional). Deverá aguardar publicação do aviso de tomada de posse.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Se Aprovado como Suplente */}
                {searchResult.status === 'Aprovado (Suplente)' && (
                  <div style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.3)', padding: '1rem 1.25rem', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <CheckCircle2 size={22} color="#b45309" style={{ flexShrink: 0 }} />
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#b45309', display: 'block' }}>
                          Candidato Aprovado na Bolsa de Reserva / Suplência
                        </strong>
                        <p style={{ fontSize: '0.85rem', color: '#92400e', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                          Aprovado na entrevista profissional com classificação positiva. Mantém prioridade de chamada durante o período de validade do concurso para eventuais vagas remanescentes ou desistências.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Se Excluído: Motivo Legal */}
                {(searchResult.status === 'Excluído' || searchResult.status === 'Excluída') && (
                  <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fecaca', padding: '1rem 1.25rem', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <ShieldAlert size={22} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#b91c1c', display: 'block', marginBottom: '0.2rem' }}>
                          Fundamento Legal da Não Admissão / Exclusão:
                        </strong>
                        <p style={{ fontSize: '0.86rem', color: '#7f1d1d', lineHeight: 1.5, margin: 0 }}>
                          {searchResult.detalhesFase?.motivoExclusao || searchResult.deliberacaoJuri?.motivoExclusao || 'Inconformidade com os requisitos formais expressos no edital de concurso.'}
                        </p>
                        <span style={{ display: 'block', marginTop: '0.45rem', fontSize: '0.78rem', color: '#991b1b', fontStyle: 'italic' }}>
                          Prazo de recurso administrativo: 5 (cinco) dias úteis contados a partir da notificação oficial.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* HISTÓRICO DE AUDITORIA DO PROCESSO */}
              {searchResult.historico && (
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--portal-text-main)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.8rem' }}>
                    Histórico de Actos Administrativos
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {searchResult.historico.map((h, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', padding: '0.5rem 0', borderBottom: '1px solid var(--portal-border)' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--portal-text-muted)', width: '90px', flexShrink: 0 }}>
                          {h.data}
                        </span>
                        <strong style={{ color: 'var(--portal-text-main)', width: '180px', flexShrink: 0 }}>
                          {h.etapa}
                        </strong>
                        <span style={{ color: 'var(--portal-text-muted)' }}>
                          {h.descricao}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          ABA 2: LISTAS PÚBLICAS PUBLICADAS
          ======================================================== */}
      {activeTab === 'listas' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="filter-tabs-bar" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`filter-tab-btn ${filterTipoLista === 'todos' ? 'active' : ''}`}
                onClick={() => setFilterTipoLista('todos')}
              >
                <FileText size={14} />
                <span>Todas as Listas ({INITIAL_LISTAS_PUBLICADAS.length})</span>
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${filterTipoLista === 'Admitidos' ? 'active' : ''}`}
                onClick={() => setFilterTipoLista('Admitidos')}
              >
                <CheckCircle2 size={14} />
                <span>Admitidos</span>
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${filterTipoLista === 'Convocados' ? 'active' : ''}`}
                onClick={() => setFilterTipoLista('Convocados')}
              >
                <Calendar size={14} />
                <span>Convocatórias</span>
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${filterTipoLista === 'Excluídos' ? 'active' : ''}`}
                onClick={() => setFilterTipoLista('Excluídos')}
              >
                <XCircle size={14} />
                <span>Excluídos</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredListas.map(lista => (
              <div 
                key={lista.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.4rem 1.6rem',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span 
                      style={{
                        backgroundColor: lista.tipo === 'Admitidos' ? '#dcfce7' : (lista.tipo === 'Convocados' ? '#dbeafe' : '#fee2e2'),
                        color: lista.tipo === 'Admitidos' ? '#15803d' : (lista.tipo === 'Convocados' ? '#1e40af' : '#b91c1c'),
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {lista.tipo}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {lista.edital} • Publicado a {new Date(lista.dataPublicacao).toLocaleDateString('pt-MZ')}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '0.3rem' }}>
                    {lista.tituloLista}
                  </h4>

                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>
                    {lista.observacoes}
                  </p>

                  <span style={{ fontSize: '0.78rem', color: '#b0891e', fontWeight: 700 }}>
                    Total abrangido: {lista.totalCandidatos} candidatos
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    type="button"
                    className="btn-vaga-candidatar"
                    onClick={() => setViewListaModal(lista)}
                    style={{ padding: '0.6rem 1.1rem', fontSize: '0.84rem' }}
                  >
                    <Download size={16} />
                    <span>Descarregar Edital (PDF)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE LISTA EM PDF SIMULADO */}
      {viewListaModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewListaModal(null);
          }}
        >
          <DraggableSubAba 
            className="modal-content-card" 
            moveHandleLabel="Mover Relação Oficial"
            onClose={() => setViewListaModal(null)}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Documento Oficial</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--portal-text-main)', margin: '0.4rem 0' }}>
                {viewListaModal.tituloLista}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#b0891e', fontWeight: 700 }}>
                {viewListaModal.arquivoNome} ({viewListaModal.arquivoTamanho})
              </p>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              O ficheiro contém a relação nominal completa dos {viewListaModal.totalCandidatos} candidatos homologados pela Comissão do Concurso SERNIC, indicando os números de protocolo, salas de prova e horários de comparência.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button
                type="button"
                className="btn-draft"
                onClick={() => setViewListaModal(null)}
              >
                Fechar
              </button>
              <button
                type="button"
                className="btn-vaga-candidatar"
                onClick={() => {
                  window.print();
                  setViewListaModal(null);
                }}
              >
                <Printer size={16} />
                <span>Imprimir / Salvar Cópia Oficial</span>
              </button>
            </div>
          </DraggableSubAba>
        </div>,
        document.body
      )}
    </div>
  );
}
