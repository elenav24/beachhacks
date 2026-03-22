import httpx
from app.core.config import CLIMATIQ_API_KEY

async def calculate_footprint(weight: str, category: str, origin: str = "CN"):
    # Clean weight string (e.g., "1.2 kg" -> 1.2)
    numeric_weight = float(''.join(c for c in weight if c.isdigit() or c == '.'))
    
    headers = {"Authorization": f"Bearer {CLIMATIQ_API_KEY}"}
    
    # We use Autopilot to match the Amazon category to a Carbon factor
    payload = {
        "text": category,
        "parameters": {
            "weight": numeric_weight,
            "weight_unit": "kg"
        },
        "region": origin # Use the AI-predicted origin
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Production Emissions
        prod_resp = await client.post("https://api.climatiq.io/autopilot/v1/suggest", 
                                       json=payload, headers=headers)
        prod_data = prod_resp.json()
        
        # 2. Shipping Estimate (Simplified)
        # Assuming shipping to US (US) from Origin (e.g., CN)
        # You could use Climatiq's /freight endpoint here for more detail
        
        return {
            "emissions": prod_data.get("co2e", 0),
            "water": prod_data.get("constituent_gases", {}).get("h2o", 0), # If available
            "decomposition": 100 if "plastic" in category.lower() else 1 # Simple logic
        }