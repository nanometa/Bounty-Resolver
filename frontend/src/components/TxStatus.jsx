import React from 'react';

const EXPLORER_URL = 'https://explorer-studio.genlayer.com';

function TxStatus({ status, txHash, error }) {
  if (!status) return null;

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-blue/10 border border-blue/20">
        <div className="w-5 h-5 border-2 border-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-blue text-sm">Transaction pending...</span>
      </div>
    );
  }

  if (status === 'FINALIZED' && txHash) {
    return (
      <div className="p-4 rounded-lg bg-green/10 border border-green/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green text-sm font-medium">✓ Transaction Finalized</span>
        </div>
        <a
          href={`${EXPLORER_URL}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-purple hover:underline break-all"
        >
          {txHash}
        </a>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 rounded-lg bg-red/10 border border-red/20">
        <span className="text-red text-sm">✗ {error || 'Transaction failed'}</span>
      </div>
    );
  }

  if (status === 'timeout') {
    return (
      <div className="p-4 rounded-lg bg-yellow/10 border border-yellow/20">
        <span className="text-yellow text-sm">
          ⏱ Consensus taking longer than expected — try again
        </span>
      </div>
    );
  }

  // Generic status display
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-surface border border-border">
      <div className="w-5 h-5 border-2 border-purple border-t-transparent rounded-full animate-spin" />
      <span className="text-muted text-sm">
        {status === '7' || status === 7 ? '✓ Accepted — finalizing...' : `Status: ${status}`}
      </span>
    </div>
  );
}

export default TxStatus;
