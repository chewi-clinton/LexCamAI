-- Knowledge Base schema for lexcam_knowledge
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS law_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(128) NOT NULL,
    name VARCHAR(256) NOT NULL,
    jurisdiction VARCHAR(128) NOT NULL,
    language VARCHAR(16) NOT NULL,
    version VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS law_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES law_documents(id) ON DELETE CASCADE,
    article_number VARCHAR(128) NOT NULL,
    chapter VARCHAR(128),
    title VARCHAR(512),
    full_text TEXT NOT NULL,
    plain_summary TEXT,
    domain VARCHAR(64) NOT NULL,
    language VARCHAR(16) NOT NULL,
    qdrant_id VARCHAR(128),
    search_vector TSVECTOR
);

CREATE INDEX IF NOT EXISTS ix_law_articles_search_vector ON law_articles USING GIN(search_vector);

CREATE OR REPLACE FUNCTION law_articles_search_vector_trigger() RETURNS trigger AS $$
begin
  new.search_vector := to_tsvector('simple', coalesce(new.full_text, ''));
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON law_articles;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON law_articles
FOR EACH ROW EXECUTE FUNCTION law_articles_search_vector_trigger();

-- Optional helper to reindex all existing rows
-- UPDATE law_articles SET search_vector = to_tsvector('simple', coalesce(full_text, ''));
