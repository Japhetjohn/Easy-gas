import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Activity, BarChart3, Bell, Cog, LayoutDashboard, Wallet } from "lucide-react";
import { useNetworkStats } from "@/hooks/useNetworkStats";

interface SidebarProps {
  isOpen: boolean;
  currentPath: string;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, currentPath, onClose }: SidebarProps) {
  const { data: networkStats } = useNetworkStats();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: "/historical", label: "Historical Data", icon: <BarChart3 className="h-5 w-5" /> },
    { path: "/transactions", label: "My Transactions", icon: <Wallet className="h-5 w-5" /> },
    { path: "/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
    { path: "/settings", label: "Settings", icon: <Cog className="h-5 w-5" /> },
  ];

  return (
    <aside 
      className={cn(
        "bg-neutral-900 border-r border-neutral-800 overflow-y-auto",
        isOpen ? "block w-full fixed inset-0 z-20 pt-16" : "hidden",
        "lg:block lg:static lg:w-64 lg:z-0"
      )}
    >
      <div className="py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => {
                if (onClose && window.innerWidth < 1024) { // Only close on mobile
                  onClose();
                }
              }}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg group",
                currentPath === item.path
                  ? "text-white bg-gradient-to-r from-primary/20 to-secondary/20"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              )}
            >
              <span 
                className={cn(
                  "mr-3",
                  currentPath === item.path
                    ? "text-primary"
                    : "text-neutral-400 group-hover:text-primary"
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Network Status */}
      <div className="px-4 py-6 border-t border-neutral-800">
        <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
          Network Status
        </h3>
        <div className="flex items-center space-x-2">
          <span className="relative inline-flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </span>
          <span className="text-sm text-white font-medium">Solana Mainnet</span>
        </div>
        <div className="mt-3 text-xs text-neutral-400">
          <div className="flex justify-between mb-1">
            <span>Block Time</span>
            <span className="text-white">{networkStats?.blockTime || "400ms"}</span>
          </div>
          <div className="flex justify-between">
            <span>Current Slot</span>
            <span className="text-white">{networkStats?.currentSlot || "189,345,223"}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
