const BASE = import.meta.env.VITE_API_URL || '';

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = localStorage.getItem('weave_token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: authHeaders(options.headers as HeadersInit),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data as T;
}

export async function uploadMedia(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${BASE}/api/media/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}
