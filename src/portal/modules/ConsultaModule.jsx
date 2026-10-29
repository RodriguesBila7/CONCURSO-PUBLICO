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
  FileText,
  Sparkles,
  ShieldCheck,
  Award,
  FileCheck
} from 'lucide-react';
import { 
  INITIAL_CANDIDATURAS_CONSULTA, 
  INITIAL_LISTAS_PUBLICADAS,
  getStoredCandidaturas,
  getStoredListasPublicadas,
  getCandidatePhotoUrl,
  detectCandidateGender,
  getGenderText
} from '../mockData';
import DraggableSubAba from '../components/DraggableSubAba';
import ComprovativoInscricaoDocument from '../components/ComprovativoInscricaoDocument';

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
  const [showComprovativoModal, setShowComprovativoModal] = useState(false);

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

  // Obter classe e ícone do estado com flexão inteligente de gênero (Convocada / Convocado)
  const getStatusBadge = (status, candidate) => {
    const isFem = detectCandidateGender(candidate) === 'Feminino';
    const isPendenteHomologacao = Boolean(
      (candidate?.homologadoPrincipal === false && candidate?.publicadoAoCandidato === false) ||
      (candidate?.parecerJuriPendente && !candidate?.homologadoPrincipal)
    );

    if (isPendenteHomologacao) {
      return {
        bg: '#eff6ff',
        color: '#1e40af',
        icon: <Clock size={16} />,
        label: 'Em Instrução pela Comissão de Júri (Aguardando Homologação DRH)'
      };
    }

    switch (status) {
      case 'Aprovado na Análise Documental':
      case 'Aprovada na Análise Documental':
      case 'Admitido na Análise Documental':
      case 'Admitida na Análise Documental':
        return { 
          bg: '#ecfdf5', 
          color: '#047857', 
          icon: <CheckCircle2 size={16} />, 
          label: isFem ? '1ª Fase: Aprovada na Análise Documental' : '1ª Fase: Aprovado na Análise Documental' 
        };
      case 'Reprovado na Análise Documental':
      case 'Reprovada na Análise Documental':
      case 'Excluído na Análise Documental':
      case 'Excluída na Análise Documental':
        return { 
          bg: '#fee2e2', 
          color: '#dc2626', 
          icon: <XCircle size={16} />, 
          label: isFem ? '1ª Fase: Reprovada na Análise Documental' : '1ª Fase: Reprovado na Análise Documental' 
        };
      case 'Convocado para Teste Escrito':
      case 'Convocada para Teste Escrito':
        return { 
          bg: '#dbeafe', 
          color: '#1e40af', 
          icon: <Calendar size={16} />, 
          label: isFem ? '2ª Fase: Convocada para Teste Escrito' : '2ª Fase: Convocado para Teste Escrito' 
        };
      case 'Aprovado no Teste Escrito':
      case 'Aprovada no Teste Escrito':
        return { 
          bg: '#ecfdf5', 
          color: '#047857', 
          icon: <CheckCircle2 size={16} />, 
          label: isFem ? '3ª Fase: Aprovada no Teste Escrito' : '3ª Fase: Aprovado no Teste Escrito' 
        };
      case 'Reprovado no Teste Escrito':
      case 'Reprovada no Teste Escrito':
        return { 
          bg: '#fee2e2', 
          color: '#dc2626', 
          icon: <XCircle size={16} />, 
          label: isFem ? '3ª Fase: Reprovada no Teste Escrito (< 10 val)' : '3ª Fase: Reprovado no Teste Escrito (< 10 val)' 
        };
      case 'Convocado para Entrevista Profissional':
      case 'Convocada para Entrevista Profissional':
      case 'Entrevista Profissional':
      case 'Convocada para provas':
      case 'Convocado para provas':
        return { 
          bg: '#dbeafe', 
          color: '#1e40af', 
          icon: <Calendar size={16} />, 
          label: isFem ? '4ª Fase: Convocada para Entrevista Profissional' : '4ª Fase: Convocado para Entrevista Profissional' 
        };
      case 'Reprovado na Entrevista':
      case 'Reprovada na Entrevista':
      case 'Excluído na Entrevista':
      case 'Excluída na Entrevista':
        return { 
          bg: '#fef2f2', 
          color: '#991b1b', 
          icon: <XCircle size={16} />, 
          label: isFem ? '4ª Fase: Reprovada na Entrevista (< 10 val)' : '4ª Fase: Reprovado na Entrevista (< 10 val)' 
        };
      case 'Admitido':
      case 'Admitida':
      case 'Aprovada':
        return { 
          bg: '#dcfce7', 
          color: '#15803d', 
          icon: <Award size={16} />, 
          label: isFem ? '4ª Fase: Candidata Admitida (Vaga Efetiva)' : '4ª Fase: Candidato Admitido (Vaga Efetiva)' 
        };
      case 'Aprovado (Suplente)':
      case 'Aprovada (Suplente)':
        return { 
          bg: '#fef9c3', 
          color: '#854d0e', 
          icon: <CheckCircle2 size={16} />, 
          label: isFem ? '4ª Fase: Aprovada - Suplente (Lista de Reserva)' : '4ª Fase: Aprovado - Suplente (Lista de Reserva)' 
        };
      case 'Excluído':
      case 'Excluída':
        return { 
          bg: '#fee2e2', 
          color: '#c32026', 
          icon: <XCircle size={16} />, 
          label: isFem ? 'Candidata Excluída do Concurso' : 'Candidato Excluído do Concurso' 
        };
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
                  placeholder="Ex: 000000000000M"
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <div className="consulta-avatar-wrap">
                    <img 
                      src={searchResult.fotoUrl || getCandidatePhotoUrl(searchResult.genero, 0)} 
                      alt={searchResult.nomeCompleto}
                      className="consulta-avatar-round"
                    />
                    <span className="consulta-ai-badge" title="Biometria Facial e Iluminação Homologadas pelo SERNIC VisionAI">
                      <Sparkles size={11} />
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span 
                        style={{ 
                          backgroundColor: getStatusBadge(searchResult.status, searchResult).bg, 
                          color: getStatusBadge(searchResult.status, searchResult).color,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        {getStatusBadge(searchResult.status, searchResult).icon}
                        {getStatusBadge(searchResult.status, searchResult).label}
                      </span>
                      <span style={{ fontSize: '0.84rem', color: 'var(--portal-text-muted)' }}>
                        Protocolo: <strong>{searchResult.codigoCandidatura}</strong>
                      </span>
                      <span className="biometric-chip-verified">
                        <ShieldCheck size={12} /> Foto Homologada ({detectCandidateGender(searchResult) === 'Feminino' ? 'Candidata' : 'Candidato'})
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--portal-text-main)' }}>
                      {searchResult.nomeCompleto}
                    </h3>
                    <p style={{ fontSize: '0.92rem', color: 'var(--portal-gold)', fontWeight: 700 }}>
                      {searchResult.vagaTitulo}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setShowComprovativoModal(true)}
                    className="btn-vaga-candidatar"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.84rem' }}
                  >
                    <FileCheck size={16} />
                    <span>Comprovativo Oficial</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-draft"
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.84rem' }}
                  >
                    <Printer size={16} />
                    <span>Imprimir Ficha</span>
                  </button>
                </div>
              </div>

              {/* TIMELINE VISUAL DE PROGRESSÃO (ESTRUTURA REGULAMENTAR DE 4 FASES) */}
              {(() => {
                const isDelibFem = detectCandidateGender(searchResult) === 'Feminino';
                const isPendenteHomologacao = Boolean(
                  (searchResult.homologadoPrincipal === false && searchResult.publicadoAoCandidato === false) ||
                  (searchResult.parecerJuriPendente && !searchResult.homologadoPrincipal)
                );

                const candFase = isPendenteHomologacao ? 1 : (searchResult.faseAtual || (
                  (searchResult.status === 'Em Análise Documental' || searchResult.status === 'Em análise' || searchResult.status === 'Submetida') ? 1 :
                  (searchResult.status === 'Aprovado na Análise Documental' || searchResult.status === 'Aprovada na Análise Documental' || searchResult.status === 'Admitido na Análise Documental' || searchResult.status === 'Admitida na Análise Documental') ? 2 :
                  (searchResult.status === 'Convocado para Teste Escrito' || searchResult.status === 'Convocada para Teste Escrito') ? 3 :
                  4
                ));

                const isFase1Reprovado = !isPendenteHomologacao && searchResult.status?.includes('Análise Documental') && (searchResult.status?.includes('Reprovad') || searchResult.status?.includes('Excluíd'));
                const isFase3Reprovado = !isPendenteHomologacao && searchResult.status?.includes('Teste Escrito') && (searchResult.status?.includes('Reprovad') || searchResult.status?.includes('Excluíd'));
                const isFase4Reprovado = !isPendenteHomologacao && (searchResult.status?.includes('Entrevista') && (searchResult.status?.includes('Reprovad') || searchResult.status?.includes('Excluíd')));
                const isAdmitidoEfetivo = !isPendenteHomologacao && (searchResult.status === 'Admitido' || searchResult.status === 'Admitida' || searchResult.status === 'Aprovada');
                const isSuplente = !isPendenteHomologacao && (searchResult.status === 'Aprovado (Suplente)' || searchResult.status === 'Aprovada (Suplente)');

                return (
                  <>
                    <div style={{ marginBottom: '2.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--portal-text-main)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                          Etapas Oficiais do Concurso Público SERNIC
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--portal-text-muted)', fontWeight: 700 }}>
                          {isPendenteHomologacao ? 'Em Instrução pela Comissão de Júri (Aguardando Homologação DRH)' :
                           candFase === 1 ? 'Fase Atual: 1 de 4 (Análise Documental)' :
                           candFase === 2 ? 'Fase Atual: 2 de 4 (Convocatória)' :
                           candFase === 3 ? 'Fase Atual: 3 de 4 (Teste Escrito)' :
                           'Fase Atual: 4 de 4 (Entrevista Profissional)'}
                        </span>
                      </div>
                      
                      <div className="status-timeline four-steps">
                        <div className="timeline-line" />

                        {/* ETAPA 1: ANÁLISE DOCUMENTAL */}
                        <div className={`timeline-step ${
                          isFase1Reprovado ? 'excluido' : (candFase === 1 ? 'active' : 'done')
                        }`}>
                          <div className="timeline-circle">1</div>
                          <span className="timeline-label">1ª Fase: Análise Documental</span>
                          <span className="timeline-subtext">
                            {isFase1Reprovado 
                              ? (isDelibFem ? 'Reprovada' : 'Reprovado')
                              : (candFase === 1 ? 'Em Avaliação' : (isDelibFem ? 'Aprovada ✓' : 'Aprovado ✓'))}
                          </span>
                        </div>

                        {/* ETAPA 2: CONVOCATÓRIA */}
                        <div className={`timeline-step ${
                          isFase1Reprovado ? '' : (candFase === 2 ? 'active' : (candFase > 2 ? 'done' : ''))
                        }`}>
                          <div className="timeline-circle">2</div>
                          <span className="timeline-label">2ª Fase: Convocatória</span>
                          <span className="timeline-subtext">
                            {isFase1Reprovado ? '—' :
                             candFase === 2 ? 'A decorrer' :
                             candFase > 2 ? (searchResult.haveraExameEscrito === 'nao' ? 'Isento de Exame' : 'Convocado ✓') :
                             'Aguardando 1ª Fase'}
                          </span>
                        </div>

                        {/* ETAPA 3: TESTE ESCRITO */}
                        <div className={`timeline-step ${
                          isFase3Reprovado ? 'excluido' : (candFase === 3 ? 'active' : (candFase > 3 ? 'done' : ''))
                        }`}>
                          <div className="timeline-circle">3</div>
                          <span className="timeline-label">3ª Fase: Teste Escrito</span>
                          <span className="timeline-subtext">
                            {isFase3Reprovado ? (isDelibFem ? 'Reprovada (<10 val)' : 'Reprovado (<10 val)') :
                             searchResult.haveraExameEscrito === 'nao' && candFase >= 3 ? 'Dispensado' :
                             candFase === 3 ? 'Em Realização' :
                             candFase > 3 ? 'Aprovado ✓' : 'Aguardando'}
                          </span>
                        </div>

                        {/* ETAPA 4: ENTREVISTA PROFISSIONAL */}
                        <div className={`timeline-step ${
                          isAdmitidoEfetivo ? 'done' :
                          isSuplente ? 'suplente' :
                          isFase4Reprovado ? 'excluido' :
                          (candFase === 4 ? 'active' : '')
                        }`}>
                          <div className="timeline-circle">4</div>
                          <span className="timeline-label">4ª Fase: Entrevista</span>
                          <span className="timeline-subtext">
                            {isAdmitidoEfetivo ? (isDelibFem ? 'Admitida 🎉' : 'Admitido 🎉') :
                             isSuplente ? 'Suplente (Reserva)' :
                             isFase4Reprovado ? (isDelibFem ? 'Reprovada' : 'Reprovado') :
                             candFase === 4 ? 'Convocado' : 'Aguardando'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DETALHES ESPECÍFICOS DO ESTADO ATUAL */}
                    <div style={{ backgroundColor: 'var(--portal-card-inner)', border: '1px solid var(--portal-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                      {isPendenteHomologacao ? (
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--portal-text-main)', margin: '0 0 0.5rem 0' }}>
                            Processo em Instrução Técnica pela Comissão de Júri
                          </h4>
                          <p style={{ fontSize: '0.92rem', color: 'var(--portal-text-muted)', lineHeight: 1.6, margin: 0 }}>
                            A sua candidatura encontra-se em fase de análise e instrução pela Comissão de Júri. Os resultados e pareceres técnicos estarão oficialmente disponíveis para consulta nesta conta após a homologação definitiva da Direcção de Recursos Humanos (Administrador Principal).
                          </p>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--portal-text-main)', margin: 0 }}>
                              {isAdmitidoEfetivo ? (isDelibFem ? 'Candidata Admitida - Provimento Efetivo de Vaga' : 'Candidato Admitido - Provimento Efetivo de Vaga') :
                               isSuplente ? (isDelibFem ? 'Aprovada na Entrevista - Candidata Suplente (Lista de Reserva)' : 'Aprovado na Entrevista - Candidato Suplente (Lista de Reserva)') :
                               searchResult.status === 'Convocado para Teste Escrito' || searchResult.status === 'Convocada para Teste Escrito' ? '2ª Fase: Convocatória Oficial para Teste Escrito' :
                               searchResult.status === 'Aprovado no Teste Escrito' || searchResult.status === 'Aprovada no Teste Escrito' ? '3ª Fase: Aprovado no Teste Escrito • Convocado para Entrevista' :
                               searchResult.status === 'Convocado para Entrevista Profissional' || searchResult.status === 'Convocada para Entrevista Profissional' || searchResult.status === 'Entrevista Profissional' ? '4ª Fase: Convocatória para Entrevista Profissional' :
                               isFase1Reprovado ? (isDelibFem ? '1ª Fase: Candidata Reprovada na Análise Documental' : '1ª Fase: Candidato Reprovado na Análise Documental') :
                               isFase3Reprovado ? (isDelibFem ? '3ª Fase: Candidata Reprovada no Teste Escrito (< 10 val)' : '3ª Fase: Candidato Reprovado no Teste Escrito (< 10 val)') :
                               isFase4Reprovado ? (isDelibFem ? '4ª Fase: Candidata Reprovada na Entrevista Profissional (< 10 val)' : '4ª Fase: Candidato Reprovado na Entrevista Profissional (< 10 val)') :
                               (searchResult.detalhesFase?.titulo || 'Informações da sua Candidatura')}
                            </h4>

                            {searchResult.deliberacaoJuri?.notaExameEscrito && (
                              <span style={{ 
                                fontSize: '0.85rem', 
                                fontWeight: 800, 
                                padding: '0.2rem 0.65rem', 
                                borderRadius: '6px', 
                                background: parseFloat(searchResult.deliberacaoJuri.notaExameEscrito) >= 10 ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                color: parseFloat(searchResult.deliberacaoJuri.notaExameEscrito) >= 10 ? '#16a34a' : '#dc2626', 
                                border: `1px solid ${parseFloat(searchResult.deliberacaoJuri.notaExameEscrito) >= 10 ? 'rgba(22, 163, 74, 0.25)' : 'rgba(239, 68, 68, 0.25)'}` 
                              }}>
                                Teste Escrito: {searchResult.deliberacaoJuri.notaExameEscrito} val. {parseFloat(searchResult.deliberacaoJuri.notaExameEscrito) >= 10 ? '(Aprovado)' : '(Reprovado)'}
                              </span>
                            )}

                            {searchResult.deliberacaoJuri?.notaFinal && (
                              <span style={{ 
                                fontSize: '0.85rem', 
                                fontWeight: 800, 
                                padding: '0.2rem 0.65rem', 
                                borderRadius: '6px', 
                                background: parseFloat(searchResult.deliberacaoJuri.notaFinal) >= 10 ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                color: parseFloat(searchResult.deliberacaoJuri.notaFinal) >= 10 ? '#16a34a' : '#dc2626', 
                                border: `1px solid ${parseFloat(searchResult.deliberacaoJuri.notaFinal) >= 10 ? 'rgba(22, 163, 74, 0.25)' : 'rgba(239, 68, 68, 0.25)'}` 
                              }}>
                                Entrevista: {searchResult.deliberacaoJuri.notaFinal} val. {parseFloat(searchResult.deliberacaoJuri.notaFinal) >= 10 ? '(Aprovado)' : '(Reprovado)'}
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: '0.92rem', color: 'var(--portal-text-muted)', lineHeight: 1.6, marginBottom: '1.2rem' }}>
                            {searchResult.deliberacaoJuri?.parecer || searchResult.detalhesFase?.mensagemComissao || 'Candidatura em acompanhamento regular pela Direcção de Recursos Humanos.'}
                          </p>

                          {/* Se Convocado para Teste Escrito */}
                          {(searchResult.status === 'Convocado para Teste Escrito' || searchResult.status === 'Convocada para Teste Escrito') && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', backgroundColor: 'var(--portal-card-bg)', padding: '1.1rem', borderRadius: '10px', border: '1px solid var(--portal-border)', marginBottom: '1rem' }}>
                              <div>
                                <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>Dia e Hora do Teste Escrito</span>
                                <strong style={{ display: 'block', fontSize: '0.94rem', color: '#1e40af', marginTop: '0.2rem' }}>
                                  {searchResult.dataExameEscrito || searchResult.detalhesFase?.dataEvento || '20 de Novembro de 2026 às 09h00'}
                                </strong>
                              </div>

                              <div>
                                <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>Local da Direcção Provincial</span>
                                <strong style={{ display: 'block', fontSize: '0.94rem', color: 'var(--portal-text-main)', marginTop: '0.2rem' }}>
                                  {searchResult.localExameEscrito || searchResult.detalhesFase?.local || 'Delegação Provincial do SERNIC'}
                                </strong>
                              </div>

                              <div>
                                <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>Sala de Provas</span>
                                <strong style={{ display: 'block', fontSize: '0.94rem', color: 'var(--portal-text-main)', marginTop: '0.2rem' }}>
                                  {searchResult.salaExameEscrito || 'Sala de Provas n.º 01'}
                                </strong>
                              </div>

                              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--portal-border)', paddingTop: '0.75rem', fontSize: '0.82rem', color: 'var(--portal-text-muted)' }}>
                                <strong>Recomendações:</strong> Apresentar-se com Bilhete de Identidade original e esferográfica azul ou preta com 30 minutos de antecedência.
                              </div>
                            </div>
                          )}

                          {/* Se Convocado para Entrevista Profissional */}
                          {(searchResult.status === 'Convocado para Entrevista Profissional' || searchResult.status === 'Convocada para Entrevista Profissional' || searchResult.status === 'Entrevista Profissional' || searchResult.status === 'Aprovado no Teste Escrito' || searchResult.status === 'Aprovada no Teste Escrito') && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', backgroundColor: 'var(--portal-card-bg)', padding: '1.1rem', borderRadius: '10px', border: '1px solid var(--portal-border)', marginBottom: '1rem' }}>
                              <div>
                                <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>Dia e Hora da Entrevista</span>
                                <strong style={{ display: 'block', fontSize: '0.94rem', color: '#1e40af', marginTop: '0.2rem' }}>
                                  {searchResult.detalhesFase?.dataEvento || searchResult.deliberacaoJuri?.eventoData || '25 de Novembro de 2026 às 08h30'}
                                </strong>
                              </div>

                              <div>
                                <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>Local da Entrevista</span>
                                <strong style={{ display: 'block', fontSize: '0.94rem', color: 'var(--portal-text-main)', marginTop: '0.2rem' }}>
                                  {searchResult.detalhesFase?.local || searchResult.deliberacaoJuri?.eventoLocal || `Gabinete Provincial de Entrevistas do SERNIC - ${searchResult.provincia || 'Maputo'}`}
                                </strong>
                              </div>

                              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--portal-border)', paddingTop: '0.75rem', fontSize: '0.82rem', color: 'var(--portal-text-muted)' }}>
                                <strong>O que levar:</strong> Apresentação com Bilhete de Identidade original e o comprovativo de inscrição emitido.
                              </div>
                            </div>
                          )}

                          {/* Se Admitido para Provimento Efetivo */}
                          {isAdmitidoEfetivo && (
                            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <Award size={22} color="#15803d" style={{ flexShrink: 0 }} />
                                <div>
                                  <strong style={{ fontSize: '0.92rem', color: '#15803d', display: 'block' }}>
                                    {isDelibFem ? 'Candidata Admitida com Sucesso!' : 'Candidato Admitido com Sucesso!'}
                                  </strong>
                                  <p style={{ fontSize: '0.85rem', color: '#166534', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                                    {isDelibFem
                                      ? 'Parabéns! Concluiu todas as fases com aproveitamento e foi selecionada para provimento da vaga conforme a ordem de classificação do Edital.'
                                      : 'Parabéns! Concluiu todas as fases com aproveitamento e foi selecionado para provimento da vaga conforme a ordem de classificação do Edital.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Se Aprovado como Suplente */}
                          {isSuplente && (
                            <div style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.3)', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <CheckCircle2 size={22} color="#b45309" style={{ flexShrink: 0 }} />
                                <div>
                                  <strong style={{ fontSize: '0.92rem', color: '#b45309', display: 'block' }}>
                                    {isDelibFem ? 'Aprovada como Suplente (Lista de Reserva)' : 'Aprovado como Suplente (Lista de Reserva)'}
                                  </strong>
                                  <p style={{ fontSize: '0.85rem', color: '#92400e', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                                    {isDelibFem
                                      ? 'Obteve aproveitamento positivo e integra a lista oficial de suplentes para preenchimento de vagas remanescentes.'
                                      : 'Obteve aproveitamento positivo e integra a lista oficial de suplentes para preenchimento de vagas remanescentes.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Se Excluído ou Reprovado */}
                          {(isFase1Reprovado || isFase3Reprovado || isFase4Reprovado || searchResult.status?.includes('Excluíd') || searchResult.status?.includes('Reprovad')) && (
                            <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fecaca', padding: '1rem 1.25rem', borderRadius: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                                <ShieldAlert size={22} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                  <strong style={{ fontSize: '0.92rem', color: '#b91c1c', display: 'block', marginBottom: '0.2rem' }}>
                                    Motivo da Reprovação / Exclusão:
                                  </strong>
                                  <p style={{ fontSize: '0.86rem', color: '#7f1d1d', lineHeight: 1.5, margin: 0 }}>
                                    {searchResult.detalhesFase?.motivoExclusao || searchResult.deliberacaoJuri?.motivoExclusao || 'A candidatura não cumpriu os requisitos obrigatórios do Edital.'}
                                  </p>
                                  <span style={{ display: 'block', marginTop: '0.45rem', fontSize: '0.78rem', color: '#991b1b' }}>
                                    Fundamento Estatutário SERNIC: Dispõe de 5 dias úteis para submeter pedido formal de recurso junto à Direcção de Recursos Humanos.
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* HISTÓRICO DO PROCESSO */}
              {searchResult.historico && (
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--portal-text-main)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.8rem' }}>
                    Histórico do Processo
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {searchResult.historico.map((h, i) => {
                      const isFem = detectCandidateGender(searchResult) === 'Feminino';
                      let desc = h.descricao || '';
                      let etapa = h.etapa || '';
                      if (isFem) {
                        desc = desc
                          .replace(/Convocado para a Entrevista/g, 'Convocada para a Entrevista')
                          .replace(/Convocado para Entrevista/g, 'Convocada para Entrevista')
                          .replace(/Candidato Admitido/g, 'Candidata Admitida')
                          .replace(/Aprovado na Entrevista/g, 'Aprovada na Entrevista');
                        etapa = etapa
                          .replace(/Candidato Admitido/g, 'Candidata Admitida');
                      }
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', padding: '0.5rem 0', borderBottom: '1px solid var(--portal-border)' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--portal-text-muted)', width: '90px', flexShrink: 0 }}>
                            {h.data}
                          </span>
                          <strong style={{ color: 'var(--portal-text-main)', width: '180px', flexShrink: 0 }}>
                            {etapa}
                          </strong>
                          <span style={{ color: 'var(--portal-text-muted)' }}>
                            {desc}
                          </span>
                        </div>
                      );
                    })}
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
                  border: '1px solid var(--portal-border)',
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
                    <span style={{ fontSize: '0.78rem', color: 'var(--portal-text-muted)' }}>
                      {lista.edital} • Publicado a {new Date(lista.dataPublicacao).toLocaleDateString('pt-MZ')}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '0.3rem' }}>
                    {lista.tituloLista}
                  </h4>

                  <p style={{ fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.4rem' }}>
                    {lista.observacoes}
                  </p>

                  <span style={{ fontSize: '0.78rem', color: 'var(--portal-gold)', fontWeight: 700 }}>
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
              <p style={{ fontSize: '0.82rem', color: 'var(--portal-gold)', fontWeight: 700 }}>
                {viewListaModal.arquivoNome} ({viewListaModal.arquivoTamanho})
              </p>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--portal-text-sub)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
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

      {/* MODAL DO COMPROVATIVO OFICIAL DE CANDIDATURA */}
      {showComprovativoModal && searchResult && (
        <div 
          className="comprovativo-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowComprovativoModal(false);
          }}
        >
          <div className="comprovativo-modal-container">
            <ComprovativoInscricaoDocument
              candidato={searchResult}
              onClose={() => setShowComprovativoModal(false)}
              showActions={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
