import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Bell, 
  Edit3, 
  LogOut, 
  ArrowRight, 
  Printer, 
  KeyRound, 
  CreditCard, 
  Hash, 
  Phone, 
  LogIn, 
  UserPlus,
  ShieldCheck,
  X
} from 'lucide-react';
import { 
  validarBI, 
  validarNUIT, 
  validarTelefoneMZ, 
  formatTelefoneMZInput,
  evaluatePasswordStrength,
  PROVINCIAS_MOCAMBIQUE,
  PROVINCIAS_GEOGRAFICAS,
  INITIAL_CANDIDATURAS_CONSULTA,
  getStoredCandidaturas,
  detectCandidateGender 
} from '../mockData';

// Componente Ícone Oficial Google (SVG Multicolor)
const GoogleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

// Contas Google Pré-sugeridas para login e teste rápido
const GOOGLE_PRESET_ACCOUNTS = [
  {
    id: 'g-rodrigo',
    name: 'Rodrigo Bila',
    email: 'rodrigo.bila@gmail.com',
    initial: 'R',
    bg: '#1a73e8',
    nuit: '100458921',
    bi: '110293847101B',
    genero: 'Masculino'
  },
  {
    id: 'g-armando',
    name: 'Armando Carlos Mondlane',
    email: 'armando.carlos@gmail.com',
    initial: 'A',
    bg: '#0f9d58',
    nuit: '100234567',
    bi: '110100234567M',
    genero: 'Masculino'
  },
  {
    id: 'g-helena',
    name: 'Helena Macuácua',
    email: 'helena.macuacua@gmail.com',
    initial: 'H',
    bg: '#e37400',
    nuit: '100876543',
    bi: '110345678902H',
    genero: 'Feminino'
  }
];

export default function LoginModule({ 
  currentUser, 
  onLoginSuccess, 
  onLogout, 
  navigate, 
  onNotify 
}) {
  // Abas quando deslogado: 'login' | 'register' | 'forgot'
  const [authTab, setAuthTab] = useState('login');

  // Abas na Área Pessoal: 'candidaturas' | 'perfil' | 'notificacoes'
  const [candidateTab, setCandidateTab] = useState('candidaturas');

  // Form de Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de Autenticação / Registo com Google
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleError, setCustomGoogleError] = useState('');

  // Form de Registo
  const [regData, setRegData] = useState({
    nome: '',
    bi: '',
    nuit: '',
    email: '',
    telefone: '+258 000 000 000',
    password: '',
    confirmPassword: '',
    provincia: 'Maputo Cidade'
  });
  const [regErrors, setRegErrors] = useState({});
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Form de Recuperação
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Candidaturas associadas ao candidato logado
  const [userCandidaturas, setUserCandidaturas] = useState(() => {
    if (!currentUser) return [];
    const all = getStoredCandidaturas();
    const matched = all.filter(c => c.nuit === currentUser.nuit || c.biNumero === currentUser.bi);
    return matched.length > 0 ? matched : all.slice(0, 2);
  });

  // Manipular Login
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Por favor, informe o seu E-mail / BI e a Senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanIdent = loginIdentifier.trim();
      const isTryingGestor = cleanIdent.toLowerCase() === 'admin' || 
                             cleanIdent.toLowerCase() === 'gestor' || 
                             cleanIdent.toLowerCase().includes('drh') || 
                             cleanIdent.toLowerCase().includes('sernic.gov.mz');

      // Tentar autenticar contra o backend Express / SQLite
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanIdent,
          password: loginPassword,
          expectedRole: isTryingGestor ? 'gestor' : 'candidate'
        })
      });
      const data = await res.json();

      if (data.success && data.user) {
        onLoginSuccess(data.user);
        if (data.user.role === 'admin' || data.user.role === 'gestor') {
          navigate('/portal-gestor');
          if (onNotify) onNotify('success', `Painel de Gestor activo: Bem-vindo(a), ${data.user.name}!`);
        } else {
          setUserCandidaturas(data.candidaturas && data.candidaturas.length > 0 ? data.candidaturas : INITIAL_CANDIDATURAS_CONSULTA);
          if (onNotify) onNotify('success', `Bem-vindo(a), ${data.user.name}!`);
        }
      } else {
        setLoginError(data.message || 'Credenciais incorrectas. Verifique os seus dados.');
      }
    } catch {
      // Fallback offline caso o servidor local esteja temporariamente inacessível
      const cleanIdent = loginIdentifier.trim().toLowerCase();
      if (
        (cleanIdent === 'admin' || cleanIdent === 'gestor' || cleanIdent.includes('sernic.gov.mz')) &&
        (loginPassword === 'admin123' || loginPassword === 'admin' || loginPassword === 'sernic2026')
      ) {
        const gestorUser = {
          id: 'gestor-sernic-01',
          name: 'Direcção de Recursos Humanos - SERNIC',
          nuit: 'gestor',
          email: 'drh@sernic.gov.mz',
          role: 'admin',
          cargo: 'Presidente do Júri',
          departamento: 'Comissão Central do Júri - SERNIC Sede'
        };
        onLoginSuccess(gestorUser);
        navigate('/portal-gestor');
        if (onNotify) onNotify('success', 'Painel de Gestor activo: Bem-vindo(a)!');
        return;
      }
      setLoginError('Falha de ligação ao servidor. Verifique a sua conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manipular Registo
  const handleRegister = (e) => {
    e.preventDefault();
    const errors = {};

    if (!regData.nome.trim()) errors.nome = 'Nome obrigatório.';
    if (!validarBI(regData.bi)) errors.bi = 'BI inválido (12 dígitos + 1 letra).';
    if (!validarNUIT(regData.nuit)) errors.nuit = 'NUIT inválido (9 dígitos).';
    if (!regData.email.includes('@')) errors.email = 'E-mail inválido.';
    if (!validarTelefoneMZ(regData.telefone)) errors.telefone = 'Telefone moçambicano inválido (ex: +258 000 000 000).';
    
    // Validação de segurança: apenas nível Normal ou Forte (Baixa/Fraca é recusada)
    const pwdStrength = evaluatePasswordStrength(regData.password);
    if (!pwdStrength.isValid) {
      errors.password = 'A palavra-passe tem nível Baixo. Para segurança oficial, é obrigatório atingir o nível Médio/Normal ou Forte.';
    }
    if (!regData.confirmPassword) {
      errors.confirmPassword = 'Por favor, confirme a sua palavra-passe.';
    } else if (regData.password !== regData.confirmPassword) {
      errors.confirmPassword = 'As palavras-passe não coincidem.';
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }

    const novoUsuario = {
      nuit: regData.nuit,
      name: regData.nome,
      email: regData.email,
      bi: regData.bi,
      telefone: regData.telefone,
      provincia: regData.provincia,
      role: 'candidate'
    };

    onLoginSuccess(novoUsuario);
    setUserCandidaturas([]);
    if (onNotify) onNotify('success', 'Conta de candidato criada e autenticada com sucesso!');
  };

  // ========================================================
  // AUTENTICAÇÃO / REGISTO COM CONTA GOOGLE
  // ========================================================
  const handleGoogleAuthAction = async (account) => {
    setGoogleLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          name: account.name,
          nuit: account.nuit
        })
      });
      const data = await res.json();

      if (data.success && data.user) {
        const authedUser = {
          ...data.user,
          authProvider: 'google',
          googleVerified: true,
          initial: account.initial || (account.name ? account.name.charAt(0).toUpperCase() : 'G'),
          genero: account.genero || 'Masculino'
        };
        onLoginSuccess(authedUser);
        const all = getStoredCandidaturas();
        const matched = all.filter(c => c.nuit === data.user.nuit || c.email?.toLowerCase() === account.email.toLowerCase());
        setUserCandidaturas(matched.length > 0 ? matched : (data.candidaturas?.length ? data.candidaturas : []));
        setGoogleLoading(false);
        setIsGoogleModalOpen(false);
        if (onNotify) onNotify('success', `Autenticado com a conta Google (${account.email}) com sucesso!`);
        return;
      }
    } catch {
      // Fallback local se backend offline
    }

    // Fallback local confiável
    setTimeout(() => {
      const all = getStoredCandidaturas();
      const matched = all.filter(c => c.email?.toLowerCase() === account.email.toLowerCase() || c.nuit === account.nuit);
      
      const googleUser = {
        name: account.name,
        email: account.email,
        nuit: account.nuit || ('10' + Math.floor(1000000 + Math.random() * 9000000)),
        bi: account.bi || ('110' + Math.floor(100000000 + Math.random() * 900000000) + 'M'),
        telefone: account.telefone || '+258 84 920 1823',
        provincia: 'Maputo Cidade',
        role: 'candidate',
        authProvider: 'google',
        googleVerified: true,
        initial: account.initial || (account.name ? account.name.charAt(0).toUpperCase() : 'G'),
        genero: account.genero || 'Masculino'
      };

      onLoginSuccess(googleUser);
      setUserCandidaturas(matched.length > 0 ? matched : all.slice(0, 1));
      setGoogleLoading(false);
      setIsGoogleModalOpen(false);
      if (onNotify) onNotify('success', `Conta Google (${account.email}) conectada com sucesso! Bem-vindo(a), ${account.name}!`);
    }, 500);
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    setCustomGoogleError('');

    if (!customGoogleEmail.trim() || !customGoogleEmail.includes('@')) {
      setCustomGoogleError('Introduza um endereço de e-mail da Google válido (ex: seu.nome@gmail.com).');
      return;
    }
    if (!customGoogleName.trim()) {
      setCustomGoogleError('Por favor, informe o seu Nome Completo.');
      return;
    }

    const newGoogleAccount = {
      id: 'custom-' + Date.now(),
      name: customGoogleName.trim(),
      email: customGoogleEmail.trim().toLowerCase(),
      initial: customGoogleName.trim().charAt(0).toUpperCase(),
      nuit: '10' + Math.floor(1000000 + Math.random() * 9000000),
      bi: '110' + Math.floor(100000000 + Math.random() * 900000000) + 'M',
      genero: 'Masculino'
    };

    handleGoogleAuthAction(newGoogleAccount);
  };

  // ========================================================
  // SE ESTIVER LOGADO: ÁREA PESSOAL DO CANDIDATO
  // ========================================================
  if (currentUser) {
    return (
      <div className="module-page-container">
        {/* TOPO DA ÁREA PESSOAL */}
        <div className="module-page-header">
          <div className="module-page-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: currentUser.authProvider === 'google' ? '#1a73e8' : '#0f2042', 
                color: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.3rem', 
                fontWeight: 900,
                position: 'relative'
              }}>
                {currentUser.name ? currentUser.name.charAt(0) : 'C'}
                {currentUser.authProvider === 'google' && (
                  <span style={{ 
                    position: 'absolute', 
                    bottom: '-2px', 
                    right: '-2px', 
                    background: '#ffffff', 
                    borderRadius: '50%', 
                    padding: '2px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    <GoogleIcon size={12} />
                  </span>
                )}
              </div>
              <div>
                <h2>Área Pessoal do Candidato</h2>
                <p>Bem-vindo(a), <strong>{currentUser.name}</strong> • NUIT: {currentUser.nuit} • BI: {currentUser.bi || 'Não especificado'}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn-vaga-candidatar"
              onClick={() => navigate('/portal-recrutamento/candidatura')}
              style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
            >
              <FileText size={16} />
              <span>Nova Candidatura</span>
            </button>

            <button
              type="button"
              className="btn-draft"
              onClick={onLogout}
              style={{ color: '#c32026', borderColor: '#fca5a5' }}
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO DA ÁREA PESSOAL */}
        <div className="candidate-dashboard-grid">
          {/* BARRA LATERAL COM DADOS DO CANDIDATO */}
          <div className="candidate-profile-sidebar">
            <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--portal-text-main)', borderBottom: '1px solid var(--portal-border)', paddingBottom: '0.6rem' }}>
              Dados do Utilizador
            </h4>

            <div style={{ fontSize: '0.84rem', lineHeight: 1.6, color: 'var(--portal-text-muted)' }}>
              <p><strong>Nome:</strong> {currentUser.name}</p>
              <p><strong>E-mail:</strong> {currentUser.email || 'Não registado'}</p>
              {currentUser.authProvider === 'google' && (
                <div className="google-verified-chip">
                  <GoogleIcon size={15} />
                  <span>Autenticado via Google ({currentUser.email})</span>
                </div>
              )}
              <p><strong>Telefone:</strong> {currentUser.telefone || '+258 84 000 0000'}</p>
              <p><strong>NUIT:</strong> {currentUser.nuit}</p>
              <p><strong>Província:</strong> {currentUser.provincia || 'Maputo Cidade'}</p>
              <p><strong>Estado da Conta:</strong> <span style={{ color: '#15803d', fontWeight: 800 }}>✓ Activa e Verificada</span></p>
            </div>

            <div style={{ borderTop: '1px solid var(--portal-border)', paddingTop: '1rem' }}>
              <div className="candidate-sidebar-tabs">
                <button
                  type="button"
                  className={`candidate-sidebar-tab-btn ${candidateTab === 'candidaturas' ? 'active' : ''}`}
                  onClick={() => setCandidateTab('candidaturas')}
                >
                  <FileText size={16} />
                  <span>As Minhas Candidaturas ({userCandidaturas.length})</span>
                </button>

                <button
                  type="button"
                  className={`candidate-sidebar-tab-btn ${candidateTab === 'notificacoes' ? 'active' : ''}`}
                  onClick={() => setCandidateTab('notificacoes')}
                >
                  <Bell size={16} />
                  <span>Notificações & Convocatórias (2)</span>
                </button>

                <button
                  type="button"
                  className={`candidate-sidebar-tab-btn ${candidateTab === 'perfil' ? 'active' : ''}`}
                  onClick={() => setCandidateTab('perfil')}
                >
                  <Edit3 size={16} />
                  <span>Actualizar Contactos</span>
                </button>
              </div>
            </div>
          </div>

          {/* ÁREA DE CONTEÚDO PRINCIPAL DO CANDIDATO */}
          <div>
            {/* SUB-ABA 1: AS MINHAS CANDIDATURAS */}
            {candidateTab === 'candidaturas' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '1rem' }}>
                  Processos de Candidatura Submetidos
                </h3>

                {userCandidaturas.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--portal-card-inner)', borderRadius: '12px', border: '1px solid var(--portal-border)' }}>
                    <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 0.8rem auto' }} />
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--portal-text-main)' }}>Ainda não submeteu nenhuma candidatura</h4>
                    <p style={{ fontSize: '0.86rem', color: 'var(--portal-text-muted)', marginBottom: '1.2rem' }}>
                      Consulte as vagas abertas e submeta a sua candidatura oficial agora mesmo.
                    </p>
                    <button
                      type="button"
                      className="btn-vaga-candidatar"
                      onClick={() => navigate('/portal-recrutamento/recrutamento')}
                      style={{ margin: '0 auto' }}
                    >
                      <ArrowRight size={16} />
                      <span>Ver Vagas Abertas</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {userCandidaturas.map((c, i) => (
                      <div 
                        key={i}
                        style={{
                          border: '1px solid var(--portal-border)',
                          borderRadius: '12px',
                          padding: '1.4rem',
                          backgroundColor: 'var(--portal-card-bg)',
                          boxShadow: 'var(--portal-shadow)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.6rem' }}>
                          <div>
                            <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Protocolo</span>
                            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--portal-text-main)' }}>
                              {c.codigoCandidatura}
                            </div>
                            <span style={{ fontSize: '0.86rem', color: 'var(--portal-gold)', fontWeight: 700 }}>
                              {c.carreira || c.vagaTitulo}
                            </span>
                          </div>

                          {(() => {
                            const isFem = detectCandidateGender(c) === 'Feminino';
                            let badgeBg = '#f1f5f9';
                            let badgeColor = '#475569';
                            let badgeLabel = '1ª Fase: Em Análise Documental';

                            if (c.status === 'Admitido na Análise Documental' || c.status === 'Admitida na Análise Documental') {
                              badgeBg = '#dcfce7';
                              badgeColor = '#15803d';
                              badgeLabel = isFem ? '1ª Fase: Admitida na Análise' : '1ª Fase: Admitido na Análise';
                            } else if (c.status === 'Excluído na Análise Documental' || c.status === 'Excluída na Análise Documental') {
                              badgeBg = '#fee2e2';
                              badgeColor = '#b91c1c';
                              badgeLabel = isFem ? '1ª Fase: Excluída (Documental)' : '1ª Fase: Excluído (Documental)';
                            } else if (c.status === 'Entrevista Profissional' || c.status === 'Convocada para provas' || c.status === 'Convocado' || c.status === 'Convocada') {
                              badgeBg = '#dbeafe';
                              badgeColor = '#1d4ed8';
                              badgeLabel = isFem ? '2ª Fase: Convocada (Entrevista)' : '2ª Fase: Convocado (Entrevista)';
                            } else if (c.status === 'Excluído na Entrevista' || c.status === 'Excluída na Entrevista') {
                              badgeBg = '#fee2e2';
                              badgeColor = '#b91c1c';
                              badgeLabel = isFem ? '2ª Fase: Excluída (< 10 val)' : '2ª Fase: Excluído (< 10 val)';
                            } else if (c.status === 'Admitido' || c.status === 'Admitida') {
                              badgeBg = '#dcfce7';
                              badgeColor = '#15803d';
                              badgeLabel = isFem ? '3ª Fase: Admitida (Vaga Efetiva)' : '3ª Fase: Admitido (Vaga Efetiva)';
                            } else if (c.status === 'Aprovado (Suplente)' || c.status === 'Aprovada (Suplente)') {
                              badgeBg = '#fef3c7';
                              badgeColor = '#b45309';
                              badgeLabel = isFem ? '3ª Fase: Suplente (Aprovada)' : '3ª Fase: Suplente (Aprovado)';
                            } else if (c.status === 'Excluído' || c.status === 'Excluída') {
                              badgeBg = '#fee2e2';
                              badgeColor = '#c32026';
                              badgeLabel = isFem ? 'Excluída' : 'Excluído';
                            }

                            return (
                              <span 
                                style={{
                                  backgroundColor: badgeBg,
                                  color: badgeColor,
                                  padding: '0.35rem 0.85rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  letterSpacing: '0.02em',
                                  border: `1px solid ${badgeColor}33`,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem'
                                }}
                              >
                                {badgeLabel}
                              </span>
                            );
                          })()}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem', marginTop: '0.6rem', fontSize: '0.82rem', color: '#64748b' }}>
                          <span>Submetida em: {new Date(c.dataSubmissao).toLocaleDateString('pt-MZ')}</span>
                          <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <button
                              type="button"
                              className="btn-draft"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                              onClick={() => {
                                navigate('/portal-recrutamento/consulta');
                              }}
                            >
                              Ver Estado Detalhado
                            </button>
                            <button
                              type="button"
                              className="btn-vaga-candidatar"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                              onClick={() => window.print()}
                            >
                              <Printer size={14} />
                              <span>2ª Via Comprovativo</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-ABA 2: NOTIFICAÇÕES */}
            {candidateTab === 'notificacoes' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '1rem' }}>
                  Avisos e Notificações Oficiais da Comissão
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ padding: '1.2rem', backgroundColor: 'var(--portal-card-inner)', border: '1px solid var(--portal-border)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <strong style={{ color: '#0284c7', fontSize: '0.92rem' }}>Convocatória para Prova Escrita de Conhecimentos</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--portal-text-muted)' }}>20 Outubro 2026</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--portal-text-muted)', lineHeight: 1.5 }}>
                      {userCandidaturas?.[0] && detectCandidateGender(userCandidaturas[0]) === 'Feminino'
                        ? 'A candidata foi convocada para a realização da prova de conhecimentos gerais a ter lugar na Academia de Ciências Policiais (ACIPOL), Maputo, no dia 15 de Novembro de 2026, às 08h00.'
                        : 'O candidato foi convocado para a realização da prova de conhecimentos gerais a ter lugar na Academia de Ciências Policiais (ACIPOL), Maputo, no dia 15 de Novembro de 2026, às 08h00.'}
                    </p>
                  </div>

                  <div style={{ padding: '1.2rem', backgroundColor: 'var(--portal-card-inner)', border: '1px solid var(--portal-border)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <strong style={{ color: '#16a34a', fontSize: '0.92rem' }}>Confirmação de Validação Curricular</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--portal-text-muted)' }}>15 Outubro 2026</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--portal-text-muted)', lineHeight: 1.5 }}>
                      A documentação apresentada referente ao Bilhete de Identidade e Certificado de Habilitações foi aprovada pela subcomissão de triagem documental.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-ABA 3: ACTUALIZAR CONTACTOS */}
            {candidateTab === 'perfil' && (
              <div style={{ background: 'var(--portal-card-bg)', border: '1px solid var(--portal-border)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '1.2rem' }}>
                  Actualização de Dados de Contacto
                </h3>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Telefone Principal</label>
                    <input type="tel" className="form-input" defaultValue={currentUser.telefone || '+258 00 000 0000'} />
                  </div>
                  <div className="form-group">
                    <label>E-mail Oficial</label>
                    <input type="email" className="form-input" defaultValue={currentUser.email || ''} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Província de Residência</label>
                    <select className="form-select" defaultValue={currentUser.provincia || 'Maputo Cidade'}>
                      {PROVINCIAS_GEOGRAFICAS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-vaga-candidatar"
                    onClick={() => {
                      if (onNotify) onNotify('success', 'Dados de contacto actualizados com sucesso!');
                    }}
                  >
                    <span>Gravar Alterações</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // SE NÃO ESTIVER LOGADO: FORMULÁRIOS DE AUTENTICAÇÃO
  // ========================================================
  return (
    <div className="auth-standalone-container">
      <div className="auth-wrapper-card">
        {/* ABAS SEGMENTADAS ELEGANTES */}
        <div className="auth-segmented-tabs">
          <button
            type="button"
            className={`auth-segmented-btn ${authTab === 'login' ? 'active' : ''}`}
            onClick={() => setAuthTab('login')}
          >
            <LogIn size={16} />
            <span>Iniciar Sessão</span>
          </button>
          <button
            type="button"
            className={`auth-segmented-btn ${authTab === 'register' ? 'active' : ''}`}
            onClick={() => setAuthTab('register')}
          >
            <UserPlus size={16} />
            <span>Criar Conta</span>
          </button>
          <button
            type="button"
            className={`auth-segmented-btn ${authTab === 'forgot' ? 'active' : ''}`}
            onClick={() => setAuthTab('forgot')}
          >
            <KeyRound size={16} />
            <span>Recuperar Senha</span>
          </button>
        </div>

        {/* ABA 1: INICIAR SESSÃO */}
        {authTab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="auth-header-block">
              <span className="auth-header-badge">Autenticação Oficial</span>
              <h3 className="auth-header-title">Área do Candidato</h3>
              <p className="auth-header-sub">
                Aceda com as suas credenciais para gerir os seus processos no SERNIC.
              </p>
            </div>

            {/* OPÇÃO DE LOGIN COM GOOGLE */}
            <div className="auth-social-section">
              <button
                type="button"
                className="btn-google-auth"
                onClick={() => {
                  setLoginError('');
                  setShowCustomGoogle(false);
                  setIsGoogleModalOpen(true);
                }}
              >
                <GoogleIcon />
                <span>Continuar com o Google</span>
              </button>

              <div className="auth-or-divider">
                <span>ou utilize a sua conta SERNIC / NUIT</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label>NUIT ou Correio Eletrónico</label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  className="auth-form-input"
                  placeholder="Introduza o NUIT ou E-mail"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ margin: 0 }}>Palavra-passe</label>
                <button
                  type="button"
                  onClick={() => setAuthTab('forgot')}
                  style={{ background: 'none', border: 'none', color: '#c32026', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-form-input"
                  placeholder="Introduza a sua palavra-passe"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ paddingRight: '2.8rem' }}
                />
                <button
                  type="button"
                  className="auth-toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div style={{ marginBottom: '1.2rem', padding: '0.8rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={17} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-auth-primary"
              disabled={isSubmitting}
            >
              <LogIn size={18} />
              <span>{isSubmitting ? 'A Autenticar...' : 'Entrar no Sistema'}</span>
            </button>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  const gestorUser = {
                    id: 'gestor-sernic-01',
                    name: 'Direcção de Recursos Humanos - SERNIC',
                    nuit: 'gestor',
                    email: 'drh@sernic.gov.mz',
                    role: 'admin',
                    cargo: 'Presidente do Júri',
                    departamento: 'Comissão Central do Júri - SERNIC Sede'
                  };
                  onLoginSuccess(gestorUser);
                  navigate('/portal-gestor');
                  if (onNotify) onNotify('success', 'Acesso autorizado ao Painel do Gestor e Júri.');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c32026',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <ShieldCheck size={16} />
                <span>Área Restrita: Aceder ao Painel de Gestão & Júri do Concurso</span>
              </button>
            </div>

          </form>
        )}

        {/* ABA 2: CRIAR CONTA */}
        {authTab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="auth-header-block">
              <span className="auth-header-badge">Novo Registo</span>
              <h3 className="auth-header-title">Criar Conta de Candidato</h3>
              <p className="auth-header-sub">
                Preencha os dados oficiais para submeter e gerir as suas candidaturas.
              </p>
            </div>

            {/* OPÇÃO DE CADASTRO COM GOOGLE */}
            <div className="auth-social-section">
              <button
                type="button"
                className="btn-google-auth btn-google-register"
                onClick={() => {
                  setRegErrors({});
                  setShowCustomGoogle(false);
                  setIsGoogleModalOpen(true);
                }}
              >
                <GoogleIcon />
                <span>Cadastrar com Conta Google (Acesso Imediato)</span>
              </button>

              <div className="auth-or-divider">
                <span>ou preencha os seus dados manualmente</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Nome Completo <span style={{ color: '#c32026' }}>*</span></label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  className={`auth-form-input ${regErrors.nome ? 'error' : ''}`}
                  placeholder="Nome completo conforme identificação"
                  value={regData.nome}
                  onChange={(e) => setRegData({ ...regData, nome: e.target.value })}
                />
              </div>
              {regErrors.nome && <span className="form-error-msg">{regErrors.nome}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Bilhete de Identidade (BI) <span style={{ color: '#c32026' }}>*</span></label>
                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <CreditCard size={18} />
                  </span>
                  <input
                    type="text"
                    maxLength={13}
                    className={`auth-form-input ${regErrors.bi ? 'error' : ''}`}
                    placeholder="Ex: 000000000000M"
                    value={regData.bi}
                    onChange={(e) => setRegData({ ...regData, bi: e.target.value.toUpperCase() })}
                  />
                </div>
                {regErrors.bi && <span className="form-error-msg">{regErrors.bi}</span>}
              </div>

              <div className="form-group">
                <label>NUIT <span style={{ color: '#c32026' }}>*</span></label>
                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <Hash size={18} />
                  </span>
                  <input
                    type="text"
                    maxLength={9}
                    className={`auth-form-input ${regErrors.nuit ? 'error' : ''}`}
                    placeholder="Ex: 123456789"
                    value={regData.nuit}
                    onChange={(e) => setRegData({ ...regData, nuit: e.target.value })}
                  />
                </div>
                {regErrors.nuit && <span className="form-error-msg">{regErrors.nuit}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Correio Eletrónico <span style={{ color: '#c32026' }}>*</span></label>
                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    className={`auth-form-input ${regErrors.email ? 'error' : ''}`}
                    placeholder="exemplo@mz.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  />
                </div>
                {regErrors.email && <span className="form-error-msg">{regErrors.email}</span>}
              </div>

              <div className="form-group">
                <label>Telefone Principal <span style={{ color: '#c32026' }}>*</span></label>
                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <Phone size={18} />
                  </span>
                  <input
                    type="tel"
                    className={`auth-form-input ${regData.telefone === '+258 000 000 000' ? 'input-example-val' : ''} ${regErrors.telefone ? 'error' : ''}`}
                    placeholder="+258 000 000 000"
                    value={regData.telefone}
                    onChange={(e) => setRegData({ ...regData, telefone: formatTelefoneMZInput(e.target.value) })}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && e.target.selectionStart <= 5 && e.target.selectionEnd <= 5) e.preventDefault();
                      if (e.key === 'Delete' && e.target.selectionStart < 5) e.preventDefault();
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '+258 000 000 000') {
                        setTimeout(() => {
                          try {
                            e.target.setSelectionRange(5, 16);
                          } catch {}
                        }, 20);
                      }
                    }}
                  />
                </div>
                {regErrors.telefone && <span className="form-error-msg">{regErrors.telefone}</span>}
              </div>
            </div>

            {/* SELECÇÃO DE PALAVRA-PASSE COM MEDIDOR DE NÍVEL DE SEGURANÇA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.4rem' }}>
              <div className="form-group">
                <label>Palavra-passe <span style={{ color: '#c32026' }}>*</span></label>
                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    className={`auth-form-input ${regErrors.password ? 'error' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    style={{ paddingRight: '2.8rem' }}
                  />
                  <button
                    type="button"
                    className="auth-toggle-pwd"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    aria-label={showRegPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {regErrors.password && <span className="form-error-msg">{regErrors.password}</span>}

                {/* BARRA DE NÍVEL DE PALAVRA-PASSE */}
                {(() => {
                  const strength = evaluatePasswordStrength(regData.password);
                  return (
                    <div className="pwd-strength-box">
                      <div className="pwd-strength-header">
                        <span className="pwd-strength-title">Nível da Senha:</span>
                        <span className="pwd-strength-badge" style={{ color: strength.color }}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="pwd-strength-track">
                        <div 
                          className="pwd-strength-fill" 
                          style={{ 
                            width: `${strength.percent}%`, 
                            backgroundColor: strength.color 
                          }} 
                        />
                      </div>
                      <span className="pwd-strength-feedback" style={{ color: strength.color }}>
                        {strength.feedback}
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="form-group">
                <label>Confirmar Palavra-passe <span style={{ color: '#c32026' }}>*</span></label>
                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    className={`auth-form-input ${regErrors.confirmPassword ? 'error' : ''}`}
                    placeholder="Repita a palavra-passe"
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                    style={{ paddingRight: '2.8rem' }}
                  />
                  <button
                    type="button"
                    className="auth-toggle-pwd"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    aria-label={showRegConfirmPassword ? 'Ocultar confirmação' : 'Ver confirmação'}
                  >
                    {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {regErrors.confirmPassword && <span className="form-error-msg">{regErrors.confirmPassword}</span>}

                {/* STATUS DE COINCIDÊNCIA DE PALAVRA-PASSE */}
                {regData.confirmPassword ? (
                  <div className={`pwd-confirm-status ${regData.password === regData.confirmPassword ? 'match' : 'mismatch'}`}>
                    {regData.password === regData.confirmPassword ? (
                      <>
                        <CheckCircle2 size={15} />
                        <span>As palavras-passe coincidem</span>
                      </>
                    ) : (
                      <>
                        <X size={15} />
                        <span>As palavras-passe não coincidem</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', marginTop: '0.4rem', opacity: 0.7 }}>
                    Digite a mesma palavra-passe para confirmação.
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn-auth-primary"
            >
              <UserPlus size={18} />
              <span>Criar Conta & Entrar</span>
            </button>
          </form>
        )}

        {/* ABA 3: RECUPERAR SENHA */}
        {authTab === 'forgot' && (
          <div>
            <div className="auth-header-block">
              <div className="auth-icon-circle">
                <KeyRound size={24} />
              </div>
              <h3 className="auth-header-title">Recuperação de Palavra-passe</h3>
              <p className="auth-header-sub">
                Introduza o correio eletrónico associado à sua conta para receber as instruções de recuperação.
              </p>
            </div>

            {forgotSuccess ? (
              <div style={{ padding: '1.4rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '12px', color: '#15803d', textAlign: 'center' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.6rem auto' }} />
                <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.3rem' }}>Instruções Enviadas</strong>
                <p style={{ fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                  Verifique a sua caixa de entrada ({forgotEmail}) para redefinir o acesso à sua conta.
                </p>
                <button
                  type="button"
                  className="btn-auth-primary"
                  onClick={() => {
                    setForgotSuccess(false);
                    setAuthTab('login');
                  }}
                  style={{ marginTop: '1.2rem' }}
                >
                  <LogIn size={18} />
                  <span>Voltar ao Início de Sessão</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                  <label>Correio Eletrónico Registado</label>
                  <div className="auth-input-group">
                    <span className="auth-input-icon">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="auth-form-input"
                      placeholder="seu.email@exemplo.mz"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-auth-primary"
                  onClick={() => {
                    if (!forgotEmail || !forgotEmail.includes('@')) {
                      alert('Por favor, informe um endereço de e-mail válido.');
                      return;
                    }
                    setForgotSuccess(true);
                  }}
                >
                  <KeyRound size={18} />
                  <span>Enviar Instruções de Recuperação</span>
                </button>

                <div style={{ marginTop: '1.3rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setAuthTab('login')}
                    style={{ background: 'none', border: 'none', color: '#c32026', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ← Voltar ao Início de Sessão
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            MODAL OFICIAL DE CONTA GOOGLE (POPUP OAUTH 2.0)
            ======================================================== */}
        {isGoogleModalOpen && (
          <div 
            className="google-modal-overlay" 
            onClick={() => !googleLoading && setIsGoogleModalOpen(false)}
          >
            <div 
              className="google-modal-card" 
              onClick={(e) => e.stopPropagation()}
            >
              {/* CABEÇALHO GOOGLE */}
              <div className="google-modal-header">
                <button
                  type="button"
                  className="google-modal-close"
                  onClick={() => !googleLoading && setIsGoogleModalOpen(false)}
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>

                <div className="google-modal-logo-wrap">
                  <GoogleIcon size={34} />
                </div>

                <h3 className="google-modal-title">Fazer login com o Google</h3>
                <p className="google-modal-subtitle">
                  Escolha uma conta para aceder à Plataforma de Recrutamento do SERNIC
                </p>
              </div>

              {/* LISTA DE CONTAS GOOGLE RECONHECIDAS */}
              {!showCustomGoogle ? (
                <div className="google-accounts-list">
                  {GOOGLE_PRESET_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      className="google-account-btn"
                      disabled={googleLoading}
                      onClick={() => handleGoogleAuthAction(acc)}
                    >
                      <div className="google-account-avatar" style={{ backgroundColor: acc.bg }}>
                        {acc.initial}
                      </div>
                      <div className="google-account-info">
                        <span className="google-account-name">{acc.name}</span>
                        <span className="google-account-email">{acc.email}</span>
                      </div>
                      <span className="google-account-action-tag">Aceder</span>
                    </button>
                  ))}

                  {/* OPÇÃO DE INSERIR OUTRO EMAIL GOOGLE */}
                  <button
                    type="button"
                    className="google-account-btn"
                    style={{ borderStyle: 'dashed', borderColor: '#cbd5e1', marginTop: '0.4rem' }}
                    onClick={() => {
                      setShowCustomGoogle(true);
                      setCustomGoogleError('');
                    }}
                  >
                    <div className="google-account-avatar" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                      <UserPlus size={18} />
                    </div>
                    <div className="google-account-info">
                      <span className="google-account-name">Utilizar outra conta Google...</span>
                      <span className="google-account-email">Registar com qualquer e-mail @gmail.com</span>
                    </div>
                  </button>
                </div>
              ) : (
                /* FORMULÁRIO PARA OUTRO EMAIL GOOGLE */
                <form onSubmit={handleCustomGoogleSubmit} className="google-custom-form-wrap">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--portal-text-main)' }}>
                      Cadastrar Novo E-mail da Google
                    </strong>
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogle(false)}
                      style={{ background: 'none', border: 'none', color: '#1a73e8', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ← Voltar às contas
                    </button>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Nome Completo *</label>
                    <input
                      type="text"
                      className="auth-form-input"
                      placeholder="Ex: Alberto Mário Mondlane"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      style={{ height: '44px', paddingLeft: '1rem' }}
                      autoFocus
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Endereço E-mail Google (@gmail.com) *</label>
                    <input
                      type="email"
                      className="auth-form-input"
                      placeholder="exemplo.candidato@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      style={{ height: '44px', paddingLeft: '1rem' }}
                    />
                  </div>

                  {customGoogleError && (
                    <div style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.8rem' }}>
                      {customGoogleError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-auth-primary"
                    disabled={googleLoading}
                    style={{ height: '44px', background: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)', boxShadow: '0 4px 14px rgba(26, 115, 232, 0.4)' }}
                  >
                    <GoogleIcon size={18} />
                    <span>{googleLoading ? 'A conectar com a Google...' : 'Cadastrar e Iniciar Sessão'}</span>
                  </button>
                </form>
              )}

              {/* RODAPÉ INFORMATIVO OFICIAL */}
              <div className="google-modal-footer">
                Para continuar, a Google partilhará o seu nome, endereço de e-mail e fotografia com a plataforma de Concursos Públicos do SERNIC.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
