import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBounties, getBountyCount, getSubmissionCount } from '../contract';
import BountyCard from '../components/BountyCard';
import { SparklesCore } from '../components/ui/Sparkles';

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
      <div className="text-center mb-16 pt-12 relative">
        {/* Sparkles Background */}
        <div className="w-full absolute inset-0 h-[300px]">
          <SparklesCore
            id="hero-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.4}
            particleDensity={80}
            className="w-full h-full"
            particleColor="#a855f7"
            speed={1}
          />
        </div>

        <div className="relative z-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-violet-400 pulse-glow" />
            <span className="text-violet-300 text-xs font-medium">Decentralized AI Judgment Protocol</span>
          </div>
          <h1 className="font-heading font-bold text-5xl md:text-7xl gradient-text mb-5 leading-tight">
            Build. Prove. Win.
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Create bounties, submit solutions, and let GenLayer AI validators
            evaluate your work through <span className="text-violet-400">decentralized consensus</span>.
          </p>

          {/* Gradient lines under hero */}
          <div className="w-[40rem] max-w-full h-10 relative mx-auto mt-8">
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-violet-500 to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-violet-500 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent h-px w-1/4" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-950/20 border border-violet-500/20 backdrop-blur-sm">
          <span className="font-heading font-bold text-violet-400 text-lg">{bountyCount}</span>
          <span className="text-slate-400 text-sm">Bounties</span>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fuchsia-950/20 border border-fuchsia-500/20 backdrop-blur-sm">
          <span className="font-heading font-bold text-fuchsia-400 text-lg">{submissionCount}</span>
          <span className="text-slate-400 text-sm">Submissions</span>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-950/20 border border-violet-500/20 backdrop-blur-sm">
          <span className="text-violet-400/80 text-sm font-medium">Powered by GenLayer AI</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-red-500 rounded-full animate-spin" />
        </div>
      ) : bounties.length === 0 ? (
        <div className="text-center py-20 border border-[#1a1a2e] rounded-xl bg-[#0c0c14]">
          <p className="text-slate-400 text-lg mb-4">No bounties yet. Be the first to create one!</p>
          <Link to="/create" className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all border border-violet-500/50">
            Create Bounty
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bounties.map(bounty => (
            <BountyCard key={bounty.bounty_id} bounty={bounty} />
          ))}
        </div>
      )}

      {/* No floating button — Create Bounty is in the navbar */}
    </div>
  );
}

export default Home;


