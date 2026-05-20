"""add flag_reason and review_status

Revision ID: 0002_add_flag_fields
Revises: 0001_initial
Create Date: 2026-05-20

"""
from alembic import op

revision = '0002_add_flag_fields'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        ALTER TABLE feedback
            ADD COLUMN IF NOT EXISTS flag_reason VARCHAR(64),
            ADD COLUMN IF NOT EXISTS review_status VARCHAR(32) NOT NULL DEFAULT 'pending'
    """)


def downgrade():
    op.execute("ALTER TABLE feedback DROP COLUMN IF EXISTS flag_reason")
    op.execute("ALTER TABLE feedback DROP COLUMN IF EXISTS review_status")
