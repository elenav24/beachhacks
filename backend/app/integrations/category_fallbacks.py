# Maps keyword fragments (matched against category + title) to Climatiq activity IDs.
# Keywords are checked in order — put more specific terms before generic ones.
# All IDs use data_version ^32 on the free Climatiq plan.

KEYWORD_TO_ACTIVITY_ID: list[tuple[str, str]] = [
    # --- Kitchen & Cookware --- (must come before clothing to avoid "wear" in "cookware")
    ("saucepan", "metal_products-type_metal_product_manufacturing"),
    ("cookware", "metal_products-type_metal_product_manufacturing"),
    ("frying pan", "metal_products-type_metal_product_manufacturing"),
    ("skillet", "metal_products-type_metal_product_manufacturing"),
    ("wok", "metal_products-type_metal_product_manufacturing"),
    ("baking", "metal_products-type_metal_product_manufacturing"),
    ("pan", "metal_products-type_metal_product_manufacturing"),
    ("pot", "metal_products-type_metal_product_manufacturing"),
    ("knife", "metal_products-type_metal_product_manufacturing"),
    ("cutlery", "metal_products-type_metal_product_manufacturing"),
    ("utensil", "metal_products-type_metal_product_manufacturing"),
    ("blender", "consumer_goods-type_electrical_equipment"),
    ("microwave", "consumer_goods-type_electrical_equipment"),
    ("toaster", "consumer_goods-type_electrical_equipment"),
    ("coffee maker", "consumer_goods-type_electrical_equipment"),
    ("kettle", "consumer_goods-type_electrical_equipment"),
    ("appliance", "consumer_goods-type_electrical_equipment"),
    ("vacuum", "consumer_goods-type_electrical_equipment"),
    ("iron", "metal_products-type_metal_product_manufacturing"),

    # --- Clothing & Apparel ---
    ("t-shirt", "consumer_goods-type_cotton_t_shirt"),
    ("tshirt", "consumer_goods-type_cotton_t_shirt"),
    ("tee", "consumer_goods-type_cotton_t_shirt"),
    ("shirt", "consumer_goods-type_cotton_t_shirt"),
    ("sweater", "consumer_goods-type_cotton_t_shirt"),
    ("hoodie", "consumer_goods-type_cotton_t_shirt"),
    ("sweatshirt", "consumer_goods-type_cotton_t_shirt"),
    ("jacket", "consumer_goods-type_cotton_t_shirt"),
    ("coat", "consumer_goods-type_cotton_t_shirt"),
    ("pants", "consumer_goods-type_cotton_t_shirt"),
    ("jeans", "consumer_goods-type_cotton_t_shirt"),
    ("shorts", "consumer_goods-type_cotton_t_shirt"),
    ("dress", "consumer_goods-type_cotton_t_shirt"),
    ("skirt", "consumer_goods-type_cotton_t_shirt"),
    ("blouse", "consumer_goods-type_cotton_t_shirt"),
    ("legging", "consumer_goods-type_cotton_t_shirt"),
    ("sock", "consumer_goods-type_cotton_t_shirt"),
    ("underwear", "consumer_goods-type_cotton_t_shirt"),
    ("bra", "consumer_goods-type_cotton_t_shirt"),
    ("swimsuit", "consumer_goods-type_cotton_t_shirt"),
    ("bikini", "consumer_goods-type_cotton_t_shirt"),
    ("pajama", "consumer_goods-type_cotton_t_shirt"),
    ("robe", "consumer_goods-type_cotton_t_shirt"),
    ("vest", "consumer_goods-type_cotton_t_shirt"),
    ("cardigan", "consumer_goods-type_cotton_t_shirt"),
    ("pullover", "consumer_goods-type_cotton_t_shirt"),
    ("jumper", "consumer_goods-type_cotton_t_shirt"),
    ("apparel", "consumer_goods-type_cotton_t_shirt"),
    ("clothing", "consumer_goods-type_cotton_t_shirt"),
    ("garment", "consumer_goods-type_cotton_t_shirt"),
    ("fashion", "consumer_goods-type_cotton_t_shirt"),
    ("sportswear", "consumer_goods-type_cotton_t_shirt"),
    ("activewear", "consumer_goods-type_cotton_t_shirt"),
    ("wear", "consumer_goods-type_cotton_t_shirt"),
    ("outfit", "consumer_goods-type_cotton_t_shirt"),
    ("uniform", "consumer_goods-type_cotton_t_shirt"),
]

DEFAULT_ACTIVITY_ID = "consumer_goods-type_cotton_t_shirt"


def get_fallback_activity_id(category: str, title: str = "") -> str:
    text = (category + " " + title).lower()
    for keyword, activity_id in KEYWORD_TO_ACTIVITY_ID:
        if keyword in text:
            return activity_id
    return DEFAULT_ACTIVITY_ID
