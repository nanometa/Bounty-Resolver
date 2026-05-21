// ═══════════════════════════════════════
// WALLET CONTEXT — MetaMask ONLY, NEVER returns null
// NEVER use createAccount() from genlayer-js
// NEVER manually touch window.ethereum
// Let RainbowKit handle wallet connection through its own API
// ═══════════════════════════════════════

import React, { createContext, useContext, useMemo } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

const WalletContext = createContext(null);

// Default wallet object — ALWAYS returned, NEVER null
const defaultWallet = {
  address: null,
  isConnected: false,
  disconnect: () => {},
};

export function WalletProvider({ children }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const value = useMemo(() => ({
    address: address || null,
    isConnected: !!isConnected,
    disconnect: disconnect || (() => {}),
  }), [address, isConnected, disconnect]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook MUST always return object, NEVER null
export const useWallet = () => {
  const context = useContext(WalletContext);
  return context ?? defaultWallet;
};

export default WalletContext;
