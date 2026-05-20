from fastapi import FastAPI
from .api.v1 import routes as v1_routes  # importing routes also imports tasks, which installs the DNS resilience patch
from .api.v1 import auth_routes
from .db import init_db
from .config import settings
from .monitoring import init_logging, prometheus_middleware, prometheus_endpoint

app = FastAPI(title=settings.SERVICE_NAME)


@app.on_event("startup")
def on_startup():
    init_db()
    init_logging()


app.middleware("http")(prometheus_middleware)
app.add_api_route("/metrics", prometheus_endpoint, methods=["GET"])

app.include_router(auth_routes.router)
app.include_router(v1_routes.router)
