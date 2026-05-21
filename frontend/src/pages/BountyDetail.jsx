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

      // Load submissions
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
      // Reload data
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
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!bounty || !bounty.bounty_id) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Bounty not found.</p>
        <Link to="/" className="text-violet-400 hover:underline mt-4 inline-block">← Back to Bounties</Link>
      </div>
    );
  }

  const isOpen = bounty.status === 'open';
  const isOwner = address && bounty.creator && address.toLowerCase() === bounty.creator.toLowerCase();

  return (
    <div>
      {/* Back button */}
      <Link to="/" className="text-slate-400 hover:text-white text-sm mb-6 inline-block">
        ← Back to Bounties
      </Link>

      {/* Bounty Details Card */}
      <div className="border border-[#1a1a2e] rounded-xl p-6 bg-[#0c0c14] mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="font-heading font-bold text-2xl text-white">{bounty.title}</h1>
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              isOpen
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-muted/10 text-slate-400 border border-muted/20'
            }`}
          >
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-slate-400 text-xs uppercase">Reward</span>
            <p className="font-heading font-bold text-violet-400 text-lg">{bounty.reward_points} pts</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase">Creator</span>
            <p className="font-mono text-sm text-white">{bounty.creator}</p>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-slate-400 text-xs uppercase">Description</span>
          <p className="text-white mt-1">{bounty.description}</p>
        </div>

        {bounty.requirements && (
          <div>
            <span className="text-slate-400 text-xs uppercase">Requirements</span>
            <p className="text-white mt-1 bg-violet-500/5 p-3 rounded border border-violet-500/10">
              {bounty.requirements}
            </p>
          </div>
        )}

        {bounty.winner && (
          <div className="mt-4 p-3 rounded bg-violet-500/5 border border-violet-500/20">
            <span className="text-violet-400 text-sm font-medium">🏆 Winner: </span>
            <Link to={`/submission/${bounty.winner}`} className="text-violet-400 hover:underline text-sm font-mono">
              {bounty.winner}
            </Link>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-8">
        {isOpen && (
          <Link
            to={`/bounty/${bounty_id}/submit`}
            className="px-6 py-3 bg-violet-500 hover:bg-violet-500/90 text-white rounded-lg font-medium transition-colors"
          >
            Submit Solution
          </Link>
        )}
        {isOpen && isOwner && submissions.length > 0 && (
          <button
            onClick={handleCloseBounty}
            disabled={closingTx.status === 'pending'}
            className="px-6 py-3 bg-red/10 hover:bg-red/20 text-red border border-red/20 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Close Bounty & Pick Winner
          </button>
        )}
      </div>

      {/* TX Status */}
      {closingTx.status && (
        <div className="mb-8">
          <TxStatus status={closingTx.status} txHash={closingTx.hash} error={closingTx.error} />
        </div>
      )}

      {/* Submissions List */}
      <h2 className="font-heading font-bold text-lg mb-4">
        Submissions ({submissions.length})
      </h2>

      {submissions.length === 0 ? (
        <p className="text-slate-400">No submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map(sub => {
            const scoreColor = sub.score > 0 ? getScoreColor(sub.score) : null;
            return (
              <Link
                key={sub.sub_id}
                to={`/submission/${sub.sub_id}`}
                className="flex items-center justify-between p-4 border border-[#1a1a2e] rounded-lg bg-[#0c0c14] hover:border-violet-500/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-slate-400">
                    {sub.worker ? `${sub.worker.slice(0, 6)}...${sub.worker.slice(-4)}` : ''}
                  </span>
                  <span className="text-white text-sm">{sub.sub_id}</span>
                </div>
                <div className="flex items-center gap-3">
                  {sub.score > 0 ? (
                    <span
                      className="font-heading font-bold text-sm"
                      style={{ color: scoreColor?.color }}
                    >
                      {sub.score}/100
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">Pending</span>
                  )}
                  <span className="text-violet-400 text-sm">View →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BountyDetail;


