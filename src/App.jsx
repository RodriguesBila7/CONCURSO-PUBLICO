import React, { useState, useEffect, useRef } from 'react';
import { User, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { translations } from './translations';
import { RANDOM_COLOR_PALETTE } from './themePresets';
import LanguageSelector from './components/LanguageSelector';
import ThemeModeButton from './components/ThemeModeButton';
import PaletteModal from './components/PaletteModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import SolicitarAcessoModal from './components/SolicitarAcessoModal';
import CandidateDashboardModal from './components/CandidateDashboardModal';
import sernicLogo from './assets/sernic-logo.png';

// Importações do Novo Portal de Recrutamento SERNIC
import PortalLayout from './portal/PortalLayout';
import PortalHome from './portal/PortalHome';
import RecrutamentoModule from './portal/modules/RecrutamentoModule';
import CandidaturaModule from './portal/modules/CandidaturaModule';
import ConsultaModule from './portal/modules/ConsultaModule';
import LoginModule from './portal/modules/LoginModule';
import GestorPortalModule from './portal/modules/GestorPortalModule';
import GestorLoginPage from './portal/GestorLoginPage';
import { getSessionToken, restaurarSessao, terminarSessao } from './portal/api';

const GESTOR_TABS = ['dashboard', 'inscritos', 'deliberacao', 'pautas', 'vagas', 'auditoria', 'servidor', 'definicoes'];

export default function App() {
  // ROUTING: Caminho actual (/ ou /portal-recrutamento/...)
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );

  // Vaga pré-selecionada ao clicar "Candidatar-me" no módulo Recrutamento
  const [selectedVagaParaCandidatura, setSelectedVagaParaCandidatura] = useState(null);

  // Histórico de navegação do browser (Back/Forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // State: Language ('pt' | 'en')
  const [lang, setLang] = useState('pt');
  const t = translations[lang] || translations.pt;

  // State: Theme mode ('default_red' | 'dark' | 'light')
  const [themeMode, setThemeMode] = useState('default_red');

  // State: Selected color for custom/preset background
  const [activeColor, setActiveColor] = useState('#c32026'); // Default SERNIC Red

  // State: Random colors active
  const [isRandomActive, setIsRandomActive] = useState(false);
  const randomIntervalRef = useRef(null);

  // Synchronize dynamic background color to html and body
  useEffect(() => {
    const cleanCurrent = (currentPath || '').split('?')[0].split('#')[0];
    const isPortal = cleanCurrent.startsWith('/portal-recrutamento') || 
                     cleanCurrent.startsWith('/portal-gestor') ||
                     ['/recrutamento', '/candidatura', '/consulta', '/login', '/gestor', '/portal-gestor'].includes(cleanCurrent) ||
                     currentPath.includes('gestor');
    
    if (isPortal) {
      document.documentElement.style.setProperty('--dynamic-bg', '#f8fafc');
      document.documentElement.style.backgroundColor = '#f8fafc';
      document.body.style.backgroundColor = '#f8fafc';
      return;
    }

    const bg = isRandomActive
      ? activeColor
      : (themeMode === 'dark' ? '#121824' : (themeMode === 'light' ? '#f8fafc' : activeColor));
      
    document.documentElement.style.setProperty('--dynamic-bg', bg);
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
  }, [themeMode, activeColor, currentPath, isRandomActive]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authenticated user session
  const [currentUser, setCurrentUser] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(() => Boolean(getSessionToken()));
  const [userCandidaturas, setUserCandidaturas] = useState([]);

  useEffect(() => {
    if (!isRestoringSession) return;
    let cancelled = false;
    restaurarSessao().then((user) => {
      if (cancelled) return;
      if (user) setCurrentUser(user);
      setIsRestoringSession(false);
    });
    return () => { cancelled = true; };
  }, [isRestoringSession]);
  const [isGestorModalOpen, setIsGestorModalOpen] = useState(false);

  // Modals
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const isGestorUser = (u) => Boolean(u && (
    u.role === 'admin' || 
    u.role === 'gestor' || 
    u.role === 'super_admin' || 
    u.role === 'admin_principal' || 
    u.role === 'juri' || 
    u.role === 'usuario'
  ));

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Load saved preferences from backend SQLite / LocalStorage
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.config) {
          if (data.config.theme) setThemeMode(data.config.theme);
          if (data.config.customColor) setActiveColor(data.config.customColor);
          if (data.config.language) setLang(data.config.language);
          if (data.config.randomColors) setIsRandomActive(data.config.randomColors);
        }
      } catch {
        // Fallback to defaults
      }
    }
    loadSettings();
  }, []);

  // Save preferences to backend SQLite
  const saveSettings = async (updates) => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch {
      // Non-blocking
    }
  };

  // Random colors effect: troca as cores a cada 7 segundos de forma aleatória
  useEffect(() => {
    if (isRandomActive) {
      randomIntervalRef.current = setInterval(() => {
        setActiveColor((prevColor) => {
          let nextColor;
          do {
            const randomIndex = Math.floor(Math.random() * RANDOM_COLOR_PALETTE.length);
            nextColor = RANDOM_COLOR_PALETTE[randomIndex];
          } while (nextColor === prevColor && RANDOM_COLOR_PALETTE.length > 1);
          return nextColor;
        });
      }, 7000); // Exatamente a cada 7 segundos conforme solicitado
    } else {
      if (randomIntervalRef.current) {
        clearInterval(randomIntervalRef.current);
        randomIntervalRef.current = null;
      }
    }

    return () => {
      if (randomIntervalRef.current) {
        clearInterval(randomIntervalRef.current);
      }
    };
  }, [isRandomActive]);

  // Roll dice for instant random color
  const handleRollDice = (notify = true) => {
    setActiveColor((prevColor) => {
      let nextColor;
      do {
        const randomIndex = Math.floor(Math.random() * RANDOM_COLOR_PALETTE.length);
        nextColor = RANDOM_COLOR_PALETTE[randomIndex];
      } while (nextColor === prevColor && RANDOM_COLOR_PALETTE.length > 1);
      if (notify) {
        showToast('info', `Cor sorteada: ${nextColor}`);
      }
      return nextColor;
    });
    if (themeMode === 'dark' || themeMode === 'light') {
      setThemeMode('default_red');
    }
  };

  // Handle color selection from palette or custom picker
  const handleSelectColor = (hex) => {
    setActiveColor(hex);
    setIsRandomActive(false);
    if (themeMode !== 'dark' && themeMode !== 'light') {
      setThemeMode('default_red');
    }
    saveSettings({ customColor: hex, randomColors: false });
  };

  // Toggle random colors switch
  const handleToggleRandom = (checked) => {
    setIsRandomActive(checked);
    if (checked) {
      if (themeMode === 'dark' || themeMode === 'light') {
        setThemeMode('default_red');
      }
      // Sorteia imediatamente uma cor no momento da ativação
      setActiveColor((prevColor) => {
        let nextColor;
        do {
          const randomIndex = Math.floor(Math.random() * RANDOM_COLOR_PALETTE.length);
          nextColor = RANDOM_COLOR_PALETTE[randomIndex];
        } while (nextColor === prevColor && RANDOM_COLOR_PALETTE.length > 1);
        return nextColor;
      });
      showToast('info', 'Cores aleatórias ativadas (troca a cada 7 segundos)');
    } else {
      showToast('info', 'Cores aleatórias desativadas');
    }
    saveSettings({ randomColors: checked });
  };

  // Cycle theme mode: default_red -> dark -> light -> default_red
  const handleToggleMode = () => {
    let nextMode = 'default_red';
    if (themeMode === 'default_red') nextMode = 'dark';
    else if (themeMode === 'dark') nextMode = 'light';
    else if (themeMode === 'light') nextMode = 'default_red';

    setThemeMode(nextMode);
    setIsRandomActive(false);
    saveSettings({ theme: nextMode, randomColors: false });
  };

  // Switch Language
  const handleSelectLang = (newLang) => {
    setLang(newLang);
    saveSettings({ language: newLang });
  };

  // Action when clicking Candidate or Gestor
  const handleLoginSubmit = async (roleTarget = 'candidate') => {
    if (roleTarget === 'candidate') {
      // REDIRECIONA PARA O NOVO PORTAL DE RECRUTAMENTO
      navigate('/portal-recrutamento');
      showToast('info', 'A aceder ao Portal de Recrutamento do SERNIC...');
    } else {
      if (isGestorUser(currentUser)) setGestorTab('dashboard');
      navigate('/portal-gestor');
    }
  };

  const handleLogout = () => {
    terminarSessao();
    setCurrentUser(null);
    setUserCandidaturas([]);
    setIsGestorModalOpen(false);
    navigate('/');
    showToast('info', 'Sessão terminada. Retornou à página de autenticação.');
  };

  // Determine current theme wrapper class
  const getThemeClass = () => {
    if (isRandomActive) return 'theme-default';
    if (themeMode === 'dark') return 'theme-dark';
    if (themeMode === 'light') return 'theme-light';
    return 'theme-default';
  };

  // ========================================================
  // VERIFICA SE ESTÁ NUMA ROTA DO PORTAL (CANDIDATO OU GESTOR)
  // ========================================================
  const cleanPath = (currentPath || '').split('?')[0].split('#')[0];
  const isPortalRoute = cleanPath.startsWith('/portal-recrutamento') || 
                        cleanPath.startsWith('/portal-gestor') ||
                        ['/recrutamento', '/candidatura', '/consulta', '/login', '/gestor', '/portal-gestor'].includes(cleanPath) ||
                        currentPath.includes('gestor');

  // Estado da aba ativa do Módulo Gestor (Sincronizado entre Sidebar e Conteúdo)
  const [gestorTab, setGestorTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const h = window.location.hash.replace('#', '');
      if (h.startsWith('definicoes-')) return 'definicoes';
      if (GESTOR_TABS.includes(h)) return h;
    }
    return 'dashboard';
  });

  const [definicoesSubTab, setDefinicoesSubTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const h = window.location.hash.replace('#', '');
      if (h.startsWith('definicoes-')) {
        const sub = h.replace('definicoes-', '');
        if (['carreiras', 'perfis', 'cursos', 'locais', 'temas', 'idioma', 'geral'].includes(sub)) return sub;
      }
    }
    return 'perfis';
  });

  const handleGestorTabChange = (tab) => {
    setGestorTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  };

  const handleDefinicoesSubTabChange = (subTab) => {
    setDefinicoesSubTab(subTab);
    setGestorTab('definicoes');
    if (typeof window !== 'undefined') {
      window.location.hash = `definicoes-${subTab}`;
    }
  };

  useEffect(() => {
    const handleHashSync = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const h = window.location.hash.replace('#', '');
        if (h.startsWith('definicoes-')) {
          setGestorTab('definicoes');
          const sub = h.replace('definicoes-', '');
          if (['carreiras', 'perfis', 'cursos', 'locais', 'temas', 'idioma', 'geral'].includes(sub)) {
            setDefinicoesSubTab(sub);
          }
        } else if (GESTOR_TABS.includes(h)) {
          setGestorTab(h);
        }
      }
    };
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  if (isPortalRoute) {
    let portalContent = null;

    const isGestorModuleActive = cleanPath === '/portal-gestor' || 
                                 cleanPath === '/portal-recrutamento/gestor' || 
                                 cleanPath === '/gestor' ||
                                 currentPath.includes('role=gestor');

    if (isRestoringSession) {
      return (
        <div className="session-restore-screen" role="status">
          <Loader2 size={28} className="animate-spin" />
          <span>A verificar a sessão...</span>
        </div>
      );
    }

    if (isGestorModuleActive && !isGestorUser(currentUser)) {
      return (
        <>
          <GestorLoginPage
            navigate={navigate}
            onLoginSuccess={(u, message) => {
              setCurrentUser(u);
              setGestorTab('dashboard');
              if (typeof window !== 'undefined') window.location.hash = 'dashboard';
              showToast('success', message || `Bem-vindo(a), ${u.name}!`);
            }}
          />
          {toast && (
            <div className={`toast-floating toast-${toast.type}`}>
              {toast.type === 'success' && <CheckCircle2 size={20} color="#22c55e" />}
              {toast.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
              <span>{toast.message}</span>
            </div>
          )}
        </>
      );
    }

    if (isGestorModuleActive) {
      portalContent = (
        <GestorPortalModule
          currentUser={currentUser}
          navigate={navigate}
          onNotify={showToast}
          onLogout={handleLogout}
          gestorTab={gestorTab}
          onGestorTabChange={handleGestorTabChange}
          definicoesSubTab={definicoesSubTab}
          onDefinicoesSubTabChange={handleDefinicoesSubTabChange}
        />
      );
    } else if (cleanPath === '/portal-recrutamento' || cleanPath === '/portal-recrutamento/') {
      portalContent = <PortalHome navigate={navigate} vagasCount={4} publishedListsCount={4} currentUser={currentUser} />;
    } else if (cleanPath === '/portal-recrutamento/recrutamento' || cleanPath === '/recrutamento') {
      portalContent = (
        <RecrutamentoModule
          navigate={navigate}
          onSelectVagaParaCandidatura={(vaga) => setSelectedVagaParaCandidatura(vaga)}
          currentUser={currentUser}
        />
      );
    } else if (cleanPath === '/portal-recrutamento/candidatura' || cleanPath === '/candidatura') {
      portalContent = (
        <CandidaturaModule
          navigate={navigate}
          selectedVagaPrevia={selectedVagaParaCandidatura}
          currentUser={currentUser}
          onNotify={showToast}
        />
      );
    } else if (cleanPath === '/portal-recrutamento/consulta' || cleanPath === '/consulta') {
      portalContent = <ConsultaModule navigate={navigate} />;
    } else if (cleanPath === '/portal-recrutamento/login' || cleanPath === '/login') {
      portalContent = (
        <LoginModule
          currentUser={currentUser}
          onLoginSuccess={(u) => {
            setCurrentUser(u);
            if (u && (u.role === 'admin' || u.role === 'gestor')) {
              setGestorTab('dashboard');
              navigate('/portal-gestor');
            }
          }}
          onLogout={handleLogout}
          navigate={navigate}
          onNotify={showToast}
        />
      );
    } else {
      // Fallback para o hub
      portalContent = <PortalHome navigate={navigate} vagasCount={4} publishedListsCount={4} currentUser={currentUser} />;
    }

    return (
      <PortalLayout
        currentPath={cleanPath}
        navigate={navigate}
        currentUser={currentUser}
        onLogout={handleLogout}
        gestorTab={gestorTab}
        onGestorTabChange={handleGestorTabChange}
        definicoesSubTab={definicoesSubTab}
        onDefinicoesSubTabChange={handleDefinicoesSubTabChange}
      >
        {portalContent}

        {/* TOAST FEEDBACK NOTIFICATIONS */}
        {toast && (
          <div className={`toast-floating toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={20} color="#22c55e" />}
            {toast.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
            <span>{toast.message}</span>
          </div>
        )}
      </PortalLayout>
    );
  }

  // ========================================================
  // ROTA INICIAL (/) - PÁGINA INICIAL COM O BOTÃO CANDIDATO/GESTOR
  // ========================================================
  return (
    <div
      className={`theme-wrapper ${getThemeClass()}`}
      style={{
        '--dynamic-bg': isRandomActive ? activeColor : (themeMode === 'dark' ? '#121824' : (themeMode === 'light' ? '#f8fafc' : activeColor)),
      }}
    >
      {/* MARCA DE ÁGUA OFICIAL DO LOGÓTIPO SERNIC GRANDE E PROFISSIONAL NO FUNDO */}
      <div className="landing-watermark-bg" aria-hidden="true">
        <img
          src={sernicLogo}
          alt=""
          className="landing-watermark-img"
        />
      </div>

      {/* MARCAS LATERAIS DE FUNDO SUAVES (ESQUERDA E DIREITA) */}
      <div className="landing-watermark-lateral left" aria-hidden="true">
        <img src={sernicLogo} alt="" />
      </div>
      <div className="landing-watermark-lateral right" aria-hidden="true">
        <img src={sernicLogo} alt="" />
      </div>

      {/* TOP CONTROLS (PT/EN, THEME MODE, PALETTE) */}
      <header className="top-action-bar">
        {/* Language selector (PT / EN) */}
        <LanguageSelector currentLang={lang} onSelectLang={handleSelectLang} />

        {/* Theme mode toggle (Default Red -> Dark -> Light) */}
        <ThemeModeButton mode={themeMode} onToggleMode={handleToggleMode} t={t} />

        {/* Color Palette Popover */}
        <PaletteModal
          currentColor={activeColor}
          onSelectColor={handleSelectColor}
          isRandomActive={isRandomActive}
          onToggleRandom={handleToggleRandom}
          onRollDice={handleRollDice}
          t={t}
        />
      </header>

      {/* CENTER CONTENT */}
      <main className="main-content-container">
        {/* INSTITUTIONAL HEADER & BRANDING */}
        <div className="main-header">
          {/* SERNIC LOGO */}
          <div className="logo-container" title="Serviço Nacional de Investigação Criminal">
            <img
              src={sernicLogo}
              alt="Logótipo Oficial do SERNIC"
              className="logo-image"
            />
          </div>

          <h1 className="header-title-main">
            SERVIÇO NACIONAL DE INVESTIGAÇÃO CRIMINAL
          </h1>
          <h2 className="header-title-sub">
            DIRECÇÃO GERAL
          </h2>
          <h3 className="header-department">
            DIRECÇÃO DE RECURSOS HUMANOS
          </h3>

          <div className="header-badge-target">
            PLATAFORMA DE CANDIDATURAS AO SERNIC
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="login-card-container">
          <h2 className="card-title">{t.login_title}</h2>

          {/* Buttons Stack: 2 OPÇÕES */}
          <div className="btn-stack">
            {/* Opção 1: ENTRAR COMO CANDIDATO -> NAVEGA PARA /portal-recrutamento */}
            <button
              type="button"
              className="btn-primary-action btn-candidate"
              disabled={isSubmitting}
              onClick={() => handleLoginSubmit('candidate')}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>A aceder...</span>
                </>
              ) : (
                <>
                  <User size={18} />
                  <span>{t.btn_enter_candidate}</span>
                </>
              )}
            </button>

            {/* Opção 2: ENTRAR COMO GESTOR */}
            <button
              type="button"
              className="btn-primary-action btn-gestor"
              disabled={isSubmitting}
              onClick={() => handleLoginSubmit('gestor')}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>A aceder...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>{t.btn_enter_gestor}</span>
                </>
              )}
            </button>

            {/* Opção 3: CADASTRAR OU ENTRAR COM O GOOGLE */}
            <button
              type="button"
              className="btn-google-auth"
              style={{ marginTop: '0.4rem' }}
              onClick={() => {
                navigate('/portal-recrutamento/login');
                showToast('info', 'Aceda ou crie a sua conta de candidato com a Google.');
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Cadastrar / Entrar com Google</span>
            </button>
          </div>

          {/* Links secundários */}
          <div className="login-secondary-links">
            <button
              type="button"
              className="link-secondary-btn"
              onClick={() => setIsRequestModalOpen(true)}
            >
              {t.btn_request}
            </button>
            <span className="link-secondary-dot">•</span>
            <button
              type="button"
              className="link-secondary-btn"
              onClick={() => setIsForgotModalOpen(true)}
            >
              {t.btn_forgot}
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="main-footer">
        <p>{t.footer_text}</p>
      </footer>

      {/* MODALS */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        t={t}
        onNotify={showToast}
      />

      <SolicitarAcessoModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        t={t}
        onNotify={showToast}
      />

      {/* PAINEL DE GESTOR */}
      {isGestorModalOpen && currentUser && (
        <CandidateDashboardModal
          user={currentUser}
          candidaturas={userCandidaturas}
          onLogout={handleLogout}
          t={t}
        />
      )}

      {/* TOAST FEEDBACK NOTIFICATIONS */}
      {toast && (
        <div className={`toast-floating toast-${toast.type}`}>
          {toast.type === 'success' && <CheckCircle2 size={20} color="#22c55e" />}
          {toast.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
