const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.detail || data.error || res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  del: (path) => request(path, { method: "DELETE" }),

  auth: {
    register: (email, password) => api.post("/auth/register", { email, password }),
    login: (email, password) => api.post("/auth/login", { email, password }),
    me: () => api.get("/auth/me"),
  },

  ai: {
    explain: (code, language) => api.post("/ai/explain", { code, language }),
    bugs: (code, language) => api.post("/ai/bugs", { code, language }),
    refactor: (code, language) => api.post("/ai/refactor", { code, language }),
    optimize: (code, language) => api.post("/ai/optimize", { code, language }),
    convert: (code, fromLanguage, toLanguage) =>
      api.post("/ai/convert", { code, fromLanguage, toLanguage }),
    chat: (message, editorContent, model) =>
      api.post("/ai/chat", { message, editorContent, model }),
    chatWithHistory: (messages, currentCode, language, model) =>
      api.post("/ai/chat", { messages, currentCode, language, model }),
    chatCode: (message, currentCode, language, model) =>
      api.post("/ai/chat-code", { message, currentCode, language, model }),
  },

  files: {
    list: () => api.get("/files"),
    get: (id) => api.get(`/files/${id}`),
    save: (file) => api.post("/files", file),
    delete: (id) => api.del(`/files/${id}`),
  },
};
