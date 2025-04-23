'use server';

import connect from "@/lib/mongodb";
import Favorite from "@/models/Favorites";
import Meal from "@/models/Meals";
import Component from "@/models/Components";

export async function addFavorite(favoriteData) {
  try {
    await connect();
    
    // Validate required fields
    if (!favoriteData.user_id || !favoriteData.meal) {
      return { success: false, error: "Missing required fields: user_id and meal data" };
    }
    
    // Check if a similar meal is already favorited
    const existingFavorite = await Favorite.findOne({
      user_id: favoriteData.user_id,
      'meal.name': favoriteData.meal.name
    });
    
    // If it already exists, return success without duplicating
    if (existingFavorite) {
      return { 
        success: true, 
        message: "Similar favorite already exists", 
        favorite: JSON.parse(JSON.stringify(existingFavorite)) 
      };
    }
    
    // Create a new favorite with complete meal data
    const favorite = new Favorite({
      user_id: favoriteData.user_id,
      meal: favoriteData.meal,
      type: 'meal',
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

export async function removeFavorite(userId, favoriteId) {
  try {
    await connect();
    
    // Validate required fields
    if (!userId || !favoriteId) {
      return { success: false, error: "Missing required fields: userId and favoriteId" };
    }
    
    // Delete the favorite
    const result = await Favorite.findOneAndDelete({
      user_id: userId,
      _id: favoriteId
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
    
    // Update the component to mark it as a favorite (only using the flag)
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
    
    // Update the component to unmark it as a favorite (only using the flag)
    await Component.findByIdAndUpdate(componentId, { favorite: false });
    
    return { success: true, message: "Component removed from favorites successfully" };
  } catch (error) {
    console.error("Error removing component favorite:", error);
    return { success: false, error: error.message };
  }
}

export async function getFavoriteMeals(userId) {
  try {
    await connect();
    
    if (!userId) {
      return { success: false, error: "Missing required parameter: userId" };
    }
    
    // Get all favorite meals for this user
    const favorites = await Favorite.find({
      user_id: userId,
      type: 'meal'
    });
    
    return { 
      success: true, 
      favorites: JSON.parse(JSON.stringify(favorites))
    };
  } catch (error) {
    console.error("Error fetching favorite meals:", error);
    return { success: false, error: error.message };
  }
}

export async function getFavoriteComponents(userId) {
  try {
    await connect();
    
    if (!userId) {
      return { success: false, error: "Missing required parameter: userId" };
    }
    
    // Get all favorite components for this user (based on the favorite flag)
    const components = await Component.find({
      userId: userId,
      favorite: true
    });
    
    return { 
      success: true, 
      components: JSON.parse(JSON.stringify(components))
    };
  } catch (error) {
    console.error("Error fetching favorite components:", error);
    return { success: false, error: error.message };
  }
}