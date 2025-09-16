import React, { useState, useMemo } from 'react';
import { Search, FileText, CheckCircle } from 'lucide-react';
import { ApplicationTemplate } from '../../types';
import { motion } from 'framer-motion';

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

  // Filter templates based on search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    
    const query = searchQuery.toLowerCase();
    return templates.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.template.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Szukaj po nazwie szablonu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Templates List - Limited Height with Scroll */}
      <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
        {filteredTemplates.map(template => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.005 }}
            onClick={() => onTemplateSelect(template)}
            className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg cursor-pointer transition-all p-3 ${
              selectedTemplate?.id === template.id ? 'ring-2 ring-green-500 bg-green-50/50 dark:bg-green-900/20' : 'hover:shadow-xl hover:bg-white/90 dark:hover:bg-gray-800/90'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                  {template.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {template.requiredFields?.length || 0} pól wymaganych
                  </span>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    selectedTemplate?.id === template.id 
                      ? 'bg-green-600 border-green-600' 
                      : 'border-gray-300'
                  }`}>
                    {selectedTemplate?.id === template.id && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredTemplates.length === 0 && searchQuery && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p>Nie znaleziono szablonów pasujących do wyszukiwania</p>
          </div>
        )}
      </div>
    </div>
  );
};