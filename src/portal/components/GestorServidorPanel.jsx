import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  History,
  KeyRound,
  RefreshCw,
  Search,
  Save,
  Download
} from 'lucide-react';
import { apiFetch } from '../api';

const SECOES = [
  { id: 'resumo', label: 'Resumo', icon: BarChart3 },
  { id: 'candidaturas', label: 'Candidaturas recebidas', icon: Users },
  { id: 'acessos', label: 'Registo de acessos', icon: History },
  { id: 'seguranca', label: 'Segurança da conta', icon: KeyRound }
];

function classeEstado(estado = '') {
  const e = estado.toLowerCase();
  if (e.includes('exclu')) return 'erro';
  if (e.includes('admitida') || e.includes('sucesso')) return 'ok';
  if (e.includes('suplente') || e.includes('análise') || e.includes('analise')) return 'aviso';
  return '';
}

function classeAcao(acao = '') {
  if (acao.includes('FALHOU') || acao.includes('BLOQUEADO')) return 'erro';
  if (acao.startsWith('LOGIN') || acao === 'LOGOUT') return 'ok';
  if (acao.includes('ALTERAR') || acao.includes('DUPLICACAO')) return 'aviso';
  return '';
}

function formatarData(valor) {
  if (!valor) return '—';
  const d = new Date(String(valor).includes('T') ? valor : `${String(valor).replace(' ', 'T')}Z`);
  return Number.isNaN(d.getTime())
    ? valor
    : d.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function csvEscape(v) {
  const s = String(v ?? '');
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function Mensagem({ msg }) {
  if (!msg) return null;
  return <div className={`gestor-servidor-msg ${msg.tipo}`} role="status">{msg.texto}</div>;
}

function Resumo({ onSessaoExpirada }) {
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    const data = await apiFetch('/api/gestor/resumo');
    if (data.status === 401) return onSessaoExpirada();
    if (data.success) { setResumo(data.resumo); setErro(''); } else setErro(data.message);
  }, [onSessaoExpirada]);

  useEffect(() => { carregar(); }, [carregar]);

  if (erro) return <Mensagem msg={{ tipo: 'erro', texto: erro }} />;
  if (!resumo) return <div className="gestor-servidor-empty">A carregar...</div>;

  return (
    <>
      <div className="gestor-servidor-stats">
        <div className="gestor-servidor-stat"><span>Candidaturas no servidor</span><strong>{resumo.total}</strong></div>
        {resumo.porEstado.slice(0, 3).map(e => (
          <div className="gestor-servidor-stat" key={e.status}><span>{e.status}</span><strong>{e.n}</strong></div>
        ))}
        <div className={`gestor-servidor-stat ${resumo.falhasLogin24h > 0 ? 'alerta' : ''}`}>
          <span>Falhas de login (24h)</span><strong>{resumo.falhasLogin24h}</strong>
        </div>
      </div>
      {resumo.porCarreira.length > 0 && (
        <div className="gestor-servidor-table-wrap" style={{ marginTop: '1rem' }}>
          <table className="gestor-servidor-table">
            <thead><tr><th>Carreira</th><th>Candidaturas</th></tr></thead>
            <tbody>
              {resumo.porCarreira.map(c => (
                <tr key={c.carreira}><td>{c.carreira}</td><td>{c.n}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Candidaturas({ onSessaoExpirada, onNotify }) {
  const [lista, setLista] = useState([]);
  const [estados, setEstados] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [aCarregar, setACarregar] = useState(false);
  const [edicao, setEdicao] = useState(null);
  const [msg, setMsg] = useState(null);

  const carregar = useCallback(async () => {
    setACarregar(true);
    const qs = new URLSearchParams();
    if (busca.trim()) qs.set('busca', busca.trim());
    if (filtroEstado) qs.set('estado', filtroEstado);
    const data = await apiFetch(`/api/gestor/candidaturas?${qs}`);
    setACarregar(false);
    if (data.status === 401) return onSessaoExpirada();
    if (data.success) setLista(data.candidaturas);
    else setMsg({ tipo: 'erro', texto: data.message });
  }, [busca, filtroEstado, onSessaoExpirada]);

  useEffect(() => {
    apiFetch('/api/gestor/estados').then(d => d.success && setEstados(d.estados));
  }, []);

  useEffect(() => { carregar(); }, [filtroEstado]); // eslint-disable-line react-hooks/exhaustive-deps

  const guardarEstado = async () => {
    const data = await apiFetch(`/api/gestor/candidaturas/${edicao.id}/estado`, {
      method: 'POST',
      body: { estado: edicao.estado, motivo: edicao.motivo }
    });
    if (data.status === 401) return onSessaoExpirada();
    setMsg({ tipo: data.success ? 'ok' : 'erro', texto: data.message });
    if (data.success) {
      if (onNotify) onNotify('success', data.message);
      setEdicao(null);
      carregar();
    }
  };

  const exportarCSV = () => {
    const cab = ['Código', 'Nome', 'NUIT', 'BI', 'E-mail', 'Telefone', 'Carreira', 'Nível académico', 'Estado', 'Data de submissão'];
    const linhas = lista.map(c => [
      c.codigo_candidatura, c.nome_completo, c.nuit, c.bi_numero, c.email, c.telefone,
      c.carreira, c.nivel_academico, c.status, formatarData(c.data_submissao)
    ].map(csvEscape).join(';'));
    const blob = new Blob(['﻿' + [cab.join(';'), ...linhas].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidaturas_servidor_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <form className="gestor-servidor-toolbar" onSubmit={(e) => { e.preventDefault(); carregar(); }}>
        <input
          type="search"
          placeholder="Pesquisar por nome, NUIT, BI, código ou e-mail"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Pesquisar candidaturas"
        />
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} aria-label="Filtrar por estado">
          <option value="">Todos os estados</option>
          {estados.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <button type="submit" className="gestor-servidor-btn primary" disabled={aCarregar}>
          <Search size={16} /> Pesquisar
        </button>
        <button type="button" className="gestor-servidor-btn" onClick={exportarCSV} disabled={lista.length === 0}>
          <Download size={16} /> Exportar CSV
        </button>
      </form>

      <Mensagem msg={msg} />

      <div className="gestor-servidor-table-wrap" style={{ marginTop: msg ? '1rem' : 0 }}>
        <table className="gestor-servidor-table">
          <thead>
            <tr>
              <th>Código</th><th>Candidato</th><th>Carreira</th><th>Submissão</th><th>Estado</th><th>Acção</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr><td colSpan="6" className="gestor-servidor-empty">{aCarregar ? 'A carregar...' : 'Nenhuma candidatura encontrada.'}</td></tr>
            )}
            {lista.map(c => (
              <React.Fragment key={c.id}>
                <tr>
                  <td className="mono">{c.codigo_candidatura}</td>
                  <td>
                    <strong>{c.nome_completo}</strong>
                    <div className="muted">NUIT {c.nuit}{c.bi_numero ? ` · BI ${c.bi_numero}` : ''}</div>
                    <div className="muted">{c.email} · {c.telefone}</div>
                  </td>
                  <td>{c.carreira}<div className="muted">{c.nivel_academico}</div></td>
                  <td className="muted">{formatarData(c.data_submissao)}</td>
                  <td><span className={`gestor-estado-pill ${classeEstado(c.status)}`}>{c.status}</span></td>
                  <td>
                    <button
                      type="button"
                      className="gestor-servidor-btn"
                      onClick={() => { setMsg(null); setEdicao(edicao?.id === c.id ? null : { id: c.id, estado: estados.includes(c.status) ? c.status : estados[0], motivo: '' }); }}
                    >
                      {edicao?.id === c.id ? 'Cancelar' : 'Alterar estado'}
                    </button>
                  </td>
                </tr>
                {edicao?.id === c.id && (
                  <tr>
                    <td colSpan="6">
                      <div className="gestor-servidor-form" style={{ maxWidth: '100%' }}>
                        <label>
                          Novo estado
                          <select value={edicao.estado} onChange={(e) => setEdicao({ ...edicao, estado: e.target.value })}>
                            {estados.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </label>
                        <label>
                          Fundamento {edicao.estado === 'Excluída' ? '(obrigatório)' : '(opcional)'}
                          <textarea
                            value={edicao.motivo}
                            maxLength={500}
                            placeholder="Ex: Certificado de habilitações ilegível."
                            onChange={(e) => setEdicao({ ...edicao, motivo: e.target.value })}
                          />
                        </label>
                        <div>
                          <button type="button" className="gestor-servidor-btn primary" onClick={guardarEstado}>
                            <Save size={16} /> Guardar decisão
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Acessos({ onSessaoExpirada }) {
  const [logs, setLogs] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [aCarregar, setACarregar] = useState(false);

  const carregar = useCallback(async () => {
    setACarregar(true);
    const data = await apiFetch(`/api/gestor/acessos${filtro ? `?filtro=${filtro}` : ''}`);
    setACarregar(false);
    if (data.status === 401) return onSessaoExpirada();
    if (data.success) setLogs(data.logs);
  }, [filtro, onSessaoExpirada]);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <>
      <div className="gestor-servidor-toolbar">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar registos">
          <option value="">Todos os registos</option>
          <option value="falhas">Apenas falhas e bloqueios</option>
          <option value="gestao">Apenas acções de gestão</option>
        </select>
        <button type="button" className="gestor-servidor-btn" onClick={carregar} disabled={aCarregar}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>
      <div className="gestor-servidor-table-wrap">
        <table className="gestor-servidor-table">
          <thead><tr><th>Data e hora</th><th>Utilizador</th><th>Acção</th><th>Detalhes</th></tr></thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan="4" className="gestor-servidor-empty">{aCarregar ? 'A carregar...' : 'Sem registos.'}</td></tr>
            )}
            {logs.map(l => (
              <tr key={l.id}>
                <td className="muted" style={{ whiteSpace: 'nowrap' }}>{formatarData(l.data_hora)}</td>
                <td className="mono">{l.nuit}</td>
                <td><span className={`gestor-estado-pill ${classeAcao(l.acao)}`}>{l.acao.replace(/_/g, ' ')}</span></td>
                <td>{l.detalhes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Seguranca({ currentUser, onSessaoExpirada }) {
  const [form, setForm] = useState({ senhaActual: '', novaSenha: '', confirmar: '' });
  const [msg, setMsg] = useState(null);
  const [aGuardar, setAGuardar] = useState(false);

  const submeter = async (e) => {
    e.preventDefault();
    if (form.novaSenha !== form.confirmar) {
      setMsg({ tipo: 'erro', texto: 'A confirmação não coincide com a nova senha.' });
      return;
    }
    setAGuardar(true);
    const data = await apiFetch('/api/auth/alterar-senha', {
      method: 'POST',
      body: { senhaActual: form.senhaActual, novaSenha: form.novaSenha }
    });
    setAGuardar(false);
    if (data.status === 401) return onSessaoExpirada();
    setMsg({ tipo: data.success ? 'ok' : 'erro', texto: data.message });
    if (data.success) setForm({ senhaActual: '', novaSenha: '', confirmar: '' });
  };

  return (
    <form className="gestor-servidor-form" onSubmit={submeter}>
      <p className="sub" style={{ margin: 0 }}>
        Conta: <strong>{currentUser?.name}</strong> ({currentUser?.email || currentUser?.nuit}).
        A nova senha deve ter pelo menos 8 caracteres, com letras e números.
      </p>
      <label>
        Senha actual
        <input type="password" autoComplete="current-password" value={form.senhaActual}
          onChange={(e) => setForm({ ...form, senhaActual: e.target.value })} required />
      </label>
      <label>
        Nova senha
        <input type="password" autoComplete="new-password" value={form.novaSenha}
          onChange={(e) => setForm({ ...form, novaSenha: e.target.value })} required minLength={8} />
      </label>
      <label>
        Confirmar nova senha
        <input type="password" autoComplete="new-password" value={form.confirmar}
          onChange={(e) => setForm({ ...form, confirmar: e.target.value })} required minLength={8} />
      </label>
      <Mensagem msg={msg} />
      <div>
        <button type="submit" className="gestor-servidor-btn primary" disabled={aGuardar}>
          <KeyRound size={16} /> {aGuardar ? 'A guardar...' : 'Alterar senha'}
        </button>
      </div>
    </form>
  );
}

export default function GestorServidorPanel({ currentUser, onNotify, onSessaoExpirada }) {
  const [secao, setSecao] = useState('resumo');
  const expirou = useCallback(() => {
    if (onSessaoExpirada) onSessaoExpirada();
  }, [onSessaoExpirada]);

  const atual = SECOES.find(s => s.id === secao);

  return (
    <div className="gestor-servidor">
      <div>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--portal-text-main)' }}>Controlo e Segurança</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--portal-text-muted)' }}>
          Dados guardados no servidor oficial: candidaturas recebidas, decisões do júri e registo de todos os acessos.
        </p>
      </div>

      <div className="gestor-servidor-tabs" role="tablist">
        {SECOES.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={secao === id}
            className={secao === id ? 'active' : ''} onClick={() => setSecao(id)}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <section className="gestor-servidor-card">
        <h3>{atual.label}</h3>
        <p className="sub">
          {secao === 'resumo' && 'Visão geral das candidaturas registadas no servidor e alertas de segurança.'}
          {secao === 'candidaturas' && 'Pesquise, exporte e decida o estado das candidaturas. Cada decisão fica registada com o seu utilizador.'}
          {secao === 'acessos' && 'Últimos 300 eventos: entradas, falhas de autenticação, alterações de estado e de senha.'}
          {secao === 'seguranca' && 'Altere a senha da sua conta de gestor. As outras sessões abertas serão terminadas.'}
        </p>
        {secao === 'resumo' && <Resumo onSessaoExpirada={expirou} />}
        {secao === 'candidaturas' && <Candidaturas onSessaoExpirada={expirou} onNotify={onNotify} />}
        {secao === 'acessos' && <Acessos onSessaoExpirada={expirou} />}
        {secao === 'seguranca' && <Seguranca currentUser={currentUser} onSessaoExpirada={expirou} />}
      </section>
    </div>
  );
}
