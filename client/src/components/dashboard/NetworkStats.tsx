import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, Minus, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NetworkStatsProps {
  stats?: {
    blockTime: string;
    tps: number;
    failedTxPercentage: number;
    validatorCount: number;
    blockTimeChange: number;
    tpsChange: number;
    failedTxChange: number;
    validatorCountChange: number;
    currentSlot?: string;
  } | null;
  isLoading: boolean;
  isRealTime?: boolean;
}

export default function NetworkStats({ stats, isLoading, isRealTime }: NetworkStatsProps) {
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-heading">Network Metrics</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-neutral-900 border-neutral-800 p-5">
              <Skeleton className="h-4 w-32 bg-neutral-800 mb-2" />
              <Skeleton className="h-8 w-16 bg-neutral-800 mb-2" />
              <Skeleton className="h-4 w-24 bg-neutral-800" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If data isn't available, show an error state instead of default stats
  if (!stats) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-heading">Network Metrics</h2>
        </div>
        <Card className="bg-neutral-900 border-neutral-800 p-6 text-center">
          <div className="flex flex-col items-center justify-center py-6">
            <Wifi className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">Connection Error</h3>
            <p className="text-neutral-400 max-w-md">
              Unable to retrieve network metrics from Solana. Please check your connection or try again later.
            </p>
          </div>
        </Card>
      </div>
    );
  }
  
  const data = stats;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold font-heading">Network Metrics</h2>
        {isRealTime && (
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50 flex items-center gap-1 px-3 py-1">
            <Wifi className="h-3 w-3 live-indicator" />
            <span className="text-xs font-medium">Live Updates</span>
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <div className="p-5">
            <h3 className="text-sm font-medium text-neutral-400 mb-2">Average Block Time</h3>
            <p className="text-2xl font-bold">{data.blockTime}</p>
            <div className={`flex items-center mt-2 ${data.blockTimeChange < 0 ? 'text-success' : data.blockTimeChange > 0 ? 'text-danger' : 'text-neutral-400'} text-sm`}>
              {data.blockTimeChange < 0 ? (
                <ArrowDown className="h-4 w-4 mr-1" />
              ) : data.blockTimeChange > 0 ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <Minus className="h-4 w-4 mr-1" />
              )}
              <span>{Math.abs(data.blockTimeChange)}% from avg</span>
            </div>
          </div>
        </Card>
        
        <Card className="bg-neutral-900 border-neutral-800">
          <div className="p-5">
            <h3 className="text-sm font-medium text-neutral-400 mb-2">TPS</h3>
            <p className="text-2xl font-bold">{data.tps.toLocaleString()}</p>
            <div className={`flex items-center mt-2 ${data.tpsChange > 0 ? 'text-success' : data.tpsChange < 0 ? 'text-danger' : 'text-neutral-400'} text-sm`}>
              {data.tpsChange > 0 ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : data.tpsChange < 0 ? (
                <ArrowDown className="h-4 w-4 mr-1" />
              ) : (
                <Minus className="h-4 w-4 mr-1" />
              )}
              <span>{Math.abs(data.tpsChange)}% from avg</span>
            </div>
          </div>
        </Card>
        
        <Card className="bg-neutral-900 border-neutral-800">
          <div className="p-5">
            <h3 className="text-sm font-medium text-neutral-400 mb-2">Failed Transactions</h3>
            <p className="text-2xl font-bold">{data.failedTxPercentage}%</p>
            <div className={`flex items-center mt-2 ${data.failedTxChange < 0 ? 'text-success' : data.failedTxChange > 0 ? 'text-danger' : 'text-neutral-400'} text-sm`}>
              {data.failedTxChange < 0 ? (
                <ArrowDown className="h-4 w-4 mr-1" />
              ) : data.failedTxChange > 0 ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <Minus className="h-4 w-4 mr-1" />
              )}
              <span>{Math.abs(data.failedTxChange)}% from avg</span>
            </div>
          </div>
        </Card>
        
        <Card className="bg-neutral-900 border-neutral-800">
          <div className="p-5">
            <h3 className="text-sm font-medium text-neutral-400 mb-2">Validator Count</h3>
            <p className="text-2xl font-bold">{data.validatorCount.toLocaleString()}</p>
            <div className={`flex items-center mt-2 ${data.validatorCountChange !== 0 ? (data.validatorCountChange > 0 ? 'text-success' : 'text-danger') : 'text-neutral-400'} text-sm`}>
              {data.validatorCountChange > 0 ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : data.validatorCountChange < 0 ? (
                <ArrowDown className="h-4 w-4 mr-1" />
              ) : (
                <Minus className="h-4 w-4 mr-1" />
              )}
              <span>{data.validatorCountChange === 0 ? "No change" : `${Math.abs(data.validatorCountChange)}% change`}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
