import React, { useId, useEffect, useState, useMemo } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "../../lib/utils";
import { motion, useAnimation } from "framer-motion";

let engineInitialized = false;
let initPromise = null;

export const SparklesCore = (props) => {
  const {
    id,
    className,
    background,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleDensity,
  } = props;
  const [init, setInit] = useState(engineInitialized);
  const controls = useAnimation();
  const generatedId = useId();

  useEffect(() => {
    if (engineInitialized) {
      setInit(true);
      return;
    }
    if (!initPromise) {
      initPromise = (async () => {
        // tsparticles v3 uses different init
        const { tsParticles } = await import("@tsparticles/engine");
        await loadSlim(tsParticles);
        engineInitialized = true;
      })();
    }
    initPromise.then(() => setInit(true));
  }, []);

  const particlesLoaded = async (container) => {
    if (container) {
      controls.start({ opacity: 1, transition: { duration: 1 } });
    }
  };

  const options = useMemo(() => ({
    background: { color: { value: background || "transparent" } },
    fullScreen: { enable: false, zIndex: 1 },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: { enable: true, mode: "push" },
        onHover: { enable: false, mode: "repulse" },
      },
      modes: {
        push: { quantity: 4 },
        repulse: { distance: 200, duration: 0.4 },
      },
    },
    particles: {
      color: { value: particleColor || "#ffffff" },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "out" },
        random: false,
        speed: { min: 0.1, max: 1 },
        straight: false,
      },
      number: {
        density: { enable: true, width: 400, height: 400 },
        value: particleDensity || 120,
      },
      opacity: {
        value: { min: 0.1, max: 1 },
        animation: { enable: true, speed: speed || 4, sync: false, startValue: "random" },
      },
      shape: { type: "circle" },
      size: { value: { min: minSize || 1, max: maxSize || 3 } },
    },
    detectRetina: true,
  }), [background, minSize, maxSize, speed, particleColor, particleDensity]);

  return (
    <motion.div animate={controls} className={cn("opacity-0", className)}>
      {init && (
        <Particles
          id={id || generatedId}
          className={cn("h-full w-full")}
          particlesLoaded={particlesLoaded}
          options={options}
        />
      )}
    </motion.div>
  );
};
