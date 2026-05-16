from fastapi import APIRouter

from app.api.v1.routes import router as routes_router

router = APIRouter()
router.include_router(routes_router)
