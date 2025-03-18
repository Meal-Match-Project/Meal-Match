'use client';

import { useState } from 'react';
import FavoritesModal from '@/app/components/modals/FavoritesModal';

export default function FavoriteMeals() {
  const [favorites, setFavorites] = useState([
      { name: 'Tuna salad wrap', components: ['Crepes', 'Mashed sweet potato', 'Tuna salad', 'Baby spinach'], toppings: ['Roasted red pepper', 'Cucumber']},
      { name: 'Roasted red pepper chickpea salad', components: ['Crisped chickpeas', 'Balsamic vinaigrette', 'Pickled red onions', 'Baby spinach'], toppings: ['Roasted red pepper', 'Diced cucumber', 'Feta']},
      { name: 'Broccoli and chickpea stuffed sweet potato', components: ['Baked sweet potato', 'Roasted broccoli', 'Crisped chickpeas'], toppings: ['Pickled red onions', 'Feta', 'Tahini']}
    ]);

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
    setComponents((prev) => 
      prev.filter(meal => meal.name !== mealName)
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Favorites</h1>
      {favorites.length > 0 && (
        <div className="mb-6">
          <div className="bg-white shadow-md rounded-md">
            {favorites.map((meal) => (
              <div key={meal.name} className="flex justify-between p-2 border-b last:border-none">
                <span>{meal.name}</span>
                <button onClick={() => handleEditClick(meal)} className="text-gray-600">
                  &#x22EE;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
        
      {isModalOpen && (
        <div className="relative">
          <FavoritesModal
            meal={selectedMeal} 
            onSave={handleSaveMeal} 
            onDelete={handleDeleteMeal} 
            onClose={() => setIsModalOpen(false)} 
          />
        </div>
      )}
    </div>
  );
}