# LexCam — Integration & Load Tests

All tests run against the **live cluster** at `https://lexcam.flakyfantasy.com`.

---

## Setup

```bash
cd tests
pip install -r requirements.txt
```

### Create a test user (one-time)

1. Open `https://lexcam.flakyfantasy.com/register`
2. Register with any email + password
3. Enter the OTP sent to that email
4. Export the credentials:

```bash
export LEXCAM_TEST_EMAIL="your-test-email@example.com"
export LEXCAM_TEST_PASSWORD="YourPassword123!"
export LEXCAM_BASE_URL="https://lexcam.flakyfantasy.com"   # optional, this is the default
```

---

## Integration Tests

Run all integration tests:

```bash
cd tests
pytest integration/ -v
```

Run a specific test file:

```bash
pytest integration/test_chat.py -v
pytest integration/test_auth.py -v
pytest integration/test_documents.py -v
```

Skip auth-dependent tests (if no credentials):

```bash
pytest integration/ -v -k "not auth"
```

### Test coverage map

| File | What it tests | Auth required |
|------|-------------|---------------|
| `test_health.py` | All 7 services reachable through Kong | No |
| `test_auth.py` | Login, token refresh, user profile | Yes |
| `test_chat.py` | Full RAG pipeline: embedding → Qdrant → Groq | No |
| `test_lawyers.py` | Lawyer directory, specializations | No (read) |
| `test_documents.py` | Template list, document generation | Yes |
| `test_feedback.py` | Submit, list, flag feedback | No |
| `test_notifications.py` | List notifications | No |
| `test_payment.py` | Auth guards, invalid webhook rejection | Yes (some) |

---

## Load Testing (Locust)

### Interactive mode (web UI)

```bash
cd tests/load
locust -f locustfile.py --host https://lexcam.flakyfantasy.com
```

Open `http://localhost:8089` → set number of users → Start.

### Headless load test

```bash
# Baseline: 20 users, ramp 2/s, 2 minutes
locust -f tests/load/locustfile.py \
       --host https://lexcam.flakyfantasy.com \
       --headless -u 20 -r 2 --run-time 2m

# Load test: 50 concurrent users
locust -f tests/load/locustfile.py \
       --host https://lexcam.flakyfantasy.com \
       --headless -u 50 -r 5 --run-time 5m

# Stress test: push until failures appear
locust -f tests/load/locustfile.py \
       --host https://lexcam.flakyfantasy.com \
       --headless -u 200 -r 10 --run-time 10m
```

### User classes

| Class | Weight | Behaviour |
|-------|--------|-----------|
| `AnonymousUser` | 5 | Browse lawyers, notifications, feedback, frontend |
| `ChatUser` | 3 | Create conversation, send legal questions, stream responses |
| `AuthUser` | 2 | Login, list documents, submit feedback, view profile |

### What to watch

- **Response time p95 < 2 s** for non-LLM endpoints (lawyers, feedback, notifications)
- **Response time p95 < 20 s** for chat messages (Groq LLM can take 10–15 s)
- **Failure rate < 1%** under 50 users (HPA should scale Kong + services)
- **HPA scaling**: monitor with `kubectl get hpa -n lexcam --watch`
- **Grafana**: `https://lexcam.flakyfantasy.com/grafana` → Node Exporter Full dashboard

### Export results to CSV

```bash
locust -f tests/load/locustfile.py \
       --host https://lexcam.flakyfantasy.com \
       --headless -u 50 -r 5 --run-time 5m \
       --csv=results/load_test_50users
```

---

## Notes

- **Chat tests are slow** — each LLM call can take 10–20 s. Use `--timeout=30` in pytest if needed.
- **No test data is cleaned up** — document requests created during testing remain in `awaiting_payment` status and are harmless.
- **Payment tests are safe** — no real Campay calls are made; tests only verify auth guards and API contract.
