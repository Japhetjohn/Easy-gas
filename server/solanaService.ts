import axios from "axios";
import { NetworkStats } from "../client/src/hooks/useNetworkStats";

// Get Solana RPC endpoint from environment variables with fallback
export const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

/**
 * Get current network status including congestion levels by querying Solana RPC
 */
export async function getNetworkStatus(): Promise<NetworkStats> {
  try {
    console.log(`Fetching data from Solana RPC: ${RPC_ENDPOINT}`);
    
    // Make real RPC calls to get performance samples
    const performanceSamplesResponse = await axios.post(RPC_ENDPOINT, {
      jsonrpc: "2.0",
      id: 1,
      method: "getRecentPerformanceSamples",
      params: [4], // Get last 4 samples
    });

    // Get current slot info
    const slotResponse = await axios.post(RPC_ENDPOINT, {
      jsonrpc: "2.0",
      id: 2,
      method: "getSlot",
      params: [],
    });

    // Get validator count
    const clusterNodesResponse = await axios.post(RPC_ENDPOINT, {
      jsonrpc: "2.0",
      id: 3,
      method: "getClusterNodes",
      params: [],
    });

    // Extract relevant metrics from the responses
    const samples = performanceSamplesResponse.data.result || [];
    const currentSlot = slotResponse.data.result?.toString() || "0";
    const validators = clusterNodesResponse.data.result || [];
    
    // Calculate metrics based on real data
    let tps = 0;
    let blockTime = 0;
    let numTxs = 0;
    let numTxsSuccessful = 0;
    
    if (samples.length > 0) {
      samples.forEach((sample: any) => {
        tps += sample.numTransactions / sample.samplePeriodSecs;
        blockTime += sample.samplePeriodSecs * 1000 / sample.numSlots; // Convert to ms
        numTxs += sample.numTransactions;
        numTxsSuccessful += (sample.numTransactions - sample.numFailedTransactions);
      });
      
      // Average values
      tps = Math.round(tps / samples.length);
      blockTime = Math.round(blockTime / samples.length);
    }
    
    // Calculate congestion based on TPS relative to theoretical max (50k TPS)
    // In reality, it's more complex, but this simplified version gives a realistic estimate
    const maxTPS = 4000; // Practical max TPS under ideal conditions
    const congestionPercentage = Math.min(100, Math.round((tps / maxTPS) * 100));
    
    // Determine congestion status
    let congestionStatus: "Low" | "Medium" | "High";
    if (congestionPercentage < 30) {
      congestionStatus = "Low";
    } else if (congestionPercentage < 70) {
      congestionStatus = "Medium";
    } else {
      congestionStatus = "High";
    }
    
    // Calculate confirmation time based on congestion
    const baseConfirmationTime = 0.4; // 400ms baseline
    let avgConfirmationTime: string;
    let confirmationStatus: string;
    
    if (congestionPercentage < 30) {
      avgConfirmationTime = baseConfirmationTime.toFixed(1);
      confirmationStatus = "Faster than usual";
    } else if (congestionPercentage < 60) {
      avgConfirmationTime = (baseConfirmationTime * 1.5).toFixed(1);
      confirmationStatus = "Normal";
    } else if (congestionPercentage < 80) {
      avgConfirmationTime = (baseConfirmationTime * 2.5).toFixed(1);
      confirmationStatus = "Slower than usual";
    } else {
      avgConfirmationTime = (baseConfirmationTime * 4).toFixed(1);
      confirmationStatus = "Very slow";
    }
    
    // Calculate recommended priority fee based on congestion
    let recommendedPriorityFee: string;
    let priorityFeeStatus: string;
    
    if (congestionPercentage < 30) {
      recommendedPriorityFee = "0";
      priorityFeeStatus = "No priority fee needed";
    } else if (congestionPercentage < 60) {
      recommendedPriorityFee = "0.00005";
      priorityFeeStatus = "Low priority fee recommended";
    } else if (congestionPercentage < 80) {
      recommendedPriorityFee = "0.0001";
      priorityFeeStatus = "Medium priority fee recommended";
    } else {
      recommendedPriorityFee = "0.0002";
      priorityFeeStatus = "High priority fee recommended";
    }
    
    // Calculate failed transaction percentage
    const failedTxPercentage = numTxs > 0 ? parseFloat(((numTxs - numTxsSuccessful) / numTxs * 100).toFixed(1)) : 0;
    
    // Historical average comparisons (simple static values for demonstration)
    const avgTPS = 1500;
    const avgBlockTime = 400;
    const avgFailedTxPercentage = 0.5;
    const avgValidatorCount = 1950;
    
    const tpsChange = avgTPS > 0 ? parseFloat(((tps - avgTPS) / avgTPS * 100).toFixed(1)) : 0;
    const blockTimeChange = avgBlockTime > 0 ? parseFloat(((blockTime - avgBlockTime) / avgBlockTime * 100).toFixed(1)) : 0;
    const failedTxChange = avgFailedTxPercentage > 0 ? parseFloat(((failedTxPercentage - avgFailedTxPercentage) / avgFailedTxPercentage * 100).toFixed(1)) : 0;
    const validatorCountChange = avgValidatorCount > 0 ? parseFloat(((validators.length - avgValidatorCount) / avgValidatorCount * 100).toFixed(1)) : 0;
    
    // Format slot with commas
    const formattedSlot = Number(currentSlot).toLocaleString();
    
    // Return the full network stats
    return {
      congestionPercentage,
      congestionStatus,
      avgConfirmationTime,
      confirmationStatus,
      recommendedPriorityFee,
      priorityFeeStatus,
      blockTime: `${blockTime}ms`,
      tps,
      failedTxPercentage,
      validatorCount: validators.length,
      blockTimeChange,
      tpsChange,
      failedTxChange,
      validatorCountChange,
      currentSlot: formattedSlot
    };
  } catch (error) {
    console.error("Error fetching network status:", error);
    
    // Log the error but don't generate synthetic data
    console.error("Failed to fetch from Solana RPC. Ensure your RPC endpoint is working correctly.");
    
    // Throw the error so it can be handled by the caller
    throw new Error("Could not connect to Solana RPC. Please check your network connection and try again.");
  }
}

/**
 * Get historical data for network congestion using real performance data
 */
export async function getHistoricalData(timeframe: string = "week"): Promise<any> {
  try {
    console.log(`Fetching historical data for timeframe: ${timeframe}`);
    
    // Set number of samples based on timeframe
    let numSamples: number;
    if (timeframe === "24h") {
      numSamples = 24; // Hourly for 24 hours
    } else if (timeframe === "week") {
      numSamples = 7; // Daily for a week
    } else { // month
      numSamples = 4; // Weekly for a month
    }
    
    // Call Solana RPC to get performance samples
    const response = await axios.post(RPC_ENDPOINT, {
      jsonrpc: "2.0",
      id: 1,
      method: "getRecentPerformanceSamples",
      params: [numSamples],
    });
    
    // Extract samples from response
    const samples = response.data?.result || [];
    
    // Process the data based on timeframe
    let processedData: Array<{day: string, congestion: number, tps: number, blockTime: number, fee: number}> = [];
    let labels: string[] = [];
    
    // Different label formats based on timeframe
    if (timeframe === "24h") {
      // Format as hours (show every 3 hours for better readability)
      const date = new Date();
      for (let i = 24; i > 0; i -= 3) {
        date.setHours(date.getHours() - 3);
        labels.push(`${date.getHours()}:00`);
      }
      // Reverse to get chronological order
      labels.reverse();
    } else if (timeframe === "week") {
      // Format as days of week
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    } else { // month
      // Format as weeks of month
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    }
    
    // Transform the samples into chart data format
    if (samples.length > 0) {
      // Calculate TPS for each sample and map to congestion levels
      const maxTPS = 4000; // Practical max TPS
      
      // For each period (hour/day/week), get the appropriate aggregated stats
      let periodCongestion: { [key: string]: number[] } = {};
      let periodTps: { [key: string]: number[] } = {};
      let periodBlockTime: { [key: string]: number[] } = {};
      let periodFees: { [key: string]: number[] } = {};
      
      // Initialize all periods to track data points
      labels.forEach(label => {
        periodCongestion[label] = [];
        periodTps[label] = [];
        periodBlockTime[label] = [];
        periodFees[label] = [];
      });
      
      // Distribute samples across periods
      samples.forEach((sample: any, index: number) => {
        // Calculate metrics for this sample
        const tps = sample.numTransactions / sample.samplePeriodSecs;
        const congestion = Math.min(100, Math.round((tps / maxTPS) * 100));
        const blockTime = sample.samplePeriodSecs * 1000 / sample.numSlots; // in ms
        
        // Calculate priority fee based on congestion
        let fee = 0;
        if (congestion < 30) {
          fee = 0;
        } else if (congestion < 60) {
          fee = 0.00002;
        } else if (congestion < 80) {
          fee = 0.00005;
        } else {
          fee = 0.0001;
        }
        
        // Map to appropriate label based on sample index and timeframe
        let label;
        if (timeframe === "24h") {
          // For 24h view, distribute across hours (we show 8 3-hour slots)
          const hourIndex = Math.floor((index / samples.length) * labels.length);
          label = labels[hourIndex];
        } else if (timeframe === "week") {
          // For week view, distribute across days
          const dayIndex = Math.floor((index / samples.length) * 7);
          label = labels[dayIndex];
        } else {
          // For month view, distribute across weeks
          const weekIndex = Math.floor((index / samples.length) * 4);
          label = labels[weekIndex];
        }
        
        // Add all metrics to appropriate periods
        if (periodCongestion[label]) {
          periodCongestion[label].push(congestion);
          periodTps[label].push(tps);
          periodBlockTime[label].push(blockTime);
          periodFees[label].push(fee);
        }
      });
      
      // Calculate average values for each period
      labels.forEach(label => {
        const congestionValues = periodCongestion[label];
        const tpsValues = periodTps[label];
        const blockTimeValues = periodBlockTime[label];
        const feeValues = periodFees[label];
        
        const avgCongestion = congestionValues.length > 0 ?
          Math.round(congestionValues.reduce((a, b) => a + b, 0) / congestionValues.length) : 0;
        const avgTps = tpsValues.length > 0 ?
          Math.round(tpsValues.reduce((a, b) => a + b, 0) / tpsValues.length) : 0;
        const avgBlockTime = blockTimeValues.length > 0 ?
          Math.round(blockTimeValues.reduce((a, b) => a + b, 0) / blockTimeValues.length) : 0;
        const avgFee = feeValues.length > 0 ?
          parseFloat((feeValues.reduce((a, b) => a + b, 0) / feeValues.length).toFixed(6)) : 0;
        
        processedData.push({
          day: label,
          congestion: avgCongestion,
          tps: avgTps,
          blockTime: avgBlockTime,
          fee: avgFee
        });
      });
    } else {
      // No data available - create empty dataset with labels and zero values
      processedData = labels.map(label => ({
        day: label,
        congestion: 0,
        tps: 0,
        blockTime: 0,
        fee: 0
      }));
    }
    
    // Calculate stats
    let congestionValues = processedData.map(item => item.congestion);
    const avgCongestion = congestionValues.length > 0 ? 
      parseFloat((congestionValues.reduce((a, b) => a + b, 0) / congestionValues.length).toFixed(1)) : 0;
    const peakCongestion = congestionValues.length > 0 ? Math.max(...congestionValues) : 0;
    const lowCongestion = congestionValues.length > 0 ? Math.min(...congestionValues) : 0;
    
    return {
      timeframe,
      data: processedData,
      avgCongestion,
      peakCongestion,
      lowCongestion
    };
  } catch (error) {
    console.error("Error fetching historical data:", error);
    
    // Log error and throw it to be handled by the caller
    console.error("Failed to fetch historical data from Solana RPC.");
    throw new Error("Could not connect to Solana RPC. Please check your network connection and try again.");
  }
}

/**
 * Calculate priority fee recommendation based on inputs
 */
export async function getPriorityFeeRecommendation(
  transactionType: string,
  priority: string,
  customPriorityFee?: string
): Promise<{
  baseFee: string;
  priorityFee: string;
  totalFee: string;
  estimatedTime: string;
}> {
  try {
    // Get current network status to determine congestion
    const { congestionPercentage } = await getNetworkStatus();
    
    // Base fee is always the same on Solana
    const baseFee = "0.000005";
    
    // Calculate recommended priority fee based on congestion and priority level
    let priorityFee: string;
    let confirmationTime: number;
    
    // If user provided a custom priority fee, use that
    if (customPriorityFee && parseFloat(customPriorityFee) > 0) {
      priorityFee = customPriorityFee;
    } else {
      // Calculate based on congestion and priority preference
      if (congestionPercentage < 30) {
        // Low congestion
        priorityFee = priority === "standard" ? "0" :
                      priority === "fast" ? "0.00001" : "0.00003";
      } else if (congestionPercentage < 60) {
        // Medium congestion
        priorityFee = priority === "standard" ? "0.00002" :
                      priority === "fast" ? "0.00005" : "0.0001";
      } else if (congestionPercentage < 80) {
        // High congestion
        priorityFee = priority === "standard" ? "0.00005" :
                      priority === "fast" ? "0.0001" : "0.0002";
      } else {
        // Very high congestion
        priorityFee = priority === "standard" ? "0.0001" :
                      priority === "fast" ? "0.0002" : "0.0004";
      }
    }
    
    // Calculate the total fee
    const totalFee = (parseFloat(baseFee) + parseFloat(priorityFee)).toFixed(6);
    
    // Estimate confirmation time based on congestion and priority fee
    if (congestionPercentage < 30) {
      confirmationTime = 0.3;
    } else if (congestionPercentage < 60) {
      confirmationTime = parseFloat(priorityFee) >= 0.00005 ? 0.5 : 0.8;
    } else if (congestionPercentage < 80) {
      confirmationTime = parseFloat(priorityFee) >= 0.0001 ? 0.8 : 1.5;
    } else {
      confirmationTime = parseFloat(priorityFee) >= 0.0002 ? 1.2 : 2.5;
    }
    
    // Format the estimated time
    const estimatedTime = `~${confirmationTime.toFixed(1)}s`;
    
    return {
      baseFee,
      priorityFee,
      totalFee,
      estimatedTime
    };
  } catch (error) {
    console.error("Error calculating priority fee recommendation:", error);
    throw error;
  }
}
