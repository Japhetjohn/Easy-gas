import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Loader2 } from "lucide-react";

interface HistoricalChartProps {
  timeframe?: "24h" | "week" | "month";
}

export default function HistoricalChart({ timeframe = "week" }: HistoricalChartProps) {
  // Use time-based query key that includes the timeframe parameter
  const { data: historicalData, isLoading, isError } = useQuery({
    queryKey: ["/api/historical-data", timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/historical-data?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }
      return response.json();
    },
  });

  // Use data from the API response
  const data = historicalData?.data || [];
  
  // Metric selection state
  const [metric, setMetric] = useState<'congestion' | 'tps' | 'blockTime' | 'fee'>('congestion');
  
  // Formatting functions for different metrics
  const formatValue = (value: number, metricType: string) => {
    switch(metricType) {
      case 'congestion':
        return `${value}%`;
      case 'tps':
        return `${value} TPS`;
      case 'blockTime':
        return `${value}ms`;
      case 'fee':
        return `${value === 0 ? '0' : value.toFixed(6)} SOL`;
      default:
        return value.toString();
    }
  };
  
  // Color schemes for different metrics
  const colorSchemes = {
    congestion: {
      gradient: 'colorCongestion',
      stroke: '#14B8A6',
      gradientColors: ['#14B8A6', '#14B8A6']
    },
    tps: {
      gradient: 'colorTps',
      stroke: '#3B82F6',
      gradientColors: ['#3B82F6', '#3B82F6']
    },
    blockTime: {
      gradient: 'colorBlockTime',
      stroke: '#A855F7',
      gradientColors: ['#A855F7', '#A855F7']
    },
    fee: {
      gradient: 'colorFee',
      stroke: '#F59E0B',
      gradientColors: ['#F59E0B', '#F59E0B']
    }
  };
  
  // Metrics labels
  const metricLabels = {
    congestion: 'Network Congestion',
    tps: 'Transactions Per Second',
    blockTime: 'Block Time',
    fee: 'Priority Fee'
  };
  
  // Unit formatter based on metric
  const getYAxisUnit = () => {
    switch(metric) {
      case 'congestion': return '%';
      case 'tps': return '';
      case 'blockTime': return 'ms';
      case 'fee': return 'SOL';
      default: return '';
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardContent className="p-5">
        {/* Metric selection tabs */}
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={() => setMetric('congestion')} 
            className={`py-1 px-3 rounded-lg text-xs transition ${metric === 'congestion' ? 'bg-teal-500/20 border border-teal-500/50 text-teal-400' : 'bg-neutral-800 hover:bg-neutral-700'}`}
          >
            Congestion
          </button>
          <button 
            onClick={() => setMetric('tps')} 
            className={`py-1 px-3 rounded-lg text-xs transition ${metric === 'tps' ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' : 'bg-neutral-800 hover:bg-neutral-700'}`}
          >
            TPS
          </button>
          <button 
            onClick={() => setMetric('blockTime')} 
            className={`py-1 px-3 rounded-lg text-xs transition ${metric === 'blockTime' ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400' : 'bg-neutral-800 hover:bg-neutral-700'}`}
          >
            Block Time
          </button>
          <button 
            onClick={() => setMetric('fee')} 
            className={`py-1 px-3 rounded-lg text-xs transition ${metric === 'fee' ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400' : 'bg-neutral-800 hover:bg-neutral-700'}`}
          >
            Priority Fee
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-red-400 font-medium mb-1">Connection Error</div>
            <div className="text-neutral-400 text-sm max-w-xs text-center">
              Could not connect to the Solana network. Please check your network connection and try again later.
            </div>
          </div>
        ) : (
          <div className="h-64">
            {data.length === 0 || data.every((item: any) => item[metric as keyof typeof item] === 0) ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-gray-400 mb-2">No data available</div>
                <div className="text-sm text-gray-500">Unable to load {metricLabels[metric as keyof typeof metricLabels]} data</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    {Object.entries(colorSchemes).map(([key, scheme]) => (
                      <linearGradient key={key} id={scheme.gradient} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={scheme.gradientColors[0]} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={scheme.gradientColors[1]} stopOpacity={0.1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(75, 85, 99, 0.1)" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: '#9CA3AF' }}
                    axisLine={{ stroke: 'rgba(75, 85, 99, 0.1)' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9CA3AF' }}
                    axisLine={{ stroke: 'rgba(75, 85, 99, 0.1)' }}
                    tickFormatter={(value) => metric === 'fee' ? value.toFixed(6) : `${value}${getYAxisUnit()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                      borderRadius: '6px',
                      color: '#F3F4F6',
                    }}
                    formatter={(value: any) => [formatValue(Number(value), metric), metricLabels[metric as keyof typeof metricLabels]]}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke={colorSchemes[metric as keyof typeof colorSchemes].stroke}
                    fillOpacity={1}
                    fill={`url(#${colorSchemes[metric as keyof typeof colorSchemes].gradient})`}
                    animationDuration={500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
