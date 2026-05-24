import React from 'react';
import { Link } from 'react-router-dom';

function BountyCard({ bounty }) {
  const isOpen = bounty.status === 'open';

  return (
    <Link
      to={`/bounty/${bounty.bounty_id}`}
      className={`group block p-5 bg-[#0a0a0a] border transition-all duration-300 ${
        isOpen
          ? 'border-white/30 hover:border-white hover:shadow-[0_0_20px_rgba(255, 255, 255,0.2)]'
          : 'border-gray-800 opacity-70 hover:opacity-100'
      }`}
    >
      {/* Terminal header */}
      <div className="flex items-start justify-between mb-3 gap-2 pb-2 border-b border-gray-800">
        <div className="font-mono text-[10px] text-gray-500 tracking-widest">
          {'> '}{bounty.bounty_id?.toUpperCase()}
        </div>
        <span
          className={`font-mono flex-shrink-0 text-[10px] px-2 py-0.5 tracking-widest uppercase ${
            isOpen
              ? 'bg-white/10 text-white border border-white/40'
              : 'bg-black text-gray-500 border border-gray-700'
          }`}
        >
          {isOpen ? '- OPEN' : '-‹ CLOSED'}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-mono font-bold text-white text-base leading-tight line-clamp-2 mb-3 group-hover:text-white transition-colors">
        {bounty.title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
        {bounty.description}
      </p>

      {/* Requirement tags - terminal params */}
      {bounty.requirements && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {bounty.requirements
            .split(',')
            .slice(0, 3)
            .map((req, i) => (
              <span
                key={i}
                className="font-mono bg-black border border-gray-700 text-gray-300 px-2 py-0.5 text-[10px] tracking-wider"
              >
                {req.trim()}
              </span>
            ))}
          {bounty.requirements.split(',').length > 3 && (
            <span className="font-mono text-[10px] text-gray-500">
              +{bounty.requirements.split(',').length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        <div className="font-mono flex items-baseline gap-1">
          <span className="text-white font-bold text-base">{bounty.reward_points}</span>
          <span className="text-gray-500 text-[10px] uppercase tracking-widest">PTS</span>
        </div>
        <span className="font-mono text-gray-500 text-[10px] tracking-wider">
          {bounty.creator
            ? `${bounty.creator.slice(0, 6)}...${bounty.creator.slice(-4)}`
            : '-'}
        </span>
      </div>
    </Link>
  );
}

export default BountyCard;
