import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Créer et exporter le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour TypeScript (optionnel, à adapter selon vos tables)
export type Database = {
  public: {
    Tables: Record<string, unknown>;
    // Ajoutez vos types de tables ici
    // Exemple:
    // oscars_data: {
    //   Row: {
    //     id: string;
    //     year: number;
    //     categories: unknown;
    //     created_at: string;
    //   };
    //   Insert: {
    //     id?: string;
    //     year: number;
    //     categories: unknown;
    //     created_at?: string;
    //   };
    //   Update: {
    //     id?: string;
    //     year?: number;
    //     categories?: unknown;
    //     created_at?: string;
    //   };
    // };
  };
};
