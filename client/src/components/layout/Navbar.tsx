import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { Menu, X } from "lucide-react";
// Use absolute path for assets in public folder
const logoPath = "/assets/logo.jpg";
import WalletConnectButton from "@/components/WalletConnectButton";

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export default function Navbar({ onMenuToggle, isSidebarOpen }: NavbarProps) {
  const { connected, connecting, connectWallet, disconnectWallet, walletAddress } = useWallet();

  return (
    <nav className="fixed w-full z-10 backdrop-blur-md bg-black/80 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src={logoPath} alt="EasyGas Logo" />
              <span className="ml-2 text-xl font-bold font-heading">
                Easy
                <span className="bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] text-transparent bg-clip-text">
                  Gas
                </span>
              </span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {connected ? (
              <Button 
                onClick={() => disconnectWallet()}
                className="px-4 py-2 rounded-lg font-medium text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all duration-300 hover:shadow-md hover:border-neutral-600"
              >
                {`${walletAddress?.substring(0, 4)}...${walletAddress?.substring(walletAddress.length - 4)}`}
              </Button>
            ) : (
              <div className="w-[140px]">
                <WalletConnectButton />
              </div>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button 
              onClick={onMenuToggle}
              className="text-neutral-400 hover:text-white"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden bg-neutral-900 border-b border-neutral-800 ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {connected ? (
            <Button 
              onClick={() => disconnectWallet()}
              className="block w-full px-4 py-2 rounded-lg font-medium text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all duration-300 hover:shadow-md hover:border-neutral-600"
            >
              {`${walletAddress?.substring(0, 4)}...${walletAddress?.substring(walletAddress.length - 4)}`}
            </Button>
          ) : (
            <div>
              <WalletConnectButton />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
