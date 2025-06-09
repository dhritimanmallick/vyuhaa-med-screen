
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import StatsCards from "../StatsCards";
import { Beaker, Upload, CheckCircle } from "lucide-react";

interface TechnicianDashboardProps {
  currentView: string;
}

const TechnicianDashboard = ({ currentView }: TechnicianDashboardProps) => {
  const mockAssignedSamples = [
    { id: "VYU-001234", barcode: "VYU-001234", testType: "LBC", customer: "Apollo Hospital", priority: "normal", assignedDate: "2024-06-09" },
    { id: "VYU-001235", barcode: "VYU-001235", testType: "HPV", customer: "Max Healthcare", priority: "urgent", assignedDate: "2024-06-09" },
    { id: "VYU-001236", barcode: "VYU-001236", testType: "Co-test", customer: "Fortis Hospital", priority: "normal", assignedDate: "2024-06-08" },
  ];

  if (currentView === "assigned") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Assigned Samples</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockAssignedSamples.map((sample) => (
                    <tr key={sample.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sample.barcode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.testType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={sample.priority === 'urgent' ? 'destructive' : 'secondary'}>
                          {sample.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.assignedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button variant="outline" size="sm">Process</Button>
                        <Button variant="outline" size="sm">View Details</Button>
                      </td>
                    </tr>
                  ))}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Beaker className="h-5 w-5" />
                <span>LBC Processing</span>
              </CardTitle>
              <CardDescription>Liquid-based Cytology sample preparation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sample ID: VYU-001234</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Slide Preparation</label>
                    <Badge variant="outline" className="ml-2">In Progress</Badge>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Staining Status</label>
                    <Badge variant="secondary" className="ml-2">Pending</Badge>
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
                  Upload Images
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Beaker className="h-5 w-5" />
                <span>HPV Processing</span>
              </CardTitle>
              <CardDescription>DNA extraction and PCR amplification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sample ID: VYU-001235</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">DNA Extraction</label>
                    <Badge variant="default" className="ml-2">Complete</Badge>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">PCR Status</label>
                    <Badge variant="outline" className="ml-2">In Progress</Badge>
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
              {[
                "12 samples completed today",
                "8 LBC slides prepared",
                "10 HPV DNA extractions",
                "5 urgent samples processed"
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{activity}</span>
                </div>
              ))}
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
