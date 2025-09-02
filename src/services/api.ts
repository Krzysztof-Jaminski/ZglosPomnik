import { Tree } from '../types';

// Mock data for development
const mockTrees = [
  {
    id: '1',
    species: 'Quercus robur',
    commonName: 'Dąb szypułkowy',
    latitude: 52.237049,
    longitude: 21.017532,
    reportedBy: 'current-user',
    reportedAt: '2024-01-15T10:30:00Z',
    status: 'approved',
    notes: 'Piękny stary dąb w centrum miasta',
    photos: ['https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg']
  },
  {
    id: '2',
    species: 'Acer platanoides',
    commonName: 'Klon zwyczajny',
    latitude: 52.240049,
    longitude: 21.020532,
    reportedBy: 'other-user',
    reportedAt: '2024-01-14T14:20:00Z',
    status: 'pending',
    notes: 'Młody klon przy ulicy',
    photos: ['https://images.pexels.com/photos/1172675/pexels-photo-1172675.jpeg']
  },
  {
    id: '3',
    species: 'Betula pendula',
    commonName: 'Brzoza brodawkowata',
    latitude: 52.234049,
    longitude: 21.014532,
    reportedBy: 'current-user',
    reportedAt: '2024-01-13T09:15:00Z',
    status: 'approved',
    notes: 'Charakterystyczna brzoza z białą korą',
    photos: ['https://images.pexels.com/photos/1172675/pexels-photo-1172675.jpeg']
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
    return mockTrees as Tree[];
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
Gatunek: ${tree.species} (${tree.commonName})
Lokalizacja: ${tree.latitude}, ${tree.longitude}
Data zgłoszenia: ${new Date(tree.reportedAt).toLocaleDateString('pl-PL')}
Opis: ${tree.notes}

Z poważaniem,
[Imię i nazwisko]`;
  },

  // Municipalities
  async getMunicipalities() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMunicipalities;
  },

  // User authentication
  async login(email: string, password: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email === 'admin@example.com' && password === 'admin') {
      return {
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Administrator',
          role: 'admin'
        },
        token: 'mock-admin-token'
      };
    }
    if (email === 'user@example.com' && password === 'user') {
      return {
        user: {
          id: '2',
          email: 'user@example.com',
          name: 'Jan Kowalski',
          role: 'user'
        },
        token: 'mock-user-token'
      };
    }
    throw new Error('Invalid credentials');
  },

  async register(userData: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      user: {
        id: Date.now().toString(),
        ...userData,
        role: 'user'
      },
      token: 'mock-token'
    };
  },

  async getCurrentUser() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: '2',
      email: 'user@example.com',
      name: 'Jan Kowalski',
      role: 'user'
    };
  },

  // File upload
  async uploadPhoto(file: File) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Mock photo upload - return a placeholder URL
    return `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg`;
  }
};