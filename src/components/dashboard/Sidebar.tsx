
import { cn } from "@/lib/utils";
import { User } from "../../types/user";
import { 
  Home, 
  Users, 
  Settings, 
  FileText, 
  Beaker, 
  Search, 
  Upload,
  CreditCard,
  User as UserIcon,
  AlertCircle
} from "lucide-react";

interface SidebarProps {
  user: User;
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Sidebar = ({ user, currentView, setCurrentView }: SidebarProps) => {
  const getMenuItems = () => {
    switch (user.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'labs', label: 'Lab Management', icon: Settings },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'customers', label: 'Customer Management', icon: UserIcon },
          { id: 'pricing', label: 'Pricing Tiers', icon: CreditCard },
          { id: 'reports', label: 'Reports Overview', icon: FileText },
          { id: 'audit', label: 'Audit Logs', icon: AlertCircle },
        ];
      case 'accession':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'add-sample', label: 'Add New Sample', icon: Upload },
          { id: 'sample-queue', label: 'Sample Queue', icon: FileText },
          { id: 'rejected', label: 'Rejected Samples', icon: AlertCircle },
          { id: 'track', label: 'Track Samples', icon: Search },
        ];
      case 'technician':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'assigned', label: 'Assigned Samples', icon: FileText },
          { id: 'processing', label: 'Sample Processing', icon: Beaker },
          { id: 'completed', label: 'Completed Samples', icon: FileText },
        ];
      case 'pathologist':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'review-queue', label: 'AI Review Queue', icon: FileText },
          { id: 'finalize', label: 'Finalize Reports', icon: Upload },
          { id: 'history', label: 'Patient History', icon: Search },
        ];
      case 'customer':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'submit', label: 'Submit Sample', icon: Upload },
          { id: 'track', label: 'Track Samples', icon: Search },
          { id: 'reports', label: 'Download Reports', icon: FileText },
          { id: 'billing', label: 'Billing Summary', icon: CreditCard },
          { id: 'support', label: 'Support Tickets', icon: AlertCircle },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-white w-64 shadow-lg border-r border-gray-200">
      <div className="p-6">
        <div className="text-sm text-gray-500 mb-4">Navigation</div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                currentView === item.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
