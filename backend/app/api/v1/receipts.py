from fastapi import APIRouter, Query
from pydantic import BaseModel
from app.models.receipt import EnvironmentalReceipt
from app.services.engine import generate_environmental_analysis, generate_manual_analysis

router = APIRouter()


@router.get("", response_model=EnvironmentalReceipt)
async def receipt(url: str = Query(..., description="Amazon product URL")):
    return await generate_environmental_analysis(url)


class ManualProductInput(BaseModel):
    brand: str = ""
    title: str
    description: str = ""
    materials: str = ""
    price: float = 0.0


@router.post("/manual", response_model=EnvironmentalReceipt)
async def receipt_manual(body: ManualProductInput):
    return await generate_manual_analysis(
        brand=body.brand,
        title=body.title,
        description=body.description,
        materials=body.materials,
        price=body.price,
    )