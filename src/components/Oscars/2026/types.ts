/**
 * Types pour la structure 2026 (améliorée)
 */

export type ImageAsset = {
  path: string;
  alt?: string;
};

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
  title: string;
  poster?: ImageAsset;
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
    notes?: string;
  };
};

export type Category2026 = {
  id: string;
  name: string;
  nominees: Nominee2026[];
  winners: {
    my_choice?: string | null; // ID du nominee
    official?: string | null; // ID du nominee
  };
};

export type OscarsData2026 = {
  year: number;
  categories: Category2026[];
};
