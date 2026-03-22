import json
import cohere
import os

co = cohere.ClientV2(api_key=os.getenv("COHERE_API_KEY"))

SUPPLY_CHAIN_SCHEMA = {
    "type": "object",
    "properties": {
        "company": {"type": "string"},
        "product_path": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "stage": {
                        "type": "string",
                        "enum": [
                            "origin",
                            "manufacturing",
                            "distribution",
                            "destination",
                        ],
                    },
                    "location": {"type": "string"},
                    "mode": {
                        "type": "string",
                        "enum": ["ship", "truck", "rail", "air", "none"],
                    },
                },
                "required": ["stage", "location", "mode"],
            },
        },
    },
    "required": ["company", "product_path"],
}

WATER_SCHEMA = {
    "type": "object",
    "properties": {
        "total_water_liters": {"type": "number"},
        "breakdown": {
            "type": "object",
            "properties": {
                "raw_materials_water": {"type": "number"},
                "manufacturing_process_water": {"type": "number"},
            },
            "required": ["raw_materials_water", "manufacturing_process_water"],
        },
    },
    "required": ["total_water_liters", "breakdown"],
}

MATERIAL_WATER_INTENSITY = {
    "cotton": 10000,
    "leather": 17000,
    "denim": 8000,
    "plastic": 180,
    "steel": 250,
    "aluminum": 1200,
    "paper": 300,
    "semiconductor": 32000,  # Highly water-intensive per kg
    "lithium-ion": 500,
    "glass": 20,
    "default": 150,  # General manufacturing average
}


def get_supply_chain_map(company_name, delivery_city):
    user_input = f"Imagine the user ordered a product from '{company_name}' and it will be delivered to {delivery_city}. Map the 2026 supply chain for this order."

    res = co.chat(
        model="command-a-03-2025",
        messages=[{"role": "assistant", "content": user_input}],
        response_format={"type": "json_object", "schema": SUPPLY_CHAIN_SCHEMA},
        temperature=0,
    )

    return json.loads(res.message.content[0].text)


def estimate_water_usage(
    supply_chain_data, weight_kg, title, description, materials=None
):

    # 1. Ask the model to analyze the product and provide a material breakdown
    # if the 'materials' list is missing or vague.
    prompt = f"""
    Product: {title}
    Description: {description}
    Weight: {weight_kg}kg
    Materials Provided: {materials if materials else "Unknown"}
    Supply Chain: {json.dumps(supply_chain_data)}

    Based on the above, estimate the percentage breakdown of the primary materials used.
    Also, identify if the manufacturing locations are in 'water-stressed' regions.
    """

    res = co.chat(
        model="command-a-03-2025",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object", "schema": WATER_SCHEMA},
    )

    analysis = json.loads(res.message.content[0].text)
    material_breakdown = analysis.get("material_breakdown", {})

    # 2. Calculate Water from Materials (The "Source" Footprint)
    total_material_water = 0
    for mat, percentage in material_breakdown.items():
        intensity = MATERIAL_WATER_INTENSITY.get(
            mat.lower(), MATERIAL_WATER_INTENSITY["default"]
        )
        # (weight * percentage) = kg of that material
        total_material_water += (weight_kg * (percentage / 100)) * intensity

    # 3. Calculate Water from Supply Chain Stages (The "Process" Footprint)
    # Manufacturing and distribution also consume water for cooling, cleaning, and power.
    process_water = 0
    stages = supply_chain_data.get("product_path", [])

    for stage in stages:
        if stage["stage"] == "manufacturing":
            # Manufacturing adds roughly 10-20% on top of raw material water
            base_mfg = total_material_water * 0.15
            # If in a water-stressed region, the "Grey Water" impact is effectively higher
            if analysis.get("is_water_stressed_region"):
                base_mfg *= 1.5
            process_water += base_mfg

        elif stage["mode"] == "ship":
            # Maritime logistics has a small but measurable water footprint (ballast/cleaning)
            process_water += weight_kg * 0.5

    total_estimate = total_material_water + process_water
    print(f"Water Estimate - Material: {total_material_water:.2f}L, Process: {process_water:.2f}L, Total: {total_estimate:.2f}L")

    return {
        "total_water_liters": round(total_estimate, 2),
        "breakdown": {
            "raw_materials_water": round(total_material_water, 2),
            "manufacturing_process_water": round(process_water, 2),
        },
    }
    
def estimate_weight(title, description, company, materials=None):
    prompt = f"""
    Product: {title}
    Description: {description}
    Materials: {materials if materials else "Unknown"}
    Company: {company}

    Based on the above, estimate the weight of the product in kilograms.
    """

    res = co.chat(
        model="command-a-03-2025",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object", "schema": {"type": "object", "properties": {"estimated_weight_kg": {"type": "number"}}, "required": ["estimated_weight_kg"]}},
    )

    analysis = json.loads(res.message.content[0].text)
    return analysis.get("estimated_weight_kg", 0.5)

def estimate_degradation_time(title, description, materials=None):
    prompt = f"""
    Product: {title}
    Description: {description}
    Materials: {materials if materials else "Unknown"}

    Based on the above, estimate the time it would take for this product to degrade in a landfill (in years).
    """

    res = co.chat(
        model="command-a-03-2025",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object", "schema": {"type": "object", "properties": {"estimated_degradation_years": {"type": "number"}}, "required": ["estimated_degradation_years"]}},
    )

    analysis = json.loads(res.message.content[0].text)
    return analysis.get("estimated_degradation_years", 100)
