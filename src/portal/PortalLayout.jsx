import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FileText, 
  Search, 
  User, 
  Home, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  LogOut,
  ExternalLink,
  Sun,
  Moon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Users,
  BookOpen,
  History,
  SlidersHorizontal,
  UserCheck,
  CheckCircle2,
  GraduationCap,
  Palette,
  Globe,
  Settings
} from 'lucide-react';
import sernicLogo from '../assets/sernic-logo.png';
import './portal.css';

export default function PortalLayout({ 
  children, 
  currentPath, 
  navigate, 
  currentUser, 
  onLogout,
  gestorTab = 'dashboard',
  onGestorTabChange,
  definicoesSubTab = 'cursos',
  onDefinicoesSubTabChange
}) {
  // Estado do Tema (Claro / Preto - baseado na Imagem 2 e Imagem 3)
  const [portalTheme, setPortalTheme] = useState(() => {
    try {
      return localStorage.getItem('sernic_portal_theme') || 'claro';
    } catch {
      return 'claro';
    }
  });

  // Estado para ocultar / minimizar barra lateral com seta
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('sernic_portal_theme', portalTheme);
      // Sincronizar com o fundo do documento
      const bg = portalTheme === 'preto' ? '#0f172a' : '#f3f4f6';
      document.documentElement.style.setProperty('--dynamic-bg', bg);
      document.documentElement.style.backgroundColor = bg;
      document.body.style.backgroundColor = bg;
      document.body.classList.remove('portal-theme-claro', 'portal-theme-preto');
      document.body.classList.add(`portal-theme-${portalTheme}`);
    } catch {
      // Ignora erro de storage
    }
  }, [portalTheme]);

  const togglePortalTheme = () => {
    setPortalTheme(prev => prev === 'claro' ? 'preto' : 'claro');
  };

  const isNavActive = (path) => {
    if (path === '/portal-recrutamento' && (currentPath === '/portal-recrutamento' || currentPath === '/portal-recrutamento/')) {
      return true;
    }
    if (path === '/portal-gestor' && (currentPath === '/portal-gestor' || currentPath === '/portal-recrutamento/gestor' || currentPath === '/gestor')) {
      return true;
    }
    return currentPath === path;
  };

  const isGestorRoute = currentPath.includes('gestor') || currentPath === '/gestor';

  const handleSelectGestorTab = (tab) => {
    if (onGestorTabChange) {
      onGestorTabChange(tab);
    } else if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  };

  return (
    <div className={`portal-container portal-theme-${portalTheme}`}>
      {/* MARCA DE ÁGUA OFICIAL DO LOGÓTIPO SERNIC GRANDE E TRANSPARENTE NO FUNDO DA PÁGINA */}
      <div className="portal-page-watermark-bg" aria-hidden="true">
        <img 
          src={sernicLogo} 
          alt="" 
          className="portal-page-watermark-img" 
        />
      </div>

      {/* Marcas de Água Oficiais Laterais nas Áreas Indicadas (Esquerda e Direita) */}
      <div className="portal-watermark-lateral left" aria-hidden="true">
        <img src={sernicLogo} alt="" />
      </div>
      <div className="portal-watermark-lateral right" aria-hidden="true">
        <img src={sernicLogo} alt="" />
      </div>

      {/* 1. TOPO INSTITUCIONAL / REPÚBLICA DE MOÇAMBIQUE • PROCURADORIA-GERAL DA REPÚBLICA */}
      <div className="portal-top-strip">
        <div className="portal-top-strip-inner">
          <div className="portal-strip-rep">
            <span className="flag">🇲🇿</span>
            <span>REPÚBLICA DE MOÇAMBIQUE • PROCURADORIA-GERAL DA REPÚBLICA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="portal-strip-badge">
              {isGestorRoute ? 'SERNIC • ÁREA DE GESTÃO E JÚRI 2026' : 'SERNIC • CONCURSO PÚBLICO 2026'}
            </span>
            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
              {isGestorRoute ? 'Plataforma Oficial da Comissão de Avaliação' : 'Portal Oficial de Inscrições'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CABEÇALHO PRINCIPAL DO PORTAL (LIMPO E DESOBSTRUÍDO - MENU NA BARRA LATERAL ESQUERDA) */}
      <header className="portal-header">
        <div className="portal-header-inner">
          {/* Identificação e Logótipo do SERNIC */}
          <div 
            className="portal-brand-block" 
            onClick={() => navigate(isGestorRoute ? '/portal-gestor' : '/portal-recrutamento')}
            title="Ir para a página principal"
          >
            <img 
              src={sernicLogo} 
              alt="Logótipo Oficial do SERNIC" 
              className="portal-logo-img" 
            />
            <div className="portal-brand-text">
              <span className="portal-brand-institution">
                SERVIÇO NACIONAL DE INVESTIGAÇÃO CRIMINAL
              </span>
              <h1 className="portal-brand-title">
                {isGestorRoute ? (
                  <>PORTAL DO <span className="gold-highlight">GESTOR & JÚRI</span></>
                ) : (
                  <>PORTAL DE <span className="gold-highlight">RECRUTAMENTO</span></>
                )}
              </h1>
              <span className="portal-brand-subtitle">
                {isGestorRoute 
                  ? 'Comissão Nacional de Recrutamento • Concurso 2026'
                  : 'Direcção Geral • Direcção de Recursos Humanos'}
              </span>
            </div>
          </div>

          {/* CONTROLES DE NAVEGAÇÃO CENTRALIZADOS: VOLTAR E AVANÇAR */}
          <div className="portal-header-center">
            <div className="portal-history-nav">
              <button
                type="button"
                className="portal-history-btn"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.history.back();
                  }
                }}
                title="Voltar à página anterior"
                aria-label="Voltar"
              >
                <ChevronLeft size={16} />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                className="portal-history-btn"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.history.forward();
                  }
                }}
                title="Avançar à próxima página"
                aria-label="Avançar"
              >
                <span>Avançar</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Ações e Controles à Direita (Idioma + Modo Claro/Preto + Utilizador + Botão Sair) */}
          <div className="portal-header-actions">

            {/* Seletor de Idioma PT */}
            <div className="portal-lang-pill" title="Idioma: Português (Moçambique)">
              <span>PT</span>
              <ChevronDown size={14} />
            </div>

            {/* Alternador de Tema: Claro / Preto */}
            <button
              type="button"
              className="portal-theme-toggle-btn"
              onClick={togglePortalTheme}
              title={`Alternar tema visual (Actual: ${portalTheme === 'claro' ? 'Modo Claro' : 'Modo Preto'})`}
            >
              {portalTheme === 'claro' ? (
                <>
                  <Sun size={15} color="#eab308" />
                  <span>Modo: Claro</span>
                </>
              ) : (
                <>
                  <Moon size={15} color="#38bdf8" />
                  <span>Modo: Preto</span>
                </>
              )}
            </button>

            {/* Perfil do Utilizador Logado */}
            {currentUser && (
              <div className="portal-user-badge">
                <div className="portal-user-avatar">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.82rem', lineHeight: 1.1 }}>
                    {currentUser.name ? currentUser.name.split(' ')[0] : 'Utilizador'}
                  </span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>
                    {currentUser.nuit || (currentUser.role === 'admin' ? 'Gestor DRH' : 'Candidato')}
                  </span>
                </div>
              </div>
            )}

            {/* BOTÃO NO CANTO SUPERIOR DIREITO DE SAIR E VOLTAR PARA A PÁGINA DE LOGIN */}
            <button
              type="button"
              className="portal-header-logout-btn"
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  navigate('/');
                }
              }}
              title="Sair do Portal e voltar para a página de login"
              aria-label="Sair"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. CORPO DO PORTAL COM BARRA LATERAL ESQUERDA + ÁREA PRINCIPAL */}
      <div className="portal-layout-body">
        {/* ENVOLTÓRIO DA BARRA LATERAL COM SETA FLUTUANTE CENTRALIZADA NO MEIO */}
        <div className={`portal-sidebar-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          {/* BARRA LATERAL ESQUERDA (ESTRITAMENTE CONTEXTUAL: CANDIDATO vs GESTOR) */}
          <aside className={`portal-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`} aria-label="Menu Lateral do Portal">
            {/* MARCA DE ÁGUA OFICIAL NO FUNDO DA BARRA LATERAL ESQUERDA (LOGÓTIPO SERNIC NO LADO ESQUERDO) */}
            <div className="portal-sidebar-watermark" aria-hidden="true">
              <img src={sernicLogo} alt="" />
            </div>

            {/* Cartão de Contexto do Perfil */}
          <div className="portal-sidebar-context">
            <div className={`portal-sidebar-context-icon ${isGestorRoute ? 'is-gestor' : 'is-candidato'}`}>
              {isGestorRoute ? <ShieldCheck size={22} /> : <UserCheck size={22} />}
            </div>
            <div className="portal-sidebar-context-info">
              <span className="portal-sidebar-context-badge">
                {isGestorRoute ? 'JÚRI & AVALIAÇÃO' : 'PORTAL CANDIDATURAS'}
              </span>
              <h3 className="portal-sidebar-context-title">
                {isGestorRoute ? 'Painel de Gestor' : 'Menu do Candidato'}
              </h3>
            </div>
          </div>

          {/* MENU EXCLUSIVO DO CANDIDATO */}
          {!isGestorRoute && (
            <nav className="portal-sidebar-nav" aria-label="Menu de Navegação do Candidato">
              <div className="portal-sidebar-group-title">MÓDULOS DE CANDIDATURA</div>
              
              <button
                type="button"
                className={`portal-sidebar-btn ${isNavActive('/portal-recrutamento') ? 'active' : ''}`}
                onClick={() => navigate('/portal-recrutamento')}
                title="Página Inicial do Portal"
              >
                <Home size={18} className="sidebar-btn-icon" />
                <span className="sidebar-btn-text">Início</span>
              </button>

              <button
                type="button"
                className={`portal-sidebar-btn ${isNavActive('/portal-recrutamento/recrutamento') ? 'active' : ''}`}
                onClick={() => navigate('/portal-recrutamento/recrutamento')}
                title="Ver Editais e Vagas Oficiais Abertas"
              >
                <Briefcase size={18} className="sidebar-btn-icon" />
                <span className="sidebar-btn-text">Recrutamento</span>
              </button>

              <button
                type="button"
                className={`portal-sidebar-btn ${isNavActive('/portal-recrutamento/candidatura') ? 'active' : ''}`}
                onClick={() => navigate('/portal-recrutamento/candidatura')}
                title="Formulário de Inscrição Oficial"
              >
                <FileText size={18} className="sidebar-btn-icon" />
                <span className="sidebar-btn-text">Candidatura</span>
              </button>

              <button
                type="button"
                className={`portal-sidebar-btn ${isNavActive('/portal-recrutamento/consulta') ? 'active' : ''}`}
                onClick={() => navigate('/portal-recrutamento/consulta')}
                title="Consultar Estado da Candidatura e Listas Homologadas"
              >
                <Search size={18} className="sidebar-btn-icon" />
                <span className="sidebar-btn-text">Consulta</span>
              </button>

              <button
                type="button"
                className={`portal-sidebar-btn ${isNavActive('/portal-recrutamento/login') ? 'active' : ''}`}
                onClick={() => navigate('/portal-recrutamento/login')}
                title="Aceder à Área Pessoal do Candidato"
              >
                <User size={18} className="sidebar-btn-icon" />
                <span className="sidebar-btn-text">{currentUser ? 'Área Pessoal' : 'Login'}</span>
              </button>
            </nav>
          )}

          {/* MENU EXCLUSIVO DO GESTOR (SOMENTE QUANDO ENTRA COMO GESTOR) */}
          {isGestorRoute && (
            <nav className="portal-sidebar-nav" aria-label="Menu de Navegação do Gestor">
              <div className="portal-sidebar-group-title">MÓDULOS DE GESTÃO DO JÚRI</div>

              <button
                type="button"
                className={`portal-sidebar-btn ${gestorTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleSelectGestorTab('dashboard')}
                title="Painel Geral e Estatísticas"
              >
                <Layers size={18} className="sidebar-btn-icon" />
                <span className="sidebar-btn-text">Painel Geral</span>
              </button>

              <button
                type="button"
                className={`portal-sidebar-btn ${gestorTab === 'inscritos' ? 'active' : ''}`}
                onClick={() => handleSelectGestorTab('inscritos')}
                title="Gestão de Candidatos Inscritos"
              >
                <Users size={18} className="sidebar-btn-icon" />
                <span className="sidebar-btn-text">Inscritos no Concurso</span>
              </button>

              <button
                type="button"
                className={`portal-sidebar-btn ${gestorTab === 'deliberacao' ? 'active' : ''}`}
                onClick={() => handleSelectGestorTab('deliberacao')}
                title="Deliberação e Decisão do Júri"
              >
                <FileText size={18} className="sidebar-btn-icon" />
                <span className="sidebar-btn-text">Deliberação do Júri</span>
              </button>

              <button
                type="button"
                className={`portal-sidebar-btn ${gestorTab === 'pautas' ? 'active' : ''}`}
                onClick={() => handleSelectGestorTab('pautas')}
                title="Emissão e Homologação de Pautas"
              >
                <BookOpen size={18} className="sidebar-btn-icon" />
                <span className="sidebar-btn-text">Pautas & Editais</span>
              </button>

              <button
                type="button"
                className={`portal-sidebar-btn ${gestorTab === 'vagas' ? 'active' : ''}`}
                onClick={() => handleSelectGestorTab('vagas')}
                title="Controle de Vagas e Quotas Provinciais"
              >
                <Briefcase size={18} className="sidebar-btn-icon" />
                <span className="sidebar-btn-text">Vagas & Quotas</span>
              </button>

              <button
                type="button"
                className={`portal-sidebar-btn ${gestorTab === 'auditoria' ? 'active' : ''}`}
                onClick={() => handleSelectGestorTab('auditoria')}
                title="Histórico Completo de Auditoria"
              >
                <History size={18} className="sidebar-btn-icon" />
                <span className="sidebar-btn-text">Livro de Auditoria</span>
              </button>

              <div className="portal-sidebar-group-title" style={{ marginTop: '0.8rem' }}>CONFIGURAÇÃO DO SISTEMA</div>

              {/* MÓDULO CENTRAL DE DEFINIÇÕES NA BARRA LATERAL */}
              <button
                type="button"
                className={`portal-sidebar-btn ${gestorTab === 'definicoes' ? 'active' : ''}`}
                onClick={() => {
                  handleSelectGestorTab('definicoes');
                  if (onDefinicoesSubTabChange) {
                    onDefinicoesSubTabChange(definicoesSubTab || 'cursos');
                  }
                }}
                title="Definições: Cursos, Locais de Provas, Cores dos Temas, Idioma e Parâmetros"
              >
                <SlidersHorizontal size={18} className="sidebar-btn-icon" />
                <span className="sidebar-btn-text">Definições do Concurso</span>
                <ChevronDown 
                  size={14} 
                  style={{ 
                    marginLeft: 'auto', 
                    transform: gestorTab === 'definicoes' ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </button>

              {/* AS 5 OPÇÕES DEMONSTRADAS NA IMAGEM DIRETAMENTE NA PARTE LATERAL */}
              {gestorTab === 'definicoes' && !isSidebarCollapsed && (
                <div className="portal-sidebar-submenu">
                  <button
                    type="button"
                    className={`portal-sidebar-sub-btn ${definicoesSubTab === 'cursos' ? 'active' : ''}`}
                    onClick={() => {
                      if (onDefinicoesSubTabChange) onDefinicoesSubTabChange('cursos');
                    }}
                    title="Cursos Homologados"
                  >
                    <GraduationCap size={15} />
                    <span>Cursos Homologados</span>
                    <span className="portal-sidebar-sub-badge">10</span>
                  </button>

                  <button
                    type="button"
                    className={`portal-sidebar-sub-btn ${definicoesSubTab === 'locais' ? 'active' : ''}`}
                    onClick={() => {
                      if (onDefinicoesSubTabChange) onDefinicoesSubTabChange('locais');
                    }}
                    title="Centros & Locais de Testes"
                  >
                    <MapPin size={15} />
                    <span>Centros & Locais</span>
                    <span className="portal-sidebar-sub-badge">6</span>
                  </button>

                  <button
                    type="button"
                    className={`portal-sidebar-sub-btn ${definicoesSubTab === 'temas' ? 'active' : ''}`}
                    onClick={() => {
                      if (onDefinicoesSubTabChange) onDefinicoesSubTabChange('temas');
                    }}
                    title="Aparência & Cores dos Temas"
                  >
                    <Palette size={15} />
                    <span>Aparência & Cores</span>
                  </button>

                  <button
                    type="button"
                    className={`portal-sidebar-sub-btn ${definicoesSubTab === 'idioma' ? 'active' : ''}`}
                    onClick={() => {
                      if (onDefinicoesSubTabChange) onDefinicoesSubTabChange('idioma');
                    }}
                    title="Idioma & Regionalização"
                  >
                    <Globe size={15} />
                    <span>Idioma & Regionalização</span>
                  </button>

                  <button
                    type="button"
                    className={`portal-sidebar-sub-btn ${definicoesSubTab === 'geral' ? 'active' : ''}`}
                    onClick={() => {
                      if (onDefinicoesSubTabChange) onDefinicoesSubTabChange('geral');
                    }}
                    title="Parâmetros Gerais do Concurso"
                  >
                    <Settings size={15} />
                    <span>Parâmetros Gerais</span>
                  </button>
                </div>
              )}
            </nav>
          )}

          {/* Rodapé Informativo Institucional da Barra Lateral */}
          <div className="portal-sidebar-footer">
            <div className="portal-sidebar-footer-badge">
              <ShieldCheck size={14} color="#c59b27" />
              <span>SERNIC DRH • 2026</span>
            </div>
            <p className="portal-sidebar-footer-text">
              República de Moçambique<br />
              Procuradoria-Geral da República
            </p>
          </div>
        </aside>

        {/* Seta de Ocultar / Minimizar Barra Lateral Centralizada no Meio da Divisória */}
        <button
          type="button"
          className="portal-sidebar-toggle-btn"
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          title={isSidebarCollapsed ? "Expandir menu lateral" : "Ocultar / Minimizar menu lateral"}
          aria-label={isSidebarCollapsed ? "Expandir menu lateral" : "Ocultar / Minimizar menu lateral"}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

        {/* CONTEÚDO PRINCIPAL DO MÓDULO */}
        <main className="portal-main-area">
          {children}
        </main>
      </div>

      {/* 4. RODAPÉ INSTITUCIONAL */}
      <footer className="portal-footer">
        <div className="portal-footer-inner">
          <div className="portal-footer-col">
            <h4>
              <ShieldCheck size={18} color="#c59b27" />
              SERVIÇO NACIONAL DE INVESTIGAÇÃO CRIMINAL
            </h4>
            <p>
              Órgão de polícia judiciária e de investigação criminal da República de Moçambique, 
              tutelado pelo Procurador-Geral da República.
            </p>
            <p style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>
              Direcção Geral • Direcção de Recursos Humanos • Comissão de Júri de Recrutamento 2026.
            </p>
          </div>

          <div className="portal-footer-col">
            <h4>
              <MapPin size={18} color="#c59b27" />
              Sede e Contactos
            </h4>
            <p>
              <MapPin size={14} style={{ display: 'inline', marginRight: '5px' }} />
              Av. Vladimir Lenine, n.º 1234, Maputo, Moçambique
            </p>
            <p>
              <Phone size={14} style={{ display: 'inline', marginRight: '5px' }} />
              Linha Geral: +258 21 320 000 / +258 84 900 0000
            </p>
            <p>
              <Mail size={14} style={{ display: 'inline', marginRight: '5px' }} />
              recrutamento@sernic.gov.mz
            </p>
            <p>
              <Clock size={14} style={{ display: 'inline', marginRight: '5px' }} />
              Atendimento: 2ª a 6ª feira, das 07:30 às 15:30
            </p>
          </div>

          <div className="portal-footer-col">
            <h4>
              <ExternalLink size={18} color="#c59b27" />
              Acesso Rápido
            </h4>
            <p style={{ cursor: 'pointer' }} onClick={() => navigate('/portal-recrutamento/recrutamento')}>
              • Editais e Vagas Oficiais
            </p>
            <p style={{ cursor: 'pointer' }} onClick={() => navigate('/portal-recrutamento/candidatura')}>
              • Submeter Nova Candidatura
            </p>
            <p style={{ cursor: 'pointer' }} onClick={() => navigate('/portal-recrutamento/consulta')}>
              • Consulta de Listas e Estado
            </p>
            <p style={{ cursor: 'pointer' }} onClick={() => navigate('/portal-recrutamento/login')}>
              • Área Pessoal do Candidato
            </p>
          </div>
        </div>

        <div className="portal-footer-bottom">
          <div>
            © 2026 República de Moçambique • Tutela: Procuradoria-Geral da República. Todos os direitos reservados.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b' }}>
            <span>Termos de Uso</span>
            <span>Política de Privacidade e Protecção de Dados</span>
            <span>Segurança da Informação</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
