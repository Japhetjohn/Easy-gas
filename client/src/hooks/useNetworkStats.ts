import { useQuery } from "@tanstack/react-query";
import { REFETCH_INTERVAL } from "@/lib/constants";
import { useState, useEffect, useRef } from 'react';

export interface NetworkStats {
  congestionPercentage: number;
  congestionStatus: "Low" | "Medium" | "High";
  avgConfirmationTime: string;
  confirmationStatus: string;
  recommendedPriorityFee: string;
  priorityFeeStatus: string;
  blockTime: string;
  tps: number;
  failedTxPercentage: number;
  validatorCount: number;
  blockTimeChange: number;
  tpsChange: number;
  failedTxChange: number;
  validatorCountChange: number;
  currentSlot: string;
}

export function useNetworkStats() {
  const [wsData, setWsData] = useState<NetworkStats | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  
  // Initial data fetch with React Query
  const queryResult = useQuery<NetworkStats>({
    queryKey: ['/api/network-status'],
    refetchInterval: wsConnected ? false : REFETCH_INTERVAL, // Only refetch if websocket is not connected
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attempt) => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000), // Exponential backoff
    // Add error handling for the API request
    queryFn: async () => {
      try {
        const response = await fetch('/api/network-status');
        if (!response.ok) {
          // Extract error details if available
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch network status');
        }
        return response.json();
      } catch (error) {
        // Don't log errors to console to prevent noise
        throw error; // Re-throw to be handled by React Query
      }
    }
  });
  
  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    // Function to create and set up the WebSocket connection
    const setupWebSocket = () => {
      // Check if there's an existing connection
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      }
      
      // Close any existing connection that might be in a bad state
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (err) {
          console.error('Error closing existing WebSocket connection:', err);
        }
      }
      
      // Create WebSocket connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // Handle WebSocket events
      socket.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        
        // Subscribe to network updates
        socket.send(JSON.stringify({
          type: 'subscribe',
          channel: 'network'
        }));
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Process different message types
          if (message.type === 'network-update') {
            // Process the network update silently
            setWsData(message.data);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };
      
      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        socketRef.current = null;
        
        // Try to reconnect after 3 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          setupWebSocket();
        }, 3000);
      };
    };
    
    // Initial setup
    setupWebSocket();
    
    // Add a visibility change listener to reconnect when the user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page is now visible, checking WebSocket connection');
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
          console.log('WebSocket not connected, reconnecting...');
          setupWebSocket();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up WebSocket connection on component unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        console.log('Closing WebSocket connection');
        socketRef.current.close();
      }
      socketRef.current = null;
    };
  }, []);
  
  // Combine data from both sources, preferring WebSocket data when available
  const data = wsData || queryResult.data;
  
  return {
    ...queryResult,
    data,
    isRealTime: wsConnected,
    wsConnected
  };
}
