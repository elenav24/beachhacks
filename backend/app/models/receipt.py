from pydantic import BaseModel
from typing import Optional

class EnvironmentalReceipt(BaseModel):
    product_name: str
    brand: str
    price: float
    image_url: Optional[str] = None
    asin: Optional[str] = None
    climate_pledge_friendly: bool = False
    emissions: float
    emission_factor_name: Optional[str] = None
    emission_factor_region: Optional[str] = None
    emission_lca_stage: Optional[str] = None
    water: float
    ethics: float
    environmental_grade: str
    overall_score: float
    decomposition_time_years: int
