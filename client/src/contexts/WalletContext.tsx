import { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '@/hooks/useWallet';

// Define the shape of our wallet context
export type WalletContextType = ReturnType<typeof useWallet>;

// Create context with a safe default value
export const WalletContext = createContext<WalletContextType | null>(null);

// Provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  
  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook to use the wallet context
export function useWalletContext() {
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  
  return context;
}