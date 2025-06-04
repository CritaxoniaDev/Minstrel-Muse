import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/Admin/Overview";
import { RecentSales } from "@/Admin/RecentSales";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Users, Music, PlayCircle, Activity,
  TrendingUp, Download, Upload, AlertCircle, Bell, Crown, Shield
} from "lucide-react";

export default function AdminDashboard({ currentUser }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "userActivities"),
        orderBy("timestamp", "desc"),
        limit(10)
      ),
      (snapshot) => {
        const newNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(newNotifications);
      }
    );

    return () => unsubscribe();
  }, []);

  // Get dashboard title and styling based on user role
  const getDashboardInfo = () => {
    if (currentUser?.role === 'owner') {
      return {
        title: 'Owner Dashboard',
        subtitle: 'Complete system oversight and control',
        icon: Crown,
        gradient: 'from-yellow-500 to-orange-500',
        accentColor: 'text-yellow-500',
        bgAccent: 'bg-yellow-500/10'
      };
    } else {
      return {
        title: 'Admin Dashboard',
        subtitle: 'System administration and management',
        icon: Shield,
        gradient: 'from-red-500 to-orange-500',
        accentColor: 'text-red-500',
        bgAccent: 'bg-red-500/10'
      };
    }
  };

  const dashboardInfo = getDashboardInfo();
  const DashboardIcon = dashboardInfo.icon;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${dashboardInfo.bgAccent}`}>
            <DashboardIcon className={`h-6 w-6 ${dashboardInfo.accentColor}`} />
          </div>
          <div>
            <h2 className={`text-3xl font-bold bg-gradient-to-r ${dashboardInfo.gradient} bg-clip-text text-transparent`}>
              {dashboardInfo.title}
            </h2>
            <p className="text-muted-foreground text-sm">{dashboardInfo.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button className={`bg-gradient-to-r ${dashboardInfo.gradient} hover:opacity-90 text-white border-0`}>
            Download Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">+180 from last month</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">485</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground">+4,320 this week</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {currentUser?.role === 'owner' && (
            <TabsTrigger value="system" className="text-yellow-600">System Control</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest user activities across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                User Activities
                {currentUser?.role === 'owner' && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </CardTitle>
              <CardDescription>Recent user login activities and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={notification.userPhoto} />
                        <AvatarFallback>{notification.userName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{notification.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {notification.action}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(notification.timestamp?.toDate()).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Owner-only System Control Tab */}
        {currentUser?.role === 'owner' && (
          <TabsContent value="system" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <Crown className="h-5 w-5" />
                    System Status
                  </CardTitle>
                  <CardDescription>Overall system health and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Server Status</span>
                      <span className="text-sm text-green-500">Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Database</span>
                      <span className="text-sm text-green-500">Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Storage</span>
                      <span className="text-sm text-yellow-500">75% Used</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <Shield className="h-5 w-5" />
                    Security Overview
                  </CardTitle>
                  <CardDescription>Security metrics and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Failed Logins</span>
                      <span className="text-sm text-green-500">0 Today</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active Admins</span>
                      <span className="text-sm">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending Reviews</span>
                      <span className="text-sm text-blue-500">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <Activity className="h-5 w-5" />
                    Performance
                  </CardTitle>
                  <CardDescription>System performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Response Time</span>
                      <span className="text-sm text-green-500">120ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm text-green-500">99.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm text-yellow-500">68%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" variant="outline">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
        <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" variant="outline">
          <Upload className="h-4 w-4" />
          Import Data
        </Button>
        <Button className="flex items-center gap-2 hover:shadow-md transition-shadow" variant="outline">
          <TrendingUp className="h-4 w-4" />
          View Analytics
        </Button>
        <Button 
          className={`flex items-center gap-2 hover:shadow-md transition-shadow ${
            currentUser?.role === 'owner' ? 'border-yellow-300 text-yellow-600 hover:bg-yellow-50' : ''
          }`} 
          variant="outline"
        >
          <AlertCircle className="h-4 w-4" />
          System Status
        </Button>
      </div>
    </div>
  );
}
