import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isPdfModalOpen: boolean;
  setPdfModalOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPdfModalOpen, setPdfModalOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ isPdfModalOpen, setPdfModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
