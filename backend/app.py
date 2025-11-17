from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
 
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def root():
    return jsonify({
        "message": "GaiaNet API Server Running", 
        "status": "healthy",
        "version": "1.0.0"
    })

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "service": "GaiaNet Backend"
    })

@app.route('/api/environment/current')
def get_current_environment():
    """Get current environmental data"""
    return jsonify({
        "temperature": 15.2,
        "co2_levels": 417.5,
        "deforestation_rate": 0.08,
        "biodiversity_index": 0.76,
        "air_quality": 85.2,
        "sea_level_rise": 3.4,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/environment/metrics')
def get_environment_metrics():
    """Get environmental metrics with trends"""
    return jsonify({
        "metrics": {
            "global_temperature": {
                "value": 15.2, 
                "unit": "°C", 
                "change": "+1.1",
                "trend": "rising"
            },
            "co2_concentration": {
                "value": 417.5, 
                "unit": "ppm", 
                "change": "+2.5",
                "trend": "rising"
            },
            "sea_level_rise": {
                "value": 3.4, 
                "unit": "mm/year", 
                "change": "+0.3",
                "trend": "rising"
            },
            "forest_cover_loss": {
                "value": 10.1, 
                "unit": "M hectares/year", 
                "change": "-0.2",
                "trend": "improving"
            },
            "biodiversity_index": {
                "value": 76.0,
                "unit": "%",
                "change": "-2.1", 
                "trend": "declining"
            }
        },
        "last_updated": datetime.now().isoformat()
    })

@app.route('/api/layers')
def get_available_layers():
    """Get available data layers"""
    return jsonify({
        "layers": [
            {"id": "temperature", "name": "Temperature Heatmap", "description": "Global temperature distribution"},
            {"id": "vegetation", "name": "Vegetation Index", "description": "NDVI vegetation health"},
            {"id": "co2", "name": "CO2 Concentration", "description": "Atmospheric CO2 levels"},
            {"id": "deforestation", "name": "Deforestation", "description": "Forest cover changes"},
            {"id": "night_lights", "name": "Night Lights", "description": "Human activity at night"},
            {"id": "air_quality", "name": "Air Quality", "description": "PM2.5 and pollution levels"}
        ]
    })

@app.route('/api/satellite/imagery')
def get_satellite_imagery():
    """Get satellite imagery metadata"""
    return jsonify({
        "sources": [
            {
                "name": "MODIS Terra",
                "description": "Moderate Resolution Imaging Spectroradiometer",
                "resolution": "250m",
                "update_frequency": "daily"
            },
            {
                "name": "MODIS Aqua", 
                "description": "Moderate Resolution Imaging Spectroradiometer",
                "resolution": "250m",
                "update_frequency": "daily"
            },
            {
                "name": "VIIRS",
                "description": "Visible Infrared Imaging Radiometer Suite",
                "resolution": "375m", 
                "update_frequency": "nightly"
            }
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
