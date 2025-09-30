import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { ApplicationTemplate } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface TemplateSelectorProps {
  templates: ApplicationTemplate[];
  selectedTemplate: ApplicationTemplate | null;
  onTemplateSelect: (template: ApplicationTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTemplates, setExpandedTemplates] = useState(true);

  // Simple filter function
  const getFilteredTemplates = () => {
    if (!searchQuery.trim()) return templates;
    
    const query = searchQuery.toLowerCase();
    return templates.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.template.toLowerCase().includes(query)
    );
  };

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className="space-y-2">
      {/* Search Filter - Always visible */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
        <input
          type="text"
          placeholder="Szukaj po nazwie szablonu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
        />
      </div>

      {/* Templates List */}
      <div className="bg-gradient-to-r from-orange-50/20 to-orange-100/10 dark:from-orange-900/20 dark:to-orange-800/10 border border-orange-200/30 dark:border-orange-700/30 rounded-lg p-2">
        <button
          type="button"
          onClick={() => setExpandedTemplates(!expandedTemplates)}
          className="no-focus flex items-center justify-between w-full text-left p-1 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Wybierz szablon wniosku
            </span>
            <span className="text-xs text-gray-500 bg-white/50 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {filteredTemplates.length}
            </span>
          </div>
          <span className="text-sm text-gray-400 font-bold">
            {expandedTemplates ? '−' : '+'}
          </span>
        </button>
        
        <AnimatePresence>
          {expandedTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1"
            >
              {filteredTemplates.slice(0, 10).map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onTemplateSelect(template)}
                  className={`no-focus p-1.5 rounded text-xs text-left transition-all w-full ${
                    selectedTemplate?.id === template.id
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-700'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{template.name}</div>
                      <div className="text-gray-500 dark:text-gray-400 truncate">
                        {template.description}
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedTemplate?.id === template.id 
                          ? 'bg-orange-600' 
                          : 'border-2 border-gray-300'
                      }`}>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              
              {filteredTemplates.length === 0 && searchQuery && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-xs">Nie znaleziono szablonów pasujących do wyszukiwania</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};