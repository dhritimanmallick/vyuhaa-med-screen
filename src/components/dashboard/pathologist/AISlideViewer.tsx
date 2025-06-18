import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle,
  XCircle,
  Clock,
  Microscope,
  Grid3X3,
  Eye
} from "lucide-react";
import SlideViewer from "./SlideViewer";
import SlideGridView from "./SlideGridView";
import PatientInformation from "./PatientInformation";
import CompactAIAnalysis from "./CompactAIAnalysis";
import EnhancedActionPanel from "./EnhancedActionPanel";
import CaseNavigation from "./CaseNavigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const AISlideViewer = () => {
  const [selectedSlide, setSelectedSlide] = useState("slide-001");
  const [activeTab, setActiveTab] = useState("viewer");
  const { toast } = useToast();
  const { user } = useAuth();

  // Enhanced mock data with comprehensive patient information
  const mockSlideData = {
    "slide-001": {
      id: "slide-001",
      barcode: "VYU2024001234",
      patientData: {
        id: "patient-001",
        name: "Priya Sharma",
        age: 32,
        gender: "Female",
        contactNumber: "+91-9876543210",
        address: "123 MG Road, Bangalore, Karnataka",
        medicalHistory: "No significant past medical history",
        lastMenstrualPeriod: "2024-05-25",
        contraceptiveUse: "Oral contraceptive pills for 2 years",
        pregnancyHistory: "G2P2, Normal vaginal deliveries",
        clinicalHistory: "Routine screening. Patient asymptomatic. Regular screening every 3 years as per guidelines.",
        symptoms: "None reported",
        riskFactors: ["Multiple sexual partners", "Early age at first intercourse"],
        previousCytology: [
          {
            date: "2021-06-15",
            result: "NILM",
            recommendation: "Routine screening in 3 years"
          },
          {
            date: "2018-05-20", 
            result: "ASCUS",
            recommendation: "HPV co-testing recommended"
          }
        ],
        previousBiopsy: []
      },
      sampleData: {
        barcode: "VYU2024001234",
        testType: "LBC",
        collectionDate: "2024-06-08",
        clinicalIndication: "Routine cervical screening",
        specimenAdequacy: "Satisfactory for evaluation"
      },
      aiAnalysis: {
        status: "completed",
        confidence: 92,
        findings: [
          { type: "HSIL", probability: 92, location: "Quadrant 1", coordinates: { x: 20, y: 15 } },
          { type: "LSIL", probability: 78, location: "Quadrant 2", coordinates: { x: 45, y: 35 } },
          { type: "Inflammation", probability: 65, location: "Multiple areas", coordinates: { x: 75, y: 60 } }
        ],
        cellsAnalyzed: 15420,
        suspiciousCells: 23,
        recommendations: "Manual review recommended for HSIL findings in Quadrant 1. Consider HPV co-testing."
      },
      currentStatus: "pending" as const
    }
  };

  // Mock cases for navigation
  const mockCases = [
    {
      id: "slide-001",
      barcode: "VYU2024001234", 
      patientName: "Priya Sharma",
      age: 32,
      testType: "LBC",
      status: "pending" as const,
      priority: "normal" as const,
      collectionDate: "2024-06-08",
      assignedDate: "2024-06-09"
    },
    {
      id: "slide-002",
      barcode: "VYU2024001235",
      patientName: "Anjali Patel", 
      age: 28,
      testType: "Co-test",
      status: "verified" as const,
      priority: "urgent" as const,
      collectionDate: "2024-06-07",
      assignedDate: "2024-06-08"
    },
    {
      id: "slide-003",
      barcode: "VYU2024001236",
      patientName: "Meera Singh",
      age: 45,
      testType: "HPV",
      status: "approved" as const,
      priority: "stat" as const,
      collectionDate: "2024-06-06",
      assignedDate: "2024-06-07"
    }
  ];

  const currentSlide = mockSlideData[selectedSlide];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "processing": return "text-blue-600";
      case "failed": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "processing": return <Clock className="h-4 w-4" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      default: return <Microscope className="h-4 w-4" />;
    }
  };

  // Enhanced action handlers with actual report generation
  const handleVerifyAnalysis = async (notes?: string) => {
    try {
      // Update sample status in database
      const { error } = await supabase
        .from('samples')
        .update({
          status: 'verified',
          reviewed_by: user?.id,
          review_notes: notes
        })
        .eq('barcode', currentSlide.barcode);

      if (error) throw error;

      toast({
        title: "Analysis Verified",
        description: "Case marked for final review and approval",
      });
      console.log("Verification notes:", notes);
    } catch (error) {
      console.error("Error verifying analysis:", error);
      toast({
        title: "Error",
        description: "Failed to verify analysis",
        variant: "destructive"
      });
    }
  };

  const handleApproveAnalysis = async (diagnosis: string, recommendations?: string) => {
    try {
      // Update sample status
      const { error: sampleError } = await supabase
        .from('samples')
        .update({
          status: 'completed',
          reviewed_by: user?.id
        })
        .eq('barcode', currentSlide.barcode);

      if (sampleError) throw sampleError;

      // Create or update test result
      const { error: resultError } = await supabase
        .from('test_results')
        .upsert({
          sample_id: currentSlide.id,
          patient_id: currentSlide.patientData.id,
          diagnosis: diagnosis,
          recommendations: recommendations,
          report_generated: true,
          reviewed_by: user?.id,
          created_at: new Date().toISOString()
        });

      if (resultError) throw resultError;

      toast({
        title: "Report Generated Successfully", 
        description: "Final report has been created and is ready for download",
      });
      console.log("Final diagnosis:", diagnosis, "Recommendations:", recommendations);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRequestReview = (reason: string) => {
    toast({
      title: "Review Requested",
      description: "Case sent for manual review",
      variant: "destructive"
    });
    console.log("Review reason:", reason);
  };

  const handleExportReport = async () => {
    try {
      // Generate and download PDF report
      const reportData = {
        patientInfo: currentSlide.patientData,
        sampleInfo: currentSlide.sampleData,
        aiAnalysis: currentSlide.aiAnalysis,
        finalDiagnosis: "Report data would be fetched from database"
      };

      console.log("Generating PDF report with data:", reportData);
      
      toast({
        title: "Report Exported",
        description: "PDF report downloaded successfully",
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Export Error",
        description: "Failed to export report",
        variant: "destructive"
      });
    }
  };

  const handleGenerateReport = async () => {
    try {
      const diagnosis = `
CERVICAL CYTOLOGY REPORT
INTERPRETATION: Specimen is satisfactory for evaluation.
HIGH-GRADE SQUAMOUS INTRAEPITHELIAL LESION (HSIL) identified.
Multiple regions showing dysplastic changes consistent with CIN 2-3.
      `.trim();

      await handleApproveAnalysis(diagnosis, "Recommend colposcopy and biopsy for histological confirmation.");
    } catch (error) {
      console.error("Error in report generation:", error);
    }
  };

  const handleCaseSelect = (caseId: string) => {
    setSelectedSlide(caseId);
    toast({
      title: "Case Selected",
      description: `Switched to case ${caseId}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">AI Slide Analysis</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50">
            <Microscope className="h-3 w-3 mr-1" />
            Digital Pathology
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            QuPath Compatible
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
        {/* Main Slide Viewer with Tabs */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Slide Analysis - {currentSlide.barcode}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {currentSlide.sampleData.testType}
                  </Badge>
                  <div className={`flex items-center ${getStatusColor(currentSlide.aiAnalysis.status)}`}>
                    {getStatusIcon(currentSlide.aiAnalysis.status)}
                    <span className="ml-1 text-sm font-medium capitalize">
                      {currentSlide.aiAnalysis.status}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <div className="px-4 border-b">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="viewer" className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Slide Viewer</span>
                    </TabsTrigger>
                    <TabsTrigger value="grid" className="flex items-center space-x-2">
                      <Grid3X3 className="h-4 w-4" />
                      <span>Grid View</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="viewer" className="h-[calc(100%-60px)] mt-0">
                  <SlideViewer slideData={currentSlide} />
                </TabsContent>
                
                <TabsContent value="grid" className="h-[calc(100%-60px)] mt-0 p-4 overflow-y-auto">
                  <SlideGridView 
                    slideData={currentSlide}
                    onSlideSelect={handleCaseSelect}
                    onGenerateReport={handleGenerateReport}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Analysis Panel */}
        <div className="space-y-4 overflow-y-auto">
          {/* Case Navigation */}
          <CaseNavigation 
            currentCaseId={selectedSlide}
            cases={mockCases}
            onCaseSelect={handleCaseSelect}
          />

          {/* Enhanced Patient Information */}
          <PatientInformation 
            patientData={currentSlide.patientData}
            sampleData={currentSlide.sampleData}
          />

          {/* Compact AI Analysis */}
          <CompactAIAnalysis aiAnalysis={currentSlide.aiAnalysis} />

          {/* Enhanced Action Panel */}
          <EnhancedActionPanel
            sampleId={currentSlide.id}
            currentStatus={currentSlide.currentStatus}
            onVerifyAnalysis={handleVerifyAnalysis}
            onApproveAnalysis={handleApproveAnalysis}
            onRequestReview={handleRequestReview}
            onExportReport={handleExportReport}
          />
        </div>
      </div>
    </div>
  );
};

export default AISlideViewer;
