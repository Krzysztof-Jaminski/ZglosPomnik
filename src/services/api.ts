import { Tree, Comment } from '../types';

// Mock data for development - updated to match new Tree interface
const mockTrees: Tree[] = [
  {
    id: '1',
    userData: {
      userName: 'Jan Kowalski',
      avatar: 'https://images.pexels.com/users/avatars/268385455/photo-dog-681.png?fit=crop&h=100&w=100'
    },
    species: 'Dąb szypułkowy',
    speciesLatin: 'Quercus robur',
    location: {
      lat: 52.237049,
      lng: 21.017532,
      address: 'Warszawa, ul. Krakowskie Przedmieście 1'
    },
    circumference: 350,
    height: 25,
    condition: 'good',
    isAlive: true,
    estimatedAge: 150,
    description: 'Piękny stary dąb w centrum miasta. Wartość historyczna i przyrodnicza.',
    images: ['https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg'],
    isMonument: true,
    status: 'Monument',
    submissionDate: '2024-01-15T10:30:00Z',
    approvalDate: '2024-01-20T14:00:00Z',
    votes: {
      like: 15,
      dislike: 2
    }
  },
  {
    id: '2',
    userData: {
      userName: 'Anna Nowak',
      avatar: 'https://images.pexels.com/users/avatars/268385456/photo-cat-682.png?fit=crop&h=100&w=100'
    },
    species: 'Lipa drobnolistna',
    speciesLatin: 'Tilia cordata',
    location: {
      lat: 52.239049,
      lng: 21.019532,
      address: 'Warszawa, ul. Nowy Świat 5'
    },
    circumference: 280,
    height: 20,
    condition: 'good',
    isAlive: true,
    estimatedAge: 120,
    description: 'Stara lipa przy ulicy Nowy Świat. Drzewo o dużej wartości przyrodniczej.',
    images: ['https://images.pexels.com/photos/268534/pexels-photo-268534.jpeg'],
    isMonument: false,
    status: 'pending',
    submissionDate: '2024-01-20T09:15:00Z',
    approvalDate: '',
    votes: {
      like: 8,
      dislike: 1
    }
  },
  {
    id: '3',
    userData: {
      userName: 'Piotr Wiśniewski',
      avatar: 'https://images.pexels.com/users/avatars/268385457/photo-bird-683.png?fit=crop&h=100&w=100'
    },
    species: 'Klon pospolity',
    speciesLatin: 'Acer platanoides',
    location: {
      lat: 52.241049,
      lng: 21.021532,
      address: 'Warszawa, ul. Marszałkowska 10'
    },
    circumference: 200,
    height: 18,
    condition: 'average',
    isAlive: true,
    estimatedAge: 80,
    description: 'Klon w centrum Warszawy. Wymaga ochrony ze względu na lokalizację.',
    images: ['https://images.pexels.com/photos/268535/pexels-photo-268535.jpeg'],
    isMonument: false,
    status: 'rejected',
    submissionDate: '2024-01-25T16:45:00Z',
    approvalDate: '',
    votes: {
      like: 3,
      dislike: 5
    }
  }
];

const mockComments: Comment[] = [
  {
    id: 'comment-1',
    treeSubmissionId: '1',
    treePolishName: 'Dąb szypułkowy',
    userData: {
      userName: 'Miłośnik Drzew',
      avatar: 'https://ui-avatars.com/api/?name=Tree&background=10b981&color=fff'
    },
    content: 'Piękny dąb! Z pewnością zasługuje na status pomnika przyrody. Widzę go codziennie w drodze do pracy.',
    datePosted: '2024-01-16T10:30:00Z',
    isLegend: true,
    votes: {
      like: 12,
      dislike: 0
    }
  },
  {
    id: 'comment-2',
    treeSubmissionId: '1',
    treePolishName: 'Dąb szypułkowy',
    userData: {
      userName: 'Eko Aktywista',
      avatar: 'https://ui-avatars.com/api/?name=Eco&background=10b981&color=fff'
    },
    content: 'To drzewo to prawdziwa perła naszego miasta. Musimy je chronić!',
    datePosted: '2024-01-17T14:20:00Z',
    isLegend: false,
    votes: {
      like: 8,
      dislike: 1
    }
  },
  {
    id: 'comment-3',
    treeSubmissionId: '2',
    treePolishName: 'Lipa drobnolistna',
    userData: {
      userName: 'Przyrodnik',
      avatar: 'https://ui-avatars.com/api/?name=Nature&background=10b981&color=fff'
    },
    content: 'Lipa wygląda bardzo dobrze. Warto rozważyć nadanie statusu pomnika przyrody.',
    datePosted: '2024-01-21T09:15:00Z',
    isLegend: false,
    votes: {
      like: 5,
      dislike: 0
    }
  },
  {
    id: 'comment-4',
    treeSubmissionId: '2',
    treePolishName: 'Lipa drobnolistna',
    userData: {
      userName: 'Mieszkaniec',
      avatar: 'https://ui-avatars.com/api/?name=Resident&background=10b981&color=fff'
    },
    content: 'To drzewo daje mi cień w upalne dni. Bardzo je lubię!',
    datePosted: '2024-01-22T16:30:00Z',
    isLegend: false,
    votes: {
      like: 3,
      dislike: 0
    }
  }
];

const mockApplications = [
  {
    id: '1',
    treeId: '1',
    applicantName: 'Jan Kowalski',
    applicantEmail: 'jan@example.com',
    species: 'Quercus robur',
    commonName: 'Dąb szypułkowy',
    latitude: 52.237049,
    longitude: 21.017532,
    submittedAt: '2024-01-15T10:30:00Z',
    status: 'pending',
    notes: 'Piękny stary dąb w centrum miasta',
    photos: ['https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg']
  },
  {
    id: '2',
    treeId: '2',
    applicantName: 'Anna Nowak',
    applicantEmail: 'anna@example.com',
    species: 'Acer platanoides',
    commonName: 'Klon zwyczajny',
    latitude: 52.240049,
    longitude: 21.020532,
    submittedAt: '2024-01-14T14:20:00Z',
    status: 'approved',
    notes: 'Młody klon przy ulicy',
    photos: ['https://images.pexels.com/photos/1172675/pexels-photo-1172675.jpeg']
  }
];

const mockSpecies = [
  {
    id: '1',
    scientificName: 'Quercus robur',
    commonName: 'Dąb szypułkowy',
    family: 'Fagaceae',
    description: 'Majestatyczne drzewo liściaste o charakterystycznych klapowanych liściach',
    images: ['https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg'],
    characteristics: {
      height: '25-40m',
      lifespan: '500-1000 lat',
      leaves: 'Klapowane, głęboko wcięte',
      bark: 'Szara, głęboko bruzdowana'
    },
    habitat: 'Lasy liściaste, parki',
    conservationStatus: 'Stabilny'
  },
  {
    id: '2',
    scientificName: 'Acer platanoides',
    commonName: 'Klon zwyczajny',
    family: 'Sapindaceae',
    description: 'Popularne drzewo ozdobne o pięknych jesiennych barwach',
    images: ['https://images.pexels.com/photos/1172675/pexels-photo-1172675.jpeg'],
    characteristics: {
      height: '20-30m',
      lifespan: '150-200 lat',
      leaves: 'Dłoniaste, 5-klapowe',
      bark: 'Szaro-brązowa, gładka'
    },
    habitat: 'Parki, aleje, lasy mieszane',
    conservationStatus: 'Stabilny'
  },
  {
    id: '3',
    scientificName: 'Betula pendula',
    commonName: 'Brzoza brodawkowata',
    family: 'Betulaceae',
    description: 'Charakterystyczne drzewo o białej korze i zwisających gałązkach',
    images: ['https://images.pexels.com/photos/1172675/pexels-photo-1172675.jpeg'],
    characteristics: {
      height: '15-25m',
      lifespan: '80-120 lat',
      leaves: 'Rombowate, ząbkowane',
      bark: 'Biała, papierowata'
    },
    habitat: 'Lasy, tereny podmokłe',
    conservationStatus: 'Stabilny'
  },
  {
    id: '4',
    scientificName: 'Pinus sylvestris',
    commonName: 'Sosna zwyczajna',
    family: 'Pinaceae',
    description: 'Wiecznie zielone drzewo iglaste o charakterystycznej korze',
    images: ['https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg'],
    characteristics: {
      height: '20-35m',
      lifespan: '200-400 lat',
      leaves: 'Igły w parach, niebiesko-zielone',
      bark: 'Pomarańczowo-czerwona u góry'
    },
    habitat: 'Lasy iglaste, bory',
    conservationStatus: 'Stabilny'
  }
];

const mockApplicationTemplates = [
  {
    id: '1',
    name: 'Wniosek o wpisanie drzewa do rejestru pomników przyrody',
    description: 'Standardowy wniosek do gminy o wpisanie drzewa do rejestru pomników przyrody',
    template: 'Szanowni Państwo,\n\nniniejszym składam wniosek o wpisanie drzewa do rejestru pomników przyrody...'
  },
  {
    id: '2',
    name: 'Zgłoszenie drzewa zabytkowego',
    description: 'Wniosek o uznanie drzewa za zabytek przyrody',
    template: 'Do Urzędu Gminy,\n\nzgłaszam drzewo o szczególnych walorach przyrodniczych...'
  },
  {
    id: '3',
    name: 'Wniosek o ochronę drzewa',
    description: 'Wniosek o objęcie drzewa ochroną prawną',
    template: 'Szanowni Państwo,\n\nwnoszę o objęcie ochroną prawną drzewa...'
  }
];

const mockMunicipalities = [
  {
    id: '1',
    name: 'Gmina Warszawa',
    contact: {
      email: 'pomniki@warszawa.pl',
      phone: '+48 22 123 45 67',
      address: 'ul. Przykładowa 1, 00-001 Warszawa'
    },
    ePuapInstructions: 'Aby wysłać wniosek przez ePUAP: 1. Zaloguj się na platformie ePUAP, 2. Wybierz "Urząd Miasta Warszawy", 3. Znajdź usługę "Pomniki przyrody", 4. Wypełnij formularz i załącz wygenerowany wniosek'
  }
];

export const api = {
  // Trees
  async getTrees(): Promise<Tree[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTrees;
  },

  async getTree(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTrees.find(tree => tree.id === id) || null;
  },

  async createTree(treeData: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newTree = {
      id: Date.now().toString(),
      ...treeData,
      reportedBy: 'current-user',
      reportedAt: new Date().toISOString(),
      status: 'pending'
    };
    mockTrees.push(newTree);
    return newTree;
  },

  async addTree(treeData: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newTree = {
      id: Date.now().toString(),
      ...treeData,
      reportedBy: 'current-user',
      reportedAt: new Date().toISOString(),
      status: 'pending'
    };
    mockTrees.push(newTree);
    return newTree;
  },

  async updateTree(id: string, updates: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTrees.findIndex(tree => tree.id === id);
    if (index !== -1) {
      mockTrees[index] = { ...mockTrees[index], ...updates };
      return mockTrees[index];
    }
    throw new Error('Tree not found');
  },

  async deleteTree(id: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTrees.findIndex(tree => tree.id === id);
    if (index !== -1) {
      mockTrees.splice(index, 1);
      return true;
    }
    throw new Error('Tree not found');
  },

  // Applications
  async getApplications() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockApplications;
  },

  async getApplication(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockApplications.find(app => app.id === id) || null;
  },

  async createApplication(applicationData: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newApplication = {
      id: Date.now().toString(),
      ...applicationData,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    mockApplications.push(newApplication);
    return newApplication;
  },

  async updateApplication(id: string, updates: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockApplications.findIndex(app => app.id === id);
    if (index !== -1) {
      mockApplications[index] = { ...mockApplications[index], ...updates };
      return mockApplications[index];
    }
    throw new Error('Application not found');
  },

  async deleteApplication(id: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockApplications.findIndex(app => app.id === id);
    if (index !== -1) {
      mockApplications.splice(index, 1);
      return true;
    }
    throw new Error('Application not found');
  },

  // Species
  async getSpecies() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSpecies;
  },

  // Application Templates
  async getApplicationTemplates() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockApplicationTemplates;
  },

  async generateApplication(treeId: string, templateId: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const tree = mockTrees.find(t => t.id === treeId);
    const template = mockApplicationTemplates.find(t => t.id === templateId);
    
    if (!tree || !template) {
      throw new Error('Tree or template not found');
    }

    return `${template.template}

DANE DRZEWA:
Gatunek: ${tree.species} (${tree.speciesLatin})
Lokalizacja: ${tree.location.lat}, ${tree.location.lng}
Adres: ${tree.location.address}
Data zgłoszenia: ${new Date(tree.submissionDate).toLocaleDateString('pl-PL')}
Opis: ${tree.description}

Z poważaniem,
[Imię i nazwisko]`;
  },

  // Municipalities
  async getMunicipalities() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMunicipalities;
  },

  // User authentication - DEPRECATED: Use authService instead
  async login(email: string, password: string) {
    console.warn('api.login is deprecated. Use authService.login instead.');
    const { authService } = await import('./authService');
    return authService.login({ email, password });
  },

  async register(userData: any) {
    console.warn('api.register is deprecated. Use authService.register instead.');
    const { authService } = await import('./authService');
    return authService.register(userData);
  },

  async getCurrentUser() {
    console.warn('api.getCurrentUser is deprecated. Use authService.getCurrentUser instead.');
    const { authService } = await import('./authService');
    return authService.getCurrentUser();
  },

  // Comments
  async getComments() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockComments;
  },

  // File upload
  async uploadPhoto(_file: File) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Mock photo upload - return a placeholder URL
    return `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg`;
  }
};