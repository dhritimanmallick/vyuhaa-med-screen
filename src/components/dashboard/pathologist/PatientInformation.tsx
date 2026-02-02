
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, User } from "lucide-react";

interface PatientInformationProps {
  patientData: {
    id: string;
    name: string;
    age: number;
    gender?: string;
    contactNumber?: string;
    address?: string;
    medicalHistory?: string;
    lastMenstrualPeriod?: string;
    contraceptiveUse?: string;
    pregnancyHistory?: string;
    previousCytology?: Array<{
      date: string;
      result: string;
      recommendation: string;
    }>;
    previousBiopsy?: Array<{
      date: string;
      result: string;
      histology: string;
    }>;
    clinicalHistory?: string;
    symptoms?: string;
    riskFactors?: string[];
  };
  sampleData: {
    barcode: string;
    testType: string;
    collectionDate: string;
    clinicalIndication?: string;
    specimenAdequacy?: string;
  };
}

const PatientInformation = ({ patientData, sampleData }: PatientInformationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            <User className="h-4 w-4 mr-2" />
            Patient Information
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Summary
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Full Details
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {/* Compact summary - single line layout */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="font-semibold">{patientData.name}</span>
          <span className="text-muted-foreground">{patientData.age}y, {patientData.gender || 'F'}</span>
          <Badge variant="outline" className="text-xs h-5">{sampleData.testType}</Badge>
          <span className="font-mono text-muted-foreground">{sampleData.barcode}</span>
        </div>

        {/* Expandable details */}
        {isExpanded && (
          <>
            <Separator className="my-3" />
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Collection:</span> {sampleData.collectionDate}
                </div>
                <div>
                  <span className="text-muted-foreground">LMP:</span> {patientData.lastMenstrualPeriod || "N/A"}
                </div>
              </div>

              {patientData.riskFactors && patientData.riskFactors.length > 0 && (
                <div className="p-2 bg-warning/10 border border-warning/20 rounded">
                  <span className="font-medium text-warning">Risk: </span>
                  <span className="text-warning/80">{patientData.riskFactors.join(", ")}</span>
                </div>
              )}

              {patientData.previousCytology && patientData.previousCytology.length > 0 && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded">
                  <span className="font-medium text-destructive">Prior: </span>
                  <span className="text-destructive/80">{patientData.previousCytology[0].result} ({patientData.previousCytology[0].date})</span>
                </div>
              )}

              {patientData.clinicalHistory && (
                <div>
                  <span className="text-muted-foreground">History:</span> {patientData.clinicalHistory}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientInformation;
