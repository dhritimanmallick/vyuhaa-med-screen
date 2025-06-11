
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSamples, useCustomers } from "../../../hooks/useSupabaseData";
import StatsCards from "../StatsCards";
import { Upload, Search, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AccessionDashboardProps {
  currentView: string;
}

const AccessionDashboard = ({ currentView }: AccessionDashboardProps) => {
  const { samples, loading: samplesLoading, error: samplesError } = useSamples();
  const { customers, loading: customersLoading } = useCustomers();
  const { toast } = useToast();
  
  const [newSample, setNewSample] = useState({
    barcode: "",
    customer_id: "",
    test_type: "",
    customer_name: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitSample = async () => {
    if (!newSample.barcode || !newSample.customer_id || !newSample.test_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const selectedCustomer = customers.find(c => c.id === newSample.customer_id);
      
      const { error } = await supabase
        .from('samples')
        .insert({
          barcode: newSample.barcode,
          customer_id: newSample.customer_id,
          customer_name: selectedCustomer?.name || '',
          test_type: newSample.test_type as 'LBC' | 'HPV' | 'Co-test',
          lab_id: 'VYU-LAB-001',
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sample accessioned successfully"
      });

      setNewSample({
        barcode: "",
        customer_id: "",
        test_type: "",
        customer_name: ""
      });
    } catch (error) {
      console.error('Error submitting sample:', error);
      toast({
        title: "Error",
        description: "Failed to accession sample",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (samplesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  if (samplesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading data: {samplesError}</p>
      </div>
    );
  }

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
                <Select 
                  value={newSample.customer_id} 
                  onValueChange={(value) => setNewSample({...newSample, customer_id: value})}
                  disabled={customersLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={customersLoading ? "Loading customers..." : "Select customer"} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="testType">Test Type</Label>
                <Select value={newSample.test_type} onValueChange={(value) => setNewSample({...newSample, test_type: value})}>
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
            </div>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              onClick={handleSubmitSample}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accessioning...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Accession Sample
                </>
              )}
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
          <h2 className="text-2xl font-bold text-gray-900">Sample Queue ({samples.length})</h2>
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
                  {samples.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No samples found
                      </td>
                    </tr>
                  ) : (
                    samples.map((sample) => (
                      <tr key={sample.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sample.barcode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.customer_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.test_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={
                            sample.status === 'pending' ? 'secondary' : 
                            sample.status === 'processing' ? 'default' : 
                            sample.status === 'completed' ? 'outline' :
                            sample.status === 'review' ? 'default' : 'destructive'
                          }>
                            {sample.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sample.accession_date || '').toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" size="sm">View</Button>
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

  const todaySamples = samples.filter(sample => {
    const today = new Date().toDateString();
    const sampleDate = new Date(sample.accession_date || '').toDateString();
    return today === sampleDate;
  });

  const rejectedSamples = samples.filter(sample => sample.status === 'rejected');
  const processingSamples = samples.filter(sample => sample.status === 'processing');

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
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{todaySamples.length} samples accessioned today</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{rejectedSamples.length} samples rejected for quality</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>{processingSamples.length} samples in processing</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{samples.length} total samples in system</span>
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
