
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useSamples } from "../../../hooks/useSupabaseData";
import { useAuth } from "../../../hooks/useAuth";
import StatsCards from "../StatsCards";
import { Beaker, CheckCircle, Loader2, Camera, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SlideImageUploader from "../technician/SlideImageUploader";

interface TechnicianDashboardProps {
  currentView: string;
}

const TechnicianDashboard = ({ currentView }: TechnicianDashboardProps) => {
  const { samples, loading, error } = useSamples();
  const { user } = useAuth();
  const { toast } = useToast();
  const [processingNotes, setProcessingNotes] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState<{[key: string]: boolean}>({});

  // Filter samples assigned to this technician or available for processing
  const technicianSamples = samples.filter(sample => 
    sample.assigned_technician === user?.id || 
    (sample.status === 'pending' && !sample.assigned_technician)
  );

  const assignedSamples = technicianSamples.filter(sample => sample.assigned_technician === user?.id);
  const processingSamples = assignedSamples.filter(sample => sample.status === 'processing');
  const imagingSamples = assignedSamples.filter(sample => sample.status === 'imaging');
  const completedSamples = assignedSamples.filter(sample => sample.status === 'review' || sample.status === 'completed');

  const handleStartProcessing = async (sampleId: string) => {
    setSubmitting(prev => ({ ...prev, [sampleId]: true }));
    try {
      const { error } = await supabase
        .from('samples')
        .update({
          status: 'processing',
          assigned_technician: user?.id
        })
        .eq('id', sampleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sample processing started"
      });

      // Refresh the page to see updated data
      window.location.reload();
    } catch (error) {
      console.error('Error starting processing:', error);
      toast({
        title: "Error",
        description: "Failed to start processing",
        variant: "destructive"
      });
    } finally {
      setSubmitting(prev => ({ ...prev, [sampleId]: false }));
    }
  };

  const handleCompleteProcessing = async (sampleId: string) => {
    setSubmitting(prev => ({ ...prev, [sampleId]: true }));
    try {
      const notes = processingNotes[sampleId] || '';
      
      // Update sample status to imaging (next step in workflow)
      const { error: sampleError } = await supabase
        .from('samples')
        .update({
          status: 'imaging',
          processing_notes: notes
        })
        .eq('id', sampleId);

      if (sampleError) throw sampleError;

      toast({
        title: "Success",
        description: "Sample processing completed. Sent to digital imaging."
      });

      setProcessingNotes(prev => ({ ...prev, [sampleId]: '' }));
      window.location.reload();
    } catch (error) {
      console.error('Error completing processing:', error);
      toast({
        title: "Error",
        description: "Failed to complete processing",
        variant: "destructive"
      });
    } finally {
      setSubmitting(prev => ({ ...prev, [sampleId]: false }));
    }
  };

  const handleCompleteImaging = async (sampleId: string) => {
    setSubmitting(prev => ({ ...prev, [sampleId]: true }));
    try {
      const notes = processingNotes[sampleId] || '';
      
      // Update sample status to review (pathologist)
      const { error: sampleError } = await supabase
        .from('samples')
        .update({
          status: 'review',
          processing_notes: notes ? `${notes} | Imaging completed` : 'Imaging completed'
        })
        .eq('id', sampleId);

      if (sampleError) throw sampleError;

      // Create test result entry for pathologist review
      const sample = samples.find(s => s.id === sampleId);
      const { error: testResultError } = await supabase
        .from('test_results')
        .insert({
          sample_id: sampleId,
          patient_id: sample?.patient_id || null,
          test_findings: `Digital imaging completed. Ready for pathologist review.`,
          images_uploaded: true,
          completed_by: user?.id
        });

      if (testResultError) throw testResultError;

      toast({
        title: "Success",
        description: "Digital imaging completed. Sent to pathologist for review."
      });

      setProcessingNotes(prev => ({ ...prev, [sampleId]: '' }));
      window.location.reload();
    } catch (error) {
      console.error('Error completing imaging:', error);
      toast({
        title: "Error",
        description: "Failed to complete imaging",
        variant: "destructive"
      });
    } finally {
      setSubmitting(prev => ({ ...prev, [sampleId]: false }));
    }
  };

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
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
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No samples assigned
                      </td>
                    </tr>
                  ) : (
                    assignedSamples.map((sample) => (
                      <tr key={sample.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sample.barcode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sample.patients ? `${sample.patients.name} (${sample.patients.age})` : 'Not linked'}
                        </td>
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
                          {sample.status === 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStartProcessing(sample.id)}
                              disabled={submitting[sample.id]}
                            >
                              {submitting[sample.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Processing'}
                            </Button>
                          )}
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
            processingSamples.map((sample) => (
              <Card key={sample.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Beaker className="h-5 w-5" />
                    <span>{sample.test_type} Processing</span>
                  </CardTitle>
                  <CardDescription>
                    Patient: {sample.patients ? `${sample.patients.name} (${sample.patients.age})` : 'Not linked'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sample ID: {sample.barcode}</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600">Test Type</label>
                        <Badge variant="outline" className="ml-2">{sample.test_type}</Badge>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Status</label>
                        <Badge variant="secondary" className="ml-2">{sample.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Processing Notes</label>
                    <Textarea 
                      placeholder="Add processing notes..." 
                      className="min-h-[100px]"
                      value={processingNotes[sample.id] || ''}
                      onChange={(e) => setProcessingNotes(prev => ({ ...prev, [sample.id]: e.target.value }))}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleCompleteProcessing(sample.id)}
                      disabled={submitting[sample.id]}
                    >
                      {submitting[sample.id] ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send to Imaging
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

  if (currentView === "imaging") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Digital Imaging</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {imagingSamples.length === 0 ? (
            <Card className="col-span-2">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">No samples currently in imaging</p>
              </CardContent>
            </Card>
          ) : (
            imagingSamples.map((sample) => (
              <Card key={sample.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>{sample.test_type} - Digital Imaging</span>
                  </CardTitle>
                  <CardDescription>
                    Patient: {sample.patients ? `${sample.patients.name} (${sample.patients.age})` : 'Not linked'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sample ID: {sample.barcode}</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600">Test Type</label>
                        <Badge variant="outline" className="ml-2">{sample.test_type}</Badge>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Status</label>
                        <Badge className="ml-2 bg-purple-500">Imaging</Badge>
                      </div>
                    </div>
                  </div>
                  {/* Slide Image Uploader */}
                  <SlideImageUploader 
                    sampleId={sample.id}
                    sampleBarcode={sample.barcode}
                    onUploadComplete={(imageUrl) => {
                      console.log('Image uploaded:', imageUrl);
                    }}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleCompleteImaging(sample.id)}
                      disabled={submitting[sample.id]}
                    >
                      {submitting[sample.id] ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Complete & Send to Pathologist
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
                <span>{completedSamples.length} samples sent to pathologist</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>{imagingSamples.length} samples in imaging</span>
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
            <CardTitle>Available Samples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {technicianSamples.filter(s => s.status === 'pending' && !s.assigned_technician).slice(0, 3).map((sample) => (
                <div key={sample.id} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <div>
                    <p className="font-medium">{sample.barcode}</p>
                    <p className="text-sm text-gray-600">{sample.test_type} - {sample.customer_name}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleStartProcessing(sample.id)}
                    disabled={submitting[sample.id]}
                  >
                    {submitting[sample.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
                  </Button>
                </div>
              ))}
              {technicianSamples.filter(s => s.status === 'pending' && !s.assigned_technician).length === 0 && (
                <p className="text-gray-500 text-sm">No available samples</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
