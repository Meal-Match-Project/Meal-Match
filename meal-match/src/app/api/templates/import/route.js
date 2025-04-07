import connect from "@/lib/mongodb";
import Template from "@/models/Templates";
import Meal from "@/models/Meals";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connect();
    const { templateId, userId } = await request.json();
    
    if (!templateId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: templateId and userId" },
        { status: 400 }
      );
    }
    
    // Get the template
    const template = await Template.findById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }
    
    // Get current date
    const today = new Date();
    
    // Clear existing meals for the user (optional, or you could just add the template meals)
    await Meal.deleteMany({ userId: userId });
    
    // Create 7 days of meals based on the template
    const mealsToCreate = [];
    
    // Create meals for each day in the template
    for (let i = 0; i < template.days.length; i++) {
      const templateDay = template.days[i];
      const mealDate = new Date(today);
      mealDate.setDate(today.getDate() + i);
      
      // Create lunch meal
      mealsToCreate.push({
        userId: userId,
        name: templateDay.lunch.name,
        components: templateDay.lunch.components,
        toppings: templateDay.lunch.toppings || [],
        notes: templateDay.lunch.notes || "",
        day: templateDay.day,
        date: mealDate,
        meal_type: "Lunch",
        created_at: new Date()
      });
      
      // Create dinner meal
      mealsToCreate.push({
        userId: userId,
        name: templateDay.dinner.name,
        components: templateDay.dinner.components,
        toppings: templateDay.dinner.toppings || [],
        notes: templateDay.dinner.notes || "",
        day: templateDay.day,
        date: mealDate,
        meal_type: "Dinner",
        created_at: new Date()
      });
    }
    
    // Insert all meals
    await Meal.insertMany(mealsToCreate);
    
    // Increment template popularity
    template.popularity += 1;
    await template.save();
    
    return NextResponse.json({
      success: true,
      message: "Template imported successfully",
      mealCount: mealsToCreate.length
    });
  } catch (error) {
    console.error("Error importing template:", error);
    return NextResponse.json(
      { error: "Failed to import template: " + error.message },
      { status: 500 }
    );
  }
}