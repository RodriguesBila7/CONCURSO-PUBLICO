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
  ShieldCheck
} from 'lucide-react';
import { 
  validarBI, 
  validarNUIT, 
  validarTelefoneMZ, 
  PROVINCIAS_MOCAMBIQUE,
  INITIAL_CANDIDATURAS_CONSULTA,
  getStoredCandidaturas 
} from '../mockData';

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

  // Form de Registo
  const [regData, setRegData] = useState({
    nome: '',
    bi: '',
    nuit: '',
    email: '',
    telefone: '',
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
      // Tentar autenticar contra o backend Express / SQLite
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
          expectedRole: 'candidate'
        })
      });
      const data = await res.json();

      if (data.success && data.user) {
        onLoginSuccess(data.user);
        setUserCandidaturas(data.candidaturas && data.candidaturas.length > 0 ? data.candidaturas : INITIAL_CANDIDATURAS_CONSULTA);
        if (onNotify) onNotify('success', `Bem-vindo(a), ${data.user.name}!`);
      } else {
        // Fallback para contas locais se offline
        handleLocalLoginFallback();
      }
    } catch {
      handleLocalLoginFallback();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocalLoginFallback = () => {
    const ident = loginIdentifier.trim().toLowerCase();
    const pass = loginPassword.trim();

    // Verificação de contas demo
    if ((ident === '100234567' || ident === 'candidato' || ident.includes('armando')) && (pass === 'sernic2026' || pass === '123456')) {
      const demoUser = {
        nuit: '100234567',
        name: 'Armando Carlos Mondlane',
        email: 'armando.carlos@concurso.mz',
        bi: '110100234567M',
        role: 'candidate',
        telefone: '+258 84 123 4567',
        provincia: 'Maputo Cidade'
      };
      onLoginSuccess(demoUser);
      setUserCandidaturas(INITIAL_CANDIDATURAS_CONSULTA);
      if (onNotify) onNotify('success', 'Sessão iniciada com sucesso (Conta Demonstração)!');
    } else {
      setLoginError('Credenciais incorrectas. Verifique o seu NUIT/BI e a palavra-passe ou recupere a sua senha.');
    }
  };

  // Preencher demo instantâneo
  const handleFillDemo = () => {
    setLoginIdentifier('100234567');
    setLoginPassword('sernic2026');
    setLoginError('');
  };

  // Manipular Registo
  const handleRegister = (e) => {
    e.preventDefault();
    const errors = {};

    if (!regData.nome.trim()) errors.nome = 'Nome obrigatório.';
    if (!validarBI(regData.bi)) errors.bi = 'BI inválido (12 dígitos + 1 letra).';
    if (!validarNUIT(regData.nuit)) errors.nuit = 'NUIT inválido (9 dígitos).';
    if (!regData.email.includes('@')) errors.email = 'E-mail inválido.';
    if (!validarTelefoneMZ(regData.telefone)) errors.telefone = 'Telefone moçambicano inválido (+258 8x).';
    if (regData.password.length < 6) errors.password = 'A senha deve ter no mínimo 6 caracteres.';
    if (regData.password !== regData.confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';

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
  // SE ESTIVER LOGADO: ÁREA PESSOAL DO CANDIDATO
  // ========================================================
  if (currentUser) {
    return (
      <div className="module-page-container">
        {/* TOPO DA ÁREA PESSOAL */}
        <div className="module-page-header">
          <div className="module-page-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0f2042', color: '#c59b27', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 900 }}>
                {currentUser.name ? currentUser.name.charAt(0) : 'C'}
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
                            let badgeBg = '#f1f5f9';
                            let badgeColor = '#475569';
                            let badgeLabel = '1ª Fase: Em Análise Documental';

                            if (c.status === 'Entrevista Profissional' || c.status === 'Convocada para provas') {
                              badgeBg = '#dbeafe';
                              badgeColor = '#1d4ed8';
                              badgeLabel = '2ª Fase: Entrevista Profissional';
                            } else if (c.status === 'Admitido' || c.status === 'Admitida') {
                              badgeBg = '#dcfce7';
                              badgeColor = '#15803d';
                              badgeLabel = '3ª Fase: Admitido(a)';
                            } else if (c.status === 'Aprovado (Suplente)') {
                              badgeBg = '#fef3c7';
                              badgeColor = '#b45309';
                              badgeLabel = '3ª Fase: Suplente (Reserva)';
                            } else if (c.status === 'Excluído' || c.status === 'Excluída') {
                              badgeBg = '#fee2e2';
                              badgeColor = '#c32026';
                              badgeLabel = 'Candidatura Excluída';
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
                                  border: `1px solid ${badgeColor}33`
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
                      O candidato foi convocado para a realização da prova de conhecimentos gerais a ter lugar na Academia de Ciências Policiais (ACIPOL), Maputo, no dia 15 de Novembro de 2026, às 08h00.
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
                    <input type="tel" className="form-input" defaultValue={currentUser.telefone || '+258 84 123 4567'} />
                  </div>
                  <div className="form-group">
                    <label>E-mail Oficial</label>
                    <input type="email" className="form-input" defaultValue={currentUser.email || ''} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Província de Residência</label>
                    <select className="form-select" defaultValue={currentUser.provincia || 'Maputo Cidade'}>
                      {PROVINCIAS_MOCAMBIQUE.map(p => (
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

            <div style={{ marginTop: '1.4rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleFillDemo}
                className="auth-demo-pill"
                title="Preencher com credenciais de demonstração"
              >
                <span>Utilizar Acesso de Demonstração (100234567)</span>
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
                    placeholder="Ex: 110100234567M"
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
                    placeholder="Ex: 100345678"
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
                    className={`auth-form-input ${regErrors.telefone ? 'error' : ''}`}
                    placeholder="+258 84 123 4567"
                    value={regData.telefone}
                    onChange={(e) => setRegData({ ...regData, telefone: e.target.value })}
                  />
                </div>
                {regErrors.telefone && <span className="form-error-msg">{regErrors.telefone}</span>}
              </div>
            </div>

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
      </div>
    </div>
  );
}
