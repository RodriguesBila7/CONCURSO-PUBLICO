import React from 'react';
import { createPortal } from 'react-dom';
import { User, LogOut, CheckCircle2, FileText, Calendar, Award, ShieldAlert, Sparkles, Users, Briefcase } from 'lucide-react';

export default function CandidateDashboardModal({ user, candidaturas, onLogout, t }) {
  if (!user) return null;

  const isGestor = user.role === 'admin' || user.role === 'gestor';
  const currentCandidatura = candidaturas && candidaturas.length > 0 ? candidaturas[0] : null;

  return typeof document !== 'undefined' ? createPortal(
    <div className="modal-overlay">
      <div className="modal-content-card" style={{ maxWidth: isGestor ? '800px' : '650px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--input-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: isGestor ? '#1e293b' : '#c32026', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem' }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--card-title)' }}>{user.name}</h3>
                <span style={{ backgroundColor: isGestor ? '#e0e7ff' : '#dcfce7', color: isGestor ? '#3730a3' : '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '9999px', textTransform: 'uppercase' }}>
                  {isGestor ? 'Gestor do Concurso' : 'Candidato Oficial'}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--input-placeholder)' }}>
                Identificador: {user.nuit} • {user.email || 'Contacto Oficial'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.45rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
          >
            <LogOut size={16} />
            <span>{t.btn_logout}</span>
          </button>
        </div>

        {/* GESTOR VIEW */}
        {isGestor ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1.2rem', backgroundColor: 'rgba(195, 32, 38, 0.08)', borderRadius: '12px', border: '1px solid rgba(195, 32, 38, 0.2)' }}>
                <span style={{ fontSize: '0.8rem', color: '#c32026', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <Users size={18} /> Total de Candidaturas
                </span>
                <strong style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--card-title)' }}>
                  {candidaturas ? candidaturas.length : 0}
                </strong>
              </div>

              <div style={{ padding: '1.2rem', backgroundColor: 'rgba(34, 197, 94, 0.08)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <CheckCircle2 size={18} /> Estado do Sistema
                </span>
                <strong style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534' }}>
                  Base SQLite Activa
                </strong>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--card-title)', marginBottom: '0.85rem' }}>
              Candidaturas Registadas no Concurso
            </h4>

            {candidaturas && candidaturas.length > 0 ? (
              <div style={{ overflowX: 'auto', border: '1px solid var(--input-border)', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderBottom: '1px solid var(--input-border)' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Protocolo</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Nome Completo</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Carreira</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Data</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidaturas.map((c, i) => (
                      <tr key={c.id || i} style={{ borderBottom: '1px solid var(--input-border)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: '#c32026' }}>
                          {c.codigo_candidatura}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{c.nome_completo || c.nuit}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{c.carreira}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{new Date(c.data_submissao).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d' }}>
                            {c.status || 'Submetida'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--input-placeholder)', fontSize: '0.9rem' }}>Nenhuma candidatura registada ainda.</p>
            )}
          </div>
        ) : currentCandidatura ? (
          /* CANDIDATE VIEW */
          <div>
            <div style={{ padding: '1.25rem', backgroundColor: 'rgba(195, 32, 38, 0.05)', borderRadius: '12px', border: '1px solid rgba(195, 32, 38, 0.2)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c32026', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Award size={18} /> {t.candidature_status}
                </span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800, backgroundColor: '#22c55e', color: '#ffffff' }}>
                  {currentCandidatura.status || 'Em Processamento'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--card-title)' }}>
                {currentCandidatura.carreira}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--input-placeholder)' }}>
                {t.protocol_number}: <strong style={{ color: '#c32026', fontFamily: 'monospace' }}>{currentCandidatura.codigo_candidatura}</strong>
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--input-placeholder)', display: 'block', marginBottom: '0.25rem' }}>
                  Habilitação Literária
                </span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--card-title)' }}>
                  {currentCandidatura.nivel_academico || 'N/A'}
                </strong>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--input-placeholder)', display: 'block', marginBottom: '0.25rem' }}>
                  {t.submission_date}
                </span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--card-title)' }}>
                  {new Date(currentCandidatura.data_submissao).toLocaleDateString()}
                </strong>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={22} color="#16a34a" />
              <span style={{ fontSize: '0.88rem', color: '#166534', fontWeight: 600 }}>
                A sua candidatura foi gravada na base de dados SQLite oficial do SERNIC. Aguarde a convocatória para as provas teóricas.
              </span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <FileText size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhuma candidatura activa</h4>
            <p style={{ color: 'var(--input-placeholder)', fontSize: '0.9rem' }}>
              A sua conta está activa, mas ainda não submeteu formalmente os documentos para este concurso.
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;
}
