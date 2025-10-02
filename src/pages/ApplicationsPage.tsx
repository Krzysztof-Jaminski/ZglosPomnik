import React, { useState, useEffect } from 'react';
import { Plus, Loader2, X } from 'lucide-react';
import { Tree, ApplicationTemplate, Commune, Application, FormSchema } from '../types';
import { applicationsService } from '../services/applicationsService';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from '../components/UI/GlassButton';
import { DynamicForm } from '../components/Applications/DynamicForm';
import { TemplateSelector } from '../components/Applications/TemplateSelector';
import { TreeSelector } from '../components/Applications/TreeSelector';
import { CommuneSelector } from '../components/Applications/CommuneSelector';
import { useAuth } from '../context/AuthContext';



export const ApplicationsPage: React.FC = () => {
  const { isAuthenticated, handleAuthError } = useAuth();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [templates, setTemplates] = useState<ApplicationTemplate[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
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
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(() => {
    const savedCommune = localStorage.getItem('selectedCommune');
    if (savedCommune) {
      try {
        return JSON.parse(savedCommune);
      } catch (error) {
        console.error('Error parsing saved commune:', error);
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
  const [isCreatingApplication, setIsCreatingApplication] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showAllTrees, setShowAllTrees] = useState(false);
  const [autoSelectAttempted, setAutoSelectAttempted] = useState(false);


  useEffect(() => {
    if (selectedTree) {
      localStorage.setItem('selectedTree', JSON.stringify(selectedTree));
    }
  }, [selectedTree]);

  useEffect(() => {
    if (selectedCommune) {
      localStorage.setItem('selectedCommune', JSON.stringify(selectedCommune));
    }
  }, [selectedCommune]);

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

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isAuthenticated) {
        console.warn('User not authenticated, skipping data load');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Load trees and communes initially
        const [treesData, communesData] = await Promise.all([
          applicationsService.getUserTrees(),
          applicationsService.getCommunes()
        ]);
        setTrees(treesData);
        setCommunes(communesData);
        
        // Auto-select commune based on tree location if tree is selected
          if (selectedTree && communesData.length > 0 && !autoSelectAttempted) {
            const treeAddress = selectedTree.location.address.toLowerCase();
            const matchingCommune = communesData.find(commune => {
              const communeCity = commune.city.toLowerCase();
              const communeName = commune.name.toLowerCase();
              
              return treeAddress.includes(communeCity) || 
                     treeAddress.includes(communeName) ||
                     communeCity.includes(treeAddress.split(',')[0].trim()) ||
                     communeName.includes(treeAddress.split(',')[0].trim());
            });
            
            if (matchingCommune) {
              console.log('Auto-selected commune:', matchingCommune.name);
              setSelectedCommune(matchingCommune);
            }
            setAutoSelectAttempted(true);
          }
        } catch (error) {
        console.error('Error loading initial data:', error);
          if (error instanceof Error && error.message.includes('autoryzacji')) {
            handleAuthError(error);
            await clearCacheAndReset();
            return;
          }
        } finally {
          setIsLoading(false);
        }
      };

    loadInitialData();
  }, [isAuthenticated]);

  // Load templates when commune is selected
  useEffect(() => {
    if (selectedCommune) {
      // Reset template selection when commune changes
      setSelectedTemplate(null);
      
      const loadTemplates = async () => {
        try {
          setIsLoading(true);
          const templatesData = await applicationsService.getCommuneTemplates(selectedCommune.id);
          setTemplates(templatesData);
        } catch (error) {
          console.error('Error loading templates:', error);
          if (error instanceof Error) {
            if (error.message.includes('autoryzacji')) {
              handleAuthError(error);
              await clearCacheAndReset();
              return;
            } else if (error.message.includes('404')) {
              console.warn('No templates found for commune:', selectedCommune.id);
              setTemplates([]);
            } else {
              console.warn('Error loading templates');
              setTemplates([]);
            }
          } else {
            console.warn('Error loading templates');
            setTemplates([]);
          }
        } finally {
          setIsLoading(false);
        }
      };
      loadTemplates();
    }
  }, [selectedCommune]);

  // Load form schema when currentApplication is available
  useEffect(() => {
    if (currentApplication && !formSchema) {
      const loadFormSchema = async () => {
        try {
          setIsLoading(true);
          const schema = await applicationsService.getFormSchema(currentApplication.id);
          setFormSchema(schema);
        } catch (error) {
          console.error('Error loading form schema:', error);
          if (error instanceof Error && error.message.includes('autoryzacji')) {
            handleAuthError(error);
            await clearCacheAndReset();
            return;
          }
        } finally {
          setIsLoading(false);
        }
      };
      loadFormSchema();
    }
  }, [currentApplication, formSchema]);

  const handleTreeSelect = async (tree: Tree) => {
    setSelectedTree(tree);
    setAutoSelectAttempted(false); // Reset auto-select flag for new tree
    
    // Reset template selection when tree changes
    setSelectedTemplate(null);
    
    // Auto-select commune based on tree location
    if (communes.length > 0) {
      const treeAddress = tree.location.address.toLowerCase();
      const matchingCommune = communes.find(commune => {
        const communeCity = commune.city.toLowerCase();
        const communeName = commune.name.toLowerCase();
        
        return treeAddress.includes(communeCity) || 
               treeAddress.includes(communeName) ||
               communeCity.includes(treeAddress.split(',')[0].trim()) ||
               communeName.includes(treeAddress.split(',')[0].trim());
      });
      
      if (matchingCommune) {
        console.log('Auto-selected commune:', matchingCommune.name);
        setSelectedCommune(matchingCommune);
      }
      setAutoSelectAttempted(true);
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
      setIsCreatingApplication(true);
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
    } catch (error) {
      console.error('Error creating application:', error);
      if (error instanceof Error && error.message.includes('autoryzacji')) {
        handleAuthError(error);
        await clearCacheAndReset();
        return;
      }
      alert(`Błąd podczas tworzenia wniosku: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsCreatingApplication(false);
    }
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (!currentApplication) return;
    
    try {
      setIsSubmitting(true);
      await applicationsService.submitApplication(currentApplication.id, { formData });
      
      // Generate PDF using real endpoint
      const pdfResponse = await applicationsService.generatePdf(currentApplication.id);
      
      // Open PDF in new tab
      const newWindow = window.open(pdfResponse.pdfUrl, '_blank');
      
      // If window.open doesn't work (may be blocked), try alternative method
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback: use location.href
        window.location.href = pdfResponse.pdfUrl;
      }
      
      // Clear saved data after successful submission
      localStorage.removeItem('selectedTree');
      localStorage.removeItem('selectedCommune');
      localStorage.removeItem('selectedTemplate');
      localStorage.removeItem('applicationFormData');
      localStorage.removeItem('currentApplication');
      
      // Reset form state
      setSelectedTree(null);
      setSelectedCommune(null);
      setSelectedTemplate(null);
      setCurrentApplication(null);
      setFormSchema(null);
      
      alert('Wniosek został wygenerowany! PDF został otwarty w nowej karcie.');
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error instanceof Error && error.message.includes('autoryzacji')) {
        handleAuthError(error);
        await clearCacheAndReset();
        return;
      }
      alert(`Błąd podczas generowania wniosku: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsSubmitting(false);
    }
  };



  const clearCacheAndReset = async () => {
    console.log('Clearing cache and resetting');
    localStorage.removeItem('selectedTree');
    localStorage.removeItem('selectedCommune');
    localStorage.removeItem('selectedTemplate');
    localStorage.removeItem('applicationFormData');
    localStorage.removeItem('currentApplication');
    
    setSelectedTree(null);
    setSelectedCommune(null);
    setSelectedTemplate(null);
    setCurrentApplication(null);
    setFormSchema(null);
    setTemplates([]);
  };

  // Check if we can show the next section
  const canShowCommuneSelection = selectedTree !== null;
  const canShowTemplateSelection = selectedTree !== null && selectedCommune !== null;
  const canShowForm = currentApplication !== null && formSchema !== null;
    
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-2 sm:py-3 overflow-y-auto">
      <div className="w-full px-3 sm:px-4">
        {/* Main Container */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="space-y-1 sm:space-y-2">

            {/* Tree Selection Section - Hide when form is shown */}
            {!canShowForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Wybierz drzewo
                  </label>
                  
                  <div className="relative max-h-[30vh] overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 shadow-inner ring-1 ring-gray-100 dark:ring-gray-800">
                    {/* Top fade gradient */}
                    <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-700/50 dark:to-transparent pointer-events-none z-10"></div>
                    {/* Bottom fade gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-50/50 to-transparent dark:from-gray-700/50 dark:to-transparent pointer-events-none z-10"></div>
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
                </div>
              </div>
            )}

            {/* Commune Selection Section - Show when tree is selected but hide when form is shown */}
            <AnimatePresence>
              {canShowCommuneSelection && !canShowForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Wybierz gminę
                    </label>
                    
                    <div className="relative max-h-[30vh] overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 shadow-inner ring-1 ring-gray-100 dark:ring-gray-800">
                      {/* Top fade gradient */}
                      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-700/50 dark:to-transparent pointer-events-none z-10"></div>
                      {/* Bottom fade gradient */}
                      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-50/50 to-transparent dark:from-gray-700/50 dark:to-transparent pointer-events-none z-10"></div>
                      <CommuneSelector
                        communes={communes}
                        selectedCommune={selectedCommune}
                        onCommuneSelect={setSelectedCommune}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Template Selection Section - Show when commune is selected but hide when form is shown */}
            <AnimatePresence>
              {canShowTemplateSelection && !canShowForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Wybierz szablon wniosku
                    </label>
                    
                    <div className="relative max-h-[30vh] overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 shadow-inner ring-1 ring-gray-100 dark:ring-gray-800">
                      {/* Top fade gradient */}
                      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-700/50 dark:to-transparent pointer-events-none z-10"></div>
                      {/* Bottom fade gradient */}
                      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-50/50 to-transparent dark:from-gray-700/50 dark:to-transparent pointer-events-none z-10"></div>
                      {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                        </div>
                      ) : (
                        <TemplateSelector
                          templates={templates}
                          selectedTemplate={selectedTemplate}
                          onTemplateSelect={handleTemplateSelect}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Create/Continue Application Button */}
            {!canShowForm && (
              <div className="w-full">
                {currentApplication ? (
                  <GlassButton
                    onClick={() => {
                      // Reload form schema for existing application
                      const loadFormSchema = async () => {
                        try {
                          setIsLoading(true);
                          const schema = await applicationsService.getFormSchema(currentApplication.id);
                          setFormSchema(schema);
                        } catch (error) {
                          console.error('Error loading form schema:', error);
                          if (error instanceof Error && error.message.includes('autoryzacji')) {
                            handleAuthError(error);
                            await clearCacheAndReset();
                            return;
                          }
                        } finally {
                          setIsLoading(false);
                        }
                      };
                      loadFormSchema();
                    }}
                    disabled={isLoading}
                    variant="primary"
                    size="sm"
                    icon={isLoading ? Loader2 : Plus}
                    className="w-full text-sm"
                  >
                    {isLoading ? 'Ładowanie wniosku...' : 'Kontynuuj wniosek'}
                  </GlassButton>
                ) : (
                  <GlassButton
                    onClick={handleCreateApplication}
                    disabled={isCreatingApplication || !selectedTree || !selectedCommune || !selectedTemplate}
                    variant={selectedTree && selectedCommune && selectedTemplate ? "primary" : "secondary"}
                    size="sm"
                    icon={isCreatingApplication ? Loader2 : Plus}
                    className={`w-full text-sm ${!selectedTree || !selectedCommune || !selectedTemplate ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isCreatingApplication ? 'Tworzenie wniosku...' : 'Utwórz wniosek'}
                  </GlassButton>
                )}
              </div>
            )}

            {/* Form Section - Show when application is created */}
            <AnimatePresence>
              {canShowForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full"
                >
                  <DynamicForm
                    schema={formSchema}
                    onSubmit={handleFormSubmit}
                    onBack={() => {
                      // Only hide the form, keep everything else
                      setFormSchema(null);
                      // Keep currentApplication, selectedTree, selectedCommune, selectedTemplate
                      // User can return to the form by clicking "Utwórz wniosek" again
                    }}
                    isSubmitting={isSubmitting}
                    selectedTree={selectedTree}
                    selectedCommune={selectedCommune}
                    selectedTemplate={selectedTemplate}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Instructions Modal */}
        {showInstructionsModal && (
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

        {selectedCommune && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Krok po kroku:</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200 text-sm">
                <li>Zaloguj się na platformie ePUAP (epuap.gov.pl)</li>
                <li>Wybierz "{selectedCommune.name}"</li>
                <li>Znajdź usługę "Pomniki przyrody" lub "Zgłoszenia dotyczące drzew"</li>
                <li>Wypełnij formularz online</li>
                <li>Załącz pobrany PDF z wnioskiem</li>
                <li>Wyślij wniosek i zachowaj numer sprawy</li>
              </ol>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Kontakt do gminy:</h4>
                <p className="text-gray-600 dark:text-gray-400">Email: {selectedCommune.email}</p>
                <p className="text-gray-600 dark:text-gray-400">Telefon: {selectedCommune.phone}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Adres urzędu:</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedCommune.address}, {selectedCommune.city}</p>
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
              )}
      </div>
    </div>
  );

};