'use server';

import connect from "@/lib/mongodb";
import Component from "@/models/Components";
import Meal from "@/models/Meals";
import User from "@/models/Users";

export async function saveMealPlanData(userId, componentsData, mealsData) {
  try {
    await connect();
    
    // First, save all components
    for (const component of componentsData) {
      const componentData = { ...component, userId };
      if (component._id) {
        await Component.findByIdAndUpdate(component._id, componentData, { upsert: true });
      } else {
        componentData.userId = userId;
        await Component.create(componentData);
      }
    }

    // Then handle meals - with special handling for string IDs
    for (const meal of mealsData) {
      // Check if the meal has a string ID like "Wednesday-Breakfast"
      const isStringId = meal._id && typeof meal._id === 'string' && 
                        !meal._id.match(/^[0-9a-fA-F]{24}$/);
      
      // Create meal data without the ID field if it's a string ID
      // Add required fields to ensure validation passes
      const mealData = { 
        ...meal, 
        userId,
        // Ensure required fields exist with defaults
        favorite: meal.favorite || false,
        name: meal.name || `${meal.day_of_week} ${meal.meal_type}`
      };
      
      if (isStringId) {
        // For string IDs, use the day_of_week and meal_type to find or create the meal
        const existingMeal = await Meal.findOne({ 
          userId, 
          day_of_week: meal.day_of_week, 
          meal_type: meal.meal_type,
          date: meal.date
        });
        
        if (existingMeal) {
          // Remove the string ID before updating to prevent MongoDB errors
          const { _id, ...mealDataWithoutId } = mealData;
          
          // Update existing meal - WITHOUT the string ID that would cause errors
          await Meal.findByIdAndUpdate(existingMeal._id, mealDataWithoutId);
        } else {
          // Create new meal - don't include the string ID in the database record
          const { _id, ...mealWithoutStringId } = mealData;
          await Meal.create(mealWithoutStringId);
        }
      } else if (meal._id) {
        // Regular MongoDB ObjectId - use the normal update path
        await Meal.findByIdAndUpdate(meal._id, mealData, { upsert: true });
      } else {
        // No ID at all - create a new meal
        await Meal.create(mealData);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error saving meal plan data:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchUserMealData(userId, startDate = new Date()) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }
    
    await connect();
    
    // Fetch user
    const user = await User.findById(userId).select('-password').lean();
    
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    // Fetch components
    const components = await Component.find({ userId }).lean();
    
    // Fetch meals
    const meals = await Meal.find({ userId }).lean();
    
    return { 
      success: true, 
      data: {
        user: JSON.parse(JSON.stringify(user)),
        components: JSON.parse(JSON.stringify(components)),
        meals: JSON.parse(JSON.stringify(meals))
      }
    };
  } catch (error) {
    console.error("Error fetching user meal data:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchWeekMeals(userId) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }
    
    await connect();
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all meals for this user
    // We're not filtering by date in the query because MongoDB date queries
    // can be tricky with timezones - we'll filter in memory instead
    const meals = await Meal.find({ userId }).lean();
    
    // Convert MongoDB objects for safe JSON serialization
    const serializedMeals = JSON.parse(JSON.stringify(meals));
    
    return { 
      success: true, 
      meals: serializedMeals
    };
  } catch (error) {
    console.error("Error fetching week's meals:", error);
    return { success: false, error: error.message };
  }
}