# AI Code Assistant

A production-quality, fast, and free-to-run AI Code Assistant web application using Groq-hosted LLMs. Built for developers who want low-latency code explanation, bug detection, refactoring, optimization, and language conversion with a premium dark (AMOLED) UI inspired by Linear.

---

## 1. Project Overview

**Problem:** Developers need quick, reliable AI help for understanding code, finding bugs, refactoring, and converting between languages—without paying for APIs or sacrificing speed.

**Solution:** A full-stack web app that uses Groq’s fast inference API with open-source models (LLaMA, Mixtral), a Monaco-based code editor with file tabs and diff view, and proper JWT auth. The entire stack runs on free tiers (Vercel, Render, etc.) with no paid APIs or databases.

---

## App Flow (Landing → Auth → Editor)

1) **Landing (`/`)** — Public premium-dark homepage with CTA.  
2) **Auth (`/login`, `/register`)** — Public routes for email/password + JWT.  
3) **Editor (`/editor`)** — **Protected**; requires valid JWT (token validated via `/auth/me`).  
4) **Files** — Per-user saved files (list, load, save, delete) behind auth.

---

## 2. Key Features

- **AI capabilities**
  - **Explain** — High-level purpose, line-by-line breakdown, complexity notes
  - **Find bugs** — Potential issues with concrete fix suggestions
  - **Refactor** — Readability and best-practice improvements
  - **Optimize** — Performance-focused changes with brief explanation
  - **Convert** — Code conversion between Java, Python, JS, C++, and more
  - **Context-aware chat** — Questions about the current editor content

- **Editor**
  - Monaco (VS Code) editor with multi-language support
  - Multiple file tabs, language selector, keyboard shortcuts (e.g. Ctrl+N new file, Ctrl+W close tab)
  - Read-only diff view for AI-generated changes with **Apply** / **Cancel**

- **Authentication**
  - Email + password, JWT, bcrypt
  - Editor at `/editor` is fully auth-protected (redirect to `/login` if not authenticated)
  - `/auth/me` only called when a token exists; logout clears token and returns to landing

- **Files**
  - Per-user saved files (filename, language, content, updatedAt)
  - List, load, save/update, delete via `/files` routes (auth required)

- **UI/UX**
  - Dark-only, AMOLED black (`#000000`) background, minimal Linear-inspired layout
  - Tailwind with design tokens, clear typography, subtle transitions

- **Quality**
  - Loading states, error handling, toast notifications
  - Backend rate limiting; clean layered architecture and prompt templates

---

## 3. Tech Stack (and Why)

| Layer      | Choice           | Reason |
|-----------|-------------------|--------|
| Frontend  | React + Vite      | Fast HMR, small bundle; Vite is the standard for modern React. |
| Styling   | Tailwind CSS      | Utility-first, design tokens, no custom CSS framework. |
| Editor    | Monaco (@monaco-editor/react) | VS Code editor in the browser; multi-language, diff editor built-in. |
| Backend   | Fastify            | Lower overhead and higher throughput than Express; async by default. |
| AI        | Groq API          | Free tier, very low latency, open-source models (LLaMA, Mixtral). |
| Auth      | JWT + bcrypt      | Stateless auth; industry-standard password hashing. |
| State     | React Context + hooks | No Redux; keeps the app simple and easy to follow. |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   React UI   │  │ Monaco       │  │ AI Panel (actions,   │   │
│  │   Layout,    │  │ Editor +     │  │ chat, model switch)  │   │
│  │   Auth,      │  │ Tabs, Diff  │  │                      │   │
│  │   Toasts     │  │             │  │                      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│         └─────────────────┼──────────────────────┘               │
│                           │ /api/* (proxy in dev)                 │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                    Backend (Node / Fastify)                        │
│                           ▼                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ CORS,        │  │ Auth         │  │ AI routes            │   │
│  │ Rate limit   │  │ middleware   │  │ /ai/explain, /bugs,    │   │
│  │              │  │ (JWT)        │  │ /refactor, /optimize, │   │
│  │              │  │              │  │ /convert, /chat       │   │
│  └──────────────┘  └──────────────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│         └─────────────────┼──────────────────────┘               │
│                           ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Auth service (register, login, verify) │ AI service (Groq)   ││
│  │ User store (in-memory)                 │ Prompt templates     ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                   Groq API (LLaMA / Mixtral)
```

- **Frontend:** SPA on Vite; in dev, `VITE_API_URL` can be unset and `/api` is proxied to the backend.
- **Backend:** Fastify with CORS, rate limiting, JWT auth middleware, auth routes, file routes (`/files*`), and namespaced AI routes under `/ai`. Business logic lives in services; controllers only validate and delegate.

---

## 5. Data Flow

1. **Auth**
   - Register/Login: `POST /auth/register` or `POST /auth/login` with `{ email, password }` → backend hashes password (bcrypt), creates/finds user, returns `{ user, token }`. Frontend stores `token` in `localStorage` and sets `Authorization: Bearer <token>` on subsequent requests.
   - Authenticated request: `Authorization` header → auth middleware verifies JWT → `request.user` set or null (guest).
   - `/auth/me`: Optional; used to restore session; protected by `requireAuth`.

2. **AI**
   - User selects action (Explain, Bugs, Refactor, Optimize, Convert, Chat, Code) and optionally model/language.
   - Frontend sends `POST /ai/<action>` with body (e.g. `code`, `language`, `message`, `editorContent`).
   - Backend validates input, calls `aiService.<action>()`, which uses central **prompt templates** and Groq SDK.
   - Response: text (explain/bugs), code (refactor/optimize/convert), chat message, or structured code-edit JSON. Frontend shows result in the AI panel; for code changes, it opens the **diff view** (original vs modified). User clicks **Apply** to write modified code into the editor or **Cancel** to discard.

3. **Editor**
   - File state (tabs, content, language) lives in React state. Monaco is controlled via `value` and `onChange`. Diff view is read-only; Apply copies `diff.modified` into the active file’s content.

4. **Files**
   - Auth-only file CRUD: `POST /files` (create/update), `GET /files`, `GET /files/:id`, `DELETE /files/:id`.
   - Frontend sidebar lists user files; load replaces current tab content; save/upsert persists to the user’s scope.

---

## 6. AI Prompt Strategy

- **Centralized templates:** All prompts live in `backend/src/prompts/index.js` (system + user builders).
- **Structured responses:** Explain/Bugs return prose; Refactor/Optimize/Convert return a single code block. The AI service parses markdown code blocks from the model output and returns plain code for the editor/diff.
- **Context:** Chat uses the current editor content in the system prompt so the model can answer questions about “the code.”
- **Model choice:** Default is a capable model (e.g. `llama-3.3-70b-versatile`); a faster model (e.g. `llama-3.1-8b-instant`) is available in the UI for lower latency.

---

## 7. Authentication Flow

```
[User] → Sign up / Sign in (email + password)
    → [Frontend] POST /auth/register or /auth/login
    → [Backend] authService.register | login
        → bcrypt hash (register) or compare (login)
        → Create/find user in user store
        → JWT sign(id, email) → token
    → [Frontend] Store token in localStorage, set user from response
    → [Subsequent requests] Header: Authorization: Bearer <token>
    → [Backend] authMiddleware: verify JWT → request.user or 401 for protected routes
    → Editor (`/editor`) requires valid JWT (redirect to /login otherwise)
```

- **Guest mode:** The landing/login/register are public. The editor and file routes require a valid JWT; unauthenticated users are redirected to `/login`.

---

## 8. Folder Structure

```
AI-Code-Assistant/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # CodeEditor, DiffView, FileTabs, FileSidebar, AIPanel, Layout
│   │   ├── context/       # AuthContext, ToastContext
│   │   ├── lib/           # api.js, constants.js (languages, models)
│   │   ├── pages/         # Landing, Login, Register, EditorPage
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── backend/
│   ├── src/
│   │   ├── db/            # users.js (in-memory store)
│   │   ├── middleware/    # auth.js (JWT, requireAuth)
│   │   ├── prompts/       # index.js (all AI prompt templates)
│   │   ├── routes/        # auth.routes.js, ai.routes.js
│   │   ├── services/      # auth.service.js, ai.service.js
│   │   ├── config.js
│   │   └── index.js       # Fastify app, CORS, rate limit, routes
│   ├── package.json
│   └── .env.example
├── README.md
└── .env.example (optional at repo root)
```

- **frontend:** Component-driven; pages compose layout + editor + AI panel; API and auth are behind context and a single `api` helper.
- **backend:** Layered: routes → services; auth and AI logic in services; prompts and config centralized.

---

## 9. Environment Variables

**Backend (`backend/.env` or env in host)**

| Variable           | Description                          | Example                    |
|--------------------|--------------------------------------|----------------------------|
| `PORT`             | Server port                          | `3001`                     |
| `NODE_ENV`         | `development` / `production`          | `development`              |
| `JWT_SECRET`       | Secret for signing JWTs (min 32 chars in prod) | (random string)   |
| `JWT_EXPIRES_IN`   | Token TTL                            | `7d`                       |
| `GROQ_API_KEY`      | Groq API key                         | `gsk_...`                  |
| `GROQ_DEFAULT_MODEL` | Default model id                    | `llama-3.1-8b-instant`  |
| `RATE_LIMIT_MAX`   | Max requests per window               | `30`                       |
| `RATE_LIMIT_WINDOW`| Rate limit window                     | `1 minute`                 |
| `FRONTEND_URL`     | Allowed CORS origin (production)     | `https://your-app.vercel.app` |

**Frontend (`frontend/.env`)**

| Variable        | Description              | Example                          |
|-----------------|--------------------------|----------------------------------|
| `VITE_API_URL`  | Backend base URL (production) | `https://your-backend.onrender.com` |

- Local dev: frontend can omit `VITE_API_URL` and use Vite’s proxy from `/api` to `http://localhost:3001`.

---

## 10. How to Run Locally

**Prerequisites:** Node 18+, npm or yarn.

1. **Clone and install**
   ```bash
   cd AI-Code-Assistant
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env: set GROQ_API_KEY (get from https://console.groq.com), JWT_SECRET for production
   npm run dev
   ```
   Server runs at `http://localhost:3001`.

3. **Frontend**
   ```bash
   cd frontend
   # Optional: create .env with VITE_API_URL=http://localhost:3001 if not using proxy
   npm run dev
   ```
   App runs at `http://localhost:5173`. API calls go to `/api` and are proxied to the backend.

4. **Use the app**
   - Open the landing page, click Start Coding, sign up or sign in.
   - Editor is protected; once authenticated, create/open files, select language, use the AI panel (Explain, Bugs, Refactor, Optimize, Convert, Chat, Code). For code changes, review in the diff view and click **Apply** or **Cancel**. Save or load files from the sidebar (per user).

---

## 11. Deployment (Free Tiers) & Docker

- **Frontend:** Deploy the Vite app to **Vercel** or **Netlify** (connect repo, build command `npm run build`, output `dist`, root `frontend`). Set `VITE_API_URL` to your backend URL.
- **Backend:** Deploy the Fastify app to **Render** (Web Service), **Fly.io**, or **Railway**. Set env vars (especially `JWT_SECRET`, `GROQ_API_KEY`, `FRONTEND_URL`). Use the provided start command (e.g. `node src/index.js` or `npm start`).
- **Database:** Current setup uses an in-memory user store and in-memory files; data is lost on restart. For persistence, replace `backend/src/db/users.js` and `backend/src/db/files.js` with a real DB (e.g. SQLite/Postgres).

**Docker (added, not executed here):**
- Backend: `backend/Dockerfile` (multi-stage, Node 18 alpine, runs `node src/index.js`).
- Frontend: `frontend/Dockerfile` (build with Node 18 alpine, serve with nginx).  
- `.dockerignore` added in both services to keep images small. Build/push as needed in your environment.

---

## 12. Future Improvements

- **Persistence:** Replace in-memory user store with SQLite or Postgres; optional project/file persistence (e.g. per-user snippets or projects).
- **Stricter AI rate limits:** Per-user or per-IP limits for `/ai/*` using Fastify rate limit or a dedicated plugin.
- **More shortcuts:** Save file, run code (if safe sandbox exists), focus AI chat.
- **Accessibility:** ARIA labels and keyboard navigation for all AI actions and diff view.
- **Tests:** Unit tests for auth and AI services; E2E for login and one AI flow.

---

## License

MIT.
