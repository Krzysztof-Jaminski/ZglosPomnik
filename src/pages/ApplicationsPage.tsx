import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Plus, Bot, MapPin, User, Mail, Phone, FileCheck, MessageCircle, X, Send } from 'lucide-react';
import { Tree, ApplicationTemplate, Municipality } from '../types';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from '../components/UI/GlassButton';

type ApplicationStep = 'overview' | 'select-tree' | 'select-municipality' | 'fill-form' | 'generate-pdf' | 'instructions' | 'completed';

interface ApplicationForm {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  justification: string;
  additionalInfo: string;
  templateId: string;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ApplicationsPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>(() => {
    return (localStorage.getItem('applicationStep') as ApplicationStep) || 'overview';
  });
  const [trees, setTrees] = useState<Tree[]>([]);
  const [templates, setTemplates] = useState<ApplicationTemplate[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(() => {
    const saved = localStorage.getItem('selectedTree');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(() => {
    const saved = localStorage.getItem('selectedMunicipality');
    return saved ? JSON.parse(saved) : null;
  });
  const [applicationForm, setApplicationForm] = useState<ApplicationForm>({
    applicantName: 'Anna Kowalska',
    applicantEmail: 'anna.kowalska@example.com',
    applicantPhone: '+48 123 456 789',
    justification: '',
    additionalInfo: '',
    templateId: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isAiHelping, setIsAiHelping] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

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
    const loadData = async () => {
      try {
        const [treesData, templatesData, municipalitiesData] = await Promise.all([
          api.getTrees(),
          api.getApplicationTemplates(),
          api.getMunicipalities()
        ]);
        setTrees(treesData);
        setTemplates(templatesData);
        setMunicipalities(municipalitiesData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const getStepNumber = (step: ApplicationStep): number => {
    const steps = ['overview', 'select-tree', 'select-municipality', 'fill-form', 'generate-pdf', 'instructions', 'completed'];
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

  const handleTreeSelect = (tree: Tree) => {
    setSelectedTree(tree);
    // Auto-select municipality based on tree location (mock logic)
    if (municipalities.length > 0) {
      setSelectedMunicipality(municipalities[0]);
    }
    setCurrentStep('select-municipality');
  };

  const handleAiHelp = async () => {
    if (!selectedTree) return;
    
    setIsAiHelping(true);
    // Mock AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiJustification = `Wnoszę o objęcie ochroną prawną drzewa ${selectedTree.species} (${selectedTree.speciesLatin}) ze względu na jego wyjątkowe walory przyrodnicze i krajobrazowe. Drzewo charakteryzuje się ${selectedTree.description.toLowerCase()}. Jego zachowanie jest istotne dla lokalnego ekosystemu i dziedzictwa przyrodniczego naszej gminy.`;
    
    setApplicationForm(prev => ({
      ...prev,
      justification: aiJustification
    }));
    setIsAiHelping(false);
  };

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      // Mock PDF generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      setGeneratedPdfUrl('mock-pdf-url');
      setCurrentStep('instructions');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAiTyping(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getAiResponse(chatInput),
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsAiTyping(false);
    }, 1500);
  };

  const getAiResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('epuap') || q.includes('wysłać')) {
      return 'Aby wysłać wniosek przez ePUAP: 1) Zaloguj się na epuap.gov.pl, 2) Znajdź swoją gminę, 3) Wybierz usługę "Pomniki przyrody", 4) Załącz wygenerowany PDF i wypełnij formularz online.';
    }
    if (q.includes('gmina') || q.includes('urząd')) {
      return 'Możesz też wysłać wniosek tradycyjnie - pocztą lub osobiście do urzędu gminy. Adres znajdziesz w instrukcjach po wygenerowaniu PDF.';
    }
    if (q.includes('pdf') || q.includes('dokument')) {
      return 'PDF zawiera wszystkie potrzebne informacje o drzewie i Twoich danych. Pamiętaj, żeby go podpisać przed wysłaniem!';
    }
    return 'Jestem tutaj, żeby pomóc! Możesz zapytać mnie o proces wysyłania wniosku, ePUAP, lub wymagane dokumenty.';
  };

  const clearProgress = () => {
    localStorage.removeItem('applicationStep');
    localStorage.removeItem('selectedTree');
    localStorage.removeItem('selectedMunicipality');
    setCurrentStep('overview');
    setSelectedTree(null);
    setSelectedMunicipality(null);
    setApplicationForm({
      applicantName: 'Anna Kowalska',
      applicantEmail: 'anna.kowalska@example.com',
      applicantPhone: '+48 123 456 789',
      justification: '',
      additionalInfo: '',
      templateId: ''
    });
    setGeneratedPdfUrl(null);
  };

  const renderProgressBar = () => {
    const currentStepNumber = getStepNumber(currentStep);
    const totalSteps = 6; // We show 6 main steps in progress bar (excluding overview)
    
    return (
      <div className="flex items-center justify-center">
        {[1, 2, 3, 4, 5, 6].map((step, index) => (
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
      className="max-w-2xl sm:max-w-none mx-auto px-1 sm:px-0"
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
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Znajdź drzewo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Wybierz swoje drzewo oczekujące na weryfikację lub pomnik przyrody
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-5 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
            2
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Wypełnij dane</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Uzupełnij informacje o gminie i uzasadnienie
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-5 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
            3
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Wygeneruj PDF</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pobierz gotowy wniosek i wyślij do gminy
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
      className="max-w-3xl sm:max-w-none mx-auto px-1 sm:px-0"
    >
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Wybierz drzewo
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          Wybierz drzewo, dla którego chcesz utworzyć wniosek
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {trees.map(tree => (
          <motion.div
            key={tree.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTreeSelect(tree)}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg cursor-pointer transition-all p-2 sm:p-3 ${
              selectedTree?.id === tree.id ? 'ring-2 ring-green-500' : 'hover:shadow-xl'
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
      className="max-w-3xl sm:max-w-none mx-auto px-1 sm:px-0"
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
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg cursor-pointer transition-all p-2 sm:p-3 ${
              selectedMunicipality?.id === municipality.id ? 'ring-2 ring-green-500' : 'hover:shadow-xl'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {municipality.name}
                </h3>
                <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                  <p>Email: {municipality.contact.email}</p>
                  <p>Telefon: {municipality.contact.phone}</p>
                  <p>Adres: {municipality.contact.address}</p>
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
          onClick={() => setCurrentStep('fill-form')}
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

  const renderFormFilling = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl sm:max-w-none mx-auto px-1 sm:px-0"
    >
      <div className="text-center mb-2 sm:mb-3">
        <h2 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
          Wypełnij dane wniosku
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Uzupełnij swoje dane i uzasadnienie wniosku
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 sm:p-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2 sm:space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                <User className="w-3 h-3 inline mr-1" />
                Imię i nazwisko
              </label>
              <input
                type="text"
                value={applicationForm.applicantName}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, applicantName: e.target.value }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Mail className="w-3 h-3 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={applicationForm.applicantEmail}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, applicantEmail: e.target.value }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Phone className="w-3 h-3 inline mr-1" />
                Numer telefonu
              </label>
              <input
                type="tel"
                value={applicationForm.applicantPhone}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, applicantPhone: e.target.value }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Typ wniosku
              </label>
              <select
                value={applicationForm.templateId}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, templateId: e.target.value }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Wybierz typ wniosku</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Uzasadnienie wniosku
                </label>
                <GlassButton
                  onClick={handleAiHelp}
                  disabled={isAiHelping || !selectedTree}
                  variant="secondary"
                  size="xs"
                  icon={Bot}
                >
                  <span style={{ fontSize: '9px' }}>{isAiHelping ? 'Generowanie...' : 'Pomoc AI'}</span>
                </GlassButton>
              </div>
              <textarea
                value={applicationForm.justification}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, justification: e.target.value }))}
                rows={3}
                placeholder="Opisz dlaczego to drzewo zasługuje na ochronę..."
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dodatkowe informacje
              </label>
              <textarea
                value={applicationForm.additionalInfo}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                rows={2}
                placeholder="Dodatkowe uwagi, kontekst historyczny, itp..."
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-2 sm:mt-3">
        <GlassButton
          onClick={() => setCurrentStep('select-municipality')}
          variant="secondary"
          size="xs"
          icon={ArrowLeft}
        >
          <span style={{ fontSize: '10px' }}>Wstecz</span>
        </GlassButton>
        <GlassButton
          onClick={handleGeneratePdf}
          disabled={!applicationForm.applicantName || !applicationForm.justification || !applicationForm.templateId || isGenerating}
          variant="primary"
          size="xs"
          icon={FileCheck}
        >
          <span style={{ fontSize: '10px' }}>{isGenerating ? 'Generowanie PDF...' : 'Wygeneruj PDF'}</span>
        </GlassButton>
      </div>
    </motion.div>
  );

  const renderInstructions = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl sm:max-w-none mx-auto px-1 sm:px-0"
    >
      <div className="mb-2 sm:mb-3 text-center">
        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1" />
        <h2 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
          Wniosek został wygenerowany!
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
          Twój wniosek jest gotowy do wysłania. Postępuj zgodnie z instrukcjami poniżej.
        </p>
      </div>

      {/* Detailed Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 sm:p-3 mb-2 sm:mb-3">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">
          📋 Instrukcja wysyłania wniosku przez ePUAP
        </h3>
        
        <div className="space-y-1 sm:space-y-2 text-left">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              1
            </div>
            <div>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                Pobierz wygenerowany PDF
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                Zapisz plik na swoim komputerze - będziesz go potrzebować do załączenia
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              2
            </div>
            <div>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                Zaloguj się na platformie ePUAP
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                Przejdź na stronę epuap.gov.pl i zaloguj się swoim profilem zaufanym
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              3
            </div>
            <div>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                Znajdź swoją gminę
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                Wyszukaj "{selectedMunicipality?.name}" w katalogu urzędów
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              4
            </div>
            <div>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                Wybierz odpowiednią usługę
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                Szukaj usługi "Pomniki przyrody", "Zgłoszenia dotyczące drzew" lub podobnej
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              5
            </div>
            <div>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                Wypełnij formularz i załącz PDF
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                Uzupełnij wymagane pola i załącz pobrany wcześniej plik PDF
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              6
            </div>
            <div>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                Wyślij wniosek i zachowaj numer sprawy
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                Po wysłaniu otrzymasz numer sprawy - zapisz go do śledzenia statusu
              </p>
            </div>
          </div>
        </div>

        {selectedMunicipality && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">
              📞 Kontakt do gminy w razie problemów:
            </h4>
            <div className="space-y-0.5 text-xs text-blue-800 dark:text-blue-200" style={{ fontSize: '10px' }}>
              <p>📧 Email: {selectedMunicipality.contact.email}</p>
              <p>📞 Telefon: {selectedMunicipality.contact.phone}</p>
              <p>📍 Adres: {selectedMunicipality.contact.address}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
        <GlassButton
          onClick={() => window.open(generatedPdfUrl || '#', '_blank')}
          variant="primary"
          size="xs"
          icon={Download}
        >
          <span style={{ fontSize: '10px' }}>Pobierz PDF</span>
        </GlassButton>
        <GlassButton
          onClick={() => {
            window.open('https://epuap.gov.pl', '_blank');
            setCurrentStep('completed');
          }}
          variant="primary"
          size="xs"
          icon={ExternalLink}
        >
          <span style={{ fontSize: '10px' }}>Otwórz ePUAP</span>
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
          onClick={() => setCurrentStep('instructions')}
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
                <p className="text-gray-600 dark:text-gray-400">Email: {selectedMunicipality.contact.email}</p>
                <p className="text-gray-600 dark:text-gray-400">Telefon: {selectedMunicipality.contact.phone}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Adres urzędu:</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedMunicipality.contact.address}</p>
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

  const renderAiAssistant = () => (
    <div className="fixed bottom-4 right-4 z-50">
      {showAiAssistant ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-80 h-96 flex flex-col"
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Asystent AI</h3>
            </div>
            <button
              onClick={() => setShowAiAssistant(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Cześć! Jestem tutaj, żeby pomóc Ci z procesem wysyłania wniosku. Zadaj mi pytanie!
              </div>
            )}
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    message.isUser
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Zadaj pytanie..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <GlassButton
          onClick={() => setShowAiAssistant(true)}
          variant="primary"
          size="sm"
          icon={MessageCircle}
          className="!rounded-full !p-3"
        >
          <span className="sr-only">Otwórz asystenta AI</span>
        </GlassButton>
      )}
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
          {currentStep === 'fill-form' && renderFormFilling()}
          {currentStep === 'instructions' && renderInstructions()}
          {currentStep === 'completed' && renderCompleted()}
        </AnimatePresence>

        {/* AI Assistant */}
        {currentStep !== 'overview' && renderAiAssistant()}

        {/* Instructions Modal */}
        {showInstructionsModal && renderInstructionsModal()}
      </div>
    </div>
  );
};