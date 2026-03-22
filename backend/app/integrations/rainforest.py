import httpx
from app.core.config import RAINFOREST_API_KEY


async def get_product_data(amazon_url: str):
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

        return {
            "title": product.get("title", "Unknown Product"),
            "brand": product.get("brand", "Generic"),
            "price": product.get("buybox_winner", {}).get("price", {}).get("value", 0),
            "weight": (
                weight_info["value"] if weight_info else "0.5kg"
            ),  # Default fallback
            "category": product.get("categories", [{}])[-1].get(
                "name", "Consumer Goods"
            ),
        }
