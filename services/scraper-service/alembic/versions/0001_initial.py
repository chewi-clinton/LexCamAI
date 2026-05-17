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
        CREATE TABLE IF NOT EXISTS scrapejob (
            id SERIAL PRIMARY KEY,
            url VARCHAR(2048) NOT NULL,
            status VARCHAR(64),
            result TEXT,
            created_at TIMESTAMP WITHOUT TIME ZONE,
            updated_at TIMESTAMP WITHOUT TIME ZONE
        )
    """)


def downgrade():
    op.execute('DROP TABLE IF EXISTS scrapejob')
