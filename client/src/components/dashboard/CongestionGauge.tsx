import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CongestionGaugeProps {
  congestionLevel: number;
  status: string;
}

export default function CongestionGauge({ congestionLevel, status }: CongestionGaugeProps) {
  // Calculate angle for gauge fill
  const fillDegree = Math.min(180, Math.max(0, (congestionLevel / 100) * 180));
  
  // Determine status based colors
  const statusColors = {
    Low: "bg-[hsl(var(--congestion-low))]",
    Medium: "bg-[hsl(var(--congestion-medium))]",
    High: "bg-[hsl(var(--congestion-high))]",
  };
  
  const statusBgColors = {
    Low: "bg-[hsl(var(--congestion-low)/0.2)] text-[hsl(var(--congestion-low))]",
    Medium: "bg-[hsl(var(--congestion-medium)/0.2)] text-[hsl(var(--congestion-medium))]",
    High: "bg-[hsl(var(--congestion-high)/0.2)] text-[hsl(var(--congestion-high))]",
  };
  
  const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.Low;
  const statusBgColor = statusBgColors[status as keyof typeof statusBgColors] || statusBgColors.Low;

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-neutral-300">Current Congestion</h3>
          <span className={cn("px-2 py-1 text-xs font-medium rounded-full", statusBgColor)}>
            {status}
          </span>
        </div>
        
        {/* Gauge visualization for congestion level */}
        <div className="mb-4">
          <div className="flex flex-col items-center">
            <div className="w-32 h-16 overflow-hidden relative">
              <div className="absolute inset-0 rounded-t-full bg-neutral-800"></div>
              {/* This will be controlled by the congestion level */}
              <div 
                className={cn(
                  "absolute inset-0 rounded-t-full bg-gradient-to-r", 
                  status === "Low" ? "from-[hsl(var(--congestion-low))] to-[hsl(var(--congestion-low)/0.7)]" :
                  status === "Medium" ? "from-[hsl(var(--congestion-medium))] to-[hsl(var(--congestion-medium)/0.7)]" :
                  "from-[hsl(var(--congestion-high))] to-[hsl(var(--congestion-high)/0.7)]"
                )}
                style={{ 
                  clipPath: `polygon(0 100%, 100% 100%, 100% ${100 - fillDegree/180*100}%, 0 ${100 - fillDegree/180*100}%)` 
                }}
              ></div>
            </div>
            <div className="w-full flex justify-between px-2 mt-1 text-xs text-neutral-500">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{congestionLevel}%</p>
          <p className="text-sm text-neutral-400">Network Utilization</p>
        </div>
      </CardContent>
    </Card>
  );
}
