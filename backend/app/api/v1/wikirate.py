from fastapi import APIRouter, HTTPException
from app.integrations.wikirate import get_wikirate_report

router = APIRouter()


@router.get("/")
def read_root():
    return {"status": "active", "message": "EcoScore API is running. Go to /docs to test."}

@router.get("/report/{company_name}")
def full_report(company_name: str):
    """Returns the combined Labor, Climate, and Overall Impact score."""
    report = get_wikirate_report(company_name)
    if not report:
        raise HTTPException(status_code=404, detail="Company not found on Wikirate")
    return report
