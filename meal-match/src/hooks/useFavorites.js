'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  removeFavorite, 
  removeComponentFavorite,
  deleteFavoriteById
} from '@/services/apiService';

export function useFavorites() {
  // Categorize meals based on available components
  const categorizeMeals = useCallback((favoriteMeals, weeklyComponents) => {
    if (!favoriteMeals || !weeklyComponents) return [];
    
    return favoriteMeals.map(meal => {
      const components = Array.isArray(meal.components) ? meal.components : [];
      
      if (components.length === 0) return { ...meal, category: 'no-match' };
      
      const availableComponents = weeklyComponents.map(comp => 
        typeof comp === 'string' ? comp : comp.name
      );
      
      const matchCount = components.filter(comp => 
        availableComponents.includes(comp)
      ).length;
      
      let category = 'no-match';
      if (matchCount === components.length) category = 'all-match';
      else if (matchCount > 0) category = 'some-match';
      
      return { ...meal, category };
    });
  }, []);

  // Remove a meal from favorites
  const removeMealFromFavorites = async (mealId, userId) => {
    try {
      await removeFavorite(mealId, userId);
      return true;
    } catch (error) {
      console.error('Error removing meal from favorites:', error);
      return false;
    }
  };

  // Remove a component from favorites
  const removeComponentFromFavorites = async (componentId, userId) => {
    try {
      await removeComponentFavorite(componentId, userId);
      return true;
    } catch (error) {
      console.error('Error removing component from favorites:', error);
      return false;
    }
  };

  return {
    categorizeMeals,
    removeMealFromFavorites,
    removeComponentFromFavorites
  };
}