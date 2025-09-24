import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, CheckCircle, ArrowLeft, ArrowRight, Plus, Loader2, X } from 'lucide-react';
import { Tree, ApplicationTemplate, Municipality, Application, FormSchema } from '../types';
import { applicationsService } from '../services/applicationsService';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from '../components/UI/GlassButton';
import { DynamicForm } from '../components/Applications/DynamicForm';
import { TemplateSelector } from '../components/Applications/TemplateSelector';
import { TreeSelector } from '../components/Applications/TreeSelector';
import { MunicipalitySelector } from '../components/Applications/MunicipalitySelector';
import { useAuth } from '../context/AuthContext';

type ApplicationStep = 'overview' | 'select-tree' | 'select-municipality' | 'select-template' | 'fill-form' | 'submitted' | 'completed';



export const ApplicationsPage: React.FC = () => {
  const { isAuthenticated, handleAuthError } = useAuth();
  const [currentStep, setCurrentStep] = useState<ApplicationStep>(() => {
    // Initialize from localStorage if available
    const savedStep = localStorage.getItem('applicationStep');
    if (savedStep) {
      const validSteps: ApplicationStep[] = ['overview', 'select-tree', 'select-municipality', 'select-template', 'fill-form', 'submitted', 'completed'];
      if (validSteps.includes(savedStep as ApplicationStep)) {
        console.log('Initializing step from localStorage:', savedStep);
        return savedStep as ApplicationStep;
      }
    }
    return 'overview';
  });
  const [trees, setTrees] = useState<Tree[]>([]);
  const [templates, setTemplates] = useState<ApplicationTemplate[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(() => {
    const savedTree = localStorage.getItem('selectedTree');
    if (savedTree) {
      try {
        return JSON.parse(savedTree);
      } catch (error) {
        console.error('Error parsing saved tree:', error);
      }
    }
    return null;
  });
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(() => {
    const savedMunicipality = localStorage.getItem('selectedMunicipality');
    if (savedMunicipality) {
      try {
        return JSON.parse(savedMunicipality);
      } catch (error) {
        console.error('Error parsing saved municipality:', error);
      }
    }
    return null;
  });
  const [selectedTemplate, setSelectedTemplate] = useState<ApplicationTemplate | null>(() => {
    const savedTemplate = localStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      try {
        return JSON.parse(savedTemplate);
      } catch (error) {
        console.error('Error parsing saved template:', error);
      }
    }
    return null;
  });
  const [currentApplication, setCurrentApplication] = useState<Application | null>(() => {
    // Try to restore application from localStorage
    const savedApplication = localStorage.getItem('currentApplication');
    if (savedApplication) {
      try {
        return JSON.parse(savedApplication);
      } catch (error) {
        console.error('Error parsing saved application:', error);
      }
    }
    return null;
  });
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showAllTrees, setShowAllTrees] = useState(false);
  const [autoSelectAttempted, setAutoSelectAttempted] = useState(false);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('applicationStep', currentStep);
  }, [currentStep]);


  useEffect(() => {
    if (selectedTree) {
      localStorage.setItem('selectedTree', JSON.stringify(selectedTree));
    }
  }, [selectedTree]);

  useEffect(() => {
    if (selectedMunicipality) {
      localStorage.setItem('selectedMunicipality', JSON.stringify(selectedMunicipality));
    }
  }, [selectedMunicipality]);

  useEffect(() => {
    if (selectedTemplate) {
      localStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate));
    }
  }, [selectedTemplate]);

  // Save current application to localStorage
  useEffect(() => {
    if (currentApplication) {
      localStorage.setItem('currentApplication', JSON.stringify(currentApplication));
    }
  }, [currentApplication]);

  // Load data based on restored step after initial data load
  useEffect(() => {
    const loadDataForRestoredStep = async () => {
      if (!isAuthenticated || isLoading) return;

      try {
        // If we're on municipality step and no municipalities loaded, load them
        if (currentStep === 'select-municipality' && municipalities.length === 0) {
          console.log('Loading municipalities for restored step');
          const municipalitiesData = await applicationsService.getMunicipalities();
          setMunicipalities(municipalitiesData);
        }

        // If we're on template step and no templates loaded, load them
        if (currentStep === 'select-template' && templates.length === 0 && selectedMunicipality) {
          console.log('Loading templates for restored step');
          const templatesData = await applicationsService.getMunicipalityTemplates(selectedMunicipality.id);
          setTemplates(templatesData);
        }

        // If we're on form step and no form schema, check if we have existing application or create new one
        if (currentStep === 'fill-form' && !formSchema && selectedTemplate && selectedTree) {
          if (currentApplication && currentApplication.id) {
            console.log('Loading existing application for restored step:', currentApplication.id);
            try {
              const schema = await applicationsService.getFormSchema(currentApplication.id);
              setFormSchema(schema);
            } catch (error) {
              console.error('Error loading form schema for existing application:', error);
              // If schema loading fails, create new application
              console.log('Creating new application due to schema loading error');
              const application = await applicationsService.createApplication(
                selectedTemplate.id,
                selectedTree.id,
                `Wniosek dla drzewa ${selectedTree.species}`
              );
              setCurrentApplication(application);
              
              const schema = await applicationsService.getFormSchema(application.id);
              setFormSchema(schema);
            }
          } else {
            console.log('Creating new application for restored step');
            const application = await applicationsService.createApplication(
              selectedTemplate.id,
              selectedTree.id,
              `Wniosek dla drzewa ${selectedTree.species}`
            );
            setCurrentApplication(application);
            
            const schema = await applicationsService.getFormSchema(application.id);
            setFormSchema(schema);
          }
        }
      } catch (error) {
        console.error('Error loading data for restored step:', error);
        // Don't reset step on error, just log it
      }
    };

    loadDataForRestoredStep();
  }, [isAuthenticated, isLoading, currentStep, municipalities.length, templates.length, selectedMunicipality, selectedTemplate, selectedTree, formSchema, currentApplication?.id]);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) {
        console.warn('User not authenticated, skipping data load');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Pierwszy krok: pobierz drzewa użytkownika
        const treesData = await applicationsService.getUserTrees();
        setTrees(treesData);
          } catch (error) {
            console.error('Error loading user trees:', error);
        // Obsłuż błąd autoryzacji - wyczyść cache i zresetuj
            if (error instanceof Error && error.message.includes('autoryzacji')) {
              handleAuthError(error);
          await clearCacheAndReset();
              return;
            }
        
        // W przypadku błędu ładowania, załaduj podstawowe dane ale zachowaj krok
        console.warn('Error loading user trees, loading fallback data while preserving step');
        await loadFallbackData(true);
          } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Load municipalities when step changes to select-municipality
  useEffect(() => {
    if (currentStep === 'select-municipality' && municipalities.length === 0) {
      const loadMunicipalities = async () => {
        try {
          setIsLoading(true);
          const municipalitiesData = await applicationsService.getMunicipalities();
          console.log('Total municipalities:', municipalitiesData.length);
          setMunicipalities(municipalitiesData);
          
          // Auto-select municipality based on tree location (only once)
          if (selectedTree && municipalitiesData.length > 0 && !autoSelectAttempted) {
            const treeAddress = selectedTree.location.address.toLowerCase();
            console.log('Tree address:', treeAddress);
            
            // Try to find municipality by city name in address
            const matchingMunicipality = municipalitiesData.find(municipality => {
              const municipalityCity = municipality.city.toLowerCase();
              const municipalityName = municipality.name.toLowerCase();
              
              return treeAddress.includes(municipalityCity) || 
                     treeAddress.includes(municipalityName) ||
                     municipalityCity.includes(treeAddress.split(',')[0].trim()) ||
                     municipalityName.includes(treeAddress.split(',')[0].trim());
            });
            
            if (matchingMunicipality) {
              console.log('Auto-selected municipality:', matchingMunicipality.name);
              setSelectedMunicipality(matchingMunicipality);
            } else {
              console.log('No matching municipality found, user will need to select manually');
            }
            
            setAutoSelectAttempted(true);
          }
        } catch (error) {
          console.error('Error loading municipalities:', error);
          if (error instanceof Error && error.message.includes('autoryzacji')) {
            handleAuthError(error);
            await clearCacheAndReset();
            return;
          } else {
            console.warn('Error loading municipalities, using fallback data');
            // W przypadku błędu, załaduj podstawowe dane ale zachowaj krok
            await loadFallbackData(true);
          }
        } finally {
          setIsLoading(false);
        }
      };
      loadMunicipalities();
    }
  }, [currentStep, municipalities.length, selectedTree, autoSelectAttempted]);

  // Load templates when municipality is selected
  useEffect(() => {
    if (selectedMunicipality) {
      const loadTemplates = async () => {
        try {
          setIsLoading(true);
          const templatesData = await applicationsService.getMunicipalityTemplates(selectedMunicipality.id);
          setTemplates(templatesData);
        } catch (error) {
          console.error('Error loading templates:', error);
          // Sprawdź różne typy błędów
          if (error instanceof Error) {
            if (error.message.includes('autoryzacji')) {
              handleAuthError(error);
              await clearCacheAndReset();
              return;
            } else if (error.message.includes('404')) {
              console.warn('No templates found for municipality:', selectedMunicipality.id);
              setTemplates([]);
            } else if (error.message.includes('400')) {
              console.error('Bad request for municipality:', selectedMunicipality.id);
              console.warn('Error loading templates, using fallback data');
              await loadFallbackData(true);
            } else {
              console.warn('Error loading templates, using fallback data');
              await loadFallbackData(true);
            }
          } else {
            console.warn('Error loading templates, using fallback data');
            await loadFallbackData(true);
          }
        } finally {
          setIsLoading(false);
        }
      };
      loadTemplates();
    }
  }, [selectedMunicipality]);

  const getStepNumber = (step: ApplicationStep): number => {
    const steps = ['overview', 'select-tree', 'select-municipality', 'select-template', 'fill-form', 'submitted', 'completed'];
    return steps.indexOf(step) + 1;
  };


  const handleTreeSelect = async (tree: Tree) => {
    // Pozwól na tworzenie wniosków dla dowolnego drzewa
    setSelectedTree(tree);
    handleStepChange('select-municipality');
    setAutoSelectAttempted(false); // Reset auto-select flag for new tree
    
    // Load municipalities after tree selection (auth required)
    try {
      setIsLoading(true);
      const municipalitiesData = await applicationsService.getMunicipalities();
      // Wyświetl wszystkie gminy (dla testowania)
      console.log('Total municipalities:', municipalitiesData.length);
      setMunicipalities(municipalitiesData);
    } catch (error) {
      console.error('Error loading municipalities:', error);
      if (error instanceof Error && error.message.includes('autoryzacji')) {
        handleAuthError(error);
        await clearCacheAndReset();
        return;
      } else {
        alert(`Błąd podczas ładowania gmin: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: ApplicationTemplate) => {
    setSelectedTemplate(template);
  };

  const handleStepChange = (newStep: ApplicationStep) => {
    setCurrentStep(newStep);
  };

  const handleLoadAllTrees = async () => {
    try {
      setIsLoading(true);
      const allTreesData = await applicationsService.getAllTrees();
      console.log('Loaded all trees:', allTreesData);
      console.log('Number of trees:', allTreesData.length);
      if (allTreesData.length > 0) {
        console.log('First tree:', allTreesData[0]);
        console.log('First tree ID:', allTreesData[0].id);
      }
      setTrees(allTreesData);
      setShowAllTrees(true);
    } catch (error) {
      console.error('Error loading all trees:', error);
      if (error instanceof Error && error.message.includes('autoryzacji')) {
        handleAuthError(error);
        await clearCacheAndReset();
        return;
      }
      alert(`Błąd podczas ładowania drzew: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApplication = async () => {
    if (!selectedTemplate || !selectedTree) return;
    
    try {
      setIsLoading(true);
      console.log('Creating application with:');
      console.log('Selected tree:', selectedTree);
      console.log('Selected template:', selectedTemplate);
      console.log('Tree ID:', selectedTree.id);
      console.log('Template ID:', selectedTemplate.id);
      
      const application = await applicationsService.createApplication(
        selectedTemplate.id,
        selectedTree.id,
        `Wniosek dla drzewa ${selectedTree.species}`
      );
      setCurrentApplication(application);
      
      // Get form schema
      const schema = await applicationsService.getFormSchema(application.id);
      setFormSchema(schema);
      
      handleStepChange('fill-form');
    } catch (error) {
      console.error('Error creating application:', error);
      if (error instanceof Error && error.message.includes('autoryzacji')) {
        handleAuthError(error);
        await clearCacheAndReset();
        return;
      }
      console.warn('Error creating application, loading fallback data');
      await loadFallbackData(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (!currentApplication) return;
    
    try {
      setIsSubmitting(true);
      await applicationsService.submitApplication(currentApplication.id, { formData });
      handleStepChange('submitted');
      
      // Clear saved data after successful submission
      localStorage.removeItem('applicationStep');
      localStorage.removeItem('selectedTree');
      localStorage.removeItem('selectedMunicipality');
      localStorage.removeItem('selectedTemplate');
      localStorage.removeItem('applicationFormData');
      localStorage.removeItem('currentApplication');
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error instanceof Error && error.message.includes('autoryzacji')) {
        handleAuthError(error);
        await clearCacheAndReset();
        return;
      }
      alert(`Błąd podczas składania wniosku: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!currentApplication) return;
    
    try {
      setIsLoading(true);
      const pdfResponse = await applicationsService.generatePdf(currentApplication.id);
      
      // Download the PDF file
      const link = document.createElement('a');
      link.href = pdfResponse.pdfUrl;
      link.download = `wniosek_${currentApplication.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (error instanceof Error && error.message.includes('autoryzacji')) {
        handleAuthError(error);
        await clearCacheAndReset();
        return;
      }
      alert(`Błąd podczas generowania PDF: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsLoading(false);
    }
  };


  const loadFallbackData = async (preserveStep: boolean = true) => {
    try {
      console.log('Loading fallback data...');
      
      // Zapisz aktualny krok jeśli mamy go zachować
      const currentStepToPreserve = preserveStep ? currentStep : 'overview';
      
      // Wyczyść tylko dane formularza, ale zachowaj krok i wybrane opcje
      if (!preserveStep) {
        localStorage.removeItem('applicationStep');
        localStorage.removeItem('selectedTree');
        localStorage.removeItem('selectedMunicipality');
        localStorage.removeItem('selectedTemplate');
        localStorage.removeItem('applicationFormData');
        localStorage.removeItem('currentApplication');
        
        // Resetuj stan tylko jeśli nie zachowujemy kroku
        handleStepChange('overview');
        setSelectedTree(null);
        setSelectedMunicipality(null);
        setSelectedTemplate(null);
        setCurrentApplication(null);
        setFormSchema(null);
      } else {
        // Zachowaj aktualny krok i wybrane opcje
        console.log('Preserving current step:', currentStepToPreserve);
      }
      
      // Załaduj podstawowe dane (gminy i szablony)
      try {
        const municipalitiesData = await applicationsService.getMunicipalities();
        setMunicipalities(municipalitiesData);
        console.log('Fallback municipalities loaded:', municipalitiesData.length);
      } catch (error) {
        console.error('Error loading fallback municipalities:', error);
      }
      
      try {
        // Dla fallback, spróbuj załadować szablony z pierwszej dostępnej gminy
        if (municipalities.length > 0) {
          const templatesData = await applicationsService.getMunicipalityTemplates(municipalities[0].id);
          setTemplates(templatesData);
          console.log('Fallback templates loaded:', templatesData.length);
        } else {
          setTemplates([]);
          console.log('No municipalities available for fallback templates');
        }
      } catch (error) {
        console.error('Error loading fallback templates:', error);
        setTemplates([]);
      }
      
      // Ustaw puste drzewa jako fallback tylko jeśli nie zachowujemy kroku
      if (!preserveStep) {
        setTrees([]);
      }
      
      console.log('Fallback data loaded successfully');
    } catch (error) {
      console.error('Error loading fallback data:', error);
    }
  };

  const clearProgress = () => {
    localStorage.removeItem('applicationStep');
    localStorage.removeItem('selectedTree');
    localStorage.removeItem('selectedMunicipality');
    localStorage.removeItem('selectedTemplate');
    localStorage.removeItem('applicationFormData');
    localStorage.removeItem('currentApplication');
    handleStepChange('overview');
    setSelectedTree(null);
    setSelectedMunicipality(null);
    setSelectedTemplate(null);
    setCurrentApplication(null);
    setFormSchema(null);
  };

  const clearCacheAndReset = async () => {
    console.log('Clearing cache and resetting to overview');
    clearProgress();
    await loadFallbackData(false);
  };

  const renderProgressBar = () => {
    const currentStepNumber = getStepNumber(currentStep);
    const totalSteps = 5; // We show 5 main steps in progress bar (excluding overview and completed)
    
    return (
      <div className="flex items-center justify-center">
        {[1, 2, 3, 4, 5].map((step, index) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
              step <= currentStepNumber 
                ? 'bg-green-600 border-green-600 text-white' 
                : 'bg-gray-200 border-gray-300 text-gray-500'
            }`}>
              {step < currentStepNumber ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <span className="text-sm sm:text-base font-semibold">{step}</span>
              )}
            </div>
            {index < totalSteps - 1 && (
              <div className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 ${
                step < currentStepNumber ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-1 sm:px-0"
    >
      <div className="text-center mb-4 sm:mb-6">
        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Jak stworzyć wniosek?
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Proces tworzenia wniosku składa się z kilku prostych kroków. Pomożemy Ci przygotować kompletny wniosek do gminy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-5 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
            1
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Wybierz drzewo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Wybierz swoje drzewo oczekujące na weryfikację lub pomnik przyrody
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-5 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
            2
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Wybierz gminę</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Wybierz gminę, do której chcesz wysłać wniosek
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-5 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
            3
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Wypełnij formularz</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Wypełnij dynamiczny formularz na podstawie wybranego szablonu
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <GlassButton
          onClick={() => handleStepChange('select-tree')}
          variant="primary"
          size="sm"
          className="px-4 py-2"
          icon={Plus}
        >
          <span className="text-base">Rozpocznij tworzenie wniosku</span>
        </GlassButton>
      </div>
    </motion.div>
  );

  const renderTreeSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-200px)] flex flex-col"
    >
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Wybierz drzewo
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          {showAllTrees ? 'Wszystkie dostępne drzewa' : 'Wybierz drzewo, dla którego chcesz utworzyć wniosek'}
        </p>
      </div>

      <div className="flex-1">
        <TreeSelector
          trees={trees}
          selectedTree={selectedTree}
          onTreeSelect={handleTreeSelect}
          onLoadMore={handleLoadAllTrees}
          isLoading={isLoading}
          showAllTrees={showAllTrees}
          onTreeClick={(tree) => setSelectedTree(tree)}
        />
      </div>

      <div className="mt-6 mb-8 flex justify-between">
        <GlassButton
          onClick={() => handleStepChange('overview')}
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
        >
          Wstecz
        </GlassButton>
        <GlassButton
          onClick={() => handleStepChange('select-municipality')}
          disabled={!selectedTree}
          variant="primary"
          size="sm"
          icon={ArrowRight}
        >
          Dalej
        </GlassButton>
      </div>
    </motion.div>
  );

  const renderMunicipalitySelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-200px)] flex flex-col"
    >
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Wybierz gminę
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          {selectedMunicipality 
            ? `Automatycznie wybrana gmina: ${selectedMunicipality.name}` 
            : 'Wybierz gminę dla swojego wniosku'
          }
        </p>
      </div>

      <div className="flex-1">
        <MunicipalitySelector
          municipalities={municipalities}
          selectedMunicipality={selectedMunicipality}
          onMunicipalitySelect={setSelectedMunicipality}
        />
      </div>

      <div className="mt-6 mb-8 flex justify-between">
        <GlassButton
          onClick={() => handleStepChange('select-tree')}
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
        >
          Wstecz
        </GlassButton>
        <GlassButton
          onClick={() => handleStepChange('select-template')}
          disabled={!selectedMunicipality}
          variant="primary"
          size="sm"
          icon={ArrowRight}
        >
          Dalej
        </GlassButton>
      </div>
    </motion.div>
  );

  const renderTemplateSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-200px)] flex flex-col"
    >
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Wybierz szablon wniosku
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          Wybierz odpowiedni szablon dla swojego wniosku
        </p>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <TemplateSelector
            templates={templates}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
          />
        )}
      </div>

      <div className="mt-6 mb-8 flex justify-between">
        <GlassButton
          onClick={() => handleStepChange('select-municipality')}
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
        >
          Wstecz
        </GlassButton>
        <GlassButton
          onClick={handleCreateApplication}
          disabled={!selectedTemplate}
          variant="primary"
          size="sm"
          icon={ArrowRight}
        >
          Dalej
        </GlassButton>
      </div>
    </motion.div>
  );

  const renderFormFilling = () => {
    if (!formSchema) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-1 sm:px-0"
        >
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        </motion.div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col">
        <div className="flex-1">
          <DynamicForm
            schema={formSchema}
            onSubmit={handleFormSubmit}
            onBack={() => handleStepChange('select-template')}
            isSubmitting={isSubmitting}
            selectedTree={selectedTree}
            selectedMunicipality={selectedMunicipality}
            selectedTemplate={selectedTemplate}
          />
        </div>
        
      </div>
    );
  };

  const renderSubmitted = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto text-center"
    >
      <div className="mb-6">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Wniosek został wysłany!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Twój wniosek został pomyślnie wysłany. Możesz teraz pobrać PDF i wysłać go do gminy przez ePUAP.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Następne kroki:
        </h3>
        
        <div className="space-y-3 text-left">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Pobierz wygenerowany PDF</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Zapisz plik na swoim komputerze</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Zaloguj się na ePUAP</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Przejdź na epuap.gov.pl i zaloguj się</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Wyślij wniosek</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Znajdź odpowiednią usługę i załącz PDF</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <GlassButton
          onClick={handleGeneratePdf}
          disabled={isLoading}
          variant="primary"
          size="sm"
          icon={isLoading ? Loader2 : Download}
        >
          {isLoading ? 'Generowanie PDF...' : 'Pobierz PDF'}
        </GlassButton>
        
        <GlassButton
          onClick={() => window.open('https://epuap.gov.pl', '_blank')}
          variant="secondary"
          size="sm"
          icon={ExternalLink}
        >
          Otwórz ePUAP
        </GlassButton>
      </div>

      <div className="mt-6">
        <GlassButton
          onClick={clearProgress}
          variant="secondary"
          size="sm"
        >
          Utwórz nowy wniosek
        </GlassButton>
      </div>
    </motion.div>
  );


  const renderCompleted = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl sm:max-w-none mx-auto text-center px-1 sm:px-0"
    >
      <div className="mb-3 sm:mb-4">
        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
        <h2 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
          Czy udało Ci się wysłać wniosek?
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Kliknij przycisk poniżej, jeśli pomyślnie wysłałeś wniosek przez ePUAP.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
        <GlassButton
          onClick={() => handleStepChange('submitted')}
          variant="secondary"
          size="xs"
          icon={ArrowLeft}
        >
          <span style={{ fontSize: '10px' }}>Wróć do instrukcji</span>
        </GlassButton>
        <GlassButton
          onClick={clearProgress}
          variant="primary"
          size="xs"
          icon={CheckCircle}
        >
          <span style={{ fontSize: '10px' }}>Tak, wysłałem wniosek!</span>
        </GlassButton>
      </div>
    </motion.div>
  );

  const renderInstructionsModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Instrukcja wysyłania przez ePUAP
          </h3>
          <button
            onClick={() => setShowInstructionsModal(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedMunicipality && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Krok po kroku:</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200 text-sm">
                <li>Zaloguj się na platformie ePUAP (epuap.gov.pl)</li>
                <li>Wybierz "{selectedMunicipality.name}"</li>
                <li>Znajdź usługę "Pomniki przyrody" lub "Zgłoszenia dotyczące drzew"</li>
                <li>Wypełnij formularz online</li>
                <li>Załącz pobrany PDF z wnioskiem</li>
                <li>Wyślij wniosek i zachowaj numer sprawy</li>
              </ol>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Kontakt do gminy:</h4>
                <p className="text-gray-600 dark:text-gray-400">Email: {selectedMunicipality.email}</p>
                <p className="text-gray-600 dark:text-gray-400">Telefon: {selectedMunicipality.phone}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Adres urzędu:</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedMunicipality.address}, {selectedMunicipality.city}</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Ważne informacje:</h4>
              <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-200 text-sm">
                <li>Pamiętaj o podpisaniu PDF przed wysłaniem</li>
                <li>Zachowaj numer sprawy do śledzenia statusu</li>
                <li>Gmina ma 30 dni na rozpatrzenie wniosku</li>
                <li>W razie problemów skontaktuj się z urzędem</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <GlassButton
            onClick={() => setShowInstructionsModal(false)}
            variant="primary"
            size="xs"
          >
            Rozumiem
          </GlassButton>
        </div>
      </motion.div>
    </div>
  );


  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(currentStep !== 'overview' && currentStep !== 'completed') && (
          <div className="mb-2 sm:mb-4">
            {renderProgressBar()}
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentStep === 'overview' && renderOverview()}
          {currentStep === 'select-tree' && renderTreeSelection()}
          {currentStep === 'select-municipality' && renderMunicipalitySelection()}
          {currentStep === 'select-template' && renderTemplateSelection()}
          {currentStep === 'fill-form' && renderFormFilling()}
          {currentStep === 'submitted' && renderSubmitted()}
          {currentStep === 'completed' && renderCompleted()}
        </AnimatePresence>


        {/* Instructions Modal */}
        {showInstructionsModal && renderInstructionsModal()}
      </div>
    </div>
  );
};