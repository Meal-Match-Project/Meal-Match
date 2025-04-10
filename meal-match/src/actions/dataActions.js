'use server';

import connect from "@/lib/mongodb";
import Component from "@/models/Components";
import Meal from "@/models/Meals";
import User from "@/models/Users";

export async function saveMealPlanData(userId, componentsData, mealsData) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }
    
    await connect();
    
    // Save components
    if (componentsData && componentsData.length > 0) {
      for (const comp of componentsData) {
        if (comp._id) {
          await Component.findByIdAndUpdate(comp._id, comp, { upsert: true });
        } else {
          comp.userId = userId;
          await Component.create(comp);
        }
      }
    }
    
    // Save meals
    if (mealsData && mealsData.length > 0) {
      for (const meal of mealsData) {
        if (meal._id) {
          await Meal.findByIdAndUpdate(meal._id, meal, { upsert: true });
        } else {
          meal.userId = userId;
          await Meal.create(meal);
        }
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
    // You can add date filtering logic here if needed
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