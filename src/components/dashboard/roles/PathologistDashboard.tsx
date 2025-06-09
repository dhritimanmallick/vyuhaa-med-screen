
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import StatsCards from "../StatsCards";
import { FileText, Upload, Search, AlertCircle } from "lucide-react";

interface PathologistDashboardProps {
  currentView: string;
}

const PathologistDashboard = ({ currentView }: PathologistDashboardProps) => {
  const mockReviewQueue = [
    { id: "VYU-001234", barcode: "VYU-001234", testType: "LBC", aiResult: "NILM", confidence: "98%", priority: "normal", customer: "Apollo Hospital" },
    { id: "VYU-001235", barcode: "VYU-001235", testType: "LBC", aiResult: "ASCUS", confidence: "85%", priority: "urgent", customer: "Max Healthcare" },
    { id: "VYU-001236", barcode: "VYU-001236", testType: "Co-test", aiResult: "LSIL", confidence: "92%", priority: "high", customer: "Fortis Hospital" },
  ];

  if (currentView === "review-queue") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">AI Review Queue</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Result</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockReviewQueue.map((sample) => (
                    <tr key={sample.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sample.barcode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.testType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={sample.aiResult === 'NILM' ? 'secondary' : 'outline'}>
                          {sample.aiResult}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.confidence}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={sample.priority === 'urgent' ? 'destructive' : sample.priority === 'high' ? 'default' : 'secondary'}>
                          {sample.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button variant="outline" size="sm">Review</Button>
                        <Button variant="outline" size="sm">View Images</Button>
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

  if (currentView === "finalize") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Finalize Reports</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Report Review</span>
              </CardTitle>
              <CardDescription>Sample ID: VYU-001234 | LBC Test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600">AI Diagnosis</label>
                  <p className="text-sm font-medium">NILM (Normal)</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Confidence</label>
                  <p className="text-sm font-medium">98%</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pathologist Review</label>
                <Textarea placeholder="Add pathologist notes and final diagnosis..." className="min-h-[120px]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Recommendations</label>
                <Textarea placeholder="Add recommendations for patient..." className="min-h-[80px]" />
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Approve & Finalize
                </Button>
                <Button variant="outline">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Request Second Opinion
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image Viewer</CardTitle>
              <CardDescription>CerviAI Screened Slide</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Slide Image Viewer</p>
                  <p className="text-xs text-gray-500">Integration with CerviAI platform</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  View AI Annotations
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Compare with Reference
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
        <h2 className="text-2xl font-bold text-gray-900">Pathologist Dashboard</h2>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <StatsCards role="pathologist" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "28 reports finalized today",
                "5 high priority cases reviewed",
                "12 co-test correlations completed",
                "3 second opinions requested"
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
            <CardTitle>AI Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">AI Accuracy (This Week)</span>
                <span className="text-green-600 text-sm font-medium">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Concordance Rate</span>
                <span className="text-blue-600 text-sm font-medium">91.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">False Positives</span>
                <span className="text-orange-600 text-sm font-medium">3.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">False Negatives</span>
                <span className="text-red-600 text-sm font-medium">1.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PathologistDashboard;
