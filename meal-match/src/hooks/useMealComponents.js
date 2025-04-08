'use client';

import { useState, useCallback } from 'react';
import { addComponent, updateComponent, deleteComponent } from '@/services/apiService';

export default function useMealComponents({ initialComponents, initialMeals, onSaveNeeded }) {
  const [componentsData, setComponentsData] = useState(initialComponents || []);
  const [mealsData, setMealsData] = useState(initialMeals || []);
  
  // Add a new component
  const handleAddComponent = useCallback(async (componentData) => {
    try {
      const result = await addComponent(componentData);
      
      if (result.success) {
        setComponentsData(prev => [...prev, result.component]);
        onSaveNeeded();
        return result.component;
      } else {
        throw new Error(result.error || "Failed to add component");
      }
    } catch (error) {
      console.error("Error adding component:", error);
      throw error;
    }
  }, [onSaveNeeded]);
  
  // Remove a component
  const handleRemoveComponent = useCallback(async (componentId) => {
    try {
      const result = await deleteComponent(componentId);
      
      if (result.success) {
        setComponentsData(prev => prev.filter(comp => comp._id !== componentId));
        onSaveNeeded();
        return true;
      } else {
        throw new Error(result.error || "Failed to delete component");
      }
    } catch (error) {
      console.error("Error removing component:", error);
      throw error;
    }
  }, [onSaveNeeded]);

  // Direct component removal from a meal
  const directRemoveComponent = useCallback((mealId, componentIndex, componentName, type = 'component') => {
    // Find the meal in the current state
    const mealToUpdate = mealsData.find(meal => meal._id === mealId);
    
    if (!mealToUpdate) return;
    
    if (type === 'topping') {
      // Handle topping removal
      setMealsData(prev => 
        prev.map(meal => 
          meal._id === mealId 
            ? {
                ...meal,
                toppings: meal.toppings.filter((_, i) => i !== componentIndex)
              }
            : meal
        )
      );
    } else {
      // Handle component removal
      setMealsData(prev => 
        prev.map(meal => 
          meal._id === mealId 
            ? {
                ...meal,
                components: meal.components.filter((_, i) => i !== componentIndex)
              }
            : meal
        )
      );
      
      // Restore one serving to the component that was removed
      const componentToRestore = componentName;
      const compIndex = componentsData.findIndex(comp => comp.name === componentToRestore);
      
      if (compIndex !== -1) {
        setComponentsData(prev => {
          const updated = [...prev];
          updated[compIndex] = {
            ...updated[compIndex],
            servings: updated[compIndex].servings + 1
          };
          return updated;
        });
      }
    }
    
    // Call the save needed callback - this was the main issue
    onSaveNeeded();
  }, [mealsData, componentsData, onSaveNeeded]);
  
  // Add a mini component (quick add)
  const handleAddMiniComponent = useCallback(async (name, userId) => {
    const quickComponent = {
      name: name.trim(),
      servings: 1,
      prep_time: 5,
      ingredients: [],
      notes: '',
      userId
    };
    
    return handleAddComponent(quickComponent);
  }, [handleAddComponent]);
  
  // Move a component from one meal to another
  const handleMoveComponent = useCallback((fromMealId, toMealId, componentName) => {
    setMealsData(prev => prev.map(meal => {
      if (meal._id === fromMealId) {
        return {
          ...meal,
          components: meal.components.filter(c => c !== componentName)
        };
      }
      if (meal._id === toMealId) {
        return {
          ...meal,
          components: [...meal.components, componentName]
        };
      }
      return meal;
    }));
    
    onSaveNeeded();
  }, [onSaveNeeded]);
  
  return {
    componentsData,
    setComponentsData,
    mealsData,
    setMealsData,
    handleAddComponent,
    handleRemoveComponent,
    directRemoveComponent,
    handleAddMiniComponent,
    handleMoveComponent
  };
}