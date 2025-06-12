
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BillingRecord {
  id: string;
  sample_id: string;
  customer_id: string;
  test_type: 'LBC' | 'HPV' | 'Co-test';
  amount: number;
  billing_date: string;
  payment_status: 'pending' | 'paid' | 'overdue';
  created_at: string;
  updated_at: string;
  samples?: {
    id: string;
    barcode: string;
    customer_name: string;
  };
  customers?: {
    id: string;
    name: string;
    tier: 'Platinum' | 'Gold' | 'Silver';
  };
}

export const useBillingRecords = () => {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingRecords = async () => {
      try {
        setLoading(true);
        console.log('Fetching billing records...');
        
        const { data, error } = await supabase
          .from('billing_records')
          .select(`
            *,
            samples:sample_id (
              id,
              barcode,
              customer_name
            ),
            customers:customer_id (
              id,
              name,
              tier
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching billing records:', error);
          throw error;
        }
        
        console.log('Billing records fetched successfully:', data?.length || 0);
        setBillingRecords(data || []);
        setError(null);
      } catch (err: any) {
        console.error('Billing records fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingRecords();
  }, []);

  return { billingRecords, loading, error, refetch: () => window.location.reload() };
};
