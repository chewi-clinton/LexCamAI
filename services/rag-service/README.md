Small RAG (retrieval-augmented generation) service stub.

Endpoints:
- POST /api/v1/query  — accepts {"query": str, "top_k": int}

Behavior:
- For local dev this service calls the `knowledge-base-service` `/api/v1/search` endpoint
  to retrieve top documents and returns them along with a simple synthesized answer.
