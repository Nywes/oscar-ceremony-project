/**
 * Types pour la structure 2026 (améliorée)
 */

export type Lang = 'en' | 'fr';

export type Translatable = { en: string; fr: string } | string;

export type ImageAsset = {
  path: string;
  alt?: string;
};

export type TranslatableImageAsset = {
  en: ImageAsset;
  fr?: ImageAsset;
} | ImageAsset;

export type Person = {
  id: string;
  name: string;
  images: {
    primary: ImageAsset;
    secondary?: ImageAsset;
    additional?: ImageAsset[];
  };
};

export type Film = {
  id: string;
  title: Translatable;
  poster?: TranslatableImageAsset;
  trailer?: string;
};

export type CrewMember = {
  id: string;
  name: string;
  role?: string;
};

export type Nominee2026 = {
  id: string;
  film: Film;
  person?: Person;
  crew?: CrewMember[];
  metadata?: {
    notSeen?: boolean;
    notes?: Translatable;
    songTitle?: string;
  };
};

export type Category2026 = {
  id: string;
  name: Translatable;
  nominees: Nominee2026[];
  winners: {
    my_choice?: string | null;
    official?: string | null;
  };
};

export type OscarsData2026 = {
  year: number;
  categories: Category2026[];
};
