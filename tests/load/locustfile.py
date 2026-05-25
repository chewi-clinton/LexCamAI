"""
LexCam Load & Stress Test — Locust
====================================

Usage:
  # Interactive web UI (open http://localhost:8089)
  locust -f locustfile.py --host https://lexcam.flakyfantasy.com

  # Headless load test: 50 users, ramp 5/s, run 2 minutes
  locust -f locustfile.py --host https://lexcam.flakyfantasy.com \
         --headless -u 50 -r 5 --run-time 2m

  # Stress test: ramp to 200 users
  locust -f locustfile.py --host https://lexcam.flakyfantasy.com \
         --headless -u 200 -r 10 --run-time 5m

Environment variables:
  LEXCAM_TEST_EMAIL     pre-verified test user email (required for AuthUser)
  LEXCAM_TEST_PASSWORD  test user password          (required for AuthUser)

User classes and weights:
  AnonymousUser  (weight 5) — browses lawyers + chat (no auth)
  ChatUser       (weight 3) — creates conversations and sends legal questions
  AuthUser       (weight 2) — logs in, views profile, creates document requests
"""

import os
import random
from locust import HttpUser, task, between, events


TEST_EMAIL = os.getenv("LEXCAM_TEST_EMAIL", "")
TEST_PASSWORD = os.getenv("LEXCAM_TEST_PASSWORD", "")

LEGAL_QUESTIONS = [
    "What are my rights as an employee in Cameroon?",
    "How can I terminate a lease contract under Cameroonian law?",
    "What does the Cameroon Labour Code say about overtime pay?",
    "What is the legal process for recovering unpaid wages?",
    "What are tenant rights in Cameroon under the Housing Code?",
    "How is child custody determined under Cameroonian Civil Code?",
    "What are the penalties for breach of contract in Cameroon?",
    "Quels sont mes droits en tant que locataire au Cameroun?",
    "Comment résilier un contrat de travail légalement au Cameroun?",
    "Quelles sont les lois sur le licenciement abusif au Cameroun?",
]

DOCUMENT_SLUGS = [
    "mise-en-demeure-salaire",
    "mise-en-demeure-logement",
    "lettre-reclamation",
    "denonciation-de-conge",
    "declaration-de-faits",
]


# ---------------------------------------------------------------------------
# Anonymous user — public endpoints only
# ---------------------------------------------------------------------------

class AnonymousUser(HttpUser):
    """
    Simulates a visitor browsing the public parts of LexCam.
    Tasks: view lawyer directory, law articles, notifications.
    Weight 5 — most traffic is unauthenticated browsing.
    """
    weight = 5
    wait_time = between(1, 4)

    @task(4)
    def browse_lawyers(self):
        with self.client.get("/api/v1/lawyers", name="GET /lawyers", catch_response=True) as r:
            if r.status_code not in (200, 204):
                r.failure(f"lawyers returned {r.status_code}")

    @task(2)
    def list_notifications(self):
        with self.client.get("/api/v1/notifications", name="GET /notifications", catch_response=True) as r:
            if r.status_code not in (200, 204):
                r.failure(f"notifications returned {r.status_code}")

    @task(2)
    def list_feedback(self):
        with self.client.get("/api/v1/feedback", name="GET /feedback", catch_response=True) as r:
            if r.status_code not in (200, 204):
                r.failure(f"feedback returned {r.status_code}")

    @task(1)
    def view_frontend(self):
        with self.client.get("/", name="GET /frontend", catch_response=True) as r:
            if r.status_code != 200:
                r.failure(f"frontend returned {r.status_code}")

    @task(1)
    def list_specializations(self):
        with self.client.get("/api/v1/specializations", name="GET /specializations", catch_response=True) as r:
            if r.status_code not in (200, 204):
                r.failure(f"specializations returned {r.status_code}")


# ---------------------------------------------------------------------------
# Chat user — conversational AI (no auth required)
# ---------------------------------------------------------------------------

class ChatUser(HttpUser):
    """
    Simulates a user having an AI legal chat session.
    This is the most compute-intensive path: embedding → Qdrant → Groq.
    Weight 3.
    """
    weight = 3
    wait_time = between(3, 10)
    conversation_id = None

    def on_start(self):
        with self.client.post(
            "/api/v1/chat/conversations",
            name="POST /chat/conversations [setup]",
            catch_response=True,
        ) as r:
            if r.status_code == 200:
                self.conversation_id = r.json().get("id")
            else:
                r.failure(f"Could not create conversation: {r.status_code}")

    @task(3)
    def send_chat_message(self):
        if not self.conversation_id:
            return
        question = random.choice(LEGAL_QUESTIONS)
        with self.client.post(
            f"/api/v1/chat/conversations/{self.conversation_id}/messages",
            json={"content": question},
            name="POST /chat/messages",
            catch_response=True,
            timeout=45,
        ) as r:
            if r.status_code == 200:
                answer = r.json().get("content", "")
                if len(answer) < 5:
                    r.failure("LLM returned empty response")
            else:
                r.failure(f"Chat message returned {r.status_code}")

    @task(1)
    def get_conversation(self):
        if not self.conversation_id:
            return
        with self.client.get(
            f"/api/v1/chat/conversations/{self.conversation_id}",
            name="GET /chat/conversation",
            catch_response=True,
        ) as r:
            if r.status_code != 200:
                r.failure(f"Get conversation returned {r.status_code}")

    @task(1)
    def new_conversation(self):
        with self.client.post(
            "/api/v1/chat/conversations",
            name="POST /chat/conversations",
            catch_response=True,
        ) as r:
            if r.status_code == 200:
                self.conversation_id = r.json().get("id")
            else:
                r.failure(f"Create conversation returned {r.status_code}")


# ---------------------------------------------------------------------------
# Authenticated user — full logged-in flow
# ---------------------------------------------------------------------------

class AuthUser(HttpUser):
    """
    Simulates a logged-in citizen: login → browse their documents → submit feedback.
    Weight 2. Requires LEXCAM_TEST_EMAIL + LEXCAM_TEST_PASSWORD env vars.
    """
    weight = 2
    wait_time = between(2, 6)
    access_token = None

    def on_start(self):
        if not TEST_EMAIL or not TEST_PASSWORD:
            self.access_token = None
            return

        with self.client.post(
            "/api/v1/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            name="POST /auth/login [setup]",
            catch_response=True,
        ) as r:
            if r.status_code == 200:
                self.access_token = r.json().get("access")
            else:
                r.failure(f"Login failed: {r.status_code}")
                self.access_token = None

    def _auth(self):
        if not self.access_token:
            return {}
        return {"Authorization": f"Bearer {self.access_token}"}

    @task(3)
    def list_my_documents(self):
        with self.client.get(
            "/api/v1/documents",
            headers=self._auth(),
            name="GET /documents (auth)",
            catch_response=True,
        ) as r:
            if r.status_code not in (200, 401, 403):
                r.failure(f"List documents returned {r.status_code}")

    @task(2)
    def get_my_profile(self):
        with self.client.get(
            "/api/v1/users/me",
            headers=self._auth(),
            name="GET /users/me",
            catch_response=True,
        ) as r:
            if r.status_code not in (200, 401, 403):
                r.failure(f"Profile returned {r.status_code}")

    @task(1)
    def submit_feedback(self):
        with self.client.post(
            "/api/v1/feedback",
            json={
                "text": "Load test feedback — please ignore",
                "rating": random.randint(3, 5),
                "session_id": f"load-test-{random.randint(1000, 9999)}",
                "message_index": 0,
            },
            name="POST /feedback",
            catch_response=True,
        ) as r:
            if r.status_code not in (200, 201):
                r.failure(f"Feedback submission returned {r.status_code}")

    @task(1)
    def browse_lawyers_auth(self):
        with self.client.get(
            "/api/v1/lawyers",
            headers=self._auth(),
            name="GET /lawyers (auth)",
            catch_response=True,
        ) as r:
            if r.status_code not in (200, 204):
                r.failure(f"Lawyers returned {r.status_code}")


# ---------------------------------------------------------------------------
# Event hooks — print summary on test end
# ---------------------------------------------------------------------------

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    stats = environment.stats.total
    print("\n" + "=" * 60)
    print("LEXCAM LOAD TEST SUMMARY")
    print("=" * 60)
    print(f"  Total requests : {stats.num_requests}")
    print(f"  Failures       : {stats.num_failures}")
    print(f"  Failure rate   : {stats.fail_ratio * 100:.1f}%")
    print(f"  Avg response   : {stats.avg_response_time:.0f} ms")
    print(f"  p95 response   : {stats.get_response_time_percentile(0.95):.0f} ms")
    print(f"  p99 response   : {stats.get_response_time_percentile(0.99):.0f} ms")
    print(f"  Peak RPS       : {stats.current_rps:.1f}")
    print("=" * 60)
