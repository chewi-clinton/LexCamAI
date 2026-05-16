Knowledge Base Service

Quick start (development with docker-compose):

1. Ensure docker-compose.dev.yml includes the `knowledge-base-service` entry (it does by default).
2. Start dependencies: Postgres, Qdrant, Redis, Embedding Service via docker-compose:

```bash
docker compose -f docker-compose.dev.yml up -d postgres qdrant redis embedding-service
```

3. Create the KB schema in the `lexcam_knowledge` database (run inside the Postgres container or via psql):

```bash
# from repo root
cat services/knowledge-base-service/sql/init_kb_schema.sql | docker exec -i lexcam-postgres psql -U lexcam -d lexcam_knowledge
```

4. Build and start the Knowledge Base Service:

```bash
docker compose -f docker-compose.dev.yml up -d knowledge-base-service
```

5. Seed a sample document/article into the KB (make sure services are running):

```bash
# from repo root
python services/knowledge-base-service/scripts/seed_kb.py
```

6. Test the public search endpoint:

```bash
curl -X POST http://localhost:8003/api/v1/search -H 'Content-Type: application/json' -d '{"query":"santé travailleurs"}'
```

Notes:
- The service uses SQLAlchemy `create_all` at startup, but you still need to run the provided SQL to create the tsvector index and trigger for full-text search.
- The Indexing Worker and ingestion workflows will use the `/internal/retrieve` endpoint and Qdrant upserts.
