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
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
        setTxState((prev) => ({ ...prev, status: s }));
      });

      setTxState({ status: 'FINALIZED', hash, error: null });
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
      <div className="text-center py-20 max-w-2xl mx-auto">
        <div className="border border-white/30 bg-[#0a0a0a] p-8">
          <p className="font-mono text-gray-400 text-sm mb-4 tracking-wider">
            {'> ERROR: WALLET_NOT_CONNECTED'}
          </p>
          <Link
            to="/app"
            className="font-mono text-white hover:text-gray-300 text-xs tracking-widest"
          >
            {'< BACK_TO_BOUNTIES'}
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full font-mono bg-[#0a0a0a] border border-gray-700 px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/app"
          className="font-mono text-xs text-gray-500 hover:text-white tracking-widest transition-colors"
        >
          {'< BACK_TO_BOUNTIES'}
        </Link>
      </div>

      <div className="mb-8">
        <div className="font-mono text-xs text-white tracking-widest mb-2">// NEW_BOUNTY_CONFIG</div>
        <h1 className="font-mono font-bold text-3xl text-white tracking-tight">
          Create_Bounty<span className="text-white">()</span>
        </h1>
      </div>

      <div className="border border-white/30 bg-[#0a0a0a] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-xs text-gray-400 mb-2 tracking-widest uppercase">
              Title <span className="text-white">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={120}
              placeholder="e.g., BUILD_A_REACT_DASHBOARD"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-gray-400 mb-2 tracking-widest uppercase">
              Description <span className="text-white">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              maxLength={600}
              placeholder="// Describe what needs to be built..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-gray-400 mb-2 tracking-widest uppercase">
              Requirements
            </label>
            <textarea
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              rows={3}
              maxLength={400}
              placeholder="// React, TypeScript, responsive..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-gray-400 mb-2 tracking-widest uppercase">
              Reward_Points
            </label>
            <input
              type="number"
              name="rewardPoints"
              value={form.rewardPoints}
              onChange={handleChange}
              min="1"
              max="10000"
              placeholder="100"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={
              txState.status === 'pending' || !form.title.trim() || !form.description.trim()
            }
            className="w-full font-mono py-4 bg-white hover:bg-white text-black font-bold uppercase tracking-widest text-sm transition-all hover:shadow-[0_0_30px_rgba(255, 255, 255,0.5)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {txState.status === 'pending' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent animate-spin" />
                EXECUTING...
              </span>
            ) : (
              '[ DEPLOY_BOUNTY ]'
            )}
          </button>
        </form>

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
