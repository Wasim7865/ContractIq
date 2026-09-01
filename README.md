# ContractIQ 🛡️ — AI-Powered Contract Risk Analyzer

ContractIQ is an intelligent contract analysis platform designed for freelancers, startup founders, and small business owners. It parses legal contracts, extracts key clauses, identifies potential risks, explains legalese in plain English, and provides actionable recommendations.

---

## 🌟 Key Features

- **Multi-Format Ingestion:** Paste raw text or upload standard PDF agreements.
- **Automated Clause Extraction:** Intelligently identifies clauses including Liability, Termination, IP Assignment, Non-Competes, Payment Terms, and Governing Law.
- **Risk Scoring & Classification:** Evaluates individual clauses and the overall agreement on a 4-tier risk scale (`low`, `medium`, `high`, `critical`).
- **Plain-English Explanations:** Translates complex legalese into understandable summaries with context.
- **Actionable Recommendations:** Highlights specific negotiation points and red flags.
- **Contract History & Dashboard:** Track, manage, and re-analyze past documents.
- **Provider-Agnostic AI:** Works with any OpenAI-compatible API (OmniRoute, OpenRouter, Ollama, OpenAI).
- **Secure Authentication:** JWT-based user authentication and document isolation.

---

## 🏗️ Architecture & Technology Stack

```
ContractIQ/
├── frontend/             # React SPA (TypeScript + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/          # Type-safe API client & error handling
│   │   ├── components/   # Reusable UI components (Gauge, Badges, Cards)
│   │   ├── context/      # AuthContext for session management
│   │   ├── pages/        # Dashboard, Detail, Upload, Login, Register
│   │   └── types/        # Full TypeScript domain types
├── backend/              # FastAPI Backend (Python)
│   ├── api/              # RESTful route handlers (/auth, /contracts, /health)
│   ├── core/             # Database session, config, security/JWT
│   ├── models/           # SQLAlchemy 2.0 ORM models
│   ├── schemas/          # Pydantic request/response schemas
│   ├── services/         # Business logic + AIService abstraction
│   └── tests/            # Pytest test suite (Auth, Contracts, AI Service)
└── uploads/              # Local storage for uploaded documents
```

### Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v7
- **Backend:** FastAPI, Python 3.11+, SQLAlchemy 2.0, Pydantic v2, PyPDF/pdfplumber, Python-Jose (JWT), Passlib (bcrypt)
- **Database:** SQLite (local development / demo)
- **Testing:** Pytest, HTTPX, FastAPI TestClient

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### 1. Clone & Configure Environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` to configure your AI provider (defaults to local/mock-compatible settings):
```env
DATABASE_URL=sqlite:///./contractiq.db
SECRET_KEY=your-super-secret-key-change-in-production

# AI Settings (OpenRouter, OmniRoute, Ollama, OpenAI)
AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=your-api-key-here
AI_MODEL=gpt-4o-mini
```

---

### 2. Backend Setup

```bash
# Navigate to root and install dependencies
pip install -r backend/requirements.txt

# Start the FastAPI backend server
uvicorn backend.main:app --reload --port 8000
```

The API will be live at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Running Tests

To run the backend test suite:

```bash
# Run pytest from the root directory
pytest backend/tests -v
```

The test suite covers:
- User registration, duplicate handling, login, and `/me` authorization
- Text contract uploads, listing, detail view, and cascading deletion
- AI Service JSON parsing, fence stripping, and fallback validation logic

---

## 📡 API Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Create a new user account | ❌ |
| `POST` | `/api/auth/login` | Authenticate & receive JWT | ❌ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |
| `GET` | `/api/contracts/` | List user's contracts | ✅ |
| `POST` | `/api/contracts/upload/text` | Upload a contract via plain text | ✅ |
| `POST` | `/api/contracts/upload/pdf` | Upload a PDF contract file | ✅ |
| `GET` | `/api/contracts/{id}` | Get contract details & analysis | ✅ |
| `POST` | `/api/contracts/{id}/analyze` | Trigger AI risk analysis | ✅ |
| `DELETE` | `/api/contracts/{id}` | Delete contract and analysis | ✅ |
| `GET` | `/api/health` | Service health status | ❌ |
| `GET` | `/api/health/ai` | AI provider connectivity check | ❌ |

---

## 🔒 Security Practices

- Passwords hashed with `bcrypt`
- Stateless JWT authentication with expiration
- Strict database isolation per user (contracts query scoped to `user_id`)
- Robust error boundary & schema validation on all AI outputs
- Safe handling of raw text to prevent XSS/injection

---

## 📄 License

MIT License. Built as an open-source portfolio demonstration.
