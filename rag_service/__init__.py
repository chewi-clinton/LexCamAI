import os
from pathlib import Path

# shim package to allow tests to import `rag_service.app` when running from repo root.
# This inserts the services/rag-service/app path into the package search path.
root = Path(__file__).resolve().parent
# insert the parent folder that contains the `app` package directory
app_parent = root.joinpath("..", "services", "rag-service").resolve()
if str(app_parent) not in __path__:
    __path__.insert(0, str(app_parent))
