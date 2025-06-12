
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TestResult } from '@/types/user';

export const useTestResults = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        setLoading(true);
        console.log('Fetching test results...');
        
        const { data, error } = await supabase
          .from('test_results')
          .select(`
            *,
            samples:sample_id (
              id,
              barcode,
              test_type,
              customer_name
            ),
            patients:patient_id (
              id,
              name,
              age,
              gender
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching test results:', error);
          throw error;
        }
        
        console.log('Test results fetched successfully:', data?.length || 0);
        setTestResults(data || []);
        setError(null);
      } catch (err: any) {
        console.error('Test result fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, []);

  return { testResults, loading, error, refetch: () => window.location.reload() };
};
