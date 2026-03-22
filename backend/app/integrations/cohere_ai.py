import json
import cohere
import os

co = cohere.ClientV2(api_key=os.getenv("COHERE_API_KEY"))

# 1. Define the schema once outside the function
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
    """
    Fetches the supply chain journey as a raw JSON object for receipt formatting.
    """
    # 2. Format the user input dynamically
    user_input = f"Imagine the user ordered a product from '{company_name}' and it will be delivered to {delivery_city}. Map the 2026 supply chain for this order."
    
    # 3. Direct Chat call with strict formatting
    res = co.chat(
        model="command-a-03-2025",
        messages=[{"role": "assistant", "content": user_input}],
        response_format={
            "type": "json_object",
            "schema": SUPPLY_CHAIN_SCHEMA
        },
        temperature=0
    )
    
    # 4. Return as a Python Dictionary (parsed from the raw text)
    return json.loads(res.message.content[0].text)

# --- Example Usage ---
# receipt_data = get_supply_chain_map("H&M", "Torrance, CA")
# print(f"Distance: {receipt_data['totals']['distance_km']} km")