import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../WalletContext';
import { createBounty, getReadClient, waitForTransaction } from '../contract';
import TxStatus from '../components/TxStatus';

function CreateBounty() {
  const navigate = useNavigate();
  const wallet = useWallet() ?? {};
  const { address = null, isConnected = false } = wallet;

  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    rewardPoints: '',
  });
  const [txState, setTxState] = useState({ status: null, hash: null, error: null });

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!address) return;
    if (!form.title.trim() || !form.description.trim()) return;

    setTxState({ status: 'pending', hash: null, error: null });

    try {
      const hash = await createBounty(
        address,
        form.title.trim(),
        form.description.trim(),
        form.requirements.trim(),
        form.rewardPoints || '100'
      );
      setTxState({ status: 'pending', hash, error: null });

      const client = getReadClient();
      await waitForTransaction(client, hash, (s) => {
        setTxState(prev => ({ ...prev, status: s }));
      });

      setTxState({ status: 'FINALIZED', hash, error: null });
      // Wait 4s for chain state to propagate, then redirect
      setTimeout(() => navigate('/app'), 4000);
    } catch (err) {
      const msg = err.message || 'Transaction failed';
      if (msg.includes('Consensus taking longer')) {
        setTxState({ status: 'timeout', hash: txState.hash, error: msg });
      } else {
        setTxState({ status: 'error', hash: null, error: msg });
      }
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 text-lg mb-4">Connect your wallet to create a bounty.</p>
        <Link to="/" className="text-violet-400 hover:underline">← Back to Bounties</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with back link */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/app" className="text-slate-500 hover:text-white text-sm transition-colors">
          ← Back to Bounties
        </Link>
        <h1 className="font-heading font-bold text-2xl text-white">Create Bounty</h1>
        <div className="w-24" />
      </div>

      {/* Form Card */}
      <div className="card-futuristic rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g., Build a React Dashboard"
              className="w-full bg-[#0a0a12] border border-[#1a1a2e] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe what needs to be built..."
              className="w-full bg-[#0a0a12] border border-[#1a1a2e] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all resize-none"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Requirements</label>
            <textarea
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              rows={3}
              placeholder="List specific requirements for evaluation..."
              className="w-full bg-[#0a0a12] border border-[#1a1a2e] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all resize-none"
            />
          </div>

          {/* Reward Points */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Reward Points</label>
            <input
              type="number"
              name="rewardPoints"
              value={form.rewardPoints}
              onChange={handleChange}
              min="1"
              max="10000"
              placeholder="100"
              className="w-full bg-[#0a0a12] border border-[#1a1a2e] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all"
            />
          </div>

          {/* Submit Button — at top of form visually prominent */}
          <button
            type="submit"
            disabled={txState.status === 'pending' || !form.title.trim() || !form.description.trim()}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-violet-500/50"
          >
            {txState.status === 'pending' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              'Create Bounty'
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
    </div>
  );
}

export default CreateBounty;


