import React, { useState, useEffect } from 'react';

const PhoneMockup: React.FC = (): JSX.Element => {
  const [currentScreen, setCurrentScreen] = useState(0);
  
  // Screeny aplikacji ZgłośPomnik
  const appScreens = [
    {
      id: 1,
      title: 'Ekran 1',
      content: (
        <div className="w-full h-full bg-black overflow-hidden flex flex-col">
          <div className="h-6"></div>
          <div className="flex-1 relative px-1">
            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900">
              <img 
                src="/P1.png" 
                alt="Screen 1"
                className="w-full h-full object-cover opacity-95"
              />
            </div>
          </div>
          <div className="h-8"></div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Ekran 2',
      content: (
        <div className="w-full h-full bg-black overflow-hidden flex flex-col">
          <div className="h-6"></div>
          <div className="flex-1 relative px-1">
            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900">
              <img 
                src="/P2.png" 
                alt="Screen 2"
                className="w-full h-full object-cover opacity-95"
              />
            </div>
          </div>
          <div className="h-8"></div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Ekran 3',
      content: (
        <div className="w-full h-full bg-black overflow-hidden flex flex-col">
          <div className="h-6"></div>
          <div className="flex-1 relative px-1">
            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900">
              <img 
                src="/P3.png" 
                alt="Screen 3"
                className="w-full h-full object-cover opacity-95"
              />
            </div>
          </div>
          <div className="h-8"></div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Ekran 4',
      content: (
        <div className="w-full h-full bg-black overflow-hidden flex flex-col">
          <div className="h-6"></div>
          <div className="flex-1 relative px-1">
            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900">
              <img 
                src="/P4.png" 
                alt="Screen 4"
                className="w-full h-full object-cover opacity-95"
              />
            </div>
          </div>
          <div className="h-8"></div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Ekran 5',
      content: (
        <div className="w-full h-full bg-black overflow-hidden flex flex-col">
          <div className="h-6"></div>
          <div className="flex-1 relative px-1">
            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900">
              <img 
                src="/P5.png" 
                alt="Screen 5"
                className="w-full h-full object-cover opacity-95"
              />
            </div>
          </div>
          <div className="h-8"></div>
        </div>
      )
    },
    {
      id: 6,
      title: 'Ekran 6',
      content: (
        <div className="w-full h-full bg-black overflow-hidden flex flex-col">
          <div className="h-6"></div>
          <div className="flex-1 relative px-1">
            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-900">
              <img 
                src="/P6.png" 
                alt="Screen 6"
                className="w-full h-full object-cover opacity-95"
              />
            </div>
          </div>
          <div className="h-8"></div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % appScreens.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [appScreens.length]);

  return (
    <div className="relative">
      {/* Ramka telefonu */}
      <div className="relative w-60 h-[540px] bg-black rounded-[2.5rem] p-2 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
          
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black rounded-b-xl z-10"></div>
          
          {/* Screen container */}
          <div className="relative w-full h-full">
            {appScreens.map((screen, index) => (
              <div
                key={screen.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentScreen ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {screen.content}
              </div>
            ))}

            {/* Screen indicator dots */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-20">
              {appScreens.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentScreen ? 'bg-green-400' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;