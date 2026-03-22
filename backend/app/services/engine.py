from app.integrations import rainforest, climateiq  # , wikirate, cohere_ai
from app.models.receipt import EnvironmentalReceipt

async def generate_environmental_analysis(amazon_url: str) -> EnvironmentalReceipt:
    # 1. Identity: Get product weight and category
    product = await rainforest.get_product_data(amazon_url)
    
    # 2. Ethical: Check WikiRate for brand transparency
    # ethics = await wikirate.get_brand_transparency(product["brand"])
    
    # 3. Research: Use Cohere + Tavily if data is missing or for supply chain stops
    # ai_research = await cohere_ai.research_supply_chain(product["brand"], product["title"])
    
    # 4. Math: Send weight + material + AI-found location to Climatiq
    print("PRODUCT CATEGORY:", product["category"], "WEIGHT:", product["weight"])
    impact = await climateiq.calculate_footprint(
        weight=product["weight"],
        category=product["category"],
        title=product["title"],
        # origin=ai_research.predicted_origin
    )
    
    return EnvironmentalReceipt(
        product_name=product["title"],
        brand=product["brand"],
        price=product["price"],
        image_url=product.get("image_url"),
        asin=product.get("asin"),
        climate_pledge_friendly=product.get("climate_pledge_friendly", False),
        emissions=impact["emissions"],
        emission_factor_name=impact.get("emission_factor_name"),
        emission_factor_region=impact.get("emission_factor_region"),
        emission_lca_stage=impact.get("emission_lca_stage"),
        water=0.0,
        ethics=0.0,
        environmental_grade="N/A",
        overall_score=0.0,
        decomposition_time_years=impact["decomposition"]
    )