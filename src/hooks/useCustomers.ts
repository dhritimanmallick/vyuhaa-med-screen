
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/user';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        console.log('Fetching customers...');
        
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching customers:', error);
          throw error;
        }
        
        console.log('Customers fetched successfully:', data?.length || 0);
        setCustomers(data || []);
        setError(null);
      } catch (err: any) {
        console.error('Customer fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return { customers, loading, error, refetch: () => window.location.reload() };
};
