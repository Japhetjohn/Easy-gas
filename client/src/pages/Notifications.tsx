import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle, Clock, AlertTriangle, X, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "success" | "warning" | "info";
}

export default function Notifications() {
  const { toast } = useToast();
  const userId = "1"; // Would come from auth system in a real app
  
  // Fetch notifications from API
  const { data: notificationsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["/api/notifications", userId],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
  
  // Format API notifications to match our interface
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    // Handle data from the API
    if (notificationsData && Array.isArray(notificationsData)) {
      // If we get data from the API, use that
      const formattedNotifications = notificationsData.map((alert: any) => ({
        id: alert.id.toString(),
        title: alert.title,
        message: alert.message,
        timestamp: alert.createdAt,
        read: alert.read,
        type: alert.alertType as "success" | "warning" | "info"
      }));
      setNotifications(formattedNotifications);
    } else if (isError) {
      // If API fails, show a notification
      toast({
        title: "Error loading notifications",
        description: "Could not load your notifications. Please try again later.",
        variant: "destructive",
      });
      
      // Set empty array - no fallback data
      setNotifications([]);
    }
  }, [notificationsData, isError, toast]);

  // Notification settings
  const [settings, setSettings] = useState({
    transactionAlerts: true,
    congestionAlerts: true,
    priceAlerts: false,
    systemAnnouncements: true,
    emailNotifications: false,
    pushNotifications: true
  });

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "All notifications cleared",
      description: "All notifications have been removed.",
    });
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    });
    toast({
      title: "Setting updated",
      description: `${key} has been ${!settings[key] ? "enabled" : "disabled"}`,
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getNotificationIcon = (type: "success" | "warning" | "info") => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "info":
        return <Clock className="h-5 w-5 text-info" />;
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={!notifications.some(n => !n.read)}>
            Mark all as read
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllNotifications} disabled={notifications.length === 0}>
            Clear all
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="all">
            All
            {notifications.length > 0 && (
              <Badge className="ml-2" variant="outline">{notifications.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {getUnreadCount() > 0 && (
              <Badge className="ml-2" variant="outline">{getUnreadCount()}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <Card key={notification.id} className={notification.read ? "opacity-70" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {getNotificationIcon(notification.type)}
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      {!notification.read && <Badge variant="secondary">New</Badge>}
                    </div>
                    <div className="flex space-x-1">
                      {!notification.read && (
                        <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {formatTimestamp(notification.timestamp)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{notification.message}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground">You don't have any notifications at the moment.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="unread" className="space-y-4 mt-4">
          {notifications.filter(n => !n.read).length > 0 ? (
            notifications.filter(n => !n.read).map(notification => (
              <Card key={notification.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {getNotificationIcon(notification.type)}
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      <Badge variant="secondary">New</Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {formatTimestamp(notification.timestamp)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{notification.message}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">All caught up!</h3>
              <p className="text-muted-foreground">You have no unread notifications.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure what types of notifications you'd like to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alert Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Transaction Alerts</h4>
                      <p className="text-sm text-muted-foreground">Get notified about your transaction status</p>
                    </div>
                    <Switch
                      checked={settings.transactionAlerts}
                      onCheckedChange={() => toggleSetting('transactionAlerts')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Network Congestion Alerts</h4>
                      <p className="text-sm text-muted-foreground">Get notified when network congestion is high</p>
                    </div>
                    <Switch
                      checked={settings.congestionAlerts}
                      onCheckedChange={() => toggleSetting('congestionAlerts')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Priority Fee Price Alerts</h4>
                      <p className="text-sm text-muted-foreground">Get notified about significant changes in fee prices</p>
                    </div>
                    <Switch
                      checked={settings.priceAlerts}
                      onCheckedChange={() => toggleSetting('priceAlerts')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">System Announcements</h4>
                      <p className="text-sm text-muted-foreground">Get notified about app updates and new features</p>
                    </div>
                    <Switch
                      checked={settings.systemAnnouncements}
                      onCheckedChange={() => toggleSetting('systemAnnouncements')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Delivery Methods</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={() => toggleSetting('emailNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications in the browser</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={() => toggleSetting('pushNotifications')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}