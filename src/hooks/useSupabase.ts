import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';


export function useSupabase<T = any>(table: string, filters?: Record<string, any>) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let query = supabase.from(table).select('*');

        // Appliquer les filtres si fournis
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        const { data: result, error: queryError } = await query;

        if (queryError) throw queryError;
        setData(result as T[]);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [table, JSON.stringify(filters)]);

  return { data, loading, error };
}

export function useSupabaseInsert<T = any>(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const insert = async (data: T) => {
    try {
      setLoading(true);
      setError(null);
      const { data: result, error: insertError } = await supabase.from(table).insert(data).select();

      if (insertError) throw insertError;
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { insert, loading, error };
}

export function useSupabaseUpdate<T = any>(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (id: string, data: Partial<T>) => {
    try {
      setLoading(true);
      setError(null);
      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();

      if (updateError) throw updateError;
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}
