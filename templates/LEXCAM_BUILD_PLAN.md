# LEXCAM — 2-Week Implementation Build Plan
## SEN3244 Software Architecture | Spring 2026
## ICT University — Engr. TEKOH PALMA

> **Convert to PDF:** `pandoc LEXCAM_BUILD_PLAN.md -o LEXCAM_BUILD_PLAN.pdf --pdf-engine=wkhtmltopdf`
> Or open in VS Code → Install "Markdown PDF" extension → Right-click → Export as PDF

---

## 1. Project Overview

**LexCam** is an AI-powered legal aid platform for Cameroon. It combines a RAG-based Legal Assistant, a bilingual Law Explorer, a lawyer referral directory, and a Mobile Money-gated document generator — all deployed on a single Contabo VPS running K3s.

| Item | Detail |
|---|---|
| Team Size | 2 people |
| Duration | 14 days (Day 1 = today) |
| VPS | Contabo Cloud VPS 10 — 4 vCPU, 8GB RAM, 75GB NVMe |
| Architecture | Microservices + Event-Driven Hybrid |
| Orchestration | K3s (lightweight Kubernetes) |

---

## 2. Team Structure & Roles

| Role | Scrum Title | Responsibilities |
|---|---|---|
| **Person A** | Product Owner + Dev | AI services (RAG, KB, Embedding), Feedback Service, Notification Service, Scraper + Ingest Worker, Frontend AI features |
| **Person B** | Scrum Master + Dev | Infrastructure, Business services (User, Lawyer, Document, Payment, Admin), Workers (Doc, Notification, Indexing), DevOps |

> **Sprint Tracking:** Create a GitHub Project board TODAY. Every task below maps to a card. Run 2 sprints: Sprint 1 = Days 1–7, Sprint 2 = Days 8–14. Update the board daily.

---

## 3. Final Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| Orchestration | K3s | Lightweight Kubernetes on single VPS |
| Ingress | Traefik (K3s built-in) | External load balancer, TLS, routing |
| API Gateway | Kong OSS | Rate limiting, auth middleware, request logging |
| Cache | Redis | OTP TTL, law summary cache (TTL 7d), RAG response cache |
| Message Bus | RabbitMQ + DLX | Async events between services |
| AI Framework | FastAPI | RAG, Knowledge Base, Embedding services |
| Business Framework | Django 4.2 + DRF | All other 8 services |
| Admin UI | Django Admin | Lawyer verification, scraper trigger, flagged review |
| Frontend | Next.js 14 (PWA) | Bilingual React interface |
| Relational DB | PostgreSQL 15 (1 pod, 11 schemas) | All structured data — one schema per service |
| Vector DB | Qdrant | Law article embeddings |
| Object Storage | MinIO | PDF documents + raw scraper HTML |
| Embedding Model | intfloat/multilingual-e5-small | French + English vector embeddings, 384 dims |
| LLM Provider | Groq API (Llama 3.3 70B / Llama 3.1 8B) | Legal reasoning + inline translation fallback |
| Payment | Campay API | MTN Mobile Money + Orange Money |
| Email | SMTP (Gmail) | All outbound notifications |
| CI/CD | Jenkins | Automated build, test, deploy |
| Monitoring | Prometheus + Grafana | Platform + application metrics |
| IaC | Ansible | VPS provisioning playbooks |
| Packaging | Helm Charts | K8s deployment packaging |

> **No MongoDB.** All data including RAG session history lives in PostgreSQL (JSONB for message arrays).
> **No Translation Service.** Language detection uses `langdetect`. Inline translation of mismatched chunks handled by a Groq call inside the RAG Service.

---

## 4. Monorepo Structure

```
lexcam/
├── services/
│   ├── user-management/        Django + DRF
│   ├── lawyer-service/         Django + DRF
│   ├── document-service/       Django + DRF
│   ├── payment-service/        Django + DRF
│   ├── notification-service/   Django + DRF
│   ├── feedback-service/       Django + DRF
│   ├── admin-panel/            Django + Django Admin
│   ├── scraper-service/        Django + DRF
│   ├── rag-service/            FastAPI
│   ├── knowledge-base-service/ FastAPI
│   └── embedding-service/      FastAPI
├── workers/
│   ├── doc-worker/             Plain Python
│   ├── notification-worker/    Plain Python
│   ├── lawyer-ingest-worker/   Plain Python
│   └── indexing-worker/        Plain Python
├── frontend/                   Next.js 14 PWA
├── infrastructure/
│   ├── helm/
│   │   ├── lexcam-base/
│   │   └── [service-charts]/
│   ├── k8s/
│   │   ├── databases/
│   │   ├── infrastructure/
│   │   └── monitoring/
│   └── ansible/
│       ├── playbooks/
│       │   ├── provision-vps.yml
│       │   └── deploy-k3s.yml
│       └── inventory/
├── jenkins/
│   └── Jenkinsfile
├── monitoring/
│   ├── prometheus/prometheus.yml
│   └── grafana/dashboards/
├── docs/
│   ├── architecture/
│   └── api/
├── docker-compose.dev.yml
└── README.md
```

### Django Service Structure (all 8 Django services)
```
service-name/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   └── [app_name]/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       ├── services.py
│       ├── events.py
│       └── tests/
│           ├── test_models.py
│           ├── test_views.py
│           └── test_services.py
├── manage.py
├── Dockerfile
├── requirements.txt
└── .env.example
```

### FastAPI Service Structure (all 3 FastAPI services)
```
service-name/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/v1/routes.py
│   ├── models/
│   ├── services/
│   └── db.py
├── tests/
│   ├── test_routes.py
│   └── test_services.py
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## 5. Master 14-Day Schedule

| Day | Person A | Person B |
|---|---|---|
| 1 | VPS setup + repo + K3s + firewall | Same (work together) |
| 2 | All databases deployed + monitoring + Jenkins | Same (work together) |
| 3 | User Management Service | Helm scaffold for all services + Kong setup |
| 4 | Embedding Service + Knowledge Base setup | Lawyer Service (profiles, registration, verification workflow) |
| 5 | Knowledge Base Service complete (search + Law Explorer) | Lawyer Service (referral lifecycle) |
| 6 | RAG Service (full pipeline + inline translation + NER) | Document Service (templates, MinIO) |
| 7 | RAG complete + Feedback Service | Payment Service (Campay integration) |
| 8 | Notification Service + RabbitMQ wiring | Admin Panel (Django Admin + flagged review queue) |
| 9 | Scraper Service + Lawyer Ingest Worker | Doc Worker + Notification Worker + Indexing Worker |
| 10 | Frontend: Auth + AI Chat page | Frontend: Lawyer Directory + Law Explorer |
| 11 | Frontend: Document Generator + payment flow | Frontend: Lawyer Dashboard + referral flow |
| 12 | Tests: RAG, KB, Embedding, User, Feedback | Tests: Lawyer, Document, Payment, Notification, Admin, Scraper |
| 13 | Jenkins pipeline complete + integration tests | Prometheus/Grafana dashboards + Ansible |
| 14 | Architecture doc + UML diagrams + Scrum docs | Swagger docs + README + Report + 7-min video |

> **Sprint 1 Review:** End of Day 7 — all core services running locally
> **Sprint 2 Review:** End of Day 14 — full demo on VPS, all deliverables ready

---

## 6. Phase 1: Infrastructure Setup (Days 1–2)

### Day 1 — VPS + K3s + Repository

**Both work together.**

1. SSH into Contabo VPS, update: `apt update && apt upgrade -y`
2. SSH key authentication, disable password login
3. UFW: allow ports 22, 80, 443, 6443
4. Install K3s: `curl -sfL https://get.k3s.io | sh -`
5. Copy kubeconfig, test: `kubectl get nodes`
6. Create GitHub private monorepo `lexcam`
7. Clone to VPS and both local machines
8. Create full folder structure from Section 4
9. Push initial commit

#### Day 1 Checklist
- [ ] VPS accessible via SSH with key auth, password login disabled
- [ ] UFW enabled with ports 22, 80, 443, 6443
- [ ] K3s running (`kubectl get nodes` shows Ready)
- [ ] kubeconfig on both local machines
- [ ] GitHub monorepo created with correct folder structure
- [ ] Initial commit pushed, both members can pull

---

### Day 2 — Databases + Infrastructure + Monitoring

**Both work together.**

1. Deploy PostgreSQL StatefulSet
2. Create all 11 schemas:
```sql
CREATE DATABASE lexcam_users;
CREATE DATABASE lexcam_lawyers;
CREATE DATABASE lexcam_documents;
CREATE DATABASE lexcam_payments;
CREATE DATABASE lexcam_notif;
CREATE DATABASE lexcam_feedback;
CREATE DATABASE lexcam_admin;
CREATE DATABASE lexcam_scraping;
CREATE DATABASE lexcam_knowledge;
CREATE DATABASE lexcam_rag_sessions;
```
3. Deploy Qdrant StatefulSet
4. Deploy MinIO, create buckets: `lexcam-documents`, `lexcam-scraper-html`
5. Deploy Redis
6. Deploy RabbitMQ + configure DLX exchange `lexcam.dlx`
7. Deploy Kong API Gateway
8. Configure Traefik ingress rules
9. Deploy Prometheus + Grafana + Node Exporter
10. Install Jenkins
11. Write `docker-compose.dev.yml` for local development

#### Day 2 Checklist
- [ ] PostgreSQL running, all 10 databases created (no MongoDB)
- [ ] Qdrant running, management UI accessible
- [ ] MinIO running, both buckets created
- [ ] Redis running
- [ ] RabbitMQ running, management console accessible, `lexcam.dlx` exchange configured
- [ ] Kong running, admin API accessible
- [ ] Traefik routing to Kong
- [ ] Prometheus + Grafana + Node Exporter running
- [ ] Jenkins running, GitHub plugin installed
- [ ] `docker-compose.dev.yml` starts all services locally

---

## 7. Service Specifications

---

### 7.1 User Management Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL — `lexcam_users`
**Port:** 8001 | **Assigned:** Person A (Day 3)

Handles registration, OTP email verification, JWT issuance and refresh, password reset, and citizen profile management. Stores consent logs and handles data anonymisation on account deletion. Every other service validates identity through this service's internal `/validate` endpoint.

#### Database Schema

**Table: `users`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| email | VARCHAR UNIQUE | |
| phone | VARCHAR NULLABLE | |
| password_hash | VARCHAR | bcrypt |
| full_name | VARCHAR | |
| city | VARCHAR | |
| preferred_language | VARCHAR | `fr` or `en` |
| role | VARCHAR | `user`, `lawyer`, `admin` |
| is_active | BOOLEAN | default true |
| is_email_verified | BOOLEAN | default false |
| consent_given_at | TIMESTAMP NULLABLE | GDPR consent |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Table: `otp_tokens`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK | |
| code | VARCHAR(6) | Cached in Redis with TTL 10min |
| type | VARCHAR | `email_verify`, `password_reset` |
| expires_at | TIMESTAMP | |
| used | BOOLEAN | |

**Table: `refresh_tokens`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK | |
| token_hash | VARCHAR | SHA-256 |
| expires_at | TIMESTAMP | 30 days |
| revoked | BOOLEAN | |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register, send OTP email |
| POST | `/api/v1/auth/login` | Login, return JWT pair |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Revoke refresh token |
| POST | `/api/v1/auth/verify-email` | Submit OTP |
| POST | `/api/v1/auth/resend-otp` | Resend OTP |
| POST | `/api/v1/auth/forgot-password` | Send reset OTP |
| POST | `/api/v1/auth/reset-password` | Reset with OTP |
| GET | `/api/v1/users/me` | Get own profile |
| PATCH | `/api/v1/users/me` | Update profile |
| DELETE | `/api/v1/users/me` | Anonymise and soft-delete |
| POST | `/internal/auth/validate` | Internal — validate JWT, return `{ user_id, role }` |

#### Events Published
| Event | Trigger | Payload |
|---|---|---|
| `user.registered` | After email verified | `{ user_id, email, full_name, preferred_language }` |
| `user.deleted` | After account deletion | `{ user_id }` |

#### Cross-Check Checklist
- [ ] All 3 tables created and migrated
- [ ] `POST /auth/register` creates user, sends real OTP email
- [ ] OTP stored in Redis with 10-minute TTL
- [ ] `POST /auth/login` returns access (15min) + refresh (30d) JWT
- [ ] `POST /auth/verify-email` marks email verified
- [ ] `POST /auth/forgot-password` + `POST /auth/reset-password` full flow works
- [ ] `DELETE /users/me` anonymises PII fields, sets `is_active=false`
- [ ] `POST /internal/auth/validate` returns 401 for expired/invalid tokens
- [ ] `user.registered` published to RabbitMQ after verification
- [ ] `user.deleted` published to RabbitMQ after deletion
- [ ] Passwords stored as bcrypt — never plain text
- [ ] Dockerfile builds, Helm chart deploys to K3s
- [ ] Swagger accessible at `/api/v1/docs/`
- [ ] Unit tests: OTP logic, JWT generation, bcrypt hashing
- [ ] Integration tests: register → verify → login → refresh → logout
- [ ] Coverage ≥ 80%

---

### 7.2 Lawyer Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL — `lexcam_lawyers`
**Port:** 8002 | **Assigned:** Person B (Days 4–5)

Manages both self-registered and web-scraped lawyers. Self-registered lawyers go through a verification workflow before appearing publicly. Verified lawyers can receive referral requests from citizens. Scraped lawyers appear as read-only contact listings. Manages availability toggling and the full referral lifecycle. Consumes `matching.requested` to return pre-filtered lawyer lists to the RAG Service.

#### Database Schema

**Table: `lawyers`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID NULLABLE | Only `registered` type |
| full_name | VARCHAR | |
| email | VARCHAR | |
| phone | VARCHAR | |
| city | VARCHAR | |
| region | VARCHAR | |
| bio | TEXT NULLABLE | |
| profile_photo_url | VARCHAR NULLABLE | |
| type | VARCHAR | `registered` or `scraped` |
| verification_status | VARCHAR | `pending`, `verified`, `rejected`, `suspended` |
| is_listed | BOOLEAN | true once verified |
| is_accepting_cases | BOOLEAN | lawyer availability toggle |
| source_url | VARCHAR NULLABLE | scraped lawyers only |
| created_at | TIMESTAMP | |

**Table: `specializations`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR UNIQUE | `labor`, `housing`, `family`, `criminal`, `commercial`, `land`, `ohada` |
| name_fr | VARCHAR | |

**Table: `lawyer_specializations`**
| Column | Type | Notes |
|---|---|---|
| lawyer_id | UUID FK | |
| specialization_id | UUID FK | |

**Table: `lawyer_documents`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| lawyer_id | UUID FK | |
| document_type | VARCHAR | `bar_certificate`, `national_id`, `diploma` |
| file_url | VARCHAR | MinIO URL |
| uploaded_at | TIMESTAMP | |
| status | VARCHAR | `pending`, `approved`, `rejected` |

**Table: `referrals`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| lawyer_id | UUID FK | |
| user_id | UUID | From JWT |
| user_name | VARCHAR | Copied at creation |
| user_email | VARCHAR | Copied at creation |
| issue_summary | TEXT | Brief description of legal issue |
| domain | VARCHAR | Detected legal domain |
| status | VARCHAR | `pending`, `accepted`, `declined`, `resolved` |
| contact_revealed | BOOLEAN | true after lawyer accepts |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/lawyers` | List lawyers — filter `city`, `region`, `specialization`, `type` |
| GET | `/api/v1/lawyers/{id}` | Get lawyer public profile |
| POST | `/api/v1/lawyers/register` | Self-registration (JWT required) |
| GET | `/api/v1/lawyers/me` | Lawyer views own profile |
| PATCH | `/api/v1/lawyers/me` | Update profile + availability toggle |
| POST | `/api/v1/lawyers/me/documents` | Upload verification document |
| GET | `/api/v1/lawyers/me/documents` | List own submitted documents |
| GET | `/api/v1/lawyers/me/referrals` | Lawyer sees all referral requests |
| PATCH | `/api/v1/lawyers/me/referrals/{id}` | Accept or decline referral |
| POST | `/api/v1/lawyers/{id}/referrals` | Citizen creates referral request |
| GET | `/api/v1/referrals/{id}` | Get referral status (citizen or lawyer) |
| PATCH | `/api/v1/referrals/{id}/resolve` | Mark referral resolved |
| PATCH | `/api/v1/admin/lawyers/{id}/verify` | Admin verifies/rejects/suspends |
| GET | `/api/v1/admin/lawyers` | Admin lists all lawyers |
| POST | `/internal/lawyers/ingest` | Lawyer Ingest Worker bulk insert scraped lawyers |
| GET | `/internal/lawyers/recommend` | RAG Service — returns lawyers by `domain` + `city` |

#### Events Published
| Event | Trigger | Payload |
|---|---|---|
| `lawyer.verified` | Admin verifies lawyer | `{ lawyer_id, full_name, email, status }` |
| `referral.created` | Citizen creates referral | `{ referral_id, lawyer_id, lawyer_email, user_name, domain }` |
| `referral.accepted` | Lawyer accepts referral | `{ referral_id, user_id, user_email, lawyer_name, lawyer_phone }` |
| `referral.resolved` | Either party marks resolved | `{ referral_id }` |

#### Events Consumed
| Event | Action |
|---|---|
| `matching.requested` | Pre-load city + domain filtered lawyer list for RAG response |

#### Business Rules
- Only `type=registered` AND `verification_status=verified` AND `is_accepting_cases=true` lawyers are referrable
- Scraped lawyers show name, city, phone, email only — no referral
- On referral accepted: `contact_revealed=true`, lawyer's phone/email included in `referral.accepted` payload

#### Cross-Check Checklist
- [ ] All 5 tables created and migrated
- [ ] `GET /lawyers` returns correct filtered results
- [ ] `POST /lawyers/register` creates lawyer `pending`, calls User Management to set role=lawyer
- [ ] `POST /lawyers/me/documents` uploads to MinIO
- [ ] `POST /lawyers/{id}/referrals` only works for verified, accepting lawyers
- [ ] `GET /lawyers/me/referrals` shows all pending/accepted referrals
- [ ] `PATCH /lawyers/me/referrals/{id}` accept sets `contact_revealed=true`
- [ ] `referral.accepted` payload includes lawyer contact details
- [ ] `PATCH /lawyers/me` availability toggle updates `is_accepting_cases`
- [ ] `PATCH /admin/lawyers/{id}/verify` updates status + `is_listed`
- [ ] `lawyer.verified` event published on admin action
- [ ] `GET /internal/lawyers/recommend` returns correct results by domain + city
- [ ] `POST /internal/lawyers/ingest` bulk inserts scraped records
- [ ] Scraped lawyers cannot be booked/referred
- [ ] Dockerfile builds, Helm chart deploys to K3s
- [ ] Swagger accessible
- [ ] Unit tests: referral state machine, filtering, verification workflow
- [ ] Integration tests: register → verify (admin) → create referral → accept → contact revealed
- [ ] Coverage ≥ 80%

---

### 7.3 Knowledge Base Service

**Framework:** FastAPI
**Database:** PostgreSQL — `lexcam_knowledge` + Qdrant
**Port:** 8003 | **Assigned:** Person A (Days 4–5)

Stores bilingual Cameroonian legal texts. All content is lawyer-verified in both French and English — no machine translation applied to stored content. Each chunk carries a `language` tag. Serves vector similarity search for the RAG pipeline and dual search (vector + keyword) for the Law Explorer. Publishes `corpus.updated` when content changes to trigger the Indexing Worker.

#### Database Schema

**Table: `law_documents`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| code | VARCHAR | `CONST`, `LABOR`, `PENAL`, `CIVIL`, `OHADA` |
| name | VARCHAR | |
| jurisdiction | VARCHAR | `cameroon` or `ohada` |
| language | VARCHAR | `fr`, `en`, `bilingual` |
| version | VARCHAR | |
| created_at | TIMESTAMP | |

**Table: `law_articles`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| document_id | UUID FK | |
| article_number | VARCHAR | |
| chapter | VARCHAR NULLABLE | |
| title | VARCHAR NULLABLE | |
| full_text | TEXT | |
| plain_summary | TEXT NULLABLE | Cached Groq-generated summary |
| domain | VARCHAR | `labor`, `housing`, `family`, `criminal`, `commercial`, `land` |
| language | VARCHAR | `fr` or `en` |
| qdrant_id | VARCHAR | ID in Qdrant |
| search_vector | TSVECTOR | PostgreSQL full-text index |

#### Qdrant Collection: `lexcam_laws`
```json
{
  "id": "uuid",
  "vector": [384 floats],
  "payload": {
    "article_id": "uuid",
    "law_name": "Labor Code",
    "article_number": "Art. 34",
    "domain": "labor",
    "language": "fr",
    "text_preview": "First 200 chars"
  }
}
```

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/search` | Dual search — `{ query, language?, domain?, limit? }` |
| GET | `/api/v1/articles/{id}` | Full article + plain-language summary (Redis cached 7d) |
| GET | `/api/v1/articles` | List articles filtered by `law_code`, `domain`, `language` |
| GET | `/api/v1/laws` | List all law documents |
| POST | `/internal/retrieve` | RAG only — `{ query_vector, top_k, domain_filter? }` → top-k chunks with language tag |

#### Events Published
| Event | Trigger | Payload |
|---|---|---|
| `corpus.updated` | New/updated law article saved | `{ article_ids: [...], action: "upsert" }` |

#### Cross-Check Checklist
- [ ] Both tables created and migrated with tsvector index
- [ ] Qdrant collection `lexcam_laws` created
- [ ] `POST /api/v1/search` returns results for French and English queries
- [ ] Qdrant semantic search + PostgreSQL tsvector keyword search both working
- [ ] Reciprocal Rank Fusion merges results correctly
- [ ] `GET /articles/{id}` returns full text + plain-language summary (Groq, Redis cached)
- [ ] `POST /internal/retrieve` returns top-k chunks with `language` tag in payload
- [ ] `corpus.updated` published when article upserted
- [ ] At least 500 chunks ingested (Labor Code + OHADA minimum) before RAG testing
- [ ] Dockerfile builds, Helm chart deploys to K3s
- [ ] Unit tests: RRF merging, search ranking
- [ ] Integration tests: search query → Qdrant + PostgreSQL → merged results
- [ ] Coverage ≥ 80%

---

### 7.4 RAG Service (AI Legal Assistant)

**Framework:** FastAPI
**Database:** PostgreSQL — `lexcam_rag_sessions` (JSONB)
**Port:** 8004 | **Assigned:** Person A (Days 6–7)

The core AI pipeline. Receives a legal question, detects language, runs NER and intent classification, retrieves relevant law chunks, constructs a citation-grounded prompt via the LLM abstraction layer, and streams the response token-by-token via SSE.

**Translation handling:** multilingual-e5-small performs cross-lingual retrieval natively. When a retrieved chunk's `language` tag differs from the user's query language, the RAG Service calls Groq (Llama 3.1 8B) inline to translate that chunk before building the prompt. This is a fallback — same-language queries need no translation call.

#### Database Schema

**Table: `sessions`** (PostgreSQL `lexcam_rag_sessions`)
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID | |
| title | VARCHAR | First 50 chars of first question |
| messages | JSONB | `[{role, content, citations, timestamp}]` |
| domain | VARCHAR | Detected legal domain |
| language | VARCHAR | User's language |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/chat` | Submit query — returns SSE stream |
| GET | `/api/v1/sessions` | List user's session history (paginated) |
| GET | `/api/v1/sessions/{id}` | Get full session with all messages |
| DELETE | `/api/v1/sessions/{id}` | Delete session |

#### Query Pipeline (in order)
```
1.  Receive { question, session_id? } + JWT
2.  Validate JWT → POST /internal/auth/validate (User Management)
3.  Detect language → langdetect (no external call)
4.  Embed query → POST /embed (Embedding Service) → 384-dim vector
5.  Retrieve top-5 chunks → POST /internal/retrieve (KB Service)
       Each chunk includes { text, law_name, article_number, language, score }
6.  Translation fallback: for any chunk where chunk.language ≠ user.language
       → call Groq Llama 3.1 8B inline: "Translate to {user_language}. Output only translation."
7.  Extract legal entities (parties, dates, amounts) — internal regex + simple prompt
8.  Classify legal intent (labor, housing, family, criminal, commercial) — internal prompt
9.  Load last 6 session turns from PostgreSQL rag_sessions
10. Build citation-grounded prompt (see template below)
11. Call LLM via abstraction layer → Groq Llama 3.3 70B, stream via SSE
12. Extract cited law references from response
13. Save full turn to PostgreSQL rag_sessions (JSONB append)
14. Emit matching.requested → Lawyer Service can pre-load recommendations
15. Close SSE stream with final { citations, domain, done: true }
```

#### LLM Abstraction Layer
```python
# app/services/llm.py
class LLMProvider:
    def generate(self, prompt: str, stream: bool = True):
        # Currently: Groq API
        # Swap to self-hosted: change this one function
        ...
```

#### Groq Prompt Template
```
SYSTEM:
You are a Cameroonian legal assistant specialising in Cameroonian law and
OHADA Uniform Acts. Answer ONLY using the legal context below. Always cite
the exact law and article number. End every response with:
"This is legal information, not legal advice. Consult a qualified lawyer."

LEGAL CONTEXT:
[Chunk 1 — translated to user language if needed]
[Source: {law_name}, {article_number}]
...

CONVERSATION HISTORY:
{last_6_turns}

USER QUESTION ({user_language}):
{question}

Respond in {user_language}.
```

#### SSE Response Format
```
data: {"token": "Selon", "done": false}
data: {"token": " l'article", "done": false}
...
data: {"citations": ["Labor Code Art. 34"], "domain": "labor", "done": true}
```

#### Events Published
| Event | Trigger | Payload |
|---|---|---|
| `matching.requested` | After domain + city extracted | `{ user_id, domain, city }` |
| `document.requested` | User asks to generate document | `{ user_id, domain, session_id }` |

#### Cross-Check Checklist
- [ ] FastAPI app starts, `/docs` accessible
- [ ] `POST /chat` returns valid SSE stream
- [ ] `langdetect` correctly identifies French and English queries
- [ ] Embedding Service called, returns 384-dim vector
- [ ] Knowledge Base `/internal/retrieve` returns chunks with language tags
- [ ] Translation fallback: French chunk returned for English user → Groq translates it
- [ ] NER extraction working (party names, amounts detected in test cases)
- [ ] Intent classification returns correct domain for labor/housing/family queries
- [ ] Groq API responds via LLM abstraction layer
- [ ] Response streams token-by-token via SSE
- [ ] Citations extracted from response and included in final SSE frame
- [ ] Session saved to PostgreSQL `rag_sessions` with JSONB messages array
- [ ] `GET /sessions` returns user's history (JWT-scoped)
- [ ] `matching.requested` published after domain extracted
- [ ] LLM abstraction layer: changing `LLMProvider` implementation doesn't break pipeline
- [ ] Dockerfile builds, Helm chart deploys to K3s
- [ ] Unit tests: prompt construction, citation extraction, translation fallback logic
- [ ] Integration tests: full query → Embedding → KB → Groq → PostgreSQL → SSE
- [ ] Coverage ≥ 80%

---

### 7.5 Embedding Service

**Framework:** FastAPI
**Database:** None (stateless — model in memory)
**Port:** 8005 | **Assigned:** Person A (Day 4)

Loads `intfloat/multilingual-e5-small` once at pod startup (~380MB RAM). Serves RAG Service (query embedding), Knowledge Base Service (Law Explorer query embedding), and Indexing Worker (chunk embedding during ingestion). Centralising the model here prevents duplicate loading across pods.

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/embed` | `{ texts: ["..."] }` → `{ embeddings: [[384 floats], ...] }` |
| GET | `/api/v1/health` | `{ status, model, dimensions: 384 }` |

#### Startup
```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("intfloat/multilingual-e5-small")
```

#### Cross-Check Checklist
- [ ] Model loads at startup — visible in logs
- [ ] `GET /health` returns `{ status: "ok", dimensions: 384 }`
- [ ] `POST /embed` with French text returns valid 384-dim vector
- [ ] `POST /embed` with English text returns valid 384-dim vector
- [ ] `POST /embed` with batch of 10 texts returns 10 vectors
- [ ] Model cached in Docker volume (no re-download on pod restart)
- [ ] Dockerfile builds, Helm chart deploys to K3s
- [ ] Unit tests: vector shape validation, batch embedding
- [ ] Coverage ≥ 80%

---

### 7.6 Document Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL — `lexcam_documents` + MinIO
**Port:** 8006 | **Assigned:** Person B (Day 6)

Generates formal legal documents from Jinja2 HTML templates via WeasyPrint. **Pay-first policy: no document is generated without a confirmed payment.** A document request starts at `awaiting_payment`. The Doc Worker triggers PDF generation only after `payment.confirmed` fires. No free tier, no watermark.

#### Database Schema

**Table: `document_templates`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| slug | VARCHAR UNIQUE | `mise-en-demeure-salaire` etc. |
| name_fr | VARCHAR | |
| name_en | VARCHAR | |
| description_fr | TEXT | |
| description_en | TEXT | |
| template_file | VARCHAR | Jinja2 `.html` path |
| price_xaf | INTEGER | |
| is_active | BOOLEAN | |

**Table: `document_fields`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| template_id | UUID FK | |
| field_key | VARCHAR | `debtor_name`, `amount_owed` |
| field_type | VARCHAR | `text`, `number`, `date`, `textarea` |
| label_fr | VARCHAR | |
| label_en | VARCHAR | |
| required | BOOLEAN | |
| order | INTEGER | |

**Table: `user_documents`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID | |
| template_id | UUID FK | |
| payment_id | UUID NULLABLE | |
| status | VARCHAR | `awaiting_payment`, `generating`, `ready`, `failed` |
| form_data | JSONB | |
| file_url | VARCHAR NULLABLE | MinIO URL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/templates` | List active templates |
| GET | `/api/v1/templates/{id}` | Template + all fields |
| POST | `/api/v1/documents` | Create request → `{ document_id, amount_xaf }` |
| GET | `/api/v1/documents` | User's document history |
| GET | `/api/v1/documents/{id}` | Get status |
| GET | `/api/v1/documents/{id}/download` | Download PDF (403 if not ready) |
| POST | `/internal/documents/{id}/mark-ready` | Doc Worker sets ready + file_url |

#### Cross-Check Checklist
- [ ] All 3 tables created and migrated
- [ ] 3 templates seeded: Mise en Demeure (Salaire), Mise en Demeure (Logement), Lettre de Réclamation
- [ ] Jinja2 templates render correctly with sample data
- [ ] `POST /documents` creates with `awaiting_payment` status
- [ ] `GET /documents/{id}/download` returns 403 when status ≠ ready
- [ ] `GET /documents/{id}/download` returns PDF when status = ready
- [ ] `POST /internal/documents/{id}/mark-ready` updates status + file_url
- [ ] MinIO accessible from service
- [ ] Dockerfile builds, Helm chart deploys to K3s
- [ ] Unit tests: template rendering, status machine
- [ ] Integration tests: create → payment confirmed (mocked) → mark ready → download
- [ ] Coverage ≥ 80%

---

### 7.7 Payment Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL — `lexcam_payments`
**Port:** 8007 | **Assigned:** Person B (Day 7)

Integrates with Campay API for MTN Mobile Money and Orange Money. Initiates payment, receives Campay webhook, validates signature, stores transaction, and publishes `payment.confirmed` to RabbitMQ.

#### Database Schema

**Table: `transactions`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID | |
| document_id | UUID | |
| amount | INTEGER | XAF |
| phone_number | VARCHAR | |
| operator | VARCHAR | `mtn` or `orange` |
| campay_reference | VARCHAR NULLABLE | |
| internal_reference | VARCHAR UNIQUE | |
| status | VARCHAR | `pending`, `confirmed`, `failed`, `expired` |
| webhook_payload | JSONB NULLABLE | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/payments/initiate` | `{ document_id, phone_number, operator }` → `{ payment_url, reference }` |
| POST | `/api/v1/payments/webhook` | Campay callback — validate + update + publish event |
| GET | `/api/v1/payments/{reference}` | Get transaction status |
| GET | `/api/v1/payments/history` | User's payment history |

#### Events Published
| Event | Trigger | Payload |
|---|---|---|
| `payment.confirmed` | Campay webhook success | `{ transaction_id, user_id, document_id, amount, operator }` |

#### Cross-Check Checklist
- [ ] `transactions` table created and migrated
- [ ] `POST /payments/initiate` calls Campay sandbox successfully
- [ ] Campay returns payment URL
- [ ] Webhook validates Campay signature header (invalid → 400)
- [ ] `payment.confirmed` published on confirmed webhook
- [ ] Campay keys loaded from environment — never hardcoded
- [ ] Dockerfile builds, Helm chart deploys to K3s
- [ ] Unit tests: webhook validation, signature check
- [ ] Integration tests: initiate → webhook → event published
- [ ] Coverage ≥ 80%

---

### 7.8 Notification Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL — `lexcam_notif`
**Port:** 8008 | **Assigned:** Person A (Day 8)

Dispatches all outbound emails via SMTP. Stores delivery logs with status and error messages.

#### Database Schema

**Table: `notifications`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID | |
| user_email | VARCHAR | |
| type | VARCHAR | See types below |
| subject | VARCHAR | |
| body | TEXT | Rendered HTML |
| status | VARCHAR | `sent`, `failed` |
| error_message | TEXT NULLABLE | |
| sent_at | TIMESTAMP | |

**Notification types and triggers:**

| Type | Fires On | Email To |
|---|---|---|
| `welcome` | `user.registered` | New user |
| `lawyer_verified` | `lawyer.verified` | Lawyer (approval or rejection) |
| `referral_created` | `referral.created` | Lawyer (new referral waiting) |
| `referral_accepted` | `referral.accepted` | Citizen (lawyer contact revealed) |
| `payment_receipt` | `payment.confirmed` | User |
| `document_ready` | `document.ready` | User (download link) |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/notifications` | User's notification history |
| PATCH | `/api/v1/notifications/{id}/read` | Mark as read |

#### Cross-Check Checklist
- [ ] `notifications` table created and migrated
- [ ] All 6 notification types send correct email content
- [ ] `referral.accepted` email includes lawyer's phone + email
- [ ] Failed emails logged with `status=failed` + error
- [ ] HTML email templates exist for all 6 types in French and English
- [ ] SMTP credentials loaded from environment
- [ ] Dockerfile builds, Helm chart deploys to K3s
- [ ] Unit tests: email rendering for all 6 types
- [ ] Integration tests: consume event → email sent → record saved
- [ ] Coverage ≥ 80%

---

### 7.9 Feedback Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL — `lexcam_feedback`
**Port:** 8009 | **Assigned:** Person A (Day 7, alongside RAG completion)

Collects user ratings on AI responses. Auto-flags responses rated "not helpful" by 3 or more users. Flagged responses enter the Admin Panel review queue. Reviewed and corrected responses feed into the knowledge base correction cycle.

#### Database Schema

**Table: `feedback`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID | |
| session_id | UUID | References `rag_sessions.id` |
| message_index | INTEGER | Which AI message was rated |
| rating | VARCHAR | `helpful`, `not_helpful` |
| comment | TEXT NULLABLE | |
| flagged | BOOLEAN | Auto-set when same message gets ≥ 3 `not_helpful` |
| reviewed_by | UUID NULLABLE | Admin user_id |
| reviewed_at | TIMESTAMP NULLABLE | |
| created_at | TIMESTAMP | |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/feedback` | Submit rating `{ session_id, message_index, rating, comment? }` |
| GET | `/api/v1/feedback/flagged` | Admin only — list flagged responses |
| PATCH | `/api/v1/feedback/{id}/review` | Admin marks reviewed |

#### Events Published
| Event | Trigger | Payload |
|---|---|---|
| `feedback.flagged` | Record auto-flagged | `{ feedback_id, session_id, message_index }` |

#### Cross-Check Checklist
- [ ] `feedback` table created and migrated
- [ ] `POST /feedback` saves rating linked to correct session + message
- [ ] Auto-flag triggers when same message reaches 3 `not_helpful` ratings
- [ ] `feedback.flagged` event published on auto-flag
- [ ] `GET /feedback/flagged` returns only flagged, unreviewed records (admin JWT)
- [ ] `PATCH /feedback/{id}/review` sets `reviewed_by` + `reviewed_at`
- [ ] Dockerfile builds, Helm chart deploys to K3s
- [ ] Unit tests: flag threshold logic, rating storage
- [ ] Coverage ≥ 80%

---

### 7.10 Admin Panel

**Framework:** Django 4.2 + Django Admin
**Database:** PostgreSQL — `lexcam_admin`
**Port:** 8010 | **Assigned:** Person B (Day 8)
**Access:** Internal K8s route only — not publicly accessible

Internal dashboard. Django Admin exposes lawyer verification, user management, flagged feedback review, and platform stats. Custom endpoints handle scraper triggering.

#### Database Schema

**Table: `audit_logs`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| admin_user_id | UUID | |
| action | VARCHAR | `verify_lawyer`, `reject_lawyer`, `trigger_scraper`, `review_feedback` |
| target_type | VARCHAR | |
| target_id | UUID NULLABLE | |
| details | JSONB | |
| created_at | TIMESTAMP | |

**Table: `platform_stats`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| stat_date | DATE | |
| total_users | INTEGER | |
| total_verified_lawyers | INTEGER | |
| total_documents_generated | INTEGER | |
| total_revenue_xaf | INTEGER | |
| recorded_at | TIMESTAMP | |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/admin/scraper/trigger` | Publish `scrape.requested` |
| GET | `/api/v1/admin/stats` | Platform statistics |
| GET | `/api/v1/admin/audit-logs` | Recent admin actions |

#### Events Published
| Event | Trigger | Payload |
|---|---|---|
| `scrape.requested` | Admin triggers scraper | `{ requested_by, timestamp }` |

#### Events Consumed
| Event | Action |
|---|---|
| `feedback.flagged` | Adds record to Django Admin review queue |

#### Cross-Check Checklist
- [ ] Both tables created and migrated
- [ ] Django Admin at `/admin/` — internal route only, NOT via Kong
- [ ] Lawyer verification actions in Django Admin
- [ ] Flagged feedback records visible in Admin review queue
- [ ] `POST /admin/scraper/trigger` publishes `scrape.requested`
- [ ] Every admin action logged to `audit_logs`
- [ ] `GET /admin/stats` returns live platform statistics
- [ ] Dockerfile builds, Helm chart deploys to K3s (internal ingress only)
- [ ] Unit tests: stats aggregation, audit logging
- [ ] Coverage ≥ 80%

---

### 7.11 Scraper Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL — `lexcam_scraping`
**Port:** 8011 | **Assigned:** Person A (Day 9)

Crawls Barreau du Cameroun and avocat.cm. Source configuration (URLs, CSS selectors, run frequency) stored in PostgreSQL. Raw HTML archived in MinIO for debugging. Parsed profiles published as `lawyers.scraped` events.

#### Database Schema

**Table: `scraper_sources`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR | `avocat.cm`, `barreau-cameroun.cm` |
| base_url | VARCHAR | |
| css_selectors | JSONB | Field extraction selectors |
| is_active | BOOLEAN | |

**Table: `scrape_runs`**
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| source_id | UUID FK | |
| started_at | TIMESTAMP | |
| completed_at | TIMESTAMP NULLABLE | |
| status | VARCHAR | `running`, `completed`, `failed` |
| lawyers_scraped | INTEGER | |
| error_message | TEXT NULLABLE | |

#### Events Consumed / Published

| Direction | Event | Action |
|---|---|---|
| Consumes | `scrape.requested` | Starts crawl of all active sources |
| Publishes | `lawyers.scraped` | Batch of 20 parsed lawyer objects |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/scraper/status` | Last run status + count |

#### Cross-Check Checklist
- [ ] Both tables created and migrated
- [ ] `scrape.requested` consumed, crawl starts automatically
- [ ] avocat.cm returns ≥ 10 lawyer records
- [ ] Raw HTML uploaded to MinIO `lexcam-scraper-html` bucket
- [ ] `lawyers.scraped` published in batches of 20
- [ ] HTTP errors and timeouts handled (scraper does not crash)
- [ ] Scrape run logged to `scrape_runs` with final status + count
- [ ] Dockerfile builds, Helm chart deploys to K3s
- [ ] Unit tests: HTML parsing, data extraction, shape validation
- [ ] Coverage ≥ 80%

---

## 8. Workers

---

### 8.1 Doc Worker

**Type:** K8s Deployment | **Assigned:** Person B (Day 9)
**Consumes:** `payment.confirmed`

```
1. Receive payment.confirmed event
2. GET /api/v1/documents/{document_id} from Document Service
3. Render Jinja2 HTML template with form_data
4. Convert HTML → PDF via WeasyPrint
5. Upload PDF → MinIO (lexcam-documents/{user_id}/{doc_id}.pdf)
6. POST /internal/documents/{id}/mark-ready with file_url
7. Publish document.ready
```

**Publishes:** `document.ready`

**Checklist:**
- [ ] Connects to RabbitMQ, subscribes to `payment.confirmed`
- [ ] Jinja2 template renders with correct data
- [ ] WeasyPrint generates valid PDF
- [ ] PDF uploaded to MinIO with correct path
- [ ] Document Service mark-ready called successfully
- [ ] `document.ready` published with download URL
- [ ] Failed generation → DLX, not lost
- [ ] Dockerfile builds, deploys as K8s Deployment

---

### 8.2 Notification Worker

**Type:** K8s Deployment | **Assigned:** Person B (Day 9)
**Consumes:** `user.registered`, `lawyer.verified`, `referral.created`, `referral.accepted`, `payment.confirmed`, `document.ready`

Dispatches correct email template for each event type via Notification Service or directly via SMTP. Retries up to 3 times before routing to DLX.

**Checklist:**
- [ ] Subscribes to all 6 event types
- [ ] Each event triggers correct email via SMTP
- [ ] Failed sends retry 3× then go to DLX
- [ ] Dockerfile builds, deploys as K8s Deployment

---

### 8.3 Lawyer Ingest Worker

**Type:** K8s Deployment | **Assigned:** Person A (Day 9)
**Consumes:** `lawyers.scraped`

```
1. Receive batch of scraped lawyer objects
2. Validate required fields (name, city, phone/email)
3. Deduplicate by email OR (name + city)
4. POST /internal/lawyers/ingest → Lawyer Service bulk insert
5. Log: X inserted, Y skipped
```

**Checklist:**
- [ ] Duplicate detection working
- [ ] Only `type=scraped` records created
- [ ] Never overwrites `type=registered` records
- [ ] Lawyer Service ingest endpoint called correctly
- [ ] Invalid records logged and skipped, worker does not crash
- [ ] Dockerfile builds, deploys as K8s Deployment

---

### 8.4 Indexing Worker

**Type:** K8s Deployment | **Assigned:** Person B (Day 9)
**Consumes:** `corpus.updated`

Replaces the old KB Worker (K8s Job). Runs permanently, processes law content updates as events arrive.

```
1. Receive corpus.updated event with article_ids
2. Fetch article full_text from Knowledge Base Service
3. Chunk into 500-token segments (50-token overlap)
4. POST /embed for each chunk → Embedding Service → 384-dim vectors
5. Upsert vectors + metadata into Qdrant (lexcam_laws collection)
6. Update qdrant_id on law_articles in PostgreSQL
7. Log: X chunks indexed
```

**Initial Ingestion (Day 5):** Run as a one-time script locally to seed Qdrant before RAG testing begins. After that, Indexing Worker handles incremental updates automatically.

**Checklist:**
- [ ] Subscribes to `corpus.updated`
- [ ] Chunks law text at 500 tokens with 50-token overlap
- [ ] Embedding Service called per chunk — 384-dim vectors returned
- [ ] Vectors upserted into Qdrant (no duplicates on re-run)
- [ ] PostgreSQL `qdrant_id` updated after upsert
- [ ] Initial seed script runs successfully, ≥ 500 chunks in Qdrant
- [ ] Dockerfile builds, deploys as K8s Deployment

---

## 9. Frontend PWA (Next.js 14)

**Assigned:** Both (Days 10–11)
**Stack:** Next.js 14 App Router, Tailwind CSS, next-i18next

### Pages

| Page | Path | Description |
|---|---|---|
| Home | `/` | Hero, Law Explorer search bar, quick links |
| Register | `/auth/register` | User + Lawyer registration |
| Login | `/auth/login` | JWT login |
| AI Chat | `/chat` | SSE streaming AI Legal Assistant |
| Chat History | `/chat/history` | Past sessions list |
| Law Explorer | `/laws` | Dual search results |
| Law Article | `/laws/{id}` | Full text + plain summary |
| Lawyer Directory | `/lawyers` | City + specialization filter |
| Lawyer Profile | `/lawyers/{id}` | Public profile + Request Referral button |
| Referral Request | `/lawyers/{id}/referral` | Submit referral form (issue summary) |
| Document Generator | `/documents` | Template list + form + payment |
| My Documents | `/documents/my` | History + download |
| User Profile | `/profile` | Edit profile, language toggle |
| Lawyer Dashboard | `/dashboard` | Referrals (pending/accepted), profile, verification status |
| 404 | `/not-found` | |

### Frontend Checklist
- [ ] Next.js with App Router created
- [ ] Tailwind CSS configured
- [ ] French + English i18n working (navbar toggle)
- [ ] JWT stored in httpOnly cookies (not localStorage)
- [ ] AI Chat page streams SSE token-by-token
- [ ] Law Explorer dual search works in French and English
- [ ] Lawyer Directory filters by city and specialization
- [ ] Referral form sends issue summary, feedback on status
- [ ] Lawyer Dashboard shows referrals with accept/decline buttons
- [ ] Document page: fill form → initiate Campay payment → poll status → show success
- [ ] PWA manifest.json configured (mobile installable)
- [ ] Responsive at 375px minimum width
- [ ] Deployed to K3s as nginx-served static build

---

## 10. Complete RabbitMQ Event Map

| Event | Published By | Consumed By | Payload |
|---|---|---|---|
| `user.registered` | User Management | Notification Worker | `user_id, email, full_name` |
| `user.deleted` | User Management | (audit log) | `user_id` |
| `lawyer.verified` | Lawyer Service | Notification Worker | `lawyer_id, full_name, email, status` |
| `referral.created` | Lawyer Service | Notification Worker | `referral_id, lawyer_email, user_name, domain` |
| `referral.accepted` | Lawyer Service | Notification Worker | `referral_id, user_email, lawyer_name, lawyer_phone` |
| `referral.resolved` | Lawyer Service | (audit log) | `referral_id` |
| `matching.requested` | RAG Service | Lawyer Service | `user_id, domain, city` |
| `document.requested` | RAG Service | (future use) | `user_id, domain, session_id` |
| `payment.confirmed` | Payment Service | Doc Worker, Notification Worker | `transaction_id, user_id, document_id, amount` |
| `document.ready` | Doc Worker | Notification Worker | `document_id, user_id, user_email, download_url` |
| `corpus.updated` | Knowledge Base | Indexing Worker | `article_ids, action` |
| `scrape.requested` | Admin Panel | Scraper Service | `requested_by, timestamp` |
| `lawyers.scraped` | Scraper Service | Lawyer Ingest Worker | `lawyers: [array]` |
| `feedback.flagged` | Feedback Service | Admin Panel | `feedback_id, session_id, message_index` |

**RabbitMQ Config:**
- Exchange: `lexcam.events` (topic)
- DLX: `lexcam.dlx` (failed after 3 retries)
- Each consumer has its own named queue
- All messages persistent (`delivery_mode=2`)

---

## 11. DevOps Deliverables

### Jenkins CI/CD Pipeline

```
Stage 1: Checkout      → git pull latest main
Stage 2: Test          → pytest for each changed service (parallel)
Stage 3: Coverage      → fail build if any service < 80%
Stage 4: Build         → docker build each service
Stage 5: Push          → push to GitHub Container Registry
Stage 6: Deploy        → helm upgrade --install
Stage 7: Health Check  → kubectl rollout status
```

**Jenkins Checklist:**
- [ ] Jenkins running in K3s
- [ ] GitHub webhook triggers on push to main
- [ ] Jenkinsfile at repo root
- [ ] All 7 stages complete successfully
- [ ] Coverage < 80% fails build
- [ ] Images pushed to GHCR
- [ ] Rolling update on deploy
- [ ] Screenshot of successful + failed run captured

---

### Prometheus + Grafana

| Source | Key Metrics |
|---|---|
| Node Exporter | CPU, RAM, disk, network |
| K3s | Pod count, restarts |
| Kong | Request rate, error rate, latency |
| FastAPI services | `prometheus-fastapi-instrumentator` |
| Django services | `django-prometheus` |
| RabbitMQ | Queue depth, DLX count |
| PostgreSQL | `postgres_exporter` — connections, slow queries |

**3 dashboards required:**
1. Infrastructure (CPU, RAM, disk)
2. Service Health (request rates, error rates)
3. Business Metrics (users, documents, payments, flagged AI responses)

**Monitoring Checklist:**
- [ ] All services scraped by Prometheus
- [ ] FastAPI `/metrics` endpoints active
- [ ] Django `/metrics` endpoints active
- [ ] 3 Grafana dashboards configured
- [ ] 1 alert rule configured (service down or error rate > 5%)
- [ ] Dashboard screenshots captured

---

### Ansible Playbooks

**Playbook 1: `provision-vps.yml`** — Ubuntu packages, UFW, SSH hardening, Docker
**Playbook 2: `deploy-k3s.yml`** — K3s, kubeconfig, Helm, kubectl

**Ansible Checklist:**
- [ ] Both playbooks run end-to-end without errors
- [ ] Both are idempotent (safe to run twice)
- [ ] Execution logs captured for submission

---

## 12. Testing Strategy

| Service | Unit Tests | Integration Tests |
|---|---|---|
| User Management | OTP logic, JWT, bcrypt | Register → verify → login → logout |
| Lawyer Service | Referral state machine, filters | Register → verify → referral → accept |
| RAG Service | Prompt construction, citation extraction, translation fallback | Full query → embed → retrieve → stream → save |
| Knowledge Base | RRF merging, ranking | Search → Qdrant + tsvector → merged results |
| Embedding Service | Vector shape, dimension | FR + EN text → 384-dim vectors |
| Document Service | Template render, status machine | Create → confirmed → mark-ready → download |
| Payment Service | Webhook validation, signature | Initiate → webhook → event published |
| Notification Service | Email render all 6 types | Event consumed → email sent → record saved |
| Feedback Service | Flag threshold logic | Submit × 3 not_helpful → auto-flag → event |
| Admin Panel | Stats aggregation, audit log | Trigger scraper → `scrape.requested` published |
| Scraper Service | HTML parsing, data extraction | Scrape → valid lawyer batch published |

```bash
# Django
pytest --cov=apps --cov-report=html --cov-fail-under=80

# FastAPI
pytest --cov=app --cov-report=html --cov-fail-under=80
```

**Testing Checklist:**
- [ ] Every service has unit + integration tests
- [ ] All tests pass (`pytest` exits 0)
- [ ] Coverage ≥ 80% per service
- [ ] HTML coverage reports generated
- [ ] Integration tests use real databases (no DB mocks)
- [ ] Jenkins fails build on < 80%

---

## 13. Scrum Documentation

| Role | Person |
|---|---|
| Product Owner | Person A |
| Scrum Master | Person B |
| Developer | Both |

**Sprint 1 (Days 1–7):** Infrastructure + all AI pipeline services + core business services running locally
**Sprint 2 (Days 8–14):** Remaining services + workers + frontend + DevOps + all deliverables

**Scrum Checklist:**
- [ ] GitHub Projects board created today with all services as cards
- [ ] Sprint 1 + Sprint 2 milestones created
- [ ] Daily standup notes documented throughout
- [ ] Burndown chart for Sprint 1
- [ ] Burndown chart for Sprint 2
- [ ] Sprint retrospective for each sprint
- [ ] Board screenshots captured for submission

---

## 14. Exam Deliverables Master Checklist

### Section 1 — Infrastructure (15 marks)
- [ ] K3s cluster running with all 16 components deployed
- [ ] UFW rules documented + screenshot
- [ ] Traefik + Kong routing demonstrated
- [ ] Clean infrastructure diagram (draw.io or Lucidchart — not hand-drawn)
- [ ] Both Ansible playbooks execute successfully
- [ ] `kubectl get pods --all-namespaces` screenshot showing all Running

### Section 2 — Scrum (5 marks)
- [ ] Roles document, product backlog, sprint backlogs
- [ ] Burndown charts for Sprint 1 and Sprint 2
- [ ] Sprint retrospective documents
- [ ] GitHub Projects board screenshots

### Section 3 — Jenkins CI/CD (10 marks)
- [ ] Jenkinsfile at repo root
- [ ] All 7 pipeline stages working
- [ ] Auto-triggered on GitHub push
- [ ] Screenshot: successful pipeline run
- [ ] Screenshot: failed run (coverage < 80%)

### Section 4 — Prometheus + Grafana (2.5 marks)
- [ ] Prometheus targets all green
- [ ] 3 Grafana dashboards with screenshots
- [ ] 5+ key metrics explained

### Section 5 — Ansible (2.5 marks)
- [ ] `provision-vps.yml` + `deploy-k3s.yml`
- [ ] Execution log screenshots

### Section 6 — Testing (10 marks)
- [ ] All tests pass for all 11 services
- [ ] Coverage ≥ 80% per service — HTML reports
- [ ] Jenkins coverage stage passes
- [ ] 3+ sample test files in submission

### Section 7 — Docker + Kubernetes (15 marks)
- [ ] Dockerfile for every service (11 services + 4 workers + frontend)
- [ ] Helm chart for every service
- [ ] `kubectl get pods` all Running
- [ ] HPA on RAG Service + User Management
- [ ] Rolling update demonstrated
- [ ] Services calling each other by K8s DNS name

### Section 8 — Architecture (20 marks)
- [ ] Architecture style justified (microservices + event-driven hybrid)
- [ ] Component diagram (UML)
- [ ] Deployment diagram (K3s pods, services, ingress, databases)
- [ ] Sequence diagram (RAG query pipeline end-to-end)
- [ ] Trade-off table (scalability vs complexity, etc.)
- [ ] Quality attributes discussed
- [ ] Pros/Cons of chosen architecture
- [ ] Architectural design process documented

### Section 9 — Innovation (10 marks)
- [ ] RAG + Cameroonian law corpus description
- [ ] Bilingual AI with translation fallback explained
- [ ] Mobile Money + LLM abstraction layer explained
- [ ] Demo video: AI response in French with law citations
- [ ] Feedback Service → continuous improvement loop

### Section 10 — Documentation (15 marks)
- [ ] README: setup, architecture overview, contribution guide
- [ ] Swagger accessible for all 11 services
- [ ] User manual with screenshots
- [ ] Postman collection or Swagger links
- [ ] Project report (all 4 chapters, course template)

### Submission Package
- [ ] Printed report (Word/LaTeX)
- [ ] 7-minute video walkthrough
- [ ] PowerPoint (max 20 slides)
- [ ] ZIP: source code + config + all deliverables

---

## 15. Environment Variables Reference

```bash
# All services
DATABASE_URL=postgresql://lexcam:pass@postgres-svc:5432/lexcam_[schema]
REDIS_URL=redis://redis-svc:6379/0
RABBITMQ_URL=amqp://lexcam:pass@rabbitmq-svc:5672/
JWT_SECRET_KEY=your-secret-key
INTERNAL_SERVICE_KEY=shared-internal-key

# RAG + KB + Embedding (Groq for LLM + inline translation)
GROQ_API_KEY=gsk_...

# RAG Service (inter-service URLs)
EMBEDDING_SERVICE_URL=http://embedding-svc:8005
KB_SERVICE_URL=http://knowledge-base-svc:8003
USER_MANAGEMENT_URL=http://user-management-svc:8001
LAWYER_SERVICE_URL=http://lawyer-svc:8002

# Payment
CAMPAY_USERNAME=your-campay-username
CAMPAY_PASSWORD=your-campay-password
CAMPAY_WEBHOOK_SECRET=your-webhook-secret

# Notification
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=lexcam@gmail.com
SMTP_PASSWORD=your-app-password

# Document + Scraper (MinIO)
MINIO_ENDPOINT=minio-svc:9000
MINIO_ACCESS_KEY=your-key
MINIO_SECRET_KEY=your-secret
MINIO_DOCUMENTS_BUCKET=lexcam-documents
MINIO_SCRAPER_BUCKET=lexcam-scraper-html

# User Management
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
OTP_EXPIRE_MINUTES=10
```

---

*Document version: 2.0 — Updated to match Final Reconciled Service List v3.0*
*Last updated: 2026-05-10*
*LexCam — ICT University SEN3244 Spring 2026*
