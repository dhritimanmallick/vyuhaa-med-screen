
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Sample, PricingTier, Patient, TestResult } from '@/types/user';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCustomers(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return { customers, loading, error };
};

export const useSamples = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSamples = async () => {
      try {
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

        if (error) throw error;
        setSamples(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching samples:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, []);

  return { samples, loading, error };
};

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPatients(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return { patients, loading, error };
};

export const useTestResults = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
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

        if (error) throw error;
        setTestResults(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching test results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, []);

  return { testResults, loading, error };
};

export const usePricingTiers = () => {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricingTiers = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_tiers')
          .select('*')
          .order('tier_name');

        if (error) throw error;
        setPricingTiers(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching pricing tiers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingTiers();
  }, []);

  return { pricingTiers, loading, error };
};
