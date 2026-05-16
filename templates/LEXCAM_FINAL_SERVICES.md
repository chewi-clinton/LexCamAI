# LEXCAM — FINAL RECONCILED SERVICE LIST
## Version 3.0 | 2026-05-10

---

## Decisions Applied

| Decision | Resolution |
|---|---|
| Embedding Service | Restored as standalone FastAPI pod — loads `intfloat/multilingual-e5-small` once (380MB), serves RAG Service, KB Service, and Indexing Worker |
| Translation | No separate Translation Service. RAG Service calls Groq inline to translate any retrieved chunks that are in a different language than the user's query before building the prompt. Fallback only — multilingual embeddings handle same-language retrieval natively |
| Document watermark | Pay-first. No document generated without payment. One clean PDF tier only |
| Feedback Service | Shrunk to a table — lightweight feature, not a standalone service description |
| `matching.requested` consumer | Lawyer Service consumes it to pre-load city-based recommendations |
| MongoDB | Removed. RAG sessions stored in PostgreSQL schema `rag_sessions` using JSONB for message arrays |
| BFF | Removed. Frontend calls services directly via Kong |
| gRPC | Removed. All synchronous calls are HTTP/REST |
| WhatsApp | Removed. Email SMTP only |

---

## 1. User Management Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL schema `users` + Redis (OTP cache)

Handles registration, OTP email verification, JWT issuance and refresh, password reset, and citizen profile management (preferred language, city, jurisdiction). Stores consent logs on registration and handles data anonymisation on account deletion. Every other service validates identity by calling this service's internal `/validate-token` endpoint.

**Publishes:** `user.registered`, `user.deleted`

---

## 2. Lawyer Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL schema `lawyers`

Manages the complete lawyer directory — both self-registered profiles and web-scraped listings. Self-registered lawyers submit verification documents for admin review and go through a verification workflow (`pending → verified → rejected → suspended`). Verified lawyers appear in public listings and can receive referrals. Web-scraped lawyers appear as read-only contact listings with no referral capability.

Manages the referral lifecycle: citizen selects a lawyer → `referral.created` event fires → lawyer is notified → lawyer accepts or declines → on acceptance, encrypted contact details are revealed to both parties → `referral.accepted` fires. No in-app messaging — all further communication happens outside the platform.

Supports city-based matching and availability toggling (accepting cases / at capacity). Consumes `matching.requested` to pre-load city and domain-filtered recommendations for the RAG response.

**Publishes:** `lawyer.verified`, `referral.created`, `referral.accepted`, `referral.resolved`
**Consumes:** `matching.requested`

---

## 3. Knowledge Base Service

**Framework:** FastAPI
**Database:** PostgreSQL schema `knowledge` + Qdrant (vector store, populated by Indexing Worker)

Stores bilingual (French/English) Cameroonian legal texts and plain-language summaries, chunked and embedded for vector search. All content is lawyer-verified in both languages — no machine translation is applied to stored content. Each chunk carries a `language` tag (`fr` or `en`).

Serves two functions:
- **RAG retrieval:** Internal `/retrieve` endpoint accepts a query vector from the RAG Service and returns the top-k most relevant law chunks with their language tag
- **Law Explorer:** Public search endpoint supporting both vector similarity and PostgreSQL full-text search (tsvector), merged via Reciprocal Rank Fusion

When legal content is updated, publishes `corpus.updated` to trigger the Indexing Worker.

**Publishes:** `corpus.updated`

---

## 4. RAG Service (AI Legal Assistant)

**Framework:** FastAPI
**Database:** PostgreSQL schema `rag_sessions` (JSONB message arrays) + Redis (response cache)

The core AI pipeline. Receives a legal question in French or English, runs the full retrieval-augmented generation flow, and streams the answer token-by-token via SSE.

**Pipeline (in order):**
1. Detect user language via `langdetect`
2. Embed query — call Embedding Service → 384-dim vector
3. Retrieve top-5 law chunks — call Knowledge Base `/retrieve` with the vector
4. **Translation fallback:** if any retrieved chunk is tagged in a different language than the user's query, call Groq (Llama 3.1 8B) inline to translate that chunk only. This handles edge cases where a law only exists in one language. Primary path (same-language chunks) requires no translation call
5. Load last 6 conversation turns from PostgreSQL `rag_sessions`
6. Extract legal entities (parties, amounts, dates) and classify legal intent (labor, housing, family, criminal, commercial) — internal functions, no external service
7. Construct citation-grounded prompt
8. Call external LLM through abstraction layer (default: Groq Llama 3.3 70B)
9. Stream response via SSE
10. Save session turn to PostgreSQL
11. Emit `matching.requested` with detected domain and user city so Lawyer Service prepares recommendations

**LLM Abstraction Layer:** A thin internal module with a standard `generate(prompt, stream)` interface. Current implementation calls Groq. Can be swapped to a self-hosted fine-tuned model by changing one config value — no changes to retrieval logic, prompt construction, or streaming.

**Publishes:** `matching.requested`, `document.requested`

---

## 5. Embedding Service

**Framework:** FastAPI
**Database:** None (stateless — model loaded in memory at startup)

Loads `intfloat/multilingual-e5-small` once at pod startup (~380MB RAM). Serves embedding requests to the RAG Service (query embedding), Knowledge Base Service (query embedding for Law Explorer), and Indexing Worker (chunk embedding during ingestion). Loading the model here once eliminates duplicate model loading across pods and saves approximately 380–760MB RAM compared to embedding in each consumer.

**Endpoints:**
- `POST /embed` — accepts `{ texts: [...] }`, returns `{ embeddings: [[384 floats], ...] }`
- `GET /health` — returns model status and dimension count

---

## 6. Document Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL schema `documents` + MinIO (PDF storage)

Generates formal legal documents from Jinja2 templates rendered to PDF via WeasyPrint. Available templates: Mise en Demeure (Salaire/Logement), Lettre de Réclamation, Dénonciation de Congé, Déclaration de Faits.

**Policy: pay-first, no watermark.** No document is generated without a confirmed payment. When a user selects a template and fills in their details, a document request is created with status `awaiting_payment`. The Doc Worker only runs after `payment.confirmed` is received. The generated PDF is clean — no watermark, no free tier. Users receive the download link via email.

**Consumes:** `payment.confirmed` (via Doc Worker)

---

## 7. Payment Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL schema `payments`

Integrates with Campay API to process Mobile Money payments via MTN and Orange. Handles payment initiation (calls Campay `/collect`, returns payment URL), receives webhook callbacks from Campay confirming payment status, validates webhook signatures, stores transaction records, and publishes `payment.confirmed` so downstream services react without polling.

**Publishes:** `payment.confirmed`

---

## 8. Notification Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL schema `notifications`

Sends all outbound communications via email through an external SMTP provider. Uses HTML templates per notification type. Stores delivery logs with status and error messages.

**Consumes (via Notification Worker):**

| Event | Email Sent To | Content |
|---|---|---|
| `user.registered` | New user | Welcome email |
| `lawyer.verified` | Lawyer | Verification approval/rejection |
| `referral.accepted` | Citizen | Lawyer accepted — contact revealed |
| `payment.confirmed` | User | Payment receipt + amount |
| `document.ready` | User | Download link for PDF |

---

## 9. Feedback Service

**Shrunk to table — implemented as a lightweight Django app, not a standalone service description.**

| Aspect | Detail |
|---|---|
| **Framework** | Django 4.2 + DRF |
| **Database** | PostgreSQL schema `feedback` |
| **Input** | User submits rating (helpful / not helpful) + optional text comment after each AI response |
| **Traceability** | Each feedback record linked to `session_id` and `message_index` in `rag_sessions` |
| **Flag threshold** | Responses rated "not helpful" by ≥ 3 users are auto-flagged and enter admin review queue |
| **Admin action** | Admin reviews flagged response, marks knowledge base content for correction, triggers `corpus.updated` |
| **Future use** | Corrected response pairs feed into fine-tuning dataset for self-hosted model |
| **Publishes** | `feedback.flagged` |
| **Consumed by** | Admin Panel (review queue) |

---

## 10. Web Scraper Service

**Framework:** Django 4.2 + DRF
**Database:** PostgreSQL schema `scraping` (source config + run logs) + MinIO (raw HTML archive)

Crawls public Cameroonian legal directories (Barreau du Cameroun, avocat.cm) to seed and update the lawyer database. Scraper sources, selectors, and run frequency are configured from the Admin Panel. Raw HTML pages are archived in MinIO for debugging. Parsed and deduplicated lawyer profiles are published in batches as `lawyers.scraped` events for the Lawyer Ingest Worker to consume and persist. All scraped profiles are stored as `type=scraped` and carry no booking capability.

**Consumes:** `scrape.requested`
**Publishes:** `lawyers.scraped`

---

## 11. Admin Panel Service

**Framework:** Django 4.2 + Django Admin
**Database:** PostgreSQL schema `admin` (audit logs, platform stats)
**Access:** Internal Kubernetes route only — not exposed via public domain

Internal dashboard for the LexCam team. Exposes Django Admin for lawyer verification (approve, reject, suspend), document template management, scraper configuration and manual triggering, flagged AI response review queue (from Feedback Service), and platform statistics. All admin actions are written to an audit log.

**Publishes:** `scrape.requested`

---

## Worker Processes (Background Pods)

| Worker | Type | Consumes | Action | Publishes |
|---|---|---|---|---|
| **Doc Worker** | K8s Deployment | `payment.confirmed` | Renders Jinja2 template → WeasyPrint PDF → uploads to MinIO → marks document ready | `document.ready` |
| **Notification Worker** | K8s Deployment | `user.registered`, `lawyer.verified`, `referral.accepted`, `payment.confirmed`, `document.ready` | Dispatches templated email via SMTP | None |
| **Lawyer Ingest Worker** | K8s Deployment | `lawyers.scraped` | Validates, deduplicates, writes profiles to Lawyer Service via internal HTTP API | None |
| **Indexing Worker** | K8s Deployment | `corpus.updated` | Calls Embedding Service for new/updated chunks → upserts vectors into Qdrant → updates PostgreSQL article metadata | None |

---

## Complete RabbitMQ Event Map

| Event | Published By | Consumed By |
|---|---|---|
| `user.registered` | User Management | Notification Worker |
| `user.deleted` | User Management | (logged, future cleanup) |
| `lawyer.verified` | Lawyer Service | Notification Worker |
| `referral.created` | Lawyer Service | Notification Worker |
| `referral.accepted` | Lawyer Service | Notification Worker |
| `referral.resolved` | Lawyer Service | (audit log) |
| `matching.requested` | RAG Service | Lawyer Service |
| `document.requested` | RAG Service | (future document pre-fill) |
| `payment.confirmed` | Payment Service | Doc Worker, Notification Worker |
| `document.ready` | Doc Worker | Notification Worker |
| `corpus.updated` | Knowledge Base | Indexing Worker |
| `lawyers.scraped` | Scraper Service | Lawyer Ingest Worker |
| `scrape.requested` | Admin Panel | Scraper Service |
| `feedback.flagged` | Feedback Service | Admin Panel |

---

## Communication Patterns

| Pattern | Used For |
|---|---|
| **HTTP/REST** | All synchronous calls — PWA frontend → services via Kong, service-to-service internal calls |
| **SSE (Server-Sent Events)** | RAG Service → client (token-by-token AI response streaming) |
| **RabbitMQ Events** | All asynchronous workflows — decoupled, resilient, DLX for failed messages |

No gRPC. No BFF. No WebSockets.

---

## Data Stores Summary

| Store | Used By | Purpose |
|---|---|---|
| PostgreSQL (10 individual StatefulSet pods) | All services | One dedicated database pod per service — true microservice isolation. Enabled by 11GB VPS RAM. Service names follow the pattern `postgres-{service}-svc:5432`. |
| Qdrant | Knowledge Base (read), Indexing Worker (write) | 384-dim vectors for law chunk retrieval |
| Redis | User Management (OTP TTL), RAG Service (response cache) | Ephemeral high-speed data |
| MinIO | Document Service (PDFs), Scraper Service (raw HTML) | Unstructured file storage |
| RabbitMQ | All services | Asynchronous event bus with DLX |

**No MongoDB.** RAG session history stored in PostgreSQL `rag_sessions` as JSONB arrays.

---

## Final Service Count

| Category | Count |
|---|---|
| Core services | 11 (User, Lawyer, KB, RAG, Embedding, Document, Payment, Notification, Feedback, Scraper, Admin) |
| Background workers | 4 (Doc, Notification, Lawyer Ingest, Indexing) |
| Frontend | 1 (Next.js 14 PWA) |
| **Total deployable components** | **16** |

---

*Version 3.0 — Final | 2026-05-10*
*LexCam — SEN3244 Software Architecture — Spring 2026*
