from pathlib import Path

# Shim package so pytest can import `app.main` from the embedding service
# when running from the repository root.
root = Path(__file__).resolve().parent
service_app = root.joinpath("..", "services", "embedding-service", "app").resolve()
if str(service_app) not in __path__:
    __path__.insert(0, str(service_app))