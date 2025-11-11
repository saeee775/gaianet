import axios from 'axios';

const NASA_BASE_URL = 'http://localhost:8000/api/nasa';

class NasaService {
  constructor() {
    this.client = axios.create({
      baseURL: NASA_BASE_URL,
      timeout: 10000,
    });
  }

  async getSatelliteMetadata() {
    try {
      const response = await this.client.get('/satellites');
      return response.data;
    } catch (error) {
      console.error('Error fetching satellite metadata:', error);
      throw error;
    }
  }

  async getClimateData(lat, lon) {
    try {
      const response = await this.client.get(`/climate?lat=${lat}&lon=${lon}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching climate data:', error);
      throw error;
    }
  }

  async getEarthImagery(lat, lon, date) {
    try {
      let url = '/imagery';
      const params = new URLSearchParams();
      
      if (lat) params.append('lat', lat);
      if (lon) params.append('lon', lon);
      if (date) params.append('date', date);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching earth imagery:', error);
      throw error;
    }
  }
}

export default new NasaService();