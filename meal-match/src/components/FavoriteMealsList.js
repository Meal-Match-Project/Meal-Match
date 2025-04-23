'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import FavoriteMealModal from './modals/FavoriteMealModal';

export default function FavoriteMealsList({ userId, favoriteMeals, weeklyComponents }) {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { categorizeMeals, removeMealFromFavorites } = useFavorites();
  
  // Process favorites data with useMemo to prevent unnecessary recalculations
  const processedMeals = useMemo(() => {
    if (!favoriteMeals) return [];
    
    return favoriteMeals.map(fav => ({
      _id: fav._id,
      ...fav.meal,
      favoriteId: fav._id
    }));
  }, [favoriteMeals]);
  
  // Use useMemo to categorize meals instead of useState + useEffect
  const meals = useMemo(() => {
    if (!processedMeals.length || !weeklyComponents) return [];
    return categorizeMeals(processedMeals, weeklyComponents);
  }, [processedMeals, weeklyComponents, categorizeMeals]);
  
  // Also memoize the filtered meals to avoid recalculations
  const allMatchMeals = useMemo(() => 
    meals.filter(meal => meal.category === 'all-match'),
  [meals]);
  
  const someMatchMeals = useMemo(() => 
    meals.filter(meal => meal.category === 'some-match'),
  [meals]);
  
  const noMatchMeals = useMemo(() => 
    meals.filter(meal => meal.category === 'no-match'),
  [meals]);
  
  const handleMealClick = useCallback((meal) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  }, []);
  
  const handleCloseMeal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMeal(null);
  }, []);
  
  const handleRemoveFavorite = useCallback(async (favoriteId) => {
    const success = await removeMealFromFavorites(userId, favoriteId);
    if (success) {
      // We don't need to manually update state here - the component will re-render
      // when the parent component refetches the favorites data
      setIsModalOpen(false);
    }
  }, [userId, removeMealFromFavorites]);
  
  // Helper function to render meal lists with consistent styling
  const renderMealList = useCallback((mealList, title) => {
    if (mealList.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{title}</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {mealList.map(meal => (
            <div 
              key={meal._id}
              onClick={() => handleMealClick(meal)}
              className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg">{meal.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {meal.meal_type} • {meal.components?.length || 0} components
                  </p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [handleMealClick]);
  
  return (
    <div>
      {meals.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">You don&apos;t have any favorite meals yet.</p>
        </div>
      ) : (
        <>
          {renderMealList(allMatchMeals, "Make Now (All Components Ready)")}
          {renderMealList(someMatchMeals, "Almost Ready (Some Components Available)")}
          {renderMealList(noMatchMeals, "Need Ingredients")}
          
          {/* Modal for viewing meal details */}
          {isModalOpen && selectedMeal && (
            <FavoriteMealModal
              meal={selectedMeal}
              weeklyComponents={weeklyComponents}
              onClose={handleCloseMeal}
              onRemoveFavorite={() => handleRemoveFavorite(selectedMeal.favoriteId || selectedMeal._id)}
            />
          )}
        </>
      )}
    </div>
  );
}