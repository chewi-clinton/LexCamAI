from alembic import context
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.config import settings
from app.db import engine
from app.models import Feedback
from app.models_user import User

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

target_metadata = [Feedback.metadata, User.metadata]


def run_migrations_offline():
    url = str(settings.DATABASE_URL)
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
