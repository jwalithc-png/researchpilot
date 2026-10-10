import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06080f, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Particle Constellation Field
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorA = new THREE.Color(0x6366f1); // Indigo
    const colorB = new THREE.Color(0x06b6d4); // Cyan
    const colorC = new THREE.Color(0x10b981); // Emerald

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 600;
      positions[i3 + 1] = (Math.random() - 0.5) * 450;
      positions[i3 + 2] = (Math.random() - 0.5) * 400;

      const mixedColor = i % 3 === 0 ? colorA : i % 3 === 1 ? colorB : colorC;
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material with Soft Glow
    const canvasTexture = document.createElement('canvas');
    canvasTexture.width = 32;
    canvasTexture.height = 32;
    const ctx = canvasTexture.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(160,200,255,0.7)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const pTexture = new THREE.CanvasTexture(canvasTexture);

    const material = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      map: pTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 2. Central 3D Wireframe Icosahedron (Autonomous Intelligence Core)
    const coreGeo = new THREE.IcosahedronGeometry(36, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(130, 40, -40);
    scene.add(coreMesh);

    // Inner glowing sphere inside core
    const innerGeo = new THREE.SphereGeometry(18, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreMesh.add(innerMesh);

    // 3. Floating 3D Orbital Rings
    const ringGeo = new THREE.RingGeometry(50, 50.8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(130, 40, -40);
    ringMesh.rotation.x = Math.PI / 3;
    scene.add(ringMesh);

    const ringGeo2 = new THREE.RingGeometry(65, 65.8, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.1
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.position.set(130, 40, -40);
    ringMesh2.rotation.y = Math.PI / 4;
    scene.add(ringMesh2);

    // Mouse movement parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.15;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.15;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationId;
    const startTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsed = (performance.now() - startTime) * 0.001;

      // Smooth camera parallax
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      camera.position.x = targetX;
      camera.position.y = -targetY;
      camera.lookAt(scene.position);

      // Rotate particle constellation slowly
      particles.rotation.y = elapsed * 0.03;
      particles.rotation.x = elapsed * 0.015;

      // Rotate 3D core & rings
      coreMesh.rotation.x = elapsed * 0.15;
      coreMesh.rotation.y = elapsed * 0.25;
      innerMesh.rotation.y = -elapsed * 0.35;

      ringMesh.rotation.z = elapsed * 0.1;
      ringMesh2.rotation.x = -elapsed * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: 0.92
      }}
    />
  );
}
