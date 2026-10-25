import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function SolicitarAcessoModal({ isOpen, onClose, t, onNotify }) {
  const [formData, setFormData] = useState({
    nuit: '',
    nomeCompleto: '',
    email: '',
    telefone: '',
    bi: '',
    carreira: 'Investigador Criminal de 2ª Classe',
    nivelAcademico: 'Licenciatura em Direito / Ciências Policiais',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nuit || !formData.nomeCompleto || !formData.email || !formData.telefone) {
      setError(t.fill_all_fields);
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem. Por favor, verifique.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/candidaturas/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessResult(data);
        onNotify('success', data.message);
      } else {
        setError(data.message || 'Falha ao processar candidatura.');
      }
    } catch (err) {
      setError('Erro de ligação ao servidor do SERNIC.');
    } finally {
      setLoading(false);
    }
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div>
            <h3 className="modal-title">{t.request_title}</h3>
            <p className="modal-subtitle">{t.request_subtitle}</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: 600 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successResult ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: '70px', height: '70px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <ShieldCheck size={42} color="#22c55e" />
            </div>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--card-title)' }}>
              Candidatura Submetida com Sucesso!
            </h4>
            <p style={{ color: 'var(--input-placeholder)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              O seu registo foi gravado no banco de dados SQLite do SERNIC. Guarde o número de protocolo abaixo para consultas futuras.
            </p>

            <div style={{ padding: '1.25rem', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--input-placeholder)' }}>Protocolo Oficial:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c32026', fontFamily: 'monospace' }}>
                  {successResult.codigoCandidatura}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--input-placeholder)' }}>Candidato:</span>
                <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>{successResult.detalhes?.nome}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--input-placeholder)' }}>Carreira:</span>
                <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{successResult.detalhes?.carreira}</span>
              </div>
            </div>

            <button type="button" className="btn-primary-action" onClick={onClose}>
              {t.btn_close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-field">
                <label className="field-label">NUIT (Número de Identificação Tributária) *</label>
                <input
                  type="text"
                  name="nuit"
                  className="field-input"
                  placeholder="Ex: 123456789"
                  value={formData.nuit}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label className="field-label">{t.full_name} *</label>
                <input
                  type="text"
                  name="nomeCompleto"
                  className="field-input"
                  placeholder="Ex: Alberto João Matsinhe"
                  value={formData.nomeCompleto}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label className="field-label">E-mail *</label>
                <input
                  type="email"
                  name="email"
                  className="field-input"
                  placeholder="Ex: alberto.matsinhe@exemplo.mz"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label className="field-label">{t.phone} *</label>
                <input
                  type="tel"
                  name="telefone"
                  className="field-input"
                  placeholder="Ex: +258 84 000 0000"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label className="field-label">{t.bi_number}</label>
                <input
                  type="text"
                  name="bi"
                  className="field-input"
                  placeholder="Ex: 000000000000M"
                  value={formData.bi}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label className="field-label">{t.career_choice} *</label>
                <select
                  name="carreira"
                  className="field-select"
                  value={formData.carreira}
                  onChange={handleChange}
                >
                  <option value="Investigador Criminal de 2ª Classe">Investigador Criminal de 2ª Classe</option>
                  <option value="Perito Forense de Laboratório e Balística">Perito Forense de Laboratório e Balística</option>
                  <option value="Especialista em Dactiloscopia e Identificação">Especialista em Dactiloscopia e Identificação</option>
                  <option value="Técnico de Informática Forense e Cibercrime">Técnico de Informática Forense e Cibercrime</option>
                  <option value="Instrutor e Secretário de Processo Penal">Instrutor e Secretário de Processo Penal</option>
                </select>
              </div>

              <div className="form-field">
                <label className="field-label">{t.academic_level}</label>
                <select
                  name="nivelAcademico"
                  className="field-select"
                  value={formData.nivelAcademico}
                  onChange={handleChange}
                >
                  <option value="Licenciatura em Direito / Ciências Policiais">Licenciatura em Direito / Ciências Policiais</option>
                  <option value="Licenciatura em Informática / Engenharia de Redes">Licenciatura em Informática / Engenharia</option>
                  <option value="Licenciatura em Medicina / Biologia Forense">Licenciatura em Medicina / Biologia Forense</option>
                  <option value="Bacharelato ou Equivalente">Bacharelato ou Equivalente</option>
                  <option value="Nível Médio Geral (12ª Classe)">Nível Médio Geral (12ª Classe)</option>
                </select>
              </div>

              <div className="form-field">
                <label className="field-label">{t.create_password}</label>
                <input
                  type="password"
                  name="password"
                  className="field-input"
                  placeholder="Defina uma senha"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label className="field-label">Confirmar Senha</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="field-input"
                  placeholder="Repita a senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button
                type="button"
                className="btn-primary-action"
                style={{ backgroundColor: '#64748b' }}
                onClick={onClose}
              >
                {t.btn_cancel}
              </button>
              <button
                type="submit"
                className="btn-primary-action"
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                <span>{t.btn_submit_application}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  ) : null;
}
