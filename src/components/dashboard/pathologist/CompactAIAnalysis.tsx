
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const flaggedAreas = aiAnalysis.flaggedAreasCount ?? aiAnalysis.findings.filter(f => f.probability > 50).length;
  const isPositive = flaggedAreas > 4;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-4 rounded-lg text-center ${
          isPositive 
            ? 'bg-destructive/10 border border-destructive/20' 
            : 'bg-primary/10 border border-primary/20'
        }`}>
          <div className="flex items-center justify-center mb-2">
            {isPositive ? (
              <AlertTriangle className="h-6 w-6 text-destructive" />
            ) : (
              <CheckCircle className="h-6 w-6 text-primary" />
            )}
          </div>
          <h3 className={`text-base font-bold ${
            isPositive ? 'text-destructive' : 'text-primary'
          }`}>
            {isPositive ? 'FLAGGED FOR REVIEW' : 'NEGATIVE'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isPositive 
              ? `${flaggedAreas} areas detected`
              : 'No abnormalities detected'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactAIAnalysis;
