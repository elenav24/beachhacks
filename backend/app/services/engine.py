import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.integrations import rainforest, climateiq, wikirate
from app.models.receipt import EnvironmentalReceipt

_executor = ThreadPoolExecutor()


async def _run_sync(fn, *args):
    """Run a blocking (sync) function in a thread pool, returning None on failure."""
    loop = asyncio.get_event_loop()
    try:
        return await loop.run_in_executor(_executor, fn, *args)
    except Exception as e:
        print(f"WIKIRATE ERROR ({fn.__name__}):", e)
        return None


async def generate_environmental_analysis(amazon_url: str) -> EnvironmentalReceipt:
    # 1. Get product data from Rainforest
    product = await rainforest.get_product_data(amazon_url)
    print("PRODUCT CATEGORY:", product["category"], "WEIGHT:", product["weight"])

    # 2. Run Climatiq + WikiRate in parallel (wikirate is sync so runs in thread pool)
    impact, labor, climate_transparency = await asyncio.gather(
        climateiq.calculate_footprint(
            weight=product["weight"],
            category=product["category"],
            title=product["title"],
        ),
        _run_sync(wikirate.get_labor_score, "Amazon"),
        _run_sync(wikirate.get_climate_transparency_data, product["brand"]),
    )

    # labor is a list of (label, score) tuples; last entry is the total
    ethics_score = labor[-1][1] if labor else None
    ethics_breakdown = [{"label": l, "score": s} for l, s in labor[:-1]] if labor else None

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
        decomposition_time_years=impact["decomposition"],
        ethics_score=ethics_score,
        ethics_breakdown=ethics_breakdown,
        climate_decarbonization_score=climate_transparency.get("decarbonization") if climate_transparency else None,
        climate_energy_score=climate_transparency.get("energy") if climate_transparency else None,
        climate_traceability_score=climate_transparency.get("traceability") if climate_transparency else None,
        climate_accountability_score=climate_transparency.get("accountability") if climate_transparency else None,
        water=0.0,
        environmental_grade="N/A",
        overall_score=0.0,
    )
