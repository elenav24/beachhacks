from fastapi import APIRouter, HTTPException
from app.integrations.cohere_ai import get_supply_chain_map

# Import your existing function from your logic file
# from your_logic_file import get_supply_chain_map 

router = APIRouter()

@router.get("/map")
async def map_journey(company_name: str, delivery_city: str):
    """
    Generate a full supply chain journey, including CO2 
    estimations and shipping distances.
    """
    try:
        # result = get_supply_chain_map(request.company_name, request.delivery_city)
        # For testing, we call your existing agent function:
        result = get_supply_chain_map(company_name, delivery_city)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))