import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../WalletContext';
import { getSubmission, getScore, getBounty, evaluateSubmission, getReadClient, waitForTransaction } from '../contract';
import ScoreCircle, { getScoreColor } from '../components/ScoreCircle';
import TxStatus from '../components/TxStatus';

const EVAL_STEPS = [
  'Sending to GenLayer validators...',
  'AI analysts scoring your work...',
  'Reaching consensus...',
  'Storing verdict on-chain...',
];

function SubmissionDetail() {
  const { sub_id } = useParams();
  const wallet = useWallet() ?? {};
  const { address = null } = wallet;

  const [submission, setSubmission] = useState(null);
  const [bounty, setBounty] = useState(null);
  const [score, setScore] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evalTx, setEvalTx] = useState({ status: null, hash: null, error: null });
  const [evalStep, setEvalStep] = useState(0);

  useEffect(() => {
    loadData();
  }, [sub_id]);

  async function loadData() {
    setLoading(true);
    try {
      const subData = await getSubmission(sub_id);
      const sub = JSON.parse(subData);
      setSubmission(sub);

      const scoreVal = await getScore(sub_id);
      setScore(scoreVal);

      if (sub.status === 'evaluated') {
        setEvaluation({
          score: scoreVal,
          feedback: sub.feedback || '',
          strengths: sub.strengths || [],
          gaps: sub.gaps || [],
        });
      }

      if (sub.bounty_id) {
        const bountyData = await getBounty(sub.bounty_id);
        setBounty(JSON.parse(bountyData));
      }
    } catch {
      setSubmission(null);
    }
    setLoading(false);
  }

  async function handleEvaluate() {
    if (!address) return;
    setEvalTx({ status: 'pending', hash: null, error: null });
    setEvalStep(0);

    // Animate through steps
    const stepInterval = setInterval(() => {
      setEvalStep(prev => {
        if (prev < EVAL_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 4000);

    try {
      const hash = await evaluateSubmission(address, sub_id);
      setEvalTx({ status: 'pending', hash, error: null });

      const client = getReadClient();
      await waitForTransaction(client, hash, (s) => {
        setEvalTx(prev => ({ ...prev, status: s }));
      });

      clearInterval(stepInterval);
      setEvalTx({ status: 'FINALIZED', hash, error: null });
      // Reload data
      setTimeout(loadData, 2000);
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err.message || 'Transaction failed';
      if (msg.includes('Consensus taking longer')) {
        setEvalTx({ status: 'timeout', hash: evalTx.hash, error: msg });
      } else {
        setEvalTx({ status: 'error', hash: null, error: msg });
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

  if (!submission || !submission.sub_id) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Submission not found.</p>
        <Link to="/" className="text-violet-400 hover:underline mt-4 inline-block">← Back to Bounties</Link>
      </div>
    );
  }

  const isEvaluated = score > 0;
  const isBountyOwner = address && bounty && bounty.creator && address.toLowerCase() === bounty.creator.toLowerCase();

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to={submission.bounty_id ? `/bounty/${submission.bounty_id}` : '/'}
        className="text-slate-400 hover:text-white text-sm mb-6 inline-block"
      >
        ← Back to Bounty
      </Link>

      {/* Submission Info */}
      <div className="border border-[#1a1a2e] rounded-xl p-6 bg-[#0c0c14]/60 backdrop-blur-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading font-bold text-xl text-white">
            Submission: <span className="font-mono text-violet-400">{submission.sub_id}</span>
          </h1>
          {isEvaluated ? (
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Evaluated
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow/10 text-amber-400 border border-yellow/20">
              Pending
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-slate-500 text-xs uppercase">Submitter</span>
            <p className="font-mono text-sm text-white mt-1">{submission.worker}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase">Bounty</span>
            <Link to={`/bounty/${submission.bounty_id}`} className="block text-violet-400 hover:underline text-sm mt-1">
              {submission.bounty_id}
            </Link>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 text-xs uppercase">Solution URL</span>
            <a
              href={submission.solution_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sky-400 hover:underline text-sm mt-1 break-all"
            >
              {submission.solution_url}
            </a>
          </div>
          {submission.description && (
            <div className="col-span-2">
              <span className="text-slate-400 text-xs uppercase">Description</span>
              <p className="text-white mt-1">{submission.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Evaluation Section */}
      {isEvaluated ? (
        <div className="border border-[#1a1a2e] rounded-xl p-6 bg-[#0c0c14]/60 backdrop-blur-sm">
          <h2 className="font-heading font-bold text-lg mb-6 text-center">AI Evaluation</h2>

          {/* Score Circle */}
          <div className="flex justify-center mb-6">
            <ScoreCircle score={score} size={140} />
          </div>

          {/* Verified Badge */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
              ✓ Verified by GenLayer consensus
            </span>
          </div>

          {evaluation && evaluation.feedback && (
            <div className="mb-6 p-4 rounded-lg bg-[#050508] border-l-4 border-violet-500">
              <p className="text-white italic">&ldquo;{evaluation.feedback}&rdquo;</p>
            </div>
          )}

          {evaluation && evaluation.strengths && evaluation.strengths.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm text-slate-400 uppercase mb-2">Strengths</h3>
              <ul className="space-y-1">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-emerald-400 text-sm">
                    <span>✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation && evaluation.gaps && evaluation.gaps.length > 0 && (
            <div>
              <h3 className="text-sm text-slate-400 uppercase mb-2">Gaps</h3>
              <ul className="space-y-1">
                {evaluation.gaps.map((g, i) => (
                  <li key={i} className="flex items-center gap-2 text-amber-400 text-sm">
                    <span>→</span> {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-[#1a1a2e] rounded-xl p-6 bg-[#0c0c14]/60 backdrop-blur-sm text-center">
          {evalTx.status === 'pending' ? (
            <div className="py-8">
              <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <div className="space-y-3">
                {EVAL_STEPS.map((step, i) => (
                  <p
                    key={i}
                    className={`text-sm transition-all duration-500 ${
                      i <= evalStep ? 'text-white opacity-100' : 'text-slate-400 opacity-30'
                    }`}
                  >
                    {i < evalStep ? '✓' : i === evalStep ? '◉' : '○'} {step}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="text-slate-400 mb-4">This submission has not been evaluated yet.</p>
              {isBountyOwner && (
                <button
                  onClick={handleEvaluate}
                  disabled={evalTx.status === 'pending'}
                  className="px-8 py-3 bg-violet-500 hover:bg-violet-500/90 text-white rounded-lg font-medium transition-colors"
                >
                  Request AI Evaluation
                </button>
              )}
            </>
          )}

          {/* TX Status */}
          {evalTx.status && evalTx.status !== 'pending' && (
            <div className="mt-6">
              <TxStatus status={evalTx.status} txHash={evalTx.hash} error={evalTx.error} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SubmissionDetail;


