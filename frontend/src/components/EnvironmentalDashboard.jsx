import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './EnvironmentalDashboard.css';

const EnvironmentalDashboard = () => {
  const [environmentData, setEnvironmentData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [currentData, metricsData] = await Promise.all([
        apiService.getCurrentEnvironment().catch(() => apiService.getFallbackEnvironment()),
        apiService.getEnvironmentMetrics().catch(() => apiService.getFallbackMetrics())
      ]);
      
      setEnvironmentData(currentData);
      setMetrics(metricsData.metrics);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to connect to GaiaNet API. Using demo data.');
      // Use fallback data
      setEnvironmentData(apiService.getFallbackEnvironment());
      setMetrics(apiService.getFallbackMetrics().metrics);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="environmental-dashboard">
        <div className="loading-state">
          <div className="pulse-loader"></div>
          <div>Connecting to GaiaNet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="environmental-dashboard">
      <div className="dashboard-header">
        <div className="header-main">
          <div className="header-icon">🌍</div>
          <div className="header-text">
            <h2>GaiaNet Monitor</h2>
            <div className="subtitle">Real-time Earth Analytics</div>
          </div>
        </div>
        
        <div className="last-updated">
          <div className="update-indicator"></div>
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
        </div>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      <div className="metrics-grid">
        {metrics && Object.entries(metrics).map(([key, metric]) => (
          <div key={key} className="metric-card">
            <div className="metric-background"></div>
            <div className="metric-icon">
              {getMetricIcon(key)}
            </div>
            <div className="metric-content">
              <div className="metric-label">
                {formatMetricName(key)}
              </div>
              <div className="metric-value">
                {metric.value} <span className="metric-unit">{metric.unit}</span>
              </div>
              <div className="metric-trend">
                <span className={`trend-icon ${metric.trend}`}>
                  {getTrendIcon(metric.trend)}
                </span>
                <span className="trend-text">
                  {metric.change} {metric.unit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-footer">
        <div className="system-status">
          <div className="status-item">
            <div className="status-dot live"></div>
            <span>API</span>
          </div>
          <div className="status-item">
            <div className="status-dot stable"></div>
            <span>DATA</span>
          </div>
        </div>
        
        <button className="refresh-btn" onClick={handleRefresh}>
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};

// Helper functions
const getMetricIcon = (metricKey) => {
  const icons = {
    global_temperature: '🌡️',
    co2_concentration: '🏭',
    sea_level_rise: '🌊',
    forest_cover_loss: '🌳',
    biodiversity_index: '🦋'
  };
  return icons[metricKey] || '📊';
};

const formatMetricName = (key) => {
  return key.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const getTrendIcon = (trend) => {
  const icons = {
    rising: '📈',
    declining: '📉',
    improving: '✅',
    stable: '➡️'
  };
  return icons[trend] || '📊';
};

export default EnvironmentalDashboard;