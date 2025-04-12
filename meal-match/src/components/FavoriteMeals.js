'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import FavoritesModal from '@/app/components/modals/FavoritesModal';

export default function FavoriteMeals({ weeklyComponents }) {

  const { userId: urlUserId } = useParams();
  const [userId, setUserId] = useState(null);
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load userId from URL or localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (urlUserId) {
      setUserId(urlUserId);
      localStorage.setItem('userId', urlUserId);
    } else if (storedUserId) {
      setUserId(storedUserId);
    }
  }, [urlUserId]);

  useEffect(() => {
    // Example defaults
    const defaults = [
      {
        name: 'Tuna salad wrap',
        components: ['Crepes', 'Mashed sweet potato', 'Tuna salad', 'Baby spinach'],
        toppings: ['Roasted red pepper', 'Cucumber'],
      },
      {
        name: 'Roasted red pepper chickpea salad',
        components: ['Crisped chickpeas', 'Balsamic vinaigrette', 'Pickled red onions', 'Baby spinach'],
        toppings: ['Roasted red pepper', 'Diced cucumber', 'Feta'],
      },
      {
        name: 'Broccoli and chickpea stuffed sweet potato',
        components: ['Baked sweet potato', 'Roasted broccoli', 'Crisped chickpeas'],
        toppings: ['Pickled red onions', 'Feta', 'Tahini'],
      },
    ];

    if (userId) {
      // Load saved meals
      const storedFavorites = localStorage.getItem(`savedMeals-${userId}`);
      if (storedFavorites) {
        try {
          const parsed = JSON.parse(storedFavorites);

          if (Array.isArray(parsed) && parsed.length === 0) {
            // Empty array in storage – use defaults
            setFavoriteMeals(defaults);
          } else if (Array.isArray(parsed)) {
            // Transform {title, ...} into {name, ...}
            const normalizedMeals = parsed.map((meal) => {
              let componentsArray = meal.components || [];
              
              // If meal.components is a string, turn it into an array with one element
              if (typeof componentsArray === 'string') {
                componentsArray = [componentsArray];
              }
            
              // Ensure toppings is also always an array
              let toppingsArray = meal.toppings || [];
              if (!Array.isArray(toppingsArray)) {
                toppingsArray = [];
              }
            
              return {
                name: meal.name || meal.title || 'Untitled Meal',
                components: componentsArray,
                toppings: toppingsArray,
                notes: meal.notes || '',
              };
            });
            setFavoriteMeals(normalizedMeals);
          } else {
            // Something else in storage – also use defaults
            setFavoriteMeals(defaults);
          }
        } catch {
          setFavoriteMeals(defaults);
        }
      } else {
        // Nothing in storage – use defaults
        setFavoriteMeals(defaults);
      }

      // After setting favoriteMeals, we can assign ranks
      // But we must do it in a callback or a separate effect
    }
  }, [userId]);

  // Example: transform favoriteMeals to have ranks once loaded
  useEffect(() => {
    if (favoriteMeals.length > 0 && weeklyComponents) {
      setFavoriteMeals((prevMeals) =>
        prevMeals.map((m) => ({
          ...m,
          rank: getMealRank(m, weeklyComponents),
        }))
      );
    }
  }, [favoriteMeals, weeklyComponents]);

  // Whenever favoriteMeals changes, store it again
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`savedMeals-${userId}`, JSON.stringify(favoriteMeals));
    }
  }, [favoriteMeals, userId]);

  const handleEditClick = (meal) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  const handleSaveMeal = (updatedMeal) => {
    setFavoriteMeals((prev) =>
      prev.map((meal) => (meal.name === updatedMeal.name ? updatedMeal : meal))
    );
    setIsModalOpen(false);
  };

  const handleDeleteMeal = (mealName) => {
    setFavoriteMeals((prev) => prev.filter((meal) => meal.name !== mealName));
    setIsModalOpen(false);
  };

  function getMealRank(meal, weeklyComponents) {
    const intersectionCount = meal.components.filter((c) => weeklyComponents.includes(c)).length;
    if (intersectionCount === meal.components.length) return 2; // all match
    if (intersectionCount > 0) return 1; // some match
    return 0; // none match
  }

  // Filter meals by rank
  const allMatches = favoriteMeals.filter((meal) => meal.rank === 2);
  const someMatches = favoriteMeals.filter((meal) => meal.rank === 1);
  const noMatches = favoriteMeals.filter((meal) => meal.rank === 0);

  if (!userId) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl text-orange-600 font-bold mb-8">Favorite Meals</h1>
      
      {/* All Components Match */}
      {allMatches.length > 0 && (
        <>
          <h2 className="text-xl font-semibold w-3/4 mx-auto my-4">All Components Match</h2>
          <div className="bg-white shadow-md mx-auto w-3/4 rounded-md my-4">
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
          <h2 className="text-xl font-semibold w-3/4 mx-auto my-4">Some Components Match</h2>
          <div className="bg-white shadow-md rounded-md mx-auto w-3/4 my-4">
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
          />
        </div>
      )}
    </div>
  );
}