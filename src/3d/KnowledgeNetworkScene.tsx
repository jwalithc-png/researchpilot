import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const KnowledgeNetworkScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Group for rotation
    const group = new THREE.Group();
    scene.add(group);

    // Colors
    const cyan = new THREE.Color('#06b6d4');
    const cobalt = new THREE.Color('#2563eb');

    // Create nodes (fibonacci sphere)
    const numNodes = 30;
    const radius = 2.5;
    const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const nodes: THREE.Vector3[] = [];
    const nodeMeshes: THREE.Mesh[] = [];

    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

    for (let i = 0; i < numNodes; i++) {
      const y = 1 - (i / (numNodes - 1)) * 2; // y goes from 1 to -1
      const r = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      const pos = new THREE.Vector3(x * radius, y * radius, z * radius);
      nodes.push(pos);

      // Mix cyan and cobalt
      const color = new THREE.Color().lerpColors(cyan, cobalt, Math.random());
      
      const material = new THREE.MeshBasicMaterial({ 
        color, 
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending 
      });
      
      const mesh = new THREE.Mesh(nodeGeometry, material);
      mesh.position.copy(pos);
      group.add(mesh);
      nodeMeshes.push(mesh);
    }

    // Create connections
    const lineMaterial = new THREE.LineBasicMaterial({
      color: cyan,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });

    const connections: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < 2.5) { // connect close nodes
          const geometry = new THREE.BufferGeometry().setFromPoints([nodes[i], nodes[j]]);
          const line = new THREE.Line(geometry, lineMaterial);
          group.add(line);
          connections.push({ start: nodes[i], end: nodes[j] });
        }
      }
    }

    // Particles moving along lines
    const particleCount = connections.length * 2;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    // Store connection index and progress for each particle
    const particleData: { connIndex: number, progress: number, speed: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const connIndex = Math.floor(Math.random() * connections.length);
      const progress = Math.random();
      particleData.push({
        connIndex,
        progress,
        speed: 0.002 + Math.random() * 0.005
      });

      const start = connections[connIndex].start;
      const end = connections[connIndex].end;
      
      const x = start.x + (end.x - start.x) * progress;
      const y = start.y + (end.y - start.y) * progress;
      const z = start.z + (end.z - start.z) * progress;
      
      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    // Mouse interaction for parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX) * 0.001;
      mouseY = (event.clientY - windowHalfY) * 0.001;
    };

    document.addEventListener('mousemove', onDocumentMouseMove);

    // Resize handler
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize);

    // Animation loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Auto-orbit
      group.rotation.y += 0.001;
      group.rotation.x += 0.0005;

      // Parallax
      targetX = mouseX * 2;
      targetY = mouseY * 2;
      
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Pulse nodes slightly
      const time = clock.getElapsedTime();
      nodeMeshes.forEach((mesh, i) => {
        const scale = 1 + Math.sin(time * 2 + i) * 0.2;
        mesh.scale.set(scale, scale, scale);
      });

      // Update particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const data = particleData[i];
        data.progress += data.speed;
        
        if (data.progress > 1) {
          data.progress = 0;
          data.connIndex = Math.floor(Math.random() * connections.length);
        }

        const conn = connections[data.connIndex];
        const start = conn.start;
        const end = conn.end;

        positions[i * 3] = start.x + (end.x - start.x) * data.progress;
        positions[i * 3 + 1] = start.y + (end.y - start.y) * data.progress;
        positions[i * 3 + 2] = start.z + (end.z - start.z) * data.progress;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }

      nodeGeometry.dispose();
      lineMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      nodeMeshes.forEach(mesh => {
        if (mesh.material instanceof THREE.Material) {
           mesh.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-auto" />;
};
