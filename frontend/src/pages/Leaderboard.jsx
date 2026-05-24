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
      const bounties = await getAllBounties();
      const addresses = new Set();

      for (const b of bounties) {
        if (b.creator) addresses.add(b.creator);
      }

      const entries = [];
      for (const addr of addresses) {
        const points = await getWinnerPoints(addr);
        if (points > 0) {
          entries.push({ address: addr, points });
        }
      }

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
      <Link to="/app" className="font-mono text-xs text-gray-500 hover:text-white mb-6 inline-block tracking-widest transition-colors">
        {'< BACK_TO_BOUNTIES'}
      </Link>

      <div className="mb-8">
        <div className="font-mono text-xs text-white tracking-widest mb-2">// REPUTATION_LEDGER</div>
        <h1 className="font-mono font-bold text-3xl text-white tracking-tight">
          Leaderboard<span className="text-white">()</span>
        </h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <label className="block font-mono text-xs text-gray-400 mb-2 tracking-widest uppercase">
          Query_Address
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="0x..."
            className="flex-1 font-mono bg-[#0a0a0a] border border-gray-700 px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
          />
          <button
            type="submit"
            className="font-mono px-6 py-3 bg-white hover:bg-white text-black font-bold uppercase tracking-widest text-sm transition-all hover:shadow-[0_0_20px_rgba(255, 255, 255,0.5)]"
          >
            SEARCH
          </button>
        </div>
      </form>

      {/* Search Result */}
      {searchResult && (
        <div className="mb-8 p-4 border border-white/30 bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-gray-300 break-all">{searchResult.address}</span>
            <span className="font-mono font-bold text-white text-lg ml-4">
              {searchResult.points} PTS
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-none animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 border border-white/20 bg-[#0a0a0a]">
          <p className="font-mono text-gray-500 text-sm tracking-wider">
            {'> NO_WINNERS_YET // BE_THE_FIRST_TO_COMPLETE_A_BOUNTY'}
          </p>
        </div>
      ) : (
        <div className="border border-white/30 bg-[#0a0a0a]">
          <div className="grid grid-cols-[60px_1fr_120px] px-4 py-3 border-b border-white/30 font-mono text-gray-500 text-xs tracking-widest uppercase">
            <span>Rank</span>
            <span>Address</span>
            <span className="text-right">Points</span>
          </div>

          {leaderboard.map((entry, index) => (
            <div
              key={entry.address}
              className="grid grid-cols-[60px_1fr_120px] px-4 py-4 border-b border-gray-800 last:border-0 hover:bg-white/5 transition-colors font-mono"
            >
              <span className="font-bold text-white">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-sm text-white truncate">{entry.address}</span>
              <span className="font-bold text-white text-right">{entry.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
