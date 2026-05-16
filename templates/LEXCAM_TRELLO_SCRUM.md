# LEXCAM — Trello Scrum Setup
## SEN3244 Software Architecture | Spring 2026

---

## Board Name
`LexCam | SEN3244 Sprint 2026`

---

## Lists to Create (in this order)

1. `📋 Product Backlog`
2. `🔥 Sprint 1 — To Do` (Days 1–7)
3. `🔥 Sprint 2 — To Do` (Days 8–14)
4. `🚧 In Progress`
5. `🔍 In Review`
6. `✅ Done`

---

## Labels

| Color | Name |
|---|---|
| Red | Person A |
| Blue | Person B |
| Green | Both |
| Purple | DevOps |
| Orange | Testing |
| Black | Documentation |

---

## Sprint 1 Cards — Days 1–7

Move all of these into **Sprint 1 — To Do**

| Card Name | Label | Day |
|---|---|---|
| VPS Setup + K3s + SSH Hardening | Both, DevOps | 1 |
| GitHub Monorepo + Folder Structure | Both | 1 |
| PostgreSQL — All 10 Schemas | Both, DevOps | 2 |
| Qdrant + MinIO + Redis | Both, DevOps | 2 |
| RabbitMQ + DLX Exchange | Both, DevOps | 2 |
| Kong API Gateway + Traefik Routing | Both, DevOps | 2 |
| Prometheus + Grafana + Node Exporter | Both, DevOps | 2 |
| Jenkins Setup + GitHub Plugin | Both, DevOps | 2 |
| docker-compose.dev.yml — Local Dev | Both | 2 |
| User Management Service | Person A | 3 |
| Helm Charts — All 16 Services | Person B, DevOps | 3 |
| Kong Route Config — All Services | Person B, DevOps | 3 |
| Embedding Service | Person A | 4 |
| Knowledge Base — Schema + Qdrant Setup | Person A | 4 |
| Lawyer Service — Profiles + Verification Workflow | Person B | 4 |
| Knowledge Base — Search + Law Explorer | Person A | 5 |
| Initial Law Data Ingestion (500+ chunks) | Person A | 5 |
| Lawyer Service — Referral Lifecycle | Person B | 5 |
| RAG Service — Full AI Pipeline | Person A | 6 |
| Document Service — Templates + PDF | Person B | 6 |
| RAG Service — Sessions + Events | Person A | 7 |
| Feedback Service | Person A | 7 |
| Payment Service — Campay Integration | Person B | 7 |

---

## Sprint 2 Cards — Days 8–14

Move all of these into **Sprint 2 — To Do**

| Card Name | Label | Day |
|---|---|---|
| Notification Service | Person A | 8 |
| RabbitMQ — All 14 Events Wired | Person A | 8 |
| Admin Panel — Django Admin + Review Queue | Person B | 8 |
| Doc Worker | Person B | 9 |
| Notification Worker | Person B | 9 |
| Lawyer Ingest Worker | Person A | 9 |
| Indexing Worker | Person B | 9 |
| Scraper Service | Person A | 9 |
| Frontend — Auth Pages (Register, Login, OTP) | Person A | 10 |
| Frontend — AI Chat + SSE Streaming | Person A | 10 |
| Frontend — Lawyer Directory + Filters | Person B | 10 |
| Frontend — Law Explorer | Person B | 10 |
| Frontend — Document Generator + Payment Flow | Person A | 11 |
| Frontend — Lawyer Dashboard + Referral Flow | Person B | 11 |
| Frontend — PWA + i18n + Responsive | Both | 11 |
| Tests — RAG, KB, Embedding, User, Feedback | Person A, Testing | 12 |
| Tests — Lawyer, Document, Payment, Notif, Admin, Scraper | Person B, Testing | 12 |
| End-to-End Integration Tests | Both, Testing | 12 |
| Jenkins Pipeline — 7 Stages + Webhook | Person B, DevOps | 13 |
| Ansible Playbooks — VPS + K3s | Person B, DevOps | 13 |
| Prometheus + Grafana — 3 Dashboards + Alert | Person B, DevOps | 13 |
| K8s Final Deploy + HPA + Rolling Update | Person A, DevOps | 13 |
| Architecture Diagrams — Component + Deployment + Sequence | Person A, Documentation | 14 |
| Swagger Docs — All 11 Services | Person B, Documentation | 14 |
| README + Project Report | Person B, Documentation | 14 |
| Scrum Docs + Burndown Charts | Person B, Documentation | 14 |
| 7-Minute Video Walkthrough | Both, Documentation | 14 |
| PowerPoint Presentation | Both, Documentation | 14 |

---

## How to Use the Board

- When you start a card → move it to **In Progress**
- When code is done, push to GitHub → move to **In Review**
- When tests pass and checklist done → move to **Done**
- Max 1 card In Progress per person at a time
- Add the **yellow Blocker label** if you are stuck waiting on something

---

## Daily Standup (5 min, every morning)

Each person comments on their current card:
1. Done yesterday?
2. Working on today?
3. Any blocker?

---

## Sprint Ceremonies

| Event | When | What to do |
|---|---|---|
| Sprint Planning | Day 1 | Assign cards, set due dates |
| Sprint 1 Review | End of Day 7 | Count Done cards, screenshot board |
| Sprint 1 Retrospective | End of Day 7 | Create card "Sprint 1 Retro" in Done — write what went well / what to fix |
| Sprint 2 Review | End of Day 14 | Count Done cards, screenshot board |
| Sprint 2 Retrospective | End of Day 14 | Create card "Sprint 2 Retro" in Done |

---

## Burndown (update each evening)

Create a card called `📊 Sprint Tracker` — update the numbers each night:

**Sprint 1**
| Day | Cards Left |
|---|---|
| Day 1 | 23 |
| Day 2 | 21 |
| Day 3 | 19 |
| Day 4 | 16 |
| Day 5 | 13 |
| Day 6 | 11 |
| Day 7 | 0 |

**Sprint 2**
| Day | Cards Left |
|---|---|
| Day 8 | 28 |
| Day 9 | 25 |
| Day 10 | 21 |
| Day 11 | 18 |
| Day 12 | 15 |
| Day 13 | 11 |
| Day 14 | 0 |

Screenshot these tables at end of each sprint for your exam submission.

---

**Total: 51 cards — 23 in Sprint 1, 28 in Sprint 2**

*LexCam — SEN3244 Spring 2026 — ICT University*
