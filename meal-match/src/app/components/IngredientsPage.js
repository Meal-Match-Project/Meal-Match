'use client';
import { useState, useEffect } from 'react';
import ListPage from './ListPage';
import DatePickerModal from '@/app/components/modals/DatePickerModal';

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ensure ingredients are only set on the client-side
  useEffect(() => {
    setIngredients([
      { name: 'Chicken breasts', status: 'Need to buy' },
      { name: 'Frozen broccoli', status: 'Bought 2/21' },
      { name: 'Rice', status: 'Bought 1/17' },
      { name: 'Sweet potatoes', status: 'Need to buy' },
    ]);
  }, []);

  const handleStatusClick = (ingredientName) => {
    setIngredients((prev) => {
      return prev.map((ingredient) =>
        ingredient.name === ingredientName
          ? {
              ...ingredient,
              status: ingredient.status.startsWith('Bought') ? 'Need to buy' : ingredient.status,
            }
          : ingredient
      );
    });
  };

  const handleSaveDate = (ingredientName, date) => {
    setIngredients((prev) => {
      return prev.map((ingredient) =>
        ingredient.name === ingredientName ? { ...ingredient, status: `Bought ${date}` } : ingredient
      );
    });
    setIsModalOpen(false);
  };

  return (
    <>
      {ingredients.length > 0 && (
        <ListPage
          pageTitle="Ingredients"
          items={{ thisWeek: ingredients }}
          renderRightSide={(ingredient) => (
            <button
              onClick={() => {
                if (ingredient.status === 'Need to buy') {
                  setSelectedIngredient(ingredient);
                  setIsModalOpen(true);
                } else {
                  handleStatusClick(ingredient.name);
                }
              }}
              className={`px-2 py-1 rounded text-white ${
                ingredient.status.startsWith('Bought') ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            >
              {ingredient.status}
            </button>
          )}
        />
      )}
      {isModalOpen && selectedIngredient && (
        <DatePickerModal
          ingredient={selectedIngredient}
          onSave={handleSaveDate}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}