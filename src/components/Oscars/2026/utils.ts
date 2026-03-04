import type { Nominee2026, Category2026, Translatable, TranslatableImageAsset, ImageAsset, Lang } from './types';
import { getNomineeImages } from '../data-adapter';

export const t = (value: Translatable, lang: Lang): string => {
  if (typeof value === 'string') return value;
  return value[lang] || value['en'];
};

export const tImage = (value: TranslatableImageAsset | undefined, lang: Lang): ImageAsset | undefined => {
  if (!value) return undefined;
  if ('path' in value) return value as ImageAsset;
  return value[lang] || value['en'];
};

const sanitizeActorName = (name: string) =>
  name
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const sanitizeFilmTitle = (title: string) =>
  title
    .replace(/:\s*/g, '-')
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const getActorImagePathSync = (actorName: string | undefined, index: number = 0) => {
  if (!actorName) return undefined;
  const base = `/actors/2026/${sanitizeActorName(actorName)}`;
  return index === 0 ? `${base}.jpg` : `${base}-${index}.jpg`;
};

export const getFilmImagePathSync = (
  filmName: string | undefined,
  validImagePaths: { [key: string]: boolean }
) => {
  if (!filmName || !validImagePaths[filmName]) return undefined;
  return `/films/2026/${sanitizeFilmTitle(filmName)}.jpg`;
};

export const isNotSeen = (filmTitle: string): boolean => {
  return [
    'A Real Pain',
    'The Apprentice',
    'Sing Sing',
    'Gladiator II',
    'A Different Man',
    'Elton John: Never Too Late',
    'The Six Triple Eight',
    'Better Man',
    'September 5',
    'The Girl with the Needle',
    'The Seed of the Sacred Fig',
    'Memoir of a Snail',
    'Wallace & Gromit',
    'Like a Bird',
    'Never Too Late',
    'The Journey',
    'Maria',
  ].includes(filmTitle);
};

export const checkImageExists = (imagePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
};

export const getNomineeImagePaths = (nominee: Nominee2026): string[] => {
  return getNomineeImages(nominee);
};

/**
 * Collects every image URL referenced in the data so we can preload them all.
 * Includes: actor primary + secondary, film posters (generated path), explicit poster paths (EN + FR).
 */
export const collectAllImageUrls = (categories: Category2026[]): string[] => {
  const urls = new Set<string>();

  categories.forEach((category) => {
    category.nominees.forEach((nominee) => {
      if (nominee.person) {
        const primary = getActorImagePathSync(nominee.person.name, 0);
        const secondary = getActorImagePathSync(nominee.person.name, 1);
        if (primary) urls.add(primary);
        if (secondary) urls.add(secondary);
      }

      const enTitle = t(nominee.film.title, 'en');
      urls.add(`/films/2026/${sanitizeFilmTitle(enTitle)}.jpg`);

      if (nominee.film.poster) {
        const enAsset = tImage(nominee.film.poster, 'en');
        const frAsset = tImage(nominee.film.poster, 'fr');
        if (enAsset?.path) urls.add(enAsset.path);
        if (frAsset?.path) urls.add(frAsset.path);
      }
    });
  });

  return Array.from(urls);
};

/**
 * Preloads images into the browser cache with concurrency control.
 * Returns a map of url -> exists (true/false).
 */
export const preloadAllImages = (
  urls: string[],
  concurrency = 8,
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, boolean>> => {
  const results = new Map<string, boolean>();
  let nextIndex = 0;
  let loaded = 0;
  const total = urls.length;

  const loadNext = (): Promise<void> => {
    if (nextIndex >= total) return Promise.resolve();
    const url = urls[nextIndex++];
    return checkImageExists(url).then((exists) => {
      results.set(url, exists);
      loaded++;
      onProgress?.(loaded, total);
      return loadNext();
    });
  };

  const workers = Array.from(
    { length: Math.min(concurrency, total) },
    () => loadNext()
  );

  return Promise.all(workers).then(() => results);
};
