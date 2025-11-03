import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, X, Download, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Tree, ApplicationTemplate, Commune, Application, FormSchema } from '../types';
import { applicationsService } from '../services/applicationsService';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from '../components/UI/GlassButton';
import { DynamicForm } from '../components/Applications/DynamicForm';
import { useModal } from '../context/ModalContext';
import { TemplateSelector } from '../components/Applications/TemplateSelector';
import { TreeSelector } from '../components/Applications/TreeSelector';
import { CommuneSelector } from '../components/Applications/CommuneSelector';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import JSZip from 'jszip';



export const ApplicationsPage: React.FC = () => {
  const { isAuthenticated, handleAuthError } = useAuth();
  const location = useLocation();
  const { setPdfModalOpen } = useModal();
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
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [isCreatingApplication, setIsCreatingApplication] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showAllTrees, setShowAllTrees] = useState(false);
  const [autoSelectAttempted, setAutoSelectAttempted] = useState(false);
  const [showCreateNewModal, setShowCreateNewModal] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string>('');
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);
  const [generatedTreeScreenshotUrl, setGeneratedTreeScreenshotUrl] = useState<string>('');
  const [userManuallyClosedForm, setUserManuallyClosedForm] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showMapScreenshotModal, setShowMapScreenshotModal] = useState(false);
  const [isPdfGenerated, setIsPdfGenerated] = useState<boolean>(() => {
    const savedPdfData = localStorage.getItem('generatedPdfData');
    return !!savedPdfData;
  });

  const openPhotoModal = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoModal(true);
  }, []);

  const closePhotoModal = useCallback(() => {
    setShowPhotoModal(false);
  }, []);

  const openMapScreenshotModal = useCallback(() => {
    setShowMapScreenshotModal(true);
  }, []);

  const closeMapScreenshotModal = useCallback(() => {
    setShowMapScreenshotModal(false);
  }, []);

  const nextPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => (prev + 1) % (generatedImageUrls.length || 1));
  }, [generatedImageUrls.length]);

  const prevPhoto = useCallback(() => {
    setSelectedPhotoIndex((prev) => (prev - 1 + (generatedImageUrls.length || 1)) % (generatedImageUrls.length || 1));
  }, [generatedImageUrls.length]);

  // Track which page was last active
  useEffect(() => {
    localStorage.setItem('lastActivePage', 'applications');
  }, []);


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
    } else {
      // Clear from localStorage when set to null
      localStorage.removeItem('currentApplication');
    }
  }, [currentApplication]);

  // Load PDF data from localStorage on mount
  useEffect(() => {
    const savedPdfData = localStorage.getItem('generatedPdfData');
    if (savedPdfData) {
      try {
        const pdfData = JSON.parse(savedPdfData);
        setGeneratedPdfUrl(pdfData.pdfUrl);
        setGeneratedImageUrls(pdfData.imageUrls || []);
        setGeneratedTreeScreenshotUrl(pdfData.treeScreenshotUrl || '');
        setIsPdfGenerated(true);
      } catch (error) {
        console.error('Error loading saved PDF data:', error);
      }
    }
  }, []);

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
        
        // Try to load from localStorage first
        const cachedTrees = localStorage.getItem('cached_application_trees');
        const cachedCommunes = localStorage.getItem('cached_application_communes');
        
        if (cachedTrees) {
          try {
            const cachedData = JSON.parse(cachedTrees);
            const cacheTime = localStorage.getItem('cached_application_trees_time');
            const cacheAge = cacheTime ? Date.now() - parseInt(cacheTime) : Infinity;
            
            // Use cached data if less than 5 minutes old
            if (cacheAge < 5 * 60 * 1000 && Array.isArray(cachedData) && cachedData.length > 0) {
              console.log('ApplicationsPage: Using cached trees data');
              setTrees(cachedData);
            }
          } catch (e) {
            console.warn('Failed to parse cached trees:', e);
          }
        }
        
        if (cachedCommunes) {
          try {
            const cachedData = JSON.parse(cachedCommunes);
            const cacheTime = localStorage.getItem('cached_application_communes_time');
            const cacheAge = cacheTime ? Date.now() - parseInt(cacheTime) : Infinity;
            
            // Use cached data if less than 5 minutes old
            if (cacheAge < 5 * 60 * 1000 && Array.isArray(cachedData) && cachedData.length > 0) {
              console.log('ApplicationsPage: Using cached communes data');
              setCommunes(cachedData);
            }
          } catch (e) {
            console.warn('Failed to parse cached communes:', e);
          }
        }
        
        // Check if user is returning from report page
        const lastActivePage = localStorage.getItem('lastActivePage');
        const isReturningFromReport = lastActivePage === 'report';
        
        if (isReturningFromReport) {
          console.log('User returning from report page, restoring application state');
          // Don't reset currentApplication if user is returning from report
          setUserManuallyClosedForm(false);
        }
        
        // Load trees and communes initially (always fetch fresh data)
        const [treesData, communesData] = await Promise.all([
          applicationsService.getAllTrees(),
          applicationsService.getCommunes()
        ]);
        
        // Cache the data
        localStorage.setItem('cached_application_trees', JSON.stringify(treesData));
        localStorage.setItem('cached_application_trees_time', Date.now().toString());
        localStorage.setItem('cached_application_communes', JSON.stringify(communesData));
        localStorage.setItem('cached_application_communes_time', Date.now().toString());
        
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
    if (currentApplication && !formSchema && !userManuallyClosedForm) {
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
  }, [currentApplication, formSchema, userManuallyClosedForm]);

  // Handle navigation from profile with specific application
  useEffect(() => {
    if (location.state?.continueApplication) {
      const applicationId = location.state.continueApplication;
      
      const loadApplication = async () => {
        try {
          setIsLoading(true);
          // Get user applications to find the specific one
          const applications = await applicationsService.getUserApplications();
          const application = applications.find(app => app.id === applicationId);
          
          if (application) {
            setCurrentApplication(application);
            // Load form schema
            const schema = await applicationsService.getFormSchema(application.id);
            setFormSchema(schema);
          }
        } catch (error) {
          console.error('Error loading application:', error);
          if (error instanceof Error && error.message.includes('autoryzacji')) {
            handleAuthError(error);
            await clearCacheAndReset();
            return;
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      loadApplication();
    }
  }, [location.state]);

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
    
    // If there's an existing application, show confirmation modal
    if (currentApplication) {
      setShowCreateNewModal(true);
      return;
    }
    
    await createNewApplication();
  };

  const createNewApplication = async () => {
    if (!selectedTemplate || !selectedTree) return;
    
    try {
      setIsCreatingApplication(true);
      // Reset the flag when creating new application
      setUserManuallyClosedForm(false);
      
      // Clear PDF data when creating new application
      localStorage.removeItem('generatedPdfData');
      setIsPdfGenerated(false);
      setGeneratedPdfUrl('');
      setGeneratedImageUrls([]);
      setGeneratedTreeScreenshotUrl('');
      setPdfModalOpen(false);
      
      console.log('Creating application with:');
      console.log('Selected tree:', selectedTree);
      console.log('Selected template:', selectedTemplate);
      console.log('Tree ID:', selectedTree.id);
      console.log('Template ID:', selectedTemplate.id);
      
      const application = await applicationsService.createApplication(
        selectedTemplate.id,
        selectedTree.id,
        false // IsOrganization - domyślnie false, będzie ustawione w formularzu
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
      
      // FIRST: Submit application with form data (changes status from draft to submitted)
      await applicationsService.submitApplication(currentApplication.id, { formData });
      
      // THEN: Generate PDF (only works for submitted applications, not drafts)
      const pdfResponse = await applicationsService.generatePdf(currentApplication.id);
      
      // Show success modal with PDF link and image URLs
      setGeneratedPdfUrl(pdfResponse.pdfPath);
      setGeneratedImageUrls(pdfResponse.images || []);
      setGeneratedTreeScreenshotUrl(pdfResponse.treeScreenshotUrl || '');
      
      // Save PDF data to localStorage for persistent access
      const pdfData = {
        pdfUrl: pdfResponse.pdfPath,
        imageUrls: pdfResponse.images || [],
        treeScreenshotUrl: pdfResponse.treeScreenshotUrl || ''
      };
      localStorage.setItem('generatedPdfData', JSON.stringify(pdfData));
      
      // Mark PDF as generated and show application view immediately
      setIsPdfGenerated(true);
      setFormSchema(null); // Hide form
      setUserManuallyClosedForm(true); // Prevent form from showing again
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

  // Function to completely close the application form
  const handleCloseForm = () => {
    // Clear all application data from localStorage
    localStorage.removeItem('currentApplication');
    localStorage.removeItem('applicationFormData');
    localStorage.removeItem('selectedTree');
    localStorage.removeItem('selectedCommune');
    localStorage.removeItem('selectedTemplate');
    localStorage.removeItem('generatedPdfData');
    
    // Clear state and close form
    setCurrentApplication(null);
    setFormSchema(null);
    setUserManuallyClosedForm(false);
    setIsPdfGenerated(false);
    setGeneratedPdfUrl('');
    setGeneratedImageUrls([]);
    setGeneratedTreeScreenshotUrl('');
  };

  // Function to create a new application (reset everything)
  const handleCreateNewApplication = async () => {
    // Clear ALL application data from localStorage FIRST
    localStorage.removeItem('currentApplication');
    localStorage.removeItem('applicationFormData');
    localStorage.removeItem('generatedPdfData');
    
    // Clear PDF data state
    setIsPdfGenerated(false);
    setGeneratedPdfUrl('');
    setGeneratedImageUrls([]);
    setGeneratedTreeScreenshotUrl('');
    setPdfModalOpen(false);
    
    // Clear form state
    setFormSchema(null);
    setUserManuallyClosedForm(false);
    setCurrentApplication(null);
    
    // Wait a bit to ensure state updates are processed
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Create new application
    await createNewApplication();
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

  // Function to download file from URL
  const downloadFile = async (url: string): Promise<Blob> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file from ${url}`);
    }
    return response.blob();
  };

  // Function to download and package files into ZIP
  const handleDownloadZip = async () => {
    if (!generatedPdfUrl) return;

    try {
      setIsDownloadingZip(true);
      const zip = new JSZip();

      // Download PDF
      console.log('Downloading PDF:', generatedPdfUrl);
      const pdfBlob = await downloadFile(generatedPdfUrl);
      zip.file('wniosek.pdf', pdfBlob);

      // Download tree screenshot if available
      if (generatedTreeScreenshotUrl) {
        console.log('Downloading tree screenshot:', generatedTreeScreenshotUrl);
        try {
          const screenshotBlob = await downloadFile(generatedTreeScreenshotUrl);
          const extension = generatedTreeScreenshotUrl.split('.').pop()?.split('?')[0] || 'jpg';
          zip.file(`Mapa lokalizacyjna drzewa.${extension}`, screenshotBlob);
        } catch (error) {
          console.warn('Failed to download tree screenshot:', error);
        }
      }

      // Download all images (in the same folder as PDF)
      if (generatedImageUrls.length > 0) {
        console.log('Downloading images:', generatedImageUrls.length);
        for (let i = 0; i < generatedImageUrls.length; i++) {
          try {
            const imageBlob = await downloadFile(generatedImageUrls[i]);
            const extension = generatedImageUrls[i].split('.').pop()?.split('?')[0] || 'jpg';
            zip.file(`zdjecie_${i + 1}.${extension}`, imageBlob);
          } catch (error) {
            console.warn(`Failed to download image ${i + 1}:`, error);
          }
        }
      }

      // Generate ZIP file
      console.log('Generating ZIP file...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download ZIP
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wniosek_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('ZIP file downloaded successfully');
    } catch (error) {
      console.error('Error downloading ZIP:', error);
      alert(`Błąd podczas pobierania plików: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Check if we can show the next section
  const canShowCommuneSelection = selectedTree !== null;
  const canShowTemplateSelection = selectedTree !== null && selectedCommune !== null;
  const canShowForm = currentApplication !== null && formSchema !== null && !isPdfGenerated;
  const canShowApplicationView = isPdfGenerated && currentApplication !== null;

  // Delayed spinner - show only after 500ms
  useEffect(() => {
    const shouldShow = isLoading && trees.length === 0 && !selectedTree && !selectedCommune && !selectedTemplate && !currentApplication;
    if (shouldShow) {
      const timer = setTimeout(() => {
        setShowLoadingSpinner(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowLoadingSpinner(false);
    }
  }, [isLoading, trees.length, selectedTree, selectedCommune, selectedTemplate, currentApplication]);
    
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 py-2 sm:py-3 overflow-y-auto relative">
      {/* Loading overlay - below header */}
      {showLoadingSpinner ? (
        <div className="absolute inset-x-0 top-0 bottom-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ładowanie</p>
          </div>
        </div>
      ) : null}
      <div className="w-full px-3 sm:px-4">
        {/* Main Container */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="space-y-1 sm:space-y-2">

            {/* Application View - Show when PDF is generated */}
            <AnimatePresence>
              {canShowApplicationView && (
                <>
                  {/* Download Button - At the top */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="relative rounded-xl p-1 shadow-lg border border-gray-200/40 dark:border-gray-400/30 mb-2 sm:mb-3"
                  >
                    <div className="bg-gray-50 dark:bg-gray-900 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                      {/* Download ZIP Button */}
                      <div className="mb-0">
                        <GlassButton
                          onClick={handleDownloadZip}
                          disabled={isDownloadingZip}
                          variant="primary"
                          size="sm"
                          className="w-full"
                          icon={isDownloadingZip ? Loader2 : Download}
                        >
                          {isDownloadingZip ? 'Pobieranie...' : 'Pobierz Gotowy Wniosek'}
                        </GlassButton>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 text-center">
                          <strong>Wniosek został wygenerowany!</strong> Pobierz folder ZIP z wniosekiem PDF oraz wszystkimi załącznikami!
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Photos and Map Screenshots */}
                  <AnimatePresence>
                    {(generatedImageUrls.length > 0 || generatedTreeScreenshotUrl) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-2 sm:mb-3 space-y-2 sm:space-y-3"
                      >
                        {/* Photos Section */}
                        {generatedImageUrls.length > 0 && (
                          <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                              {generatedImageUrls.map((image, index) => (
                                <div 
                                  key={index} 
                                  className="relative aspect-square"
                                >
                                  <img
                                    src={image}
                                    crossOrigin={image.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                                    referrerPolicy="no-referrer"
                                    alt={`Tree photo ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg cursor-pointer shadow-sm"
                                    onClick={() => openPhotoModal(index)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Map Screenshot */}
                        {generatedTreeScreenshotUrl && (
                          <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-400/30 rounded-lg p-2 sm:p-3 shadow-xl">
                            <div className="relative">
                              <img
                                src={generatedTreeScreenshotUrl}
                                crossOrigin={generatedTreeScreenshotUrl.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                                referrerPolicy="no-referrer"
                                alt="Map screenshot"
                                className="w-full h-20 sm:h-24 object-cover rounded cursor-pointer"
                                onClick={openMapScreenshotModal}
                              />
                              <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                Lokalizacja na mapie
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Application Info - Moved to bottom */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="relative rounded-xl p-1 shadow-lg border border-gray-200/40 dark:border-gray-400/30 mb-2 sm:mb-3"
                  >
                    <div className="bg-gray-50 dark:bg-gray-900 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                      {/* Application Info */}
                      <div className="space-y-3 mb-4">
                        {selectedTree && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 sm:p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Drzewo</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTree.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{selectedTree.location.address}</p>
                          </div>
                        )}
                        {selectedCommune && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 sm:p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gmina</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedCommune.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{selectedCommune.city}</p>
                          </div>
                        )}
                        {selectedTemplate && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 sm:p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Szablon wniosku</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTemplate.name}</p>
                          </div>
                        )}
                      </div>

                    {/* ePUAP Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-400/30 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      Instrukcja wysyłania wniosku na ePUAP:
                    </h4>
                    <div className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-4 h-4 bg-blue-100 dark:bg-blue-800 border border-blue-300 dark:border-blue-600 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-200">1</div>
                        <span>Zaloguj się na portalu <strong>ePUAP</strong> (epuap.gov.pl)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-4 h-4 bg-blue-100 dark:bg-blue-800 border border-blue-300 dark:border-blue-600 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-200">2</div>
                        <span>Wybierz odpowiednią <strong>gminę</strong> ({selectedCommune?.name || 'tę samą co w formularzu'})</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-4 h-4 bg-blue-100 dark:bg-blue-800 border border-blue-300 dark:border-blue-600 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-200">3</div>
                        <span>Znajdź sekcję <strong>"Wnioski"</strong> lub <strong>"Sprawy urzędowe"</strong></span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-4 h-4 bg-blue-100 dark:bg-blue-800 border border-blue-300 dark:border-blue-600 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-200">4</div>
                        <span>Wyślij wygenerowany <strong>PDF jako załącznik</strong> do odpowiedniego wniosku</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-4 h-4 bg-blue-100 dark:bg-blue-800 border border-blue-300 dark:border-blue-600 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-200">5</div>
                        <span>Podpisz wniosek <strong>profilem zaufanym</strong> i czekaj na odpowiedź od gminy</span>
                      </div>
                    </div>
                    {selectedCommune && (
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                        <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Kontakt do gminy:</p>
                        <p className="text-xs text-blue-800 dark:text-blue-200">Email: {selectedCommune.email}</p>
                        <p className="text-xs text-blue-800 dark:text-blue-200">Telefon: {selectedCommune.phone}</p>
                      </div>
                    )}
                  </div>

                    {/* Go to ePUAP Button */}
                    <GlassButton
                      onClick={() => window.open('https://epuap.gov.pl', '_blank')}
                      variant="primary"
                      size="sm"
                      className="w-full mb-2"
                      icon={ExternalLink}
                    >
                      Przejdź do ePUAP
                    </GlassButton>

                    {/* Create New Application Button */}
                    <GlassButton
                      onClick={handleCreateNewApplication}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      Zakończ
                    </GlassButton>
                  </div>
                </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Tree Selection Section - Hide when form or application view is shown */}
            {!canShowForm && !canShowApplicationView && (
              <div className="relative rounded-xl p-1 shadow-lg border border-gray-200/40 dark:border-gray-400/30 mb-2 sm:mb-3">
                <div className="bg-gray-50 dark:bg-gray-900 backdrop-blur-sm rounded-lg">
                  <div className="p-2 sm:p-3">
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Wybierz drzewo
                      </label>
                      
                      <div className="relative max-h-[30vh] overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 shadow-inner ring-1 ring-gray-100 dark:ring-gray-800">
                        {/* Top fade gradient */}
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-700/50 dark:to-transparent pointer-events-none z-10"></div>
                        {/* Bottom fade gradient */}
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-50/50 to-transparent dark:from-gray-700/50 dark:to-transparent pointer-events-none z-10"></div>
                        {trees.length > 0 && (
                          <TreeSelector
                            trees={trees}
                            selectedTree={selectedTree}
                            onTreeSelect={handleTreeSelect}
                            onLoadMore={handleLoadAllTrees}
                            isLoading={isLoading}
                            showAllTrees={showAllTrees}
                            onTreeClick={(tree) => setSelectedTree(tree)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Commune Selection Section - Show when tree is selected but hide when form or application view is shown */}
            <AnimatePresence>
              {canShowCommuneSelection && !canShowForm && !canShowApplicationView && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative rounded-xl p-1 shadow-lg border border-gray-200/40 dark:border-gray-400/30 mb-2 sm:mb-3"
                >
                  <div className="bg-gray-50 dark:bg-gray-900 backdrop-blur-sm rounded-lg">
                    <div className="p-2 sm:p-3">
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
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Template Selection Section - Show when commune is selected but hide when form or application view is shown */}
            <AnimatePresence>
              {canShowTemplateSelection && !canShowForm && !canShowApplicationView && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative rounded-xl p-1 shadow-lg border border-gray-200/40 dark:border-gray-400/30 mb-2 sm:mb-3"
                >
                  <div className="bg-gray-50 dark:bg-gray-900 backdrop-blur-sm rounded-lg">
                    <div className="p-2 sm:p-3">
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
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue Application Button - Show when there's an existing application but PDF not generated */}
            {!canShowForm && !canShowApplicationView && currentApplication && !isPdfGenerated && (
              <div className="w-full mb-2">
                <GlassButton
                  onClick={() => {
                    // Reset the flag so form can be loaded
                    setUserManuallyClosedForm(false);
                    
                    // Load form schema from localStorage without API call
                    const savedFormData = localStorage.getItem('applicationFormData');
                    if (savedFormData) {
                      try {
                        const formData = JSON.parse(savedFormData);
                        console.log('Loaded form data from localStorage:', formData);
                      } catch (error) {
                        console.error('Error loading form data from localStorage:', error);
                      }
                    }
                    
                    // Load form schema for existing application
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
                  className="w-full text-sm"
                >
                  {isLoading ? 'Ładowanie wniosku...' : 'Kontynuuj poprzedni wniosek'}
                </GlassButton>
              </div>
            )}

            {/* Create Application Button */}
            {!canShowForm && !canShowApplicationView && (
              <div className="w-full">
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
                      // Hide the form and mark that user manually closed it
                      setFormSchema(null);
                      setUserManuallyClosedForm(true);
                      // Keep currentApplication, selectedTree, selectedCommune, selectedTemplate
                      // User can return to the form by clicking "Kontynuuj wniosek" or "Utwórz wniosek"
                    }}
                    onClose={handleCloseForm}
                    isSubmitting={isSubmitting}
                    selectedTree={selectedTree}
                    selectedCommune={selectedCommune}
                    selectedTemplate={selectedTemplate}
                    applicationId={currentApplication?.id}
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

        {/* Create New Application Confirmation Modal */}
        {showCreateNewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 max-w-md w-full"
            >
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                Utworzyć nowy wniosek?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                Masz już wniosek w trakcie. Czy na pewno chcesz utworzyć nowy wniosek? 
                Możesz kontynuować obecny wniosek klikając "Kontynuuj wniosek".
              </p>
              <div className="flex space-x-2 sm:space-x-3">
                <GlassButton
                  onClick={() => setShowCreateNewModal(false)}
                  variant="secondary"
                  size="xs"
                  className="flex-1 text-xs sm:text-sm"
                >
                  Anuluj
                </GlassButton>
                <GlassButton
                  onClick={() => {
                    setShowCreateNewModal(false);
                    createNewApplication();
                  }}
                  variant="primary"
                  size="xs"
                  className="flex-1 text-xs sm:text-sm"
                  disabled={isCreatingApplication}
                >
                  {isCreatingApplication ? 'Tworzenie...' : 'Tak'}
                </GlassButton>
              </div>
            </motion.div>
          </div>
        )}

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {showPhotoModal && generatedImageUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4"
            onClick={closePhotoModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closePhotoModal}
                className="absolute -top-12 right-4 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Photo counter */}
              <div className="absolute -top-12 left-0 text-white text-lg font-medium z-10">
                {selectedPhotoIndex + 1} / {generatedImageUrls.length}
              </div>

              {/* Main photo */}
              <img
                src={generatedImageUrls[selectedPhotoIndex]}
                alt={`Photo ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                crossOrigin={generatedImageUrls[selectedPhotoIndex]?.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                referrerPolicy="no-referrer"
              />

              {/* Navigation arrows */}
              {generatedImageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 transition-colors rounded-full p-2"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 transition-colors rounded-full p-2"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Thumbnail strip */}
              {generatedImageUrls.length > 1 && (
                <div className="flex gap-2 bg-black/50 rounded-lg p-2 mt-4">
                  {generatedImageUrls.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`w-12 h-12 rounded overflow-hidden transition-opacity ${
                        index === selectedPhotoIndex ? 'opacity-100 ring-2 ring-white' : 'opacity-60 hover:opacity-80'
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        crossOrigin={photo?.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Screenshot Preview Modal */}
      <AnimatePresence>
        {showMapScreenshotModal && generatedTreeScreenshotUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4"
            onClick={closeMapScreenshotModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeMapScreenshotModal}
                className="absolute -top-12 right-4 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Title */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-white text-lg font-medium z-10 whitespace-nowrap">
                Screenshot mapy lokalizacji
              </div>

              {/* Main screenshot */}
              <img
                src={generatedTreeScreenshotUrl}
                alt="Map screenshot"
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-lg mx-auto block"
                crossOrigin={generatedTreeScreenshotUrl.includes('drzewapistorage.blob.core.windows.net') ? undefined : 'anonymous'}
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );

};