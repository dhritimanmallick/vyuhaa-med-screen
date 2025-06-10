
import { useState } from "react";
import { User } from "../../types/user";
import Sidebar from "./Sidebar";
import AdminDashboard from "./roles/AdminDashboard";
import AccessionDashboard from "./roles/AccessionDashboard";
import TechnicianDashboard from "./roles/TechnicianDashboard";
import PathologistDashboard from "./roles/PathologistDashboard";
import CustomerDashboard from "./roles/CustomerDashboard";
import TopBar from "./TopBar";
import { Loader2 } from "lucide-react";

interface DashboardProps {
  user: User | null;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [currentView, setCurrentView] = useState("dashboard");

  // Show loading if user is null
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard currentView={currentView} />;
      case 'accession':
        return <AccessionDashboard currentView={currentView} />;
      case 'technician':
        return <TechnicianDashboard currentView={currentView} />;
      case 'pathologist':
        return <PathologistDashboard currentView={currentView} />;
      case 'customer':
        return <CustomerDashboard currentView={currentView} />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
