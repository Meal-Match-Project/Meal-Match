'use client';

import { useState, useCallback } from 'react';
import { mealHasContent } from '@/utils/mealUtils';

/**
 * Custom hook to handle drag and drop operations for meal components
 * @param {Object} options - Configuration options
 * @param {Array} options.componentsData - Component data array
 * @param {Function} options.setComponentsData - Function to update component data
 * @param {Array} options.mealsData - Meal data array
 * @param {Function} options.setMealsData - Function to update meal data
 * @param {Function} options.onSaveNeeded - Function to call when changes need to be saved
 * @returns {Object} - Drag and drop handlers and state
 */
export default function useMealDragAndDrop({
  componentsData,
  setComponentsData,
  mealsData,
  setMealsData,
  onSaveNeeded
}) {
  const [activeItem, setActiveItem] = useState(null);

  // Start dragging
  const handleDragStart = useCallback((event) => {
    setActiveItem(event.active.id);
  }, []);

  // Moving component between meals
  const handleMoveComponent = useCallback((sourceMealId, sourceIndex, component, targetMealId) => {
    // 1. Remove from source meal
    setMealsData((prev) => {
      const updatedMeals = prev.map((meal) =>
        meal._id === sourceMealId
          ? {
              ...meal,
              components: meal.components.filter((_, idx) => idx !== sourceIndex),
            }
          : meal
      );
      return updatedMeals;
    });
  
    // 2. Add to target meal
    setMealsData((prev) => {
      const updatedMeals = prev.map((meal) =>
        meal._id === targetMealId
          ? {
              ...meal,
              components: [...meal.components, component],
            }
          : meal
      );
      return updatedMeals;
    });
    
    if (onSaveNeeded) onSaveNeeded();
  }, [setMealsData, onSaveNeeded]);

  // Handle favorite meal drop
  const handleFavoriteMealDrop = useCallback((favoriteMealId, targetMealId) => {
    // Extract meal name from the id (remove 'meal-' prefix)
    const mealName = favoriteMealId.replace('meal-', '');
    
    // Find the matching favorite meal object
    const favMealObj = mealsData.find((m) => m.name === mealName);
    if (!favMealObj) return;
    
    // Get all component names from the favorite meal
    const componentNames = favMealObj.components || [];
    
    // First update the target meal to include all these components
    setMealsData((prev) => {
      const updatedMeals = prev.map((meal) =>
        meal._id === targetMealId
          ? {
              ...meal,
              components: [
                ...meal.components,
                ...componentNames,
              ],
              toppings: [
                ...meal.toppings,
                ...(favMealObj.toppings || [])
              ],
              name: favMealObj.name || meal.name,
              notes: favMealObj.notes || meal.notes
            }
          : meal
      );
      return updatedMeals;
    });
    
    // Then decrement the servings count for each component used
    componentNames.forEach((compName) => {
      const compIndex = componentsData.findIndex(
        (comp) => comp.name === compName
      );
      
      if (compIndex !== -1 && componentsData[compIndex].servings > 0) {
        setComponentsData((prev) => {
          const updated = [...prev];
          updated[compIndex] = {
            ...updated[compIndex],
            servings: updated[compIndex].servings - 1,
          };
          return updated;
        });
      }
    });
    
    if (onSaveNeeded) onSaveNeeded();
  }, [componentsData, mealsData, setComponentsData, setMealsData, onSaveNeeded]);

  // Handle component drop
  const handleComponentDrop = useCallback((componentName, targetMealId) => {
    const compIndex = componentsData.findIndex(
      (comp) => comp.name === componentName
    );
    
    if (compIndex !== -1) {
      const draggedComp = componentsData[compIndex];
      if (draggedComp.servings > 0) {
        // Add it to that meal plan's array
        setMealsData((prev) => {
          const updatedMeals = prev.map((meal) =>
            meal._id === targetMealId
              ? {
                  ...meal,
                  components: [
                    ...meal.components,
                    draggedComp.name,
                  ],
                }
              : meal
          );
          return updatedMeals;
        });
        
        // Decrement the serving count in componentsData
        setComponentsData((prev) => {
          const updated = [...prev];
          updated[compIndex] = {
            ...updated[compIndex],
            servings: updated[compIndex].servings - 1,
          };
          return updated;
        });
        
        if (onSaveNeeded) onSaveNeeded();
        return true;
      }
    }
    return false;
  }, [componentsData, setComponentsData, setMealsData, onSaveNeeded]);

<<<<<<< HEAD
  // Handle any drag end - UPDATED to pass the full event to handlers
=======
  // Handle any drag end
>>>>>>> b7e49aa0582ec064d202331574ae583f6792e227
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveItem(null);
    
    if (!over) return; // dropped outside a valid meal slot
    
    const draggedItemId = active.id;
    const targetMealId = over.id;
    
    // Check if this is a meal component being dragged
    if (draggedItemId.toString().startsWith('meal-component:')) {
      // Extract the source meal ID, component name, and index
      const [, sourceMealId, component, sourceIndex] = draggedItemId.split(':');
      
      // If dropping onto a different meal, move the component
      if (sourceMealId !== targetMealId) {
        handleMoveComponent(sourceMealId, parseInt(sourceIndex), component, targetMealId);
      }
      
      // If same meal, do nothing
      return;
    }
    
    // Case 1: If it's a favorite meal
    if (draggedItemId.startsWith('meal-')) {
      handleFavoriteMealDrop(draggedItemId, targetMealId);
      return;
    }
    
    // Case 2: If it's a component from the sidebar
    handleComponentDrop(draggedItemId, targetMealId);
  }, [handleMoveComponent, handleFavoriteMealDrop, handleComponentDrop]);

  return {
    activeItem,
    handleDragStart,
    handleDragEnd,
    handleMoveComponent,
    handleFavoriteMealDrop,
    handleComponentDrop
  };
}