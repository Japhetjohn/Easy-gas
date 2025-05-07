import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Sliders, Moon, Sun, Globe, Shield, Key, User, Wallet } from "lucide-react";
import { RPC_ENDPOINT } from "@/lib/constants";
import { useWallet } from "@/hooks/useWallet";
import WalletConnectButton from "@/components/WalletConnectButton";

export default function Settings() {
  const { toast } = useToast();
  const { connected, walletAddress, connectWallet, disconnectWallet } = useWallet();
  const { theme, setTheme } = useTheme();
  
  // App settings
  const [settings, setSettings] = useState({
    theme: "system",
    language: "en",
    rpcEndpoint: RPC_ENDPOINT,
    slippageTolerance: "1.0",
    defaultPriorityLevel: "standard",
    advancedMode: false,
    autoRefresh: true,
    refreshInterval: "30",
    analyticsConsent: true,
    darkMode: false,
    highContrastMode: false,
    notifications: true,
    sounds: false,
    autoConnect: true,
    hideBalances: false,
    autoOptimizeFees: true,
    confirmations: "1"
  });

  // Sync with theme provider
  useEffect(() => {
    if (theme) {
      setSettings(prev => ({ ...prev, theme: theme }));
    }
  }, [theme]);
  
  const handleSettingChange = (key: keyof typeof settings, value: string | boolean | number) => {
    setSettings({ ...settings, [key]: value });
    
    // Update theme provider when theme setting changes
    if (key === 'theme' && typeof value === 'string') {
      setTheme(value);
    }
    
    toast({
      title: "Setting updated",
      description: `${key} has been updated.`,
    });
  };
  
  const saveSettings = () => {
    // In a real app, this would save to backend or localStorage
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };
  
  const resetSettings = () => {
    setSettings({
      theme: "system",
      language: "en",
      rpcEndpoint: RPC_ENDPOINT,
      slippageTolerance: "1.0",
      defaultPriorityLevel: "standard",
      advancedMode: false,
      autoRefresh: true,
      refreshInterval: "30",
      analyticsConsent: true,
      darkMode: false,
      highContrastMode: false,
      notifications: true,
      sounds: false,
      autoConnect: true,
      hideBalances: false,
      autoOptimizeFees: true,
      confirmations: "1"
    });
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults.",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sliders className="h-8 w-8" />
          Settings
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetSettings}>
            Reset
          </Button>
          <Button onClick={saveSettings}>
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 w-full sm:w-[500px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic application settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => handleSettingChange('language', value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Advanced Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable advanced options and detailed information
                      </p>
                    </div>
                    <Switch
                      checked={settings.advancedMode}
                      onCheckedChange={(checked) => handleSettingChange('advancedMode', checked)}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Auto-Refresh Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically refresh network data
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoRefresh}
                      onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
                    />
                  </div>
                  
                  {settings.autoRefresh && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                        <Select
                          value={settings.refreshInterval}
                          onValueChange={(value) => handleSettingChange('refreshInterval', value)}
                        >
                          <SelectTrigger id="refreshInterval">
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 seconds</SelectItem>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="300">5 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Analytics Consent</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow anonymous usage data collection to improve the app
                      </p>
                    </div>
                    <Switch
                      checked={settings.analyticsConsent}
                      onCheckedChange={(checked) => handleSettingChange('analyticsConsent', checked)}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Sound Effects</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sounds for notifications and actions
                      </p>
                    </div>
                    <Switch
                      checked={settings.sounds}
                      onCheckedChange={(checked) => handleSettingChange('sounds', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="network" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Network Settings
              </CardTitle>
              <CardDescription>
                Configure Solana network connection settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="rpcEndpoint">RPC Endpoint</Label>
                  <Input
                    id="rpcEndpoint"
                    placeholder="Enter RPC endpoint URL"
                    value={settings.rpcEndpoint}
                    onChange={(e) => handleSettingChange('rpcEndpoint', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Custom RPC endpoints may provide better performance.
                  </p>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label htmlFor="confirmations">Required Confirmations</Label>
                  <Select
                    value={settings.confirmations}
                    onValueChange={(value) => handleSettingChange('confirmations', value)}
                  >
                    <SelectTrigger id="confirmations">
                      <SelectValue placeholder="Select confirmations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 (Faster)</SelectItem>
                      <SelectItem value="2">2 (Balanced)</SelectItem>
                      <SelectItem value="3">3 (Safer)</SelectItem>
                      <SelectItem value="5">5 (Most Secure)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label htmlFor="slippageTolerance">Default Slippage Tolerance (%)</Label>
                  <Select
                    value={settings.slippageTolerance}
                    onValueChange={(value) => handleSettingChange('slippageTolerance', value)}
                  >
                    <SelectTrigger id="slippageTolerance">
                      <SelectValue placeholder="Select slippage tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.1">0.1%</SelectItem>
                      <SelectItem value="0.5">0.5%</SelectItem>
                      <SelectItem value="1.0">1.0%</SelectItem>
                      <SelectItem value="2.0">2.0%</SelectItem>
                      <SelectItem value="3.0">3.0%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label htmlFor="defaultPriorityLevel">Default Priority Level</Label>
                  <Select
                    value={settings.defaultPriorityLevel}
                    onValueChange={(value) => handleSettingChange('defaultPriorityLevel', value)}
                  >
                    <SelectTrigger id="defaultPriorityLevel">
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Optimize Transaction Fees</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically adjust priority fees based on network conditions
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoOptimizeFees}
                    onCheckedChange={(checked) => handleSettingChange('autoOptimizeFees', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wallet" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Settings
              </CardTitle>
              <CardDescription>
                Configure wallet connection preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="border rounded-lg p-4 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Connected Wallet</p>
                        <p className="text-sm text-muted-foreground">
                          {connected ? (
                            <span className="font-mono">{walletAddress?.substring(0, 5)}...{walletAddress?.substring(walletAddress.length - 5)}</span>
                          ) : (
                            "Not connected"
                          )}
                        </p>
                      </div>
                    </div>
                    {connected ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={disconnectWallet}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <div className="w-[120px]">
                        <WalletConnectButton />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Connect Wallet</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically connect to your wallet when the app loads
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoConnect}
                    onCheckedChange={(checked) => handleSettingChange('autoConnect', checked)}
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Hide Balances</Label>
                    <p className="text-sm text-muted-foreground">
                      Mask your balances for privacy
                    </p>
                  </div>
                  <Switch
                    checked={settings.hideBalances}
                    onCheckedChange={(checked) => handleSettingChange('hideBalances', checked)}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium text-lg flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5" />
                  Security
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">App Authorization:</span> EasyGas can only view your Solana address and request approval for transactions.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Connection Status:</span> Using {RPC_ENDPOINT.includes("mainnet") ? "Mainnet" : "Testnet"} network
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Your private keys are never stored or accessible by EasyGas
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the application looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={settings.theme === "light" ? "default" : "outline"}
                      className="flex flex-col items-center justify-center h-24"
                      onClick={() => handleSettingChange('theme', 'light')}
                    >
                      <Sun className="h-8 w-8 mb-2" />
                      Light
                    </Button>
                    <Button
                      variant={settings.theme === "dark" ? "default" : "outline"}
                      className="flex flex-col items-center justify-center h-24"
                      onClick={() => handleSettingChange('theme', 'dark')}
                    >
                      <Moon className="h-8 w-8 mb-2" />
                      Dark
                    </Button>
                    <Button
                      variant={settings.theme === "system" ? "default" : "outline"}
                      className="flex flex-col items-center justify-center h-24"
                      onClick={() => handleSettingChange('theme', 'system')}
                    >
                      <div className="h-8 w-8 mb-2 flex">
                        <Sun className="h-8 w-4 mr-0" />
                        <Moon className="h-8 w-4 ml-0" />
                      </div>
                      System
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better accessibility
                    </p>
                  </div>
                  <Switch
                    checked={settings.highContrastMode}
                    onCheckedChange={(checked) => handleSettingChange('highContrastMode', checked)}
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">In-App Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show notification pop-ups in the app
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}