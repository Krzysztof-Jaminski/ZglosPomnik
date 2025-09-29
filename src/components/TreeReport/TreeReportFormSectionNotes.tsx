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
    <div className="relative bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-400/30 rounded-xl p-4 sm:p-6 shadow-xl w-full">
      <div className="space-y-4 sm:space-y-5">
        {/* Notes */}
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white resize-none transition-all min-h-[120px]"
          />
        </div>

        {/* Tree Stories and Legends */}
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white resize-none transition-all min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};
