from fastapi import APIRouter, HTTPException
from app.integrations.wikirate import get_sustainability_report, get_labor_score, get_climate_score

router = APIRouter()


@router.get("/")
def read_root():
    return {"status": "active", "message": "EcoScore API is running. Go to /docs to test."}

@router.get("/report/{company_name}")
def full_report(company_name: str):
    """Returns the combined Labor, Climate, and Overall Impact score."""
    report = get_sustainability_report(company_name)
    if not report:
        raise HTTPException(status_code=404, detail="Company not found on Wikirate")
    return report

@router.get("/test/labor/{company_name}")
def labor_only(company_name: str):
    """Isolation test for Labor Metrics."""
    data = get_labor_score(company_name)
    if not data:
        raise HTTPException(status_code=404, detail="Labor data not found")
    return {"company": company_name, "labor_breakdown": data}

@router.get("/test/climate/{company_name}")
def climate_only(company_name: str):
    """Isolation test for Climate Metrics."""
    data = get_climate_score(company_name)
    if not data:
        raise HTTPException(status_code=404, detail="Climate data not found")
    return {"company": company_name, "climate_breakdown": data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(router, host="0.0.0.0", port=8000)
