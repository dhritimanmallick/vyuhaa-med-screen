
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'accession' | 'technician' | 'pathologist' | 'customer';
  lab_location?: string;
}

export interface Sample {
  id: string;
  barcode: string;
  test_type: 'LBC' | 'HPV' | 'Co-test';
  customer_id: string;
  customer_name: string;
  accession_date: string;
  status: 'pending' | 'processing' | 'review' | 'completed' | 'rejected';
  lab_id: string;
  assigned_technician?: string;
  assigned_pathologist?: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  tier: 'Platinum' | 'Gold' | 'Silver';
  email: string;
  location: string;
}

export interface PricingTier {
  id: string;
  tier_name: 'Platinum' | 'Gold' | 'Silver';
  lbc_price: number;
  hpv_price: number;
  co_test_price: number;
}
