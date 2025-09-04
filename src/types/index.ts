export interface Tree {
  id: string;
  userData: {
    userName: string;
    avatar: string;
  };
  species: string;
  speciesLatin: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  circumference: number;
  height: number;
  condition: string;
  isAlive: boolean;
  estimatedAge: number | null;
  description: string;
  images: string[];
  isMonument: boolean;
  status: string;
  submissionDate: string;
  approvalDate: string;
  votes: {
    approve: number;
    reject: number;
  };
}

export interface Species {
  id: string;
  polishName: string;
  latinName: string;
  family: string;
  description: string;
  identificationGuide: string[];
  seasonalChanges: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
  images: {
    imageUrl: string;
    type: 'Leaf' | 'Tree' | 'Bark' | 'Fruit' | 'Flower';
    altText: string;
  }[];
  traits: {
    maxHeight: number;
    lifespan: string;
    nativeToPoland: boolean;
  };
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
  email: string;
  name: string;
  avatar: string;
  registrationDate: string;
  submissionsCount: number;
  verificationsCount: number;
}

export interface Comment {
  id: string;
  userData: {
    userName: string;
    avatar: string;
  };
  content: string;
  datePosted: string;
  isLegend: boolean;
  likesCount: number;
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