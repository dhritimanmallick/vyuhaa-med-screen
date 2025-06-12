
import { useState } from "react";
import { useSamples, useTestResults } from "../../../hooks/useSupabaseData";
import { useAuth } from "../../../hooks/useAuth";
import StatsCards from "../StatsCards";
import AISlideViewer from "../pathologist/AISlideViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, FileCheck, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PathologistDashboardProps {
  currentView: string;
}

const PathologistDashboard = ({ currentView }: PathologistDashboardProps) => {
  const { samples, loading, error } = useSamples();
  const { testResults } = useTestResults();
  const { user } = useAuth();
  const { toast } = useToast();
  const [diagnosis, setDiagnosis] = useState<{[key: string]: string}>({});
  const [recommendations, setRecommendations] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState<{[key: string]: boolean}>({});

  // Filter samples assigned to this pathologist or pending review
  const pathologistSamples = samples.filter(sample => 
    sample.assigned_pathologist === user?.id || 
    (sample.status === 'review' && !sample.assigned_pathologist)
  );

  const pendingReviews = pathologistSamples.filter(sample => sample.status === 'review');
  const completedSamples = pathologistSamples.filter(sample => sample.status === 'completed');

  const handleFinalizeReport = async (sampleId: string) => {
    const sampleDiagnosis = diagnosis[sampleId];
    const sampleRecommendations = recommendations[sampleId];

    if (!sampleDiagnosis) {
      toast({
        title: "Error",
        description: "Please provide a diagnosis before finalizing the report",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(prev => ({ ...prev, [sampleId]: true }));
    try {
      // Update sample status to completed
      const { error: sampleError } = await supabase
        .from('samples')
        .update({
          status: 'completed',
          assigned_pathologist: user?.id
        })
        .eq('id', sampleId);

      if (sampleError) throw sampleError;

      // Update or create test result with diagnosis
      const existingResult = testResults.find(tr => tr.sample_id === sampleId);
      
      if (existingResult) {
        const { error: updateError } = await supabase
          .from('test_results')
          .update({
            diagnosis: sampleDiagnosis,
            recommendations: sampleRecommendations,
            report_generated: true,
            reviewed_by: user?.id
          })
          .eq('id', existingResult.id);

        if (updateError) throw updateError;
      } else {
        const sample = samples.find(s => s.id === sampleId);
        const { error: insertError } = await supabase
          .from('test_results')
          .insert({
            sample_id: sampleId,
            patient_id: sample?.patient_id || null,
            diagnosis: sampleDiagnosis,
            recommendations: sampleRecommendations,
            report_generated: true,
            reviewed_by: user?.id
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Report finalized successfully"
      });

      setDiagnosis(prev => ({ ...prev, [sampleId]: '' }));
      setRecommendations(prev => ({ ...prev, [sampleId]: '' }));
      
      // Refresh the page to see updated data
      window.location.reload();
    } catch (error) {
      console.error('Error finalizing report:', error);
      toast({
        title: "Error",
        description: "Failed to finalize report",
        variant: "destructive"
      });
    } finally {
      setSubmitting(prev => ({ ...prev, [sampleId]: false }));
    }
  };

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
                            {sample.patients && (
                              <p className="text-xs text-gray-500">Patient: {sample.patients.name} ({sample.patients.age})</p>
                            )}
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Finalize Reports</h2>
            <div className="space-y-6">
              {pendingReviews.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">No reports to finalize</p>
                  </CardContent>
                </Card>
              ) : (
                pendingReviews.map((sample) => (
                  <Card key={sample.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Sample {sample.barcode}</span>
                        <Badge variant="outline">Pending Review</Badge>
                      </CardTitle>
                      <div className="text-sm text-gray-600">
                        <p>Test Type: {sample.test_type}</p>
                        <p>Customer: {sample.customer_name}</p>
                        {sample.patients && (
                          <p>Patient: {sample.patients.name} (Age: {sample.patients.age}, Gender: {sample.patients.gender})</p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`diagnosis-${sample.id}`}>Diagnosis *</Label>
                        <Textarea
                          id={`diagnosis-${sample.id}`}
                          placeholder="Enter detailed diagnosis..."
                          value={diagnosis[sample.id] || ''}
                          onChange={(e) => setDiagnosis(prev => ({ ...prev, [sample.id]: e.target.value }))}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`recommendations-${sample.id}`}>Recommendations</Label>
                        <Textarea
                          id={`recommendations-${sample.id}`}
                          placeholder="Enter recommendations for follow-up..."
                          value={recommendations[sample.id] || ''}
                          onChange={(e) => setRecommendations(prev => ({ ...prev, [sample.id]: e.target.value }))}
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1"
                          onClick={() => handleFinalizeReport(sample.id)}
                          disabled={submitting[sample.id]}
                        >
                          {submitting[sample.id] ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <FileCheck className="h-4 w-4 mr-2" />
                          )}
                          Finalize Report
                        </Button>
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Slides
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
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
                            <th className="px-4 py-2 text-left">Patient</th>
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
                              <td className="px-4 py-2">
                                {sample.patients ? `${sample.patients.name} (${sample.patients.age})` : 'Not linked'}
                              </td>
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
