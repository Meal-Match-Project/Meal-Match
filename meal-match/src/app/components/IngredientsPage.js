'use client';

import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, ShoppingCart, Package, Check, X, Trash2, RefreshCw } from 'lucide-react';
import IngredientModal from './modals/IngredientModal';

export default function IngredientsPage({ userId, ingredients = [] }) {
  const [ingredientsData, setIngredientsData] = useState(ingredients);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('to-buy'); // 'to-buy' or 'in-stock'
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to check if an ingredient is expiring soon (within 2 days)
  const isExpiringSoon = (ingredient) => {
    if (!ingredient.purchase_date) return false;
    
    // Calculate expiration date based on purchase date and shelf life
    const purchaseDate = new Date(ingredient.purchase_date);
    const expirationDate = new Date(purchaseDate);
    expirationDate.setDate(expirationDate.getDate() + (ingredient.shelf_life || 7));
    
    // Check if expiration date is within the next TWO days
    const now = new Date();
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
    return expirationDate - now < twoDaysInMs && expirationDate > now;
  };

  // Filter ingredients based on active tab and search term
  const filteredIngredients = ingredientsData.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'to-buy') {
      return matchesSearch && (ingredient.status === 'to-buy' || ingredient.status === 'Need to buy');
    } else {
      return matchesSearch && (ingredient.status === 'in-stock' || ingredient.status.startsWith('Bought '));
    }
  });

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
      status: activeTab === 'to-buy' ? 'to-buy' : 'in-stock', // Set based on active tab
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
        } else {
          console.error('Failed to update ingredient:', await response.text());
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
      } else {
        console.error('Failed to delete ingredient:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
    }
    
    setIsModalOpen(false);
  };

  // Quick actions without opening the modal
  const markAsPurchased = async (ingredient) => {
    const now = new Date();
    const updatedIngredient = {
      ...ingredient,
      status: 'in-stock',
      purchase_date: now.toISOString(), // Set purchase date to today
    };
    
    await handleSaveIngredient(updatedIngredient);
  };

  const markAsOutOfStock = async (ingredient) => {
    const updatedIngredient = {
      ...ingredient,
      status: 'out-of-stock',
    };
    
    await handleSaveIngredient(updatedIngredient);
  };

  const markAsNeedToBuy = async (ingredient) => {
    const updatedIngredient = {
      ...ingredient,
      status: 'to-buy',
      purchase_date: null, // Clear purchase date
    };
    
    await handleSaveIngredient(updatedIngredient);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Ingredients</h1>
      
      <div className="max-w-3xl mx-auto">
        {/* Search Bar */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`py-2 px-4 font-medium flex items-center ${
              activeTab === 'to-buy'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('to-buy')}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Shopping List
          </button>
          <button
            className={`py-2 px-4 font-medium flex items-center ${
              activeTab === 'in-stock'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('in-stock')}
          >
            <Package className="w-4 h-4 mr-2" />
            In Stock
          </button>
        </div>
        
        {/* Ingredient List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredIngredients.length > 0 ? (
            <div className="divide-y">
              {filteredIngredients.map((ingredient) => (
                <div 
                  key={ingredient._id || ingredient.name} 
                  className="p-4 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex-1 mr-4" onClick={() => handleIngredientClick(ingredient)}>
                    <div className="font-medium flex items-center">
                      <span>{ingredient.name}</span>
                      {activeTab === 'in-stock' && isExpiringSoon(ingredient) && (
                        <div className="flex items-center text-yellow-600 ml-2">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          <span className="text-xs">Expiring soon</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm flex items-center mt-1">
                      <span className="text-gray-500">
                        {ingredient.amount} {ingredient.unit}
                      </span>
                      {ingredient.purchase_date && (
                        <span className="text-green-500 ml-2 text-xs">
                          Purchased on {new Date(ingredient.purchase_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {activeTab === 'to-buy' ? (
                      <button
                        onClick={() => markAsPurchased(ingredient)}
                        className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200 focus:outline-none"
                        title="Mark as purchased"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsOutOfStock(ingredient)}
                        className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 focus:outline-none"
                        title="Mark as out of stock"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    
                    {activeTab === 'in-stock' && (
                      <button
                        onClick={() => markAsNeedToBuy(ingredient)}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 focus:outline-none"
                        title="Add to shopping list"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteIngredient(ingredient._id)}
                      className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 focus:outline-none"
                      title="Delete ingredient"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? (
                <>No matching ingredients found.</>
              ) : activeTab === 'to-buy' ? (
                <>Your shopping list is empty. Add ingredients that you need to buy.</>
              ) : (
                <>No ingredients in stock. Mark items as purchased from your shopping list.</>
              )}
            </div>
          )}
          
          {/* Add Ingredient Button */}
          <div className="p-4 border-t">
            <button 
              onClick={handleAddClick}
              className="w-full py-2 flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white rounded-md transition"
            >
              <Plus size={16} className="mr-1" />
              Add {activeTab === 'to-buy' ? 'to Shopping List' : 'to Inventory'}
            </button>
          </div>
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