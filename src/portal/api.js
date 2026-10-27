const TOKEN_KEY = 'sernic_sessao_token';

export function getSessionToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // sessionStorage indisponível (modo privado): a sessão dura apenas enquanto a página estiver aberta
  }
}

export async function apiFetch(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = getSessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    return { success: false, status: 0, message: 'Sem ligação ao servidor. Verifique se o servidor está activo.' };
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    // resposta sem JSON
  }
  if (res.status === 401) setSessionToken(null);
  return { status: res.status, ...data, success: Boolean(res.ok && data.success) };
}

export async function restaurarSessao() {
  if (!getSessionToken()) return null;
  const data = await apiFetch('/api/auth/sessao');
  return data.success ? data.user : null;
}

export async function terminarSessao() {
  if (getSessionToken()) await apiFetch('/api/auth/logout', { method: 'POST' });
  setSessionToken(null);
}
