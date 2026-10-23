import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose, t, onNotify }) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(t.fill_all_fields);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        onNotify('success', data.message);
      } else {
        setError(data.message || 'Erro ao processar solicitação.');
      }
    } catch (err) {
      setError('Falha de ligação ao servidor SERNIC.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div>
            <h3 className="modal-title">{t.forgot_title}</h3>
            <p className="modal-subtitle">{t.forgot_desc}</p>
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

        {result ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={54} color="#22c55e" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Solicitação Processada</h4>
            <p style={{ color: 'var(--input-placeholder)', fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              {result.message}
            </p>
            {result.codigoVerificacaoDemo && (
              <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', marginBottom: '1.5rem', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.08em', color: '#c32026' }}>
                Código de Teste: {result.codigoVerificacaoDemo}
              </div>
            )}
            <button type="button" className="btn-primary-action" onClick={onClose}>
              {t.btn_close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="field-label">{t.placeholder_user}</label>
              <input
                type="text"
                className="field-input"
                placeholder="Ex: 100234567 ou email@candidato.mz"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
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
                {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                <span>{t.btn_send_code}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
