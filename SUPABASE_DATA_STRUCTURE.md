# Structure de la Base de Données Oscars

## 📊 Vue d'ensemble

La base de données est organisée en plusieurs tables normalisées pour éviter la redondance et faciliter les requêtes.

## 🗂️ Tables principales

### 1. `oscars_years`
Gère les différentes années de cérémonies.

```sql
- id (UUID, PK)
- year (INTEGER, UNIQUE) - ex: 2026
- is_active (BOOLEAN)
- created_at, updated_at
```

### 2. `films`
Table normalisée pour tous les films (évite les doublons).

```sql
- id (UUID, PK)
- title (TEXT, UNIQUE) - ex: "Anora"
- release_year (INTEGER)
- poster_url (TEXT)
- trailer_url (TEXT)
- imdb_id (TEXT)
- letterboxd_url (TEXT)
```

**Pourquoi un ID plutôt que juste le titre ?**
- ✅ Évite les problèmes de casse/accents
- ✅ Permet de lier des métadonnées (IMDB, Letterboxd)
- ✅ Facilite les mises à jour (si un titre change)
- ✅ Meilleure performance pour les jointures

### 3. `people`
Table normalisée pour les acteurs, réalisateurs, etc.

```sql
- id (UUID, PK)
- name (TEXT, UNIQUE) - ex: "Yura Borisov"
- photo_urls (TEXT[]) - Array de photos
- imdb_id (TEXT)
```

### 4. `categories`
Les catégories de récompenses.

```sql
- id (UUID, PK)
- name (TEXT, UNIQUE) - ex: "Actor in a Supporting Role"
- display_order (INTEGER) - Ordre d'affichage
```

### 5. `nominations`
La table centrale qui lie tout ensemble.

```sql
- id (UUID, PK)
- year_id (UUID, FK → oscars_years)
- category_id (UUID, FK → categories)
- film_id (UUID, FK → films)
- person_id (UUID, FK → people, NULLABLE)
- crew (TEXT) - Pour les catégories techniques
- not_seen (BOOLEAN)
- is_my_winner (BOOLEAN)
- is_official_winner (BOOLEAN)
```

### 6. `votes`
Table pour enregistrer les votes des utilisateurs.

```sql
- id (UUID, PK)
- nomination_id (UUID, FK → nominations)
- voter_id (TEXT) - ID anonyme du votant
- created_at (TIMESTAMP)
- UNIQUE(nomination_id, voter_id) - Un vote par personne
```

### 7. `nomination_stats`
Statistiques calculées automatiquement.

```sql
- nomination_id (UUID, PK, FK → nominations)
- vote_count (INTEGER) - Nombre de votes
- last_updated (TIMESTAMP)
```

## 🎯 Champs supplémentaires proposés

### Pour les films :
- ✅ `release_year` - Année de sortie
- ✅ `poster_url` - URL de l'affiche
- ✅ `trailer_url` - URL de la bande-annonce
- ✅ `imdb_id` - ID IMDB pour lier les données
- ✅ `letterboxd_url` - Lien Letterboxd
- 💡 `rotten_tomatoes_score` - Score RT
- 💡 `metacritic_score` - Score Metacritic
- 💡 `box_office` - Box office
- 💡 `runtime` - Durée du film
- 💡 `genre` - Genre(s) du film

### Pour les personnes :
- ✅ `photo_urls` - Array de photos
- ✅ `imdb_id` - ID IMDB
- 💡 `birth_date` - Date de naissance
- 💡 `nationality` - Nationalité
- 💡 `biography` - Biographie

### Pour les nominations :
- ✅ `vote_count` - Nombre de votes (calculé automatiquement)
- ✅ `not_seen` - Film non vu
- ✅ `is_my_winner` / `is_official_winner` - Gagnants
- 💡 `prediction_confidence` - Niveau de confiance dans la prédiction
- 💡 `notes` - Notes personnelles
- 💡 `rank` - Classement personnel (1-5)

### Statistiques supplémentaires :
- 💡 `total_votes_by_category` - Total de votes par catégorie
- 💡 `vote_percentage` - Pourcentage de votes
- 💡 `trending` - Tendance (en hausse/baisse)
- 💡 `last_vote_time` - Dernier vote reçu

## 📝 Exemple d'utilisation

### Créer une nomination :

```typescript
await createNomination(2026, "Actor in a Supporting Role", {
  actor: "John Doe",
  film: "Example Film",
  photos: ["photo1.jpg", "photo2.jpg"]
});
```

### Ajouter un vote :

```typescript
await addVote(nominationId, voterId);
```

### Obtenir les données complètes :

```typescript
const data = await getOscarsDataByYear(2026);
```

## 🔄 Migration depuis JSON

Pour migrer vos données JSON existantes vers Supabase, vous pouvez :

1. Utiliser la fonction `createNomination()` pour chaque nominee
2. Ou créer un script de migration qui lit vos JSON et insère en masse

## 🚀 Avantages de cette structure

1. **Normalisation** : Pas de duplication de données
2. **Flexibilité** : Facile d'ajouter de nouvelles catégories/années
3. **Performance** : Index optimisés pour les requêtes fréquentes
4. **Statistiques** : Calcul automatique des votes
5. **Extensibilité** : Facile d'ajouter de nouveaux champs
