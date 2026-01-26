/**
 * Adaptateur pour convertir la nouvelle structure 2026 vers l'ancienne structure
 * pour maintenir la compatibilité avec le code existant
 */

import type { OscarsData2026, Nominee2026, Category2026 } from './types-2026';
import type { OscarsData, Nominee, Category } from './types';

/**
 * Convertit un nominee 2026 vers l'ancien format
 */
function adaptNominee2026(nominee: Nominee2026): Nominee {
  const adapted: Nominee = {
    film: nominee.film.title,
  };

  // Ajouter la personne si elle existe
  if (nominee.person) {
    adapted.actor = nominee.person.name;
    adapted.photos = [
      nominee.person.images.primary.path,
      ...(nominee.person.images.secondary ? [nominee.person.images.secondary.path] : []),
      ...(nominee.person.images.additional?.map((img) => img.path) || []),
    ];
  }

  // Ajouter l'équipe technique si elle existe
  if (nominee.crew && nominee.crew.length > 0) {
    adapted.crew = nominee.crew.map((c) => (c.role ? `${c.name} (${c.role})` : c.name)).join(', ');
  }

  // Ajouter le trailer si disponible
  if (nominee.film.trailer) {
    adapted.trailer = nominee.film.trailer;
  }

  // Ajouter les métadonnées
  if (nominee.metadata?.notSeen) {
    adapted.notSeen = true;
  }

  return adapted;
}

/**
 * Convertit une catégorie 2026 vers l'ancien format
 */
function adaptCategory2026(category: Category2026): Category {
  const adapted: Category = {
    name: category.name,
    nominees: category.nominees.map(adaptNominee2026),
    my_winner: null,
    official_winner: null,
  };

  // Trouver le gagnant "my_choice"
  if (category.winners.my_choice) {
    const myWinnerNominee = category.nominees.find((n) => n.id === category.winners.my_choice);
    if (myWinnerNominee) {
      adapted.my_winner = adaptNominee2026(myWinnerNominee);
    }
  }

  // Trouver le gagnant officiel
  if (category.winners.official) {
    const officialWinnerNominee = category.nominees.find(
      (n) => n.id === category.winners.official
    );
    if (officialWinnerNominee) {
      adapted.official_winner = adaptNominee2026(officialWinnerNominee);
    }
  }

  return adapted;
}

/**
 * Convertit les données Oscars 2026 vers l'ancien format
 */
export function adaptOscarsData2026(data2026: OscarsData2026): OscarsData {
  return {
    year: data2026.year,
    categories: data2026.categories.map(adaptCategory2026),
  };
}

/**
 * Helper pour extraire toutes les images d'un nominee
 */
export function getNomineeImages(nominee: Nominee2026): string[] {
  const images: string[] = [];

  if (nominee.person?.images) {
    images.push(nominee.person.images.primary.path);
    if (nominee.person.images.secondary) {
      images.push(nominee.person.images.secondary.path);
    }
    if (nominee.person.images.additional) {
      images.push(...nominee.person.images.additional.map((img) => img.path));
    }
  }

  return images;
}

/**
 * Helper pour obtenir l'image principale d'un nominee
 */
export function getNomineePrimaryImage(nominee: Nominee2026): string | undefined {
  if (nominee.person?.images?.primary) {
    return nominee.person.images.primary.path;
  }
  if (nominee.film.poster) {
    return nominee.film.poster.path;
  }
  return undefined;
}
