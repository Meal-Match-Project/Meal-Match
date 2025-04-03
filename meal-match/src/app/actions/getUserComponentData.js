"use server";

import connect from "@/lib/mongodb";
import Component from "@/models/Components";
import User from "@/models/Users";

/**
 * Retrieves a user's in-stock components and dietary information
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} Object containing components and user dietary info
 */
export async function getUserComponentData(userId) {
  try {
    // Connect to the database
    await connect();
    
    // Get components with at least one serving
    const availableComponents = await Component.find({
      userId: userId,
      servings: { $gte: 1 }
    }).lean();
    
    // Get user dietary information
    const user = await User.findById(userId).select('dietary_preferences allergies').lean();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Parse dietary preferences and allergies from strings to arrays
    // The model stores these as comma-separated strings
    const dietaryPreferences = user.dietary_preferences ? 
      user.dietary_preferences.split(',').map(item => item.trim()) : 
      [];
      
    const allergies = user.allergies ? 
      user.allergies.split(',').map(item => item.trim()) : 
      [];
    
    // Return structured data for the AI
    return {
      components: availableComponents.map(component => ({
        name: component.name,
        servings: component.servings,
        ingredients: component.ingredients || [],
        prepTime: component.prep_time || 0,
        dietaryRestrictions: component.dietary_restrictions || "",
        nutritionalInfo: {
          calories: component.calories || 0,
          protein: component.protein || 0,
          carbs: component.carbs || 0,
          fat: component.fat || 0
        }
      })),
      userDietaryInfo: {
        preferences: dietaryPreferences,
        allergies: allergies
      }
    };
  } catch (error) {
    console.error("Error fetching user component data:", error);
    throw new Error(`Failed to fetch component data: ${error.message}`);
  }
}