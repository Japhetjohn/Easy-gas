import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "@/hooks/useWallet";
import type { Transaction } from "@/hooks/useWallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function MyTransactions() {
  const { 
    connected, 
    connecting, 
    connectWallet, 
    disconnectWallet,
    walletAddress, 
    transactions,
    loadingTransactions
  } = useWallet();

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-6">My Transactions</h1>
      
      {!connected ? (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="bg-neutral-800 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <i className="fas fa-wallet text-2xl text-primary"></i>
              </div>
              <h2 className="text-xl font-medium">Connect Your Wallet</h2>
              <p className="text-neutral-400 max-w-md mx-auto">
                Connect your Solana wallet to view your transaction history and optimize future transactions.
              </p>
              <Button 
                onClick={() => connectWallet()}
                disabled={connecting}
                className="px-6 py-2 mt-4 bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] hover:opacity-90 text-white font-medium rounded-lg"
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-neutral-900 border-neutral-800 mb-6">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-lg font-medium">Wallet Overview</h2>
                  <p className="text-sm text-neutral-400 mt-1">{walletAddress}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button 
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium"
                    onClick={() => disconnectWallet()}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="successful">Successful</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {loadingTransactions || !transactions ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-neutral-900 border-neutral-800">
                      <CardContent className="p-5">
                        <Skeleton className="h-16 w-full bg-neutral-800" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx: Transaction, i: number) => (
                    <Card key={i} className="bg-neutral-900 border-neutral-800">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{tx.type}</p>
                            <p className="text-sm text-neutral-400">{tx.signature.substring(0, 16)}...</p>
                            <p className="text-xs text-neutral-500">{tx.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{tx.amount} SOL</p>
                            <p className={`text-xs ${tx.status === "Success" ? "text-success" : "text-danger"}`}>
                              {tx.status}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-neutral-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No Transactions Found</h3>
                    <p className="text-neutral-400 mt-2">
                      We couldn't find any transaction history for this wallet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="successful">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-8 text-center">
                  <p className="text-neutral-400">Successful transactions will be displayed here</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="failed">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-8 text-center">
                  <p className="text-neutral-400">Failed transactions will be displayed here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
