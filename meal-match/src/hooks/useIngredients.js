import { useState } from 'react';
import { 
  addIngredient, 
  updateIngredient, 
  deleteIngredient
} from '@/services/apiService';

export default function useIngredients(userId, initialIngredients = []) {
  const safeInitialIngredients = Array.isArray(initialIngredients) ? initialIngredients : [];
  const [ingredientsData, setIngredientsData] = useState(safeInitialIngredients);

  
  const handleSaveIngredient = async (updatedIngredient) => {
    try {
      if (!updatedIngredient._id) {
        // Adding a new ingredient
        const newIngredient = {
          ...updatedIngredient,
          userId
        };
        
        const result = await addIngredient(newIngredient);
        if (result && result.ingredient) {
          setIngredientsData([...ingredientsData, result.ingredient]);
        }
      } else {
        // Updating existing ingredient
        await updateIngredient(updatedIngredient);
        setIngredientsData(ingredientsData.map(ing => 
          ing._id === updatedIngredient._id ? updatedIngredient : ing
        ));
      }
      return true;
    } catch (error) {
      console.error('Error saving ingredient:', error);
      return false;
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    try {
      await deleteIngredient(ingredientId);
      setIngredientsData(ingredientsData.filter(ing => ing._id !== ingredientId));
      return true;
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      return false;
    }
  };

  // Quick actions
  const markAsPurchased = async (ingredient) => {
    const now = new Date();
    const updatedIngredient = {
      ...ingredient,
      status: 'in-stock',
      purchase_date: now.toISOString() // Set purchase date to today
    };
    
    return await handleSaveIngredient(updatedIngredient);
  };

  const markAsOutOfStock = async (ingredient) => {
    const updatedIngredient = {
      ...ingredient,
      status: 'out-of-stock'
    };
    
    return await handleSaveIngredient(updatedIngredient);
  };

  const markAsNeedToBuy = async (ingredient) => {
    const updatedIngredient = {
      ...ingredient,
      status: 'to-buy',
      purchase_date: null // Clear purchase date
    };
    
    return await handleSaveIngredient(updatedIngredient);
  };

  return {
    ingredientsData,
    setIngredientsData,
    handleSaveIngredient,
    handleDeleteIngredient,
    markAsPurchased,
    markAsOutOfStock,
    markAsNeedToBuy
  };
}