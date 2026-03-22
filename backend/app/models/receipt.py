from pydantic import BaseModel
from typing import Optional

class EnvironmentalReceipt(BaseModel):
    product_name: str
    brand: str
    price: float
    image_url: Optional[str] = None
    asin: Optional[str] = None
    climate_pledge_friendly: bool = False

    # Climatiq
    emissions: float
    emission_factor_name: Optional[str] = None
    emission_factor_region: Optional[str] = None
    emission_lca_stage: Optional[str] = None
    decomposition_time_years: int

    # Geocoded origin coordinates (from emission_factor_region via geopy)
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None

    # WikiRate labor ethics
    ethics_score: Optional[float] = None
    ethics_breakdown: Optional[list] = None

    # WikiRate climate transparency (Fashion Revolution)
    climate_decarbonization_score: Optional[float] = None
    climate_energy_score: Optional[float] = None
    climate_traceability_score: Optional[float] = None
    climate_accountability_score: Optional[float] = None

    water: float
    environmental_grade: str
    overall_score: float
