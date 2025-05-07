import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSolanaConnection } from "./useSolanaConnection";
import { PublicKey } from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/lib/constants";

export interface Transaction {
  signature: string;
  type: string;
  amount: string;
  date: string;
  status: string;
}

interface WalletAdapter {
  name: string;
  icon: string;
  publicKey: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

// Enhanced implementation with real wallet support
export function useWallet() {
  const { toast } = useToast();
  const { connection, error: connectionError } = useSolanaConnection();
  
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<{ name: string; icon: string } | null>(null);
  const [transactions, setTransactions] = useState<{
    loading: boolean;
    data: Transaction[] | null;
  }>({
    loading: false,
    data: null,
  });
  
  // Check if wallet extensions are available
  const hasPhantomWallet = typeof window !== 'undefined' && 
    typeof window.solana !== 'undefined' && 
    window.solana.isPhantom;
    
  const hasSolflareWallet = typeof window !== 'undefined' && 
    typeof window.solflare !== 'undefined';

  // Create phantom wallet adapter
  const phantomWalletAdapter: WalletAdapter = {
    name: "Phantom",
    icon: "phantom-icon",
    publicKey: hasPhantomWallet && window.solana?.publicKey?.toString() || null,
    isConnected: hasPhantomWallet && window.solana?.isConnected || false,
    connect: async () => {
      try {
        if (hasPhantomWallet && window.solana && typeof window.solana.connect === 'function') {
          // Use proper connect options to force the popup to appear
          await window.solana.connect({ onlyIfTrusted: false });
          
          // Wait for connection to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          return Promise.resolve();
        }
        return Promise.reject(new Error("Phantom not available"));
      } catch (error) {
        console.error("Error connecting to Phantom:", error);
        return Promise.reject(error);
      }
    },
    disconnect: async () => {
      try {
        if (hasPhantomWallet && window.solana?.disconnect) {
          await window.solana.disconnect();
        }
        return Promise.resolve();
      } catch (error) {
        console.error("Error disconnecting from Phantom:", error);
        return Promise.reject(error);
      }
    }
  };
  
  // Create solflare wallet adapter
  const solflareWalletAdapter: WalletAdapter = {
    name: "Solflare",
    icon: "solflare-icon",
    publicKey: hasSolflareWallet ? window.solflare?.publicKey?.toString() || null : null,
    isConnected: hasSolflareWallet ? window.solflare?.isConnected || false : false,
    connect: async () => {
      try {
        if (hasSolflareWallet && window.solflare?.connect) {
          // Connect with explicit options to force the popup
          await window.solflare.connect({
            onlyIfTrusted: false
          });
          
          // Wait for connection to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          return Promise.resolve();
        }
        return Promise.reject(new Error("Solflare not available"));
      } catch (error) {
        console.error("Error connecting to Solflare:", error);
        return Promise.reject(error);
      }
    },
    disconnect: async () => {
      try {
        if (hasSolflareWallet && window.solflare?.disconnect) {
          await window.solflare.disconnect();
          return Promise.resolve();
        }
        return Promise.reject(new Error("Solflare not available"));
      } catch (error) {
        console.error("Error disconnecting from Solflare:", error);
        return Promise.reject(error);
      }
    }
  };
  
  // Function to fetch wallet transactions
  const fetchWalletTransactions = useCallback(async (address: string) => {
    if (!address) return;
    
    try {
      setTransactions(prev => ({ ...prev, loading: true }));
      
      const response = await fetch(`/api/wallet/transactions?address=${address}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }
      
      const data = await response.json();
      setTransactions({
        loading: false,
        data: data
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions({
        loading: false,
        data: []
      });
      toast({
        title: "Transaction fetch failed",
        description: error instanceof Error ? error.message : "Could not load transactions",
        variant: "destructive"
      });
    }
  }, [toast]);
  
  // We now only support browser extension wallets (Phantom and Solflare)
  
  // Available wallets - only browser extension wallets
  const availableWallets = [
    phantomWalletAdapter,
    solflareWalletAdapter
  ];

  // Function to fetch and update wallet balance - without synthetic fallbacks
  const fetchWalletBalance = useCallback(async () => {
    try {
      if (!connection || !walletAddress) {
        return;
      }
      
      // Get balance from Solana connection
      const publicKey = new PublicKey(walletAddress);
      const balance = await connection.getBalance(publicKey);
      
      // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
      const solBalance = balance / 1_000_000_000;
      setWalletBalance(solBalance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      // Don't set any fallback value
      setWalletBalance(null);
      
      toast({
        title: "Balance fetch error",
        description: "Could not retrieve your wallet balance. Ensure your connection is stable.",
        variant: "destructive",
      });
    }
  }, [connection, walletAddress, toast]);

  // Check if any wallet is already connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      for (const wallet of availableWallets) {
        if (wallet.isConnected && wallet.publicKey) {
          setConnected(true);
          setWalletAddress(wallet.publicKey);
          setSelectedWallet({ name: wallet.name, icon: wallet.icon });
          break;
        }
      }
    };
    
    checkWalletConnection();
  }, []);
  
  // Effect to update wallet balance whenever wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchWalletBalance();
      
      // Set up an interval to refresh balance every 30 seconds
      const balanceInterval = setInterval(() => {
        fetchWalletBalance();
      }, 30000);
      
      return () => clearInterval(balanceInterval);
    }
  }, [walletAddress, fetchWalletBalance]);
  
  // Effect to fetch transactions when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchWalletTransactions(walletAddress);
      
      // Set up an interval to refresh transactions every 60 seconds
      const txInterval = setInterval(() => {
        fetchWalletTransactions(walletAddress);
      }, 60000);
      
      return () => clearInterval(txInterval);
    }
  }, [walletAddress, fetchWalletTransactions]);
  
  // Connect to wallet - use the proper wallet adapter based on user selection
  const connectWallet = useCallback(async (walletName?: string) => {
    if (connected || connecting) {
      return;
    }
    
    setConnecting(true);
    
    try {
      console.log("Starting wallet connection with wallet:", walletName);
      
      // Find the wallet adapter based on the name (case-insensitive)
      let walletToConnect = phantomWalletAdapter; // Default to Phantom
      
      if (walletName) {
        const normalizedWalletName = walletName.toLowerCase();
        
        if (normalizedWalletName.includes('phantom')) {
          walletToConnect = phantomWalletAdapter;
        } else if (normalizedWalletName.includes('solflare')) {
          walletToConnect = solflareWalletAdapter;
        }
      }
      
      console.log(`Using ${walletToConnect.name} adapter for connection`);
      
      // Attempt connection with timeout
      const connectPromise = walletToConnect.connect();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection attempt timed out")), 10000);
      });
      
      await Promise.race([connectPromise, timeoutPromise]);
      
      // Small delay to allow the wallet to update its state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update connection state after successful connection
      const publicKey = walletToConnect.publicKey;
      if (publicKey) {
        console.log("Wallet connected successfully with public key:", publicKey);
        setWalletAddress(publicKey);
        setConnected(true);
        setSelectedWallet({ name: walletToConnect.name, icon: walletToConnect.icon });
        
        toast({
          title: `${walletToConnect.name} connected`,
          description: `Connected with address ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`,
        });
        
        // Fetch initial data
        fetchWalletBalance();
        fetchWalletTransactions(publicKey);
      } else {
        throw new Error(`Connected but no public key available`);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  }, [connected, connecting, toast, fetchWalletBalance, fetchWalletTransactions]);
  
  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      // Perform disconnection based on which wallet was connected
      if (selectedWallet) {
        const walletToDisconnect = availableWallets.find(
          w => w.name === selectedWallet.name
        );
        
        if (walletToDisconnect) {
          try {
            await walletToDisconnect.disconnect();
          } catch (e) {
            console.error(`Error disconnecting from ${selectedWallet.name}:`, e);
          }
        }
      }
      
      // Clear local state regardless of disconnection success
      setConnected(false);
      setWalletAddress(null);
      setWalletBalance(null);
      setSelectedWallet(null);
      setTransactions({ loading: false, data: null });
      
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error) {
      console.error("Error in disconnectWallet:", error);
      
      // Force disconnect by clearing state even if adapter fails
      setConnected(false);
      setWalletAddress(null);
      setWalletBalance(null);
      setSelectedWallet(null);
      
      toast({
        title: "Forced disconnection",
        description: "Wallet state cleared but there might have been errors",
        variant: "destructive",
      });
    }
  }, [selectedWallet, availableWallets, toast]);
  
  return {
    connected,
    connecting,
    walletAddress,
    walletBalance,
    selectedWallet,
    transactions: transactions.data,
    loadingTransactions: transactions.loading,
    availableWallets,
    connectWallet,
    disconnectWallet,
  };
}