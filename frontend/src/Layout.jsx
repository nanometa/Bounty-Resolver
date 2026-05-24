import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from './WalletContext';
import Logo from './components/Logo';
import CyberneticGridShader from './components/ui/CyberneticGridShader';

function Layout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `font-mono inline-flex items-center justify-center px-5 py-2.5 text-sm tracking-widest uppercase transition-all border ${
      isActive(path)
        ? 'border-white text-white bg-white/10'
        : 'border-transparent text-gray-400 hover:text-white hover:border-white/40'
    }`;

  return (
    <div className="min-h-screen bg-black relative flex flex-col text-white">
      <CyberneticGridShader />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm">
        <div className="w-full px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <Logo className="w-10 h-10 text-white group-hover:text-white transition-colors" />
            <div className="font-mono">
              <div className="text-base font-bold tracking-wider text-white group-hover:text-white transition-colors">
                BOUNTY_RESOLVER
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1">
              <Link to="/app" className={navLinkClass('/app')}>
                Bounties
              </Link>
              <Link to="/create" className={navLinkClass('/create')}>
                Create
              </Link>
              <Link to="/leaderboard" className={navLinkClass('/leaderboard')}>
                Leaderboard
              </Link>
            </div>
            <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
          </div>

          {/* Mobile: only wallet button visible */}
          <div className="md:hidden">
            <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 py-5 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <span className="w-2 h-2 bg-white animate-pulse" />
            <span>{'> SYSTEM_OPERATIONAL // POWERED_BY_GENLAYER'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 tracking-widest">STUDIONET // CHAIN_61999</span>
            <a
              href="https://explorer-studio.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors tracking-widest"
            >
              EXPLORER
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
