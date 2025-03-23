'use client';

import { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import IngredientModal from './modals/IngredientModal';

export default function IngredientsPage({ userId, ingredients = [] }) {
  const [ingredientsData, setIngredientsData] = useState(ingredients);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'toBuy', 'expiringSoon', or 'all'

  // Helper to check if an ingredient is expiring soon
  const isExpiringSoon = (ingredient) => {
    if (!ingredient.status || !ingredient.status.startsWith('Bought ')) return false;
    
    // Extract the purchase date
    const dateParts = ingredient.status.replace('Bought ', '').split('/');
    if (dateParts.length !== 2) return false;
    
    const purchaseDate = new Date();
    purchaseDate.setMonth(parseInt(dateParts[0]) - 1); // JavaScript months are 0-indexed
    purchaseDate.setDate(parseInt(dateParts[1]));
    
    // Add shelf life days to purchase date
    const expirationDate = new Date(purchaseDate);
    expirationDate.setDate(expirationDate.getDate() + (ingredient.shelf_life || 7));
    
    // Check if expiration date is within the next day
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return expirationDate - now < oneDayInMs && expirationDate > now;
  };

  // Filter ingredients for display
  const toBuyIngredients = ingredientsData.filter(ing => ing.status === 'Need to buy');
  const expiringSoonIngredients = ingredientsData.filter(ing => isExpiringSoon(ing));
  const allIngredients = ingredientsData;

  const handleIngredientClick = (ingredient) => {
    setSelectedIngredient(ingredient);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    // Create empty ingredient with default values matching the schema
    setSelectedIngredient({
      name: '',
      amount: 1,
      unit: 'unit',
      status: 'Need to buy',
      shelf_life: 7
    });
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleSaveIngredient = async (updatedIngredient) => {
    try {
      if (isAdding) {
        // Add userId to the new ingredient
        const newIngredient = {
          ...updatedIngredient,
          userId: userId
        };
        
        // Call API to save new ingredient
        const response = await fetch('/api/ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newIngredient)
        });
        
        if (response.ok) {
          const data = await response.json();
          // Add the saved ingredient (with generated _id) to state
          setIngredientsData([...ingredientsData, data.ingredient]);
        }
      } else {
        // Update existing ingredient
        const response = await fetch(`/api/ingredients/${updatedIngredient._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedIngredient)
        });
        
        if (response.ok) {
          // Update local state
          setIngredientsData(ingredientsData.map(ing => 
            ing._id === updatedIngredient._id ? updatedIngredient : ing
          ));
        }
      }
    } catch (error) {
      console.error('Error saving ingredient:', error);
    }
    
    setIsModalOpen(false);
  };

  const handleDeleteIngredient = async (ingredientId) => {
    try {
      const response = await fetch(`/api/ingredients/${ingredientId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setIngredientsData(ingredientsData.filter(ing => ing._id !== ingredientId));
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Ingredients</h1>
      
      <div className="w-1/4 mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button 
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'toBuy' ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-white'}`}
            onClick={() => setActiveTab('toBuy')}
          >
            To Buy
          </button>
          <button 
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'expiringSoon' ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-white'}`}
            onClick={() => setActiveTab('expiringSoon')}
          >
            Expiring Soon
          </button>
          <button 
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'all' ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-white'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
        </div>
        
        {/* Ingredient List */}
        <div className="divide-y">
          {(activeTab === 'toBuy' 
            ? toBuyIngredients 
            : activeTab === 'expiringSoon' 
              ? expiringSoonIngredients 
              : allIngredients
          ).map((ingredient) => (
            <div 
              key={ingredient._id || ingredient.name} 
              className="p-3 hover:bg-gray-50 cursor-pointer flex items-center"
              onClick={() => handleIngredientClick(ingredient)}
            >
              <div className="flex-1">
                <div className="font-medium flex items-center">
                  {ingredient.name}
                  {isExpiringSoon(ingredient) && (
                    <AlertTriangle className="w-4 h-4 ml-2 text-yellow-500" />
                  )}
                </div>
                <div className="text-sm">
                  <span className={ingredient.status === 'Need to buy' ? 'text-yellow-500' : 'text-green-500'}>
                    {ingredient.status}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Empty state */}
          {(activeTab === 'toBuy' 
            ? toBuyIngredients.length === 0 
            : activeTab === 'expiringSoon' 
              ? expiringSoonIngredients.length === 0 
              : allIngredients.length === 0
          ) && (
            <div className="p-6 text-center text-gray-500">
              {activeTab === 'toBuy' 
                ? 'No ingredients to buy.' 
                : activeTab === 'expiringSoon'
                  ? 'No ingredients expiring soon.'
                  : 'No ingredients found. Add your first ingredient below.'}
            </div>
          )}
        </div>
        
        {/* Add Ingredient Button */}
        <div className="p-3 border-t">
          <button 
            onClick={handleAddClick}
            className="w-full py-2 flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white rounded-md transition"
          >
            <Plus size={16} className="mr-1" />
            Add Ingredient
          </button>
        </div>
      </div>
      
      {/* Ingredient Modal */}
      {isModalOpen && (
        <IngredientModal 
          ingredient={selectedIngredient} 
          onSave={handleSaveIngredient} 
          onDelete={handleDeleteIngredient} 
          onClose={() => setIsModalOpen(false)} 
          isAdding={isAdding}
        />
      )}
    </div>
  );
}