import { supabase } from './supabase';
import type { OscarsData, Category, Nominee } from '../components/Oscars/types';

/**
 * Types pour la base de données Supabase
 */
export type Film = {
  id: string;
  title: string;
  release_year?: number;
  poster_url?: string;
  trailer_url?: string;
  imdb_id?: string;
  letterboxd_url?: string;
};

export type Person = {
  id: string;
  name: string;
  photo_urls?: string[];
  imdb_id?: string;
};

export type Nomination = {
  id: string;
  year_id: string;
  category_id: string;
  film_id: string;
  person_id?: string;
  crew?: string;
  not_seen: boolean;
  is_my_winner: boolean;
  is_official_winner: boolean;
  vote_count?: number;
};

/**
 * Obtenir les données Oscars complètes pour une année
 */
export async function getOscarsDataByYear(year: number): Promise<OscarsData | null> {
  try {
    const { data, error } = await supabase.rpc('get_oscars_data_by_year', {
      p_year: year,
    });

    if (error) {
      console.error('Error fetching Oscars data:', error);
      return null;
    }

    return data as OscarsData;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

/**
 * Ajouter un vote pour une nomination
 */
export async function addVote(
  nominationId: string,
  voterId?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('votes').insert({
      nomination_id: nominationId,
      voter_id: voterId || `anonymous_${Date.now()}`,
    });

    if (error) {
      console.error('Error adding vote:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

/**
 * Créer ou mettre à jour un film
 */
export async function upsertFilm(film: Partial<Film> & { title: string }): Promise<Film | null> {
  try {
    const { data, error } = await supabase
      .from('films')
      .upsert(
        {
          ...film,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'title',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting film:', error);
      return null;
    }

    return data as Film;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

/**
 * Créer ou mettre à jour une personne
 */
export async function upsertPerson(
  person: Partial<Person> & { name: string }
): Promise<Person | null> {
  try {
    const { data, error } = await supabase
      .from('people')
      .upsert(
        {
          ...person,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'name',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting person:', error);
      return null;
    }

    return data as Person;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

/**
 * Créer une nomination
 */
export async function createNomination(
  year: number,
  categoryName: string,
  nominee: Nominee
): Promise<Nomination | null> {
  try {
    // Récupérer l'ID de l'année
    const { data: yearData } = await supabase
      .from('oscars_years')
      .select('id')
      .eq('year', year)
      .single();

    if (!yearData) {
      console.error('Year not found');
      return null;
    }

    // Récupérer l'ID de la catégorie
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (!categoryData) {
      console.error('Category not found');
      return null;
    }

    // Créer ou récupérer le film
    const film = await upsertFilm({
      title: nominee.film,
      trailer_url: nominee.trailer,
    });

    if (!film) {
      console.error('Failed to create film');
      return null;
    }

    // Créer ou récupérer la personne si nécessaire
    let personId: string | undefined;
    if (nominee.actor) {
      const person = await upsertPerson({
        name: nominee.actor,
        photo_urls: nominee.photos,
      });
      personId = person?.id;
    }

    // Créer la nomination
    const { data, error } = await supabase
      .from('nominations')
      .insert({
        year_id: yearData.id,
        category_id: categoryData.id,
        film_id: film.id,
        person_id: personId,
        crew: nominee.crew,
        not_seen: nominee.notSeen || false,
        is_my_winner: false,
        is_official_winner: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating nomination:', error);
      return null;
    }

    return data as Nomination;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

/**
 * Obtenir les statistiques de votes pour une catégorie
 */
export async function getCategoryVoteStats(
  year: number,
  categoryName: string
): Promise<Array<{ nomination_id: string; film: string; actor?: string; vote_count: number }>> {
  try {
    // Récupérer l'ID de l'année
    const { data: yearData } = await supabase
      .from('oscars_years')
      .select('id')
      .eq('year', year)
      .single();

    if (!yearData) return [];

    // Récupérer l'ID de la catégorie
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (!categoryData) return [];

    // Récupérer les nominations avec leurs stats
    const { data, error } = await supabase
      .from('nominations')
      .select(
        `
        id,
        films!inner(title),
        people(name),
        nomination_stats(vote_count)
      `
      )
      .eq('year_id', yearData.id)
      .eq('category_id', categoryData.id);

    if (error) {
      console.error('Error fetching vote stats:', error);
      return [];
    }

    return (
      data?.map((item: any) => ({
        nomination_id: item.id,
        film: item.films?.title || '',
        actor: item.people?.name,
        vote_count: item.nomination_stats?.[0]?.vote_count || 0,
      })) || []
    );
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}
