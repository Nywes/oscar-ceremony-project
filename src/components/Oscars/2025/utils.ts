export const getActorImagePathSync = (actorName: string | undefined, index: number = 0) => {
  if (!actorName) return undefined;

  const baseImagePath = `/actors/2025/${actorName
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')}`;

  const imagePath = index === 0 ? `${baseImagePath}.jpg` : `${baseImagePath}-${index}.jpg`;

  return imagePath;
};

export const getFilmImagePathSync = (
  filmName: string | undefined,
  validImagePaths: { [key: string]: boolean }
) => {
  if (!filmName || !validImagePaths[filmName]) return undefined;

  return `/films/2025/${filmName
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')}.jpg`;
};

export const isNotSeen = (film: string): boolean => {
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
  ].includes(film);
};

export const checkImageExists = (imagePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
};
