import httpx
from functools import lru_cache

# ISO 3166-1 alpha-2 → country name for region codes returned by Climatiq
_REGION_TO_COUNTRY: dict[str, str] = {
    "CN": "China",
    "US": "United States",
    "IN": "India",
    "DE": "Germany",
    "GB": "United Kingdom",
    "FR": "France",
    "JP": "Japan",
    "KR": "South Korea",
    "VN": "Vietnam",
    "BD": "Bangladesh",
    "PK": "Pakistan",
    "TR": "Turkey",
    "IT": "Italy",
    "MX": "Mexico",
    "BR": "Brazil",
    "AU": "Australia",
    "CA": "Canada",
    "ZA": "South Africa",
    "NG": "Nigeria",
    "EG": "Egypt",
}


def _extract_city(query: str) -> str:
    """
    Open-Meteo /v1/search only accepts a city name, not 'City, Country'.
    Strip everything after the first comma so 'Shenzhen, China' → 'Shenzhen'.
    Also expand bare ISO-2 codes to country names.
    """
    expanded = _REGION_TO_COUNTRY.get(query.strip().upper(), query)
    # Take only the part before the first comma (city name)
    return expanded.split(",")[0].strip()


@lru_cache(maxsize=256)
def geocode_location(query: str) -> tuple[float, float] | None:
    """
    Geocode a place name, 'City, Country' string, or ISO country code to (lat, lng).
    Uses Open-Meteo geocoding API — no SSL cert issues on macOS.
    Returns None if the location cannot be resolved.
    """
    city = _extract_city(query)
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(
                "https://geocoding-api.open-meteo.com/v1/search",
                params={"name": city, "count": 1, "language": "en", "format": "json"},
            )
            data = resp.json()
            results = data.get("results", [])
            if results:
                print(f"GEOCODING OK: '{query}' → '{city}' → ({results[0]['latitude']}, {results[0]['longitude']})")
                return (results[0]["latitude"], results[0]["longitude"])
            print(f"GEOCODING: no results for '{query}' (searched '{city}')")
    except Exception as e:
        print(f"GEOCODING ERROR for '{query}': {e}")
    return None
