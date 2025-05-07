import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Wallet, Key } from "lucide-react";
import { FaGhost } from "react-icons/fa";
import { SiSolana } from "react-icons/si";
import { useSolanaConnection } from "@/hooks/useSolanaConnection";
import { useWalletContext } from "@/contexts/WalletContext";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: (wallet: string) => void;
}

export default function WalletModal({ open, onClose, onConnect }: WalletModalProps) {
  const [connecting, setConnecting] = useState(false);
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  const { error: connectionError } = useSolanaConnection();
  
  const handleConnectWallet = async (walletName: string) => {
    setConnecting(true);
    setActiveWallet(walletName);
    
    try {
      onConnect(walletName);
      // Modal will be closed by the parent component once connection is successful
      setTimeout(() => {
        setConnecting(false);
        setActiveWallet(null);
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setConnecting(false);
      setActiveWallet(null);
    }
  };
  
  // Check if wallets are available in the browser
  const isPhantomAvailable = typeof window !== 'undefined' && 
    typeof window.solana !== 'undefined' && 
    window.solana.isPhantom;
    
  const isSolflareAvailable = typeof window !== 'undefined' && 
    typeof window.solflare !== 'undefined';

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Select a wallet to connect to EasyGas
          </DialogDescription>
        </DialogHeader>
        
        {connectionError ? (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 my-3">
            <div className="flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-red-400 font-medium text-sm mb-1">Blockchain Connection Error</h4>
                <p className="text-xs text-red-200/80 mb-2">
                  Cannot connect to the Solana network. Please check your internet connection and try again.
                </p>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="mt-1"
                  onClick={() => window.location.reload()}
                >
                  Retry Connection
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 py-4">
            {/* Phantom Wallet - if available */}
            {isPhantomAvailable && (
              <Button
                variant="outline"
                className="flex items-center justify-between p-4 h-auto border-primary bg-primary/10 hover:bg-primary/20"
                onClick={() => handleConnectWallet('phantom')}
                disabled={connecting}
              >
                <div className="flex items-center gap-2">
                  <FaGhost className="h-5 w-5 text-[#AB9FF2]" />
                  <span>Phantom Wallet</span>
                  {isPhantomAvailable && <span className="text-xs bg-[#AB9FF2]/30 py-0.5 px-2 rounded-full">Popular</span>}
                </div>
                {connecting && activeWallet === 'phantom' ? (
                  <span className="text-xs bg-primary/20 py-1 px-2 rounded-md flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting
                  </span>
                ) : null}
              </Button>
            )}
            
            {/* Solflare Wallet - if available */}
            {isSolflareAvailable && (
              <Button
                variant="outline"
                className="flex items-center justify-between p-4 h-auto border-primary bg-primary/10 hover:bg-primary/20"
                onClick={() => handleConnectWallet('solflare')}
                disabled={connecting}
              >
                <div className="flex items-center gap-2">
                  <SiSolana className="h-5 w-5 text-[#F99D28]" />
                  <span>Solflare Wallet</span>
                </div>
                {connecting && activeWallet === 'solflare' ? (
                  <span className="text-xs bg-primary/20 py-1 px-2 rounded-md flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting
                  </span>
                ) : null}
              </Button>
            )}
            

            
            <div className="border-t border-neutral-800 pt-4 mt-2 space-y-3">
              <div className="bg-primary-950/30 border border-primary-700/30 rounded-md p-3">
                <p className="text-xs text-primary-200/80">
                  <span className="font-semibold block mb-1">Connect with your preferred wallet</span>
                  Connect using your existing Phantom or Solflare browser extension to access EasyGas features for optimizing your Solana transactions.
                </p>
              </div>
              
              {!isPhantomAvailable && !isSolflareAvailable && (
                <p className="text-xs text-neutral-500 text-center mt-3">
                  No wallet extensions detected. Install <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Phantom</a> or <a href="https://solflare.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Solflare</a> for better wallet integration.
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}