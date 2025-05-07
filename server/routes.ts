import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import axios from "axios";
import { storage } from "./storage";
import { 
  getNetworkStatus, 
  getPriorityFeeRecommendation,
  getHistoricalData,
  RPC_ENDPOINT 
} from "./solanaService";

// Define a type for our WebSocket client with custom properties
type CustomWebSocket = WebSocket & {
  subscribedTo?: string;
  userId?: number;
}

// No simulation state needed - we're using real blockchain data

export async function registerRoutes(app: Express): Promise<Server> {
  // Network status - get current congestion levels and stats
  app.get("/api/network-status", async (req, res) => {
    try {
      const networkStatus = await getNetworkStatus();
      res.json(networkStatus);
    } catch (error) {
      console.error("Error fetching network status:", error);
      // Return 503 Service Unavailable for RPC connection issues
      res.status(503).json({ 
        message: "Failed to fetch network status",
        error: error instanceof Error ? error.message : "Unknown error",
        isRpcError: true
      });
    }
  });

  // Historical data - get past congestion patterns
  app.get("/api/historical-data", async (req, res) => {
    try {
      const timeframe = req.query.timeframe as string || "week";
      const historicalData = await getHistoricalData(timeframe);
      res.json(historicalData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      // Return 503 Service Unavailable for RPC connection issues
      res.status(503).json({ 
        message: "Failed to fetch historical data",
        error: error instanceof Error ? error.message : "Unknown error",
        isRpcError: true
      });
    }
  });

  // Priority fee recommendation - calculate optimal fee
  app.post("/api/priority-fee-recommendation", async (req, res) => {
    try {
      const { transactionType, priority, priorityFee } = req.body;
      
      if (!transactionType || !priority) {
        return res.status(400).json({ 
          message: "Transaction type and priority are required" 
        });
      }
      
      const recommendation = await getPriorityFeeRecommendation(
        transactionType,
        priority,
        priorityFee
      );
      
      res.json(recommendation);
    } catch (error) {
      console.error("Error calculating priority fee:", error);
      // Return 503 Service Unavailable for RPC connection issues
      res.status(503).json({ 
        message: "Failed to calculate priority fee",
        error: error instanceof Error ? error.message : "Unknown error",
        isRpcError: true
      });
    }
  });
  
  // Get notifications for the user
  app.get("/api/notifications", async (req, res) => {
    try {
      // Get user ID from query params or use default for demo
      const userId = parseInt(req.query.userId as string || "1");
      
      // Get notifications from database
      const { db } = await import("./db");
      const { alerts } = await import("../shared/schema");
      const { eq } = await import("drizzle-orm");
      
      // Get alerts for this user or public alerts
      const userNotifications = await db.select()
        .from(alerts)
        .where(eq(alerts.userId, userId))
        .orderBy(alerts.createdAt);
      
      res.json(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ 
        message: "Failed to fetch notifications",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Save notification settings
  app.post("/api/notifications/settings", async (req, res) => {
    try {
      const { userId, settings } = req.body;
      
      if (!userId || !settings) {
        return res.status(400).json({ 
          message: "User ID and settings are required" 
        });
      }
      
      // Save settings to database
      // For demo purposes, we'll just return success
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      res.status(500).json({ 
        message: "Failed to save notification settings",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Create sample notifications (for demo purposes)
  app.post("/api/notifications/sample", async (req, res) => {
    try {
      const userId = parseInt(req.body.userId || "1");
      
      // Get DB connection
      const { db } = await import("./db");
      const { alerts } = await import("../shared/schema");
      
      // Create sample notifications
      const sampleNotifications = [
        {
          userId,
          title: "Network Congestion Alert",
          message: "Solana network congestion is currently high. Consider increasing your priority fee for faster transactions.",
          alertType: "warning",
          type: "high_congestion",
          threshold: 85,
          active: true,
          read: false
        },
        {
          userId,
          title: "Transaction Confirmed",
          message: "Your SOL transfer of 0.5 SOL has been confirmed with a confirmation time of 0.4 seconds.",
          alertType: "success",
          type: "transaction_success",
          active: true,
          read: false
        },
        {
          userId,
          title: "Priority Fee Update",
          message: "Priority fee average has decreased by 20% in the last hour. Good time for non-urgent transactions.",
          alertType: "info",
          type: "fee_change",
          threshold: 20,
          active: true,
          read: false
        }
      ];
      
      // Insert sample notifications
      const result = await db.insert(alerts).values(sampleNotifications).returning();
      
      res.json({ 
        success: true, 
        count: result.length,
        notifications: result
      });
    } catch (error) {
      console.error("Error creating sample notifications:", error);
      res.status(500).json({ 
        message: "Failed to create sample notifications",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Mark notification as read
  app.post("/api/notifications/read", async (req, res) => {
    try {
      const { alertId } = req.body;
      
      if (!alertId) {
        return res.status(400).json({ 
          message: "Alert ID is required" 
        });
      }
      
      // Mark as read in database
      const { db } = await import("./db");
      const { alerts } = await import("../shared/schema");
      const { eq } = await import("drizzle-orm");
      
      // Parse alertId to a number since our database uses numeric IDs
      const alertIdNum = parseInt(alertId);
      
      if (isNaN(alertIdNum)) {
        return res.status(400).json({ 
          message: "Invalid alert ID format" 
        });
      }
      
      await db.update(alerts)
        .set({ read: true })
        .where(eq(alerts.id, alertIdNum));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ 
        message: "Failed to mark notification as read",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Set<CustomWebSocket>();
  
  // Handle WebSocket connections
  wss.on('connection', (ws: CustomWebSocket) => {
    console.log('WebSocket client connected');
    clients.add(ws);
    
    // Send initial data to the client
    sendNetworkUpdate(ws);
    
    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message: ${JSON.stringify(data)}`);
        
        // Handle specific message types
        if (data.type === 'subscribe') {
          // Client is subscribing to real-time updates
          ws.subscribedTo = data.channel || 'network';
          console.log(`Client subscribed to ${ws.subscribedTo} updates`);
        }
      } catch (error) {
        console.error(`Error processing WebSocket message:`, error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
  });
  
  // Set up periodic network status updates to all connected clients
  setInterval(() => {
    // Only send updates if we have connected clients
    if (clients.size > 0) {
      console.log(`Sending periodic updates to ${clients.size} connected clients`);
      broadcastNetworkUpdates(clients);
    }
  }, 10000); // Send updates every 10 seconds
  
  // Function to send network status to a specific client
  async function sendNetworkUpdate(ws: CustomWebSocket) {
    try {
      const networkStatus = await getNetworkStatus();
      
      // Only send if the connection is still open
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'network-update',
          data: networkStatus,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error(`Error sending network update:`, error);
    }
  }
  
  // Function to broadcast network updates to all connected clients
  async function broadcastNetworkUpdates(clients: Set<CustomWebSocket>) {
    try {
      // Get real network status directly from Solana RPC - no synthetic data
      const networkStatus = await getNetworkStatus();
      
      // Broadcast to all connected clients
      const message = JSON.stringify({
        type: 'network-update',
        data: networkStatus,
        timestamp: new Date().toISOString()
      });
      
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error(`Error broadcasting network updates:`, error);
    }
  }
  
  // Add the wallet transactions endpoint
  app.get("/api/wallet/transactions", async (req, res) => {
    try {
      const { address } = req.query;
      
      if (!address) {
        return res.status(400).json({ error: "Wallet address is required" });
      }
      
      console.log(`Fetching transactions for wallet: ${address}`);
      
      // Make an RPC call to Solana to get the transaction signatures
      try {
        const signaturesResponse = await axios.post(RPC_ENDPOINT, {
          jsonrpc: "2.0",
          id: 1,
          method: "getSignaturesForAddress",
          params: [address, { limit: 10 }]
        });
        
        const signatures = signaturesResponse.data.result || [];
        
        if (signatures.length === 0) {
          return res.json([]);
        }
        
        // Process the signatures to get transaction details
        const transactions = [];
        
        for (const sig of signatures) {
          try {
            // Get transaction details using RPC
            const txResponse = await axios.post(RPC_ENDPOINT, {
              jsonrpc: "2.0",
              id: 1,
              method: "getTransaction",
              params: [sig.signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }]
            });
            
            const tx = txResponse.data.result;
            
            if (!tx) continue;
            
            // Determine transaction type and amount
            let type = "Unknown";
            let amount = "0";
            
            // Process transaction based on its contents
            if (tx.meta && tx.transaction && tx.transaction.message && tx.transaction.message.instructions && tx.transaction.message.instructions.length > 0) {
              const instruction = tx.transaction.message.instructions[0];
              
              // Try to determine the transaction type
              if (instruction.program === "system") {
                type = "SOL Transfer";
                // Extract actual amount from the transaction
                if (tx.meta?.postBalances && tx.meta?.preBalances && 
                    tx.transaction?.message?.accountKeys) {
                  const accountIndex = tx.transaction.message.accountKeys.findIndex(
                    (key: any) => key.pubkey === address
                  );
                  if (accountIndex >= 0) {
                    const preBalance = tx.meta.preBalances[accountIndex];
                    const postBalance = tx.meta.postBalances[accountIndex];
                    const balanceDiff = Math.abs(postBalance - preBalance) / 1_000_000_000; // Convert lamports to SOL
                    amount = balanceDiff.toFixed(4);
                  }
                }
              } else if (tx.meta?.logMessages && tx.meta.logMessages.some((log: string) => log.includes("Swap"))) {
                type = "Token Swap";
                // For token swaps we would need to parse the token amounts from the logs
                // We'll extract from logs if possible or leave as unknown
                amount = "Unknown Amount";
              } else if (tx.meta?.logMessages && tx.meta.logMessages.some((log: string) => log.includes("Mint"))) {
                type = "NFT Mint";
                // NFTs are typically 1 token, but we should confirm from the transaction
                amount = "1";
              }
            }
            
            transactions.push({
              signature: sig.signature,
              type,
              amount,
              date: new Date(sig.blockTime ? sig.blockTime * 1000 : Date.now()).toLocaleString(),
              status: tx.meta?.err ? "Failed" : "Success"
            });
          } catch (error) {
            console.error(`Error processing transaction ${sig.signature}:`, error);
            // Skip this transaction and continue
          }
        }
        
        res.json(transactions);
      } catch (error) {
        console.error("RPC call failed:", error);
        
        // Return a 503 Service Unavailable with clear error message
        res.status(503).json({ 
          message: "Failed to fetch wallet transactions",
          error: error instanceof Error ? error.message : "Unknown error",
          isRpcError: true
        });
      }
    } catch (error) {
      console.error("Error in /api/wallet/transactions:", error);
      res.status(500).json({ error: "Failed to fetch wallet transactions" });
    }
  });
  
  return httpServer;
}
