import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const DataVisualization = ({ activeLayers = [], scene, earth }) => {
  const groupRef = useRef();

  useEffect(() => {
    if (!scene || !groupRef.current) return;

    // Clear previous visualizations
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    // Add to scene if not already added
    if (!scene.children.includes(groupRef.current)) {
      scene.add(groupRef.current);
    }

    // Add data layers based on active layers
    activeLayers.forEach(layer => {
      switch (layer) {
        case 'MODIS Terra':
          addTemperatureHeatmap();
          break;
        case 'MODIS Aqua':
          addVegetationLayer();
          break;
        case 'VIIRS':
          addNightLightsLayer();
          break;
        default:
          break;
      }
    });

  }, [activeLayers, scene]);

  const addTemperatureHeatmap = () => {
    const geometry = new THREE.SphereGeometry(5.02, 64, 64);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        
        void main() {
          float temp = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
          vec3 color = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), temp);
          float latitudeEffect = abs(vUv.y - 0.5) * 2.0;
          color = mix(color, vec3(0.5), latitudeEffect * 0.3);
          gl_FragColor = vec4(color, 0.3);
        }
      `
    });

    const heatmap = new THREE.Mesh(geometry, material);
    groupRef.current.add(heatmap);

    const animate = () => {
      if (material.uniforms.time) {
        material.uniforms.time.value += 0.01;
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const addVegetationLayer = () => {
    const geometry = new THREE.SphereGeometry(5.03, 64, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });

    const vegetation = new THREE.Mesh(geometry, material);
    groupRef.current.add(vegetation);
  };

  const addNightLightsLayer = () => {
    const geometry = new THREE.SphereGeometry(5.01, 128, 128);
    const lightsPositions = [];
    const lightsColors = [];
    
    for (let i = 0; i < 500; i++) {
      const phi = Math.acos(-1 + Math.random() * 2);
      const theta = Math.random() * Math.PI * 2;
      
      const x = 5.01 * Math.sin(phi) * Math.cos(theta);
      const y = 5.01 * Math.sin(phi) * Math.sin(theta);
      const z = 5.01 * Math.cos(phi);
      
      lightsPositions.push(x, y, z);
      lightsColors.push(1, 1, 0.8);
    }
    
    const lightsGeometry = new THREE.BufferGeometry();
    lightsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lightsPositions, 3));
    lightsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lightsColors, 3));
    
    const lightsMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const nightLights = new THREE.Points(lightsGeometry, lightsMaterial);
    groupRef.current.add(nightLights);
  };

  return <group ref={groupRef} />;
};

export default DataVisualization;