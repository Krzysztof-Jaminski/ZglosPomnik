import React from 'react';

interface TreeReportFormSectionNotesProps {
  notes: string;
  setNotes: (notes: string) => void;
  treeStories: string;
  setTreeStories: (stories: string) => void;
}

export const TreeReportFormSectionNotes: React.FC<TreeReportFormSectionNotesProps> = ({
  notes,
  setNotes,
  treeStories,
  setTreeStories
}) => {
  return (
    <div className="relative bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-400/30 rounded-lg p-2 sm:p-3 shadow-xl w-full">
      <div className="space-y-2 sm:space-y-3">
        {/* Notes */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Uwagi i opis stanu drzewa
          </label>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            placeholder="Opisz rzeczy, których nie zaznaczyłeś w poprzednich miejscach lub wymagają dopowiedzenia..."
            rows={5}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white resize-none transition-all min-h-[80px]"
          />
        </div>

        {/* Tree Stories and Legends */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Historie i legendy drzewa <span className="text-gray-500">(opcjonalne)</span>
          </label>
          <textarea
            value={treeStories}
            onChange={(e) => {
              setTreeStories(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            placeholder="Podziel się historiami, legendami lub ciekawostkami związanymi z tym drzewem..."
            rows={4}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white resize-none transition-all min-h-[60px]"
          />
        </div>
      </div>
    </div>
  );
};
