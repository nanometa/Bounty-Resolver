import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../WalletContext';
import { getSubmission, getScore, getBounty, evaluateSubmission, getReadClient, waitForTransaction } from '../contract';
import ScoreCircle, { getScoreColor } from '../components/ScoreCircle';
import TxStatus from '../components/TxStatus';

const EVAL_STEPS = [
  'SENDING_TO_GENLAYER_VALIDATORS',
  'AI_ANALYSTS_SCORING_WORK',
  'REACHING_CONSENSUS',
  'STORING_VERDICT_ON_CHAIN',
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
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-none animate-spin" />
      </div>
    );
  }

  if (!submission || !submission.sub_id) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link to="/app" className="font-mono text-xs text-gray-500 hover:text-white mb-6 inline-block tracking-widest transition-colors">
          {'< BACK_TO_BOUNTIES'}
        </Link>
        <div className="text-center py-16 border border-white/20 bg-[#0a0a0a]">
          <p className="font-mono text-gray-500 text-sm tracking-wider">
            {'> SUBMISSION_NOT_FOUND'}
          </p>
        </div>
      </div>
    );
  }

  const isEvaluated = score > 0;
  const isBountyOwner = address && bounty && bounty.creator && address.toLowerCase() === bounty.creator.toLowerCase();

  const truncate = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to={submission.bounty_id ? `/bounty/${submission.bounty_id}` : '/app'}
        className="font-mono text-xs text-gray-500 hover:text-white mb-6 inline-block tracking-widest transition-colors"
      >
        {'< BACK_TO_BOUNTY'}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="font-mono text-xs text-white tracking-widest">// SUBMISSION_RECORD</div>
          {isEvaluated ? (
            <span className="font-mono text-[10px] px-2 py-0.5 tracking-widest uppercase border bg-white/10 text-white border-white/40">
              EVALUATED
            </span>
          ) : (
            <span className="font-mono text-[10px] px-2 py-0.5 tracking-widest uppercase border bg-black text-gray-500 border-gray-700">
              PENDING
            </span>
          )}
        </div>
        <h1 className="font-mono font-bold text-2xl md:text-3xl text-white tracking-tight break-all">
          <span className="text-gray-500">{'>'} </span>
          {submission.sub_id}
        </h1>
      </div>

      {/* Submission Info */}
      <div className="border border-white/30 bg-[#0a0a0a] p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1">
              {'> SUBMITTER'}
            </div>
            <p className="font-mono text-sm text-white break-all">{truncate(submission.worker)}</p>
          </div>
          <div>
            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1">
              {'> BOUNTY_ID'}
            </div>
            <Link to={`/bounty/${submission.bounty_id}`} className="font-mono text-sm text-white hover:underline break-all">
              {submission.bounty_id}
            </Link>
          </div>
          <div className="md:col-span-2">
            <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1">
              {'> SOLUTION_URL'}
            </div>
            <a
              href={submission.solution_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-white hover:underline break-all"
            >
              {submission.solution_url}
            </a>
          </div>
          {submission.description && (
            <div className="md:col-span-2">
              <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-1">
                {'> DESCRIPTION'}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{submission.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Evaluation Section */}
      {isEvaluated ? (
        <div className="border border-white/30 bg-[#0a0a0a] p-6">
          <div className="font-mono text-xs text-white tracking-widest mb-4 text-center">
            // AI_EVALUATION_RESULT
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-6">
            <ScoreCircle score={score} size={140} />
          </div>

          {/* Verified Badge */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] px-3 py-1.5 bg-white/10 text-white border border-white/40 tracking-widest uppercase">
              + VERIFIED_BY_GENLAYER_CONSENSUS
            </span>
          </div>

          {evaluation && evaluation.feedback && (
            <div className="mb-6 p-4 bg-black border-l-2 border-white">
              <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">
                {'> AI_FEEDBACK'}
              </div>
              <p className="text-gray-300 text-sm italic leading-relaxed">&ldquo;{evaluation.feedback}&rdquo;</p>
            </div>
          )}

          {evaluation && evaluation.strengths && evaluation.strengths.length > 0 && (
            <div className="mb-6">
              <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">
                {'> STRENGTHS'}
              </div>
              <ul className="space-y-1.5">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 font-mono text-sm text-white">
                    <span className="text-white">[+]</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation && evaluation.gaps && evaluation.gaps.length > 0 && (
            <div>
              <div className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">
                {'> GAPS'}
              </div>
              <ul className="space-y-1.5">
                {evaluation.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 font-mono text-sm text-gray-400">
                    <span className="text-gray-500">[-]</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-white/30 bg-[#0a0a0a] p-6 text-center">
          {evalTx.status === 'pending' ? (
            <div className="py-8">
              <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-none animate-spin mx-auto mb-6" />
              <div className="space-y-2 text-left max-w-md mx-auto">
                {EVAL_STEPS.map((step, i) => (
                  <p
                    key={i}
                    className={`font-mono text-xs tracking-widest transition-all duration-500 ${
                      i <= evalStep ? 'text-white opacity-100' : 'text-gray-700 opacity-50'
                    }`}
                  >
                    {i < evalStep ? '[+]' : i === evalStep ? '[@]' : '[o]'} {step}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="font-mono text-gray-500 text-sm tracking-wider mb-6">
                {'> NOT_YET_EVALUATED // AWAITING_AI_VALIDATORS'}
              </p>
              {isBountyOwner && (
                <button
                  onClick={handleEvaluate}
                  disabled={evalTx.status === 'pending'}
                  className="font-mono px-8 py-3 bg-white hover:bg-gray-200 text-black font-bold uppercase tracking-widest text-sm transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                >
                  {'[ REQUEST_AI_EVALUATION ]'}
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
