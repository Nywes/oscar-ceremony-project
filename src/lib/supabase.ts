import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Créer et exporter le client Supabase
// Si les variables d'environnement ne sont pas définies, on crée un client avec des valeurs vides
// Les appels Supabase échoueront de manière gracieuse si les variables ne sont pas configurées
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

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
