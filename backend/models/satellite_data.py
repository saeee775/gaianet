from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class SatelliteImagery(BaseModel):
    source: str
    date: str
    resolution: str
    bands: List[str]
    image_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ClimateData(BaseModel):
    temperature_2m: float
    precipitation: float
    surface_pressure: float
    wind_speed_2m: float
    coordinates: Optional[Dict[str, float]] = None
    timestamp: str
    source: str

class SatelliteMetadata(BaseModel):
    name: str
    description: str
    resolution: str
    bands: List[str]
    update_frequency: str

class NasaApiResponse(BaseModel):
    status: str
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    timestamp: str