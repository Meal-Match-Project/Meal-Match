'use server';

import connect from "@/lib/mongodb";
import Favorite from "@/models/Favorites";
import Meal from "@/models/Meals";
import Component from "@/models/Components";

export async function addFavorite(favoriteData) {
  try {
    await connect();
    
    // Validate required fields
    if (!favoriteData.user_id || !favoriteData.meal_id) {
      return { success: false, error: "Missing required fields: user_id and meal_id" };
    }
    
    // First check if this favorite already exists
    const existingFavorite = await Favorite.findOne({
      user_id: favoriteData.user_id,
      meal_id: favoriteData.meal_id
    });
    
    // If it already exists, return success without duplicating
    if (existingFavorite) {
      return { 
        success: true, 
        message: "Favorite already exists", 
        favorite: JSON.parse(JSON.stringify(existingFavorite)) 
      };
    }
    
    // Otherwise create a new favorite
    const favorite = new Favorite({
      user_id: favoriteData.user_id,
      meal_id: favoriteData.meal_id,
      type: favoriteData.type || 'meal',
      created_at: new Date()
    });
    
    await favorite.save();
    
    return { 
      success: true, 
      message: "Favorite saved successfully", 
      favorite: JSON.parse(JSON.stringify(favorite)) 
    };
  } catch (error) {
    console.error("Error saving favorite:", error);
    return { success: false, error: error.message };
  }
}

export async function removeFavorite(userId, mealId) {
  try {
    await connect();
    
    // Validate required fields
    if (!userId || !mealId) {
      return { success: false, error: "Missing required fields: userId and mealId" };
    }
    
    // Delete the favorite
    const result = await Favorite.findOneAndDelete({
      user_id: userId,
      meal_id: mealId
    });
    
    if (!result) {
      return { success: false, error: "Favorite not found" };
    }
    
    return { success: true, message: "Favorite removed successfully" };
  } catch (error) {
    console.error("Error removing favorite:", error);
    return { success: false, error: error.message };
  }
}

export async function addComponentFavorite(userId, componentId) {
  try {
    await connect();
    
    // Validate required fields
    if (!userId || !componentId) {
      return { success: false, error: "Missing required fields: userId and componentId" };
    }
    
    // First check if this favorite already exists
    const existingFavorite = await Favorite.findOne({
      user_id: userId,
      component_id: componentId,
      type: 'component'
    });
    
    // If it already exists, return success without duplicating
    if (existingFavorite) {
      return { success: true, message: "Component favorite already exists" };
    }
    
    // Otherwise create a new favorite
    const favorite = new Favorite({
      user_id: userId,
      component_id: componentId,
      type: 'component',
      created_at: new Date()
    });
    
    await favorite.save();
    
    // Update the component to mark it as a favorite
    await Component.findByIdAndUpdate(componentId, { favorite: true });
    
    return { success: true, message: "Component marked as favorite successfully" };
  } catch (error) {
    console.error("Error saving component favorite:", error);
    return { success: false, error: error.message };
  }
}

export async function removeComponentFavorite(userId, componentId) {
  try {
    await connect();
    
    if (!componentId || !userId) {
      return { success: false, error: "Missing required parameters: componentId and userId" };
    }
    
    // Delete from favorites collection
    await Favorite.deleteOne({
      user_id: userId,
      component_id: componentId,
      type: 'component'
    });
    
    // Update the component to unmark it as a favorite
    await Component.findByIdAndUpdate(componentId, { favorite: false });
    
    return { success: true, message: "Component removed from favorites successfully" };
  } catch (error) {
    console.error("Error removing component favorite:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteFavoriteById(favoriteId) {
  try {
    await connect();
    
    // Find the favorite before deleting it to get its details
    const favorite = await Favorite.findById(favoriteId);
    
    if (!favorite) {
      return { success: false, error: "Favorite not found" };
    }
    
    // Delete the favorite
    await Favorite.findByIdAndDelete(favoriteId);
    
    // Update the related item's favorite status
    if (favorite.type === 'meal' && favorite.meal_id) {
      // Check if there are any other favorites for this meal
      const otherFavorites = await Favorite.findOne({ 
        meal_id: favorite.meal_id,
        _id: { $ne: favoriteId }
      });
      
      // If no other favorites, update the meal
      if (!otherFavorites) {
        await Meal.findByIdAndUpdate(favorite.meal_id, { favorite: false });
      }
    }
    
    if (favorite.type === 'component' && favorite.component_id) {
      // Check if there are any other favorites for this component
      const otherFavorites = await Favorite.findOne({ 
        component_id: favorite.component_id,
        _id: { $ne: favoriteId }
      });
      
      // If no other favorites, update the component
      if (!otherFavorites) {
        await Component.findByIdAndUpdate(favorite.component_id, { favorite: false });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error removing favorite by ID:", error);
    return { success: false, error: error.message };
  }
}