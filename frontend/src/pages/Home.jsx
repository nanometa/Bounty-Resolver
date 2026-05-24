import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBounties, getBountyCount, getSubmissionCount } from '../contract';
import BountyCard from '../components/BountyCard';

function Home() {
  const [bounties, setBounties] = useState([]);
  const [bountyCount, setBountyCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [bCount, sCount, allBounties] = await Promise.all([
        getBountyCount(), getSubmissionCount(), getAllBounties(),
      ]);
      setBountyCount(bCount);
      setSubmissionCount(sCount);
      setBounties(allBounties);
    } catch {
      setBounties([]);
    }
    setLoading(false);
  }

  return (
    <div>
      {/* Hero */}
      <div className="text-left mb-12 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/30 bg-black mb-6">
          <span className="w-2 h-2 bg-white animate-pulse" />
          <span className="font-mono text-white text-[10px] tracking-widest uppercase">
            // DECENTRALIZED_AI_JUDGMENT_PROTOCOL
          </span>
        </div>

        <h1 className="font-mono font-bold text-4xl md:text-6xl mb-5 leading-tight tracking-tight">
          <span className="text-white">BUILD</span>
          <span className="text-white">.</span>
          <span className="text-white">PROVE</span>
          <span className="text-white">.</span>
          <span className="text-white">WIN</span>
          <span className="text-white animate-pulse">_</span>
        </h1>

        <p className="text-gray-400 text-base max-w-2xl leading-relaxed font-mono">
          {'> '}Create bounties, submit solutions, and let GenLayer AI validators evaluate your work through{' '}
          <span className="text-white">decentralized_consensus()</span>.
        </p>

        {/* Brutalist separator */}
        <div className="border-b border-dashed border-gray-700 mt-8 mb-2" />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-3 mb-10">
        <div className="flex items-center gap-2 px-4 py-2 border border-white/30 bg-[#0a0a0a]">
          <span className="font-mono font-bold text-white text-base">{bountyCount}</span>
          <span className="font-mono text-gray-400 text-xs uppercase tracking-widest">Bounties</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border border-white/30 bg-[#0a0a0a]">
          <span className="font-mono font-bold text-white text-base">{submissionCount}</span>
          <span className="font-mono text-gray-400 text-xs uppercase tracking-widest">Submissions</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border border-gray-800 bg-[#0a0a0a]">
          <span className="font-mono text-gray-400 text-xs uppercase tracking-widest">
            {'> '}POWERED_BY_GENLAYER_AI
          </span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-white border-t-transparent animate-spin" />
        </div>
      ) : bounties.length === 0 ? (
        <div className="text-center py-20 border border-white/30 bg-[#0a0a0a]">
          <p className="font-mono text-gray-500 text-sm mb-6 tracking-widest">
            {'> NO_BOUNTIES_FOUND // BE_THE_FIRST'}
          </p>
          <Link
            to="/create"
            className="font-mono inline-block px-8 py-3 bg-white hover:bg-white text-black font-bold uppercase tracking-widest text-sm transition-all hover:shadow-[0_0_30px_rgba(255, 255, 255,0.5)]"
          >
            [ CREATE_BOUNTY ]
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bounties.map((bounty) => (
            <BountyCard key={bounty.bounty_id} bounty={bounty} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
