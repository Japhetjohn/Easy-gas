import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import CongestionGauge from "@/components/dashboard/CongestionGauge";
import NetworkStats from "@/components/dashboard/NetworkStats";
import TransactionOptimizer from "@/components/dashboard/TransactionOptimizer";
import HistoricalChart from "@/components/dashboard/HistoricalChart";
import { useNetworkStats } from "@/hooks/useNetworkStats";
import { Loader2, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// Use absolute path for assets in public folder
const bannerPath = "/assets/banner.jpg";

export default function Dashboard() {
  const { data: networkStats, isLoading, wsConnected, isRealTime } = useNetworkStats();
  const [timeframe, setTimeframe] = useState<"24h" | "week" | "month">("week");

  return (
    <>
      {/* Mobile Navigation */}
      <div className="block lg:hidden mb-6">
        <div className="grid grid-cols-3 gap-2">
          <button className="flex flex-col items-center justify-center bg-neutral-900 p-3 rounded-lg">
            <span className="text-primary mb-1 text-lg">
              <i className="fas fa-tachometer-alt"></i>
            </span>
            <span className="text-xs">Dashboard</span>
          </button>
          <button className="flex flex-col items-center justify-center bg-neutral-900 p-3 rounded-lg">
            <span className="text-neutral-500 mb-1 text-lg">
              <i className="fas fa-chart-line"></i>
            </span>
            <span className="text-xs">History</span>
          </button>
          <button className="flex flex-col items-center justify-center bg-neutral-900 p-3 rounded-lg">
            <span className="text-neutral-500 mb-1 text-lg">
              <i className="fas fa-wallet"></i>
            </span>
            <span className="text-xs">Transactions</span>
          </button>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="mb-6 rounded-2xl overflow-hidden border border-neutral-800 relative">
        <img src={bannerPath} alt="EasyGas Banner" className="w-full h-auto object-cover max-h-[180px]" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 bg-gradient-to-r from-black/80 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold font-heading mb-2">Welcome to EasyGas</h1>
              <p className="text-neutral-400 max-w-md">
                Monitor Solana network congestion, optimize transaction fees, and avoid delays with real-time analytics and recommendations.
              </p>
            </div>
            {wsConnected && (
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50 flex items-center gap-1 px-3 py-1">
                <Wifi className="h-3 w-3 live-indicator" />
                <span className="text-xs font-medium">Live</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Network Congestion Overview */}
      <div className="mb-6">
        <h2 className="text-xl font-bold font-heading mb-4">Network Congestion</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Congestion Card */}
            <CongestionGauge 
              congestionLevel={networkStats?.congestionPercentage || 0} 
              status={networkStats?.congestionStatus || "Low"} 
            />

            {/* Estimated Processing Time */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-5">
                <h3 className="text-sm font-medium text-neutral-300 mb-4">Transaction Processing Time</h3>
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white mb-1">
                      ~{networkStats?.avgConfirmationTime || "0.4"}s
                    </p>
                    <p className="text-sm text-neutral-400">Avg. Confirmation Time</p>
                    <div className="mt-3 flex items-center justify-center">
                      <span className="text-xs bg-success/20 text-success py-1 px-2 rounded">
                        {networkStats?.confirmationStatus || "Faster than usual"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Priority Fee Recommendation */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-5">
                <h3 className="text-sm font-medium text-neutral-300 mb-4">Priority Fee Recommendation</h3>
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <p className="text-4xl font-bold bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] bg-clip-text text-transparent mb-1">
                      {networkStats?.recommendedPriorityFee || "0"} SOL
                    </p>
                    <p className="text-sm text-neutral-400">Recommended Priority Fee</p>
                    <div className="mt-3 flex items-center justify-center">
                      <span className="text-xs bg-success/20 text-success py-1 px-2 rounded">
                        {networkStats?.priorityFeeStatus || "No priority fee needed"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Transaction Optimizer */}
      <TransactionOptimizer />

      {/* Historical Congestion */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-heading">Historical Congestion</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setTimeframe("24h")} 
              className={`py-1 px-3 rounded-lg text-sm transition ${timeframe === "24h" ? "bg-primary/20 border border-primary/50" : "bg-neutral-800 hover:bg-neutral-700"}`}
            >
              24h
            </button>
            <button 
              onClick={() => setTimeframe("week")} 
              className={`py-1 px-3 rounded-lg text-sm transition ${timeframe === "week" ? "bg-primary/20 border border-primary/50" : "bg-neutral-800 hover:bg-neutral-700"}`}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeframe("month")} 
              className={`py-1 px-3 rounded-lg text-sm transition ${timeframe === "month" ? "bg-primary/20 border border-primary/50" : "bg-neutral-800 hover:bg-neutral-700"}`}
            >
              Month
            </button>
          </div>
        </div>
        <HistoricalChart timeframe={timeframe} />
      </div>

      {/* Network Metrics */}
      <NetworkStats stats={networkStats} isLoading={isLoading} isRealTime={isRealTime} />
    </>
  );
}
