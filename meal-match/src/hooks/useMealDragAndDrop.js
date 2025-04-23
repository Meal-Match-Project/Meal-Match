'use client';

import { useState, useCallback } from 'react';
import { mealHasContent } from '@/utils/mealUtils';

/**
 * Custom hook to handle drag and drop operations for meal components
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

  // Handle favorite meal drop - UPDATED to use drag event data
  const handleFavoriteMealDrop = useCallback((event, targetMealId) => {
    // Get data from the drag event
    const dragData = event.active.data.current;
    
    // Ensure we have valid data
    if (!dragData) {
      console.error("No drag data found in the event");
      return;
    }
    
    console.log("Dropping with data:", dragData);
    
    // Extract meal data from the drag event
    const { mealName, components = [], toppings = [], notes = '' } = dragData;
    
    // First update the target meal to include all these components
    setMealsData((prev) => {
      const updatedMeals = prev.map((meal) =>
        meal._id === targetMealId
          ? {
              ...meal,
              components: [
                ...meal.components,
                ...components,
              ],
              toppings: [
                ...meal.toppings || [],
                ...toppings
              ],
              name: mealName || meal.name,
              notes: notes || meal.notes
            }
          : meal
      );
      return updatedMeals;
    });
    
    // Then decrement the servings count for each component used
    components.forEach((compName) => {
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
      } else {
        console.warn(`Component ${compName} not found or has no servings available`);
      }
    });
    
    if (onSaveNeeded) onSaveNeeded();
  }, [componentsData, setComponentsData, setMealsData, onSaveNeeded]);

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
          // Check if the meal already exists in the array
          const mealExists = prev.some(meal => meal._id === targetMealId);
          
          if (mealExists) {
            // Update existing meal
            return prev.map((meal) =>
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
          } else {
            // Create a new meal with parsed information from the ID
            // Format is expected to be like "Monday-Breakfast"
            const [day_of_week, meal_type] = targetMealId.split('-');
            
            // Add new meal to the array
            return [...prev, {
              _id: targetMealId,
              day_of_week,
              meal_type,
              components: [draggedComp.name],
              toppings: [],
              notes: '',
              name: '',
              date: new Date() // Current date as fallback
            }];
          }
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

  // Handle any drag end - UPDATED to pass the full event to handlers
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
    
    // Case 1: If it's a favorite meal or suggested meal
    if (draggedItemId.toString().startsWith('meal-') || draggedItemId.toString().startsWith('suggestion-')) {
      // Pass the entire event to access drag data
      handleFavoriteMealDrop(event, targetMealId);
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