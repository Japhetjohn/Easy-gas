import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Wallet, LogOut } from "lucide-react";
import { useSolanaConnection } from "@/hooks/useSolanaConnection";
import WalletModal from "./WalletModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWalletContext } from "@/contexts/WalletContext";

export default function WalletConnectButton() {
  // Use the global wallet context instead of direct hook
  const { 
    connectWallet, 
    disconnectWallet, 
    connected, 
    connecting,
    walletAddress,
    walletBalance,
    selectedWallet 
  } = useWalletContext();
  
  // Import Solana connection to check for blockchain connectivity
  const { error: connectionError } = useSolanaConnection();
  
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  
  const handleWalletSelect = (walletName: string) => {
    // Pass the wallet name to the connectWallet function
    connectWallet(walletName);
    setWalletModalOpen(false);
  };
  
  if (connected && walletAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="relative w-full bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] hover:opacity-90 text-white" 
            size={"sm"}
            style={{ minWidth: "135px", height: "32px" }}
          >
            <div className="flex items-center justify-center">
              <Wallet className="mr-2 h-4 w-4" />
              <span>{walletBalance ? `${walletBalance.toFixed(2)} SOL` : "Connected"}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {selectedWallet?.name || "Wallet"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs">
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnectWallet}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  // Don't show network error button to prevent glitching - we'll handle connection issues more gracefully

  return (
    <>
      <Button 
        className="relative w-full bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] hover:opacity-90 text-white hover:shadow-lg overflow-hidden"
        onClick={() => setWalletModalOpen(true)}
        disabled={connecting}
        size={"sm"}
        style={{ minWidth: "135px", height: "32px" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {connecting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Connecting...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Wallet className="mr-2 h-4 w-4" />
              <span>Connect Wallet</span>
            </div>
          )}
        </div>
      </Button>
      
      <WalletModal 
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnect={handleWalletSelect}
      />
    </>
  );
}