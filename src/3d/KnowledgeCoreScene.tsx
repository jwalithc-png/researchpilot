import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface KnowledgeCoreSceneProps {
  mode: 'login' | 'register';
}

export const KnowledgeCoreScene: React.FC<KnowledgeCoreSceneProps> = ({ mode }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Group for the core
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(2, 0);
    const icoMatSolid = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // cyan
      transparent: true,
      opacity: 0.3,
      wireframe: false,
    });
    const icoMatWire = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // cyan
      wireframe: true,
    });
    const icosahedronSolid = new THREE.Mesh(icoGeo, icoMatSolid);
    const icosahedronWire = new THREE.Mesh(icoGeo, icoMatWire);
    
    // scale slightly so wireframe is visible outside solid
    icosahedronWire.scale.set(1.05, 1.05, 1.05);
    
    coreGroup.add(icosahedronSolid);
    coreGroup.add(icosahedronWire);

    // Rings
    const ringGeo1 = new THREE.TorusGeometry(3.5, 0.05, 16, 100);
    const ringGeo2 = new THREE.TorusGeometry(4.5, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0x2563eb, // cobalt
      transparent: true, 
      opacity: 0.5 
    });
    
    const ring1 = new THREE.Mesh(ringGeo1, ringMat);
    ring1.rotation.x = Math.PI / 3;
    const ring2 = new THREE.Mesh(ringGeo2, ringMat);
    ring2.rotation.y = Math.PI / 4;
    
    coreGroup.add(ring1);
    coreGroup.add(ring2);

    // Satellites
    const satGroup = new THREE.Group();
    coreGroup.add(satGroup);
    
    const satGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const satMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // emerald
    const satellites: { mesh: THREE.Mesh, distance: number, speed: number, angle: number, yOffset: number }[] = [];

    for (let i = 0; i < 15; i++) {
      const mesh = new THREE.Mesh(satGeo, satMat);
      const distance = 5 + Math.random() * 3;
      const speed = 0.5 + Math.random() * 1.5;
      const angle = Math.random() * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 4;
      
      satGroup.add(mesh);
      satellites.push({ mesh, distance, speed, angle, yOffset });
    }

    // Background aurora particles
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
      particlePositions[i] = (Math.random() - 0.5) * 40;
    }
    
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    camera.position.z = 10;

    // Animation variables
    let animationFrameId: number;
    const clock = new THREE.Clock();

    // Mode transition targets
    let targetScale = 1;
    const colorCyan = new THREE.Color(0x06b6d4);
    const colorCobalt = new THREE.Color(0x2563eb);
    let targetColor = colorCyan;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Lerp scale and color
      const currentScale = icosahedronSolid.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.05);
      icosahedronSolid.scale.set(newScale, newScale, newScale);
      icosahedronWire.scale.set(newScale * 1.05, newScale * 1.05, newScale * 1.05);
      
      icoMatSolid.color.lerp(targetColor, 0.05);
      icoMatWire.color.lerp(targetColor, 0.05);

      // Rotations
      coreGroup.rotation.y += delta * 0.2;
      coreGroup.rotation.x += delta * 0.1;
      
      ring1.rotation.z -= delta * 0.5;
      ring2.rotation.z += delta * 0.3;

      // Satellites
      satellites.forEach(sat => {
        sat.angle += delta * sat.speed;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.distance;
        sat.mesh.position.z = Math.sin(sat.angle) * sat.distance;
        sat.mesh.position.y = Math.sin(time + sat.angle) + sat.yOffset;
      });

      // Ambient particles slow rotation
      particles.rotation.y -= delta * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const container = mountRef.current;

    // Save a custom property on DOM node to pass updates without recreating scene
    (container as any).updateMode = (newMode: 'login' | 'register') => {
      if (newMode === 'login') {
        targetScale = 1;
        targetColor = colorCyan;
      } else {
        targetScale = 1.3;
        targetColor = colorCobalt;
      }
    };

    // Initial state setup
    (container as any).updateMode(mode);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      icoGeo.dispose();
      icoMatSolid.dispose();
      icoMatWire.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      ringMat.dispose();
      satGeo.dispose();
      satMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync mode changes to the active scene
  useEffect(() => {
    if (mountRef.current && (mountRef.current as any).updateMode) {
      (mountRef.current as any).updateMode(mode);
    }
  }, [mode]);

  return <div ref={mountRef} className="w-full h-full" />;
};
