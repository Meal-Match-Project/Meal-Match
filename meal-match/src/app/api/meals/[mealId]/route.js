import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import Meal from '@/models/Meals';

// Helper to convert ObjectIds for JSON serialization
function convertIds(doc) {
  return JSON.parse(JSON.stringify(doc, (key, value) => {
    // Convert MongoDB ObjectId to string
    if (key === '_id' || key === 'userId' || key === 'meal_id') {
      return value.toString();
    }
    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }));
}

// Create new meal
export async function POST(request, { params }) {
  try {
    // Special case for 'new' route which creates a new meal
    if (params.mealId === 'new') {
      const mealData = await request.json();
      
      // Validate required fields
      if (!mealData.userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }
      
      await connect();
      
      // Create new meal
      const newMeal = await Meal.create(mealData);
      
      return NextResponse.json({ 
        success: true, 
        meal: convertIds(newMeal.toObject())
      });
    } else {
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error creating meal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update existing meal
export async function PUT(request, { params }) {
  try {
    const { mealId } = await params;
    const updateData = await request.json();
    
    // Basic validation
    if (!mealId) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 });
    }
    
    await connect();
    
    // Find and update the meal
    const updatedMeal = await Meal.findByIdAndUpdate(
      mealId,
      updateData,
      { new: true, runValidators: true }
    ).lean();
    
    if (!updatedMeal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      meal: convertIds(updatedMeal)
    });
  } catch (error) {
    console.error('Error updating meal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete meal
export async function DELETE(request, { params }) {
  try {
    const { mealId } = await params;
    
    if (!mealId) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 });
    }
    
    await connect();
    
    const deletedMeal = await Meal.findByIdAndDelete(mealId);
    
    if (!deletedMeal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get a specific meal
export async function GET(request, { params }) {
  try {
    const { mealId } = await params;
    
    if (!mealId) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 });
    }
    
    await connect();
    
    const meal = await Meal.findById(mealId).lean();
    
    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      meal: convertIds(meal)
    });
  } catch (error) {
    console.error('Error fetching meal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}