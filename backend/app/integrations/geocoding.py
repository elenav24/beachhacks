from geopy.geocoders import Nominatim
from geopy.exc import GeocoderServiceError
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

_geolocator = Nominatim(user_agent="ecoscore_app")


@lru_cache(maxsize=256)
def geocode_location(query: str) -> tuple[float, float] | None:
    """
    Geocode a place name or ISO country code to (lat, lng).
    Returns None if the location cannot be resolved.
    """
    # Expand ISO region codes to full country names for better results
    resolved = _REGION_TO_COUNTRY.get(query.upper(), query)
    try:
        location = _geolocator.geocode(resolved, timeout=10)
        if location:
            return (location.latitude, location.longitude)
    except GeocoderServiceError as e:
        print(f"GEOCODING ERROR for '{query}': {e}")
    return None
