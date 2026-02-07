
import { useState, useEffect } from "react";
import { useSamples, useTestResults } from "../../../hooks/useSupabaseData";
import { useAuth } from "../../../hooks/useAuth";
import StatsCards from "../StatsCards";
import AISlideViewer from "../pathologist/AISlideViewer";
import SecondOpinionDialog from "../pathologist/SecondOpinionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Download, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PathologistDashboardProps {
  currentView: string;
  onNavigateToReview?: () => void;
}

const PathologistDashboard = ({ currentView, onNavigateToReview }: PathologistDashboardProps) => {


  const [samples2, setSamples2] = useState<any[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/getDoctors", {
          headers: {
            Authorization: `Basic ${btoa("user:password")}`,
          },
        });

        console.log('test')

        if (response.ok) {

          const data = await response.json();
          console.log(data)
          setSamples2(data[1].patients);

        } else {
          console.error("Failed to fetch samples");
        }
      } catch (error) {
        console.error("Error fetching samples:", error);
      }
    };

    fetchData();
  }, []);



  const { samples, loading, error } = useSamples();
  const { testResults } = useTestResults();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [sendingReport, setSendingReport] = useState<{ [key: string]: boolean }>({});

  // Filter samples assigned to this pathologist or pending review
  const pathologistSamples = samples.filter(sample =>
    sample.assigned_pathologist === user?.id ||
    (sample.status === 'review' && !sample.assigned_pathologist)
  );

  const pendingReviews = pathologistSamples.filter(sample => sample.status === 'review');
  const completedSamples = pathologistSamples.filter(sample => sample.status === 'completed');

  const handleCaseDoubleClick = (sampleId: string) => {
    setSelectedCaseId(sampleId);
    if (onNavigateToReview) {
      onNavigateToReview();
    }
  };

  const handleSendReport = async (sampleId: string) => {
    const sample = samples.find(s => s.id === sampleId);
    const result = testResults.find(tr => tr.sample_id === sampleId);

    if (!result?.diagnosis) {
      toast({
        title: "Error",
        description: "No diagnosis available to send",
        variant: "destructive"
      });
      return;
    }

    setSendingReport(prev => ({ ...prev, [sampleId]: true }));
    try {
      // Update test result to mark report as sent
      const { error } = await supabase
        .from('test_results')
        .update({
          report_sent_at: new Date().toISOString(),
          report_sent_to: sample?.patients?.contact_number || 'patient@email.com'
        })
        .eq('id', result.id);

      if (error) throw error;

      toast({
        title: "Report Sent",
        description: "The report has been sent to the patient successfully"
      });
    } catch (error) {
      console.error('Error sending report:', error);
      toast({
        title: "Error",
        description: "Failed to send report",
        variant: "destructive"
      });
    } finally {
      setSendingReport(prev => ({ ...prev, [sampleId]: false }));
    }
  };

  const generatePDFReport = (sample: any, result: any) => {
    // Generate a downloadable report
    const reportContent = `
CERVICAL CYTOLOGY REPORT
========================

Patient Information:
- Name: ${sample.patients?.name || 'N/A'}
- Age: ${sample.patients?.age || 'N/A'}
- Gender: ${sample.patients?.gender || 'N/A'}

Sample Information:
- Barcode: ${sample.barcode}
- Test Type: ${sample.test_type}
- Collection Date: ${new Date(sample.accession_date || '').toLocaleDateString()}
- Customer: ${sample.customer_name}

DIAGNOSIS:
${result?.diagnosis || 'No diagnosis available'}

RECOMMENDATIONS:
${result?.recommendations || 'No recommendations'}

Report Generated: ${new Date().toLocaleString()}
Reviewed By: Pathologist
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${sample.barcode}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: `Report for ${sample.barcode} has been downloaded`
    });
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Pathologist Dashboard</h1>
              <p className="text-muted-foreground">Review AI-analyzed slides and finalize reports</p>
            </div>
            <StatsCards role="pathologist" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending AI Reviews ({samples2.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingReviews.length === 0 ? (
                      <p className="text-muted-foreground">No pending reviews</p>
                    ) : (
                      samples2.slice(0, 5).map((sample) => (
                        <div
                          key={sample.id}
                          className="flex justify-between items-center p-3 bg-primary/5 rounded cursor-pointer hover:bg-primary/10 transition-colors"
                          onDoubleClick={() => handleCaseDoubleClick(sample)}
                          title="Double-click to open in AI Review"
                        >
                          <div>
                            {/* <p className="font-medium">{sample.barcode}</p> */}
                            <p className="text-sm text-muted-foreground">{sample}</p>
                            {sample.patients && (
                              <p className="text-xs text-muted-foreground">Patient: {sample.patients.name} ({sample.patients.age})</p>
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
                      <p className="text-muted-foreground text-sm">No recent activities</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'review-queue':
        return <AISlideViewer initialCaseId={selectedCaseId} />;
      case 'finalize':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Finalized Reports - Quality Control & Dispatch</h2>
            <p className="text-muted-foreground mb-4">
              Review completed cases, generate final reports, and send to patients.
            </p>
            <div className="space-y-6">
              {completedSamples.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No finalized reports to review</p>
                  </CardContent>
                </Card>
              ) : (
                completedSamples.map((sample) => {
                  const result = testResults.find(tr => tr.sample_id === sample.id);
                  return (
                    <Card key={sample.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Sample {sample.barcode}</span>
                          <div className="flex items-center space-x-2">
                            {result?.report_sent_at ? (
                              <Badge className="bg-green-100 text-green-800">Report Sent</Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800">Pending Dispatch</Badge>
                            )}
                            <Badge className="bg-primary/10 text-primary">Completed</Badge>
                          </div>
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          <p>Test Type: {sample.test_type}</p>
                          <p>Customer: {sample.customer_name}</p>
                          {sample.patients && (
                            <p>Patient: {sample.patients.name} (Age: {sample.patients.age}, Gender: {sample.patients.gender})</p>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {result ? (
                          <>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Final Diagnosis:</p>
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm whitespace-pre-wrap">{result.diagnosis || 'No diagnosis recorded'}</p>
                              </div>
                            </div>
                            {result.recommendations && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Recommendations:</p>
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-sm whitespace-pre-wrap">{result.recommendations}</p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                              <span>Report Generated: {result.report_generated ? 'Yes' : 'No'}</span>
                              <span>Last Updated: {new Date(result.updated_at || '').toLocaleString()}</span>
                              {result.report_sent_at && (
                                <span>Sent: {new Date(result.report_sent_at).toLocaleString()}</span>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-muted-foreground">No test result data available</p>
                        )}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Report
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => generatePDFReport(sample, result)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                          <SecondOpinionDialog
                            sampleId={sample.id}
                            sampleBarcode={sample.barcode}
                            currentDiagnosis={result?.diagnosis}
                          />
                          {!result?.report_sent_at && (
                            <Button
                              onClick={() => handleSendReport(sample.id)}
                              disabled={sendingReport[sample.id]}
                              className="bg-primary"
                            >
                              {sendingReport[sample.id] ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4 mr-2" />
                              )}
                              Send to Patient
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
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
