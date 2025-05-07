import { useState, useEffect } from "react";
import { Connection } from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/lib/constants";

export function useSolanaConnection() {
  // Only use real Connection type, no synthetic data
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      try {
        setIsConnecting(true);
        
        // Always create a connection object regardless of RPC availability
        // This makes the UI more stable
        const conn = new Connection(RPC_ENDPOINT, "confirmed");
        
        // Set the connection immediately to prevent UI flicker
        if (mounted) {
          setConnection(conn);
        }
        
        try {
          // Test the connection but don't make UI depend on it
          await conn.getVersion();
          if (mounted) {
            setError(null);
          }
        } catch (testError) {
          console.warn("Connection test failed, will retry:", testError);
          if (mounted) {
            setError("Connection limited");
          }
        }
        
        if (mounted) {
          setIsConnecting(false);
        }
      } catch (err) {
        // Don't log to console to avoid error noise
        if (mounted) {
          // Still provide a connection object
          const fallbackConn = new Connection(RPC_ENDPOINT, "confirmed");
          setConnection(fallbackConn);
          setError("Connection initialized but may have limited functionality");
          setIsConnecting(false);
        }
      }
    };

    connect();

    // Set up periodic connection check - more resilient approach
    const intervalId = setInterval(() => {
      // Always try to maintain the connection
      connect();
    }, 15000); // Check more frequently

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return { connection, isConnecting, error };
}
