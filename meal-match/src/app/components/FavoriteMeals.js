'use client';

import { useState } from 'react';
import FavoritesModal from '@/app/components/modals/FavoritesModal';

export default function FavoriteMeals({ weeklyComponents, onAddMeal }) {
  const [favorites, setFavorites] = useState(() => {
    const initial = [
      { name: 'Tuna salad wrap', components: ['Crepes', 'Mashed sweet potato', 'Tuna salad', 'Baby spinach'], toppings: ['Roasted red pepper', 'Cucumber']},
      { name: 'Roasted red pepper chickpea salad', components: ['Crisped chickpeas', 'Balsamic vinaigrette', 'Pickled red onions', 'Baby spinach'], toppings: ['Roasted red pepper', 'Diced cucumber', 'Feta']},
      { name: 'Broccoli and chickpea stuffed sweet potato', components: ['Baked sweet potato', 'Roasted broccoli', 'Crisped chickpeas'], toppings: ['Pickled red onions', 'Feta', 'Tahini']}
    ];
    return initial.map(meal => ({ ...meal, rank: getMealRank(meal, weeklyComponents) }));
  });

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (meal) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  const handleSaveMeal = (updatedMeal) => {
    setFavorites((prev) => 
      prev.map(meal => meal.name === updatedMeal.name ? updatedMeal : meal)
    );
    setIsModalOpen(false);
  };

  const handleDeleteMeal = (mealName) => {
    setFavorites((prev) => 
      prev.filter(meal => meal.name !== mealName)
    );
    setIsModalOpen(false);
  };

  function getMealRank(meal, weeklyComponents) {
    const intersectionCount = meal.components.filter(c => weeklyComponents.includes(c)).length;
    if (intersectionCount === meal.components.length) return 2;  // all
    if (intersectionCount > 0) return 1;                        // some
    return 0;                                                   // none
  }

  const allMatches = favorites.filter((meal) => meal.rank === 2);
  const someMatches = favorites.filter((meal) => meal.rank === 1);
  const noMatches = favorites.filter((meal) => meal.rank === 0);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Favorite Meals</h1>
      
      {/* All Components Match */}
      {allMatches.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">All Components Match</h2>
          <div className="bg-white shadow-md rounded-md mb-4">
            {allMatches.map((meal) => (
              <div key={meal.name} className="flex justify-between p-2 border-b last:border-none">
                <span>{meal.name}</span>
                <button onClick={() => handleEditClick(meal)} className="text-gray-600 font-semibold">
                  &#x22EE;
                </button>
              </div>
            ))}
          </div>
        </>
      )}
        
      {/* Some Components Match */}
      {someMatches.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Some Components Match</h2>
          <div className="bg-white shadow-md rounded-md mb-4">
            {someMatches.map((meal) => (
              <div key={meal.name} className="flex justify-between p-2 border-b last:border-none">
                <span>{meal.name}</span>
                <button onClick={() => handleEditClick(meal)} className="text-gray-600 font-semibold">
                  &#x22EE;
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {/* No Components Match */}
      {noMatches.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">No Components Match</h2>
          <div className="bg-white shadow-md rounded-md mb-4">
            {noMatches.map((meal) => (
              <div key={meal.name} className="flex justify-between p-2 border-b last:border-none">
                <span>{meal.name}</span>
                <button onClick={() => handleEditClick(meal)} className="text-gray-600 font-semibold">
                  &#x22EE;
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {isModalOpen && (
        <div className="relative">
          <FavoritesModal
            meal={selectedMeal}
            onSave={handleSaveMeal}
            onDelete={handleDeleteMeal}
            onClose={() => setIsModalOpen(false)}
            weeklyComponents={weeklyComponents}       
            onAddMeal={onAddMeal}                   
          />
        </div>
      )}
    </div>
  );
}