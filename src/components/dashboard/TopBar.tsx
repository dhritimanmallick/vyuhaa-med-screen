
import { Button } from "@/components/ui/button";
import { Bell, User as UserIcon } from "lucide-react";
import { User } from "../../types/user";

interface TopBarProps {
  user: User;
  onLogout: () => void;
}

const TopBar = ({ user, onLogout }: TopBarProps) => {
  // Add safety checks for user properties
  if (!user) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Vyuhaa Med ERP</h1>
          <p className="text-sm text-gray-600">{user.lab_location || 'Lab Location'}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-gray-600" />
            <div className="text-sm">
              <p className="font-medium">{user.name || 'User'}</p>
              <p className="text-gray-500 capitalize">{user.role || 'Role'}</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
