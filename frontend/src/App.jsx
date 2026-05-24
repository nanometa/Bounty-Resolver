// =====================================================
// APP - RainbowKit setup, NO WalletConnect
// MetaMask injected connector ONLY
// =====================================================

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { WalletProvider } from './WalletContext';
import { ToastProvider } from './components/Toast';
import Layout from './Layout';

// Lazy loaded page components for chunk optimization
const Landing = lazy(() => import('./pages/Landing'));
const Home = lazy(() => import('./pages/Home'));
const BountyDetail = lazy(() => import('./pages/BountyDetail'));
const CreateBounty = lazy(() => import('./pages/CreateBounty'));
const SubmitSolution = lazy(() => import('./pages/SubmitSolution'));
const SubmissionDetail = lazy(() => import('./pages/SubmissionDetail'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));

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

// Wagmi config - MetaMask injected connector ONLY, NO WalletConnect
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
            accentColor: '#ffffff',
            accentColorForeground: 'black',
            borderRadius: 'none',
            fontStack: 'system',
          })}
        >
          <WalletProvider>
            <ToastProvider>
              <BrowserRouter>
                <Suspense
                  fallback={
                    <div className="min-h-screen bg-black flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-none animate-spin" />
                    </div>
                  }
                >
                  <Routes>
                    {/* Landing page - no layout */}
                    <Route path="/" element={<Landing />} />
                    {/* App pages - with layout */}
                    <Route element={<Layout />}>
                      <Route path="/app" element={<Home />} />
                      <Route path="/bounty/:bounty_id" element={<BountyDetail />} />
                      <Route path="/create" element={<CreateBounty />} />
                      <Route path="/bounty/:bounty_id/submit" element={<SubmitSolution />} />
                      <Route path="/submission/:sub_id" element={<SubmissionDetail />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </ToastProvider>
          </WalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
