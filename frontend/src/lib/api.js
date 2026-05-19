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
    return data;
  },
  logout:          async ()                   => {
    const { refresh } = getTokens();
    if (refresh) {
      try { await post('/api/v1/auth/logout', { refresh_token: refresh }); } catch { /* ignore */ }
    }
    clearTokens();
  },
  verifyEmail:     (email, code)              => post('/api/v1/auth/verify-email', { email, code }),
  resendOtp:       (email, type = 'email_verify') => post('/api/v1/auth/resend-otp', { email, type }),
  forgotPassword:  (email)                    => post('/api/v1/auth/forgot-password', { email }),
  resetPassword:   (email, code, new_password) => post('/api/v1/auth/reset-password', { email, code, new_password }),
};

// ─── Users API ────────────────────────────────────────────────────────────────
export const users = {
  me:     ()     => get('/api/v1/users/me'),
  update: (data) => patch('/api/v1/users/me', data),
  delete: ()     => del('/api/v1/users/me'),
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
  createReferral: (lawyerId, data) => post(`/api/v1/lawyers/${lawyerId}/referrals`, data),
  myReferrals:    ()            => get('/api/v1/lawyers/me/referrals'),
  actionReferral: (referralId, data) => patch(`/api/v1/lawyers/me/referrals/${referralId}`, data),
};

// ─── Documents API ────────────────────────────────────────────────────────────
export const documents = {
  list:     ()          => get('/api/v1/documents'),
  get:      (id)        => get(`/api/v1/documents/${id}`),
  generate: (slug, data) => post(`/api/v1/documents/${slug}/generate`, data),
  myDocs:   ()          => get('/api/v1/documents/my'),
};

// ─── Payments API ─────────────────────────────────────────────────────────────
export const payments = {
  initiate: (data) => post('/api/v1/payments/initiate', data),
  status:   (id)   => get(`/api/v1/payments/${id}/status`),
};
