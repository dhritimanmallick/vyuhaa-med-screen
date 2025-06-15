
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Microscope,
  FileText
} from "lucide-react";
import SlideViewer from "./SlideViewer";

const AISlideViewer = () => {
  const [selectedSlide, setSelectedSlide] = useState("slide-001");

  const mockSlideData = {
    "slide-001": {
      id: "slide-001",
      barcode: "VYU2024001234",
      patientName: "Priya Sharma",
      age: 32,
      testType: "LBC",
      collectionDate: "2024-06-08",
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
        recommendations: "Manual review recommended for HSIL findings in Quadrant 1"
      }
    }
  };

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
        {/* Main Slide Viewer */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Slide Viewer - {currentSlide.barcode}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {currentSlide.testType}
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
              <SlideViewer slideData={currentSlide} />
            </CardContent>
          </Card>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-4 overflow-y-auto">
          {/* Patient Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-gray-700">Name</p>
                <p>{currentSlide.patientName}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Age</p>
                <p>{currentSlide.age} years</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Collection</p>
                <p>{currentSlide.collectionDate}</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Results */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Confidence</span>
                  <span className="text-sm font-bold text-blue-600">{currentSlide.aiAnalysis.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${currentSlide.aiAnalysis.confidence}%` }}
                  ></div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Findings</p>
                <div className="space-y-1">
                  {currentSlide.aiAnalysis.findings.map((finding, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                      <div>
                        <p className="font-medium">{finding.type}</p>
                        <p className="text-gray-600">{finding.location}</p>
                      </div>
                      <Badge 
                        variant={finding.probability > 80 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {finding.probability}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-700">Cells Analyzed</p>
                  <p className="font-bold">{currentSlide.aiAnalysis.cellsAnalyzed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-700">Suspicious</p>
                  <p className="font-bold text-red-600">{currentSlide.aiAnalysis.suspiciousCells}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Recommendation</p>
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex">
                    <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">{currentSlide.aiAnalysis.recommendations}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve Analysis
                </Button>
                <Button variant="outline" className="w-full text-sm">
                  <FileText className="h-3 w-3 mr-1" />
                  Manual Review
                </Button>
                <Button variant="outline" className="w-full text-sm">
                  <Download className="h-3 w-3 mr-1" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AISlideViewer;
