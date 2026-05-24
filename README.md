<div align="center">

# BOUNTY_RESOLVER

**Decentralized AI-judged bounty platform built on GenLayer.**

Create bounties. Submit solutions. Let AI validators evaluate and pick winners through on-chain consensus.

[![Built with GenLayer](https://img.shields.io/badge/Built_with-GenLayer-39ff14?style=for-the-badge)](https://genlayer.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)](LICENSE)

[Live Demo](https://bountyresolver.vercel.app) - [Report Bug](https://github.com/nanometa/Bounty-Resolver/issues) - [Request Feature](https://github.com/nanometa/Bounty-Resolver/issues)

</div>

---

## Overview

Bounty Resolver is the first AI-judged bounty platform built on GenLayer's decentralized network. Traditional bounty platforms rely on centralized arbiters who can be biased, slow, or compromised. Bounty Resolver replaces that single point of failure with a network of AI validators that:

- Fetch and read submitted URLs directly from the blockchain.
- Evaluate work quality using natural-language reasoning.
- Reach consensus on a final score and winner.
- Store the verdict immutably on-chain.

No oracles. No middlemen. No disputes.

## How It Works

```
[1] CREATE BOUNTY        [2] SUBMIT SOLUTION       [3] AI EVALUATION         [4] WINNER PAID
    Owner posts task        Worker submits URL        Validators fetch URL,     Top score wins.
    Title, description,     and short description.    read content, score       Points awarded
    requirements, points.   Stored on-chain.          0-100 with feedback.      to leaderboard.
```

### Roles

| Role          | Permissions |
| ------------- | ----------- |
| **Owner**     | Creates bounties, requests AI evaluation of submissions, closes bounty and selects winner. |
| **Worker**    | Submits solutions to open bounties. Earns points when their submission wins. |
| **Validator** | (Off-chain, GenLayer network) Independent AI agents that evaluate submissions and reach consensus. |

### Trust Model

- **Owner controls evaluation**: Only the bounty creator can request AI evaluation and close a bounty. This prevents griefing (random users forcing evaluations).
- **AI provides judgment**: Multiple validators independently score each submission. GenLayer's consensus mechanism aggregates the verdict.
- **Chain provides finality**: All bounties, submissions, scores, and winners are recorded immutably on GenLayer Studionet (chain id `61999`).

## Tech Stack

- **Smart Contract** - Python intelligent contract on GenLayer (`gl.nondet.web.render` for AI-driven URL inspection).
- **Frontend** - React 18 + Vite 5 + Tailwind CSS, brutalist mono design system.
- **Wallet / Web3** - RainbowKit + wagmi + viem (MetaMask injected connector only, no WalletConnect).
- **Chain SDK** - `genlayer-js` v1.1.8.
- **Background** - WebGL shader (Three.js) for cybernetic grid backdrop.

## Project Structure

```
Bounty-Resolver/
├── contract.py              # GenLayer intelligent contract
├── frontend/
│   ├── src/
│   │   ├── App.jsx                   # RainbowKit + router setup
│   │   ├── Layout.jsx                # Nav + footer + animated background
│   │   ├── contract.js               # Type-safe contract client with input validation
│   │   ├── pages/
│   │   │   ├── Landing.jsx           # Hero, How It Works, Features
│   │   │   ├── Home.jsx              # /app - bounty list
│   │   │   ├── BountyDetail.jsx      # /bounty/:id - details + submissions
│   │   │   ├── CreateBounty.jsx      # /create - new bounty form
│   │   │   ├── SubmitSolution.jsx    # /bounty/:id/submit
│   │   │   ├── SubmissionDetail.jsx  # /submission/:id - AI verdict
│   │   │   └── Leaderboard.jsx       # /leaderboard - winner ranks
│   │   └── components/
│   │       ├── BountyCard.jsx
│   │       ├── ScoreCircle.jsx
│   │       ├── TxStatus.jsx
│   │       ├── Toast.jsx
│   │       ├── Logo.jsx
│   │       └── ui/
│   │           ├── CyberneticGridShader.jsx   # WebGL background
│   │           └── FeatureShaderCards.jsx
│   ├── vite.config.js                # Vendor chunking, build optimization
│   ├── vercel.json                   # SPA rewrites + security headers
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- A wallet funded with GenLayer Studionet test tokens

### Installation

```bash
git clone https://github.com/nanometa/Bounty-Resolver.git
cd Bounty-Resolver/frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### Environment

The contract address and chain config are pinned in `frontend/src/contract.js`. No `.env` required for local development.

| Setting          | Value |
| ---------------- | ----- |
| Contract Address | `0x9bcE7b8f2068dB71Da18B231F12104B057feb7dF` |
| Chain ID         | `61999` |
| RPC              | `https://studio.genlayer.com/api` |
| Explorer         | `https://explorer-studio.genlayer.com` |

### Deploy

```bash
npm run build       # produces ./dist
npm run preview     # serves the production build
```

The included `vercel.json` is preconfigured with SPA rewrites and security headers (HSTS, X-Frame-Options, Referrer-Policy, etc.).

## Smart Contract API

| Function                         | Type  | Description |
| -------------------------------- | ----- | ----------- |
| `create_bounty(title, desc, req, pts)` | write | Create a bounty. Caller becomes the owner. |
| `submit_solution(bounty_id, url, desc)` | write | Submit a solution URL to a bounty. |
| `evaluate_submission(sub_id)`    | write | (Owner only) Trigger AI evaluation of a submission. |
| `close_bounty(bounty_id)`        | write | (Owner only) Close bounty, pick winner with highest score, distribute points. |
| `get_bounty(bounty_id)`          | read  | Returns bounty JSON. |
| `get_submission(sub_id)`         | read  | Returns submission JSON with feedback, strengths, gaps. |
| `get_bounty_submissions(bounty_id)` | read | Returns array of submission ids. |
| `get_score(sub_id)`              | read  | Returns 0-100 score (0 if not yet evaluated). |
| `get_winner_points(address)`     | read  | Returns total points earned across all wins. |
| `get_bounty_count()`             | read  | Returns total bounty count. |

## Security

The frontend ships with defense-in-depth hardening:

- **Input validation** in `contract.js`: every write call checks address format, string length, URL protocol (http/https only), and numeric bounds before sending to chain.
- **No private keys in code**: signing is delegated to MetaMask via wagmi's injected connector. No WalletConnect, no key import flows.
- **HTTP security headers** via `vercel.json`:
  - `Strict-Transport-Security` (HSTS, 2 years, preload)
  - `X-Frame-Options: DENY` (clickjacking)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (disables camera/mic/geolocation)
- **No secrets committed**: `.env*` files are gitignored. Contract address is public by design.
- **Read errors swallow gracefully**: every `readContract()` is wrapped in try/catch returning safe defaults so a failed RPC never crashes the UI.
- **Long-form text is bounded**: title (200), description (5000), requirements (5000), URL (500), to prevent storage abuse and oversized transactions.

## Performance

- **Code splitting**: Routes are lazy-loaded via `React.lazy`. Vendor chunks split into `vendor-react`, `vendor-web3`, `vendor-three`, `vendor`.
- **Parallel reads**: `getAllBounties()` fetches bounties with `Promise.all` instead of sequential awaits.
- **Tree-shaken dependencies**: tsparticles, framer-motion, paper-design and other unused libs were removed.
- **Long cache** for `/assets/*` (immutable hashed files).

## Design System

Technical-Brutalist:
- Pure black background (`#000000`)
- JetBrains Mono / Space Mono fonts
- Sharp edges, no rounded corners
- Thin white borders (`border-white/30`)
- Uppercase tracking-widest for buttons
- Hover invert (white background + black text + white glow)
- Animated WebGL grid backdrop at low opacity

## Roadmap

- [ ] Refund mechanism if bounty closes with no submissions
- [ ] Multi-winner bounties (split points across top N)
- [ ] Worker reputation badges
- [ ] On-chain dispute appeal flow
- [ ] Public testnet faucet integration

## Contributing

Pull requests welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE) - 2026 nanometa.

---

<div align="center">

Built on [GenLayer](https://genlayer.com) - Powered by AI consensus.

</div>
