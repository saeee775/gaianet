import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { apiService } from '../services/api';

import EnvironmentalDashboard from '../components/EnvironmentalDashboard';

const Earth = () => {
  const canvasRef = useRef(null);
  
  // Backend connection test
  useEffect(() => {
    console.log('Testing backend connection...');
    apiService.getHealth()
      .then(data => {
        console.log('✅ Backend connected:', data);
      })
      .catch(error => {
        console.error('❌ Backend connection failed:', error);
      });
  }, []);

  // Your existing Earth 3D code stays below - don't change any of this:
  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(5, 32, 32);
    const earthTexture = new THREE.TextureLoader().load(
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
      () => console.log('Earth texture loaded'),
      undefined,
      (err) => console.error('Earth texture error:', err)
    );
    const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Clouds
    const cloudGeometry = new THREE.SphereGeometry(5.1, 32, 32);
    const cloudTexture = new THREE.TextureLoader().load(
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-clouds.png',
      () => console.log('Cloud texture loaded'),
      undefined,
      (err) => console.error('Cloud texture error:', err)
    );
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);

    // Moon
    const moonGeometry = new THREE.SphereGeometry(1, 16, 16);
    const moonTexture = new THREE.TextureLoader().load(
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/moon-bump.jpg',
      () => console.log('Moon texture loaded'),
      undefined,
      (err) => {
        console.warn('Moon texture failed, using fallback:', err);
        moonMaterial.color.set(0x888888);
      }
    );
    const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(15, 0, 0);
    scene.add(moon);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 5, 3);
    scene.add(directionalLight);

    // Stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 2000;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    camera.position.z = 15;

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let autoRotation = true;

    const onMouseDown = (event) => {
      isDragging = true;
      autoRotation = false;
    };

    const onMouseMove = (event) => {
      if (!isDragging) return;
      
      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      earth.rotation.y += deltaMove.x * 0.01;
      earth.rotation.x += deltaMove.y * 0.01;
      clouds.rotation.y += deltaMove.x * 0.01;
      clouds.rotation.x += deltaMove.y * 0.01;

      previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => autoRotation = true, 3000);
    };

    const onWheel = (event) => {
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(10, Math.min(30, camera.position.z));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      if (autoRotation && !isDragging) {
        earth.rotation.y += 0.001;
        clouds.rotation.y += 0.0015;
      }

      // Moon orbit
      moon.position.x = Math.cos(Date.now() * 0.0001) * 15;
      moon.position.z = Math.sin(Date.now() * 0.0001) * 15;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <div className="earth-container">
      <EnvironmentalDashboard />
      <canvas ref={canvasRef} className="earth-canvas" />
    </div>
  );
};

export default Earth;