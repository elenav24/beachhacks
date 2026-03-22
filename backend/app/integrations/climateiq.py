import httpx
from app.core.config import CLIMATIQ_API_KEY
from app.integrations.category_fallbacks import get_fallback_activity_id, DEFAULT_ACTIVITY_ID

BASE_URL = "https://api.climatiq.io/data/v1"

async def calculate_footprint(weight: str, category: str, title: str = "", origin: str = "CN"):
    # Clean and normalize weight to kg
    numeric_weight = float(''.join(c for c in weight if c.isdigit() or c == '.') or '0.5')
    if "ounce" in weight.lower() or " oz" in weight.lower():
        numeric_weight = numeric_weight * 0.0283495
    elif "pound" in weight.lower() or " lb" in weight.lower():
        numeric_weight = numeric_weight * 0.453592
    # default assumed kg if no unit matched

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

        # 2. Estimate: calculate CO2e using the matched activity_id + weight
        for attempt_id in ([activity_id] if activity_id != DEFAULT_ACTIVITY_ID else []) + [DEFAULT_ACTIVITY_ID]:
            estimate_resp = await client.post(
                f"{BASE_URL}/estimate",
                json={
                    "emission_factor": {"activity_id": attempt_id, "data_version": "^32"},
                    "parameters": {"weight": numeric_weight, "weight_unit": "kg"}
                },
                headers=headers
            )
            estimate_data = estimate_resp.json()
            print("CLIMATIQ ESTIMATE:", estimate_resp.status_code, attempt_id, estimate_data.get("error_code"))
            if estimate_resp.status_code == 200:
                break

        co2e = estimate_data.get("co2e", 0.0)
        ef = estimate_data.get("emission_factor", {})

        return {
            "emissions": co2e,
            "water": 0.0,
            "decomposition": 100 if "plastic" in category.lower() else 1,
            "emission_factor_name": ef.get("name"),
            "emission_factor_region": ef.get("region"),
            "emission_lca_stage": ef.get("source_lca_activity"),
        }
