# Design Document: Bounty Judge

## Overview
Bounty Judge is a full-stack GenLayer dApp where users create bounties, workers submit solutions, and GenLayer AI evaluates submissions and picks winners.

## Architecture

### System Components
1. **Intelligent Contract (Python)** — On-chain logic with AI evaluation
2. **Contract Client (JS)** — genlayer-js v1.1.8 wrapper
3. **Frontend (React)** — Bloomberg Terminal dark UI

### Data Flow
```
User → RainbowKit (MetaMask) → genlayer-js client → GenLayer Studionet → Intelligent Contract
                                                                              ↓
                                                                    AI Validators (LLM consensus)
```

## Component Design

### Smart Contract (contract.py)
- Module-level helpers for JSON serialization
- TreeMap storage for all entities
- Nondet closures for AI evaluation and winner selection
- All closures capture locals, never reference self

### Frontend Structure
```
src/
├── App.jsx              # RainbowKit + Router setup
├── Layout.jsx           # Nav + safe wallet destructuring
├── WalletContext.jsx    # MetaMask only, never null
├── contract.js          # genlayer-js client wrapper
├── pages/
│   ├── Home.jsx         # Bounty board
│   ├── BountyDetail.jsx # Single bounty + submissions
│   ├── CreateBounty.jsx # Creation form
│   ├── SubmitSolution.jsx # Solution form
│   ├── SubmissionDetail.jsx # AI eval display
│   └── Leaderboard.jsx # Rankings
├── components/
│   ├── BountyCard.jsx
│   ├── ScoreCircle.jsx
│   ├── TxStatus.jsx
│   └── Toast.jsx
├── index.css            # Tailwind + custom vars
└── main.jsx             # Entry point
```

### Network Configuration
- Chain: GenLayer Studionet
- Chain ID: 61999
- RPC: https://studio.genlayer.com/api
- SDK: genlayer-js v1.1.8
- Import: studionet from "genlayer-js/chains"
