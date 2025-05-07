import { Connection, PublicKey, VersionedTransaction, TransactionMessage } from "@solana/web3.js";

/**
 * Get the current Solana network congestion level
 * @param connection - Solana connection
 * @returns Congestion percentage (0-100)
 */
export async function getNetworkCongestion(connection: Connection): Promise<number> {
  try {
    // Get recent performance samples
    const samples = await connection.getRecentPerformanceSamples(10);
    
    if (samples.length === 0) {
      return 0;
    }
    
    // Calculate average TPS
    const avgTps = samples.reduce((sum, sample) => sum + sample.numTransactions / sample.samplePeriodSecs, 0) / samples.length;
    
    // Solana's theoretical max TPS is around 50,000 but practical limits are lower
    // Using 20,000 as a reference max for congestion calculation
    const maxTps = 20000;
    
    // Calculate congestion as percentage of theoretical max
    const congestion = Math.min(100, Math.round((avgTps / maxTps) * 100));
    
    return congestion;
  } catch (error) {
    console.error("Error getting network congestion:", error);
    return 0;
  }
}

/**
 * Calculate the recommended priority fee based on congestion
 * @param congestionPercentage - Current network congestion (0-100)
 * @returns Recommended priority fee in SOL
 */
export function calculatePriorityFee(congestionPercentage: number): string {
  // No fee needed for low congestion
  if (congestionPercentage < 30) {
    return "0";
  }
  
  // Moderate fee for medium congestion
  if (congestionPercentage < 60) {
    return "0.00005";
  }
  
  // Higher fee for high congestion
  if (congestionPercentage < 80) {
    return "0.0001";
  }
  
  // Maximum fee for extreme congestion
  return "0.0002";
}

/**
 * Get the congestion status label based on percentage
 * @param congestionPercentage - Current network congestion (0-100)
 * @returns Congestion status label
 */
export function getCongestionStatus(congestionPercentage: number): "Low" | "Medium" | "High" {
  if (congestionPercentage < 30) return "Low";
  if (congestionPercentage < 70) return "Medium";
  return "High";
}

/**
 * Estimate transaction confirmation time based on congestion
 * @param congestionPercentage - Current network congestion (0-100)
 * @returns Estimated confirmation time in seconds
 */
export function estimateConfirmationTime(congestionPercentage: number): string {
  // Solana's base confirmation time is around 400ms
  const baseTime = 0.4;
  
  // Increase time based on congestion
  if (congestionPercentage < 30) {
    return baseTime.toFixed(1);
  }
  
  if (congestionPercentage < 60) {
    return (baseTime * 1.5).toFixed(1);
  }
  
  if (congestionPercentage < 80) {
    return (baseTime * 2.5).toFixed(1);
  }
  
  return (baseTime * 4).toFixed(1);
}

/**
 * Get the confirmation time status label
 * @param congestionPercentage - Current network congestion (0-100)
 * @returns Status label for confirmation time
 */
export function getConfirmationTimeStatus(congestionPercentage: number): string {
  if (congestionPercentage < 30) return "Faster than usual";
  if (congestionPercentage < 60) return "Normal";
  if (congestionPercentage < 80) return "Slower than usual";
  return "Very slow";
}

/**
 * Get the priority fee status label
 * @param congestionPercentage - Current network congestion (0-100)
 * @returns Status label for priority fee
 */
export function getPriorityFeeStatus(congestionPercentage: number): string {
  if (congestionPercentage < 30) return "No priority fee needed";
  if (congestionPercentage < 60) return "Low priority fee recommended";
  if (congestionPercentage < 80) return "Medium priority fee recommended";
  return "High priority fee recommended";
}

/**
 * Create a dummy transaction for demonstration purposes
 * @param connection - Solana connection
 * @param feePayer - Public key of the fee payer
 * @param priorityFee - Priority fee in SOL
 * @returns VersionedTransaction that can be signed and sent
 */
export async function createDummyTransaction(
  connection: Connection,
  feePayer: PublicKey,
  priorityFee: number = 0
): Promise<VersionedTransaction> {
  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  
  // Create a simple instruction that will do nothing (transfer 0 SOL to self)
  const instructions = [
    {
      programId: new PublicKey("11111111111111111111111111111111"),
      keys: [
        { pubkey: feePayer, isSigner: true, isWritable: true },
        { pubkey: feePayer, isSigner: false, isWritable: true },
      ],
      data: Buffer.from([2, 0, 0, 0, 0, 0, 0, 0, 0]),
    },
  ];
  
  // Create a transaction message
  const messageV0 = new TransactionMessage({
    payerKey: feePayer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  
  // Create a versioned transaction
  return new VersionedTransaction(messageV0);
}
