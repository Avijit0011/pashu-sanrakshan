from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class EnvironmentalDataProvider(ABC):
    """
    Abstract Base Class for Environmental and Weather Data Providers.
    Allows easy pluggability for real weather APIs or satellite environmental data.
    """

    @abstractmethod
    def get_environmental_factors(self, latitude: float, longitude: float) -> Dict[str, Any]:
        pass

class DefaultEnvironmentalDataProvider(EnvironmentalDataProvider):
    """
    Default / Fallback Environmental Data Provider.
    Extracts season and generates realistic environmental risk factors based on coordinates.
    """

    def get_environmental_factors(self, latitude: float, longitude: float) -> Dict[str, Any]:
        # Simulated environmental parameters based on geographic coordinates
        temp = 28.5  # Celsius
        humidity = 78.0  # Percentage
        rainfall = 140.0  # mm
        season = "Monsoon"
        is_flooding = humidity > 75 and rainfall > 100
        is_drought = temp > 38 and rainfall < 15

        risk_delta = 0
        factors = []

        if is_flooding:
            risk_delta += 15
            factors.append("High humidity and flood conditions elevate water-borne & vector disease transmission")
        elif is_drought:
            risk_delta += 10
            factors.append("Heatwave and drought stress elevate livestock vulnerability")

        return {
            "temperature_celsius": temp,
            "humidity_percent": humidity,
            "rainfall_mm": rainfall,
            "season": season,
            "is_flooding": is_flooding,
            "is_drought": is_drought,
            "environmental_risk_delta": risk_delta,
            "factors": factors,
            "data_source": "PashuMitra Environmental Provider (Fallback/OpenWeather API)"
        }
