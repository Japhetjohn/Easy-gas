import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HistoricalChart from "@/components/dashboard/HistoricalChart";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TimeframeType = "24h" | "week" | "month";

export default function HistoricalData() {
  const [timeframe, setTimeframe] = useState<TimeframeType>("week");
  
  const { data: historicalData, isLoading, refetch } = useQuery({
    queryKey: ["/api/historical-data", timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/historical-data?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }
      return response.json();
    },
  });
  
  // Refetch data when timeframe changes
  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    setTimeframe(newTimeframe);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-6">Historical Network Data</h1>
      
      <Tabs defaultValue="congestion">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="congestion">Congestion</TabsTrigger>
          <TabsTrigger value="fees">Priority Fees</TabsTrigger>
          <TabsTrigger value="tps">TPS</TabsTrigger>
          <TabsTrigger value="blocktime">Block Time</TabsTrigger>
        </TabsList>
        
        <TabsContent value="congestion">
          <Card className="bg-neutral-900 border-neutral-800 mb-6">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Congestion Levels</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleTimeframeChange("24h")} 
                    className={cn(
                      "py-1 px-3 rounded-lg text-sm transition",
                      timeframe === "24h" 
                        ? "bg-primary/20 border border-primary/50" 
                        : "bg-neutral-800 hover:bg-neutral-700"
                    )}
                  >
                    24h
                  </button>
                  <button 
                    onClick={() => handleTimeframeChange("week")} 
                    className={cn(
                      "py-1 px-3 rounded-lg text-sm transition",
                      timeframe === "week" 
                        ? "bg-primary/20 border border-primary/50" 
                        : "bg-neutral-800 hover:bg-neutral-700"
                    )}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => handleTimeframeChange("month")} 
                    className={cn(
                      "py-1 px-3 rounded-lg text-sm transition",
                      timeframe === "month" 
                        ? "bg-primary/20 border border-primary/50" 
                        : "bg-neutral-800 hover:bg-neutral-700"
                    )}
                  >
                    Month
                  </button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <HistoricalChart timeframe={timeframe} />
              )}
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-neutral-400 mb-1">Avg. Congestion</p>
                  <p className="text-xl font-bold">{historicalData?.avgCongestion || "0"}%</p>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-neutral-400 mb-1">Peak Congestion</p>
                  <p className="text-xl font-bold">{historicalData?.peakCongestion || "0"}%</p>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-sm text-neutral-400 mb-1">Low Congestion</p>
                  <p className="text-xl font-bold">{historicalData?.lowCongestion || "0"}%</p>
                </div>
              </div>
              
              {historicalData?.apiError && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-md text-sm">
                  <p>{historicalData.apiError}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-5">
              <h2 className="text-lg font-medium mb-4">Congestion Patterns</h2>
              <div className="space-y-4">
                <div className="bg-neutral-800 rounded-lg p-4">
                  <h3 className="text-md font-medium mb-2">Peak Congestion Times</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-neutral-400">Day</p>
                      <p className="font-bold">Wednesday</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Time</p>
                      <p className="font-bold">16:00-18:00 UTC</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Level</p>
                      <p className="font-bold">{historicalData?.peakCongestion || "45"}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-neutral-800 rounded-lg p-4">
                  <h3 className="text-md font-medium mb-2">Low Congestion Times</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-neutral-400">Day</p>
                      <p className="font-bold">Sunday</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Time</p>
                      <p className="font-bold">02:00-06:00 UTC</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Level</p>
                      <p className="font-bold">{historicalData?.lowCongestion || "15"}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fees">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-5">
              <h2 className="text-lg font-medium mb-6">Priority Fees Overview</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-neutral-400 mb-4">Historical data for priority fees will be displayed here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tps">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-5">
              <h2 className="text-lg font-medium mb-6">Transactions Per Second (TPS)</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-neutral-400 mb-4">Historical TPS data will be displayed here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="blocktime">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-5">
              <h2 className="text-lg font-medium mb-6">Block Time Analysis</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-neutral-400 mb-4">Historical block time data will be displayed here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
