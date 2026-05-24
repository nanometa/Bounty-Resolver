import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../WalletContext';
import { getBounty, getBountySubmissions, getSubmission, getScore, closeBounty, getReadClient, waitForTransaction } from '../contract';
import TxStatus from '../components/TxStatus';
import { getScoreColor } from '../components/ScoreCircle';

function BountyDetail() {
  const { bounty_id } = useParams();
  const navigate = useNavigate();
  const wallet = useWallet() ?? {};
  const { address = null } = wallet;

  const [bounty, setBounty] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closingTx, setClosingTx] = useState({ status: null, hash: null, error: null });

  useEffect(() => {
    loadBounty();
  }, [bounty_id]);

  async function loadBounty() {
    setLoading(true);
    try {
      const bountyData = await getBounty(bounty_id);
      const parsed = JSON.parse(bountyData);
      setBounty(parsed);

      const subsData = await getBountySubmissions(bounty_id);
      const subIds = JSON.parse(subsData);
      const subsWithScores = [];
      for (const subId of subIds) {
        const subData = await getSubmission(subId);
        const sub = JSON.parse(subData);
        const score = await getScore(subId);
        subsWithScores.push({ ...sub, score });
      }
      setSubmissions(subsWithScores);
    } catch {
      setBounty(null);
      setSubmissions([]);
    }
    setLoading(false);
  }

  async function handleCloseBounty() {
    if (!address) return;
    setClosingTx({ status: 'pending', hash: null, error: null });
    try {
      const hash = await closeBounty(address, bounty_id);
      setClosingTx({ status: 'pending', hash, error: null });
      const client = getReadClient();
      await waitForTransaction(client, hash, (s) => {
        setClosingTx(prev => ({ ...prev, status: s }));
      });
      setClosingTx({ status: 'FINALIZED', hash, error: null });
      setTimeout(loadBounty, 2000);
    } catch (err) {
      const msg = err.message || 'Transaction failed';
      if (msg.includes('Consensus taking longer')) {
        setClosingTx({ status: 'timeout', hash: closingTx.hash, error: msg });
      } else {
        setClosingTx({ status: 'error', hash: null, error: msg });
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-none animate-spin" />
      </div>
    );
  }

  if (!bounty || !bounty.bounty_id) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link to="/app" className="font-mono text-xs text-gray-500 hover:text-white mb-6 inline-block tracking-widest transition-colors">
          {'< BACK_TO_BOUNTIES'}
        </Link>
        <div className="text-center py-16 border border-white/20 bg-[#0a0a0a]">
          <p className="font-mono text-gray-500 text-sm tracking-wider">
            {'> BOUNTY_NOT_FOUND // ID_INVALID'}
          </p>
        </div>
      </div>
    );
  }

  const isOpen = bounty.status === 'open';
  const isOwner = address && bounty.creator && address.toLowerCase() === bounty.creator.toLowerCase();

  const truncate = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <Link to="/app" className="font-mono text-xs text-gray-500 hover:text-white mb-6 inline-block tracking-widest transition-colors">
        {'< BACK_TO_BOUNTIES'}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="font-mono text-xs text-white tracking-widest">
            {`// BOUNTY_${bounty.bounty_id?.toString().toUpperCase()}`}
          </div>
          <span
            className={`font-mono text-[10px] px-2 py-0.5 tracking-widest uppercase border ${
              isOpen
                ? 'bg-white/10 text-white border-white/40'
                : 'bg-black text-gray-500 border-gray-700'
            }`}
          >
            {isOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>
        <h1 className="font-mono font-bold text-3xl md:text-4xl text-white tracking-tight leading-tight">
          {bounty.title}
        </h1>
      </div>

      {/* Bounty Details Card */}
      <div className="border border-white/30 bg-[#0a0a0a] p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-dashed border-gray-700">
          <div>
            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1">
              {'> REWARD'}
            </div>
            <div className="font-mono flex items-baseline gap-2">
              <span className="text-white font-bold text-2xl">{bounty.reward_points}</span>
              <span className="text-gray-500 text-xs uppercase tracking-widest">PTS</span>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1">
              {'> CREATOR'}
            </div>
            <p className="font-mono text-sm text-white break-all">{truncate(bounty.creator)}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">
            {'> DESCRIPTION'}
          </div>
          <p className="text-gray-300 leading-relaxed text-sm">{bounty.description}</p>
        </div>

        {bounty.requirements && (
          <div>
            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">
              {'> REQUIREMENTS'}
            </div>
            <pre className="font-mono text-sm text-gray-300 bg-black border border-gray-800 p-4 whitespace-pre-wrap break-words leading-relaxed">
              {bounty.requirements}
            </pre>
          </div>
        )}

        {bounty.winner && (
          <div className="mt-6 p-4 bg-black border border-white/40">
            <div className="font-mono text-[10px] text-white tracking-widest uppercase mb-1">
              {'> WINNER_SELECTED'}
            </div>
            <Link
              to={`/submission/${bounty.winner}`}
              className="font-mono text-sm text-white hover:underline break-all"
            >
              {bounty.winner}
            </Link>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        {isOpen && (
          <Link
            to={`/bounty/${bounty_id}/submit`}
            className="font-mono px-6 py-3 bg-white hover:bg-gray-200 text-black font-bold uppercase tracking-widest text-sm transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          >
            {'[ SUBMIT_SOLUTION ]'}
          </Link>
        )}
        {isOpen && isOwner && submissions.length > 0 && (
          <button
            onClick={handleCloseBounty}
            disabled={closingTx.status === 'pending'}
            className="font-mono px-6 py-3 bg-black hover:bg-white/10 text-white border border-white font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {closingTx.status === 'pending' ? 'CLOSING...' : '[ CLOSE_BOUNTY & PICK_WINNER ]'}
          </button>
        )}
      </div>

      {/* TX Status */}
      {closingTx.status && (
        <div className="mb-8">
          <TxStatus status={closingTx.status} txHash={closingTx.hash} error={closingTx.error} />
        </div>
      )}

      {/* Submissions Section */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-xs text-white tracking-widest mb-1">
            {'// SUBMISSIONS_REGISTRY'}
          </div>
          <h2 className="font-mono font-bold text-2xl text-white tracking-tight">
            Submissions<span className="text-white">({submissions.length})</span>
          </h2>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 border border-white/20 bg-[#0a0a0a]">
          <p className="font-mono text-gray-500 text-sm tracking-wider">
            {'> NO_SUBMISSIONS_YET // BE_THE_FIRST'}
          </p>
        </div>
      ) : (
        <div className="border border-white/30 bg-[#0a0a0a]">
          <div className="grid grid-cols-[60px_1fr_180px_100px] px-4 py-3 border-b border-white/30 font-mono text-gray-500 text-xs tracking-widest uppercase">
            <span>#</span>
            <span>Worker</span>
            <span>Submission_ID</span>
            <span className="text-right">Score</span>
          </div>
          {submissions.map((sub, index) => {
            const scoreColor = sub.score > 0 ? getScoreColor(sub.score) : null;
            return (
              <Link
                key={sub.sub_id}
                to={`/submission/${sub.sub_id}`}
                className="grid grid-cols-[60px_1fr_180px_100px] px-4 py-4 border-b border-gray-800 last:border-0 hover:bg-white/5 transition-colors font-mono items-center"
              >
                <span className="font-bold text-white">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-white truncate">
                  {truncate(sub.worker)}
                </span>
                <span className="text-xs text-gray-500 truncate">{sub.sub_id}</span>
                <span className="text-right">
                  {sub.score > 0 ? (
                    <span
                      className="font-bold text-sm"
                      style={{ color: scoreColor?.color }}
                    >
                      {sub.score}/100
                    </span>
                  ) : (
                    <span className="text-gray-600 text-[10px] uppercase tracking-widest">PENDING</span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BountyDetail;
