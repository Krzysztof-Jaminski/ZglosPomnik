import { Application, ApplicationTemplate, FormSchema, ApplicationSubmission, PdfResponse, Tree, Commune } from '../types';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Create headers with authorization
const createHeaders = (): HeadersInit => {
  const token = getAuthToken();
  console.log('Auth token found:', token ? 'yes' : 'no');
  if (token) {
    console.log('Token length:', token.length);
  }
  return {
    'Content-Type': 'application/json',
    'accept': '*/*',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};


export const applicationsService = {
  // Get all user's trees (first step)
  async getUserTrees(): Promise<Tree[]> {
    console.log('API Call: GET /api/Trees/user');
    const response = await fetch(`${API_BASE_URL}/Trees/user`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Brak autoryzacji. Zaloguj się ponownie.');
      }
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to fetch user trees: ${errorText}`);
    }
    
    return response.json();
  },

  // Get all trees from the application (auth required)
  async getAllTrees(): Promise<Tree[]> {
    console.log('API Call: GET /api/Trees');
    const response = await fetch(`${API_BASE_URL}/Trees`, {
      method: 'GET',
      headers: createHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Brak autoryzacji. Zaloguj się ponownie.');
      }
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to fetch all trees: ${errorText}`);
    }

    const allTrees = await response.json();
    
    // Filter out trees that are already monuments (status !== 'monument')
    const availableTrees = allTrees.filter((tree: Tree) => tree.status !== 'monument');
    
    console.log(`Total trees: ${allTrees.length}, Available for application: ${availableTrees.length}`);
    
    return availableTrees;
  },

  // Get all user's applications
  async getUserApplications(): Promise<Application[]> {
    console.log('API Call: GET /api/Applications');
    const response = await fetch(`${API_BASE_URL}/Applications`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get all communes (auth required)
  async getCommunes(): Promise<Commune[]> {
    console.log('API Call: GET /api/Communes');
    const response = await fetch(`${API_BASE_URL}/Communes`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Brak autoryzacji. Zaloguj się ponownie.');
      }
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to fetch communes: ${errorText}`);
    }
    
    return response.json();
  },

  // Get all commune templates
  async getCommuneTemplates(communeId: string): Promise<ApplicationTemplate[]> {
    console.log(`API Call: GET /api/ApplicationTemplates/commune/${communeId}`);
    console.log('Commune ID:', communeId);
    
    const response = await fetch(`${API_BASE_URL}/ApplicationTemplates/commune/${communeId}`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Brak autoryzacji. Zaloguj się ponownie.');
      }
      
      if (response.status === 400) {
        const errorText = await response.text().catch(() => response.statusText);
        console.error('400 Bad Request details:', errorText);
        throw new Error(`Nieprawidłowe żądanie dla gminy ${communeId}: ${errorText}`);
      }
      
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to fetch templates: ${errorText}`);
    }
    
    return response.json();
  },

  // Create application
  async createApplication(templateId: string, treeSubmissionId: string, title: string): Promise<Application> {
    console.log('API Call: POST /api/Applications');
    console.log('Template ID:', templateId);
    console.log('Tree Submission ID:', treeSubmissionId);
    console.log('Title:', title);
    
    const requestBody = {
      treeSubmissionId,
      applicationTemplateId: templateId,
      title
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/Applications`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create application: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get form schema for application
  async getFormSchema(applicationId: string): Promise<FormSchema> {
    console.log(`API Call: GET /api/Applications/${applicationId}/form-schema`);
    const response = await fetch(`${API_BASE_URL}/Applications/${applicationId}/form-schema`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch form schema: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Submit application
  async submitApplication(applicationId: string, submission: ApplicationSubmission): Promise<void> {
    console.log(`API Call: POST /api/Applications/${applicationId}/submit`);
    console.log('Submission data:', submission);
    
    const response = await fetch(`${API_BASE_URL}/Applications/${applicationId}/submit`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(submission)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to submit application: ${response.statusText}`);
    }
  },

  // Generate PDF
  async generatePdf(applicationId: string): Promise<PdfResponse> {
    console.log(`API Call: POST /api/Applications/${applicationId}/generate-pdf`);
    const response = await fetch(`${API_BASE_URL}/Applications/${applicationId}/generate-pdf`, {
      method: 'POST',
      headers: createHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Generate justification description for tree using backend AI (Gemini)
  async generateJustification(treeId: string): Promise<string> {
    console.log(`API Call: GET /api/Gemini/tree/${treeId}/justification`);
    const response = await fetch(`${API_BASE_URL}/Gemini/tree/${treeId}/justification`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to generate justification: ${errorText}`);
    }
    
    // API returns plain text, not JSON
    const justificationText = await response.text();
    return justificationText;
  }
};

