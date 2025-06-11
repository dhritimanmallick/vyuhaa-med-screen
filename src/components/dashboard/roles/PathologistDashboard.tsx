
import { useSamples } from "../../../hooks/useSupabaseData";
import { useAuth } from "../../../hooks/useAuth";
import StatsCards from "../StatsCards";
import AISlideViewer from "../pathologist/AISlideViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface PathologistDashboardProps {
  currentView: string;
}

const PathologistDashboard = ({ currentView }: PathologistDashboardProps) => {
  const { samples, loading, error } = useSamples();
  const { user } = useAuth();

  // Filter samples assigned to this pathologist or pending review
  const pathologistSamples = samples.filter(sample => 
    sample.assigned_pathologist === user?.id || 
    (sample.status === 'review' && !sample.assigned_pathologist)
  );

  const pendingReviews = pathologistSamples.filter(sample => sample.status === 'review');
  const completedSamples = pathologistSamples.filter(sample => sample.status === 'completed');

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Loading samples...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading samples: {error}</p>
        </div>
      );
    }

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
              <Card>
                <CardHeader>
                  <CardTitle>Pending AI Reviews ({pendingReviews.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingReviews.length === 0 ? (
                      <p className="text-gray-500">No pending reviews</p>
                    ) : (
                      pendingReviews.slice(0, 5).map((sample) => (
                        <div key={sample.id} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                          <div>
                            <p className="font-medium">{sample.barcode}</p>
                            <p className="text-sm text-gray-600">{sample.test_type} - {sample.customer_name}</p>
                          </div>
                          <Badge variant="outline">Review Required</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedSamples.slice(0, 3).map((sample) => (
                      <div key={sample.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-sm">Completed review for {sample.barcode}</p>
                      </div>
                    ))}
                    {completedSamples.length === 0 && (
                      <p className="text-gray-500 text-sm">No recent activities</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'review-queue':
        return <AISlideViewer />;
      case 'finalize':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Finalize Reports</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {pendingReviews.length === 0 ? (
                    <p className="text-gray-600">No reports to finalize</p>
                  ) : (
                    pendingReviews.map((sample) => (
                      <div key={sample.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{sample.barcode}</p>
                          <p className="text-sm text-gray-600">{sample.test_type} - {sample.customer_name}</p>
                        </div>
                        <Badge variant="outline">Ready for Review</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'history':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Patient History</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {pathologistSamples.length === 0 ? (
                    <p className="text-gray-600">No patient history available</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Barcode</th>
                            <th className="px-4 py-2 text-left">Test Type</th>
                            <th className="px-4 py-2 text-left">Customer</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pathologistSamples.map((sample) => (
                            <tr key={sample.id} className="border-b">
                              <td className="px-4 py-2">{sample.barcode}</td>
                              <td className="px-4 py-2">{sample.test_type}</td>
                              <td className="px-4 py-2">{sample.customer_name}</td>
                              <td className="px-4 py-2">
                                <Badge variant={sample.status === 'completed' ? 'default' : 'outline'}>
                                  {sample.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-2">{new Date(sample.accession_date || '').toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
