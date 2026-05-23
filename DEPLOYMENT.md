# LexCamAI — Deployment Reference

> **Project:** SEN3244 Software Architecture — AI Legal Aid Platform for Cameroon  
> **Stack:** K3s · Helm · Jenkins · Kong · Prometheus · Grafana  
> **Server:** Contabo VPS — 4 vCPU, 8 GB RAM, Ubuntu (K3s single-node cluster)  
> **Docker Hub:** `chewiclinton/<image>:latest`  
> **Kubernetes namespace:** `lexcam`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Traffic Flow](#2-traffic-flow)
3. [Services & Ports](#3-services--ports)
4. [Infrastructure (Databases, Queues, Storage)](#4-infrastructure-databases-queues-storage)
5. [Helm Charts](#5-helm-charts)
6. [HPA — Horizontal Pod Autoscaler](#6-hpa--horizontal-pod-autoscaler)
7. [Rolling Updates](#7-rolling-updates)
8. [Kong API Gateway](#8-kong-api-gateway)
9. [Observability — Prometheus & Grafana](#9-observability--prometheus--grafana)
10. [Jenkins CI/CD Pipeline](#10-jenkins-cicd-pipeline)
11. [Known Manual Server Steps](#11-known-manual-server-steps)
12. [Adding a Domain Name (Next Step)](#12-adding-a-domain-name-next-step)
13. [Useful kubectl Commands](#13-useful-kubectl-commands)
14. [Commit History Summary](#14-commit-history-summary)

---

## 1. Architecture Overview

```
Browser
  │
  ▼
Traefik (K3s built-in ingress, port 80/443)
  │  path: /  →  kong-proxy-svc:80
  ▼
Kong API Gateway (2 replicas, DB-less, declarative config)
  │
  ├── /api/v1/auth, /api/v1/users      → user-management-svc:8001
  ├── /api/v1/lawyers                  → lawyer-service-svc:8002
  ├── /api/v1/knowledge                → knowledge-base-service-svc:8003
  ├── /api/v1/rag                      → rag-service-svc:8004
  ├── /api/v1/documents                → document-service-svc:8006
  ├── /api/v1/payments                 → payment-service-svc:8007
  ├── /api/v1/notifications            → notification-service-svc:8008
  ├── /api/v1/feedback                 → feedback-service-svc:8009
  ├── /admin                           → admin-panel-svc:8010
  ├── /api/v1/scraper                  → scraper-service-svc:8011
  ├── /api/v1/embed                    → embedding-service:8000  ← NO -svc suffix
  ├── /grafana                         → grafana-svc:3000  (Grafana dashboard — own login)
  ├── /prometheus                      → prometheus-svc:9090  (basic-auth: admin/lexcam_dev)
  └── /  (catch-all)                   → frontend-svc:3000
```

**Key quirk:** The `embedding-service` K8s Service is named `embedding-service` (no `-svc` suffix) because it uses the Helm `fullname` template. Its port is `8000`. All other services follow `<name>-svc:<port>`.

---

## 2. Traffic Flow

### User visits the app
```
Browser → VPS IP:80 → Traefik → Kong → frontend-svc:3000
```

### API call from frontend (SSR or client)
```
Browser → Kong → /api/v1/... → target service
Frontend server-side rewrites also go through Kong (all env vars point to kong-proxy-svc:80)
```

### Chat / RAG query
```
User → Kong → rag-service:8004
  → knowledge-base-service:8003  (POST /api/v1/search)
    → embedding-service:8000     (POST /api/v1/embed)  — embeds query
    → Qdrant:6333                — vector similarity search
  → Groq LLM API                 — generates answer
  → SSE stream back to browser
```

### Document processing (async)
```
User uploads doc → document-service → publishes to RabbitMQ
  → doc-worker consumes → processes → stores in MinIO + notifies
```

### Lawyer ingestion (async)
```
lawyer-ingest-worker (RabbitMQ consumer) → lawyer-service-svc:8002
indexing-worker (RabbitMQ consumer) → knowledge-base-service-svc:8003 + embedding-service:8000
```

---

## 3. Services & Ports

### Application Services (Helm-managed)

| Service | K8s Service Name | Port | Type | Runtime |
|---------|-----------------|------|------|---------|
| user-management | `user-management-svc` | 8001 | Django + gunicorn | Auth, users |
| lawyer-service | `lawyer-service-svc` | 8002 | Django + gunicorn | Lawyer profiles |
| knowledge-base-service | `knowledge-base-service-svc` | 8003 | FastAPI + uvicorn | Qdrant + embeddings |
| rag-service | `rag-service-svc` | 8004 | FastAPI + uvicorn | LLM chat, SSE |
| document-service | `document-service-svc` | 8006 | Django + gunicorn | Doc templates |
| payment-service | `payment-service-svc` | 8007 | Django + gunicorn | Payments |
| notification-service | `notification-service-svc` | 8008 | FastAPI + uvicorn | Notifications |
| feedback-service | `feedback-service-svc` | 8009 | FastAPI + uvicorn | Feedback |
| admin-panel | `admin-panel-svc` | 8010 | Django + gunicorn | Admin |
| scraper-service | `scraper-service-svc` | 8011 | FastAPI + uvicorn | Web scraping |
| **embedding-service** | **`embedding-service`** | **8000** | FastAPI + uvicorn | ONNX embeddings |
| frontend | `frontend-svc` | 3000 | Next.js standalone | UI |

### Workers (no HTTP service — RabbitMQ consumers only)

| Worker | Image |
|--------|-------|
| doc-worker | `chewiclinton/doc-worker` |
| notification-worker | `chewiclinton/notification-worker` |
| indexing-worker | `chewiclinton/indexing-worker` |
| lawyer-ingest-worker | `chewiclinton/lawyer-ingest-worker` |

### Kong

| Service | Name | Port |
|---------|------|------|
| Kong proxy (internal) | `kong-proxy-svc` | 80 → 8000 |
| Kong admin (internal) | `kong-admin-svc` | 8001 |

---

## 4. Infrastructure (Databases, Queues, Storage)

All deployed via `kubectl apply -f infrastructure/k8s/databases/` as StatefulSets.

### PostgreSQL (10 instances — one per service)

| StatefulSet | Service | Database |
|-------------|---------|----------|
| postgres-users | `postgres-users-svc:5432` | lexcam_users |
| postgres-lawyers | `postgres-lawyers-svc:5432` | lexcam_lawyers |
| postgres-documents | `postgres-documents-svc:5432` | lexcam_documents |
| postgres-payments | `postgres-payments-svc:5432` | lexcam_payments |
| postgres-rag | `postgres-rag-svc:5432` | lexcam_rag_sessions |
| postgres-knowledge | `postgres-knowledge-svc:5432` | lexcam_knowledge |
| postgres-notif | `postgres-notif-svc:5432` | lexcam_notif |
| postgres-feedback | `postgres-feedback-svc:5432` | lexcam_feedback |
| postgres-admin | `postgres-admin-svc:5432` | lexcam_admin |
| postgres-scraping | `postgres-scraping-svc:5432` | lexcam_scraping |

**Credentials (all instances):** user=`lexcam` password=`lexcam_dev`

### Other Infrastructure

| Component | Service | Port | Purpose |
|-----------|---------|------|---------|
| Redis | `redis-svc` | 6379 | Session cache, rate limiting |
| RabbitMQ | `rabbitmq-svc` | 5672 (AMQP), 15672 (UI) | Async message queue |
| Qdrant | `qdrant-svc` | 6333 | Vector database for embeddings |
| MinIO | `minio-svc` | 9000 (API), 9001 (UI) | Object storage for documents |

**RabbitMQ credentials:** user=`lexcam` password=`lexcam_dev` vhost=`/`  
**MinIO credentials:** access=`minioadmin` secret=`minioadmin`

---

## 5. Helm Charts

All charts live under `infrastructure/helm/<name>/`.

### Chart structure (each service)
```
infrastructure/helm/<service>/
  Chart.yaml
  values.yaml          ← image, ports, resources, config, secrets, hpa
  templates/
    deployment.yaml    ← RollingUpdate strategy, readiness/liveness probes
    service.yaml       ← ClusterIP
    configmap.yaml     ← env vars (non-sensitive)
    secret.yaml        ← env vars (sensitive: DATABASE_URL, API keys)
    hpa.yaml           ← HorizontalPodAutoscaler
    _helpers.tpl
```

### How Helm deploys in CI (Stage 8)
```bash
helm upgrade --install <release> infrastructure/helm/<chart> \
  --namespace lexcam \
  --create-namespace \
  --set image.tag=<git-commit-sha> \
  --cleanup-on-fail \
  --wait --timeout 300s
```

### Key values per service (inter-service URLs)
All inter-service URLs are configured in `values.yaml` under `config:`. The resolved values are:

```yaml
# rag-service values.yaml
EMBEDDING_SERVICE_URL:  http://embedding-service:8000      # ← no -svc suffix!
KNOWLEDGE_BASE_URL:     http://knowledge-base-service-svc:8003
USER_MANAGEMENT_URL:    http://user-management-svc:8001
LAWYER_SERVICE_URL:     http://lawyer-service-svc:8002

# knowledge-base-service values.yaml
EMBEDDING_SERVICE_URL:  http://embedding-service:8000      # ← no -svc suffix!

# indexing-worker values.yaml
KB_SERVICE_URL:         http://knowledge-base-service-svc:8003
EMBEDDING_SERVICE_URL:  http://embedding-service:8000      # ← no -svc suffix!
```

---

## 6. HPA — Horizontal Pod Autoscaler

Metrics Server is installed in CI (Stage 7) with `--kubelet-insecure-tls` (required for K3s).

```bash
# Install command used in Jenkinsfile
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system \
  --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

### HPA settings per component

| Component | min | max | CPU trigger |
|-----------|-----|-----|-------------|
| user-management | 1 | 3 | 70% |
| lawyer-service | 1 | 3 | 70% |
| knowledge-base-service | 1 | 3 | 70% |
| rag-service | 1 | 3 | 70% |
| frontend | 1 | 3 | 70% |
| kong | 2 | 3 | 70% |
| document-service | 1 | 2 | 70% |
| payment-service | 1 | 2 | 70% |
| admin-panel | 1 | 2 | 70% |
| notification-service | 1 | 2 | 70% |
| feedback-service | 1 | 2 | 70% |
| scraper-service | 1 | 2 | 70% |
| embedding-service | 1 | 2 | 75% |
| doc-worker | 1 | 2 | 70% |
| notification-worker | 1 | 2 | 70% |
| indexing-worker | 1 | 2 | 70% |
| lawyer-ingest-worker | 1 | 2 | 70% |

Check HPA status:
```bash
kubectl get hpa -n lexcam
```

---

## 7. Rolling Updates

All 16 deployment templates (12 services + 4 workers) have an explicit rolling update strategy:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # bring up 1 new pod before terminating old
    maxUnavailable: 0  # never drop below desired replica count = zero downtime
```

This means on every `helm upgrade` (triggered by Jenkins on each push to `main`):
- A new pod is started first
- Old pod is only terminated after the new one passes the readiness probe
- Service stays fully available throughout the update

Trigger a manual rolling restart:
```bash
kubectl rollout restart deployment/<name> -n lexcam
kubectl rollout status deployment/<name> -n lexcam
```

---

## 8. Kong API Gateway

**Mode:** DB-less (declarative), config loaded from a ConfigMap.  
**Config file:** `infrastructure/k8s/gateway/kong.yaml`  
**Kong version:** `kong:3.6`  
**Replicas:** 2 (HPA min:2 max:3)

The declarative config is mounted at `/kong/declarative/kong.yml`.  
To update routes, edit the ConfigMap in `kong.yaml` and re-apply:
```bash
kubectl apply -f infrastructure/k8s/gateway/kong.yaml
kubectl rollout restart deployment/kong -n lexcam
```

### Route table (from kong.yaml)

| Path prefix | Upstream |
|-------------|----------|
| `/api/v1/auth` | user-management-svc:8001 |
| `/api/v1/users` | user-management-svc:8001 |
| `/api/v1/lawyers` | lawyer-service-svc:8002 |
| `/api/v1/knowledge` | knowledge-base-service-svc:8003 |
| `/api/v1/rag` | rag-service-svc:8004 |
| `/api/v1/documents` | document-service-svc:8006 |
| `/api/v1/payments` | payment-service-svc:8007 |
| `/api/v1/notifications` | notification-service-svc:8008 |
| `/api/v1/feedback` | feedback-service-svc:8009 |
| `/admin` | admin-panel-svc:8010 |
| `/api/v1/scraper` | scraper-service-svc:8011 |
| `/api/v1/embed` | embedding-service:8000 |
| `/` (catch-all, last) | frontend-svc:3000 |

**Traefik ingress** (`infrastructure/k8s/gateway/ingress.yaml`) sends all traffic to `kong-proxy-svc:80` — Traefik is just a passthrough. Kong handles all routing decisions.

---

## 9. Observability — Prometheus & Grafana

Deployed via `kubectl apply -f infrastructure/k8s/monitoring/`.  
Both services are **ClusterIP only** — accessed exclusively through Kong (single entry point, architecturally correct).

| Service | URL (through Kong) | Auth |
|---------|-------------------|------|
| Grafana | `http://62.169.23.197/grafana` | Grafana own login: admin / lexcam_dev |
| Prometheus | `http://62.169.23.197/prometheus` | Kong basic-auth: admin / lexcam_dev |

**Why through Kong?** Prometheus has no built-in authentication. Kong's basic-auth plugin protects it. Grafana protects itself with its own login page. Routing everything through Kong keeps a single entry point and a single security enforcement layer.

**When you add a domain name:** Update the `GF_SERVER_ROOT_URL` env var in `grafana.yaml` and the `--web.external-url` arg in `prometheus.yaml` to use your domain instead of the raw IP.

### Grafana subpath configuration (grafana.yaml)
```yaml
env:
  GF_SERVER_ROOT_URL: "http://62.169.23.197/grafana/"
  GF_SERVER_SERVE_FROM_SUB_PATH: "true"
  GF_SERVER_DOMAIN: "62.169.23.197"
```

### Prometheus subpath configuration (prometheus.yaml)
```yaml
args:
  - --web.external-url=http://62.169.23.197/prometheus/
  - --web.route-prefix=/prometheus
```

### Kong routes for monitoring (kong.yaml)
```yaml
- name: grafana-monitoring
  url: http://grafana-svc:3000
  routes:
    - name: grafana-route
      paths: [/grafana]
      strip_path: false

- name: prometheus-monitoring
  url: http://prometheus-svc:9090
  routes:
    - name: prometheus-route
      paths: [/prometheus]
      strip_path: false

consumers:
  - username: lexcam-ops
    basicauth_credentials:
      - username: admin
        password: lexcam_dev

plugins:
  - name: basic-auth
    service: prometheus-monitoring   # protects /prometheus only
    config:
      hide_credentials: true
```

### How metrics are exposed

**Django services** (user-management, lawyer-service, document-service, payment-service, admin-panel):
- `django-prometheus` installed in `requirements.txt`
- `INSTALLED_APPS`: `"django_prometheus"` added
- `MIDDLEWARE`: `PrometheusBeforeMiddleware` (first) + `PrometheusAfterMiddleware` (last)
- `urls.py`: `path("", include("django_prometheus.urls"))` → exposes `/metrics`

**FastAPI services** (rag-service, knowledge-base-service, embedding-service, notification-service, feedback-service, scraper-service):
- `prometheus_client==0.16.0` in `requirements.txt`
- Custom `app/monitoring.py` with `REQUEST_COUNT` counter + `prometheus_endpoint()` + `prometheus_middleware()`
- Wired in `app/main.py`: `app.middleware("http")(prometheus_middleware)` and `app.add_api_route("/metrics", ...)`

All deployment templates have these Prometheus scrape annotations:
```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "<service-port>"
  prometheus.io/path: /metrics
```

---

## 10. Jenkins CI/CD Pipeline

**File:** `Jenkinsfile` (root of repo)  
**Trigger:** GitHub push webhook  
**Agent:** any  
**Main branch only for build/push/deploy:** stages 4–9 run only when `env.GIT_BRANCH == 'origin/main'`

### Pipeline stages

| Stage | What it does |
|-------|-------------|
| 1. Checkout | `checkout scm`, logs branch + commit SHA |
| 2. Test | Parallel `pytest` for all 11 services (each in its own venv) |
| 3. Coverage | `--cov-fail-under=80` on all 11 services — **blocks build if any service < 80%** |
| 4. Build | `docker build` for 11 services + 4 workers + frontend, tags `:latest` + `:<sha>` |
| 5. Security Scan | Trivy scan all 16 images, `--exit-code 0` (non-blocking, reports only) |
| 6. Push | `docker push` both tags to DockerHub (`chewiclinton/`) |
| 7. Deploy Infrastructure | `kubectl apply` namespace + databases + monitoring + gateway; installs Metrics Server; waits for all StatefulSets + Kong |
| 8. Deploy | Cleans failed/pending Helm releases; `helm upgrade --install` for all 16 charts with git SHA as image tag |
| 9. Health Check | `kubectl rollout status` for all 16 deployments; prints `kubectl get pods` |

### Environment variables (Jenkinsfile)
```groovy
DOCKERHUB_REGISTRY = "chewiclinton"
KUBECONFIG         = "/var/lib/jenkins/.kube/config"
NAMESPACE          = "lexcam"
PIP_CACHE_DIR      = "/var/jenkins_home/.pip-cache"
```

### Jenkins credentials required
- `dockerhub-creds` — DockerHub username + password (type: Username/Password)

---

## 11. Known Manual Server Steps

These steps are **NOT in any manifest or Jenkinsfile** — they must be re-done manually if the cluster or PVCs are wiped.

### RabbitMQ user and vhost

```bash
# Exec into rabbitmq pod
kubectl exec -it rabbitmq-0 -n lexcam -- bash

# Inside the pod
rabbitmqctl add_user lexcam lexcam_dev
rabbitmqctl set_user_tags lexcam administrator
rabbitmqctl set_permissions -p / lexcam ".*" ".*" ".*"
```

### RabbitMQ exchange fix (workers need `topic` type)

```bash
# Still inside rabbitmq-0
rabbitmqctl eval 'rabbit_exchange:delete(rabbit_misc:r(<<"/">>, exchange, <<"lexcam.dlx">>), false).'
# Then restart workers so they recreate it as `topic`
kubectl rollout restart deployment/doc-worker deployment/indexing-worker deployment/notification-worker deployment/lawyer-ingest-worker -n lexcam
```

### UFW firewall

Only ports 80 (HTTP) and 443 (HTTPS when domain is added) need to be open.  
Ports 32300 and 32090 are **no longer needed** — monitoring now goes through Kong on port 80.

```bash
ufw allow 80
ufw allow 443
ufw reload

# If you previously opened 32300/32090, you can now close them:
ufw delete allow 32300
ufw delete allow 32090
ufw reload
```

---

## 12. Adding a Domain Name (Next Step)

### What you need
1. A domain name (e.g. `lexcam.cm` or `lexcam.app`)
2. DNS A record pointing to your VPS IP
3. TLS certificate (Let's Encrypt via cert-manager, or manual)

### Step 1 — Point DNS to the VPS

At your DNS registrar (Namecheap, GoDaddy, Cloudflare, etc.):
```
A   @           <VPS-IP>      (apex domain: lexcam.cm)
A   www         <VPS-IP>      (www subdomain)
```
Wait for DNS propagation (up to 24 hours, usually under 1 hour).

### Step 2 — Update the Traefik Ingress

Edit `infrastructure/k8s/gateway/ingress.yaml`:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: lexcam-ingress
  namespace: lexcam
  annotations:
    kubernetes.io/ingress.class: traefik
    # Add these for TLS (after cert-manager is installed):
    # cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  rules:
    - host: lexcam.cm          # ← add your domain here
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: kong-proxy-svc
                port:
                  number: 80
    - host: www.lexcam.cm      # ← optional www
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: kong-proxy-svc
                port:
                  number: 80
  # Add tls section after cert-manager is set up:
  # tls:
  #   - hosts:
  #       - lexcam.cm
  #       - www.lexcam.cm
  #     secretName: lexcam-tls
```

Apply:
```bash
kubectl apply -f infrastructure/k8s/gateway/ingress.yaml
```

### Step 3 — Install cert-manager (for HTTPS / Let's Encrypt)

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml

# Wait for it to be ready
kubectl rollout status deployment/cert-manager -n cert-manager --timeout=120s
```

Create a ClusterIssuer (`infrastructure/k8s/gateway/clusterissuer.yaml`):
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: nebamishael.amabo@ictuniversity.edu.cm   # ← your email
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: traefik
```

```bash
kubectl apply -f infrastructure/k8s/gateway/clusterissuer.yaml
```

Then uncomment the `cert-manager.io/cluster-issuer` annotation and `tls:` section in the ingress above and re-apply. cert-manager will automatically request and renew the certificate.

### Step 4 — Update frontend environment

In `infrastructure/helm/frontend/values.yaml`, update any public-facing URLs to use your domain:
```yaml
config:
  NEXT_PUBLIC_API_URL: "https://lexcam.cm"
  # (keep all internal service URLs pointing to kong-proxy-svc:80 for SSR)
```

### Step 5 — Open port 443 on UFW

```bash
ufw allow 443
ufw allow 80
ufw reload
```

### Step 5 — Update monitoring URLs for domain

In `infrastructure/k8s/monitoring/grafana.yaml`, update:
```yaml
- name: GF_SERVER_ROOT_URL
  value: "https://yourdomain.com/grafana/"
- name: GF_SERVER_DOMAIN
  value: "yourdomain.com"
```

In `infrastructure/k8s/monitoring/prometheus.yaml`, update:
```yaml
- --web.external-url=https://yourdomain.com/prometheus/
```

Then re-apply:
```bash
kubectl apply -f infrastructure/k8s/monitoring/
kubectl rollout restart statefulset/prometheus deployment/grafana -n lexcam
```

### Cloudflare option (simplest setup)

If you use Cloudflare as your DNS provider:
1. Add your domain to Cloudflare (free plan)
2. Set A record to your VPS IP, proxy mode ON (orange cloud)
3. Cloudflare handles TLS termination for you — no cert-manager needed
4. Set SSL/TLS mode to "Full" in Cloudflare dashboard
5. Your Traefik ingress can stay as HTTP internally

---

## 13. Useful kubectl Commands

```bash
# See all pods
kubectl get pods -n lexcam

# See all services and their IPs
kubectl get svc -n lexcam

# See HPA status (TARGETS shows current CPU%)
kubectl get hpa -n lexcam

# See all deployments
kubectl get deployments -n lexcam

# Watch rolling update in real time
kubectl rollout status deployment/<name> -n lexcam

# Trigger a manual rolling restart
kubectl rollout restart deployment/<name> -n lexcam

# Check logs for a service
kubectl logs -l app=<service-name> -n lexcam --tail=50

# Describe a pod (events, probe failures)
kubectl describe pod <pod-name> -n lexcam

# Exec into a running pod
kubectl exec -it <pod-name> -n lexcam -- bash

# See resource usage (requires Metrics Server)
kubectl top pods -n lexcam
kubectl top nodes

# Check Kong routes are loaded
kubectl exec -it $(kubectl get pods -n lexcam -l app=kong -o jsonpath='{.items[0].metadata.name}') \
  -n lexcam -- curl -s localhost:8001/services | python3 -m json.tool

# Force re-apply all infra manifests
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/databases/
kubectl apply -f infrastructure/k8s/monitoring/
kubectl apply -f infrastructure/k8s/gateway/

# Helm list all releases
helm list -n lexcam

# Helm upgrade a single service manually
helm upgrade --install <release> infrastructure/helm/<chart> \
  --namespace lexcam --set image.tag=latest --wait --timeout 300s

# Uninstall a release
helm uninstall <release> -n lexcam
```

---

## 14. Commit History Summary

| Commit | Fix / Feature |
|--------|--------------|
| `2bf1fda` | RollingUpdate strategy on all 16 deployments; HPA on all 4 workers |
| `28b8ff3` | Fix indexing-worker: KB_SERVICE_URL + EMBEDDING_SERVICE_URL |
| `c511bc1` | Fix embedding-service URL in rag + knowledge-base Helm values; rename KB_SERVICE_URL → KNOWLEDGE_BASE_URL |
| `e24ce24` | Fix frontend routing: all traffic through Kong, frontend as catch-all |
| `1741af2` | Add frontend Helm chart (port 3000, HPA min:1 max:3) |
| `4324fab` | Full observability: django-prometheus on Django; prometheus_client on FastAPI; Grafana:32300 Prometheus:32090 |
| `dfb12c6` | HPA on all 11 services; Metrics Server in CI with --kubelet-insecure-tls |
| `bf92de8` | Kong API gateway: all 11 services + embedding route; Kong scaled to 2 replicas |
| `09c6ca5` | Fix document-service requirements.txt concatenation bug |
| `4fd24c6` | All 5 Django services: runserver → gunicorn (2 workers) |
| `9a8f4e4` | Fix embedding-service: remove emptyDir that wiped ONNX model |
| `60fee30` | Fix embedding-service: correct Docker registry to chewiclinton |
| `32679d6` | Jenkins: cleanup failed/pending Helm releases; --cleanup-on-fail |
| `663da9e` | knowledge-base: memory 256Mi→512Mi; single uvicorn worker |
| `506758d` | knowledge-base health: non-fatal Qdrant check on fresh cluster |
| `69bc1e5` | rag-service: DB name lexcam_rag → lexcam_rag_sessions |
| `99e8745` | FastAPI deployments: uvicorn command; correct readiness probe paths |
| `b35f0ff` | FastAPI services: set DATABASE_URL; fix init_db |
| `d60c630` | Django services: add DATABASE_URL, ALLOWED_HOSTS, migrate before start |
| `d53dbb3` | Jenkins Stage 7: apply infra k8s before Helm services; --timeout 300s |
