'use server';

import connect from "@/lib/mongodb";
import Meal from "@/models/Meals";

// Helper to convert MongoDB objects for JSON serialization
function convertIds(doc) {
  return JSON.parse(JSON.stringify(doc));
}

export async function createMeal(mealData) {
  try {
    // Validate required fields
    if (!mealData.userId) {
      return { success: false, error: "User ID is required" };
    }
    
    await connect();
    
    // Create new meal
    const newMeal = await Meal.create(mealData);
    
    return { success: true, meal: convertIds(newMeal.toObject()) };
  } catch (error) {
    console.error("Error creating meal:", error);
    return { success: false, error: error.message };
  }
}

export async function updateMeal(mealId, updateData) {
  try {
    // Basic validation
    if (!mealId) {
      return { success: false, error: "Meal ID is required" };
    }
    
    await connect();
    
    // Find and update the meal
    const updatedMeal = await Meal.findByIdAndUpdate(
      mealId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
    
    if (!updatedMeal) {
      return { success: false, error: "Meal not found" };
    }
    
    return { success: true, meal: convertIds(updatedMeal) };
  } catch (error) {
    console.error("Error updating meal:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMeal(mealId) {
  try {
    if (!mealId) {
      return { success: false, error: "Meal ID is required" };
    }
    
    await connect();
    
    const deletedMeal = await Meal.findByIdAndDelete(mealId);
    
    if (!deletedMeal) {
      return { success: false, error: "Meal not found" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting meal:", error);
    return { success: false, error: error.message };
  }
}

export async function getMeal(mealId) {
  try {
    if (!mealId) {
      return { success: false, error: "Meal ID is required" };
    }
    
    await connect();
    
    const meal = await Meal.findById(mealId).lean();
    
    if (!meal) {
      return { success: false, error: "Meal not found" };
    }
    
    return { success: true, meal: convertIds(meal) };
  } catch (error) {
    console.error("Error fetching meal:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserMeals(userId) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }
    
    await connect();
    
    const meals = await Meal.find({ userId }).lean();
    
    return { success: true, meals: convertIds(meals) };
  } catch (error) {
    console.error("Error fetching user meals:", error);
    return { success: false, error: error.message };
  }
}