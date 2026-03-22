import httpx
import re
from app.core.config import RAINFOREST_API_KEY

_cache: dict = {}

def _extract_asin(url: str) -> str | None:
    match = re.search(r"/dp/([A-Z0-9]{10})", url)
    return match.group(1) if match else None

async def get_product_data(amazon_url: str):
    asin = _extract_asin(amazon_url)
    # if asin and asin in _cache:
    #     print(f"RAINFOREST cache hit: {asin}")
    #     return _cache[asin]

    params = {"api_key": RAINFOREST_API_KEY, "type": "product", "url": amazon_url}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            "https://api.rainforestapi.com/request", params=params
        )
        data = response.json()

        print(f"RAINFOREST STATUS: {response.status_code}")
        print(f"RAINFOREST KEYS: {list(data.keys())}")
        if "request_info" in data:
            print(f"RAINFOREST REQUEST_INFO: {data['request_info']}")
        product = data.get("product", {})

        specs = product.get("specifications", [])

        weight_info = next(
            (spec for spec in specs if "weight" in spec.get("name", "").lower()),
            None,
        )

        material_info = next(
            (spec for spec in specs if "material" in spec.get("name", "").lower()),
            None,
        )

        climate_pledge = data.get("climate_pledge_friendly")

        result = {
            "title": product.get("title", "Unknown Product"),
            "brand": product.get("brand", "Generic"),
            "price": (product.get("buybox_winner") or {}).get("price", {}).get("value") or
                     (product.get("price") or {}).get("value") or 0.0,
            "weight": weight_info["value"] if weight_info else "0.5kg",
            "category": product.get("categories", [{}])[-1].get("name", "Consumer Goods"),
            "image_url": product.get("main_image", {}).get("link"),
            "asin": product.get("asin"),
            "climate_pledge_friendly": climate_pledge is not None,
            "description": product.get("feature_bullets_flat") or "",
            "materials": product.get("material") or (material_info["value"] if material_info else "") or "",
        }

        # Only cache if we got a real product title
        if asin and result["title"] != "Unknown Product":
            _cache[asin] = result

        return result
