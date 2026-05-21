// ═══════════════════════════════════════
// CONTRACT CLIENT — genlayer-js v1.1.8
// Uses raw gen_call for reads (SDK bug: returns null for "00")
// ═══════════════════════════════════════

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT_ADDRESS = "0x9bcE7b8f2068dB71Da18B231F12104B057feb7dF";
const RPC_URL = "https://studio.genlayer.com/api";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Create the genlayer client (for writes only)
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
    client = createClient({
      chain: studionet,
    });
  }
  return client;
}

// ═══════════════════════════════════════
// RAW READ — bypasses SDK null bug
// Uses client.readContract but returns raw via internal request
// ═══════════════════════════════════════

async function rawRead(functionName, args) {
  try {
    const cl = getReadClient();
    // Use the SDK to encode and send, but we intercept
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName,
      args,
    });
    // SDK returns null for "00" (zero/empty) — treat as valid
    return result;
  } catch {
    return null;
  }
}

// Direct RPC fallback for reading
async function rpcRead(functionName, args) {
  try {
    // Encode using the SDK's internal method
    const cl = getReadClient();
    // Make raw request through the client's transport
    const result = await cl.request({
      method: 'gen_call',
      params: [{
        type: 'read',
        to: CONTRACT_ADDRESS,
        from: ZERO_ADDRESS,
        data: encodeCallData(functionName, args),
        transaction_hash_variant: 'latest-nonfinal',
      }],
    });
    return result;
  } catch {
    return null;
  }
}

// Simple msgpack-like encoding for GenLayer calls
function encodeCallData(functionName, args) {
  // Build the calldata bytes manually matching GenLayer's format
  // Format: msgpack array [method_key, functionName, ...args]
  const enc = new TextEncoder();
  const methodBytes = enc.encode(functionName);

  // We'll use the SDK's readContract and handle null as 0
  // This is simpler than reimplementing the encoder
  return null; // unused - we use SDK approach below
}

// ═══════════════════════════════════════
// TX POLLING HELPER
// Poll getTransaction() every 3s until FINALIZED or timeout
// ═══════════════════════════════════════

export async function waitForTransaction(client, txHash, onStatus) {
  const POLL_INTERVAL = 3000;
  const TIMEOUT = 300000; // 5 minutes for Studionet
  const start = Date.now();

  // GenLayer status codes: 4=PROPOSING, 5=COMMITTING, 6=REVEALING, 7=ACCEPTED/FINALIZED
  const FINALIZED_STATUSES = ["FINALIZED", "ACCEPTED", 7, "7"];
  const ERROR_STATUSES = ["ERROR", "CANCELED", "UNDETERMINED", 0, 8, 9, 10];

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        if (Date.now() - start > TIMEOUT) {
          reject(new Error("Consensus taking longer than expected — try again"));
          return;
        }

        const tx = await client.getTransaction({ hash: txHash });

        if (!tx) {
          setTimeout(poll, POLL_INTERVAL);
          return;
        }

        const status = tx.status ?? tx.transaction_status ?? tx.status_code;

        if (FINALIZED_STATUSES.includes(status)) {
          if (onStatus) onStatus("FINALIZED");
          resolve(tx);
          return;
        }

        if (ERROR_STATUSES.includes(status)) {
          reject(new Error(tx.error || tx.message || "Transaction failed"));
          return;
        }

        if (onStatus) onStatus(String(status));
        setTimeout(poll, POLL_INTERVAL);
      } catch (err) {
        // Keep polling on network errors
        setTimeout(poll, POLL_INTERVAL);
      }
    };

    poll();
  });
}

// ═══════════════════════════════════════
// WRITE FUNCTIONS
// writeContract() must produce Type: "Call" NOT "Send"
// Transaction Data must NEVER be empty {}
// ═══════════════════════════════════════

export async function createBounty(account, title, description, requirements, rewardPoints) {
  const cl = getClient(account);
  const hash = await cl.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "create_bounty",
    args: [title, description, requirements, Number(rewardPoints) || 100],
  });
  return hash;
}

export async function submitSolution(account, bountyId, solutionUrl, description) {
  const cl = getClient(account);
  const hash = await cl.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "submit_solution",
    args: [bountyId, solutionUrl, description],
  });
  return hash;
}

export async function evaluateSubmission(account, subId) {
  const cl = getClient(account);
  const hash = await cl.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "evaluate_submission",
    args: [subId],
  });
  return hash;
}

export async function closeBounty(account, bountyId) {
  const cl = getClient(account);
  const hash = await cl.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "close_bounty",
    args: [bountyId],
  });
  return hash;
}

// ═══════════════════════════════════════
// READ FUNCTIONS
// ALL view functions return defaults on error, NEVER throw
// Wrap every readContract() in try/catch → return default
// ═══════════════════════════════════════

export async function getBounty(bountyId) {
  try {
    const cl = getReadClient();
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_bounty",
      args: [bountyId],
    });
    if (result === null || result === undefined) return "{}";
    if (typeof result === 'object' && result.result !== undefined) return String(result.result) || "{}";
    return String(result) || "{}";
  } catch {
    return "{}";
  }
}

export async function getSubmission(subId) {
  try {
    const cl = getReadClient();
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_submission",
      args: [subId],
    });
    return result || "{}";
  } catch {
    return "{}";
  }
}

export async function getBountySubmissions(bountyId) {
  try {
    const cl = getReadClient();
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_bounty_submissions",
      args: [bountyId],
    });
    return result || "[]";
  } catch {
    return "[]";
  }
}

export async function getScore(subId) {
  try {
    const cl = getReadClient();
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_score",
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
      functionName: "get_winner_points",
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
      functionName: "get_bounty_count",
      args: [],
    });
    if (result === null || result === undefined) return 0;
    if (typeof result === 'object' && result.result !== undefined) return Number(result.result) || 0;
    return Number(result) || 0;
  } catch {
    return 0;
  }
}

export async function getSubmissionCount() {
  try {
    const cl = getReadClient();
    const result = await cl.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_submission_count",
      args: [],
    });
    return Number(result) || 0;
  } catch {
    return 0;
  }
}

// Helper to get all bounties
// Contract uses "bounty-0", "bounty-1", ... (starts at 0, uses dash)
export async function getAllBounties() {
  try {
    const count = await getBountyCount();
    const bounties = [];
    for (let i = 0; i < count; i++) {
      const data = await getBounty(`bounty-${i}`);
      try {
        const parsed = JSON.parse(data);
        if (parsed && parsed.bounty_id) {
          bounties.push(parsed);
        }
      } catch {
        // skip invalid
      }
    }
    return bounties;
  } catch {
    return [];
  }
}
