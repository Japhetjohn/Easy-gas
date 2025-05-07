// Type definitions for Solana wallets

interface ConnectOptions {
  onlyIfTrusted?: boolean;
}

interface SolanaProvider {
  publicKey?: { toString(): string };
  isPhantom?: boolean;
  isConnected?: boolean;
  connect(options?: ConnectOptions): Promise<void>;
  disconnect(): Promise<void>;
}

interface SolflareProvider {
  publicKey?: { toString(): string };
  isConnected?: boolean;
  connect(options?: ConnectOptions): Promise<void>;
  disconnect(): Promise<void>;
}

interface Window {
  solana?: SolanaProvider;
  solflare?: SolflareProvider;
}
