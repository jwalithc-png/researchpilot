import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const IntelligenceNetworkScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Group for entire network
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // Intelligence Core (Central Sphere)
    const coreGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.8,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    networkGroup.add(coreMesh);

    // Nodes definition
    const nodeConfigs = [
      { name: 'Research Question', color: 0x06b6d4, radius: 4, speed: 0.5, tilt: 0.1 },
      { name: 'Papers', color: 0x2563eb, radius: 5, speed: 0.4, tilt: -0.2 },
      { name: 'AI Analysis', color: 0x10b981, radius: 6, speed: 0.6, tilt: 0.3 },
      { name: 'Comparison', color: 0xf59e0b, radius: 7, speed: 0.3, tilt: -0.1 },
      { name: 'Gaps', color: 0xf43f5e, radius: 8, speed: 0.45, tilt: 0.4 },
      { name: 'Directions', color: 0xa855f7, radius: 9, speed: 0.35, tilt: -0.3 },
      { name: 'Plan', color: 0x14b8a6, radius: 10, speed: 0.55, tilt: 0.2 },
      { name: 'Tasks', color: 0xf97316, radius: 11, speed: 0.25, tilt: -0.4 },
    ];

    const nodes: { mesh: THREE.Mesh; config: any; angle: number; baseScale: number }[] = [];
    const lines: THREE.Line[] = [];

    // Create Nodes and Lines
    const nodeGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    nodeConfigs.forEach((config) => {
      const material = new THREE.MeshBasicMaterial({ color: config.color });
      const mesh = new THREE.Mesh(nodeGeometry, material);
      
      const angle = Math.random() * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * config.radius, 0, Math.sin(angle) * config.radius);
      mesh.rotation.x = config.tilt;
      
      networkGroup.add(mesh);
      nodes.push({ mesh, config, angle, baseScale: 1 });

      // Connection Line to Core
      const lineMaterial = new THREE.LineBasicMaterial({ color: config.color, transparent: true, opacity: 0.3 });
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        mesh.position
      ]);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      networkGroup.add(line);
      lines.push(line);
    });

    // Particles Data Flow
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleData: { sourceIndex: number; progress: number; speed: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const sourceIndex = Math.floor(Math.random() * nodes.length);
      const color = new THREE.Color(nodes[sourceIndex].config.color);
      
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
      
      particleData.push({
        sourceIndex,
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.005,
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    networkGroup.add(particleSystem);

    // Raycaster for Hover Effects
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredNode: THREE.Mesh | null = null;

    const onMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();


      // Core pulsing
      const scale = 1 + Math.sin(elapsedTime * 2) * 0.1;
      coreMesh.scale.set(scale, scale, scale);
      coreMaterial.opacity = 0.6 + Math.sin(elapsedTime * 3) * 0.2;

      // Orbiting Nodes
      nodes.forEach((node, idx) => {
        node.angle += node.config.speed * 0.01;
        const x = Math.cos(node.angle) * node.config.radius;
        const z = Math.sin(node.angle) * node.config.radius;
        // Add tilt
        const y = Math.sin(node.angle + node.config.tilt * 10) * node.config.radius * Math.sin(node.config.tilt);
        
        node.mesh.position.set(x, y, z);
        
        // Update connection line
        const positions = lines[idx].geometry.attributes.position.array as Float32Array;
        positions[3] = x;
        positions[4] = y;
        positions[5] = z;
        lines[idx].geometry.attributes.position.needsUpdate = true;

        // Smoothly return to base scale
        if (node.mesh !== hoveredNode) {
          node.mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
          (node.mesh.material as THREE.MeshBasicMaterial).color.setHex(node.config.color);
        }
      });

      // Particles flow toward center
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      particleData.forEach((data, i) => {
        data.progress += data.speed;
        if (data.progress >= 1) {
          data.progress = 0;
          data.sourceIndex = Math.floor(Math.random() * nodes.length);
        }

        const sourceNode = nodes[data.sourceIndex];
        const targetPos = coreMesh.position;
        const sourcePos = sourceNode.mesh.position;

        // Lerp from source to target
        const currentPos = new THREE.Vector3().copy(sourcePos).lerp(targetPos, data.progress);
        
        // Add some curve/noise
        currentPos.y += Math.sin(data.progress * Math.PI) * 1.5;

        positions[i * 3] = currentPos.x;
        positions[i * 3 + 1] = currentPos.y;
        positions[i * 3 + 2] = currentPos.z;
      });
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Network slow auto-rotation
      networkGroup.rotation.y = elapsedTime * 0.05;

      // Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes.map(n => n.mesh));

      if (intersects.length > 0) {
        if (hoveredNode !== intersects[0].object) {
          hoveredNode = intersects[0].object as THREE.Mesh;
        }
        // Hover effect
        if (hoveredNode) {
          hoveredNode.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.2);
          const mat = hoveredNode.material as THREE.MeshBasicMaterial;
          mat.color.setHex(0xffffff); // Glow brighter (white tint)
        }
      } else {
        hoveredNode = null;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
      
      coreGeometry.dispose();
      coreMaterial.dispose();
      nodeGeometry.dispose();
      
      nodes.forEach(n => {
        (n.mesh.material as THREE.Material).dispose();
      });
      lines.forEach(l => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      });
      particleGeometry.dispose();
      particleMaterial.dispose();

      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 z-0 pointer-events-auto" />
  );
};
