export interface Tree {
  id: string;
  userData: {
    userId: string;
    userName: string;
    avatar: string | null;
  };
  name: string; // Tree name - separate field
  species: string;
  speciesLatin: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    plotNumber: string | null;
    district: string | null;
    province: string | null;
    county: string | null;
    commune: string | null;
  };
  circumference: number; // Changed to double
  height: number; // Changed to double
  crownSpread: number; // Rozpiętość korony
  soil: string[] | null; // Array of soil tags
  health: string[] | null; // Array of health tags
  environment: string[] | null; // Array of environment tags
  isAlive: boolean;
  estimatedAge: number;
  description: string; // Plain description without special formatting
  legend: string; // Tree legend/stories - separate field
  imageUrls: string[];
  isMonument: boolean;
  treeScreenshotUrl: string; // Screenshot of the tree location on map
  status: string;
  submissionDate: string;
  approvalDate: string | null;
  votesCount: number; // Single vote count instead of like/dislike
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
  images: {
    imageUrl: string;
    type: 'Leaf' | 'Tree' | 'Bark' | 'Fruit' | 'Flower';
    altText: string;
  }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  registrationDate: string;
  role: string;
  statistics: {
    submissionCount: number;
    applicationCount: number;
  };
}


export interface ApiTreeSubmission {
  speciesId: string;
  name?: string; // Tree name - separate field
  location: {
    lat: number;
    lng: number;
    address: string;
    plotNumber?: string;
    district?: string;
    province?: string;
    county?: string;
    commune?: string;
  };
  circumference: number; // Changed to double
  height: number; // Changed to double
  soil?: string[]; // Array of soil tags
  health?: string[]; // Array of health tags
  environment?: string[]; // Array of environment tags
  isAlive?: boolean;
  estimatedAge: number;
  crownSpread: number; // Rozpiętość korony
  description?: string; // Plain description without special formatting
  legend?: string; // Tree legend/stories - separate field
  isMonument?: boolean;
}

export interface TreePost extends Tree {
  userVote?: 'like' | 'dislike' | null;
}

export interface Commune {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  isActive: boolean;
}

export interface ApplicationTemplate {
  id: string;
  communeId: string;
  name: string;
  description: string;
  htmlTemplate: string;
  fields: FormField[];
  isActive: boolean;
}

export interface Application {
  id: string;
  treeSubmissionId: string;
  applicationTemplateId: string;
  title: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  formData?: Record<string, any>;
}

export interface FormField {
  name: string;
  label: string;
  type: 'Text' | 'TextArea' | 'Phone' | 'Email' | 'Number' | 'Select' | 'Checkbox' | 'Date';
  isRequired: boolean;
  defaultValue?: any;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    validationMessage?: string;
  };
  helpText?: string;
  order: number;
}

export interface FormSchema {
  applicationId: string;
  applicationTemplateId: string;
  templateName: string;
  requiredFields: FormField[];
}

export interface ApplicationSubmission {
  formData: Record<string, any>;
}

export interface PdfResponse {
  pdfUrl: string;
}
