import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface FormState {
  hasTitle: boolean;
  hasQuestion: boolean;
  hasDomain: boolean;
  hasObjective: boolean;
  documentCount: number;
  linkCount: number;
  titleText?: string;
  domainText?: string;
}

interface WorkspaceConstructionSceneProps {
  formState: FormState;
}

export const WorkspaceConstructionScene: React.FC<WorkspaceConstructionSceneProps> = ({ formState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(formState);

  // Label DOM element refs
  const centerLabelRef = useRef<HTMLDivElement>(null);
  const titleLabelRef = useRef<HTMLDivElement>(null);
  const questionLabelRef = useRef<HTMLDivElement>(null);
  const domainLabelRef = useRef<HTMLDivElement>(null);
  const objectiveLabelRef = useRef<HTMLDivElement>(null);
  const docLabelRef = useRef<HTMLDivElement>(null);
  const linkLabelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stateRef.current = formState;
  }, [formState]);

  useEffect(() => {
    if (!containerRef.current) return;

    let w = containerRef.current.clientWidth;
    let h = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Materials with vibrant emissive glows
    const materials = {
      center: new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x666666,
        shininess: 90
      }),
      title: new THREE.MeshPhongMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.6,
        shininess: 100
      }),
      question: new THREE.MeshPhongMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.6,
        shininess: 100
      }),
      domain: new THREE.MeshPhongMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.6,
        shininess: 100
      }),
      objective: new THREE.MeshPhongMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.6,
        shininess: 100
      }),
      doc: new THREE.MeshPhongMaterial({
        color: 0x8b5cf6,
        emissive: 0x6d28d9,
        emissiveIntensity: 0.5
      }),
      link: new THREE.MeshPhongMaterial({
        color: 0xec4899,
        emissive: 0xbe185d,
        emissiveIntensity: 0.5
      })
    };

    const geometries = {
      sphere: new THREE.SphereGeometry(0.65, 32, 32),
      smallSphere: new THREE.SphereGeometry(0.38, 32, 32),
      box: new THREE.BoxGeometry(0.42, 0.42, 0.42),
      octahedron: new THREE.OctahedronGeometry(0.38)
    };

    const centerNode = new THREE.Mesh(geometries.sphere, materials.center);
    group.add(centerNode);

    // Subtle pulsing halo for center
    const centerHaloGeo = new THREE.RingGeometry(0.72, 0.82, 32);
    const centerHaloMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const centerHalo = new THREE.Mesh(centerHaloGeo, centerHaloMat);
    group.add(centerHalo);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.5);
    dirLight2.position.set(-5, -5, -2);
    scene.add(dirLight2);

    interface GraphNode {
      mesh: THREE.Mesh;
      line: THREE.Line;
      halo: THREE.Mesh;
      targetPos: THREE.Vector3;
      visible: boolean;
      scaleProgress: number;
    }

    const nodes: Record<string, GraphNode> = {};

    const createNode = (
      key: string,
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      pos: THREE.Vector3,
      haloColor: number
    ) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, 0);
      mesh.scale.set(0.001, 0.001, 0.001);
      mesh.visible = false;
      group.add(mesh);

      // Glowing pulsing ring around node
      const haloGeo = new THREE.RingGeometry(0.44, 0.52, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: haloColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.visible = false;
      group.add(halo);

      const lineMat = new THREE.LineBasicMaterial({
        color: haloColor,
        transparent: true,
        opacity: 0.35
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0)
      ]);
      const line = new THREE.Line(lineGeo, lineMat);
      line.visible = false;
      group.add(line);

      nodes[key] = { mesh, line, halo, targetPos: pos, visible: false, scaleProgress: 0 };
    };

    createNode('title', geometries.smallSphere, materials.title, new THREE.Vector3(-2.2, 2.4, 0.2), 0x06b6d4);
    createNode('question', geometries.smallSphere, materials.question, new THREE.Vector3(2.6, 1.8, -0.2), 0x3b82f6);
    createNode('domain', geometries.smallSphere, materials.domain, new THREE.Vector3(-2.6, -1.8, -0.2), 0x10b981);
    createNode('objective', geometries.smallSphere, materials.objective, new THREE.Vector3(2.2, -2.4, 0.2), 0xf59e0b);

    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 3.6;
      createNode(
        `doc_${i}`,
        geometries.box,
        materials.doc,
        new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 2),
        0x8b5cf6
      );
      createNode(
        `link_${i}`,
        geometries.octahedron,
        materials.link,
        new THREE.Vector3(Math.cos(angle + 0.1) * radius, Math.sin(angle + 0.1) * radius, (Math.random() - 0.5) * 2),
        0xec4899
      );
    }

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrame: number;
    let time = 0;
    const tempProj = new THREE.Vector3();

    // Updates screen position of HTML label directly on DOM
    const updateLabelPosition = (
      el: HTMLElement | null,
      worldPos: THREE.Vector3,
      isVisible: boolean,
      yOffset = 0.55
    ) => {
      if (!el) return;
      if (!isVisible) {
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%, -100%) scale(0.6)';
        return;
      }

      tempProj.copy(worldPos);
      tempProj.y += yOffset;
      group.localToWorld(tempProj);
      tempProj.project(camera);

      // Only render if in front of camera
      if (tempProj.z < 1) {
        const screenX = (tempProj.x * 0.5 + 0.5) * w;
        const screenY = (-tempProj.y * 0.5 + 0.5) * h;
        el.style.left = `${screenX}px`;
        el.style.top = `${screenY}px`;
        el.style.opacity = '1';
        el.style.transform = 'translate(-50%, -100%) scale(1)';
      } else {
        el.style.opacity = '0';
      }
    };

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      time += 0.015;

      group.rotation.y += 0.002;
      group.rotation.x = Math.sin(time * 0.5) * 0.08;

      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Center pulse
      const centerPulse = 1 + Math.sin(time * 2) * 0.04;
      centerNode.scale.set(centerPulse, centerPulse, centerPulse);
      centerHalo.scale.set(centerPulse * 1.1, centerPulse * 1.1, 1);
      centerHalo.quaternion.copy(camera.quaternion);

      const s = stateRef.current;

      const updateNodeStatus = (key: string, isActive: boolean) => {
        const node = nodes[key];
        if (!node) return;
        node.visible = isActive;

        if (isActive) {
          node.mesh.visible = true;
          node.line.visible = true;
          node.halo.visible = true;

          // Pop-in spring lerp
          node.scaleProgress = THREE.MathUtils.lerp(node.scaleProgress, 1, 0.08);
          const bounceScale = node.scaleProgress < 0.95 ? node.scaleProgress * 1.08 : 1;
          node.mesh.scale.set(bounceScale, bounceScale, bounceScale);

          node.mesh.position.lerp(node.targetPos, 0.06);

          // Gentle floating bob
          const floatOffset = new THREE.Vector3(
            Math.sin(time * 2 + node.targetPos.x) * 0.12,
            Math.cos(time * 2 + node.targetPos.y) * 0.12,
            Math.sin(time * 2 + node.targetPos.z) * 0.12
          );
          const currentPos = node.mesh.position.clone().add(floatOffset);

          // Update halo ring
          node.halo.position.copy(currentPos);
          node.halo.quaternion.copy(camera.quaternion);
          const haloPulse = 1 + Math.sin(time * 3 + node.targetPos.x) * 0.15;
          node.halo.scale.set(haloPulse, haloPulse, 1);

          // Update connection line
          const positions = new Float32Array([
            0, 0, 0,
            currentPos.x, currentPos.y, currentPos.z
          ]);
          node.line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          node.line.geometry.attributes.position.needsUpdate = true;
        } else {
          node.scaleProgress = 0;
          node.mesh.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
          node.mesh.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 0.1);
          if (node.mesh.scale.x < 0.02) {
            node.mesh.visible = false;
            node.line.visible = false;
            node.halo.visible = false;
          }
        }
      };

      updateNodeStatus('title', s.hasTitle);
      updateNodeStatus('question', s.hasQuestion);
      updateNodeStatus('domain', s.hasDomain);
      updateNodeStatus('objective', s.hasObjective);

      for (let i = 0; i < 20; i++) {
        updateNodeStatus(`doc_${i}`, i < s.documentCount);
        updateNodeStatus(`link_${i}`, i < s.linkCount);
      }

      // Update screen-space header labels
      updateLabelPosition(centerLabelRef.current, centerNode.position, true, 0.85);

      if (nodes.title) {
        updateLabelPosition(titleLabelRef.current, nodes.title.mesh.position, s.hasTitle, 0.6);
      }
      if (nodes.question) {
        updateLabelPosition(questionLabelRef.current, nodes.question.mesh.position, s.hasQuestion, 0.6);
      }
      if (nodes.domain) {
        updateLabelPosition(domainLabelRef.current, nodes.domain.mesh.position, s.hasDomain, 0.6);
      }
      if (nodes.objective) {
        updateLabelPosition(objectiveLabelRef.current, nodes.objective.mesh.position, s.hasObjective, 0.6);
      }
      if (nodes.doc_0) {
        updateLabelPosition(docLabelRef.current, nodes.doc_0.mesh.position, s.documentCount > 0, 0.6);
      }
      if (nodes.link_0) {
        updateLabelPosition(linkLabelRef.current, nodes.link_0.mesh.position, s.linkCount > 0, 0.6);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      w = containerRef.current.clientWidth;
      h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
      centerHaloGeo.dispose();
      centerHaloMat.dispose();
      Object.values(nodes).forEach((n) => {
        n.mesh.geometry.dispose();
        if (Array.isArray(n.mesh.material)) {
          n.mesh.material.forEach((m) => m.dispose());
        } else {
          n.mesh.material.dispose();
        }
        n.line.geometry.dispose();
        if (Array.isArray(n.line.material)) {
          n.line.material.forEach((m) => m.dispose());
        } else {
          n.line.material.dispose();
        }
        n.halo.geometry.dispose();
        if (Array.isArray(n.halo.material)) {
          n.halo.material.forEach((m) => m.dispose());
        } else {
          n.halo.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px] relative overflow-hidden select-none">
      {/* 1. Research Core Center Label */}
      <div
        ref={centerLabelRef}
        className="absolute top-0 left-0 transition-opacity duration-300 pointer-events-none z-10 flex flex-col items-center"
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0f172a]/85 backdrop-blur-md border border-white/20 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.15)] whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[11px] font-semibold text-slate-200 tracking-wider">RESEARCH HUB</span>
        </div>
        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white/30 -mt-[1px]" />
      </div>

      {/* 2. Title Ball Label */}
      <div
        ref={titleLabelRef}
        className="absolute top-0 left-0 transition-opacity duration-300 pointer-events-none z-20 flex flex-col items-center"
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0a1628]/90 backdrop-blur-md border border-cyan-400/70 rounded-full shadow-[0_0_14px_rgba(6,182,212,0.45)] whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-bold text-cyan-300 tracking-wider">
            {formState.titleText ? `TITLE: ${formState.titleText.slice(0, 18)}${formState.titleText.length > 18 ? '...' : ''}` : 'RESEARCH TITLE'}
          </span>
        </div>
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-cyan-400/80 -mt-[1px]" />
      </div>

      {/* 3. Question Ball Label */}
      <div
        ref={questionLabelRef}
        className="absolute top-0 left-0 transition-opacity duration-300 pointer-events-none z-20 flex flex-col items-center"
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0a1628]/90 backdrop-blur-md border border-blue-400/70 rounded-full shadow-[0_0_14px_rgba(37,99,235,0.45)] whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span className="text-[11px] font-bold text-blue-300 tracking-wider">RESEARCH QUESTION</span>
        </div>
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-blue-400/80 -mt-[1px]" />
      </div>

      {/* 4. Domain Ball Label */}
      <div
        ref={domainLabelRef}
        className="absolute top-0 left-0 transition-opacity duration-300 pointer-events-none z-20 flex flex-col items-center"
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0a1628]/90 backdrop-blur-md border border-emerald-400/70 rounded-full shadow-[0_0_14px_rgba(16,185,129,0.45)] whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-bold text-emerald-300 tracking-wider">
            {formState.domainText ? `DOMAIN: ${formState.domainText}` : 'RESEARCH DOMAIN'}
          </span>
        </div>
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-emerald-400/80 -mt-[1px]" />
      </div>

      {/* 5. Objective Ball Label */}
      <div
        ref={objectiveLabelRef}
        className="absolute top-0 left-0 transition-opacity duration-300 pointer-events-none z-20 flex flex-col items-center"
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0a1628]/90 backdrop-blur-md border border-amber-400/70 rounded-full shadow-[0_0_14px_rgba(245,158,11,0.45)] whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-[11px] font-bold text-amber-300 tracking-wider">RESEARCH OBJECTIVE</span>
        </div>
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-400/80 -mt-[1px]" />
      </div>

      {/* 6. Documents Cube Label */}
      <div
        ref={docLabelRef}
        className="absolute top-0 left-0 transition-opacity duration-300 pointer-events-none z-20 flex flex-col items-center"
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0a1628]/90 backdrop-blur-md border border-purple-400/70 rounded-full shadow-[0_0_14px_rgba(139,92,246,0.45)] whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span className="text-[11px] font-bold text-purple-300 tracking-wider">
            DOCUMENTS ({formState.documentCount})
          </span>
        </div>
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-purple-400/80 -mt-[1px]" />
      </div>

      {/* 7. Web Links Octahedron Label */}
      <div
        ref={linkLabelRef}
        className="absolute top-0 left-0 transition-opacity duration-300 pointer-events-none z-20 flex flex-col items-center"
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0a1628]/90 backdrop-blur-md border border-pink-400/70 rounded-full shadow-[0_0_14px_rgba(236,72,153,0.45)] whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
          <span className="text-[11px] font-bold text-pink-300 tracking-wider">
            WEB LINKS ({formState.linkCount})
          </span>
        </div>
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-pink-400/80 -mt-[1px]" />
      </div>
    </div>
  );
};
