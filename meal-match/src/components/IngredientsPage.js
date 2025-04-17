'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { getIngredients } from '@/services/apiService';
import IngredientModal from './modals/IngredientModal';
import ShoppingListView from './ui/ShoppingListView';
import InventoryView from './ui/InventoryView';
import IngredientTabs from './ui/IngredientTabs';
import IngredientSearchBar from './ui/IngredientSearchBar';
import useIngredients from '@/hooks/useIngredients';

export default function IngredientsPage({ userId, ingredients = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('to-buy'); // 'to-buy' or 'in-stock'
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    ingredientsData,
    setIngredientsData,
    handleSaveIngredient,
    handleDeleteIngredient,
    markAsPurchased,
    markAsOutOfStock,
    markAsNeedToBuy
  } = useIngredients(userId, ingredients);
  
  // Refresh ingredients data when tab changes
  useEffect(() => {
    const refreshIngredients = async () => {
      try {
        const response = await getIngredients(userId);
        if (response && response.success) {
          setIngredientsData(response.ingredients); // Extract the ingredients array
        } else if (Array.isArray(response)) {
          // Handle case where response might be a direct array (for backward compatibility)
          setIngredientsData(response);
        }
      } catch (error) {
        console.error("Error refreshing ingredients:", error);
      }
    };
    
    refreshIngredients();
  }, [userId, activeTab, setIngredientsData]);

  const handleIngredientClick = (ingredient) => {
    setSelectedIngredient(ingredient);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedIngredient({
      name: '',
      amount: 1,
      unit: 'unit',
      status: activeTab === 'to-buy' ? 'to-buy' : 'in-stock',
      shelf_life: 7
    });
    setIsAdding(true);
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);
  const handleSearch = (value) => setSearchTerm(value);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">
        {activeTab === 'to-buy' ? 'Shopping List' : 'Ingredient Inventory'}
      </h1>
      
      <div className="max-w-3xl mx-auto">
        <IngredientTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        <IngredientSearchBar 
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search ingredients..."
          icon={<Search className="w-4 h-4 text-gray-400" />}
          className="mb-4"
        />
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {activeTab === 'to-buy' ? (
            <ShoppingListView 
              ingredients={ingredientsData}
              searchTerm={searchTerm}
              onItemClick={handleIngredientClick}
              onPurchase={markAsPurchased}
              onDelete={handleDeleteIngredient}
            />
          ) : (
            <InventoryView 
              ingredients={ingredientsData}
              searchTerm={searchTerm}
              onItemClick={handleIngredientClick}
              onOutOfStock={markAsOutOfStock}
              onAddToList={markAsNeedToBuy}
              onDelete={handleDeleteIngredient}
            />
          )}
          
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
      
      {isModalOpen && (
        <IngredientModal 
          ingredient={selectedIngredient} 
          onSave={handleSaveIngredient} 
          onDelete={handleDeleteIngredient} 
          onClose={closeModal} 
          isAdding={isAdding}
          viewMode={activeTab}
        />
      )}
    </div>
  );
}