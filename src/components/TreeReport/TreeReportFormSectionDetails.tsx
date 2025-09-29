import React from 'react';

interface TreeReportFormSectionDetailsProps {
  isAlive: boolean;
  setIsAlive: (alive: boolean) => void;
  estimatedAge: string;
  setEstimatedAge: (age: string) => void;
  detailedHealth: string[];
  setDetailedHealth: (health: string[]) => void;
  expandedCategories: {
    health: boolean;
    soil: boolean;
    environment: boolean;
  };
  setExpandedCategories: (categories: {
    health: boolean;
    soil: boolean;
    environment: boolean;
  }) => void;
}

export const TreeReportFormSectionDetails: React.FC<TreeReportFormSectionDetailsProps> = ({
  isAlive,
  setIsAlive,
  estimatedAge,
  setEstimatedAge,
  detailedHealth,
  setDetailedHealth,
  expandedCategories,
  setExpandedCategories
}) => {
  return (
    <div className="relative bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm border border-green-200/50 dark:border-green-400/30 rounded-lg p-2 sm:p-3 shadow-xl w-full">
      <div className="space-y-2 sm:space-y-3">
        {/* Tree status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Czy drzewo żyje?
            </label>
            <input
              type="text"
              defaultValue={isAlive ? 'tak' : 'nie'}
              onBlur={(e) => {
                const value = e.target.value.toLowerCase();
                // Wszystko co nie jest "nie" = "tak"
                setIsAlive(value !== 'nie');
              }}
              placeholder="tak / nie"
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Szacowany wiek (lata) <span className="text-gray-500">(opcjonalny)</span>
            </label>
            <input
              type="number"
              value={estimatedAge}
              onChange={(e) => setEstimatedAge(e.target.value)}
              placeholder="np. 150"
              min="0"
              step="1"
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>
        </div>

        {/* Additional tree information */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Dodatkowe informacje o drzewie
          </label>
          
          {/* Stan zdrowia */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            <button
              type="button"
              onClick={() => setExpandedCategories(prev => ({ ...prev, health: !prev.health }))}
              className="no-focus flex items-center justify-between w-full text-left p-1 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Stan zdrowia</span>
              </div>
              <span className="text-sm text-gray-400 font-bold">{expandedCategories.health ? '−' : '+'}</span>
            </button>
            {expandedCategories.health && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                {[
                  'Dobry stan', 'Zdrowy', 'Silny',
                  'Złamania', 'Ubytki w pniu', 'Odbarwienia', 'Narośla',
                  'Posusz', 'Choroby grzybowe', 'Szkodniki', 'Uszkodzenia mechaniczne', 'Zgnilizna', 'Pęknięcia'
                ].map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => {
                      if (detailedHealth.includes(condition)) {
                        setDetailedHealth(prev => prev.filter(item => item !== condition));
                      } else {
                        setDetailedHealth(prev => [...prev, condition]);
                      }
                    }}
                    className={`no-focus p-1.5 rounded text-xs text-left transition-all ${
                      detailedHealth.includes(condition)
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rodzaj gleby */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            <button
              type="button"
              onClick={() => setExpandedCategories(prev => ({ ...prev, soil: !prev.soil }))}
              className="no-focus flex items-center justify-between w-full text-left p-1 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Rodzaj gleby</span>
              </div>
              <span className="text-lg text-gray-400 font-bold">{expandedCategories.soil ? '−' : '+'}</span>
            </button>
            {expandedCategories.soil && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                {[
                  'Gleba gliniasta', 'Gleba piaszczysta', 'Gleba próchniczna',
                  'Gleba kwaśna', 'Gleba zasadowa', 'Gleba wilgotna', 'Gleba sucha'
                ].map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => {
                      if (detailedHealth.includes(condition)) {
                        setDetailedHealth(prev => prev.filter(item => item !== condition));
                      } else {
                        // Check if this is a soil condition and limit to 3
                        const soilConditions = [
                          'Gleba gliniasta', 'Gleba piaszczysta', 'Gleba próchniczna',
                          'Gleba kwaśna', 'Gleba zasadowa', 'Gleba wilgotna', 'Gleba sucha'
                        ];
                        if (soilConditions.includes(condition)) {
                          const currentSoilCount = detailedHealth.filter(h => soilConditions.includes(h)).length;
                          if (currentSoilCount >= 3) {
                            // Remove the first selected soil condition
                            const firstSoilIndex = detailedHealth.findIndex(h => soilConditions.includes(h));
                            if (firstSoilIndex !== -1) {
                              const newHealth = [...detailedHealth];
                              newHealth.splice(firstSoilIndex, 1);
                              setDetailedHealth([...newHealth, condition]);
                              return;
                            }
                          }
                        }
                        setDetailedHealth(prev => [...prev, condition]);
                      }
                    }}
                    className={`no-focus p-1.5 rounded text-xs text-left transition-all ${
                      detailedHealth.includes(condition)
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Warunki środowiskowe */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            <button
              type="button"
              onClick={() => setExpandedCategories(prev => ({ ...prev, environment: !prev.environment }))}
              className="no-focus flex items-center justify-between w-full text-left p-1 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Warunki środowiskowe</span>
              </div>
              <span className="text-lg text-gray-400 font-bold">{expandedCategories.environment ? '−' : '+'}</span>
            </button>
            {expandedCategories.environment && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                {[
                  'Ekspozycja słoneczna', 'Cień częściowy', 'Cień głęboki',
                  'Wiatr', 'Zanieczyszczenia', 'Bliskość dróg', 'Bliskość budynków',
                  'Drenaż dobry', 'Drenaż słaby', 'Wilgotność wysoka', 'Wilgotność niska'
                ].map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => {
                      if (detailedHealth.includes(condition)) {
                        setDetailedHealth(prev => prev.filter(item => item !== condition));
                      } else {
                        setDetailedHealth(prev => [...prev, condition]);
                      }
                    }}
                    className={`no-focus p-1.5 rounded text-xs text-left transition-all ${
                      detailedHealth.includes(condition)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
