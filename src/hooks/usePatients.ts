
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types/user';

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        console.log('Fetching patients...');
        
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching patients:', error);
          throw error;
        }
        
        console.log('Patients fetched successfully:', data?.length || 0);
        setPatients(data || []);
        setError(null);
      } catch (err: any) {
        console.error('Patient fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return { patients, loading, error, refetch: () => window.location.reload() };
};
