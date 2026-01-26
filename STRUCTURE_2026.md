# Nouvelle Structure JSON pour 2026

## 🎯 Améliorations apportées

### 1. **Structure modulaire et organisée**

**Avant (2025) :**
```json
{
  "actor": "Yura Borisov",
  "film": "Anora",
  "photos": ["Yura-Borisov.jpg", "Yura-Borisov-1.jpg"]
}
```

**Après (2026) :**
```json
{
  "id": "nominee-001",
  "film": {
    "id": "film-001",
    "title": "The Midnight Train",
    "poster": {
      "path": "/films/The-Midnight-Train.jpg",
      "alt": "The Midnight Train poster"
    }
  },
  "person": {
    "id": "person-001",
    "name": "Alexandre Dubois",
    "images": {
      "primary": {
        "path": "/actors/Alexandre-Dubois.jpg",
        "alt": "Alexandre Dubois"
      },
      "secondary": {
        "path": "/actors/Alexandre-Dubois-1.jpg",
        "alt": "Alexandre Dubois - alternate"
      }
    }
  }
}
```

### 2. **Avantages de la nouvelle structure**

✅ **IDs uniques** : Chaque élément a un ID pour faciliter les références
✅ **Séparation claire** : Films, personnes et équipes sont séparés
✅ **Images structurées** : `primary`, `secondary`, `additional` au lieu d'un simple array
✅ **Métadonnées** : Section dédiée pour `notSeen`, `notes`, etc.
✅ **Accessibilité** : Chaque image a un `alt` text
✅ **Extensibilité** : Facile d'ajouter de nouveaux champs

### 3. **Structure des images**

**Avant :**
```json
"photos": ["photo1.jpg", "photo2.jpg"]
```

**Après :**
```json
"images": {
  "primary": {
    "path": "/actors/name.jpg",
    "alt": "Description"
  },
  "secondary": {
    "path": "/actors/name-1.jpg",
    "alt": "Description alternate"
  },
  "additional": [
    { "path": "/actors/name-2.jpg", "alt": "..." }
  ]
}
```

### 4. **Gestion des gagnants**

**Avant :**
```json
"my_winner": {
  "actor": "Yura Borisov",
  "film": "Anora"
}
```

**Après :**
```json
"winners": {
  "my_choice": "nominee-001",
  "official": null
}
```

Plus simple et référencé par ID !

### 5. **Catégories avec IDs**

Chaque catégorie a maintenant un ID unique :
- `"actor-supporting-role"`
- `"best-picture"`
- `"directing"`
- etc.

## 🔄 Compatibilité

Un **adaptateur automatique** (`data-adapter.ts`) convertit la nouvelle structure 2026 vers l'ancienne structure pour maintenir la compatibilité avec le code existant. Le code fonctionne sans modification !

## 📝 Exemple complet

```json
{
  "id": "nominee-001",
  "film": {
    "id": "film-001",
    "title": "The Midnight Train",
    "poster": {
      "path": "/films/The-Midnight-Train.jpg",
      "alt": "The Midnight Train poster"
    },
    "trailer": "https://youtube.com/..."
  },
  "person": {
    "id": "person-001",
    "name": "Alexandre Dubois",
    "images": {
      "primary": {
        "path": "/actors/Alexandre-Dubois.jpg",
        "alt": "Alexandre Dubois"
      },
      "secondary": {
        "path": "/actors/Alexandre-Dubois-1.jpg",
        "alt": "Alexandre Dubois - alternate"
      }
    }
  },
  "metadata": {
    "notSeen": false,
    "notes": "Performance remarquable"
  }
}
```

## 🚀 Prochaines étapes

1. Remplir les autres catégories avec la nouvelle structure
2. Utiliser cette structure pour Supabase (elle correspond mieux au schéma DB)
3. Profiter de la flexibilité pour ajouter de nouvelles métadonnées
