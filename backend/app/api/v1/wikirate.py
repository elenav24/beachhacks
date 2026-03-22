from fastapi import APIRouter
from app.integrations.wikirate import get_labor_score, get_climate_transparency_data

router = APIRouter()


@router.get("/labor/{brand}")
def labor(brand: str):
    result = get_labor_score(brand)
    if not result:
        return {"error": "Brand not found in WikiRate"}
    # result is a list of tuples: [("Metric", value), ..., ("Score", total)]
    breakdown = [{"metric": m, "value": v} for m, v in result if m != "Score"]
    score_entry = next((v for m, v in result if m == "Score"), None)
    return {"score": score_entry, "breakdown": breakdown}


@router.get("/climate/{brand}")
def climate(brand: str):
    return get_climate_transparency_data(brand) or {"error": "Brand not found in WikiRate"}
