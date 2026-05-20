// ─── Token storage ────────────────────────────────────────────────────────────
// Access token lives in memory (cleared on tab close) + localStorage fallback.
// Refresh token lives in localStorage only (30-day lifetime).

let _accessToken = null;

export function getTokens() {
  return {
    access: _accessToken ?? (typeof window !== 'undefined' ? localStorage.getItem('lexcam_access') : null),
    refresh: typeof window !== 'undefined' ? localStorage.getItem('lexcam_refresh') : null,
  };
}

export function setTokens({ access_token, refresh_token }) {
  _accessToken = access_token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('lexcam_access', access_token);
    if (refresh_token) localStorage.setItem('lexcam_refresh', refresh_token);
  }
}

export function clearTokens() {
  _accessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('lexcam_access');
    localStorage.removeItem('lexcam_refresh');
  }
}

// ─── Refresh ──────────────────────────────────────────────────────────────────
let _refreshPromise = null;

async function tryRefresh() {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const { refresh } = getTokens();
    if (!refresh) return false;
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) { clearTokens(); return false; }
      const data = await res.json();
      setTokens({ access_token: data.access_token });
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ─── Base request ─────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const { access } = getTokens();

  const headers = {
    'Content-Type': 'application/json',
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
    ...options.headers,
  };

  let res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const { access: newAccess } = getTokens();
      res = await fetch(path, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newAccess}` },
      });
    }
  }

  return res;
}

async function handleResponse(res) {
  // 204 No Content
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.detail ?? data.message ?? 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const get  = (path, opts = {}) => request(path, { method: 'GET',   ...opts }).then(handleResponse);
const post = (path, body, opts = {}) => request(path, { method: 'POST',  body: JSON.stringify(body), ...opts }).then(handleResponse);
const patch = (path, body, opts = {}) => request(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }).then(handleResponse);
const del  = (path, opts = {}) => request(path, { method: 'DELETE', ...opts }).then(handleResponse);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const auth = {
  register:        (data)                     => post('/api/v1/auth/register', data),
  login:           async (email, password)    => {
    const data = await post('/api/v1/auth/login', { email, password });
    setTokens(data);
    // cache user_id so chat can scope conversations per user
    try {
      const me = await get('/api/v1/users/me');
      if (me?.id && typeof window !== 'undefined') localStorage.setItem('lexcam_user_id', me.id);
    } catch { /* non-fatal */ }
    return data;
  },
  logout:          async ()                   => {
    const { refresh } = getTokens();
    if (refresh) {
      try { await post('/api/v1/auth/logout', { refresh_token: refresh }); } catch { /* ignore */ }
    }
    if (typeof window !== 'undefined') localStorage.removeItem('lexcam_user_id');
    clearTokens();
  },
  verifyEmail:     (email, code)              => post('/api/v1/auth/verify-email', { email, code }),
  resendOtp:       (email, type = 'email_verify') => post('/api/v1/auth/resend-otp', { email, type }),
  forgotPassword:  (email)                    => post('/api/v1/auth/forgot-password', { email }),
  resetPassword:   (email, code, new_password) => post('/api/v1/auth/reset-password', { email, code, new_password }),
};

// ─── Users API ────────────────────────────────────────────────────────────────
export const users = {
  me:             ()     => get('/api/v1/users/me'),
  update:         (data) => patch('/api/v1/users/me', data),
  changePassword: (data) => post('/api/v1/users/me/change-password', data),
  delete:         ()     => del('/api/v1/users/me'),
};

// ─── Lawyers API ──────────────────────────────────────────────────────────────
export const lawyers = {
  list:           (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/api/v1/lawyers${q ? `?${q}` : ''}`);
  },
  get:            (id)          => get(`/api/v1/lawyers/${id}`),
  register:       (data)        => post('/api/v1/lawyers/register', data),
  me:             ()            => get('/api/v1/lawyers/me'),
  myDocuments:    ()            => get('/api/v1/lawyers/me/documents/list'),
  uploadDocument: (file, documentType) => {
    const { access } = getTokens();
    const form = new FormData();
    form.append('file', file);
    form.append('document_type', documentType);
    return fetch('/api/v1/lawyers/me/documents', {
      method: 'POST',
      headers: { Authorization: `Bearer ${access}` },
      body: form,
    }).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(data?.error ?? 'Upload failed'), { status: r.status, data });
      return data;
    });
  },
  createReferral: (lawyerId, data) => post(`/api/v1/lawyers/${lawyerId}/referrals`, data),
  myReferrals:    ()            => get('/api/v1/lawyers/me/referrals'),
  actionReferral: (referralId, data) => patch(`/api/v1/lawyers/me/referrals/${referralId}`, data),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const admin = {
  lawyers:      (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/api/v1/admin/lawyers${q ? `?${q}` : ''}`);
  },
  verifyLawyer:    (id, status) => patch(`/api/v1/admin/lawyers/${id}/verify`, { status }),
  lawyerDocuments: (id)        => get(`/api/v1/admin/lawyers/${id}/documents`),
  stats: () => Promise.all([
    get('/api/v1/users/admin/stats'),
    get('/api/v1/documents/admin/stats'),
    get('/api/v1/payments/admin/stats'),
  ]).then(([users, docs, payments]) => ({
    total_users:       users.total_users,
    total_documents:   docs.total_documents,
    total_revenue_xaf: payments.total_revenue_xaf,
  })),
  userList:       ()        => get('/api/v1/users/admin/list'),
  templates:      ()        => get('/api/v1/documents/admin/templates'),
  createTemplate: (data)    => post('/api/v1/documents/admin/templates', data),
  toggleTemplate: (id)      => patch(`/api/v1/documents/admin/templates/${id}/toggle`, {}),
  editTemplate:   (id, data) => patch(`/api/v1/documents/admin/templates/${id}/edit`, data),
};

// ─── Scraper API ──────────────────────────────────────────────────────────────
export const scraper = {
  jobs:         (limit = 50) => get(`/api/v1/scraper/scrape?limit=${limit}`),
  runJob:       (url)        => post('/api/v1/scraper/scrape', { url }),
  getJob:       (id)         => get(`/api/v1/scraper/scrape/${id}`),
  lawJobs:      (limit = 50) => get(`/api/v1/scraper/scrape-laws?limit=${limit}`),
  runLawJob:    (data)       => post('/api/v1/scraper/scrape-laws', data),
  getLawJob:    (id)         => get(`/api/v1/scraper/scrape-laws/${id}`),
};

// ─── Feedback / AI Monitoring API ────────────────────────────────────────────
export const feedback = {
  flagged:        (status = '')  => get(`/api/v1/feedback/admin/feedback${status ? `?review_status=${status}` : ''}`),
  stats:          ()             => get('/api/v1/feedback/admin/feedback/stats'),
  submitFeedback: (data)         => post('/api/v1/feedback/feedback', data),
  flag:           (id)           => post(`/api/v1/feedback/feedback/${id}/flag`, {}),
  review:         (id, action)   => patch(`/api/v1/feedback/admin/feedback/${id}/review`, { action }),
};

// ─── Knowledge Base API ───────────────────────────────────────────────────────
export const kb = {
  ingestPdf: ({ file, code, name, domain = 'general', language = 'fr', jurisdiction = 'cameroon' }) => {
    const { access } = getTokens();
    const form = new FormData();
    form.append('file', file);
    form.append('code', code);
    form.append('name', name);
    form.append('domain', domain);
    form.append('language', language);
    form.append('jurisdiction', jurisdiction);
    return fetch('/api/v1/kb/ingest/pdf', {
      method: 'POST',
      headers: { ...(access ? { Authorization: `Bearer ${access}` } : {}) },
      body: form,
    }).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(data?.detail ?? 'Upload failed'), { status: r.status, data });
      return data;
    });
  },
  laws:    () => get('/api/v1/kb/laws'),
  search:  (q, domain, language) => {
    const body = { query: q, limit: 20 };
    if (domain) body.domain = domain;
    if (language) body.language = language;
    return post('/api/v1/kb/search', body);
  },
};

// ─── Documents API ────────────────────────────────────────────────────────────
export const documents = {
  list:     ()          => get('/api/v1/documents'),
  get:      (id)        => get(`/api/v1/documents/${id}`),
  generate: (slug, data) => post(`/api/v1/documents/generate/${slug}`, data),
  myDocs:   ()          => get('/api/v1/documents'),
  download: (id)        => get(`/api/v1/documents/${id}/download`),
};

// ─── Payments API ─────────────────────────────────────────────────────────────
export const payments = {
  initiate: (data) => post('/api/v1/payments/initiate', data),
  status:   (id)   => get(`/api/v1/payments/${id}/status`),
  history:  ()     => get('/api/v1/payments/history'),
};

// ─── Chat API ─────────────────────────────────────────────────────────────────
function _userHeader() {
  const uid = typeof window !== 'undefined' ? localStorage.getItem('lexcam_user_id') : null;
  return uid ? { headers: { 'X-User-Id': uid } } : {};
}

export const chat = {
  conversations: ()         => get('/api/v1/chat/conversations', _userHeader()),
  getConversation: (id)     => get(`/api/v1/chat/conversations/${id}`),
  create: ()                => post('/api/v1/chat/conversations', {}, _userHeader()),
  sendMessage: (id, content) => post(`/api/v1/chat/conversations/${id}/messages`, { content }),
};

export async function streamChatMessage(convId, content, { onChunk, onDone, onError, onSources }) {
  const token = _accessToken ?? (typeof window !== 'undefined' ? localStorage.getItem('lexcam_access') : null);
  try {
    const res = await fetch(`/api/v1/chat/conversations/${convId}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
    });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) { onDone(); return; }
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') { onDone(); return; }
        try {
          const parsed = JSON.parse(raw);
          if (parsed.sources) { onSources?.(parsed.sources); continue; }
          const chunk = parsed.token ?? parsed.text ?? parsed.content ?? '';
          if (chunk) onChunk(chunk);
        } catch {
          if (raw) onChunk(raw);
        }
      }
    }
  } catch (err) {
    onError(err);
  }
}
