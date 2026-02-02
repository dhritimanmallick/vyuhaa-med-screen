
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, FileText } from "lucide-react";

interface DiagnosticObservation {
  specimenAdequacy: "yes" | "no" | null;
  cellularAbnormalities: "yes" | "no" | null;
  inflammatoryChanges: "yes" | "no" | null;
  recommendFollowUp: "yes" | "no" | null;
}

interface EnhancedActionPanelProps {
  sampleId: string;
  currentStatus: "pending" | "verified" | "approved";
  onVerifyAnalysis: (notes?: string) => void;
  onApproveAnalysis: (diagnosis: string, recommendations?: string) => void;
  onRequestReview: (reason: string) => void;
  onExportReport: () => void;
}

const EnhancedActionPanel = ({
  sampleId,
  currentStatus,
  onApproveAnalysis,
  onExportReport
}: EnhancedActionPanelProps) => {
  const [observations, setObservations] = useState<DiagnosticObservation>({
    specimenAdequacy: null,
    cellularAbnormalities: null,
    inflammatoryChanges: null,
    recommendFollowUp: null,
  });
  const [additionalNotes, setAdditionalNotes] = useState("");

  const getStatusBadge = () => {
    switch (currentStatus) {
      case "verified":
        return <Badge variant="secondary">Verified</Badge>;
      case "approved":
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge variant="outline">Pending Review</Badge>;
    }
  };

  const isComplete = 
    observations.specimenAdequacy !== null &&
    observations.cellularAbnormalities !== null &&
    observations.inflammatoryChanges !== null &&
    observations.recommendFollowUp !== null;

  const handleCompleteReview = () => {
    const diagnosis = `Specimen Adequacy: ${observations.specimenAdequacy === "yes" ? "Satisfactory" : "Unsatisfactory"}\n` +
      `Cellular Abnormalities: ${observations.cellularAbnormalities === "yes" ? "Present" : "Absent"}\n` +
      `Inflammatory Changes: ${observations.inflammatoryChanges === "yes" ? "Present" : "Absent"}\n` +
      `Follow-up Recommended: ${observations.recommendFollowUp === "yes" ? "Yes" : "No"}`;
    
    onApproveAnalysis(diagnosis, additionalNotes || undefined);
  };

  const ObservationItem = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: "yes" | "no" | null; 
    onChange: (val: "yes" | "no") => void;
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm font-medium">{label}</span>
      <RadioGroup
        value={value || ""}
        onValueChange={(val) => onChange(val as "yes" | "no")}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="yes" id={`${label}-yes`} className="h-3 w-3" />
          <Label htmlFor={`${label}-yes`} className="text-xs cursor-pointer">Yes</Label>
        </div>
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="no" id={`${label}-no`} className="h-3 w-3" />
          <Label htmlFor={`${label}-no`} className="text-xs cursor-pointer">No</Label>
        </div>
      </RadioGroup>
    </div>
  );

  if (currentStatus === "approved") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            Diagnostic Actions
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Review completed</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={onExportReport}
            >
              <FileText className="h-3 w-3 mr-1" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          Diagnostic Actions
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <ObservationItem
            label="Specimen Adequacy"
            value={observations.specimenAdequacy}
            onChange={(val) => setObservations(prev => ({ ...prev, specimenAdequacy: val }))}
          />
          <ObservationItem
            label="Cellular Abnormalities"
            value={observations.cellularAbnormalities}
            onChange={(val) => setObservations(prev => ({ ...prev, cellularAbnormalities: val }))}
          />
          <ObservationItem
            label="Inflammatory Changes"
            value={observations.inflammatoryChanges}
            onChange={(val) => setObservations(prev => ({ ...prev, inflammatoryChanges: val }))}
          />
          <ObservationItem
            label="Recommend Follow-up"
            value={observations.recommendFollowUp}
            onChange={(val) => setObservations(prev => ({ ...prev, recommendFollowUp: val }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Optional notes..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="text-xs min-h-[60px]"
          />
        </div>

        <Button 
          onClick={handleCompleteReview}
          disabled={!isComplete}
          className="w-full"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete Review
        </Button>
      </CardContent>
    </Card>
  );
};

export default EnhancedActionPanel;
