import React, { useState } from 'react';
import './DataLayersPanel.css';

const DataLayersPanel = ({ activeLayers, onLayersChange, layerOpacities, onOpacityChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const MAX_ACTIVE_LAYERS = 3;

  const availableLayers = [
    { id: 'temperature', name: 'Temperature Heatmap', icon: '🌡️', description: 'Global temperature distribution' },
    { id: 'vegetation', name: 'Vegetation Index', icon: '🌿', description: 'NDVI vegetation health' },
    { id: 'co2', name: 'CO2 Concentration', icon: '🏭', description: 'Atmospheric CO2 levels' },
    { id: 'deforestation', name: 'Deforestation', icon: '🪵', description: 'Forest cover changes' },
    { id: 'night_lights', name: 'Night Lights', icon: '💡', description: 'Human activity at night' },
    { id: 'air_quality', name: 'Air Quality', icon: '🌫️', description: 'PM2.5 and pollution levels' }
  ];

  const handleLayerToggle = (layerId) => {
    if (activeLayers.includes(layerId)) {
      const newActiveLayers = activeLayers.filter(id => id !== layerId);
      onLayersChange(newActiveLayers);
    } else if (activeLayers.length < MAX_ACTIVE_LAYERS) {
      const newActiveLayers = [...activeLayers, layerId];
      onLayersChange(newActiveLayers);
      
      // Set default opacity for newly activated layer
      if (layerOpacities[layerId] === undefined) {
        onOpacityChange(layerId, 0.7);
      }
    }
  };

  const handleOpacityChange = (layerId, opacity) => {
    onOpacityChange(layerId, parseFloat(opacity));
  };

  const isLayerDisabled = (layerId) => {
    return !activeLayers.includes(layerId) && activeLayers.length >= MAX_ACTIVE_LAYERS;
  };

  const toggleAllLayers = () => {
    if (activeLayers.length === availableLayers.length) {
      onLayersChange([]);
    } else {
      const layersToActivate = availableLayers.slice(0, MAX_ACTIVE_LAYERS).map(layer => layer.id);
      onLayersChange(layersToActivate);
      
      // Set default opacities for newly activated layers
      layersToActivate.forEach(layerId => {
        if (layerOpacities[layerId] === undefined) {
          onOpacityChange(layerId, 0.7);
        }
      });
    }
  };

  const getToggleButtonText = () => {
    if (activeLayers.length === availableLayers.length) {
      return 'Disable All Layers';
    } else if (activeLayers.length === 0) {
      return `Enable ${MAX_ACTIVE_LAYERS} Layers`;
    } else {
      return activeLayers.length >= MAX_ACTIVE_LAYERS ? 'Max Layers Active' : 'Enable More Layers';
    }
  };

  if (isCollapsed) {
    return (
      <button 
        className="panel-toggle"
        onClick={() => setIsCollapsed(false)}
        title="Show Data Layers"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="data-layers-panel">
      <button 
        className="panel-toggle"
        onClick={() => setIsCollapsed(true)}
        title="Hide Panel"
      >
        ✕
      </button>
      
      <h3>🛰️ Data Layers</h3>
      
      <div className="layers-list">
        {availableLayers.map(layer => {
          const isActive = activeLayers.includes(layer.id);
          const isDisabled = isLayerDisabled(layer.id);
          const opacity = layerOpacities[layer.id] || 0.7;
          
          return (
            <div key={layer.id} className="layer-container">
              <div 
                className={`layer-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && handleLayerToggle(layer.id)}
                title={isDisabled ? `Maximum ${MAX_ACTIVE_LAYERS} layers allowed` : `${isActive ? 'Disable' : 'Enable'} ${layer.name}`}
              >
                <div className="layer-background"></div>
                <input
                  type="checkbox"
                  className="layer-checkbox"
                  checked={isActive}
                  onChange={() => !isDisabled && handleLayerToggle(layer.id)}
                  onClick={(e) => e.stopPropagation()}
                  disabled={isDisabled && !isActive}
                />
                <span className="layer-icon">{layer.icon}</span>
                <span className="layer-label">{layer.name}</span>
              </div>
              
              {/* Opacity slider - only show for active layers */}
              {isActive && (
                <div className="opacity-control">
                  <label className="opacity-label">
                    Opacity: {(opacity * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => handleOpacityChange(layer.id, e.target.value)}
                    className="opacity-slider"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="controls-section">
        <button 
          className="toggle-button"
          onClick={toggleAllLayers}
          disabled={activeLayers.length >= MAX_ACTIVE_LAYERS && activeLayers.length !== availableLayers.length}
        >
          {getToggleButtonText()}
        </button>
        
        <div className="active-layers-count">
          {activeLayers.length} of {MAX_ACTIVE_LAYERS} layers active
        </div>
        
        {activeLayers.length >= MAX_ACTIVE_LAYERS && (
          <div className="layer-limit-warning">
            ⚠️ Maximum {MAX_ACTIVE_LAYERS} layers allowed
          </div>
        )}
      </div>
    </div>
  );
};

export default DataLayersPanel;