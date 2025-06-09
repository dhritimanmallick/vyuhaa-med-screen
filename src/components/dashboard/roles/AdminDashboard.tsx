
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Settings, CreditCard } from "lucide-react";
import StatsCards from "../StatsCards";
import UserManagement from "../admin/UserManagement";
import CustomerManagement from "../admin/CustomerManagement";
import PricingTiers from "../admin/PricingTiers";

interface AdminDashboardProps {
  currentView: string;
}

const AdminDashboard = ({ currentView }: AdminDashboardProps) => {
  if (currentView === "users") {
    return <UserManagement />;
  }

  if (currentView === "customers") {
    return <CustomerManagement />;
  }

  if (currentView === "pricing") {
    return <PricingTiers />;
  }

  if (currentView === "reports") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Reports Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lab Performance</CardTitle>
              <CardDescription>Turnaround time analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">2.3 days</p>
              <p className="text-sm text-gray-600">Average TAT</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Volume</CardTitle>
              <CardDescription>Samples processed this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">1,247</p>
              <p className="text-sm text-gray-600">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quality Metrics</CardTitle>
              <CardDescription>Accuracy and reprocessing rates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-teal-600">98.7%</p>
              <p className="text-sm text-gray-600">Accuracy rate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentView === "audit") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { action: "User Created", entity: "technician@lab.com", user: "admin@lab.com", time: "2 hours ago" },
                { action: "Sample Processed", entity: "VYU-001234", user: "tech@lab.com", time: "3 hours ago" },
                { action: "Pricing Updated", entity: "Platinum Tier", user: "admin@lab.com", time: "1 day ago" },
              ].map((log, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-gray-600">{log.entity} by {log.user}</p>
                  </div>
                  <p className="text-sm text-gray-500">{log.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <StatsCards role="admin" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "New sample VYU-001234 accessioned",
                "Pathologist completed 15 reviews",
                "Customer ABC Hospital registered",
                "Technician marked 8 samples complete"
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{activity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <span className="text-green-600 text-sm font-medium">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API Services</span>
                <span className="text-green-600 text-sm font-medium">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Lab Connectivity</span>
                <span className="text-green-600 text-sm font-medium">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Backup Status</span>
                <span className="text-blue-600 text-sm font-medium">Last: 2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
