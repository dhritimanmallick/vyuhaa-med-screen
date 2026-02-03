-- Create the trigger to execute handle_sample_workflow on sample updates
CREATE TRIGGER on_sample_status_change
BEFORE UPDATE ON public.samples
FOR EACH ROW
EXECUTE FUNCTION public.handle_sample_workflow();