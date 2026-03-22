from fastapi import APIRouter
from .receipt import router as receipt_router


router = APIRouter()

router.include_router(receipt_router, prefix="/receipts", tags=["receipts"])
