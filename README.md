# LexCam — AI-Powered Legal Aid Platform for Cameroon

> SEN3244 Software Architecture | Spring 2026 | ICT University
> Team: 2 members | VPS: Contabo Cloud VPS 10 (4 vCPU, 8GB RAM) | Orchestration: K3s

LexCam is a bilingual (French/English) Progressive Web App that gives Cameroonian citizens access to legal information, verified lawyer referrals, and formally generated legal documents — all powered by a RAG AI pipeline and deployed on Kubernetes.

---

## Architecture

LexCam uses a **Microservices + Event-Driven Hybrid** architecture.

```
Browser (Next.js PWA)
    │
    ▼
UFW Firewall (Contabo VPS)
    │
    ▼
Traefik Ingress Controller (K3s built-in) — TLS termination
    │
    ▼
Kong API Gateway — routing, rate limiting, auth middleware
    │
    ▼
Microservices Layer (11 services)
    │
    ├── User Management (8001)      ─ auth, JWT, OTP, profiles
    ├── Lawyer Service (8002)       ─ directory, referrals, verification
    ├── Knowledge Base (8003)       ─ law storage, vector + keyword search
    ├── RAG Service (8004)          ─ AI Legal Assistant, SSE streaming
    ├── Embedding Service (8005)    ─ multilingual-e5-small, 384-dim vectors
    ├── Document Service (8006)     ─ PDF generation, pay-first policy
    ├── Payment Service (8007)      ─ Campay Mobile Money integration
    ├── Notification Service (8008) ─ SMTP email dispatch
    ├── Feedback Service (8009)     ─ AI response ratings, auto-flagging
    ├── Admin Panel (8010)          ─ internal Django Admin
    └── Scraper Service (8011)      ─ lawyer directory crawler

Event Bus: RabbitMQ (topic exchange lexcam.events + DLX)
Workers:   Doc Worker | Notification Worker | Lawyer Ingest | Indexing Worker
Databases: PostgreSQL (10 schemas) | Qdrant | MinIO | Redis
```

---

## Features

| Feature | Description |
|---|---|
| **AI Legal Assistant** | RAG pipeline — Qdrant retrieval + Groq Llama 3.3 70B, SSE token streaming, bilingual |
| **Law Explorer** | Dual search (Qdrant vector + PostgreSQL tsvector), Reciprocal Rank Fusion, plain-language summaries |
| **Lawyer Directory** | Self-registered verified lawyers + scraped listings; city + specialization filters |
| **Referral System** | Citizen → lawyer referral with contact reveal on acceptance |
| **Document Generator** | Pay-first PDF generation (WeasyPrint), Campay MTN/Orange Mobile Money |
| **Admin Panel** | Lawyer verification, scraper trigger, flagged AI review, audit log |
| **Notifications** | Event-driven email for all workflow events |
| **Feedback Loop** | Per-response ratings, auto-flag at 3× not_helpful, admin review |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, Tailwind CSS, PWA |
| AI Framework | FastAPI + LangChain + Groq (Llama 3.3 70B / 3.1 8B) |
| Embedding | intfloat/multilingual-e5-small (384-dim, French + English) |
| Business Services | Django 4.2 + Django REST Framework |
| Databases | PostgreSQL 15, Qdrant, MinIO, Redis 7 |
| Message Bus | RabbitMQ 3 (topic exchange + DLX) |
| Orchestration | K3s (lightweight Kubernetes) |
| Ingress | Traefik (K3s built-in) + Kong API Gateway |
| CI/CD | Jenkins (7-stage pipeline, GHCR image push) |
| Monitoring | Prometheus + Grafana + Node Exporter |
| IaC | Ansible (VPS provisioning + K3s deployment) |
| Packaging | Helm Charts (one per service) |
| Payment | Campay API (MTN Mobile Money + Orange Money) |
| Email | Gmail SMTP |

---

## Repository Structure

```
lexcam/
├── services/               # 11 backend microservices
│   ├── user-management/    # Django — auth, JWT, OTP
│   ├── lawyer-service/     # Django — directory, referrals
│   ├── knowledge-base-service/ # FastAPI — law storage, dual search
│   ├── rag-service/        # FastAPI — AI pipeline, SSE streaming
│   ├── embedding-service/  # FastAPI — multilingual-e5-small
│   ├── document-service/   # Django — PDF generation
│   ├── payment-service/    # Django — Campay integration
│   ├── notification-service/ # Django — SMTP email
│   ├── feedback-service/   # Django — ratings, flagging
│   ├── admin-panel/        # Django Admin — internal
│   └── scraper-service/    # Django — lawyer crawler
├── workers/                # 4 background worker pods
│   ├── doc-worker/         # payment.confirmed → WeasyPrint PDF
│   ├── notification-worker/# events → SMTP email
│   ├── lawyer-ingest-worker/ # lawyers.scraped → bulk insert
│   └── indexing-worker/    # corpus.updated → Qdrant upsert
├── frontend/               # Next.js 14 PWA
├── infrastructure/
│   ├── helm/               # Helm charts (one per service)
│   ├── k8s/                # Raw K8s manifests (databases, monitoring)
│   └── ansible/            # VPS provisioning playbooks
├── Jenkinsfile             # 7-stage CI/CD pipeline
├── docker-compose.dev.yml  # Local development stack
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Docker Desktop
- Node.js 20+
- Python 3.12+

### 1. Start infrastructure services
```bash
docker-compose -f docker-compose.dev.yml up -d
```
This starts: PostgreSQL, Qdrant, Redis, RabbitMQ, MinIO.

### 2. Run a backend service
```bash
cd services/user-management
pip install -r requirements.txt
cp .env.example .env      # fill in values
python manage.py migrate
python manage.py runserver 0.0.0.0:8001
```
Swagger UI available at: `http://localhost:8001/api/v1/docs/`

### 3. Run the frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend at: `http://localhost:3000`

---

## API Documentation

Each service exposes Swagger UI at `/api/v1/docs/`:

| Service | Local URL |
|---|---|
| User Management | http://localhost:8001/api/v1/docs/ |
| Lawyer Service | http://localhost:8002/api/v1/docs/ |
| Knowledge Base | http://localhost:8003/docs |
| RAG Service | http://localhost:8004/docs |
| Embedding Service | http://localhost:8005/docs |
| Document Service | http://localhost:8006/api/v1/docs/ |
| Payment Service | http://localhost:8007/api/v1/docs/ |
| Notification Service | http://localhost:8008/api/v1/docs/ |
| Feedback Service | http://localhost:8009/api/v1/docs/ |
| Admin Panel | http://localhost:8010/api/v1/docs/ |
| Scraper Service | http://localhost:8011/api/v1/docs/ |

---

## Running Tests

```bash
# Django services — run from each service directory
pytest --cov=apps --cov-report=html --cov-fail-under=80

# FastAPI services — run from each service directory
pytest --cov=app --cov-report=html --cov-fail-under=80
```

All services target ≥ 80% code coverage. The Jenkins pipeline fails the build if any service falls below this threshold.

---

## Production Deployment (K3s on Contabo VPS)

### 1. Provision the VPS
```bash
cd infrastructure/ansible
# Edit inventory/hosts.ini — set your VPS IP
ansible-playbook -i inventory/hosts.ini playbooks/provision-vps.yml
ansible-playbook -i inventory/hosts.ini playbooks/deploy-k3s.yml
```

### 2. Apply K8s manifests (databases + monitoring)
```bash
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/databases/
kubectl apply -f infrastructure/k8s/monitoring/
kubectl apply -f infrastructure/k8s/gateway/
```

### 3. Deploy services via Helm
```bash
for chart in infrastructure/helm/*/; do
  name=$(basename $chart)
  helm upgrade --install $name $chart --namespace lexcam
done
```

### 4. Verify all pods are running
```bash
kubectl get pods -n lexcam
```

---

## CI/CD Pipeline (Jenkins)

On every push to `main`, the Jenkinsfile runs 7 stages:

| Stage | Action |
|---|---|
| 1. Checkout | Pull latest code |
| 2. Test | `pytest` for all 11 services in parallel |
| 3. Coverage | Fail build if any service < 80% coverage |
| 4. Build | `docker build` all service images |
| 5. Push | Push tagged images to GitHub Container Registry |
| 6. Deploy | `helm upgrade --install` for all services |
| 7. Health Check | `kubectl rollout status` for all deployments |

---

## Monitoring

- **Prometheus** scrapes all pods via `prometheus.io/scrape: "true"` pod annotations
- **Grafana** dashboards: Infrastructure, Service Health, Business Metrics
- **Node Exporter** tracks VPS CPU, RAM, disk, and network
- Access Grafana: `http://VPS_IP:3001` (admin / lexcam_dev in dev)

---

## Project Context

| Field | Detail |
|---|---|
| Course | SEN3244 Software Architecture |
| Institution | ICT University |
| Instructor | Engr. TEKOH PALMA |
| Semester | Spring 2026 |
| Team Size | 2 developers |
| VPS | Contabo Cloud VPS 10 — 4 vCPU, 8GB RAM, 75GB NVMe |

---

*LexCam — Making Cameroonian law accessible to every citizen.*
