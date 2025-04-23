/**
 * Centralized API service for handling all backend requests
 */

// Import component actions
import { 
    addComponent,
    updateComponent,
    deleteComponent,
    getUserComponentData
  } from '@/actions/componentActions';
  
  // Import user actions
  import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getUserProfilePic,
    updateUserProfilePic,
    updateUserPassword,
  } from '@/actions/userActions';
  
  // Import template actions
  import {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    importTemplate
  } from '@/actions/templateActions';
  
  // Import meal actions
  import {
    createMeal,
    updateMeal,
    deleteMeal,
    getMeal,
    getUserMeals
  } from '@/actions/mealActions';
  
  // Import favorite actions
  import {
    addFavorite,
    removeFavorite,
    getFavoriteMeals,
    addComponentFavorite,
    removeComponentFavorite,
  } from '@/actions/favoriteActions';
  
  // Import ingredient actions
  import {
    addIngredient,
    getIngredients,
    updateIngredient,
    deleteIngredient
  } from '@/actions/ingredientActions';
  
  // Import data actions
  import {
    saveMealPlanData,
    fetchUserMealData
  } from '@/actions/dataActions';
  
  // Re-export all the server actions
  export {
    // Component actions
    addComponent,
    updateComponent,
    deleteComponent,
    getUserComponentData,
    
    // User actions
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getUserProfilePic,
    updateUserProfilePic,
    updateUserPassword,
    
    // Template actions
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    importTemplate,
    
    // Meal actions
    createMeal,
    updateMeal,
    deleteMeal,
    getMeal,
    getUserMeals,
    
    // Favorite actions
    addFavorite,
    removeFavorite,
    addComponentFavorite,
    removeComponentFavorite,
    getFavoriteMeals,
    
    // Ingredient actions
    addIngredient,
    getIngredients,
    updateIngredient,
    deleteIngredient,
    
    // Data actions
    saveMealPlanData,
    fetchUserMealData
  };
  
  /**
   * Legacy helper function for fetch API (could be removed later)
   */
  async function handleResponse(response, errorMessage = 'API request failed') {
    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        errorDetail = await response.text() || `Status: ${response.status}`;
      }
      
      throw new Error(`${errorMessage}: ${errorDetail}`);
    }
    
    return await response.json();
  }
  
  /**
   * Legacy API method for getting AI meal recommendations
   * This could be converted to a server action later
   */
  export async function getAIMealRecommendations(options) {
    const response = await fetch('/api/ai/meal-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    
    return handleResponse(response, 'Failed to get meal recommendations');
  }