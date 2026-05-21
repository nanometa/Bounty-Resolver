import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../WalletContext';
import { getBounty, submitSolution, getReadClient, waitForTransaction } from '../contract';
import TxStatus from '../components/TxStatus';

function SubmitSolution() {
  const { bounty_id } = useParams();
  const navigate = useNavigate();
  const wallet = useWallet() ?? {};
  const { address = null, isConnected = false } = wallet;

  const [bounty, setBounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ solutionUrl: '', description: '' });
  const [txState, setTxState] = useState({ status: null, hash: null, error: null });

  useEffect(() => {
    loadBounty();
  }, [bounty_id]);

  async function loadBounty() {
    setLoading(true);
    try {
      const data = await getBounty(bounty_id);
      setBounty(JSON.parse(data));
    } catch {
      setBounty(null);
    }
    setLoading(false);
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!address) return;
    if (!form.solutionUrl.trim()) return;

    setTxState({ status: 'pending', hash: null, error: null });

    try {
      const hash = await submitSolution(
        address,
        bounty_id,
        form.solutionUrl.trim(),
        form.description.trim()
      );
      setTxState({ status: 'pending', hash, error: null });

      const client = getReadClient();
      await waitForTransaction(client, hash, (s) => {
        setTxState(prev => ({ ...prev, status: s }));
      });

      setTxState({ status: 'FINALIZED', hash, error: null });
      // Wait 4s for chain state to propagate, then redirect
      setTimeout(() => navigate(`/bounty/${bounty_id}`), 4000);
    } catch (err) {
      const msg = err.message || 'Transaction failed';
      if (msg.includes('Consensus taking longer')) {
        setTxState({ status: 'timeout', hash: txState.hash, error: msg });
      } else {
        setTxState({ status: 'error', hash: null, error: msg });
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

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 text-lg mb-4">Connect your wallet to submit a solution.</p>
        <Link to={`/bounty/${bounty_id}`} className="text-violet-400 hover:underline">← Back to Bounty</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/bounty/${bounty_id}`} className="text-slate-400 hover:text-white text-sm mb-6 inline-block">
        ← Back to Bounty
      </Link>

      {/* Bounty Summary */}
      {bounty && (
        <div className="border border-[#1a1a2e] rounded-lg p-4 bg-[#0c0c14] mb-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-white">{bounty.title}</h2>
            <span className="text-violet-400 font-heading font-bold text-sm">{bounty.reward_points} pts</span>
          </div>
          {bounty.requirements && (
            <p className="text-slate-400 text-sm mt-2">{bounty.requirements}</p>
          )}
        </div>
      )}

      <h1 className="font-heading font-bold text-2xl mb-6">Submit Solution</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Solution URL */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Solution URL *</label>
          <input
            type="url"
            name="solutionUrl"
            value={form.solutionUrl}
            onChange={handleChange}
            required
            placeholder="Your URL"
            className="w-full bg-[#0c0c14] border border-[#1a1a2e] rounded-lg px-4 py-3 text-white placeholder-muted/50 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your solution approach..."
            className="w-full bg-[#0c0c14] border border-[#1a1a2e] rounded-lg px-4 py-3 text-white placeholder-muted/50 focus:outline-none focus:border-violet-500 transition-colors resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={txState.status === 'pending' || !form.solutionUrl.trim()}
          className="w-full py-3 bg-violet-500 hover:bg-violet-500/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {txState.status === 'pending' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            'Submit Solution'
          )}
        </button>
      </form>

      {/* TX Status */}
      {txState.status && (
        <div className="mt-6">
          <TxStatus status={txState.status} txHash={txState.hash} error={txState.error} />
        </div>
      )}
    </div>
  );
}

export default SubmitSolution;


