
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sample } from '@/types/user';

export const useSamples = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        setLoading(true);
        console.log('Fetching samples...');
        
        const { data, error } = await supabase
          .from('samples')
          .select(`
            *,
            patients:patient_id (
              id,
              name,
              age,
              gender,
              contact_number
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching samples:', error);
          throw error;
        }
        
        console.log('Samples fetched successfully:', data?.length || 0);
        setSamples(data || []);
        setError(null);
      } catch (err: any) {
        console.error('Sample fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, []);

  return { samples, loading, error, refetch: () => window.location.reload() };
};
