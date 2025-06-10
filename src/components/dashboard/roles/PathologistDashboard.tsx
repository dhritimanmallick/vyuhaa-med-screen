
import StatsCards from "../StatsCards";
import AISlideViewer from "../pathologist/AISlideViewer";

interface PathologistDashboardProps {
  currentView: string;
}

const PathologistDashboard = ({ currentView }: PathologistDashboardProps) => {
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pathologist Dashboard</h1>
              <p className="text-gray-600">Review AI-analyzed slides and finalize reports</p>
            </div>
            <StatsCards role="pathologist" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Pending AI Reviews</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <div>
                      <p className="font-medium">VYU2024001234</p>
                      <p className="text-sm text-gray-600">LBC - High Priority</p>
                    </div>
                    <span className="text-blue-600 font-medium">92% AI Confidence</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <div>
                      <p className="font-medium">VYU2024001235</p>
                      <p className="text-sm text-gray-600">HPV - Standard</p>
                    </div>
                    <span className="text-yellow-600 font-medium">87% AI Confidence</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm">Approved report for VYU2024001230</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm">Started review of VYU2024001231</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm">Requested additional staining for VYU2024001229</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'review-queue':
        return <AISlideViewer />;
      case 'finalize':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Finalize Reports</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Report finalization interface will be implemented here.</p>
            </div>
          </div>
        );
      case 'history':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Patient History</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Patient history search and review interface will be implemented here.</p>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pathologist Dashboard</h1>
            <StatsCards role="pathologist" />
          </div>
        );
    }
  };

  return <div>{renderContent()}</div>;
};

export default PathologistDashboard;
