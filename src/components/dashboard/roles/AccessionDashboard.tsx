
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import StatsCards from "../StatsCards";
import { Upload, Search, Plus } from "lucide-react";

interface AccessionDashboardProps {
  currentView: string;
}

const AccessionDashboard = ({ currentView }: AccessionDashboardProps) => {
  const [newSample, setNewSample] = useState({
    barcode: "",
    customer: "",
    testType: "",
    collectionDate: ""
  });

  const mockSamples = [
    { id: "VYU-001234", barcode: "VYU-001234", customer: "Apollo Hospital", testType: "LBC", status: "pending", date: "2024-06-09" },
    { id: "VYU-001235", barcode: "VYU-001235", customer: "Max Healthcare", testType: "HPV", status: "processing", date: "2024-06-09" },
    { id: "VYU-001236", barcode: "VYU-001236", customer: "Fortis Hospital", testType: "Co-test", status: "review", date: "2024-06-08" },
  ];

  if (currentView === "add-sample") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Add New Sample</h2>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Sample Accession Form</span>
            </CardTitle>
            <CardDescription>Register a new sample for processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="barcode">Sample Barcode</Label>
                <Input
                  id="barcode"
                  value={newSample.barcode}
                  onChange={(e) => setNewSample({...newSample, barcode: e.target.value})}
                  placeholder="VYU-XXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select value={newSample.customer} onValueChange={(value) => setNewSample({...newSample, customer: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apollo">Apollo Hospital</SelectItem>
                    <SelectItem value="max">Max Healthcare</SelectItem>
                    <SelectItem value="fortis">Fortis Hospital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="testType">Test Type</Label>
                <Select value={newSample.testType} onValueChange={(value) => setNewSample({...newSample, testType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LBC">LBC (Liquid-based Cytology)</SelectItem>
                    <SelectItem value="HPV">HPV (DNA Testing)</SelectItem>
                    <SelectItem value="Co-test">Co-test (LBC + HPV)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="collectionDate">Collection Date</Label>
                <Input
                  id="collectionDate"
                  type="date"
                  value={newSample.collectionDate}
                  onChange={(e) => setNewSample({...newSample, collectionDate: e.target.value})}
                />
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Accession Sample
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === "sample-queue") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Sample Queue</h2>
          <div className="flex items-center space-x-2">
            <Input placeholder="Search samples..." className="w-64" />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockSamples.map((sample) => (
                    <tr key={sample.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sample.barcode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.testType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={sample.status === 'pending' ? 'secondary' : sample.status === 'processing' ? 'default' : 'outline'}>
                          {sample.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="outline" size="sm">View</Button>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Accession Dashboard</h2>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <StatsCards role="accession" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "89 samples accessioned today",
                "3 samples rejected for quality",
                "156 samples in processing",
                "12 urgent priority samples"
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
              Batch Upload Samples
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Search className="h-4 w-4 mr-2" />
              Search Sample by Barcode
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Register New Customer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessionDashboard;
