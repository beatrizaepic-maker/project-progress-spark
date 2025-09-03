import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const LivingNebulaShader = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1) Renderer, Scene, Camera, Clock
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    // 2) Shaders
    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;

      float random(vec2 st) {
        return fract(
          sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123
        );
      }

      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(random(i), random(i + vec2(1.0, 0.0)), u.x),
          mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 6; i++) {
          v += a * noise(p);
          p = p * 2.0;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        // Normalize to −1..1 on the shorter side
        vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy)
                     / iResolution.y;
        vec2 mouse = (iMouse      - 0.5 * iResolution.xy)
                     / iResolution.y;
        float t    = iTime * 0.1;

        // Warp around mouse
        float md = length(uv - mouse);
        vec2 offset = normalize(uv - mouse) / (md * 50.0 + 1.0);
        uv += offset * smoothstep(0.3, 0.0, md);

        // Rotate flow
        float angle = t * 0.3;
        mat2 rot = mat2(
          cos(angle), -sin(angle),
          sin(angle),  cos(angle)
        );
        uv = rot * uv;

        // Multi-layer nebula
        float n1 = fbm(uv * 3.0 + t * 2.0);
        float n2 = fbm(uv * 5.0 - t * 1.5);
        float n3 = fbm(uv * 8.0 + t * 0.8);

        float density = n1 * 0.6 + n2 * 0.3 + n3 * 0.1;
        density = smoothstep(0.2, 0.8, density);

        // Color palette
        vec3 color1 = vec3(0.3, 0.4, 0.9);  // Lighter blue
        vec3 color2 = vec3(1.0, 0.6, 1.0);  // Light purple/pink
        vec3 color3 = vec3(0.4, 1.0, 0.9);  // Light cyan
        
        vec3 color = mix(color1, color2, density);
        color = mix(color, color3, n3 * 0.5);

        // Add some glow - increased brightness
        float glow = 1.0 - length(uv) * 0.3;
        color *= glow * 1.2;

        gl_FragColor = vec4(color, density * 0.7);
      }
    `;

    // 3) Build Mesh
    const uniforms = {
      iTime:       { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse:      { value: new THREE.Vector2(-100, -100) }
    };
    const material = new THREE.ShaderMaterial({ 
      vertexShader, 
      fragmentShader, 
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    // 4) Resize Handler
    const onResize = () => {
      const width  = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.iResolution.value.set(width, height);
    };
    window.addEventListener('resize', onResize);
    onResize();

    // 5) Mouse Handler
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = container.clientHeight - (e.clientY - rect.top);
      uniforms.iMouse.value.set(x, y);
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', onMouseMove);

    // 6) Animation Loop
    renderer.setAnimationLoop(() => {
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    });

    // 7) Cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.setAnimationLoop(null);

      const canvas = renderer.domElement;
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }

      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
      aria-label="Living Nebula animated background"
    />
  );
};

export default LivingNebulaShader;
