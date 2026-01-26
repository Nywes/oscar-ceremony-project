# Configuration Supabase

Ce guide vous explique comment configurer Supabase dans ce projet.

## 1. Installation de la dépendance

```bash
pnpm add @supabase/supabase-js
```

Ou avec npm :
```bash
npm install @supabase/supabase-js
```

## 2. Créer un projet Supabase

1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Créez un nouveau projet
3. Notez votre **Project URL** et votre **anon/public key**

## 3. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet avec :

```env
VITE_SUPABASE_URL=votre-project-url
VITE_SUPABASE_ANON_KEY=votre-anon-key
```

**Important :** Ne commitez jamais le fichier `.env` (il est déjà dans `.gitignore`)

## 4. Utilisation dans votre code

### Exemple basique

```typescript
import { supabase } from './lib/supabase';

// Lire des données
const { data, error } = await supabase
  .from('oscars_data')
  .select('*')
  .eq('year', 2026);

// Insérer des données
const { data, error } = await supabase
  .from('oscars_data')
  .insert({ year: 2026, categories: [] });

// Mettre à jour des données
const { data, error } = await supabase
  .from('oscars_data')
  .update({ categories: newCategories })
  .eq('id', 'some-id');
```

### Utiliser les hooks personnalisés

```typescript
import { useSupabase } from './hooks/useSupabase';

function MyComponent() {
  const { data, loading, error } = useSupabase('oscars_data', { year: 2026 });
  
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}
```

## 5. Structure recommandée pour les données Oscars

Vous pouvez créer une table `oscars_data` avec cette structure :

```sql
CREATE TABLE oscars_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  categories JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 6. Authentification (optionnel)

Si vous voulez ajouter l'authentification :

```typescript
// Se connecter
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Se déconnecter
await supabase.auth.signOut();

// Obtenir l'utilisateur actuel
const { data: { user } } = await supabase.auth.getUser();
```

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide React + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
