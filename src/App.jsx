import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
 
function App() {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Loading Earth...');

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000011); // Dark space background
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 15;

    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Animated clouds
    const cloudGeometry = new THREE.SphereGeometry(5.05, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      depthWrite: false
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);

    // Create realistic Moon
    const moonGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const moonMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      specular: 0x222222,
      shininess: 1
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(15, 5, 0);
    scene.add(moon);

    // Stars
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
      size: 1.2,
      sizeAttenuation: true
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    // Main sunlight (from Sun direction)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 5, 7);
    scene.add(directionalLight);

    // Fill light to reduce harsh shadows on Earth
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, -3, -5);
    scene.add(fillLight);

    // Load Earth texture - USING RELIABLE SOURCE
    const textureLoader = new THREE.TextureLoader();
    
    // Try multiple reliable Earth texture sources
    const earthTextureSources = [
      'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/textures/planets/earth_atmos_2048.jpg'
    ];

    const loadEarthTexture = (index = 0) => {
      if (index >= earthTextureSources.length) {
        setStatus('Using fallback Earth color');
        setLoading(false);
        return;
      }

      textureLoader.load(
        earthTextureSources[index],
        (texture) => {
          earthMaterial.map = texture;
          earthMaterial.needsUpdate = true;
          setStatus('Real Earth texture loaded!');
          setLoading(false);
        },
        undefined,
        (error) => {
          console.log(`Texture source ${index} failed, trying next...`);
          loadEarthTexture(index + 1);
        }
      );
    };

    // Load Moon texture
    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg',
      (moonTexture) => {
        moonMaterial.map = moonTexture;
        moonMaterial.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.log('Moon texture failed, using gray moon');
      }
    );

    // Start loading Earth texture
    loadEarthTexture();

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event) => {
      if (!isDragging) return;
      
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;
      
      earth.rotation.y += deltaX * 0.01;
      earth.rotation.x += deltaY * 0.01;
      clouds.rotation.y += deltaX * 0.008;
      
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (event) => {
      camera.position.z += event.deltaY * 0.1;
      camera.position.z = Math.max(3, Math.min(50, camera.position.z));
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (!isDragging) {
        earth.rotation.y += 0.001;
        clouds.rotation.y += 0.002;
        
        // Moon orbit around Earth
        const time = Date.now() * 0.0001;
        moon.position.x = Math.cos(time) * 20;
        moon.position.z = Math.sin(time) * 20;
        moon.position.y = Math.sin(time * 0.5) * 3;
        
        // Moon rotation (always shows same face to Earth)
        moon.rotation.y += 0.002;
      }
      
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', cursor: 'grab' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '320px',
        zIndex: 1000,
        border: '1px solid #333'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
          🌍 GaiaNet
        </h1>
        <p style={{ color: '#9ca3af', margin: '8px 0 0 0' }}>
          Earth Digital Twin
        </p>
        
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              background: loading ? '#f59e0b' : '#10b981', 
              borderRadius: '50%', 
              marginRight: '8px' 
            }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              {loading ? 'Loading Earth...' : 'Earth & Moon: READY'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            {status}
          </div>
        </div>

        <div style={{ marginTop: '12px', fontSize: '11px', color: '#9ca3af' }}>
          <div>🌍 Real Earth Texture</div>
          <div>🌑 Realistic Moon</div>
          <div>☁️ Animated Clouds</div>
          <div>🛰️ Orbiting Moon</div>
        </div>
      </div>

      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 2000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌍</div>
            <div>Loading Real Earth Texture...</div>
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#9ca3af' }}>
              This may take a moment
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
