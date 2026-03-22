import httpx
import re
from app.core.config import RAINFOREST_API_KEY

_cache: dict = {}

def _extract_asin(url: str) -> str | None:
    match = re.search(r"/dp/([A-Z0-9]{10})", url)
    return match.group(1) if match else None

async def get_product_data(amazon_url: str):
    asin = _extract_asin(amazon_url)
    if asin and asin in _cache:
        print(f"RAINFOREST cache hit: {asin}")
        return _cache[asin]

    params = {"api_key": RAINFOREST_API_KEY, "type": "product", "url": amazon_url}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            "https://api.rainforestapi.com/request", params=params
        )
        data = response.json()

        product = data.get("product", {})

        # We need Weight and Category for Climatiq
        # Note: Rainforest often puts weight in 'specifications'
        weight_info = next(
            (
                spec
                for spec in product.get("specifications", [])
                if "weight" in spec["name"].lower()
            ),
            None,
        )

        climate_pledge = data.get("climate_pledge_friendly")

        result = {
            "title": product.get("title", "Unknown Product"),
            "brand": product.get("brand", "Generic"),
            "price": product.get("buybox_winner", {}).get("price", {}).get("value", 0),
            "weight": weight_info["value"] if weight_info else "0.5kg",
            "category": product.get("categories", [{}])[-1].get("name", "Consumer Goods"),
            "image_url": product.get("main_image", {}).get("link"),
            "asin": product.get("asin"),
            "climate_pledge_friendly": climate_pledge is not None,
        }

        if asin:
            _cache[asin] = result

        return result
