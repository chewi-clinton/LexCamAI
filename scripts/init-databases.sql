-- LexCam PostgreSQL initialization
-- Runs automatically on first container start.
-- Design choice: database-per-service on a single Postgres instance
-- (separate logical databases like lexcam_users, lexcam_rag_sessions, etc.).

CREATE DATABASE lexcam_users;
CREATE DATABASE lexcam_lawyers;
CREATE DATABASE lexcam_documents;
CREATE DATABASE lexcam_payments;
CREATE DATABASE lexcam_notif;
CREATE DATABASE lexcam_feedback;
CREATE DATABASE lexcam_admin;
CREATE DATABASE lexcam_scraping;
CREATE DATABASE lexcam_knowledge;
CREATE DATABASE lexcam_rag_sessions;
