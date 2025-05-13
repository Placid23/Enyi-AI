'use client';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';

interface AppSettingsContextType {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  return (
    <AppSettingsContext.Provider value={{ currentLanguage, setCurrentLanguage }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = (): AppSettingsContextType => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};
