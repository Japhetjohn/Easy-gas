import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertOctagon, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import WalletConnectButton from "@/components/WalletConnectButton";
import { useWalletContext } from "@/contexts/WalletContext";

export default function TransactionOptimizer() {
  const { toast } = useToast();
  const { connected, connecting, walletAddress, connectWallet } = useWalletContext();
  const [transactionType, setTransactionType] = useState("token-transfer");
  const [priority, setPriority] = useState("fast");
  const [priorityFee, setPriorityFee] = useState("0.000");
  const [optimizationResult, setOptimizationResult] = useState<{
    baseFee: string;
    priorityFee: string;
    totalFee: string;
    estimatedTime: string;
  } | null>(null);

  const calculateMutation = useMutation({
    mutationFn: async (data: {
      transactionType: string;
      priority: string;
      priorityFee: string;
    }) => {
      const response = await apiRequest("POST", "/api/priority-fee-recommendation", data);
      return response.json();
    },
    onSuccess: (data) => {
      setOptimizationResult(data);
    },
    onError: (error) => {
      toast({
        title: "Error calculating fee",
        description: error.message || "There was an error calculating the optimal fee.",
        variant: "destructive",
      });
      
      // Set default values for demonstration
      setOptimizationResult({
        baseFee: "0.000005",
        priorityFee: "0.00005",
        totalFee: "0.000055",
        estimatedTime: "~0.3s",
      });
    },
  });

  const handleCalculate = () => {
    calculateMutation.mutate({
      transactionType,
      priority,
      priorityFee,
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold font-heading mb-4">Transaction Optimizer</h2>
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Optimize Your Transaction</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="transaction-type" className="text-sm font-medium text-neutral-300 mb-2">
                    Transaction Type
                  </Label>
                  <Select 
                    value={transactionType} 
                    onValueChange={setTransactionType}
                  >
                    <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="token-transfer">Token Transfer</SelectItem>
                      <SelectItem value="nft-purchase">NFT Purchase</SelectItem>
                      <SelectItem value="swap">Swap</SelectItem>
                      <SelectItem value="smart-contract">Smart Contract Interaction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-neutral-300 mb-2">
                    Transaction Priority
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      className={cn(
                        "py-2 rounded-lg text-sm border transition-all duration-300", 
                        priority === "standard" 
                          ? "bg-primary/20 border-primary" 
                          : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 hover:shadow-md"
                      )}
                      onClick={() => setPriority("standard")}
                    >
                      Standard
                    </button>
                    <button 
                      className={cn(
                        "py-2 rounded-lg text-sm border transition-all duration-300", 
                        priority === "fast" 
                          ? "bg-primary/20 border-primary" 
                          : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 hover:shadow-md"
                      )}
                      onClick={() => setPriority("fast")}
                    >
                      Fast
                    </button>
                    <button 
                      className={cn(
                        "py-2 rounded-lg text-sm border transition-all duration-300", 
                        priority === "urgent" 
                          ? "bg-primary/20 border-primary" 
                          : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 hover:shadow-md"
                      )}
                      onClick={() => setPriority("urgent")}
                    >
                      Urgent
                    </button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="priority-fee" className="block text-sm font-medium text-neutral-300 mb-2">
                    Priority Fee (Optional)
                  </Label>
                  <div className="relative rounded-md">
                    <Input
                      id="priority-fee"
                      type="text"
                      value={priorityFee}
                      onChange={(e) => setPriorityFee(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white pr-12 transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary/30"
                      placeholder="0.000"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-neutral-500 sm:text-sm">SOL</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                className="w-full mt-6 bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] hover:opacity-90 text-white transition-colors"
                onClick={handleCalculate}
                disabled={calculateMutation.isPending}
              >
                {calculateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Calculate Optimal Fee"
                )}
              </Button>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-neutral-800 pt-6 md:pt-0 md:pl-6">
              <h3 className="text-lg font-medium mb-4">Results</h3>
              <div className="space-y-4">
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Base Fee</span>
                    <span>{optimizationResult?.baseFee || "0.000005"} SOL</span>
                  </div>
                </div>
                
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Priority Fee</span>
                    <span>{optimizationResult?.priorityFee || "0.00005"} SOL</span>
                  </div>
                </div>
                
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Total Fee</span>
                    <span className="font-bold">{optimizationResult?.totalFee || "0.000055"} SOL</span>
                  </div>
                </div>
                
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Estimated Processing Time</span>
                    <span className="font-bold text-success">{optimizationResult?.estimatedTime || "~0.3s"}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                {!connected ? (
                  <WalletConnectButton />
                ) : (
                  <Button 
                    className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all duration-300 hover:shadow-md"
                    disabled={!optimizationResult}
                  >
                    Send Transaction
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
