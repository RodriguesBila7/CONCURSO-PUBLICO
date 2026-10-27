import { apiFetch } from './api';
import { getStoredCandidaturas, saveStoredCandidaturas } from './mockData';

// Última versão de cada processo confirmada pelo servidor (código → JSON)
let confirmados = new Map();
let ativo = false;
let timer = null;
let listaPendente = null;
let callbacks = {};

const serializar = (p) => JSON.stringify(p);

function notificarEstado(estado, detalhe) {
  if (callbacks.onEstado) callbacks.onEstado(estado, detalhe);
}

async function enviarAlteracoes() {
  const lista = listaPendente;
  listaPendente = null;
  if (!lista || !ativo) return;

  const alterados = lista.filter(p => p?.codigoCandidatura && confirmados.get(p.codigoCandidatura) !== serializar(p));
  if (alterados.length === 0) return;

  notificarEstado('a-gravar');
  let falhas = 0;
  for (const p of alterados) {
    const res = await apiFetch(`/api/gestor/processos/${encodeURIComponent(p.codigoCandidatura)}`, {
      method: 'PUT',
      body: { processo: p }
    });
    if (res.status === 401) {
      ativo = false;
      if (callbacks.onSessaoExpirada) callbacks.onSessaoExpirada();
      return;
    }
    if (res.success) confirmados.set(p.codigoCandidatura, serializar(p));
    else falhas += 1;
  }

  if (falhas > 0) {
    notificarEstado('erro', `${falhas} alteração(ões) não foram gravadas no servidor. Tente novamente.`);
    if (callbacks.onErro) callbacks.onErro(`${falhas} alteração(ões) não foram gravadas no servidor.`);
  } else {
    notificarEstado('sincronizado');
  }
}

function aoAtualizarLista(e) {
  if (!ativo) return;
  listaPendente = e.detail;
  clearTimeout(timer);
  timer = setTimeout(enviarAlteracoes, 400);
}

async function aoEliminar(e) {
  if (!ativo) return;
  const codigo = e.detail?.codigo;
  if (!codigo) return;
  const res = await apiFetch(`/api/gestor/processos/${encodeURIComponent(codigo)}`, { method: 'DELETE' });
  if (res.status === 401) {
    ativo = false;
    if (callbacks.onSessaoExpirada) callbacks.onSessaoExpirada();
    return;
  }
  if (res.success || res.status === 404) {
    confirmados.delete(codigo);
  } else if (callbacks.onErro) {
    callbacks.onErro('A eliminação não foi gravada no servidor.');
  }
}

/**
 * Carrega os processos do servidor para a cache local e passa a enviar
 * automaticamente cada alteração feita no painel. Processos que só existem
 * neste navegador são importados uma vez para o servidor.
 */
export async function iniciarSincronizacao(opcoes = {}) {
  callbacks = opcoes;
  pararSincronizacao();
  notificarEstado('a-carregar');

  const data = await apiFetch('/api/gestor/processos');
  if (data.status === 401) {
    if (callbacks.onSessaoExpirada) callbacks.onSessaoExpirada();
    return { ok: false };
  }
  if (!data.success) {
    notificarEstado('erro', data.message || 'Não foi possível carregar os processos do servidor.');
    return { ok: false, message: data.message };
  }

  const doServidor = data.processos;
  const codigosServidor = new Set(doServidor.map(p => p.codigoCandidatura));
  const soNoNavegador = getStoredCandidaturas().filter(c => c?.codigoCandidatura && !codigosServidor.has(c.codigoCandidatura));

  let importados = 0;
  if (soNoNavegador.length > 0) {
    const res = await apiFetch('/api/gestor/processos/importar', { method: 'POST', body: { processos: soNoNavegador } });
    if (res.success) importados = res.importados;
  }

  const lista = [...doServidor, ...soNoNavegador];
  confirmados = new Map(lista.map(p => [p.codigoCandidatura, serializar(p)]));
  if (importados === 0 && soNoNavegador.length > 0) {
    // Importação falhou: estes processos continuam pendentes de envio
    soNoNavegador.forEach(p => confirmados.delete(p.codigoCandidatura));
  }

  window.addEventListener('sernic-candidaturas-updated', aoAtualizarLista);
  window.addEventListener('sernic-candidatura-eliminada', aoEliminar);
  ativo = true;

  saveStoredCandidaturas(lista);
  notificarEstado('sincronizado');
  return { ok: true, total: lista.length, importados };
}

export function pararSincronizacao() {
  ativo = false;
  clearTimeout(timer);
  if (listaPendente) enviarAlteracoes();
  window.removeEventListener('sernic-candidaturas-updated', aoAtualizarLista);
  window.removeEventListener('sernic-candidatura-eliminada', aoEliminar);
}
