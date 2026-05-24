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
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-none animate-spin" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link to={`/bounty/${bounty_id}`} className="font-mono text-xs text-gray-500 hover:text-white mb-6 inline-block tracking-widest transition-colors">
          {'< BACK_TO_BOUNTY'}
        </Link>
        <div className="text-center py-16 border border-white/20 bg-[#0a0a0a]">
          <p className="font-mono text-gray-500 text-sm tracking-wider">
            {'> WALLET_NOT_CONNECTED // CONNECT_TO_SUBMIT'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/bounty/${bounty_id}`} className="font-mono text-xs text-gray-500 hover:text-white mb-6 inline-block tracking-widest transition-colors">
        {'< BACK_TO_BOUNTY'}
      </Link>

      {/* Bounty Summary */}
      {bounty && (
        <div className="border border-white/30 bg-[#0a0a0a] p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-mono font-bold text-white text-sm tracking-wider">{bounty.title}</h2>
            <div className="font-mono flex items-baseline gap-1">
              <span className="text-white font-bold text-base">{bounty.reward_points}</span>
              <span className="text-gray-500 text-[10px] uppercase tracking-widest">PTS</span>
            </div>
          </div>
          {bounty.requirements && (
            <p className="font-mono text-xs text-gray-500 mt-2 leading-relaxed">{bounty.requirements}</p>
          )}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-xs text-white tracking-widest mb-2">// SOLUTION_SUBMISSION</div>
        <h1 className="font-mono font-bold text-3xl text-white tracking-tight">
          Submit_Solution<span className="text-white">()</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Solution URL */}
        <div>
          <label className="block font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">
            {'> SOLUTION_URL *'}
          </label>
          <input
            type="url"
            name="solutionUrl"
            value={form.solutionUrl}
            onChange={handleChange}
            required
            placeholder="https://..."
            className="w-full font-mono bg-[#0a0a0a] border border-gray-700 px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">
            {'> DESCRIPTION'}
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder="Describe your approach..."
            className="w-full font-mono bg-[#0a0a0a] border border-gray-700 px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={txState.status === 'pending' || !form.solutionUrl.trim()}
          className="w-full font-mono py-3 bg-white hover:bg-gray-200 text-black font-bold uppercase tracking-widest text-sm transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {txState.status === 'pending' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-none animate-spin" />
              SUBMITTING...
            </span>
          ) : (
            '[ SUBMIT_SOLUTION ]'
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
