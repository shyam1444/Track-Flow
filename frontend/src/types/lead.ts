export interface Lead {
  id: string;
  name: string;
  contact: string;
  company?: string;
  product_interest?: string;
  stage: string;
  follow_up_date?: string;
  notes?: string;
  created_at?: string;
  documents?: string[];
} 