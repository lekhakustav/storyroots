export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; email: string | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'> & Partial<Pick<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      biography_projects: {
        Row: { id: string; owner_id: string; title: string; storyteller_name: string; storyteller_relationship: string; preferred_language: string; status: string; cover_image_url: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['biography_projects']['Row'], 'id' | 'created_at' | 'updated_at'> & Partial<Pick<Database['public']['Tables']['biography_projects']['Row'], 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Database['public']['Tables']['biography_projects']['Insert']>;
      };
    };
  };
};
