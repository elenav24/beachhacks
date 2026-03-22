import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.integrations import rainforest, climateiq, wikirate, cohere_ai
from app.integrations.geocoding import geocode_location
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


def _compute_grade(
    emissions: float, water: float, ethics_score: float | None, decomposition: int
) -> tuple[str, float]:
    """Return (letter_grade, 0-100 score). Higher score = better."""
    # Normalize each dimension to 0-100 penalty (lower = better)
    co2_penalty = min(100, (emissions / 50) * 100)  # 50 kg CO2 = max penalty
    water_penalty = min(100, (water / 5000) * 100)  # 5000 L = max penalty
    ethics_penalty = 100 - (ethics_score or 50)  # invert: low ethics = high penalty
    decomp_penalty = min(100, (decomposition / 500) * 100)  # 500 yrs = max penalty

    overall_penalty = (
        co2_penalty + water_penalty + ethics_penalty + decomp_penalty
    ) / 4
    score = round(100 - overall_penalty, 1)

    if overall_penalty < 20:
        grade = "A+"
    elif overall_penalty < 35:
        grade = "A"
    elif overall_penalty < 50:
        grade = "B"
    elif overall_penalty < 65:
        grade = "C"
    elif overall_penalty < 80:
        grade = "D"
    else:
        grade = "F"

    return grade, score


async def generate_manual_analysis(
    brand: str,
    title: str,
    description: str,
    materials: str,
    price: float,
    delivery_city: str = "Long Beach, CA",
) -> EnvironmentalReceipt:

    # Estimate weight from materials hint or default
    weight = cohere_ai.estimate_weight(title, description, materials)
    print(f"Estimated weight: {weight} kg")

    impact, labor = await asyncio.gather(
        climateiq.calculate_footprint(
            weight=weight, description=description, title=title
        ),
        _run_sync(
            wikirate.get_wikirate_report, brand
        ),  # uses both labor and climate data
    )

    ethics_score = labor["scores"][0].get("Labor Ethics") if labor else None

    emissions = impact["emissions"]
    decomposition = cohere_ai.estimate_degredation_time(title, description, materials)
    supply_chain = cohere_ai.get_supply_chain_map(brand, delivery_city)
    water = cohere_ai.estimate_water_usage(
        supply_chain, weight, title, description, materials
    )
    grade, overall_score = _compute_grade(
        emissions, water["total_water_liters"], ethics_score, decomposition
    )

    # Geocode the emission factor region to get origin coordinates
    region = impact.get("emission_factor_region")
    origin_coords = await _run_sync(geocode_location, region) if region else None
    origin_lat = origin_coords[0] if origin_coords else None
    origin_lng = origin_coords[1] if origin_coords else None

    return EnvironmentalReceipt(
        product_name=title,
        brand=brand,
        price=price,
        climate_pledge_friendly=False,
        emissions=emissions,
        emission_factor_name=impact.get("emission_factor_name"),
        emission_factor_region=region,
        emission_lca_stage=impact.get("emission_lca_stage"),
        decomposition_time_years=decomposition,
        origin_lat=origin_lat,
        origin_lng=origin_lng,
        ethics_score=ethics_score,
        warnings=labor["warnings"] if labor else None,
        water=water["total_water_liters"],
        water_breakdown=water["breakdown"],
        environmental_grade=grade,
        overall_score=overall_score,
    )


async def generate_environmental_analysis(
    amazon_url: str, delivery_city: str = "Long Beach, CA"
) -> EnvironmentalReceipt:
    # 1. Get product data from Rainforest
    product = await rainforest.get_product_data(amazon_url)
    weight = str(product["weight"])
    print(f"Estimated weight: {weight}")
    # convert weight to kg
    numeric_weight = float("".join(c for c in weight if c.isdigit() or c == ".") or 0.5)
    if "ounce" in weight.lower() or " oz" in weight.lower():
        numeric_weight = numeric_weight * 0.0283495
    elif "pound" in weight.lower() or " lb" in weight.lower():
        numeric_weight = numeric_weight * 0.453592
    elif (
        "g" in weight.lower() or "gram" in weight.lower() and "kg" not in weight.lower()
    ):
        numeric_weight = numeric_weight / 1000

    # 2. Run Climatiq + WikiRate in parallel (wikirate is sync so runs in thread pool)
    impact, labor = await asyncio.gather(
        climateiq.calculate_footprint(
            weight=numeric_weight,
            description=product["description"],
            title=product["title"],
        ),
        _run_sync(
            wikirate.get_wikirate_report, product["brand"]
        ),  # uses both labor and climate data
    )

    ethics_score = labor["scores"][0].get("Labor Ethics") if labor else None

    emissions = impact["emissions"]
    decomposition = cohere_ai.estimate_degradation_time(
        product["title"], product["description"], product["materials"]
    )
    supply_chain = cohere_ai.get_supply_chain_map(product["brand"], delivery_city)
    water = cohere_ai.estimate_water_usage(
        supply_chain,
        numeric_weight,
        product["title"],
        product["description"],
        product["materials"],
    )
    grade, overall_score = _compute_grade(
        emissions, water["total_water_liters"], ethics_score, decomposition
    )

    # Geocode the emission factor region to get origin coordinates
    region = impact.get("emission_factor_region")
    origin_coords = await _run_sync(geocode_location, region) if region else None
    origin_lat = origin_coords[0] if origin_coords else None
    origin_lng = origin_coords[1] if origin_coords else None

    return EnvironmentalReceipt(
        product_name=product["title"],
        brand=product["brand"],
        price=product["price"],
        image_url=product.get("image_url"),
        asin=product.get("asin"),
        climate_pledge_friendly=product.get("climate_pledge_friendly", False),
        emissions=emissions,
        emission_factor_name=impact.get("emission_factor_name"),
        emission_factor_region=region,
        emission_lca_stage=impact.get("emission_lca_stage"),
        decomposition_time_years=decomposition,
        origin_lat=origin_lat,
        origin_lng=origin_lng,
        ethics_score=ethics_score,
        warnings=labor["warnings"] if labor else None,
        water=water["total_water_liters"],
        water_breakdown=water["breakdown"],
        environmental_grade=grade,
        overall_score=overall_score,
    )
