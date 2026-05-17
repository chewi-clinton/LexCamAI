"""create rag_sessions table

Revision ID: 0001_create_rag_sessions
Revises: 
Create Date: 2026-05-17 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_create_rag_sessions'
down_revision = None
branch_labels = None
dependencies = None


def upgrade():
    op.create_table(
        'rag_sessions',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('query', sa.Text, nullable=False),
        sa.Column('prompt', sa.Text, nullable=True),
        sa.Column('response', sa.Text, nullable=True),
        sa.Column('sources', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table('rag_sessions')
