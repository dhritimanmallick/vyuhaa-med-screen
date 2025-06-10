
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Microscope
} from "lucide-react";

const AISlideViewer = () => {
  const [zoomLevel, setZoomLevel] = useState(100);
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
          { type: "LSIL", probability: 85, location: "Quadrant 2" },
          { type: "Inflammation", probability: 78, location: "Multiple areas" }
        ],
        cellsAnalyzed: 15420,
        suspiciousCells: 23,
        recommendations: "Manual review recommended for LSIL findings"
      }
    }
  };

  const currentSlide = mockSlideData[selectedSlide];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 25));

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
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">AI Slide Review</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50">
            <Microscope className="h-3 w-3 mr-1" />
            Digital Microscopy
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slide Viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Slide Viewer - {currentSlide.barcode}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{zoomLevel}%</span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-100 rounded-lg aspect-[4/3] overflow-hidden">
                {/* Placeholder for actual slide image */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                  <div className="text-center">
                    <Microscope className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Slide Image View</p>
                    <p className="text-sm text-gray-400">Zoom: {zoomLevel}%</p>
                  </div>
                </div>
                
                {/* AI Detection Overlays */}
                <div className="absolute top-4 left-4 w-8 h-8 border-2 border-red-500 bg-red-500/20 rounded-full animate-pulse"></div>
                <div className="absolute top-12 right-8 w-6 h-6 border-2 border-yellow-500 bg-yellow-500/20 rounded-full"></div>
                <div className="absolute bottom-8 left-12 w-10 h-10 border-2 border-orange-500 bg-orange-500/20 rounded-full animate-pulse"></div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>Field of View: 20x objective</span>
                <span>Position: X: 2.3mm, Y: 1.8mm</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Patient Name</p>
                <p className="text-gray-900">{currentSlide.patientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Age</p>
                <p className="text-gray-900">{currentSlide.age} years</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Test Type</p>
                <Badge variant="outline">{currentSlide.testType}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Collection Date</p>
                <p className="text-gray-900">{currentSlide.collectionDate}</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Results */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                AI Analysis Results
                <div className={`ml-2 flex items-center ${getStatusColor(currentSlide.aiAnalysis.status)}`}>
                  {getStatusIcon(currentSlide.aiAnalysis.status)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Confidence Score</span>
                  <span className="text-lg font-bold text-blue-600">{currentSlide.aiAnalysis.confidence}%</span>
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
                <div className="space-y-2">
                  {currentSlide.aiAnalysis.findings.map((finding, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{finding.type}</p>
                        <p className="text-xs text-gray-600">{finding.location}</p>
                      </div>
                      <Badge variant={finding.probability > 80 ? "destructive" : "secondary"}>
                        {finding.probability}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-700">Cells Analyzed</p>
                  <p className="font-bold">{currentSlide.aiAnalysis.cellsAnalyzed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-700">Suspicious Cells</p>
                  <p className="font-bold text-red-600">{currentSlide.aiAnalysis.suspiciousCells}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">AI Recommendation</p>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{currentSlide.aiAnalysis.recommendations}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Analysis
                </Button>
                <Button variant="outline" className="w-full">
                  Request Manual Review
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
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
