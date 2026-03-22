import httpx
from app.core.config import CLIMATIQ_API_KEY

BASE_URL = "https://api.climatiq.io/data/v1"

# Fallback map: keywords in category -> known Climatiq weight-based activity IDs
CATEGORY_FALLBACKS = {
    "shirt": "textile-type_clothing-material_cotton",
    "cloth": "textile-type_clothing-material_cotton",
    "apparel": "textile-type_clothing-material_cotton",
    "pants": "textile-type_clothing-material_cotton",
    "shoe": "textile-type_clothing-material_mixed",
    "electronic": "consumer_goods-type_electrical_equipment",
    "plastic": "consumer_goods-type_plastic_products",
    "paper": "consumer_goods-type_paper_products",
    "metal": "consumer_goods-type_metal_products",
    "furniture": "consumer_goods-type_furniture",
    "toy": "consumer_goods-type_toys",
}

def get_fallback_activity_id(category: str, title: str = "") -> str | None:
    text = (category + " " + title).lower()
    for keyword, activity_id in CATEGORY_FALLBACKS.items():
        if keyword in text:
            return activity_id
    return None

async def calculate_footprint(weight: str, category: str, title: str = "", origin: str = "CN"):
    # Clean weight string (e.g., "1.2 kg" -> 1.2)
    numeric_weight = float(''.join(c for c in weight if c.isdigit() or c == '.'))

    headers = {"Authorization": f"Bearer {CLIMATIQ_API_KEY}"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Search: find the best matching emission factor by category text
        activity_id = None
        search_resp = await client.get(
            f"{BASE_URL}/search",
            params={
                "query": category,
                "unit_type": "Weight",
                "results_per_page": 1,
                "access_type": "public",
                "data_version": "^21"
            },
            headers=headers
        )
        search_data = search_resp.json()
        results = search_data.get("results", [])
        if results:
            activity_id = results[0]["activity_id"]
        else:
            activity_id = get_fallback_activity_id(category, title)

        print("CLIMATIQ activity_id:", activity_id)

        if not activity_id:
            return {"emissions": 0.0, "water": 0.0, "decomposition": 1}

        # 2. Estimate: calculate CO2e using the matched activity_id + weight
        estimate_resp = await client.post(
            f"{BASE_URL}/estimate",
            json={
                "emission_factor": {"activity_id": activity_id, "data_version": "^32"},
                "parameters": {"weight": numeric_weight, "weight_unit": "kg"}
            },
            headers=headers
        )
        estimate_data = estimate_resp.json()
        print("CLIMATIQ ESTIMATE:", estimate_resp.status_code, estimate_data)

        co2e = estimate_data.get("co2e", 0.0)

        return {
            "emissions": co2e,
            "water": 0.0,
            "decomposition": 100 if "plastic" in category.lower() else 1
        }
