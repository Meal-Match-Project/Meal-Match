'use server';

import connect from "@/lib/mongodb";
import Ingredient from "@/models/Ingredients";

export async function addIngredient(ingredientData) {
  try {
    await connect();
    const newIngredient = await Ingredient.create(ingredientData);
    
    return { 
      success: true, 
      ingredient: JSON.parse(JSON.stringify(newIngredient))
    };
  } catch (error) {
    console.error("Error adding ingredient:", error);
    return { success: false, error: error.message };
  }
}

export async function getIngredients(userId) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }
    
    await connect();
    const ingredients = await Ingredient.find({ userId }).lean();
    
    return { 
      success: true, 
      ingredients: JSON.parse(JSON.stringify(ingredients))
    };
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return { success: false, error: error.message };
  }
}

export async function updateIngredient(ingredientId, ingredientData) {
  try {
    if (!ingredientId) {
      return { success: false, error: "Ingredient ID is required" };
    }
    
    await connect();
    
    const updatedIngredient = await Ingredient.findByIdAndUpdate(
      ingredientId,
      ingredientData,
      { new: true, runValidators: true }
    ).lean();
    
    if (!updatedIngredient) {
      return { success: false, error: "Ingredient not found" };
    }
    
    return { 
      success: true, 
      ingredient: JSON.parse(JSON.stringify(updatedIngredient))
    };
  } catch (error) {
    console.error("Error updating ingredient:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteIngredient(ingredientId) {
  try {
    if (!ingredientId) {
      return { success: false, error: "Ingredient ID is required" };
    }
    
    await connect();
    
    const deletedIngredient = await Ingredient.findByIdAndDelete(ingredientId);
    
    if (!deletedIngredient) {
      return { success: false, error: "Ingredient not found" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return { success: false, error: error.message };
  }
}