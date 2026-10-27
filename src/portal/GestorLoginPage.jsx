import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ArrowLeft,
  Users,
  ClipboardCheck,
  FileText,
  History
} from 'lucide-react';
import sernicLogo from '../assets/sernic-logo.png';
import { apiFetch, setSessionToken } from './api';
import './portal.css';

const FUNCOES = [
  { icon: Users, texto: 'Gerir inscritos e dossiers dos candidatos' },
  { icon: ClipboardCheck, texto: 'Avaliar, admitir ou excluir candidaturas' },
  { icon: FileText, texto: 'Publicar editais, vagas e pautas oficiais' },
  { icon: History, texto: 'Consultar o registo de acessos e auditoria' }
];

export default function GestorLoginPage({ navigate, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [theme] = useState(() => {
    try {
      return localStorage.getItem('sernic_portal_theme') || 'claro';
    } catch {
      return 'claro';
    }
  });

  useEffect(() => {
    const bg = theme === 'preto' ? '#0f172a' : '#f3f4f6';
    document.documentElement.style.setProperty('--dynamic-bg', bg);
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Introduza o utilizador (NUIT ou e-mail) e a senha.');
      return;
    }
    setIsSubmitting(true);
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { identifier: identifier.trim(), password, expectedRole: 'gestor' }
    });
    setIsSubmitting(false);

    if (data.success && data.user && data.token) {
      setSessionToken(data.token);
      setPassword('');
      onLoginSuccess(data.user, data.message);
    } else {
      setError(data.message || 'Não foi possível iniciar sessão.');
    }
  };

  return (
    <div className={`portal-container portal-theme-${theme} gestor-login-page`}>
      <div className="gestor-login-shell">
        <aside className="gestor-login-brand">
          <img src={sernicLogo} alt="Logótipo do SERNIC" className="gestor-login-logo" />
          <span className="gestor-login-kicker">Serviço Nacional de Investigação Criminal</span>
          <h1>Área de Gestão e Júri</h1>
          <p>Acesso reservado à Direcção de Recursos Humanos e aos membros da Comissão de Júri do Concurso Público 2026.</p>
          <ul className="gestor-login-funcoes">
            {FUNCOES.map(({ icon: Icon, texto }) => (
              <li key={texto}><Icon size={17} /> <span>{texto}</span></li>
            ))}
          </ul>
        </aside>

        <main className="gestor-login-card">
          <div className="gestor-login-badge"><ShieldCheck size={15} /> Área restrita</div>
          <h2>Iniciar sessão como gestor</h2>
          <p className="gestor-login-sub">Utilize as credenciais institucionais atribuídas pela DRH.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="gestor-identifier">Utilizador (NUIT ou e-mail institucional)</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><User size={18} /></span>
                <input
                  id="gestor-identifier"
                  type="text"
                  className="auth-form-input"
                  autoComplete="username"
                  placeholder="Ex: drh@sernic.gov.mz"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="gestor-password">Senha</label>
              <div className="auth-input-group">
                <span className="auth-input-icon"><Lock size={18} /></span>
                <input
                  id="gestor-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-form-input"
                  autoComplete="current-password"
                  placeholder="Introduza a senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="gestor-login-eye"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="gestor-login-error" role="alert">
                <AlertCircle size={17} /> <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-auth-primary" disabled={isSubmitting}>
              <LogIn size={18} />
              <span>{isSubmitting ? 'A verificar credenciais...' : 'Entrar na Área de Gestão'}</span>
            </button>
          </form>

          <p className="gestor-login-nota">
            Todas as tentativas de acesso são registadas. A sessão termina após 1 hora de inactividade.
          </p>

          <div className="gestor-login-links">
            <button type="button" onClick={() => navigate('/')}>
              <ArrowLeft size={15} /> Página inicial
            </button>
            <button type="button" onClick={() => navigate('/portal-recrutamento')}>
              Sou candidato: ir ao Portal de Recrutamento
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
