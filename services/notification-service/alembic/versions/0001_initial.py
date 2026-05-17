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
        CREATE TABLE IF NOT EXISTS notification (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(128),
            message TEXT NOT NULL,
            delivered BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITHOUT TIME ZONE
        )
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS deliverylog (
            id SERIAL PRIMARY KEY,
            notification_id INTEGER,
            to_address VARCHAR(256),
            subject VARCHAR(256),
            status VARCHAR(64),
            error TEXT,
            sent_at TIMESTAMP WITHOUT TIME ZONE
        )
    """)


def downgrade():
    op.execute('DROP TABLE IF EXISTS deliverylog')
    op.execute('DROP TABLE IF EXISTS notification')
    op.execute('DROP TABLE IF EXISTS "user"')
