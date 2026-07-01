import { createClient } from '@supabase/supabase-js';

// Supabase configuration details provided by administrative credentials
const SUPABASE_URL = "https://vuastgyyrscopjmnhaew.supabase.co";
const SUPABASE_KEY = "sb_publishable_4bkEqRrvnIrfc-szu_CDpw_tCs9ouIP";

// Initialize the Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Helper type for Subsidiary entry
export interface Subsidiary {
  id: string;
  name: string;
  shortName: string;
  type: string;
  gstin: string;
  cin: string;
  contactEmail: string;
  phone: string;
  website: string;
  address: string;
  capacity: string;
  manager: string;
  status: string;
  updated_at?: string;
}

/**
 * Supabase Bridge Database Handshake Helper
 */
export const SupabaseBridge = {
  getURL: () => SUPABASE_URL,
  getKeySnippet: () => SUPABASE_KEY.slice(0, 15) + '...',
  
  /**
   * Fetch all corporate units from Supabase
   */
  fetchSubsidiaries: async (): Promise<Subsidiary[]> => {
    const { data, error } = await supabase
      .from('arcenol_corporate_units')
      .select('*')
      .order('id', { ascending: true });
      
    if (error) {
      throw error;
    }
    return data as Subsidiary[];
  },

  /**
   * Save or insert subsidiary in Supabase
   */
  saveSubsidiary: async (sub: Subsidiary): Promise<any> => {
    // Attempt upsert (insert or update on id constraint)
    const payload = {
      id: sub.id,
      name: sub.name,
      shortName: sub.shortName,
      type: sub.type,
      gstin: sub.gstin,
      cin: sub.cin,
      contactEmail: sub.contactEmail,
      phone: sub.phone,
      website: sub.website,
      address: sub.address,
      capacity: sub.capacity,
      manager: sub.manager,
      status: sub.status,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('arcenol_corporate_units')
      .upsert([payload])
      .select();

    if (error) {
      throw error;
    }
    return data;
  },

  /**
   * Delete subsidiary from Supabase
   */
  deleteSubsidiary: async (id: string): Promise<any> => {
    const { data, error } = await supabase
      .from('arcenol_corporate_units')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    return data;
  },

  /**
   * Batch upload/synchronize local array to Supabase
   */
  syncLocalToSupabase: async (subsList: Subsidiary[]): Promise<any> => {
    const payloads = subsList.map(sub => ({
      id: sub.id,
      name: sub.name,
      shortName: sub.shortName,
      type: sub.type,
      gstin: sub.gstin,
      cin: sub.cin,
      contactEmail: sub.contactEmail,
      phone: sub.phone,
      website: sub.website,
      address: sub.address,
      capacity: sub.capacity,
      manager: sub.manager,
      status: sub.status,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('arcenol_corporate_units')
      .upsert(payloads);

    if (error) {
      throw error;
    }
    return data;
  }
};
