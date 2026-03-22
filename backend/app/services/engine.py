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


def _compute_grade(emissions: float, water: float, ethics_score: float | None, decomposition: int) -> tuple[str, float]:
    """Return (letter_grade, 0-100 score). Higher score = better."""
    # Normalize each dimension to 0-100 penalty (lower = better)
    co2_penalty  = min(100, (emissions / 50) * 100)       # 50 kg CO2 = max penalty
    water_penalty = min(100, (water / 5000) * 100)         # 5000 L = max penalty
    ethics_penalty = (100 - (ethics_score or 50))          # invert: low ethics = high penalty
    decomp_penalty = min(100, (decomposition / 500) * 100) # 500 yrs = max penalty

    overall_penalty = (co2_penalty + water_penalty + ethics_penalty + decomp_penalty) / 4
    score = round(100 - overall_penalty, 1)

    if overall_penalty < 20:   grade = "A+"
    elif overall_penalty < 35: grade = "A"
    elif overall_penalty < 50: grade = "B"
    elif overall_penalty < 65: grade = "C"
    elif overall_penalty < 80: grade = "D"
    else:                      grade = "F"

    return grade, score


def _estimate_water(emissions: float, category: str) -> float:
    """Rough water footprint estimate based on CO2 and category."""
    category_lower = category.lower()
    if any(k in category_lower for k in ("shirt", "cloth", "apparel", "cotton", "wear", "fashion")):
        return round(emissions * 200, 1)   # textiles are water-intensive
    if any(k in category_lower for k in ("electronic", "phone", "laptop", "computer")):
        return round(emissions * 20, 1)
    if any(k in category_lower for k in ("leather", "shoe", "boot")):
        return round(emissions * 150, 1)
    return round(emissions * 50, 1)        # generic fallback


async def generate_manual_analysis(
    brand: str,
    title: str,
    description: str,
    materials: str,
    price: float,
) -> EnvironmentalReceipt:
    # Derive a rough category from title + description + materials
    combined = f"{title} {description} {materials}".lower()
    if any(k in combined for k in ("cotton", "shirt", "apparel", "wear", "cloth", "fashion", "polyester", "wool")):
        category = "Clothing"
    elif any(k in combined for k in ("phone", "laptop", "computer", "electronic", "tablet")):
        category = "Electronics"
    elif any(k in combined for k in ("leather", "shoe", "boot", "sneaker")):
        category = "Footwear"
    else:
        category = "General"

    # Estimate weight from materials hint or default
    weight = "0.5 kg"

    impact, labor, climate_transparency = await asyncio.gather(
        climateiq.calculate_footprint(weight=weight, category=category, title=title),
        _run_sync(wikirate.get_labor_score, brand or "Unknown"),
        _run_sync(wikirate.get_climate_transparency_data, brand or "Unknown"),
    )

    ethics_score = labor[-1][1] if labor else None
    ethics_breakdown = [{"label": l, "score": s} for l, s in labor[:-1]] if labor else None

    emissions = impact["emissions"]
    decomposition = impact["decomposition"]
    water = _estimate_water(emissions, category)
    grade, overall_score = _compute_grade(emissions, water, ethics_score, decomposition)

    return EnvironmentalReceipt(
        product_name=title,
        brand=brand,
        price=price,
        climate_pledge_friendly=False,
        emissions=emissions,
        emission_factor_name=impact.get("emission_factor_name"),
        emission_factor_region=impact.get("emission_factor_region"),
        emission_lca_stage=impact.get("emission_lca_stage"),
        decomposition_time_years=decomposition,
        ethics_score=ethics_score,
        ethics_breakdown=ethics_breakdown,
        climate_decarbonization_score=climate_transparency.get("decarbonization") if climate_transparency else None,
        climate_energy_score=climate_transparency.get("energy") if climate_transparency else None,
        climate_traceability_score=climate_transparency.get("traceability") if climate_transparency else None,
        climate_accountability_score=climate_transparency.get("accountability") if climate_transparency else None,
        water=water,
        environmental_grade=grade,
        overall_score=overall_score,
    )


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

    emissions = impact["emissions"]
    decomposition = impact["decomposition"]
    water = _estimate_water(emissions, product["category"])
    grade, overall_score = _compute_grade(emissions, water, ethics_score, decomposition)

    return EnvironmentalReceipt(
        product_name=product["title"],
        brand=product["brand"],
        price=product["price"],
        image_url=product.get("image_url"),
        asin=product.get("asin"),
        climate_pledge_friendly=product.get("climate_pledge_friendly", False),
        emissions=emissions,
        emission_factor_name=impact.get("emission_factor_name"),
        emission_factor_region=impact.get("emission_factor_region"),
        emission_lca_stage=impact.get("emission_lca_stage"),
        decomposition_time_years=decomposition,
        ethics_score=ethics_score,
        ethics_breakdown=ethics_breakdown,
        climate_decarbonization_score=climate_transparency.get("decarbonization") if climate_transparency else None,
        climate_energy_score=climate_transparency.get("energy") if climate_transparency else None,
        climate_traceability_score=climate_transparency.get("traceability") if climate_transparency else None,
        climate_accountability_score=climate_transparency.get("accountability") if climate_transparency else None,
        water=water,
        environmental_grade=grade,
        overall_score=overall_score,
    )
