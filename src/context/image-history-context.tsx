
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ImageHistoryEntry } from '@/types';

interface ImageHistoryContextType {
  imageHistory: ImageHistoryEntry[];
  isLoadingImageHistory: boolean;
  addImageToHistory: (entryData: Omit<ImageHistoryEntry, 'id' | 'timestamp'>) => string;
  clearImageHistory: () => void;
}

const ImageHistoryContext = createContext<ImageHistoryContextType | undefined>(undefined);

const IMAGE_HISTORY_STORAGE_KEY = 'enyi-image-history';

export const ImageHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [imageHistory, setImageHistory] = useState<ImageHistoryEntry[]>([]);
  const [isLoadingImageHistory, setIsLoadingImageHistory] = useState(true);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(IMAGE_HISTORY_STORAGE_KEY);
      if (storedHistory) {
        const parsedHistory: ImageHistoryEntry[] = JSON.parse(storedHistory).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
        setImageHistory(parsedHistory);
      }
    } catch (error) {
      console.error("Failed to load image history from localStorage", error);
    } finally {
      setIsLoadingImageHistory(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoadingImageHistory) {
      try {
        localStorage.setItem(IMAGE_HISTORY_STORAGE_KEY, JSON.stringify(imageHistory));
      } catch (error) {
        console.error("Failed to save image history to localStorage", error);
      }
    }
  }, [imageHistory, isLoadingImageHistory]);

  const addImageToHistory = useCallback((entryData: Omit<ImageHistoryEntry, 'id' | 'timestamp'>): string => {
    const entryId = uuidv4();
    const newEntry: ImageHistoryEntry = {
      ...entryData,
      id: entryId,
      timestamp: new Date(),
    };
    setImageHistory((prevHistory) => [newEntry, ...prevHistory].slice(0, 50)); // Keep last 50 images
    return entryId;
  }, []);

  const clearImageHistory = useCallback(() => {
    setImageHistory([]);
  }, []);

  return (
    <ImageHistoryContext.Provider value={{ imageHistory, isLoadingImageHistory, addImageToHistory, clearImageHistory }}>
      {children}
    </ImageHistoryContext.Provider>
  );
};

export const useImageHistory = (): ImageHistoryContextType => {
  const context = useContext(ImageHistoryContext);
  if (context === undefined) {
    throw new Error('useImageHistory must be used within an ImageHistoryProvider');
  }
  return context;
};
