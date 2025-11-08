import random
from datetime import datetime, timedelta

class NasaApiService:
    def __init__(self):
        pass
    
    async def get_earth_imagery(self, lat=None, lon=None, date=None):
        """Get Earth imagery data - mock implementation"""
        if not date:
            date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            
        return {
            "source": "MODIS Terra",
            "date": date,
            "resolution": "250m",
            "bands": ["true_color", "vegetation", "temperature"],
            "image_url": f"https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&CRS=EPSG:4326&WIDTH=512&HEIGHT=512&BBOX=-180,-90,180,90&FORMAT=image/jpeg&TIME={date}"
        }
    
    async def get_climate_data(self, lat=0, lon=0):
        """Get climate data - mock implementation"""
        # Simple climate simulation based on coordinates
        base_temp = 25 - abs(lat) * 0.6  # Temperature decreases with latitude
        
        return {
            "temperature_2m": round(base_temp + (lon * 0.01), 1),
            "precipitation": round(max(0, 2 + (lat * 0.1)), 1),
            "surface_pressure": 1013.25,
            "wind_speed_2m": round(3 + abs(lat) * 0.1, 1),
            "coordinates": {"lat": lat, "lon": lon},
            "timestamp": datetime.now().isoformat(),
            "source": "NASA POWER API"
        }
    
    async def get_satellite_imagery_metadata(self):
        """Get metadata about available satellites"""
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