export type Nominee = {
  actor?: string;
  film: string;
  crew?: string;
  notSeen?: boolean;
  trailer?: string;
  photos?: string[];
};

export type Category = {
  name: string;
  nominees: Nominee[];
  my_winner: Nominee | null;
  official_winner: Nominee | null;
};

export type OscarsData = {
  year: number;
  categories: Category[];
};
