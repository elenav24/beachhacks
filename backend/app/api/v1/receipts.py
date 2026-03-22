from fastapi import APIRouter, Query
from app.models.receipt import EnvironmentalReceipt
from app.services.engine import generate_environmental_analysis

router = APIRouter()


@router.get("", response_model=EnvironmentalReceipt)
async def receipt(url: str = Query(..., description="Amazon product URL")):
    return await generate_environmental_analysis(url)