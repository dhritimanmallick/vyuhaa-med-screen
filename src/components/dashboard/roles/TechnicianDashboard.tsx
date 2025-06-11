
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useSamples } from "../../../hooks/useSupabaseData";
import { useAuth } from "../../../hooks/useAuth";
import StatsCards from "../StatsCards";
import { Beaker, Upload, CheckCircle, Loader2 } from "lucide-react";

interface TechnicianDashboardProps {
  currentView: string;
}

const TechnicianDashboard = ({ currentView }: TechnicianDashboardProps) => {
  const { samples, loading, error } = useSamples();
  const { user } = useAuth();

  // Filter samples assigned to this technician or available for processing
  const technicianSamples = samples.filter(sample => 
    sample.assigned_technician === user?.id || 
    (sample.status === 'pending' && !sample.assigned_technician)
  );

  const assignedSamples = technicianSamples.filter(sample => sample.assigned_technician === user?.id);
  const processingSamples = assignedSamples.filter(sample => sample.status === 'processing');
  const completedSamples = assignedSamples.filter(sample => sample.status === 'completed');

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

  if (currentView === "assigned") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Assigned Samples ({assignedSamples.length})</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignedSamples.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No samples assigned
                      </td>
                    </tr>
                  ) : (
                    assignedSamples.map((sample) => (
                      <tr key={sample.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sample.barcode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.test_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.customer_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={sample.status === 'processing' ? 'default' : sample.status === 'completed' ? 'secondary' : 'outline'}>
                            {sample.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sample.accession_date || '').toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button variant="outline" size="sm">Process</Button>
                          <Button variant="outline" size="sm">View Details</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === "processing") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Sample Processing</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {processingSamples.length === 0 ? (
            <Card className="col-span-2">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">No samples currently in processing</p>
              </CardContent>
            </Card>
          ) : (
            processingSamples.slice(0, 2).map((sample) => (
              <Card key={sample.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Beaker className="h-5 w-5" />
                    <span>{sample.test_type} Processing</span>
                  </CardTitle>
                  <CardDescription>{sample.test_type === 'LBC' ? 'Liquid-based Cytology sample preparation' : sample.test_type === 'HPV' ? 'DNA extraction and PCR amplification' : 'Combined LBC and HPV testing'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sample ID: {sample.barcode}</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600">Preparation</label>
                        <Badge variant="outline" className="ml-2">In Progress</Badge>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Status</label>
                        <Badge variant="secondary" className="ml-2">{sample.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <Textarea placeholder="Add processing notes..." className="min-h-[100px]" />
                  <div className="flex space-x-2">
                    <Button className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Technician Dashboard</h2>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <StatsCards role="technician" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{completedSamples.length} samples completed</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{processingSamples.length} samples in processing</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>{assignedSamples.length} total assigned samples</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Beaker className="h-4 w-4 mr-2" />
              Start New Processing Batch
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Upload Batch Results
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Quality Check Complete
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
