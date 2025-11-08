from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import datetime

# Import our NASA service
try:
    from services.nasa_api import NasaApiService
    nasa_service = NasaApiService()
except ImportError as e:
    print(f"NASA service import error: {e}")
    # Create a mock service if import fails
    class MockNasaService:
        async def get_earth_imagery(self, lat=None, lon=None, date=None):
            return {
                "source": "MODIS Terra",
                "date": date or datetime.now().strftime('%Y-%m-%d'),
                "resolution": "250m",
                "bands": ["true_color", "vegetation", "temperature"]
            }
        
        async def get_climate_data(self, lat=0, lon=0):
            return {
                "temperature_2m": round(15.2 + random.uniform(-5, 5), 1),
                "precipitation": round(2.1 + random.uniform(-1, 1), 1),
                "surface_pressure": 1013.25,
                "wind_speed_2m": round(3.5 + random.uniform(-2, 2), 1),
                "coordinates": {"lat": lat, "lon": lon},
                "timestamp": datetime.now().isoformat(),
                "source": "NASA POWER API"
            }
        
        async def get_satellite_imagery_metadata(self):
            return {
                "available_satellites": [
                    {
                        "name": "MODIS Terra",
                        "description": "Moderate Resolution Imaging Spectroradiometer on Terra satellite",
                        "resolution": "250m-1km",
                        "bands": ["true_color", "false_color", "vegetation", "temperature"],
                        "update_frequency": "daily"
                    },
                    {
                        "name": "MODIS Aqua", 
                        "description": "Moderate Resolution Imaging Spectroradiometer on Aqua satellite",
                        "resolution": "250m-1km",
                        "bands": ["true_color", "chlorophyll", "sea_surface_temp"],
                        "update_frequency": "daily"
                    },
                    {
                        "name": "VIIRS",
                        "description": "Visible Infrared Imaging Radiometer Suite",
                        "resolution": "375m-750m", 
                        "bands": ["true_color", "night_lights", "cloud_cover"],
                        "update_frequency": "daily"
                    }
                ],
                "last_updated": datetime.now().isoformat()
            }
    
    nasa_service = MockNasaService()

app = FastAPI(title="GaiaNet API", version="1.0.0")

# CORS middleware - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to GaiaNet API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/environment/data")
async def get_environment_data():
    # Simulate real environmental data with realistic values
    return {
        "temperature": {
            "value": round(15.2 + random.uniform(-0.5, 0.5), 1),
            "trend": "up",
            "change": "+1.2°C"
        },
        "co2": {
            "value": 417 + random.randint(-2, 2),
            "trend": "up", 
            "change": 52
        },
        "seaLevel": {
            "value": round(3.2 + random.uniform(-0.2, 0.2), 1),
            "trend": "up",
            "change": "+0.8mm"
        },
        "forestCover": {
            "value": round(31.2 + random.uniform(-0.5, 0.5), 1),
            "trend": "down", 
            "change": "-2.1%"
        },
        "biodiversity": {
            "value": round(24.7 + random.uniform(-1, 1), 1),
            "trend": "up",
            "change": "+1.5%"
        },
        "iceCover": {
            "value": round(12.8 + random.uniform(-1, 1), 1),
            "trend": "down",
            "change": "-3.2%"
        },
        "airQuality": {
            "value": 85 + random.randint(-5, 5),
            "trend": "down",
            "change": "+5%"
        }
    }

# NEW NASA ENDPOINTS
@app.get("/api/nasa/imagery")
async def get_nasa_imagery(lat: float = None, lon: float = None, date: str = None):
    """Get NASA satellite imagery data"""
    try:
        imagery_data = await nasa_service.get_earth_imagery(lat, lon, date)
        return {
            "status": "success",
            "data": imagery_data,
            "message": "Satellite imagery data retrieved",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to retrieve imagery: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/nasa/climate")
async def get_nasa_climate(lat: float = 0, lon: float = 0):
    """Get NASA climate data for specific coordinates"""
    try:
        climate_data = await nasa_service.get_climate_data(lat, lon)
        return {
            "status": "success",
            "data": climate_data,
            "message": "Climate data retrieved",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to retrieve climate data: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/nasa/satellites")
async def get_satellite_metadata():
    """Get metadata about available satellites"""
    try:
        metadata = await nasa_service.get_satellite_imagery_metadata()
        return {
            "status": "success",
            "data": metadata,
            "message": "Satellite metadata retrieved",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to retrieve satellite metadata: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }