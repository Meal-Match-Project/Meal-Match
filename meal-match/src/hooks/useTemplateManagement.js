'use client';
import { useState } from 'react';
import { extractComponentsForTemplate } from '@/utils/templateUtils';
import { createTemplate } from '@/services/apiService';

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
    
    if (hasContent) {
      setSaveTemplateModalOpen(true);
    } else {
      onError("No meals to save - add some meals to your plan first");
    }
  };

  const handleCreateTemplate = async (templateData) => {
    try {
      setIsSaving(true);
      
      // Create a deduplicated structure for the template
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const mealTypes = ['Breakfast', 'Lunch', 'Dinner']; // Add other meal types if needed
      
      console.log(`Starting template creation with ${mealsData.length} meals`);
      
      // Create a map to store one meal per day per type
      const uniqueMealsMap = {};
      
      // Process meals - prioritize meals with components
      mealsData.forEach(meal => {
        const day = meal.day_of_week;
        const mealType = meal.meal_type;
        
        // Skip if missing necessary data
        if (!day || !mealType) return;
        
        // Create key for this day/meal type combination
        const key = `${day}-${mealType}`;
        
        // Skip empty meals (no name or components)
        const isEmpty = (!meal.components || meal.components.length === 0) && 
                       (!meal.name || meal.name.trim() === '');
        if (isEmpty) {
          // Only add if we don't already have a meal for this day/type
          if (!uniqueMealsMap[key]) {
            uniqueMealsMap[key] = meal;
          }
          return;
        }
        
        // For meals with content, always replace existing (prioritize meals with content)
        if (meal.components?.length > 0 || (meal.name && meal.name.trim() !== '')) {
          uniqueMealsMap[key] = meal;
        }
      });
      
      // Convert to the grouped days structure expected by the API
      const groupedByDay = daysOfWeek.map(day => {
        // Get all meals for this day
        const dayMeals = mealTypes.map(type => {
          const key = `${day}-${type}`;
          const meal = uniqueMealsMap[key];
          
          // If no meal found for this day/type, skip it
          if (!meal) return null;
          
          return {
            meal_type: type,
            meal: {
              name: meal.name || '',
              components: meal.components || [],
              toppings: meal.toppings || [],
              notes: meal.notes || ''
            }
          };
        }).filter(Boolean); // Remove nulls
        
        // Only include days with meals
        return dayMeals.length > 0 ? {
          day_of_week: day,
          meals: dayMeals
        } : null;
      }).filter(Boolean); // Remove empty days
      
      // Extract components used in the template
      const uniqueMeals = Object.values(uniqueMealsMap);
      const templateComponents = extractComponentsForTemplate(uniqueMeals, componentsData);
      
      console.log(`Template will have ${groupedByDay.length} days with meals`);
      groupedByDay.forEach(day => {
        console.log(`- ${day.day_of_week}: ${day.meals.length} meals`);
      });
      
      // Create the complete template data
      const completeTemplateData = {
        ...templateData,
        user_id: userId,
        days: groupedByDay,
        components_to_prepare: templateComponents,
      };
      
      // Send to API
      const result = await createTemplate(completeTemplateData);
      
      if (result.success) {
        setSaveTemplateModalOpen(false);
        if (onTemplateCreated) {
          onTemplateCreated(result.template);
        }
      } else {
        throw new Error(result.error || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      if (onError) {
        onError(error.message || "Failed to create template");
      }
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