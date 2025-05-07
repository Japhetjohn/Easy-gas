import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import HistoricalData from "@/pages/HistoricalData";
import MyTransactions from "@/pages/MyTransactions";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";
import { useLocation } from "wouter";
import { WalletProvider } from "./contexts/WalletContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/historical" component={HistoricalData} />
      <Route path="/transactions" component={MyTransactions} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
        <TooltipProvider>
          {/* Wrap the app with the WalletProvider to share wallet state globally */}
          <WalletProvider>
            <div className="flex h-screen flex-col bg-background text-foreground">
              <Navbar
                onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
              />
              <div className="flex flex-1 overflow-hidden pt-16">
                <Sidebar 
                  isOpen={isSidebarOpen} 
                  currentPath={location} 
                  onClose={() => setIsSidebarOpen(false)} 
                />
                <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
                  <Router />
                </main>
              </div>
              <Toaster />
            </div>
          </WalletProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
