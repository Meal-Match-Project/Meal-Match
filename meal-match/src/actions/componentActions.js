'use server';

import connect from "@/lib/mongodb";
import Component from "@/models/Components";
import User from "@/models/Users";

export async function addComponent(componentData) {
  try {
    await connect();
    
    // Remove any undefined or empty fields
    const cleanedData = Object.fromEntries(
      Object.entries(componentData).filter(([_, v]) => v !== undefined && v !== '')
    );
    
    // Create the component
    const newComponent = await Component.create(cleanedData);
    
    return { success: true, component: JSON.parse(JSON.stringify(newComponent)) };
  } catch (error) {
    console.error("Error adding component:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteComponent(componentId) {
  try {
    await connect();
    
    await Component.findByIdAndDelete(componentId);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting component:", error);
    return { success: false, error: error.message };
  }
}

export async function updateComponent(componentId, componentData) {
    try {
      await connect();
      
      // Remove any undefined or empty fields
      const cleanedData = Object.fromEntries(
        Object.entries(componentData).filter(([_, v]) => v !== undefined && v !== '')
      );
      
      // Update the component
      const updatedComponent = await Component.findByIdAndUpdate(
        componentId,
        cleanedData,
        { new: true, runValidators: true } // Return the updated document and run validators
      );
      
      if (!updatedComponent) {
        return { success: false, error: "Component not found" };
      }
      
      return { 
        success: true, 
        component: JSON.parse(JSON.stringify(updatedComponent)) 
      };
    } catch (error) {
      console.error("Error updating component:", error);
      return { success: false, error: error.message };
    }
  }

export async function getUserComponentData(userId) {
  try {
    // Connect to the database
    await connect();
    
    // Get components with at least one serving
    const availableComponents = await Component.find({
      userId: userId
    }).lean(); // Get all components, not just those with servings >= 1
    
    // Get user dietary information
    const user = await User.findById(userId).select('dietary_preferences allergies').lean();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Parse dietary preferences and allergies from strings to arrays
    const dietaryPreferences = user.dietary_preferences ? 
      user.dietary_preferences.split(',').map(item => item.trim()) : 
      [];
      
    const allergies = user.allergies ? 
      user.allergies.split(',').map(item => item.trim()) : 
      [];
    
    // Return structured data that includes the _id field
    return {
      components: availableComponents.map(component => ({
        _id: component._id.toString(), // Add the _id field
        name: component.name,
        servings: component.servings,
        ingredients: component.ingredients || [],
        prep_time: component.prep_time || 0, // Use the original field name
        dietary_restrictions: component.dietary_restrictions || "",
        notes: component.notes || "",
        favorite: component.favorite || false,
        calories: component.calories || 0,
        protein: component.protein || 0,
        carbs: component.carbs || 0,
        fat: component.fat || 0,
        userId: component.userId.toString()
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