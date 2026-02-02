
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, AlertTriangle } from "lucide-react";

interface AIAnalysisData {
  status: string;
  confidence: number;
  findings: Array<{
    type: string;
    probability: number;
    location: string;
    coordinates: { x: number; y: number };
  }>;
  cellsAnalyzed: number;
  suspiciousCells: number;
  recommendations: string;
  flaggedAreasCount?: number;
}

interface CompactAIAnalysisProps {
  aiAnalysis: AIAnalysisData;
}

const CompactAIAnalysis = ({ aiAnalysis }: CompactAIAnalysisProps) => {
  // Simple logic: more than 4 flagged areas = Flagged/Positive, otherwise Negative
  const flaggedAreas = aiAnalysis.flaggedAreasCount ?? aiAnalysis.findings.filter(f => f.probability > 50).length;
  const isPositive = flaggedAreas > 4;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          AI Analysis Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Result Display */}
        <div className={`p-4 rounded-lg text-center ${
          isPositive 
            ? 'bg-destructive/10 border border-destructive/20' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center justify-center mb-2">
            {isPositive ? (
              <AlertTriangle className="h-8 w-8 text-destructive" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
          <h3 className={`text-lg font-bold ${
            isPositive ? 'text-destructive' : 'text-green-700'
          }`}>
            {isPositive ? 'FLAGGED FOR REVIEW' : 'NEGATIVE'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isPositive 
              ? `AI detected ${flaggedAreas} areas requiring attention`
              : 'No significant abnormalities detected by AI'
            }
          </p>
        </div>

        {/* Flagged Areas Count */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">Flagged Areas</span>
          <Badge 
            variant={isPositive ? "destructive" : "secondary"}
            className="text-sm"
          >
            {flaggedAreas} {flaggedAreas === 1 ? 'area' : 'areas'}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-muted rounded">
            <p className="text-xs text-muted-foreground">Threshold</p>
            <p className="font-medium text-sm">&gt;4 areas = Flagged</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <p className="text-xs text-muted-foreground">AI Status</p>
            <p className="font-medium text-sm capitalize">{aiAnalysis.status}</p>
          </div>
        </div>

        {/* Recommendation if positive */}
        {isPositive && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                Multiple areas flagged. Please review the slide carefully and verify AI findings before finalizing diagnosis.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompactAIAnalysis;
