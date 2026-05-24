// =======================================
// CONTRACT CLIENT - genlayer-js v1.1.8
// All write functions: must produce Type "Call", never empty data.
// All read functions: wrap in try/catch and return safe defaults.
// =======================================

import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const CONTRACT_ADDRESS = '0x9bcE7b8f2068dB71Da18B231F12104B057feb7dF';

let client = null;

export function getClient(account) {
  client = createClient({
    chain: studionet,
    account: account || undefined,
  });
  return client;
}

export function getReadClient() {
  if (!client) {
    client = createClient({ chain: studionet });
  }
  return client;
}

// =======================================
// TX POLLING - Wait for finalization
// =======================================

export async function waitForTransaction(client, txHash, onStatus) {
  const POLL_INTERVAL = 3000;
  const TIMEOUT = 300000; // 5 min for Studionet
  const start = Date.now();

  // GenLayer status: 4=PROPOSING, 5=COMMITTING, 6=REVEALING, 7=ACCEPTED/FINALIZED
  const FINALIZED = ['FINALIZED', 'ACCEPTED', 7, '7'];
  const ERRORS = ['ERROR', 'CANCELED', 'UNDETERMINED', 0, 8, 9, 10];

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        if (Date.now() - start > TIMEOUT) {
          reject(new Error('Consensus taking longer than expected - try again'));
          return;
        }

        const tx = await client.getTransaction({ hash: txHash });

        if (!tx) {
          setTimeout(poll, POLL_INTERVAL);
          return;
        }

        const status = tx.status ?? tx.transaction_status ?? tx.status_code;

        if (FINALIZED.includes(status)) {
          if (onStatus) onStatus('FINALIZED');
          resolve(tx);
          return;
        }

        if (ERRORS.includes(status)) {
          reject(new Error(tx.error || tx.message || 'Transaction failed'));
          return;
        }

        if (onStatus) onStatus(String(status));
        setTimeout(poll, POLL_INTERVAL);
      } catch {
        // Network errors: keep polling
        setTimeout(poll, POLL_INTERVAL);
      }
    };

    poll();
  });
}

// =======================================
// INPUT VALIDATION HELPERS
// Defense in depth - sanitize before sending to chain
// =======================================

function requireAddress(addr, label = 'address') {
  if (!addr || typeof addr !== 'string' || !addr.startsWith('0x') || addr.length !== 42) {
    throw new Error(`Invalid ${label}`);
  }
  return addr;
}

function requireString(str, label, max = 1000) {
  if (typeof str !== 'string') throw new Error(`Invalid ${label}`);
  const trimmed = str.trim();
  if (!trimmed) throw new Error(`${label} is required`);
  if (trimmed.length > max) throw new Error(`${label} must be at most ${max} chars`);
  return trimmed;
}

function requireUrl(url, label = 'url') {
  const cleaned = requireString(url, label, 500);
  try {
    const parsed = new URL(cleaned);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`${label} must use http or https`);
    }
    return parsed.toString();
  } catch {
    throw new Error(`Invalid ${label}`);
  }
}

function requirePoints(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num <= 0 || num > 1_000_000) {
    throw new Error('Reward points must be a positive number <= 1,000,000');
  }
  return Math.floor(num);
}

// =======================================
// WRITE FUNCTIONS
// =======================================

export async function createBounty(account, title, description, requirements, rewardPoints) {
  requireAddress(account, 'wallet address');
  const t = requireString(title, 'title', 200);
  const d = requireString(description, 'description', 5000);
  const r = requireString(requirements, 'requirements', 5000);
  const points = requirePoints(rewardPoints);

  const cl = getClient(account);
  return cl.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'create_bounty',
    args: [t, d, r, points],
  });
}

export async function submitSolution(account, bountyId, solutionUrl, description) {
  requireAddress(account, 'wallet address');
  requireString(bountyId, 'bounty id', 100);
  const url = requireUrl(solutionUrl, 'solution URL');
  const desc = description ? requireString(description, 'description', 2000) : '';

  const cl = getClient(account);
  return cl.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'submit_solution',
    args: [bountyId, url, desc],
  });
}

export async function evaluateSubmission(account, subId) {
  requireAddress(account, 'wallet address');
  requireString(subId, 'submission id', 100);

  const cl = getClient(account);
  return cl.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'evaluate_submission',
    args: [subId],
  });
}

export async function closeBounty(account, bountyId) {
  requireAddress(account, 'wallet address');
  requireString(bountyId, 'bounty id', 100);

  const cl = getClient(account);
  return cl.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'close_bounty',
    args: [bountyId],
  });
}

// =======================================
// READ FUNCTIONS
// All return safe defaults on error
// =======================================

function unwrap(result) {
  if (result === null || result === undefined) return null;
  if (typeof result === 'object' && 'result' in result) return result.result;
  return result;
}

export async function getBounty(bountyId) {
  try {
    const cl = getReadClient();
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_bounty',
      args: [bountyId],
    });
    return String(unwrap(result) ?? '') || '{}';
  } catch {
    return '{}';
  }
}

export async function getSubmission(subId) {
  try {
    const cl = getReadClient();
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_submission',
      args: [subId],
    });
    return result || '{}';
  } catch {
    return '{}';
  }
}

export async function getBountySubmissions(bountyId) {
  try {
    const cl = getReadClient();
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_bounty_submissions',
      args: [bountyId],
    });
    return result || '[]';
  } catch {
    return '[]';
  }
}

export async function getScore(subId) {
  try {
    const cl = getReadClient();
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_score',
      args: [subId],
    });
    return Number(result) || 0;
  } catch {
    return 0;
  }
}

export async function getWinnerPoints(address) {
  try {
    const cl = getReadClient();
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_winner_points',
      args: [address],
    });
    return Number(result) || 0;
  } catch {
    return 0;
  }
}

export async function getBountyCount() {
  try {
    const cl = getReadClient();
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_bounty_count',
      args: [],
    });
    return Number(unwrap(result)) || 0;
  } catch {
    return 0;
  }
}

export async function getSubmissionCount() {
  try {
    const cl = getReadClient();
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_submission_count',
      args: [],
    });
    return Number(result) || 0;
  } catch {
    return 0;
  }
}

// Returns all bounties (parallel reads for performance)
export async function getAllBounties() {
  try {
    const count = await getBountyCount();
    if (count <= 0) return [];

    const reads = [];
    for (let i = 0; i < count; i++) {
      reads.push(getBounty(`bounty-${i}`));
    }
    const results = await Promise.all(reads);

    const bounties = [];
    for (const data of results) {
      try {
        const parsed = JSON.parse(data);
        if (parsed && parsed.bounty_id) bounties.push(parsed);
      } catch {
        // skip invalid
      }
    }
    return bounties;
  } catch {
    return [];
  }
}
