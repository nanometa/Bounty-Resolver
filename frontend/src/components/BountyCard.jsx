import React from 'react';
import { Link } from 'react-router-dom';

function BountyCard({ bounty }) {
  const isOpen = bounty.status === 'open';

  return (
    <Link
      to={`/bounty/${bounty.bounty_id}`}
      className={`group block card-futuristic rounded-2xl p-5 transition-all duration-500 ease-in-out ${
        !isOpen ? 'opacity-75 scale-[0.98]' : 'opacity-100 scale-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <h3 className="font-heading font-bold text-white text-base leading-tight line-clamp-2 group-hover:text-violet-300 transition-colors">
          {bounty.title}
        </h3>
        <span className={`flex-shrink-0 text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
          isOpen ? 'status-open' : 'status-closed'
        }`}>
          {isOpen ? '● Live' : '○ Closed'}
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
        {bounty.description}
      </p>

      {/* Requirements chips */}
      {bounty.requirements && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {bounty.requirements.split(',').slice(0, 3).map((req, i) => (
            <span key={i} className="chip">{req.trim()}</span>
          ))}
          {bounty.requirements.split(',').length > 3 && (
            <span className="text-[11px] text-slate-500">+{bounty.requirements.split(',').length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-violet-900/20">
        <div className="flex items-center gap-2">
          <span className="text-violet-400 font-heading font-bold text-sm">{bounty.reward_points}</span>
          <span className="text-slate-500 text-xs">pts</span>
        </div>
        <span className="text-slate-500 text-xs font-mono">
          {bounty.creator ? `${bounty.creator.slice(0, 6)}...${bounty.creator.slice(-4)}` : '—'}
        </span>
      </div>
    </Link>
  );
}

export default BountyCard;
