'use client';

import { useState, useEffect } from 'react';
import FavoriteMealModal from './modals/FavoriteMealModal';

export default function FavoriteMealsList({ userId, favoriteMeals, weeklyComponents }) {
  const [meals, setMeals] = useState(favoriteMeals);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Calculate meal categorization when weeklyComponents changes
  useEffect(() => {
    if (weeklyComponents) {
      setMeals(favoriteMeals.map(meal => ({
        ...meal,
        category: getMealCategory(meal, weeklyComponents)
      })));
    }
  }, [favoriteMeals, weeklyComponents]);
  
  // Helper function to categorize meals based on component availability
  function getMealCategory(meal, weeklyComponents) {
    if (!meal.components || meal.components.length === 0) return 'no-match';
    
    const matchCount = meal.components.filter(comp => 
      weeklyComponents.includes(comp)
    ).length;
    
    if (matchCount === meal.components.length) return 'all-match';
    if (matchCount > 0) return 'some-match';
    return 'no-match';
  }
  
  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };
  
  const handleCloseMeal = () => {
    setIsModalOpen(false);
    setSelectedMeal(null);
  };
  
  const handleRemoveFavorite = async (mealId) => {
    try {
      // Find the favorite ID first
      const favoritesResponse = await fetch(`/api/favorites?userId=${userId}&mealId=${mealId}`);
      const favoritesData = await favoritesResponse.json();
      console.log("Found favorite", favoritesData);
      if (favoritesData.favorites && favoritesData.favorites.length > 0) {
        const favoriteId = favoritesData.favorites[0]._id;
        
        // Now delete using the favorite ID
        const response = await fetch(`/api/favorites/${favoriteId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Remove from local state
          setMeals(meals.filter(meal => meal._id !== mealId));
        }
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
    setIsModalOpen(false);
  };
  // Group meals by category
  const allMatchMeals = meals.filter(meal => meal.category === 'all-match');
  const someMatchMeals = meals.filter(meal => meal.category === 'some-match');
  const noMatchMeals = meals.filter(meal => meal.category === 'no-match');
  
  // Helper function to render meal lists with consistent styling
  const renderMealList = (mealList, title) => {
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
                    {meal.meal_type} • {meal.components.length} components
                  </p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div>
      {meals.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">You don't have any favorite meals yet.</p>
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
              onRemoveFavorite={handleRemoveFavorite}
            />
          )}
        </>
      )}
    </div>
  );
}