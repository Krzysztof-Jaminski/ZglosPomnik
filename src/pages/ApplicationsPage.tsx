import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Plus, MapPin, Loader2, X } from 'lucide-react';
import { Tree, ApplicationTemplate, Municipality, Application, FormSchema } from '../types';
import { applicationsService } from '../services/applicationsService';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from '../components/UI/GlassButton';
import { DynamicForm } from '../components/Applications/DynamicForm';
import { TemplateSelector } from '../components/Applications/TemplateSelector';

type ApplicationStep = 'overview' | 'select-tree' | 'select-municipality' | 'select-template' | 'fill-form' | 'submitted' | 'completed';



export const ApplicationsPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('overview');
  const [trees, setTrees] = useState<Tree[]>([]);
  const [templates, setTemplates] = useState<ApplicationTemplate[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ApplicationTemplate | null>(null);
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showAllTrees, setShowAllTrees] = useState(false);

  // Save progress to localStorage (commented for testing)
  // useEffect(() => {
  //   localStorage.setItem('applicationStep', currentStep);
  // }, [currentStep]);

  // useEffect(() => {
  //   if (selectedTree) {
  //     localStorage.setItem('selectedTree', JSON.stringify(selectedTree));
  //   }
  // }, [selectedTree]);

  // useEffect(() => {
  //   if (selectedMunicipality) {
  //     localStorage.setItem('selectedMunicipality', JSON.stringify(selectedMunicipality));
  //   }
  // }, [selectedMunicipality]);

  // useEffect(() => {
  //   if (selectedTemplate) {
  //     localStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate));
  //   }
  // }, [selectedTemplate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Sprawdź czy użytkownik jest zalogowany
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('No auth token found, skipping data load');
          return;
        }
        
        // Pierwszy krok: pobierz drzewa użytkownika
        const treesData = await applicationsService.getUserTrees();
        setTrees(treesData);
      } catch (error) {
        console.error('Error loading user trees:', error);
        // Nie pokazuj alertu jeśli to błąd autoryzacji - użytkownik może nie być zalogowany
        if (error instanceof Error && !error.message.includes('autoryzacji')) {
          alert(`Błąd podczas ładowania drzew: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
            if (error.message.includes('404')) {
              console.warn('No templates found for municipality:', selectedMunicipality.id);
              setTemplates([]);
            } else if (error.message.includes('400')) {
              console.error('Bad request for municipality:', selectedMunicipality.id);
              alert(`Nieprawidłowe żądanie dla gminy ${selectedMunicipality.name}. Sprawdź czy gmina ma dostępne szablony.`);
              setTemplates([]);
            } else {
              alert(`Błąd podczas ładowania szablonów: ${error.message}`);
            }
          } else {
            alert(`Błąd podczas ładowania szablonów: Nieznany błąd`);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleTreeSelect = async (tree: Tree) => {
    // Pozwól na tworzenie wniosków dla dowolnego drzewa
    setSelectedTree(tree);
    setCurrentStep('select-municipality');
    
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
        alert('Musisz być zalogowany aby zobaczyć dostępne gminy.');
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
      
      setCurrentStep('fill-form');
    } catch (error) {
      console.error('Error creating application:', error);
      alert(`Błąd podczas tworzenia wniosku: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (!currentApplication) return;
    
    try {
      setIsSubmitting(true);
      await applicationsService.submitApplication(currentApplication.id, { formData });
      setCurrentStep('submitted');
    } catch (error) {
      console.error('Error submitting application:', error);
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
    } finally {
      setIsLoading(false);
    }
  };


  const clearProgress = () => {
    // localStorage.removeItem('applicationStep');
    // localStorage.removeItem('selectedTree');
    // localStorage.removeItem('selectedMunicipality');
    // localStorage.removeItem('selectedTemplate');
    setCurrentStep('overview');
    setSelectedTree(null);
    setSelectedMunicipality(null);
    setSelectedTemplate(null);
    setCurrentApplication(null);
    setFormSchema(null);
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
          onClick={() => setCurrentStep('select-tree')}
          variant="primary"
          size="sm"
          icon={Plus}
          className="px-4 py-2"
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
      className="max-w-7xl mx-auto px-1 sm:px-0"
    >
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Wybierz drzewo
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          {showAllTrees ? 'Wszystkie dostępne drzewa' : 'Wybierz drzewo, dla którego chcesz utworzyć wniosek'}
        </p>
      </div>

      {trees.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-4 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nie zgłosiłeś jeszcze żadnych drzew
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aby utworzyć wniosek, musisz najpierw zgłosić drzewo w aplikacji lub wybrać z już istniejących.
            </p>
            <div className="space-y-2">
              <GlassButton
                onClick={handleLoadAllTrees}
                disabled={isLoading}
                variant="primary"
                size="sm"
                icon={isLoading ? Loader2 : Plus}
              >
                {isLoading ? 'Ładowanie...' : 'Pokaż więcej drzew'}
              </GlassButton>
            </div>
          </div>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {trees.map(tree => (
          <motion.div
            key={tree.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTreeSelect(tree)}
                className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg cursor-pointer transition-all p-3 sm:p-4 ${
                  selectedTree?.id === tree.id ? 'ring-2 ring-green-500 bg-green-50/50 dark:bg-green-900/20' : 'hover:shadow-xl hover:bg-white/90 dark:hover:bg-gray-800/90'
            }`}
          >
            <div className="flex items-start space-x-2">
              {tree.images && tree.images.length > 0 && (
                <img
                  src={tree.images[0]}
                  alt={tree.species}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {tree.species}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 italic mb-1">
                  {tree.speciesLatin}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  {tree.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {tree.location.lat.toFixed(4)}, {tree.location.lng.toFixed(4)}
                    </span>
                  </div>
                  {getStatusIcon(tree.status)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

          {!showAllTrees && (
            <div className="text-center mt-4">
              <GlassButton
                onClick={handleLoadAllTrees}
                disabled={isLoading}
                variant="secondary"
                size="sm"
                icon={isLoading ? Loader2 : Plus}
                className="px-6 py-2"
              >
                {isLoading ? 'Ładowanie...' : 'Pokaż więcej drzew'}
              </GlassButton>
            </div>
          )}
        </>
      )}

      <div className="flex justify-between mt-2 sm:mt-3">
        <GlassButton
          onClick={() => setCurrentStep('overview')}
          variant="secondary"
          size="xs"
          icon={ArrowLeft}
        >
          <span style={{ fontSize: '10px' }}>Wstecz</span>
        </GlassButton>
      </div>
    </motion.div>
  );

  const renderMunicipalitySelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-1 sm:px-0"
    >
      <div className="text-center mb-2 sm:mb-3">
        <h2 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
          Wybierz gminę
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Automatycznie wybrana gmina na podstawie lokalizacji drzewa
        </p>
      </div>

      <div className="space-y-2">
        {municipalities.map(municipality => (
          <motion.div
            key={municipality.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => setSelectedMunicipality(municipality)}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg cursor-pointer transition-all p-3 sm:p-4 ${
              selectedMunicipality?.id === municipality.id ? 'ring-2 ring-green-500 bg-green-50/50 dark:bg-green-900/20' : 'hover:shadow-xl hover:bg-white/90 dark:hover:bg-gray-800/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {municipality.name}
                  {!municipality.isActive && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      Niedostępna
                    </span>
                  )}
                </h3>
                <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                  <p>Email: {municipality.email}</p>
                  <p>Telefon: {municipality.phone}</p>
                  <p>Adres: {municipality.address}, {municipality.city}</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedMunicipality?.id === municipality.id 
                  ? 'bg-green-600 border-green-600' 
                  : 'border-gray-300'
              }`}>
                {selectedMunicipality?.id === municipality.id && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between mt-2 sm:mt-3">
        <GlassButton
          onClick={() => setCurrentStep('select-tree')}
          variant="secondary"
          size="xs"
          icon={ArrowLeft}
        >
          <span style={{ fontSize: '10px' }}>Wstecz</span>
        </GlassButton>
        <GlassButton
          onClick={() => setCurrentStep('select-template')}
          disabled={!selectedMunicipality}
          variant="primary"
          size="xs"
          icon={ArrowRight}
        >
          <span style={{ fontSize: '10px' }}>Dalej</span>
        </GlassButton>
      </div>
    </motion.div>
  );

  const renderTemplateSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-1 sm:px-0"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : (
        <TemplateSelector
          templates={templates}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
          onBack={() => setCurrentStep('select-municipality')}
          onNext={handleCreateApplication}
        />
      )}
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
      <DynamicForm
        schema={formSchema}
        onSubmit={handleFormSubmit}
        onBack={() => setCurrentStep('select-template')}
        isSubmitting={isSubmitting}
      />
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
          onClick={() => setCurrentStep('submitted')}
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