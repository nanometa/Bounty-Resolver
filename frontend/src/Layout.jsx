import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from './WalletContext';
import { SmokeBackground } from './components/ui/SmokeBackground';

function Layout() {
  const wallet = useWallet() ?? {};
  const { address = null, isConnected = false } = wallet;
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#050508] relative flex flex-col">
      {/* Smoke Background — Purple */}
      <div className="fixed inset-0 z-0 opacity-50">
        <SmokeBackground smokeColor="#8B5CF6" />
      </div>

      {/* Floating Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Navigation */}
      <nav className="nav-glass sticky top-0 z-50">
        <div className="w-full px-6 h-20 flex items-center justify-center relative">
          {/* Logo + Name — LEFT aligned to window edge */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0 absolute left-4">
            <img src="/logo.png" alt="Bounty Resolver" className="w-16 h-16 object-contain logo-shimmer" />
            <div>
              <span className="font-heading font-bold text-lg text-white group-hover:text-violet-300 transition-colors">
                Bounty Resolver
              </span>
              <span className="hidden md:block text-[10px] text-violet-400/60 -mt-1">GenLayer AI</span>
            </div>
          </Link>

          {/* Nav Links — CENTER */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
            <Link
              to="/app"
              className={`inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/app')
                  ? 'bg-white/5 border border-slate-500/40 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Bounties
            </Link>
            <Link
              to="/create"
              className={`inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/create')
                  ? 'bg-white/5 border border-slate-500/40 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Create Bounty
            </Link>
          </div>

          {/* Wallet — RIGHT edge */}
          <div className="absolute right-4">
            <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a2e] py-5 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-muted text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 pulse-glow" />
            <span className="text-slate-400">Bounty Judge — Powered by GenLayer AI Consensus</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-slate-500">Studionet • 61999</span>
            <a href="https://explorer-studio.genlayer.com" target="_blank" rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 transition-colors">
              Explorer ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

