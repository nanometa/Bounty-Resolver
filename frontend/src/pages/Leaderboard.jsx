import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWinnerPoints, getAllBounties } from '../contract';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAddress, setSearchAddress] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      // Get all bounties to extract unique addresses
      const bounties = await getAllBounties();
      const addresses = new Set();

      for (const b of bounties) {
        if (b.creator) addresses.add(b.creator);
      }

      // Get points for all known addresses
      const entries = [];
      for (const addr of addresses) {
        const points = await getWinnerPoints(addr);
        if (points > 0) {
          entries.push({ address: addr, points });
        }
      }

      // Sort by points descending
      entries.sort((a, b) => b.points - a.points);
      setLeaderboard(entries);
    } catch {
      setLeaderboard([]);
    }
    setLoading(false);
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchAddress.trim()) return;
    try {
      const points = await getWinnerPoints(searchAddress.trim());
      setSearchResult({ address: searchAddress.trim(), points });
    } catch {
      setSearchResult({ address: searchAddress.trim(), points: 0 });
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="text-slate-400 hover:text-white text-sm mb-6 inline-block">
        ← Back to Bounties
      </Link>

      <h1 className="font-heading font-bold text-2xl mb-6">Leaderboard</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Search by address (0x...)"
            className="flex-1 bg-[#0a0a12] border border-[#1a1a2e] rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all border border-violet-500/50"
          >
            Search
          </button>
        </div>
      </form>

      {/* Search Result */}
      {searchResult && (
        <div className="mb-8 p-4 rounded-lg border border-violet-500/20 bg-violet-500/5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-white">{searchResult.address}</span>
            <span className="font-heading font-bold text-violet-400 text-lg">
              {searchResult.points} pts
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 border border-[#1a1a2e] rounded-xl bg-[#0c0c14]">
          <p className="text-slate-400">No winners yet. Be the first to complete a bounty!</p>
        </div>
      ) : (
        <div className="border border-[#1a1a2e] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_120px] px-4 py-3 bg-[#0c0c14] border-b border-[#1a1a2e] text-slate-400 text-xs uppercase">
            <span>Rank</span>
            <span>Address</span>
            <span className="text-right">Points</span>
          </div>

          {/* Rows */}
          {leaderboard.map((entry, index) => (
            <div
              key={entry.address}
              className="grid grid-cols-[60px_1fr_120px] px-4 py-4 border-b border-[#1a1a2e] last:border-0 hover:bg-[#0c0c14]/50 transition-colors"
            >
              <span className="font-heading font-bold text-white">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </span>
              <span className="font-mono text-sm text-white truncate">
                {entry.address}
              </span>
              <span className="font-heading font-bold text-violet-400 text-right">
                {entry.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;


