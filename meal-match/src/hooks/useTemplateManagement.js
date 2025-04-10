'use client';

import { useState } from 'react';
import { saveTemplate } from '../services/apiService';
import { extractComponentsForTemplate, groupMealsByDayForTemplate } from '../utils/templateUtils';

/**
 * Hook for managing templates
 * @param {Object} options - Hook options
 * @param {string} options.userId - User ID
 * @param {Array} options.mealsData - Meals data
 * @param {Array} options.componentsData - Components data
 * @param {Function} options.onTemplateCreated - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Template management state and functions
 */
export default function useTemplateManagement({
  userId,
  mealsData,
  componentsData,
  onTemplateCreated,
  onError
}) {
  const [isSaveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAsTemplate = () => {
    // Check if there are any meals to save
    const hasContent = mealsData.some(meal => 
      (meal.components && meal.components.length > 0) || 
      (meal.name && meal.name.trim() !== '')
    );
    
    if (!hasContent) {
      if (onError) onError("Please add some meals to your week before saving as a template.");
      return;
    }
    
    setSaveTemplateModalOpen(true);
  };

  const handleCreateTemplate = async (templateData) => {
    try {
      setIsSaving(true);
      
      // Prepare data for the template
      const componentsToInclude = extractComponentsForTemplate(mealsData, componentsData);
      const daysArray = groupMealsByDayForTemplate(mealsData);
      
      // Save the template
      const result = await saveTemplate(
        templateData,
        userId,
        daysArray,
        componentsToInclude
      );
      
      // Close the modal and notify about success
      setSaveTemplateModalOpen(false);
      if (onTemplateCreated) onTemplateCreated(result);
      
      return result;
    } catch (error) {
      if (onError) onError('Failed to save template: ' + error.message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaveTemplateModalOpen,
    setSaveTemplateModalOpen,
    isSaving,
    handleSaveAsTemplate,
    handleCreateTemplate
  };
}