// Solana RPC endpoint
// Use default Solana RPC endpoint if environment variable not available
export const RPC_ENDPOINT = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// Network status refetch interval (in ms)
export const REFETCH_INTERVAL = 30000; // 30 seconds

// Transaction types
export const TRANSACTION_TYPES = [
  { label: "Token Transfer", value: "token-transfer" },
  { label: "NFT Purchase", value: "nft-purchase" },
  { label: "Swap", value: "swap" },
  { label: "Smart Contract Interaction", value: "smart-contract" },
];

// Transaction priorities
export const TRANSACTION_PRIORITIES = [
  { label: "Standard", value: "standard", multiplier: 1 },
  { label: "Fast", value: "fast", multiplier: 2 },
  { label: "Urgent", value: "urgent", multiplier: 4 },
];

// Congestion thresholds
export const CONGESTION_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 70,
};

// Base fee in SOL
export const BASE_FEE = 0.000005;

// Congestion colors
export const CONGESTION_COLORS = {
  LOW: {
    fill: "from-success to-success/70",
    text: "text-success",
    background: "bg-success/20",
  },
  MEDIUM: {
    fill: "from-warning to-warning/70",
    text: "text-warning",
    background: "bg-warning/20",
  },
  HIGH: {
    fill: "from-danger to-danger/70",
    text: "text-danger",
    background: "bg-danger/20",
  },
};
