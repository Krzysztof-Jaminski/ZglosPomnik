export interface Tree {
  id: string;
  species: string;
  commonName: string;
  latitude: number;
  longitude: number;
  reportedBy: string;
  reportedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  photos: string[];
  municipalApplicationId?: string;
  pierśnica?: number; // pierśnica na wysokości 130 cm (w cm)
  height?: number; // wysokość drzewa (w metrach)
  plotNumber?: string; // numer działki (opcjonalny)
}

export interface TreeSpecies {
  id: string;
  scientificName: string;
  commonName: string;
  family: string;
  description: string;
  characteristics: {
    height: string;
    lifespan: string;
    leaves: string;
    bark: string;
  };
  habitat: string;
  conservationStatus: string;
  images: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ecologist' | 'citizen' | 'admin';
  registeredAt: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    language: string;
  };
}

export interface Comment {
  id: string;
  treeId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
}

export interface TreePost extends Tree {
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
  comments: Comment[];
  legendComment?: Comment;
}

export interface Municipality {
  id: string;
  name: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  ePuapInstructions: string;
}

export interface ApplicationTemplate {
  id: string;
  name: string;
  template: string;
}

export interface NewTreeReport {
  species: string;
  commonName: string;
  latitude: number;
  longitude: number;
  notes: string;
  photos: File[];
  pierśnica?: number; // pierśnica na wysokości 130 cm (w cm)
  height?: number; // wysokość drzewa (w metrach)
  plotNumber?: string; // numer działki (opcjonalny)
}