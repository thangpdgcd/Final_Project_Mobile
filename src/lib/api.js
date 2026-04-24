import { API_BASE_URL } from '@/config/api';

const joinUrl = (base, path) => {
  const b = String(base || '').replace(/\/+$/, '');
  const p = String(path || '');
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  if (p.startsWith('/')) return `${b}${p}`;
  return `${b}/${p}`;
};

const parseBody = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    const json = JSON.parse(text);
    // common backend shape: { success, message, data }
    if (json && typeof json === 'object' && 'data' in json) return json.data;
    return json;
  } catch {
    return text;
  }
};

const requestJson = async (method, path, body) => {
  const url = joinUrl(API_BASE_URL, path);
  console.log('[api]', method, url);

  const res = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  console.log('[api]', method, url, '→', res.status);

  if (!res.ok) {
    const raw = await res.text().catch(() => '');
    const msg = raw ? `HTTP ${res.status}: ${raw}` : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return await parseBody(res);
};

export const apiGet = async (path) => requestJson('GET', path);
export const apiPost = async (path, body) => requestJson('POST', path, body);

