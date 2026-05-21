import React from 'react';

function getScoreColor(score) {
  if (score >= 90) return { color: '#10b981', label: 'Excellent' };
  if (score >= 80) return { color: '#3b82f6', label: 'Good' };
  if (score >= 70) return { color: '#f59e0b', label: 'Average' };
  if (score >= 60) return { color: '#f97316', label: 'Below Avg' };
  return { color: '#ef4444', label: 'Poor' };
}

function ScoreCircle({ score, size = 120 }) {
  const { color } = getScoreColor(score);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1e1e2e"
          strokeWidth="6"
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-heading font-bold text-2xl"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-muted text-xs">/100</span>
      </div>
    </div>
  );
}

export default ScoreCircle;
export { getScoreColor };
