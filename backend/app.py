from flask import Flask, jsonify, request  # Fixed: added 'request'
from flask_cors import CORS
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class NasaApiService:
    def __init__(self):
        pass
    
    def get_earth_imagery(self, lat=None, lon=None, date=None):
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
    
    def get_climate_data(self, lat=0, lon=0):
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
    
    def get_satellite_imagery_metadata(self):
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

nasa_service = NasaApiService()

@app.route('/')
def root():
    return jsonify({"message": "Welcome to GaiaNet API", "version": "1.0.0"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/api/environment/data')
def get_environment_data():
    # Simulate real environmental data with realistic values
    return jsonify({
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
    })

# NEW NASA ENDPOINTS
@app.route('/api/nasa/imagery')
def get_nasa_imagery():
    """Get NASA satellite imagery data"""
    try:
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        date = request.args.get('date')
        
        imagery_data = nasa_service.get_earth_imagery(lat, lon, date)
        return jsonify({
            "status": "success",
            "data": imagery_data,
            "message": "Satellite imagery data retrieved",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve imagery: {str(e)}",
            "timestamp": datetime.now().isoformat()
        })

@app.route('/api/nasa/climate')
def get_nasa_climate():
    """Get NASA climate data for specific coordinates"""
    try:
        lat = request.args.get('lat', 0, type=float)
        lon = request.args.get('lon', 0, type=float)
        
        climate_data = nasa_service.get_climate_data(lat, lon)
        return jsonify({
            "status": "success",
            "data": climate_data,
            "message": "Climate data retrieved",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve climate data: {str(e)}",
            "timestamp": datetime.now().isoformat()
        })

@app.route('/api/nasa/satellites')
def get_satellite_metadata():
    """Get metadata about available satellites"""
    try:
        metadata = nasa_service.get_satellite_imagery_metadata()
        return jsonify({
            "status": "success",
            "data": metadata,
            "message": "Satellite metadata retrieved",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve satellite metadata: {str(e)}",
            "timestamp": datetime.now().isoformat()
        })

if __name__ == '__main__':
    app.run(debug=True, port=8000)