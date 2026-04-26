# utils/distance.py
import math

def calculate_distance_km(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat/2) ** 2 +
        math.cos(math.radians(lat1)) *
        math.cos(math.radians(lat2)) *
        math.sin(dlon/2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def calculate_delivery_fee(restaurant, distance):
    return float(restaurant.base_delivery_fee) + (
        float(distance) * float(restaurant.price_per_km)
    )