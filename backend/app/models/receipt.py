from pydantic import BaseModel

class EnvironmentalReceipt(BaseModel):
    product_name: str
    brand: str
    price: float
    emissions: float
    water: float
    ethics: float
    environmental_grade: str
    overall_score: float
    decomposition_time_years: int
