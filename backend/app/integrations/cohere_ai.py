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
                    "stage": {"type": "string", "enum": ["origin", "manufacturing", "distribution", "destination"]},
                    "location": {"type": "string"},
                    "mode": {"type": "string", "enum": ["ship", "truck", "rail", "air", "none"]},
                },
                "required": ["stage", "location", "mode"]
            }
        }
        },
    "required": ["company", "product_path"]
}

def get_supply_chain_map(company_name, delivery_city):
    user_input = f"Imagine the user ordered a product from '{company_name}' and it will be delivered to {delivery_city}. Map the 2026 supply chain for this order."

    res = co.chat(
        model="command-a-03-2025",
        messages=[{"role": "assistant", "content": user_input}],
        response_format={
            "type": "json_object",
            "schema": SUPPLY_CHAIN_SCHEMA
        },
        temperature=0
    )

    return json.loads(res.message.content[0].text)