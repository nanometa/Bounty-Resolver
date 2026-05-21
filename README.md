# Bounty Judge — GenLayer AI dApp

A decentralized bounty platform where GenLayer AI evaluates submissions and picks winners through consensus.

## Architecture

- **Smart Contract**: GenLayer Intelligent Contract (Python) with AI evaluation
- **Frontend**: React 18 + Vite + TailwindCSS (Bloomberg Terminal dark theme)
- **Wallet**: RainbowKit + wagmi (MetaMask only)
- **Contract SDK**: genlayer-js v1.1.8
- **Network**: GenLayer Studionet (Chain ID: 61999)

## Quick Start

### 1. Deploy the Contract

Upload `contract.py` to [GenLayer Studio](https://studio.genlayer.com/contracts) and deploy it.

Copy the deployed contract address.

### 2. Configure Frontend

Edit `frontend/src/contract.js` and replace:
```js
const CONTRACT_ADDRESS = "CONTRACT_ADDRESS";
```
with your deployed contract address.

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## How It Works

1. **Create Bounty** — Post a task with title, description, requirements, and reward points
2. **Submit Solution** — Workers submit their solution URL + description
3. **AI Evaluation** — GenLayer validators use AI to score submissions 0-100
4. **Close & Win** — Bounty owner closes → AI picks the best submission as winner
5. **Leaderboard** — Winners accumulate points

## Network

| Property | Value |
|----------|-------|
| Network | GenLayer Studionet |
| Chain ID | 61999 (0xF22F) |
| RPC | https://studio.genlayer.com/api |
| Explorer | https://explorer-studio.genlayer.com |
| Currency | GEN |

## Tech Stack

- React 18 + Vite
- TailwindCSS (dark theme)
- React Router v6
- genlayer-js v1.1.8
- RainbowKit + wagmi (MetaMask only)
- GenLayer Intelligent Contracts (Python)

## Project Structure

```
├── contract.py              # GenLayer Intelligent Contract
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # RainbowKit + Router setup
│   │   ├── Layout.jsx       # Navigation + safe wallet handling
│   │   ├── WalletContext.jsx # Wallet state (never null)
│   │   ├── contract.js      # genlayer-js client wrapper
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── BountyDetail.jsx
│   │   │   ├── CreateBounty.jsx
│   │   │   ├── SubmitSolution.jsx
│   │   │   ├── SubmissionDetail.jsx
│   │   │   └── Leaderboard.jsx
│   │   └── components/
│   │       ├── BountyCard.jsx
│   │       ├── ScoreCircle.jsx
│   │       ├── TxStatus.jsx
│   │       └── Toast.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```
