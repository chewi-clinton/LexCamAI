# LEXCAM — COMPLETE PROJECT DESCRIPTION
## Updated Version | Spring 2026

---

## 1.1 Executive Summary

LexCam is an AI-powered digital legal aid platform designed specifically for Cameroon. It addresses the critical access-to-justice gap by empowering ordinary citizens with reliable legal information, practical tools, and direct connections to verified lawyers in their city.

The platform enables users to:

- Describe their legal problem in plain French or English and receive clear explanations of their rights under Cameroonian and OHADA law, powered by a RAG (Retrieval-Augmented Generation) pipeline using Groq LLM and Qdrant vector search.
- Search and read actual laws through an intuitive bilingual Law Explorer with dual semantic and keyword search.
- Book appointments directly with verified registered lawyers in their city through an integrated appointment system.
- Generate formal legal documents (Mise en Demeure, Lettre de Réclamation, Déclaration de Faits, etc.) after payment via Mobile Money — no document is generated without payment confirmation.
- Find verified lawyers (self-registered and verified by admin) or browse scraped lawyer listings from public sources.
- Receive AI-powered lawyer recommendations based on the legal domain detected in their conversation and their city.

LexCam is built as a bilingual Progressive Web App (French and English), mobile-friendly, and accessible to users with varying levels of digital literacy. It is deployed on a Contabo VPS running K3s (lightweight Kubernetes) using a microservices and event-driven hybrid architecture.

---

## 1.2 The Problem It Solves

Cameroon faces a severe access-to-justice crisis:

| Pain Point | Current Reality | Impact |
|---|---|---|
| Cost | Legal consultation: 20,000–50,000 XAF per session | Most citizens cannot afford even basic advice |
| Geography | 70%+ of lawyers concentrated in Douala and Yaoundé | Rural and secondary cities underserved |
| Language & Complexity | Legal texts are dense and technical | Average citizens cannot understand their rights |
| Procedural Knowledge | Citizens do not know what to do or where to start | Cases are lost due to ignorance of process |
| Document Preparation | No access to jurisdiction-specific templates | Formal letters are poorly drafted or avoided |
| Information Access | Laws are scattered and hard to find | Citizens remain uninformed of their rights |
| Lawyer Discovery | No reliable directory of verified lawyers | Citizens cannot find trusted legal representation |

**LexCam Solution:** A one-stop, easy-to-use platform that provides immediate AI-powered legal information, appointment booking with verified lawyers, Mobile Money-gated document generation, and a bilingual Law Explorer — all at little or no cost to the citizen.

---

## 1.3 Target Users

| User Type | Description |
|---|---|
| **Primary — Citizens** | Urban and semi-urban residents facing housing disputes, unpaid wages, police encounters, family matters, or consumer issues |
| **Secondary — Lawyers** | Legal professionals who self-register to gain visibility, receive appointment bookings, and grow their client base |
| **Tertiary — Legal Aid NGOs** | Organizations seeking a platform to connect citizens with legal resources |
| **Tertiary — Students** | Law students using the Law Explorer and AI assistant for research |

---

## 1.4 Core Functionalities

### 1. AI Legal Assistant (Core Innovation)

Users describe their legal problem in plain French, English, or code-switched language. The AI pipeline:

- Detects the language using `langdetect`
- Translates queries to English if needed (via Groq Llama 3.1 8B)
- Embeds the query using `intfloat/multilingual-e5-small` (served by the Embedding Service)
- Retrieves the top-5 most relevant law chunks from Qdrant via cosine similarity search
- Constructs a grounded prompt with retrieved legal context, conversation history, and the user's query
- Calls Groq Llama 3.3 70B and streams the response token-by-token via SSE (Server-Sent Events)
- Translates the response back to the user's language if needed
- Stores the full conversation in MongoDB for the user to review later
- Includes a mandatory disclaimer: *"This is legal information, not legal advice. Consult a qualified lawyer for your specific situation."*
- Recommends matching lawyers from the directory based on the detected legal domain and the user's city

### 2. Lawyer Directory with Appointment Booking

LexCam manages two distinct types of lawyers:

**Self-Registered Lawyers (Full Profile):**
- Lawyers register directly on the platform with full profile: name, city, region, specializations, bio, contact details, and location
- Lawyers upload verification documents (Bar certificate, National ID, Diploma) for admin review
- Admin verifies the lawyer via the Admin Panel before the profile is publicly listed
- Verified lawyers can receive appointment bookings from users
- Lawyers have a personal dashboard where they see all booked appointments, can confirm or cancel, and manage their availability slots
- Users can book appointments specifying their issue, preferred date, and time

**Web-Scraped Lawyers (Listing Only):**
- Scraped from public sources (Barreau du Cameroun, avocat.cm) by the Web Scraper Service
- Displayed with name, city, phone, and email only
- No booking capability — users contact them directly outside the platform
- Serves to populate the directory at launch with real lawyer data

**AI Lawyer Recommendations:**
- After an AI Legal Assistant conversation, LexCam recommends verified registered lawyers whose specializations match the detected legal domain and who are located in or near the user's city

### 3. Document Generator (Payment-Gated)

Users can generate formally structured Cameroonian legal documents. There is no free or watermarked version — documents are only generated after payment is confirmed.

**Available document types:**
- Mise en Demeure — Salaire Impayé
- Mise en Demeure — Logement
- Lettre de Réclamation
- Dénonciation de Congé
- Déclaration de Faits

**Flow:**
1. User selects a document template and fills in the required fields
2. System creates a document request with status `awaiting_payment`
3. User is redirected to pay via Mobile Money (MTN or Orange via Campay)
4. Campay sends a webhook confirming payment
5. Doc Worker generates a clean PDF using WeasyPrint and a Jinja2 template
6. PDF is stored in MinIO
7. User receives an email with the download link
8. Document is available in their document history

Payment integration: Campay API (MTN Mobile Money and Orange Money). Document metadata stored in PostgreSQL. PDF files stored in MinIO (S3-compatible object storage).

### 4. Law Explorer

A prominent search interface allowing users to search Cameroonian and OHADA legal texts by keyword or natural language query.

- **Dual search engine:** Qdrant vector/semantic search + PostgreSQL full-text search (tsvector), merged using Reciprocal Rank Fusion for best results
- Search supports French and English queries
- Results display: law name, article number, chapter, and excerpt
- Click any result to read the full article text plus a plain-language summary generated on demand by Groq (cached in Redis for 7 days)
- Quick links to generate a related document or ask the AI assistant
- Covers: Constitution, Civil Code, Labor Code, Penal Code, OHADA Uniform Acts

### 5. Web Scraper

An admin-triggered stateless service that seeds the lawyer directory with real data.

- Triggered from the Admin Panel, which publishes a `scrape.requested` event to RabbitMQ
- Scraper Service consumes the event and scrapes Barreau du Cameroun and avocat.cm
- Structured lawyer data published as `lawyers.scraped` events in batches
- Lawyer Ingest Worker consumes those events, validates, deduplicates, and persists to the Lawyer DB
- Scraped lawyers are marked `type=scraped` and are listed without booking capability

### 6. Notification System

All outbound communications are handled through an event-driven Notification Service:

| Event Trigger | Email Sent To |
|---|---|
| `user.registered` | Welcome email to new user |
| `lawyer.registered` | Alert email to admin about pending verification |
| `appointment.booked` | Notification to lawyer about new booking |
| `appointment.confirmed` | Confirmation to user that lawyer accepted |
| `payment.confirmed` | Payment receipt to user |
| `document.ready` | Download link email to user |

### 7. Admin Panel

Internal-only dashboard for the LexCam team. Accessible only via an internal Kubernetes route — not exposed on the public domain.

- Review and verify/reject lawyer self-registrations
- View platform statistics (users, lawyers, documents generated, revenue)
- Manually trigger the web scraper
- Monitor audit logs of all admin actions
- Powered by Django Admin with custom endpoints

---

## 1.5 System Architecture

LexCam uses a **Microservices + Event-Driven Hybrid Architecture** deployed on a single Contabo VPS running K3s.

### Architecture Style Justification

**Microservices** — each service owns its domain, its database, and its deployment lifecycle. Services can be scaled, updated, and restarted independently without affecting the rest of the system.

**Event-Driven** — all asynchronous workflows (document generation, notifications, lawyer ingestion, scraping) are decoupled through RabbitMQ. Services publish events without knowing who consumes them, enabling loose coupling and fault tolerance through the Dead Letter Exchange (DLX).

### Infrastructure Stack

```
Browser (Bilingual PWA — Next.js 14)
        ↓
UFW Firewall (Contabo VPS)
        ↓
Traefik Ingress Controller (K3s built-in) — TLS, round-robin load balancing
        ↓
Kong API Gateway — routing, rate limiting, request logging, auth middleware
        ↓
kube-proxy (ClusterIP) — internal Kubernetes load balancer
        ↓
[Microservices Layer]
```

### Services

| # | Service | Framework | Database | Type |
|---|---|---|---|---|
| 1 | User Management Service | Django + DRF | PostgreSQL (lexcam_users) | Synchronous |
| 2 | Lawyer Service | Django + DRF | PostgreSQL (lexcam_lawyers) | Synchronous + Event Publisher |
| 3 | RAG Service | FastAPI | MongoDB (lexcam_rag) | Synchronous (SSE streaming) |
| 4 | Knowledge Base Service | FastAPI | Qdrant + PostgreSQL (lexcam_kb) | Synchronous |
| 5 | Translation Service | FastAPI | None (stateless) | Synchronous |
| 6 | Embedding Service | FastAPI | None (model in memory) | Synchronous |
| 7 | Document Service | Django + DRF | PostgreSQL (lexcam_docs) + MinIO | Synchronous + Event Consumer |
| 8 | Payment Service | Django + DRF | PostgreSQL (lexcam_payments) | Synchronous + Event Publisher |
| 9 | Notification Service | Django + DRF | PostgreSQL (lexcam_notif) | Event Consumer |
| 10 | Admin Panel | Django + Django Admin | PostgreSQL (lexcam_admin) | Synchronous + Event Publisher |
| 11 | Scraper Service | Django + DRF | None (stateless) | Event Consumer + Publisher |

### Workers (Separate Pods)

| Worker | Type | Consumes | Publishes |
|---|---|---|---|
| Doc Worker | K8s Deployment | `payment.confirmed` | `document.ready` |
| Notification Worker | K8s Deployment | `user.registered`, `payment.confirmed`, `document.ready`, `appointment.booked`, `appointment.confirmed`, `lawyer.registered` | None |
| Lawyer Ingest Worker | K8s Deployment | `lawyers.scraped` | None |
| KB Worker | K8s Job (one-time) | Triggered by Admin | None |

### Databases

| Database | Technology | Used By |
|---|---|---|
| lexcam_users | PostgreSQL | User Management Service |
| lexcam_lawyers | PostgreSQL | Lawyer Service |
| lexcam_documents | PostgreSQL | Document Service |
| lexcam_payments | PostgreSQL | Payment Service |
| lexcam_notif | PostgreSQL | Notification Service |
| lexcam_admin | PostgreSQL | Admin Panel |
| lexcam_kb | PostgreSQL | Knowledge Base Service (article metadata + tsvector) |
| lexcam_rag | MongoDB | RAG Service (conversation history) |
| Qdrant | Qdrant | Knowledge Base Service (law vectors) |
| lexcam-documents | MinIO | Document Service (PDF files) |

> All PostgreSQL databases run on a **single PostgreSQL pod** (one StatefulSet). Each service has its own logical database — the database-per-service pattern is preserved at the logical level. This consolidation saves approximately 1GB RAM on the 8GB VPS.

### Caching and Messaging

| Component | Technology | Purpose |
|---|---|---|
| Redis | Redis 7 | JWT sessions, rate limit counters, law summary cache (TTL 7 days) |
| RabbitMQ | RabbitMQ 3 | Event bus — topic exchange `lexcam.events` |
| DLX | RabbitMQ DLX | Dead Letter Exchange — captures failed messages after 3 retries |

### RabbitMQ Event Map

| Event | Published By | Consumed By |
|---|---|---|
| `user.registered` | User Management | Notification Worker |
| `lawyer.registered` | Lawyer Service | Notification Worker |
| `appointment.booked` | Lawyer Service | Notification Worker |
| `appointment.confirmed` | Lawyer Service | Notification Worker |
| `scrape.requested` | Admin Panel | Scraper Service |
| `lawyers.scraped` | Scraper Service | Lawyer Ingest Worker |
| `payment.confirmed` | Payment Service | Doc Worker, Notification Worker |
| `document.ready` | Doc Worker | Notification Worker |

### External Systems

| System | Provider | Purpose | Cost |
|---|---|---|---|
| LLM Provider | Groq API | Legal reasoning (Llama 3.3 70B), translation and summaries (Llama 3.1 8B) | Free tier (6,000 req/day) |
| Payment Gateway | Campay API | MTN Mobile Money + Orange Money | Free sandbox |
| Email SMTP | Gmail SMTP | Transactional emails | Free |
| Scraper Sources | Barreau du Cameroun, avocat.cm | Lawyer data seeding | Free (public web) |

> **LibreTranslate has been removed.** Translation is handled by the Translation Service calling Groq Llama 3.1 8B — better quality for French/English legal text, zero additional RAM cost, and already covered by the existing Groq API key.

### AI Pipeline

**Embedding:** `intfloat/multilingual-e5-small` loaded in the Embedding Service pod at startup. Handles both French and English text. Outputs 384-dimensional vectors. Model is downloaded from HuggingFace once and cached in a Kubernetes volume.

**Knowledge Base Ingestion (KB Worker — K8s Job):**
```
Law text files (OHADA, Labor Code, Civil Code, Penal Code, Constitution)
    → Parse and chunk (500 tokens, 50-token overlap)
    → Embedding Service → 384-dim vectors
    → Qdrant (vectors + metadata)
    → PostgreSQL lexcam_kb (article metadata + tsvector index)
```

**AI Legal Assistant Query (RAG Service — real-time, streamed):**
```
User query (FR/EN/mixed)
    → Language detection (langdetect)
    → Translation to English if needed (Translation Service → Groq Llama 3.1 8B)
    → Query embedding (Embedding Service → multilingual-e5-small)
    → Semantic search (Qdrant, top-5 chunks)
    → Load conversation history (MongoDB, last 6 turns)
    → Prompt construction (system + law context + history + query)
    → LLM inference (Groq Llama 3.3 70B — streamed via SSE)
    → Translate response back if needed (Translation Service → Groq)
    → Extract citations
    → Save conversation to MongoDB
    → Stream to client with citations + disclaimer
```

**Law Explorer Search (Knowledge Base Service — dual search):**
```
User search query
    → Embed query (Embedding Service)
    → Semantic search (Qdrant, top-10)
    → Keyword search (PostgreSQL tsvector, top-10)
    → Merge results (Reciprocal Rank Fusion)
    → Return ranked articles
    → On article click: plain-language summary (Groq, cached in Redis 7 days)
```

### DevOps Stack

| Tool | Purpose |
|---|---|
| Jenkins | CI/CD — automated build, test, push image, deploy on merge to main |
| Prometheus | Metrics scraping from all services and platform |
| Grafana | Dashboards and alerting |
| Node Exporter | VPS infrastructure metrics |
| Ansible | Infrastructure as Code — VPS provisioning playbooks |
| Helm | Kubernetes deployment packaging — one chart per service |
| HPA | Horizontal Pod Autoscaling for high-traffic services |
| GitHub Container Registry | Docker image storage |

### Estimated RAM Usage (8GB VPS)

| Category | Components | RAM |
|---|---|---|
| K8s System | K3s, CoreDNS, kube-proxy | ~350MB |
| Ingress + Gateway | Traefik, Kong | ~528MB |
| Cache + Queue | Redis, RabbitMQ | ~768MB |
| Databases | PostgreSQL, MongoDB, Qdrant, MinIO | ~1,792MB |
| DevOps | Jenkins, Prometheus, Grafana, Node Exporter | ~1,312MB |
| FastAPI Services | RAG, KB, Translation, Embedding (with model) | ~660MB |
| Django Services | User, Lawyer, Document, Payment, Notif, Admin, Scraper | ~1,200MB |
| Workers (permanent) | Doc, Notification, Lawyer Ingest | ~310MB |
| Frontend | Next.js static via nginx | ~50MB |
| **Total** | | **~6,970MB** |
| **Headroom** | | **~1,030MB** |

---

## 1.6 Technology Stack Summary

### Backend
| Technology | Version | Role |
|---|---|---|
| Python | 3.12 | Primary backend language |
| Django | 4.2 | Business services framework |
| Django REST Framework | 3.14 | REST API layer for Django services |
| Django Admin | Built-in | Admin Panel UI |
| FastAPI | 0.110 | AI services framework |
| Pydantic | v2 | Data validation (FastAPI services) |
| SQLAlchemy | 2.0 | ORM for FastAPI services |
| sentence-transformers | Latest | multilingual-e5-small embedding model |
| LangChain | Latest | RAG pipeline orchestration |
| WeasyPrint | Latest | HTML-to-PDF generation in Doc Worker |
| Jinja2 | 3.x | Document template rendering |
| BeautifulSoup4 | Latest | HTML parsing in Scraper Service |
| pika | Latest | RabbitMQ client for workers |
| pytest | Latest | Testing framework |
| pytest-django | Latest | Django test integration |
| coverage.py | Latest | Code coverage reporting |

### Frontend
| Technology | Version | Role |
|---|---|---|
| Next.js | 14 (App Router) | React framework for PWA |
| Tailwind CSS | 3.x | Styling |
| next-i18next | Latest | French/English internationalisation |
| EventSource API | Native | SSE streaming for AI chat |

### Infrastructure
| Technology | Role |
|---|---|
| Docker | Containerisation |
| K3s | Lightweight Kubernetes on single VPS |
| Helm | Kubernetes package management |
| Traefik | Ingress controller and TLS |
| Kong OSS | API Gateway |
| Jenkins | CI/CD pipeline |
| Ansible | Infrastructure as Code |
| Prometheus + Grafana | Monitoring and alerting |
| UFW | Firewall on Contabo VPS |

### Databases and Storage
| Technology | Role |
|---|---|
| PostgreSQL 15 | Relational data (7 logical databases in 1 pod) |
| MongoDB 7 | Conversation history (RAG Service) |
| Qdrant | Vector database for law embeddings |
| MinIO | S3-compatible PDF document storage |
| Redis 7 | Caching and session management |

### External APIs
| API | Purpose |
|---|---|
| Groq API (Llama 3.3 70B / Llama 3.1 8B) | LLM inference and translation — free tier |
| Campay API | MTN and Orange Mobile Money payments |
| Gmail SMTP | Transactional email delivery |

---

## 1.7 Development and Deployment Workflow

### Development Environment
Both developers work locally on their own laptops using VS Code and Docker Desktop.

**Local stack:**
- All databases run via `docker-compose.dev.yml` on each laptop (PostgreSQL, MongoDB, Qdrant, Redis, RabbitMQ, MinIO)
- Each service runs as a plain Python process with hot-reload (`uvicorn --reload` for FastAPI, `manage.py runserver` for Django)
- Services are tested at `http://localhost:PORT/api/v1/docs/`
- RAM required locally for docker-compose databases: approximately 1.2GB

**Git workflow:**
- One feature branch per service per developer
- Commits made frequently throughout the day
- Pull Request opened when service is complete
- Other developer reviews and approves
- Merge to `main` triggers Jenkins pipeline on VPS

### CI/CD Pipeline (Jenkins on VPS)
On every merge to `main`:
1. Pull latest code
2. Run `pytest` with coverage for changed service
3. Fail build if coverage < 80%
4. Build Docker image
5. Push to GitHub Container Registry
6. `helm upgrade --install` to K3s
7. `kubectl rollout status` health check

### Deployment
All services run on a **Contabo Cloud VPS 10** (4 vCPU, 8GB RAM, 75GB NVMe) running K3s. Each service is packaged as a Docker container, deployed via a Helm chart, and managed by Kubernetes. All databases run as StatefulSets with persistent volumes.

---

## 1.8 Objectives

**Primary Objective:**
To build a fully functional, production-grade legal aid platform for Cameroon that demonstrates the practical application of AI, microservices architecture, event-driven design, and modern DevOps practices.

**Specific Objectives:**
1. Provide accurate, cited Cameroonian legal information using RAG (Qdrant + Groq LLM)
2. Enable appointment booking between citizens and verified lawyers
3. Implement end-to-end document generation with Mobile Money payment integration
4. Build a bilingual Law Explorer with dual semantic and keyword search
5. Seed a real lawyer directory via web scraping with admin-controlled verification
6. Demonstrate full DevOps maturity: CI/CD, monitoring, IaC, containerisation, orchestration
7. Achieve 80%+ test coverage across all services

---

## 1.9 Project Scope (MVP)

### In Scope
- User authentication and profiles (JWT, OTP email verification, password reset)
- AI Legal Assistant with RAG pipeline (Qdrant + Groq, bilingual, streamed SSE responses)
- Lawyer self-registration with document submission and admin verification
- Appointment booking system with lawyer dashboard
- Web-scraped lawyer listing from public Cameroonian sources
- AI-powered lawyer recommendations based on legal domain and city
- Document generation — premium only, payment via Campay Mobile Money
- Law Explorer with dual vector and keyword search
- Notification system — all events handled via RabbitMQ
- Admin Panel — internal only, Django Admin
- Web scraper — admin-triggered, stateless
- Full bilingual interface (French and English)
- Jenkins CI/CD pipeline
- Prometheus + Grafana monitoring
- Ansible Infrastructure as Code
- Kubernetes deployment with Helm and HPA

### Out of Scope (for this version)
- Voice input
- In-app messaging between users and lawyers
- Lawyer rating and review system
- USSD or SMS fallback interface
- Video consultation booking
- Mobile native applications (iOS/Android)

---

## 1.10 Success Criteria

| Criterion | Target |
|---|---|
| AI Legal Assistant | Returns relevant, cited legal responses in French and English with less than 5 seconds to first token |
| Lawyer Directory | At least 20–30 seeded scraped lawyers + at least 1 fully verified registered lawyer with bookable appointments |
| Appointment Booking | Full flow: user books → lawyer confirms → both receive email notification |
| Document Generation | Full flow: user fills form → Mobile Money payment → PDF generated → email with download link |
| Law Explorer | Returns relevant results for French and English queries across at least 3 law domains |
| Test Coverage | Minimum 80% code coverage across all 11 services |
| CI/CD Pipeline | Automatic build, test, and deploy on every merge to main |
| Monitoring | Grafana dashboards showing service health, request rates, and infrastructure metrics |
| Bilingual UI | All pages functional in both French and English with language toggle |
| Deployment | All services running on K3s with zero manual intervention after `git push` |

---

*Document version: 2.0 — Updated*
*Date: 2026-05-10*
*LexCam — ICT University SEN3244 Software Architecture — Spring 2026*
*Team: 2 members | VPS: Contabo Cloud VPS 10 | Architecture: Microservices + Event-Driven Hybrid*
