import React from 'react';

/**
 * Brutalist Logo - Geometric helmet with target reticle.
 * Stroke-based SVG, inherits color from `currentColor` (text-* classes).
 */
function Logo({ className = 'w-12 h-12', color = 'currentColor' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-label="Bounty Resolver Logo"
    >
      {/* Outer hexagonal helmet */}
      <path d="M32 4 L52 16 L52 40 L42 56 L22 56 L12 40 L12 16 Z" />

      {/* Inner panel lines */}
      <path d="M32 4 L32 22" />
      <path d="M12 16 L26 28" />
      <path d="M52 16 L38 28" />
      <path d="M22 56 L26 44" />
      <path d="M42 56 L38 44" />

      {/* Target reticle (crosshair circle) */}
      <circle cx="32" cy="32" r="9" />
      <line x1="32" y1="20" x2="32" y2="26" />
      <line x1="32" y1="38" x2="32" y2="44" />
      <line x1="20" y1="32" x2="26" y2="32" />
      <line x1="38" y1="32" x2="44" y2="32" />
      <circle cx="32" cy="32" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

export default Logo;
