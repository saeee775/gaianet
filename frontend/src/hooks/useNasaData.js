import { useState, useEffect } from 'react';
import nasaService from '../services/nasaService';

export const useNasaData = () => {
  const [satelliteMetadata, setSatelliteMetadata] = useState(null);
  const [climateData, setClimateData] = useState(null);
  const [imageryData, setImageryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSatelliteMetadata = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await nasaService.getSatelliteMetadata();
      setSatelliteMetadata(data);
    } catch (err) {
      setError('Failed to fetch satellite metadata');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClimateData = async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);
      const data = await nasaService.getClimateData(lat, lon);
      setClimateData(data);
    } catch (err) {
      setError('Failed to fetch climate data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarthImagery = async (lat, lon, date) => {
    try {
      setLoading(true);
      setError(null);
      const data = await nasaService.getEarthImagery(lat, lon, date);
      setImageryData(data);
    } catch (err) {
      setError('Failed to fetch earth imagery');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSatelliteMetadata();
  }, []);

  return {
    satelliteMetadata,
    climateData,
    imageryData,
    loading,
    error,
    fetchClimateData,
    fetchEarthImagery,
    refetchMetadata: fetchSatelliteMetadata,
  };
};