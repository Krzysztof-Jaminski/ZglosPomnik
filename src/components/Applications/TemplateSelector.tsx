import React from 'react';
import { motion } from 'framer-motion';
import { ApplicationTemplate } from '../../types';
import { GlassButton } from '../UI/GlassButton';
import { ArrowLeft, ArrowRight, FileText, CheckCircle } from 'lucide-react';

interface TemplateSelectorProps {
  templates: ApplicationTemplate[];
  selectedTemplate: ApplicationTemplate | null;
  onTemplateSelect: (template: ApplicationTemplate) => void;
  onBack: () => void;
  onNext: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onBack,
  onNext
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-6">
        <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Wybierz rodzaj wniosku
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Wybierz odpowiedni szablon wniosku dla swojej gminy
        </p>
      </div>

      <div className="space-y-3">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTemplateSelect(template)}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg cursor-pointer transition-all p-4 border-2 ${
              selectedTemplate?.id === template.id 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {template.description}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {template.isActive ? 'Aktywny' : 'Nieaktywny'}
                  </span>
                </div>
              </div>
              
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedTemplate?.id === template.id 
                  ? 'bg-green-600 border-green-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {selectedTemplate?.id === template.id && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <GlassButton
          onClick={onBack}
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
        >
          Wstecz
        </GlassButton>
        
        <GlassButton
          onClick={onNext}
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
};

