import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface SecondOpinionDialogProps {
  sampleId: string;
  sampleBarcode: string;
  currentDiagnosis?: string;
}

interface Pathologist {
  id: string;
  name: string;
  email: string;
}

const SecondOpinionDialog = ({ sampleId, sampleBarcode, currentDiagnosis }: SecondOpinionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [pathologists, setPathologists] = useState<Pathologist[]>([]);
  const [selectedPathologist, setSelectedPathologist] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPathologists, setFetchingPathologists] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      fetchPathologists();
    }
  }, [open]);

  const fetchPathologists = async () => {
    setFetchingPathologists(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'pathologist')
        .neq('id', user?.id || ''); // Exclude current pathologist

      if (error) throw error;
      setPathologists(data || []);
    } catch (error) {
      console.error('Error fetching pathologists:', error);
      toast({
        title: "Error",
        description: "Failed to load pathologists",
        variant: "destructive"
      });
    } finally {
      setFetchingPathologists(false);
    }
  };

  const handleRequestSecondOpinion = async () => {
    if (!selectedPathologist) {
      toast({
        title: "Error",
        description: "Please select a pathologist",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Update the sample to assign to the new pathologist for second opinion
      // We'll add a note to the test result indicating this is a second opinion request
      const { error: sampleError } = await supabase
        .from('samples')
        .update({
          assigned_pathologist: selectedPathologist,
          pathologist_assigned_at: new Date().toISOString(),
          status: 'review', // Move back to review for second opinion
          processing_notes: `SECOND OPINION REQUEST from ${user?.name || 'Pathologist'}:\n${notes || 'No additional notes'}\n\nOriginal Diagnosis:\n${currentDiagnosis || 'N/A'}`
        })
        .eq('id', sampleId);

      if (sampleError) throw sampleError;

      // Update test result to indicate second opinion was requested
      const { error: resultError } = await supabase
        .from('test_results')
        .update({
          reviewed_by: selectedPathologist,
          recommendations: `SECOND OPINION REQUESTED: ${notes || 'Please review this case'}`
        })
        .eq('sample_id', sampleId);

      if (resultError) throw resultError;

      const selectedPath = pathologists.find(p => p.id === selectedPathologist);
      toast({
        title: "Second Opinion Requested",
        description: `Case ${sampleBarcode} has been sent to ${selectedPath?.name || 'pathologist'} for review`
      });
      
      setOpen(false);
      setSelectedPathologist("");
      setNotes("");
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error requesting second opinion:', error);
      toast({
        title: "Error",
        description: "Failed to request second opinion",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Second Opinion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Second Opinion</DialogTitle>
          <DialogDescription>
            Send this case to another pathologist for review. They will receive all case data, images, and your current diagnosis.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pathologist">Select Pathologist</Label>
            {fetchingPathologists ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading pathologists...</span>
              </div>
            ) : pathologists.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other pathologists available</p>
            ) : (
              <Select value={selectedPathologist} onValueChange={setSelectedPathologist}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a pathologist" />
                </SelectTrigger>
                <SelectContent>
                  {pathologists.map((pathologist) => (
                    <SelectItem key={pathologist.id} value={pathologist.id}>
                      {pathologist.name} ({pathologist.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes for Reviewer</Label>
            <Textarea
              id="notes"
              placeholder="Explain why you're requesting a second opinion..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Case:</strong> {sampleBarcode}<br />
              <strong>Current Diagnosis:</strong> {currentDiagnosis ? currentDiagnosis.slice(0, 100) + (currentDiagnosis.length > 100 ? '...' : '') : 'N/A'}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRequestSecondOpinion} 
            disabled={loading || !selectedPathologist || pathologists.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Request Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SecondOpinionDialog;
