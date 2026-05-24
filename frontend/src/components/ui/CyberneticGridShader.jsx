import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Cybernetic Grid Shader background.
 * Adapted to brutalist mono palette (white-on-black, low opacity).
 *
 * - Fixed full-screen, behind content (z=-10), pointer-events-none
 * - Uses an off-canvas mouse so the warp/glow stays subtle and ambient
 */
const CyberneticGridShader = ({ opacity = 0.5 }) => {
  const containerRef = useRef(null);

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

    // 2) GLSL Shaders
    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Brutalist version: pure white grid + white energy pulses, no color
    const fragmentShader = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        vec2 mouse = (iMouse - 0.5 * iResolution.xy) / iResolution.y;

        float t = iTime * 0.15;
        float mouseDist = length(uv - mouse);

        // Subtle warp around the (off-screen) mouse
        float warp = sin(mouseDist * 18.0 - t * 3.0) * 0.05;
        warp *= smoothstep(0.5, 0.0, mouseDist);
        uv += warp;

        // Grid lines (more visible)
        vec2 gridUv = abs(fract(uv * 12.0) - 0.5);
        float line = pow(1.0 - min(gridUv.x, gridUv.y), 30.0);

        // Pulsing white grid
        vec3 color = vec3(1.0) * line * (0.6 + sin(t * 1.6) * 0.2);

        // Energetic pulses along grid (white)
        float energy = sin(uv.x * 18.0 + t * 4.0) * sin(uv.y * 18.0 + t * 2.5);
        energy = smoothstep(0.75, 1.0, energy);
        color += vec3(1.0) * energy * line * 1.2;

        // Soft glow around mouse
        float glow = smoothstep(0.18, 0.0, mouseDist);
        color += vec3(1.0) * glow * 0.4;

        // Subtle noise
        color += random(uv + t * 0.1) * 0.03;

        // Compute alpha so empty zones stay transparent (canvas alpha = true)
        float alpha = clamp(max(max(color.r, color.g), color.b), 0.0, 1.0);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    // 3) Uniforms, Material, Mesh
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse: {
        value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
      },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 4) Resize handler
    const onResize = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      uniforms.iResolution.value.set(width, height);
    };
    window.addEventListener('resize', onResize);
    onResize();

    // 5) Mouse handler (track mouse for subtle parallax glow)
    const onMouseMove = (e) => {
      uniforms.iMouse.value.set(
        e.clientX,
        (container.clientHeight || window.innerHeight) - e.clientY
      );
    };
    window.addEventListener('mousemove', onMouseMove);

    // 6) Animation loop
    renderer.setAnimationLoop(() => {
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    });

    // 7) Cleanup on unmount
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.setAnimationLoop(null);
      const canvas = renderer.domElement;
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      material.dispose();
      geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -10,
        pointerEvents: 'none',
        opacity,
      }}
    />
  );
};

export default CyberneticGridShader;
