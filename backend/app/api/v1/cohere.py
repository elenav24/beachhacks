from fastapi import APIRouter, HTTPException
from app.integrations.cohere_ai import get_supply_chain_map

router = APIRouter()

@router.get("/map")
async def map_journey(company_name: str, delivery_city: str):
    try:
        result = get_supply_chain_map(company_name, delivery_city)
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))