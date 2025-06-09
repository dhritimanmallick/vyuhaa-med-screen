
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StatsCards from "../StatsCards";
import { Upload, Download, FileText, CreditCard } from "lucide-react";

interface CustomerDashboardProps {
  currentView: string;
}

const CustomerDashboard = ({ currentView }: CustomerDashboardProps) => {
  const mockSamples = [
    { id: "VYU-001234", barcode: "VYU-001234", testType: "LBC", status: "completed", submittedDate: "2024-06-05", reportDate: "2024-06-08" },
    { id: "VYU-001235", barcode: "VYU-001235", testType: "HPV", status: "processing", submittedDate: "2024-06-07", reportDate: null },
    { id: "VYU-001236", barcode: "VYU-001236", testType: "Co-test", status: "review", submittedDate: "2024-06-06", reportDate: null },
  ];

  if (currentView === "submit") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Submit Sample Request</h2>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Sample Pickup Request</span>
            </CardTitle>
            <CardDescription>Request sample collection from your facility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input id="patientName" placeholder="Enter patient name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientAge">Patient Age</Label>
                <Input id="patientAge" type="number" placeholder="Age" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testType">Test Type</Label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Select test type</option>
                  <option value="LBC">LBC (Liquid-based Cytology)</option>
                  <option value="HPV">HPV (DNA Testing)</option>
                  <option value="Co-test">Co-test (LBC + HPV)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Pickup Address</Label>
              <Textarea id="pickupAddress" placeholder="Enter complete pickup address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea id="specialInstructions" placeholder="Any special handling instructions" />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Submit Pickup Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === "track") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Track Samples</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockSamples.map((sample) => (
                    <tr key={sample.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sample.barcode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.testType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={sample.status === 'completed' ? 'default' : sample.status === 'processing' ? 'secondary' : 'outline'}>
                          {sample.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.submittedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.reportDate || 'Pending'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {sample.status === 'completed' ? (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            Processing
                          </Button>
                        )}
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

  if (currentView === "billing") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Billing Summary</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="text-lg px-4 py-2">Gold Tier</Badge>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">LBC Test</span>
                  <span className="text-sm font-medium">₹800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">HPV Test</span>
                  <span className="text-sm font-medium">₹1,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Co-test</span>
                  <span className="text-sm font-medium">₹1,800</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">₹24,600</p>
              <p className="text-sm text-gray-600 mt-2">23 samples processed</p>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>LBC: 15 tests</span>
                  <span>₹12,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>HPV: 5 tests</span>
                  <span>₹6,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Co-test: 3 tests</span>
                  <span>₹5,400</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">₹45,200</p>
              <p className="text-sm text-gray-600 mt-2">Pending payment</p>
              <Button className="w-full mt-4" variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Make Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer Portal</h2>
        <div className="text-sm text-gray-600">
          Apollo Hospitals - Gold Tier
        </div>
      </div>
      
      <StatsCards role="customer" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Report available for VYU-001234",
                "Sample VYU-001235 in processing",
                "Payment received for March invoice",
                "New pickup request submitted"
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
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Submit New Sample Request
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Download Recent Reports
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              View Monthly Summary
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;
