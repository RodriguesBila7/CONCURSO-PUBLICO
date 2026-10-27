import React from 'react';
import { 
  Briefcase, 
  FileText, 
  Search, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  ShieldAlert, 
  FileDown, 
  Award,
  ShieldCheck,
  Layers
} from 'lucide-react';
import sernicLogo from '../assets/sernic-logo.png';

export default function PortalHome({ navigate, vagasCount = 4, publishedListsCount = 4, currentUser }) {
  const isGestor = currentUser?.role === 'admin' || currentUser?.role === 'gestor';

  return (
    <div className="portal-home-container">
      {/* AVISO INSTITUCIONAL EXCLUSIVO PARA O GESTOR QUANDO ESTIVER NA VISÃO PÚBLICA */}
      {isGestor && (
        <div style={{
          marginBottom: '1.2rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: '#fff1f2',
          border: '1.5px solid #fda4af',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(195, 32, 38, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#c32026', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#9f1239', fontSize: '0.92rem' }}>
                Sessão do Júri / Gestor Activa: {currentUser.name}
              </div>
              <div style={{ color: '#be123c', fontSize: '0.8rem' }}>
                Está na perspectiva pública dos candidatos. Pode regressar ao Painel de Gestão e Triagem a qualquer momento.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/portal-gestor')}
            style={{
              backgroundColor: '#c32026',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(195, 32, 38, 0.25)',
              whiteSpace: 'nowrap'
            }}
          >
            <Layers size={16} />
            <span>Ir para o Painel Geral do Júri</span>
          </button>
        </div>
      )}

      {/* 1. HERO BANNER PRINCIPAL COM FEIXE LUMINOSO CIRCULANDO (CORES DO SERNIC) */}
      <div className="portal-hero-wrapper">
        {/* Feixe animado que circula continuamente ao redor da aba com as cores oficiais do SERNIC */}
        <div className="portal-hero-beam" aria-hidden="true" />

        <section className="portal-hero-banner">
          {/* Barra Luminosa Superior Dinâmica com Cores do SERNIC */}
          <div className="portal-hero-top-glow-bar" aria-hidden="true" />

          {/* Marca de Água Oficial do Logótipo SERNIC */}
          <img 
            src={sernicLogo} 
            alt="" 
            className="portal-hero-watermark" 
            aria-hidden="true" 
          />

          <div className="portal-hero-content">
            <h2 className="portal-hero-title">
              PORTAL DE RECRUTAMENTO
            </h2>

            <p className="portal-hero-desc">
              Bem-vindo(a) à plataforma oficial de submissão, gestão e acompanhamento de candidaturas 
              ao Serviço Nacional de Investigação Criminal (SERNIC) da República de Moçambique. 
              Escolha um dos módulos abaixo para consultar vagas, submeter o seu processo ou acompanhar o estado da sua candidatura.
            </p>

            {/* Indicadores Institucionais */}
            <div className="portal-hero-metrics">
              <div className="portal-metric-item">
                <CheckCircle2 size={18} color="#fde047" />
                <span>Concursos Abertos: <strong>{vagasCount} Carreiras</strong></span>
              </div>

              <div className="portal-metric-item">
                <Award size={18} color="#fde047" />
                <span>Vagas Disponíveis: <strong>220 Vagas</strong></span>
              </div>

              <div className="portal-metric-item">
                <Calendar size={18} color="#fde047" />
                <span>Inscrições: <strong>Ano Judicial 2026</strong></span>
              </div>

              <div className="portal-metric-item">
                <FileDown size={18} color="#fde047" />
                <span>Listas Publicadas: <strong>{publishedListsCount} Editais</strong></span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 2. GRELHA DE 4 MÓDULOS (COM EFEITO LUMINOSO AO PASSAR O RATO OU CLICAR + MODO VIDRO) */}
      <div className="modules-grid">
        {/* MÓDULO 1: RECRUTAMENTO */}
        <div 
          className="module-card-wrapper"
          onClick={() => navigate('/portal-recrutamento/recrutamento')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/portal-recrutamento/recrutamento'); }}
        >
          {/* Barra de Efeito Luminoso Circulando com Cores do SERNIC no Hover / Click */}
          <div className="module-card-beam" aria-hidden="true" />

          <div className="module-card-inner">
            <div>
              <div className="module-card-header">
                <div className="module-icon-wrap">
                  <Briefcase size={28} />
                </div>
                <span className="module-badge badge-recrutamento">
                  Vagas & Editais
                </span>
              </div>

              <h3 className="module-title">1. Recrutamento</h3>
              
              <p className="module-description">
                Lista dos concursos e vagas abertos: Investigador Criminal, Perito Forense, 
                Cibersegurança e Medicina Legal. Consulte requisitos gerais e específicos, 
                número de vagas, prazos e descarregue os editais oficiais em PDF.
              </p>
            </div>

            <div className="module-action-link">
              <span>Ver Concursos e Editais</span>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>

        {/* MÓDULO 2: CANDIDATURA */}
        <div 
          className="module-card-wrapper"
          onClick={() => navigate('/portal-recrutamento/candidatura')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/portal-recrutamento/candidatura'); }}
        >
          <div className="module-card-beam" aria-hidden="true" />

          <div className="module-card-inner">
            <div>
              <div className="module-card-header">
                <div className="module-icon-wrap">
                  <FileText size={28} />
                </div>
                <span className="module-badge badge-candidatura">
                  Inscrição Online
                </span>
              </div>

              <h3 className="module-title">2. Candidatura</h3>
              
              <p className="module-description">
                Formulário guiado em etapas (stepper): dados pessoais, habilitações literárias, 
                contactos e anexação de documentos (BI, certificado, CV, foto tipo passe). 
                Permite gravar rascunho e emite o comprovativo oficial com número de protocolo único.
              </p>
            </div>

            <div className="module-action-link">
              <span>Preencher Candidatura</span>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>

        {/* MÓDULO 3: CONSULTA */}
        <div 
          className="module-card-wrapper"
          onClick={() => navigate('/portal-recrutamento/consulta')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/portal-recrutamento/consulta'); }}
        >
          <div className="module-card-beam" aria-hidden="true" />

          <div className="module-card-inner">
            <div>
              <div className="module-card-header">
                <div className="module-icon-wrap">
                  <Search size={28} />
                </div>
                <span className="module-badge badge-consulta">
                  Estado & Resultados
                </span>
              </div>

              <h3 className="module-title">3. Consulta</h3>
              
              <p className="module-description">
                Pesquise o estado da sua candidatura através do seu número de protocolo e BI. 
                Visualize a linha do tempo (Submetida, Em Análise, Admitida, Convocada ou Excluída) 
                e consulte as listas oficiais publicadas de apurados e convocados para provas.
              </p>
            </div>

            <div className="module-action-link">
              <span>Consultar Estado ou Listas</span>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>

        {/* MÓDULO 4: LOGIN / ÁREA PESSOAL */}
        <div 
          className="module-card-wrapper"
          onClick={() => navigate('/portal-recrutamento/login')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/portal-recrutamento/login'); }}
        >
          <div className="module-card-beam" aria-hidden="true" />

          <div className="module-card-inner">
            <div>
              <div className="module-card-header">
                <div className="module-icon-wrap">
                  <UserCheck size={28} />
                </div>
                <span className="module-badge badge-login">
                  Área do Candidato
                </span>
              </div>

              <h3 className="module-title">4. Login do Candidato</h3>
              
              <p className="module-description">
                Autenticação segura com e-mail ou BI e palavra-passe. Aceda à sua área pessoal, 
                consulte o histórico dos seus processos submetidos, actualize dados de contacto, 
                emita segunda via de comprovativos e receba avisos do júri de recrutamento.
              </p>
            </div>

            <div className="module-action-link">
              <span>Aceder à Área Pessoal</span>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>



      {/* 3. AVISO INSTITUCIONAL DE PRAZOS E SEGURANÇA */}
      <div 
        style={{
          backgroundColor: 'var(--portal-card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--portal-border)',
          padding: '1.4rem 1.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.2rem',
          boxShadow: 'var(--portal-shadow)',
          transition: 'all 0.3s ease'
        }}
      >
        <div 
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: 'rgba(197, 155, 39, 0.15)',
            color: 'var(--portal-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <ShieldAlert size={24} />
        </div>
        <div>
          <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '0.2rem' }}>
            Nota de Esclarecimento sobre o Processo de Recrutamento SERNIC
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--portal-text-muted)', lineHeight: 1.5 }}>
            A inscrição em qualquer concurso público do SERNIC é estritamente pessoal e gratuita. 
            Não efetue qualquer pagamento a terceiros. Em caso de dúvidas técnicas com a submissão online, 
            contacte o suporte da Direcção de Recursos Humanos através do e-mail <strong>recrutamento@sernic.gov.mz</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
