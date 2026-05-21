// ═══════════════════════════════════════
// APP — RainbowKit setup, NO WalletConnect
// MetaMask injected connector ONLY
// ═══════════════════════════════════════

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { WalletProvider } from './WalletContext';
import { ToastProvider } from './components/Toast';
import Layout from './Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import BountyDetail from './pages/BountyDetail';
import CreateBounty from './pages/CreateBounty';
import SubmitSolution from './pages/SubmitSolution';
import SubmissionDetail from './pages/SubmissionDetail';
import Leaderboard from './pages/Leaderboard';

// GenLayer Studionet chain definition
const genlayerStudionet = {
  id: 61999,
  name: 'GenLayer Studionet',
  nativeCurrency: {
    name: 'GEN',
    symbol: 'GEN',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://studio.genlayer.com/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'GenLayer Explorer',
      url: 'https://explorer-studio.genlayer.com',
    },
  },
};

// Wagmi config — MetaMask injected connector ONLY, NO WalletConnect
const config = createConfig({
  chains: [genlayerStudionet],
  connectors: [
    injected(), // MetaMask only
  ],
  transports: {
    [genlayerStudionet.id]: http('https://studio.genlayer.com/api'),
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: '#8b5cf6',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          <WalletProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  {/* Landing page — no layout */}
                  <Route path="/" element={<Landing />} />
                  {/* App pages — with layout */}
                  <Route element={<Layout />}>
                    <Route path="/app" element={<Home />} />
                    <Route path="/bounty/:bounty_id" element={<BountyDetail />} />
                    <Route path="/create" element={<CreateBounty />} />
                    <Route path="/bounty/:bounty_id/submit" element={<SubmitSolution />} />
                    <Route path="/submission/:sub_id" element={<SubmissionDetail />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </WalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
