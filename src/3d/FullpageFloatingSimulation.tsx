import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface FullpageFloatingSimulationProps {
  intensity?: number;
}

export const FullpageFloatingSimulation: React.FC<FullpageFloatingSimulationProps> = ({
  intensity = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060b17, 0.015);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 30);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 3. Floating Molecular Nodes
    const nodeCount = 36;
    const nodeGeom = new THREE.SphereGeometry(0.35, 16, 16);
    const colors = [0x06b6d4, 0x3b82f6, 0x10b981, 0xa855f7, 0xf59e0b];

    const nodesData: {
      mesh: THREE.Mesh;
      baseX: number;
      baseY: number;
      baseZ: number;
      speedX: number;
      speedY: number;
      phase: number;
      floatDist: number;
    }[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const color = colors[i % colors.length];
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.75,
      });

      const mesh = new THREE.Mesh(nodeGeom, mat);

      // Distribute in a spherical/elliptical cloud
      const radius = 10 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.8;
      const z = (radius * Math.cos(phi) - 10) * 0.8;

      mesh.position.set(x, y, z);
      const scale = 0.6 + Math.random() * 0.9;
      mesh.scale.set(scale, scale, scale);

      mainGroup.add(mesh);

      nodesData.push({
        mesh,
        baseX: x,
        baseY: y,
        baseZ: z,
        speedX: 0.2 + Math.random() * 0.5,
        speedY: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        floatDist: 0.8 + Math.random() * 1.5,
      });
    }

    // 4. Floating Connection Lines
    const maxLineConnections = 50;
    const linePositions = new Float32Array(maxLineConnections * 2 * 3);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    mainGroup.add(lineSegments);

    // 5. Floating Stardust Particles
    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSpeeds: number[] = [];

    const pColor1 = new THREE.Color(0x06b6d4);
    const pColor2 = new THREE.Color(0x3b82f6);
    const pColor3 = new THREE.Color(0xa855f7);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 60;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 45;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;

      const choice = Math.random();
      const c = choice < 0.45 ? pColor1 : choice < 0.8 ? pColor2 : pColor3;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;

      particleSpeeds.push(0.01 + Math.random() * 0.02);
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particles);

    // 6. Mouse Parallax
    let targetRotX = 0;
    let targetRotY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotY = mouseX * 0.25 * intensity;
      targetRotX = -mouseY * 0.2 * intensity;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 7. Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Parallax smooth lerp
      mainGroup.rotation.y += (targetRotY - mainGroup.rotation.y) * 0.04;
      mainGroup.rotation.x += (targetRotX - mainGroup.rotation.x) * 0.04;

      // Slow ambient drift
      mainGroup.rotation.z = Math.sin(elapsed * 0.08) * 0.05;

      // Floating harmonic animation for each node
      nodesData.forEach((node, i) => {
        const floatY = Math.sin(elapsed * node.speedY + node.phase) * node.floatDist;
        const floatX = Math.cos(elapsed * node.speedX + node.phase) * (node.floatDist * 0.7);
        node.mesh.position.y = node.baseY + floatY;
        node.mesh.position.x = node.baseX + floatX;

        // Subtle pulsing scale
        const pulse = 1 + Math.sin(elapsed * 2 + i) * 0.08;
        node.mesh.scale.set(pulse, pulse, pulse);
      });

      // Update lines between nearby floating nodes
      let lineIdx = 0;
      const linePosArray = lineGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < nodesData.length && lineIdx < maxLineConnections; i++) {
        for (let j = i + 1; j < nodesData.length && lineIdx < maxLineConnections; j++) {
          const dist = nodesData[i].mesh.position.distanceTo(nodesData[j].mesh.position);
          if (dist < 9) {
            const p1 = nodesData[i].mesh.position;
            const p2 = nodesData[j].mesh.position;

            linePosArray[lineIdx * 6] = p1.x;
            linePosArray[lineIdx * 6 + 1] = p1.y;
            linePosArray[lineIdx * 6 + 2] = p1.z;

            linePosArray[lineIdx * 6 + 3] = p2.x;
            linePosArray[lineIdx * 6 + 4] = p2.y;
            linePosArray[lineIdx * 6 + 5] = p2.z;

            lineIdx++;
          }
        }
      }

      // Zero out unused line segments
      for (let k = lineIdx; k < maxLineConnections; k++) {
        linePosArray[k * 6] = 0;
        linePosArray[k * 6 + 1] = 0;
        linePosArray[k * 6 + 2] = 0;
        linePosArray[k * 6 + 3] = 0;
        linePosArray[k * 6 + 4] = 0;
        linePosArray[k * 6 + 5] = 0;
      }
      lineGeometry.attributes.position.needsUpdate = true;

      // Stardust particle floating drift
      const pPositions = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pPositions[i * 3 + 1] += particleSpeeds[i] * (0.8 + Math.sin(elapsed + i) * 0.2);
        // Loop back when reaching top
        if (pPositions[i * 3 + 1] > 25) {
          pPositions[i * 3 + 1] = -25;
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      nodeGeom.dispose();
      nodesData.forEach((n) => {
        (n.mesh.material as THREE.Material).dispose();
      });
      lineGeometry.dispose();
      lineMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [intensity]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.9 }}
      aria-hidden="true"
    />
  );
};
