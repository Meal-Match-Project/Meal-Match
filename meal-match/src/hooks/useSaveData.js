'use client';

import { useState, useEffect, useCallback } from 'react';
import { saveMealPlanData } from '@/services/apiService';

export default function useSaveData({ userId, componentsData, mealsData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveNeeded, setSaveNeeded] = useState(false);
  
  const markSaveNeeded = useCallback(() => {
    setSaveNeeded(true);
  }, []);
  
  // Save data when changes occur, with debounce
  useEffect(() => {
    if (!saveNeeded || !userId || isSaving) return;
    
    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      
      try {
        const result = await saveMealPlanData(
          userId, 
          componentsData, 
          mealsData
        );
        
        if (result.success) {
          setLastSaved(new Date());
          setSaveNeeded(false);
        } else {
          console.error("Error saving data:", result.error);
        }
      } catch (error) {
        console.error("Error saving data:", error);
      } finally {
        setIsSaving(false);
      }
    }, 2000); // 2-second debounce
    
    return () => clearTimeout(timeoutId);
  }, [saveNeeded, userId, componentsData, mealsData, isSaving]);
  
  return {
    isSaving,
    lastSaved,
    saveNeeded,
    markSaveNeeded
  };
}