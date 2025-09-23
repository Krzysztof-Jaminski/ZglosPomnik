export interface Tree {
  id: string;
  userData: {
    userId: string;
    userName: string;
    avatar: string | null;
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
  estimatedAge: number;
  description: string;
  imageUrls: string[];
  isMonument: boolean;
  status: string;
  submissionDate: string;
  approvalDate: string | null;
  votes: {
    like: number;
    dislike: number;
  };
  commentCount: number;
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

export interface Comment {
  id: string;
  treeSubmissionId: string;
  treePolishName: string;
  userId: string; // ID of the user who created the comment
  userData: {
    userName: string;
    avatar: string;
  };
  content: string;
  datePosted: string;
  isLegend: boolean;
  votes: {
    like: number;
    dislike: number;
  };
  userVote?: 'like' | 'dislike' | null;
}

export interface ApiTreeSubmission {
  speciesId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  circumference: number;
  height: number;
  condition: string;
  isAlive?: boolean;
  estimatedAge: number;
  description?: string;
  isMonument?: boolean;
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
  municipalityId: string;
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
