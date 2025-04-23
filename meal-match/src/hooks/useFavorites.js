'use client';
import { useState, useCallback } from 'react';
import { removeFavorite, removeComponentFavorite } from '@/actions/favoriteActions';

export function useFavorites() {
  // Function to categorize meals based on available components
  const categorizeMeals = useCallback((meals, availableComponents) => {
    return meals.map(meal => {
      const mealComponents = meal.components || [];
      const matchingComponents = mealComponents.filter(
        comp => availableComponents.includes(comp)
      );
      
      let category = 'no-match';
      if (matchingComponents.length === mealComponents.length && mealComponents.length > 0) {
        category = 'all-match';
      } else if (matchingComponents.length > 0) {
        category = 'some-match';
      }
      
      return { ...meal, category };
    });
  }, []);
  
  // Function to remove a meal from favorites
  const removeMealFromFavorites = useCallback(async (userId, favoriteId) => {
    try {
      const result = await removeFavorite(userId, favoriteId);
      return result.success;
    } catch (error) {
      console.error("Error removing favorite meal:", error);
      return false;
    }
  }, []);
  
  // Function to remove a component from favorites
  const removeComponentFromFavorites = useCallback(async (componentId, userId) => {
    try {
      const result = await removeComponentFavorite(userId, componentId);
      return result.success;
    } catch (error) {
      console.error("Error removing favorite component:", error);
      return false;
    }
  }, []);
  
  return {
    categorizeMeals,
    removeMealFromFavorites,
    removeComponentFromFavorites
  };
}
