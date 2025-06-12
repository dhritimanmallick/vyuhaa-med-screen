
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PricingTier } from '@/types/user';

export const usePricingTiers = () => {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricingTiers = async () => {
      try {
        setLoading(true);
        console.log('Fetching pricing tiers...');
        
        const { data, error } = await supabase
          .from('pricing_tiers')
          .select('*')
          .order('tier_name');

        if (error) {
          console.error('Error fetching pricing tiers:', error);
          throw error;
        }
        
        console.log('Pricing tiers fetched successfully:', data?.length || 0);
        setPricingTiers(data || []);
        setError(null);
      } catch (err: any) {
        console.error('Pricing tier fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingTiers();
  }, []);

  return { pricingTiers, loading, error, refetch: () => window.location.reload() };
};
