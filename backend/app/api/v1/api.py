from fastapi import APIRouter
from .receipts import router as receipt_router
from .wikirate import router as wikirate_router
from .cohere import router as cohere_router


router = APIRouter()

router.include_router(receipt_router, prefix="/receipts", tags=["receipts"])
router.include_router(wikirate_router, prefix="/wikirate", tags=["wikirate"])
router.include_router(cohere_router, prefix="/cohere", tags=["cohere"])

