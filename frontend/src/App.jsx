import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import EnvironmentalDashboard from './components/EnvironmentalDashboard';
import DataLayersPanel from './components/DataLayersPanel';
import './App.css';

function App() {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Loading Earth...');
  const [activeLayers, setActiveLayers] = useState([]);
  const [layerOpacities, setLayerOpacities] = useState({
    temperature: 0.7,
    vegetation: 0.6,
    co2: 0.5,
    deforestation: 0.7,
    night_lights: 0.9,
    air_quality: 0.5
  });
  
  // Refs for Three.js objects
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const earthRef = useRef();
  const cloudsRef = useRef();
  const moonRef = useRef();
  const visualizationGroupRef = useRef(new THREE.Group());
  const dataLayersRef = useRef(new Map());
  
  // Store night lights positions to prevent regeneration
  const nightLightsPositionsRef = useRef(null);
  const nightLightsColorsRef = useRef(null);

  // Handle opacity changes - WITHOUT recreating layers
  const handleOpacityChange = (layerId, opacity) => {
    const newOpacity = parseFloat(opacity);
    setLayerOpacities(prev => ({
      ...prev,
      [layerId]: newOpacity
    }));
    
    // Update existing layer material opacity WITHOUT recreating
    if (dataLayersRef.current.has(layerId)) {
      const layer = dataLayersRef.current.get(layerId);
      if (layer.material) {
        layer.material.opacity = newOpacity;
        layer.material.needsUpdate = true;
        
        // Also update shader uniform if it exists
        if (layer.material.uniforms && layer.material.uniforms.opacity) {
          layer.material.uniforms.opacity.value = newOpacity;
        }
      }
    }
  };

  useEffect(() => {
    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 18;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000011);
    rendererRef.current = renderer;

    // Clear and mount
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    // Add visualization group to scene
    scene.add(visualizationGroupRef.current);

    // Create Earth - centered
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      specular: 0x222222,
      shininess: 10
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(0, 0, 0);
    scene.add(earth);
    earthRef.current = earth;

    // Create Clouds
    const cloudGeometry = new THREE.SphereGeometry(5.1, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);
    cloudsRef.current = clouds;

    // Create Moon
    const moonGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const moonMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      specular: 0x222222,
      shininess: 5
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(15, 5, 0);
    scene.add(moon);
    moonRef.current = moon;

    // Create Stars
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < 2000; i++) {
      starPositions.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      );
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 1.5, 
      sizeAttenuation: true 
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 5, 5);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, -3, -5);
    scene.add(fillLight);

    // Load Earth texture
    const textureLoader = new THREE.TextureLoader();
    const sources = [
      'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'
    ];

    const loadEarthTexture = (i = 0) => {
      if (i >= sources.length) {
        setStatus('Using fallback Earth color');
        setLoading(false);
        return;
      }
      textureLoader.load(
        sources[i],
        (texture) => {
          earthMaterial.map = texture;
          earthMaterial.needsUpdate = true;
          setStatus('Earth texture loaded');
          setLoading(false);
        },
        undefined,
        () => loadEarthTexture(i + 1)
      );
    };
    loadEarthTexture();

    // Load Moon texture
    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg',
      (texture) => {
        moonMaterial.map = texture;
        moonMaterial.needsUpdate = true;
      }
    );

    // Mouse controls with proper event handling
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event) => {
      // Only start dragging if clicking directly on the canvas
      if (event.target === renderer.domElement) {
        isDragging = true;
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
        document.body.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (event) => {
      if (!isDragging) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      // Rotate Earth and clouds
      if (earthRef.current) {
        earthRef.current.rotation.y += deltaMove.x * 0.01;
        earthRef.current.rotation.x += deltaMove.y * 0.01;
      }
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += deltaMove.x * 0.008;
      }

      previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.body.style.cursor = 'grab';
    };

    const handleWheel = (event) => {
      // Only zoom if scrolling on canvas
      if (event.target === renderer.domElement) {
        event.preventDefault();
        camera.position.z += event.deltaY * 0.05;
        camera.position.z = Math.max(8, Math.min(30, camera.position.z));
      }
    };

    // Add event listeners directly to canvas
    const canvas = renderer.domElement;
    canvas.style.cursor = 'grab';
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Auto-rotation when not dragging
      if (!isDragging) {
        if (earthRef.current) earthRef.current.rotation.y += 0.001;
        if (cloudsRef.current) cloudsRef.current.rotation.y += 0.002;
        
        // Moon orbit
        if (moonRef.current) {
          const time = Date.now() * 0.0001;
          moonRef.current.position.x = Math.cos(time) * 15;
          moonRef.current.position.z = Math.sin(time) * 15;
          moonRef.current.rotation.y += 0.002;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  // Effect to handle data visualization layers - ONLY when activeLayers changes
  useEffect(() => {
    if (!visualizationGroupRef.current || !earthRef.current) return;

    // Clear previous data layers
    visualizationGroupRef.current.clear();
    dataLayersRef.current.clear();

    // Add data layers based on active layers
    activeLayers.forEach(layerId => {
      let layerMesh;
      
      switch (layerId) {
        case 'temperature':
          layerMesh = createTemperatureLayer(layerId);
          break;
        case 'vegetation':
          layerMesh = createVegetationLayer(layerId);
          break;
        case 'co2':
          layerMesh = createCO2Layer(layerId);
          break;
        case 'deforestation':
          layerMesh = createDeforestationLayer(layerId);
          break;
        case 'night_lights':
          layerMesh = createNightLightsLayer(layerId);
          break;
        case 'air_quality':
          layerMesh = createAirQualityLayer(layerId);
          break;
        default:
          return;
      }

      if (layerMesh) {
        earthRef.current.add(layerMesh);  // ← CHANGED: Now parented to Earth
        dataLayersRef.current.set(layerId, layerMesh);
      }
    });

    function createTemperatureLayer(layerId) {
      const geometry = new THREE.SphereGeometry(5.02, 64, 64);
      const material = new THREE.ShaderMaterial({
        transparent: true,
        opacity: layerOpacities[layerId] || 0.7,
        side: THREE.DoubleSide,
        uniforms: {
          time: { value: 0 },
          opacity: { value: layerOpacities[layerId] || 0.7 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform float opacity;
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            // Temperature gradient: hot at equator, cold at poles
            float lat = abs(vUv.y - 0.5) * 2.0;
            float temp = 1.0 - lat * 0.8;
            
            // Add some continental variation
            float variation = sin(vUv.x * 8.0 + time) * 0.1 + 
                             sin(vUv.y * 12.0) * 0.05;
            temp += variation;
            temp = clamp(temp, 0.0, 1.0);
            
            // Red (hot) to blue (cold) gradient
            vec3 hotColor = vec3(1.0, 0.0, 0.0);
            vec3 warmColor = vec3(1.0, 1.0, 0.0);
            vec3 coolColor = vec3(0.0, 1.0, 1.0);
            vec3 coldColor = vec3(0.0, 0.0, 1.0);
            
            vec3 color;
            if (temp > 0.75) {
              color = hotColor;
            } else if (temp > 0.5) {
              color = mix(warmColor, hotColor, (temp - 0.5) * 4.0);
            } else if (temp > 0.25) {
              color = mix(coolColor, warmColor, (temp - 0.25) * 4.0);
            } else {
              color = mix(coldColor, coolColor, temp * 4.0);
            }
            
            gl_FragColor = vec4(color, opacity);
          }
        `
      });

      const mesh = new THREE.Mesh(geometry, material);
      
      // Store reference to material for opacity updates
      mesh.material = material;
      
      const animate = () => {
        if (material.uniforms.time && dataLayersRef.current.has(layerId)) {
          material.uniforms.time.value += 0.01;
          requestAnimationFrame(animate);
        }
      };
      animate();
      
      return mesh;
    }

    function createVegetationLayer(layerId) {
      const geometry = new THREE.SphereGeometry(5.03, 64, 64);
      const material = new THREE.ShaderMaterial({
        transparent: true,
        opacity: layerOpacities[layerId] || 0.6,
        side: THREE.DoubleSide,
        uniforms: {
          time: { value: 0 },
          opacity: { value: layerOpacities[layerId] || 0.6 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform float opacity;
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            float lat = abs(vUv.y - 0.5) * 2.0;
            float tropics = 1.0 - smoothstep(0.0, 0.6, lat);
            float temperate = 1.0 - smoothstep(0.3, 1.0, lat);
            float vegetation = max(tropics, temperate * 0.7);
            
            float season = sin(time * 0.5) * 0.2 + 0.8;
            float noise = sin(vUv.x * 15.0 + time) * 0.1 + 
                         sin(vUv.y * 20.0) * 0.1;
            
            vegetation = vegetation * season + noise;
            vegetation = clamp(vegetation, 0.0, 1.0);
            
            vec3 color = mix(vec3(0.1, 0.3, 0.1), vec3(0.2, 0.8, 0.3), vegetation);
            
            float desert = step(0.7, sin(vUv.x * 12.0) * sin(vUv.y * 15.0));
            if (desert > 0.5 && vegetation < 0.3) {
              color = mix(color, vec3(0.9, 0.8, 0.5), 0.7);
            }
            
            gl_FragColor = vec4(color, opacity);
          }
        `
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.material = material;
      
      const animate = () => {
        if (material.uniforms.time && dataLayersRef.current.has(layerId)) {
          material.uniforms.time.value += 0.005;
          requestAnimationFrame(animate);
        }
      };
      animate();
      
      return mesh;
    }

    function createCO2Layer(layerId) {
      const geometry = new THREE.SphereGeometry(5.01, 64, 64);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: layerOpacities[layerId] || 0.5,
        side: THREE.DoubleSide
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.material = material;
      return mesh;
    }

    function createDeforestationLayer(layerId) {
      const geometry = new THREE.SphereGeometry(5.04, 64, 64);
      const material = new THREE.MeshBasicMaterial({
        color: 0x8B4513,
        transparent: true,
        opacity: layerOpacities[layerId] || 0.7,
        side: THREE.DoubleSide
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.material = material;
      return mesh;
    }

    function createNightLightsLayer(layerId) {
      const geometry = new THREE.SphereGeometry(5.005, 64, 64);
      
      // Use cached positions or generate new ones
      let positions, colors;
      
      if (nightLightsPositionsRef.current && nightLightsColorsRef.current) {
        // Use cached positions to prevent regeneration
        positions = nightLightsPositionsRef.current;
        colors = nightLightsColorsRef.current;
      } else {
        // Generate new positions and cache them
        positions = [];
        colors = [];
        
        // Use fixed seed for consistent city light positions
        const cityRegions = [
          // North America
          { u: 0.2, v: 0.7, count: 40 },
          { u: 0.3, v: 0.6, count: 25 },
          // Europe
          { u: 0.5, v: 0.8, count: 50 },
          { u: 0.55, v: 0.7, count: 35 },
          // East Asia
          { u: 0.75, v: 0.7, count: 60 },
          { u: 0.8, v: 0.6, count: 45 },
          // South Asia
          { u: 0.7, v: 0.5, count: 70 },
        ];

        // Generate consistent positions
        for (const region of cityRegions) {
          for (let i = 0; i < region.count; i++) {
            // Use deterministic positioning
            const u = region.u + (Math.sin(i * 123.456) * 0.1);
            const v = region.v + (Math.cos(i * 456.789) * 0.08);
            
            const phi = Math.acos(2 * v - 1);
            const theta = 2 * Math.PI * u;
            
            const x = 5.005 * Math.sin(phi) * Math.cos(theta);
            const y = 5.005 * Math.cos(phi);
            const z = 5.005 * Math.sin(phi) * Math.sin(theta);
            
            positions.push(x, y, z);
            
            // Consistent colors
            const colorType = Math.sin(i * 789.012) % 1;
            if (colorType < 0.7) {
              colors.push(1.0, 1.0, 0.9);
            } else if (colorType < 0.9) {
              colors.push(1.0, 0.9, 0.7);
            } else {
              colors.push(1.0, 0.7, 0.3);
            }
          }
        }
        
        // Cache the positions and colors
        nightLightsPositionsRef.current = positions;
        nightLightsColorsRef.current = colors;
      }
      
      const bufferGeometry = new THREE.BufferGeometry();
      bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      bufferGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: layerOpacities[layerId] || 0.9
      });
      
      const mesh = new THREE.Points(bufferGeometry, material);
      mesh.material = material;
      return mesh;
    }

    function createAirQualityLayer(layerId) {
      const geometry = new THREE.SphereGeometry(5.025, 64, 64);
      const material = new THREE.MeshBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: layerOpacities[layerId] || 0.5,
        side: THREE.DoubleSide
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.material = material;
      return mesh;
    }

  }, [activeLayers]);

  return (
    <div className="app-container">
      <div ref={mountRef} className="canvas-container" />
      <div className="ui-overlay">
        <div className="data-layers-container">
          <DataLayersPanel 
            activeLayers={activeLayers} 
            onLayersChange={setActiveLayers}
            layerOpacities={layerOpacities}
            onOpacityChange={handleOpacityChange}
          />
        </div>

        <div className="dashboard-container">
          <EnvironmentalDashboard />
        </div>

        <div className="bottom-left-text">GaiaNet Digital Earth Twin</div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-icon">🌍</div>
            <div>Loading Real Earth Texture...</div>
            <div className="loading-subtitle">This may take a moment</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;