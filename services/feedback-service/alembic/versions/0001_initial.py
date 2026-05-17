"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2026-05-17

"""
from alembic import op

revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        CREATE TABLE IF NOT EXISTS "user" (
            id SERIAL PRIMARY KEY,
            username VARCHAR(128) NOT NULL UNIQUE,
            email VARCHAR(256),
            hashed_password VARCHAR(256) NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE
        )
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(128),
            text TEXT NOT NULL,
            rating INTEGER,
            created_at TIMESTAMP WITHOUT TIME ZONE,
            session_id VARCHAR(128),
            message_index INTEGER,
            flag_count INTEGER NOT NULL DEFAULT 0,
            flagged BOOLEAN NOT NULL DEFAULT FALSE
        )
    """)


def downgrade():
    op.execute('DROP TABLE IF EXISTS feedback')
    op.execute('DROP TABLE IF EXISTS "user"')
