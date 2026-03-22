import httpx
from functools import lru_cache

# ISO 3166-1 alpha-2 → approximate country centroid coordinates
# Used directly to avoid Open-Meteo returning wrong "Turkey, NC" etc.
_REGION_TO_COORDS: dict[str, tuple[float, float]] = {
    "CN": (35.8617, 104.1954),
    "US": (37.0902, -95.7129),
    "IN": (20.5937, 78.9629),
    "DE": (51.1657, 10.4515),
    "GB": (55.3781, -3.4360),
    "FR": (46.2276, 2.2137),
    "JP": (36.2048, 138.2529),
    "KR": (35.9078, 127.7669),
    "VN": (14.0583, 108.2772),
    "BD": (23.6850, 90.3563),
    "PK": (30.3753, 69.3451),
    "TR": (38.9637, 35.2433),
    "IT": (41.8719, 12.5674),
    "MX": (23.6345, -102.5528),
    "BR": (-14.2350, -51.9253),
    "AU": (-25.2744, 133.7751),
    "CA": (56.1304, -106.3468),
    "ZA": (-30.5595, 22.9375),
    "NG": (9.0820, 8.6753),
    "EG": (26.8206, 30.8025),
}


def _extract_city(query: str) -> str:
    """
    Open-Meteo /v1/search only accepts a city name, not 'City, Country'.
    Strip everything after the first comma so 'Shenzhen, China' → 'Shenzhen'.
    """
    return query.split(",")[0].strip()


@lru_cache(maxsize=256)
def geocode_location(query: str) -> tuple[float, float] | None:
    """
    Geocode a place name, 'City, Country' string, or ISO country code to (lat, lng).
    Uses hardcoded centroids for bare ISO-2 country codes, then falls back to
    Open-Meteo geocoding API for city names.
    Returns None if the location cannot be resolved.
    """
    # Fast path: bare ISO-2 country code → use hardcoded centroid
    upper = query.strip().upper()
    if upper in _REGION_TO_COORDS:
        coords = _REGION_TO_COORDS[upper]
        print(f"GEOCODING OK: '{query}' → centroid → {coords}")
        return coords

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
