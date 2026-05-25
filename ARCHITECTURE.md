# LexCam — System Architecture

**LexCam** is an AI-powered legal aid platform for Cameroon. It connects citizens with legal information, a directory of verified lawyers, AI-assisted chat grounded in Cameroonian law, and automated generation of legal documents paid via Mobile Money.

---

## 1. Full System Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║                                    PUBLIC INTERNET                                           ║
║                              Browser / Mobile / API Client                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝
                                            │  HTTPS
                                            ▼
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║                         CLOUDFLARE  (CDN · DDoS Protection · TLS)                           ║
║                              lexcam.flakyfantasy.com                                         ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝
                                            │  HTTP (proxied)
                                            ▼
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║                    CONTABO VPS  62.169.23.197  ·  Ubuntu  ·  K3s (Kubernetes)                ║
║                                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────────────────────┐    ║
║  │               TRAEFIK INGRESS CONTROLLER  (K3s default, :443/:80)                   │    ║
║  │   Route: /grafana/* ─────────────────────────────────────► Grafana :32300           │    ║
║  │   Route: /*  (everything else) ──────────────────────────► Kong API Gateway         │    ║
║  └──────────────────────────────────────────┬────────────────────────────────────────┘    ║
║                                             │                                              ║
║                  ┌──────────────────────────▼─────────────────────────┐                   ║
║                  │           KONG API GATEWAY 3.6  (DB-less)           │                   ║
║                  │               2 Replicas  ·  HPA min1/max3          │                   ║
║                  │   ┌──────────────┐         ┌──────────────┐         │                   ║
║                  │   │   Kong Pod 1  │◄───────►│   Kong Pod 2  │        │                   ║
║                  │   │   :8000/:8001 │  K8s    │   :8000/:8001 │        │                   ║
║                  │   └──────────────┘  Service │   ─────────── │        │                   ║
║                  │        (Kubernetes ClusterIP service load-balances   │                   ║
║                  │         round-robin across all Kong replicas)        │                   ║
║                  └────────────────────────────┬───────────────────────┘                   ║
║                                               │                                             ║
║          ┌─────────────────┬──────────────────┼──────────────────┬──────────────────┐      ║
║          │ /               │ /api/v1/...       │                  │ /storage         │      ║
║          ▼                 │                   │                  ▼                  │      ║
║  ┌──────────────┐          │                   │    ┌─────────────────────┐          │      ║
║  │  Frontend    │          │                   │    │  MinIO Object Store │          │      ║
║  │  Next.js 14  │          │                   │    │  :9000              │          │      ║
║  │  :3000       │          │                   │    │  (PDF downloads)    │          │      ║
║  │  HPA min1/3  │          │                   │    └─────────────────────┘          │      ║
║  └──────────────┘          │                   │                                     │      ║
║                            │                   │                                     │      ║
║   ┌────────────────────────┼───────────────────┘                                    │      ║
║   │  MICROSERVICES  (all behind Kong · all expose GET /metrics)                     │      ║
║   │                                                                                  │      ║
║   │  /auth /users ──► user-management   Django 4  :8001  DB: lexcam_users           │      ║
║   │  /lawyers ──────► lawyer-service    Django 4  :8002  DB: lexcam_lawyers         │      ║
║   │  /documents ────► document-service  Django 4  :8006  DB: lexcam_documents       │      ║
║   │  /payments ─────► payment-service   Django 4  :8007  DB: lexcam_payments        │      ║
║   │  /notifications ► notification-svc  FastAPI   :8008  DB: lexcam_notif           │      ║
║   │  /feedback ─────► feedback-service  FastAPI   :8009  DB: lexcam_feedback        │      ║
║   │  /scraper ──────► scraper-service   FastAPI   :8011  DB: lexcam_scraping        │      ║
║   │  /kb ───────────► knowledge-base    FastAPI   :8003  DB: lexcam_knowledge       │      ║
║   │  /chat /rag ────► rag-service       FastAPI   :8004  DB: lexcam_rag_sessions    │      ║
║   │  /embed ────────► embedding-service FastAPI   :8000  (no DB)                    │      ║
║   └──────────────────────────────────────────────────────────────────────────────────┘      ║
║                                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. Internal Data & Messaging Architecture

```
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║                    PERSISTENT DATA LAYER  (StatefulSets + PVCs)                              ║
║                                                                                              ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────┐   ║
║  │  10 × PostgreSQL 16  (one isolated DB per service)                                   │   ║
║  │                                                                                      │   ║
║  │  lexcam_users  lexcam_lawyers  lexcam_documents  lexcam_payments  lexcam_notif       │   ║
║  │  lexcam_feedback  lexcam_scraping  lexcam_knowledge  lexcam_rag_sessions  (admin)    │   ║
║  └──────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                              ║
║  ┌───────────────┐   ┌─────────────────────┐   ┌────────────────┐   ┌──────────────────┐  ║
║  │  Redis 7      │   │  RabbitMQ 3         │   │  Qdrant        │   │  MinIO           │  ║
║  │  (Cache)      │   │  (Message Broker)   │   │  (Vector DB)   │   │  (Object Store)  │  ║
║  │               │   │                     │   │                │   │                  │  ║
║  │  JWT session  │   │  topic exchange:    │   │  384-dim vecs  │   │  lexcam-docs     │  ║
║  │  token cache  │   │  lexcam.events      │   │  lexcam_laws   │   │  bucket (PDFs)   │  ║
║  │               │   │  DLX: lexcam.dlx   │   │  collection    │   │                  │  ║
║  └───────┬───────┘   └──────────┬──────────┘   └───────┬────────┘   └────────┬─────────┘  ║
║          │                      │                       │                     │            ║
║          │              ┌───────┴──────────────┐        │                     │            ║
║          │              │   ASYNC WORKERS       │        │                     │            ║
║          │              │                       │        │                     │            ║
║          │              │  payment.confirmed ──►│doc-worker                   │            ║
║          │              │    1. fetch form_data │  (WeasyPrint PDF)           │            ║
║          │              │    2. render PDF ─────┼─────────────────────────────►(upload)   ║
║          │              │    3. mark-ready ─────┼──► document-service         │            ║
║          │              │    4. pub doc.ready   │                             │            ║
║          │              │                       │                             │            ║
║          │              │  payment.confirmed ──►│notification-worker          │            ║
║          │              │  document.ready ──────┼──► send email (Gmail SMTP)  │            ║
║          │              │  user.registered ─────┤                             │            ║
║          │              │  lawyer.verified ─────┤                             │            ║
║          │              │  referral.created ────┤                             │            ║
║          │              │  referral.accepted ───┤                             │            ║
║          │              │                       │                             │            ║
║          │              │  article.indexed ─────►indexing-worker ─────────────────────────►(Qdrant)
║          │              │  lawyer.docs.uploaded ►lawyer-ingest-worker         │            ║
║          │              └───────────────────────┘                             │            ║
║          │                                                                    │            ║
╚══════════╪════════════════════════════════════════════════════════════════════╪════════════╝
           │                                                                    │
           ▼                                                                    ▼
  user-management                                                    document-service
  (JWT cache)                                                        (mark-ready API)
```

---

## 3. Inter-Service Communication Map

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│              SYNCHRONOUS (HTTP · X-Internal-Key header)                                 │
│                                                                                         │
│  rag-service ──────────────────────────────► embedding-service   (query embedding)     │
│  knowledge-base ────────────────────────────► embedding-service   (article embedding)  │
│  rag-service ──────────────────────────────► knowledge-base      (law article lookup)  │
│  doc-worker ───────────────────────────────► document-service    (fetch form_data)     │
│  doc-worker ───────────────────────────────► document-service    (mark-ready)          │
│  doc-worker ───────────────────────────────► user-management     (fetch user email)    │
│  notification-worker ───────────────────────► user-management     (fetch user email)   │
│  notification-worker ───────────────────────► document-service    (fetch doc info)     │
│  payment-service ──────────────────────────► Campay API          (payment initiation)  │
│  payment-service ──────────────────────────► Campay API          (status polling)      │
│  rag-service ──────────────────────────────► Groq API            (LLM inference)       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│              ASYNCHRONOUS (RabbitMQ · lexcam.events topic exchange)                    │
│                                                                                         │
│  payment-service ──── payment.confirmed ───────────────► doc-worker                   │
│  payment-service ──── payment.confirmed ───────────────► notification-worker           │
│  doc-worker ────────── document.ready ─────────────────► notification-worker           │
│  user-management ───── user.registered ────────────────► notification-worker           │
│  lawyer-service ─────── lawyer.verified ───────────────► notification-worker           │
│  lawyer-service ─────── referral.created ──────────────► notification-worker           │
│  lawyer-service ─────── referral.accepted ─────────────► notification-worker           │
│  knowledge-base ─────── article.indexed ───────────────► indexing-worker              │
│  lawyer-service ─────── lawyer.documents.uploaded ─────► lawyer-ingest-worker         │
│                                                                                         │
│  Failed messages ──────────────────────────────────────► lexcam.dlx (dead-letter)     │
│                                                           └─► lexcam.dead-letters queue│
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│              EXTERNAL STORAGE                                                           │
│                                                                                         │
│  doc-worker ───────────────────────────────► MinIO :9000         (PDF upload)          │
│  Users (via Kong /storage) ────────────────► MinIO :9000         (PDF download)        │
│  embedding-service / indexing-worker ───────► Qdrant             (vector upsert/query) │
│  All services ─────────────────────────────► PostgreSQL          (primary data store)  │
│  user-management ──────────────────────────► Redis 7             (JWT token cache)     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Document Generation Flow (Payment → PDF → Email)

```
User fills form → Frontend
  │
  ├─► POST /api/v1/documents/generate/{slug} → document-service
  │       Creates UserDocument (status: awaiting_payment)
  │
  └─► POST /api/v1/payments/initiate → payment-service
          Creates Transaction (status: pending)
          Calls Campay API → USSD prompt sent to phone
          │
          Frontend polls GET /payments/{ref}/status every 3 seconds
          │
          Campay confirms → payment-service marks confirmed
          │
          Publishes payment.confirmed to RabbitMQ
          │
          ┌─────────────────────────────────┐
          │  RabbitMQ delivers to 2 workers  │
          └──────────┬──────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
   doc-worker             notification-worker
   1. GET form_data           Sends payment receipt
   2. Render PDF (Jinja2         email via Gmail SMTP
      + WeasyPrint 65.1)
   3. Upload → MinIO
   4. POST mark-ready
      → doc status: ready
   5. Publish document.ready
         │
         ▼
   notification-worker
   Sends "document ready"
   email with PDF link
   (/storage/lexcam-documents/...)
```

---

## 5. AI Chat (RAG) Flow

```
User question → Frontend SSE connection
  │
  └─► POST /api/v1/chat/conversations/{id}/messages/stream → rag-service
          │
          ├─► embedding-service (multilingual-e5-small ONNX)
          │       Input: user question text
          │       Output: 384-dim float vector
          │
          ├─► Qdrant (cosine similarity search)
          │       Collection: lexcam_laws
          │       Top-k law article chunks returned
          │
          ├─► Prompt construction
          │       System: "You are a Cameroonian legal AI..."
          │       Context: retrieved law articles
          │       User: original question
          │
          └─► Groq API (llama-3.3-70b-versatile)
                  Streams tokens via SSE back to browser
                  Returns law citations (article + code)
```

---

## 6. Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| VPS | Contabo (Ubuntu) | Single-node K3s cluster host |
| Container Orchestration | K3s (lightweight Kubernetes) | Deploys all workloads |
| Ingress | Traefik (K3s default) | TLS termination, routes to Kong |
| API Gateway | Kong 3.6 (DB-less) | Routing, auth middleware, **2 replicas** load-balanced by K8s ClusterIP |
| CI/CD | Jenkins (K8s StatefulSet) | Build → Test → Push → Deploy pipeline |
| Container Registry | Docker Hub (`chewiclinton/*`) | Image store |
| Helm | v3 | Kubernetes package management |
| Autoscaling | HPA on all 12 deployments | CPU-based, min 1 / max 2–3 replicas |

### Persistent Infrastructure (StatefulSets / PVCs)

| Service | Technology | Used By |
|---------|-----------|---------|
| 10× PostgreSQL 16 | postgres:16 | One DB per microservice (isolated) |
| Message Broker | RabbitMQ 3 | Async events between services |
| Cache | Redis 7 | JWT session/token cache (user-management) |
| Vector DB | Qdrant | Law article embeddings (384-dim cosine) |
| Object Storage | MinIO | Generated PDF documents (lexcam-documents bucket) |

---

## 7. Microservices

All services run as Kubernetes Deployments with HPA enabled.

```
Kong API Gateway (/api/v1/*)
│
├── /auth, /users        ──► user-management    (Django 4 · port 8001 · DB: lexcam_users)
├── /lawyers             ──► lawyer-service      (Django 4 · port 8002 · DB: lexcam_lawyers)
├── /documents           ──► document-service    (Django 4 · port 8006 · DB: lexcam_documents)
├── /payments            ──► payment-service     (Django 4 · port 8007 · DB: lexcam_payments)
├── /notifications       ──► notification-service(FastAPI   · port 8008 · DB: lexcam_notif)
├── /feedback            ──► feedback-service    (FastAPI   · port 8009 · DB: lexcam_feedback)
├── /scraper             ──► scraper-service     (FastAPI   · port 8011 · DB: lexcam_scraping)
├── /kb                  ──► knowledge-base      (FastAPI   · port 8003 · DB: lexcam_knowledge)
├── /chat, /rag          ──► rag-service         (FastAPI   · port 8004 · DB: lexcam_rag_sessions)
├── /embed               ──► embedding-service   (FastAPI   · port 8000 · no DB)
├── /grafana             ──► Grafana             (port 32300)
├── /storage             ──► MinIO               (port 9000 — PDF downloads, strip_path: true)
└── /                    ──► frontend            (Next.js   · port 3000)
```

### Service Responsibilities

**user-management** — Registration, login, JWT auth (access + refresh tokens), OTP email verification, password reset. Uses Redis to cache tokens. Internal `/users/{id}` endpoint used by workers to look up user email.

**lawyer-service** — Lawyer profiles, specializations, verification document uploads, referral system (citizen → lawyer requests), lawyer directory.

**document-service** — Document template management, user document requests lifecycle (`awaiting_payment` → `generating` → `ready` / `failed`). Internal `/internal/mark-ready` called by doc-worker after PDF generation.

**payment-service** — Campay Mobile Money integration (MTN MoMo + Orange Money), transaction lifecycle, webhook receiver, expiry cronjob (15-min cutoff, every 5 min), retry-events cronjob (every 5 min).

**notification-service** — Stores notification records; exposes REST endpoint for querying notifications.

**knowledge-base-service** — CRUD for Cameroonian law articles (Labour, Civil, Land, Penal, Commercial, Housing codes), seeded with 22 articles across 6 codes, indexed into Qdrant for vector search.

**rag-service** — Conversational AI chat: manages sessions, orchestrates retrieval from Qdrant via embedding-service, synthesizes answers using Groq LLM (Llama 3.3 70B), returns streamed responses with law citations.

**embedding-service** — Converts text to 384-dimensional vectors using `intfloat/multilingual-e5-small` (ONNX, CPU-optimised). Used by rag-service (query embedding) and indexing-worker (article embedding).

**feedback-service** — Stores user feedback on AI chat responses, admin review/flag workflow.

**scraper-service** — Scrapes legal content from external web sources; law scraper feeds knowledge-base.

**admin-panel** — Django-based internal dashboard: lawyer verification, user management, document/payment stats, feedback review, template management.

---

## 8. Async Workers

Workers consume events from RabbitMQ (`lexcam.events` topic exchange) independently of the HTTP request cycle.

```
RabbitMQ Topic Exchange: lexcam.events
│
├── routing_key: payment.confirmed
│   └──► doc-worker              (Python · WeasyPrint 65.1)
│         1. Fetch document form_data from document-service (internal API)
│         2. Render Jinja2 HTML template → WeasyPrint PDF
│         3. Upload PDF to MinIO bucket (lexcam-documents)
│         4. Call document-service /internal/mark-ready → status = ready
│         5. Publish document.ready event
│
├── routing_key: document.ready
│   └──► notification-worker     (Python · smtplib · Gmail SMTP)
│         → Sends "Your document is ready" email with download link
│
├── routing_key: payment.confirmed
│   └──► notification-worker     → Sends payment receipt email
│
├── routing_key: user.registered
│   └──► notification-worker     → Sends welcome email
│
├── routing_key: lawyer.verified
│   └──► notification-worker     → Sends verification result email
│
├── routing_key: referral.created
│   └──► notification-worker     → Notifies lawyer of new referral
│
├── routing_key: referral.accepted
│   └──► notification-worker     → Notifies citizen that lawyer accepted
│
├── routing_key: article.indexed  (internal)
│   └──► indexing-worker          → Embeds article via embedding-service → stores in Qdrant
│
└── routing_key: lawyer.documents.uploaded (internal)
    └──► lawyer-ingest-worker     → Processes lawyer verification documents

Dead-Letter Exchange: lexcam.dlx
  Failed messages (after max retries) → lexcam.dead-letters queue
  (can be inspected and replayed manually via rabbitmqadmin)
```

---

## 9. Observability

```
All 12 services expose GET /metrics (Prometheus format)
         │
         ▼
┌──────────────────────┐        ┌───────────────────────────────────────┐
│  Prometheus          │ scrape │  Grafana                               │
│  :32090 (NodePort)   │──────► │  lexcam.flakyfantasy.com/grafana/     │
│  15s scrape interval │        │  port 32300                            │
└──────────────────────┘        │  Dashboard: Node Exporter Full         │
                                └───────────────────────────────────────┘
Node Exporter (DaemonSet) → exposes host CPU/memory/disk metrics
```

---

## 10. CI/CD Pipeline (Jenkins)

Jenkins runs as a K8s StatefulSet inside the cluster.

```
GitHub push → Jenkins webhook
│
├── Stage 1: Checkout
│
├── Stage 2: Test (parallel — all 11 services + 4 workers)
│   └── pytest --cov --cov-fail-under=80
│
├── Stage 3: Coverage gate (80% minimum, blocks deploy if fails)
│
├── Stage 4: Docker Build (parallel, all images)
│   └── Tags image with short Git SHA (e.g. chewiclinton/doc-worker:a2ca4cd)
│
├── Stage 5: Security Scan (Trivy, non-blocking)
│
├── Stage 6: Docker Push → Docker Hub
│
├── Stage 7: Deploy Infrastructure
│   └── kubectl apply: namespace, databases, monitoring, Kong configmap
│
└── Stage 8: Helm Deploy (all services)
    └── helm upgrade --install --timeout 300s --cleanup-on-fail
        → Helm secret templates use lookup() to preserve kubectl-patched values
        → Health checks confirm all pods Running after deploy
```

---

## 11. Security Model

| Concern | Mechanism |
|---------|-----------|
| User authentication | JWT (HS256), access token (short-lived) + refresh token (30 days) |
| Token caching | Redis 7 — fast revocation without DB round-trips |
| Inter-service auth | `X-Internal-Key` header (shared secret) on all internal endpoints |
| Payment webhooks | HMAC signature validation (`X-Campay-Signature`) |
| Admin access | Role field on user account (`role: admin`), checked per view |
| Lawyer verification | Admin manually reviews uploaded documents before approving |
| Secrets management | Kubernetes Secrets; Helm `lookup()` preserves kubectl-patched values |
| TLS | Cloudflare terminates HTTPS; Traefik handles internal routing |

---

## 12. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Django services (5) | Python 3.11, Django 4, Django REST Framework, Gunicorn |
| FastAPI services (6) | Python 3.11, FastAPI, Uvicorn |
| AI — LLM | Groq API · Llama 3.3 70B Versatile |
| AI — Embeddings | `intfloat/multilingual-e5-small` (ONNX, 384-dim, CPU) |
| AI — Translation | HuggingFace `Helsinki-NLP/opus-mt-fr-en` (FR→EN fallback) |
| Vector store | Qdrant (cosine similarity, 384-dim collection `lexcam_laws`) |
| PDF generation | WeasyPrint 65.1 + Jinja2 HTML templates |
| Mobile payments | Campay API (MTN MoMo + Orange Money, Cameroon) |
| Email | Gmail SMTP (TLS, port 587) via smtplib |
| Message broker | RabbitMQ 3 (topic exchange + dead-letter exchange) |
| Cache | Redis 7 (JWT session token cache) |
| Object storage | MinIO (S3-compatible, proxied via Kong `/storage`) |
| Databases | PostgreSQL 16 (10 isolated databases, one per service) |
| Orchestration | K3s (single-node Kubernetes) |
| Ingress | Traefik + Kong 3.6 DB-less (2 replicas, K8s load-balanced) |
| CI/CD | Jenkins (K8s StatefulSet) + Docker Hub |
| Monitoring | Prometheus + Grafana + Node Exporter |
| Infrastructure as Code | Helm 3 + kubectl manifests |

---

*LexCam — AI Legal Aid Platform for Cameroon*
*SEN3244 — School Examination Project*
