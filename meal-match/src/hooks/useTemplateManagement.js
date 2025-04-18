'use client';
import { useState } from 'react';
import { createTemplateFromUserData } from '@/actions/templateActions';

export default function useTemplateManagement({
  userId,
  mealsData,
  componentsData,
  onTemplateCreated,
  onError
}) {
  const [isSaveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Use the server action instead of client-side processing
  const handleCreateTemplate = async (templateData) => {
    try {
      setIsSaving(true);
      
      // FILTER OUT DUPLICATES AND ENSURE MEALS HAVE CONTENT
      const uniqueMeals = [];
      const seenMealKeys = new Set(); // Track seen day+type combinations
      
      mealsData.forEach(meal => {
        // Only include meals with actual content
        const hasContent = 
          (Array.isArray(meal.components) && meal.components.length > 0) || 
          (meal.name && meal.name !== `${meal.day_of_week} ${meal.meal_type}`);
          
        if (hasContent) {
          const mealKey = `${meal.day_of_week}-${meal.meal_type}`;
          
          // Only add if we haven't seen this day+type combination before
          if (!seenMealKeys.has(mealKey)) {
            seenMealKeys.add(mealKey);
            uniqueMeals.push(meal);
          }
        }
      });
      
      console.log(`Filtered ${uniqueMeals.length} unique meals with content from ${mealsData.length} total meals`);
      
      // Debug the filtered meals
      const filteredMealsByDay = {};
      uniqueMeals.forEach(meal => {
        if (!filteredMealsByDay[meal.day_of_week]) {
          filteredMealsByDay[meal.day_of_week] = [];
        }
        filteredMealsByDay[meal.day_of_week].push({
          type: meal.meal_type,
          name: meal.name,
          hasComponents: (meal.components && meal.components.length > 0)
        });
      });
      
      console.log("FILTERED MEALS BY DAY:", JSON.stringify(filteredMealsByDay, null, 2));
      
      // Use the filtered unique meals with content
      const result = await createTemplateFromUserData(userId, {
        name: templateData.name,
        description: templateData.description,
        isPublic: templateData.isPublic || false,
        tags: templateData.tags || [],
        dietaryPreferences: templateData.dietaryPreferences || [],
        currentMeals: uniqueMeals
      });
      
      // Close the modal after successful save
      setSaveTemplateModalOpen(false);
      
      if (onTemplateCreated) {
        onTemplateCreated(result);
      }
      
      return result;
    } catch (error) {
      console.error("Error creating template:", error);
      if (onError) {
        onError(error.message || "Failed to create template");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsTemplate = () => {
    // Check if there are any meals to save
    const hasContent = mealsData.some(meal => 
      (meal.components && meal.components.length > 0) || 
      (meal.name && meal.name.trim() !== '')
    );
    
    if (hasContent) {
      setSaveTemplateModalOpen(true);
    } else {
      onError("No meals to save - add some meals to your plan first");
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