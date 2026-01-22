-- ============================================
-- SCHÉMA SUPABASE POUR LES OSCARS 2026
-- ============================================

-- Table des années (pour gérer plusieurs années)
CREATE TABLE IF NOT EXISTS oscars_years (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des films (normalisée pour éviter les doublons)
CREATE TABLE IF NOT EXISTS films (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  release_year INTEGER,
  poster_url TEXT,
  trailer_url TEXT,
  imdb_id TEXT,
  letterboxd_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des personnes (acteurs, réalisateurs, etc.)
CREATE TABLE IF NOT EXISTS people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  photo_urls TEXT[], -- Array de URLs de photos
  imdb_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des nominations (relation entre année, catégorie, film, personne)
CREATE TABLE IF NOT EXISTS nominations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year_id UUID NOT NULL REFERENCES oscars_years(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL, -- NULL pour les catégories sans personne
  crew TEXT, -- Pour les catégories techniques (ex: "James Mangold & Jay Cocks")
  not_seen BOOLEAN DEFAULT false,
  is_my_winner BOOLEAN DEFAULT false,
  is_official_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year_id, category_id, film_id, person_id)
);

-- Table des votes (pour compter les votes de chaque nomination)
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nomination_id UUID NOT NULL REFERENCES nominations(id) ON DELETE CASCADE,
  voter_id TEXT, -- ID anonyme du votant (cookie, session, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(nomination_id, voter_id) -- Un vote par personne par nomination
);

-- Table pour les statistiques de votes (vue matérialisée ou table calculée)
CREATE TABLE IF NOT EXISTS nomination_stats (
  nomination_id UUID PRIMARY KEY REFERENCES nominations(id) ON DELETE CASCADE,
  vote_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_nominations_year_category ON nominations(year_id, category_id);
CREATE INDEX IF NOT EXISTS idx_nominations_film ON nominations(film_id);
CREATE INDEX IF NOT EXISTS idx_nominations_person ON nominations(person_id);
CREATE INDEX IF NOT EXISTS idx_votes_nomination ON votes(nomination_id);
CREATE INDEX IF NOT EXISTS idx_films_title ON films(title);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);

-- Fonction pour mettre à jour automatiquement les statistiques de votes
CREATE OR REPLACE FUNCTION update_nomination_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO nomination_stats (nomination_id, vote_count, last_updated)
  SELECT 
    nomination_id,
    COUNT(*) as vote_count,
    NOW() as last_updated
  FROM votes
  WHERE nomination_id = COALESCE(NEW.nomination_id, OLD.nomination_id)
  GROUP BY nomination_id
  ON CONFLICT (nomination_id) 
  DO UPDATE SET 
    vote_count = EXCLUDED.vote_count,
    last_updated = EXCLUDED.last_updated;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour les stats automatiquement
CREATE TRIGGER trigger_update_nomination_stats
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_nomination_stats();

-- Fonction pour obtenir les données complètes d'une année
CREATE OR REPLACE FUNCTION get_oscars_data_by_year(p_year INTEGER)
RETURNS JSON AS $$
DECLARE
  result JSON;
  year_record RECORD;
BEGIN
  -- Récupérer l'année
  SELECT * INTO year_record FROM oscars_years WHERE year = p_year;
  
  IF year_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT json_build_object(
    'year', year_record.year,
    'categories', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'name', c.name,
          'nominees', (
            SELECT COALESCE(json_agg(
              json_build_object(
                'id', n.id,
                'film', f.title,
                'actor', p.name,
                'crew', n.crew,
                'photos', p.photo_urls,
                'trailer', f.trailer_url,
                'notSeen', n.not_seen,
                'vote_count', COALESCE(ns.vote_count, 0)
              ) ORDER BY COALESCE(ns.vote_count, 0) DESC, f.title
            ), '[]'::json)
            FROM nominations n
            JOIN films f ON n.film_id = f.id
            LEFT JOIN people p ON n.person_id = p.id
            LEFT JOIN nomination_stats ns ON n.id = ns.nomination_id
            WHERE n.year_id = year_record.id AND n.category_id = c.id
          ),
          'my_winner', (
            SELECT json_build_object(
              'film', f.title,
              'actor', p.name,
              'crew', n.crew
            )
            FROM nominations n
            JOIN films f ON n.film_id = f.id
            LEFT JOIN people p ON n.person_id = p.id
            WHERE n.year_id = year_record.id AND n.category_id = c.id AND n.is_my_winner = true
            LIMIT 1
          ),
          'official_winner', (
            SELECT json_build_object(
              'film', f.title,
              'actor', p.name,
              'crew', n.crew
            )
            FROM nominations n
            JOIN films f ON n.film_id = f.id
            LEFT JOIN people p ON n.person_id = p.id
            WHERE n.year_id = year_record.id AND n.category_id = c.id AND n.is_official_winner = true
            LIMIT 1
          )
        ) ORDER BY COALESCE(c.display_order, 999), c.name
      ), '[]'::json)
      FROM categories c
      WHERE EXISTS (
        SELECT 1 FROM nominations n 
        WHERE n.year_id = year_record.id AND n.category_id = c.id
      )
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insérer les catégories de base
INSERT INTO categories (name, display_order) VALUES
  ('Actor in a Supporting Role', 1),
  ('Actress in a Supporting Role', 2),
  ('Animated Feature Film', 3),
  ('Writing (Adapted Screenplay)', 4),
  ('Writing (Original Screenplay)', 5),
  ('Makeup and Hairstyling', 6),
  ('Costume Design', 7),
  ('Production Design', 8),
  ('Sound', 9),
  ('Visual Effects', 10),
  ('Film Editing', 11),
  ('Cinematography', 12),
  ('International Feature Film', 13),
  ('Music (Original Score)', 14),
  ('Music (Original Song)', 15),
  ('Actor in a Leading Role', 16),
  ('Actress in a Leading Role', 17),
  ('Directing', 18),
  ('Best Picture', 19)
ON CONFLICT (name) DO NOTHING;

-- Insérer l'année 2026
INSERT INTO oscars_years (year, is_active) VALUES (2026, true)
ON CONFLICT (year) DO UPDATE SET is_active = true;
