import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import Favorite from '@/models/Favorites';
import Meal from '@/models/Meals';
import Component from '@/models/Components';

// Helper to convert ObjectIds
function convertIds(docs) {
    return JSON.parse(JSON.stringify(docs, (key, value) => {
      if ((key === '_id' || key === 'userId' || key === 'mealId' || 
           key === 'user_id' || key === 'meal_id' || key === 'component_id') && value) {
        return value.toString();
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }));
  }

export async function POST(request) {
  try {
    const { user_id, meal_id, component_id, type } = await request.json();
    
    if (!user_id || (!meal_id && !component_id) || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    await connect();
    
    // Check if this favorite already exists
    const query = { 
      user_id, 
      type,
      ...(meal_id ? { meal_id } : {}),
      ...(component_id ? { component_id } : {})
    };
    
    const existingFavorite = await Favorite.findOne(query);
    
    if (existingFavorite) {
      // Already favorited - nothing to do
      return NextResponse.json({ success: true, favorite: convertIds(existingFavorite) });
    }
    
    // Create new favorite
    const newFavorite = await Favorite.create({
        user_id,
        meal_id: meal_id || null,
        component_id: component_id || null,
        type: meal_id ? 'meal' : 'component'  // Set a default based on IDs if not provided
      });
    
    // If it's a meal, update the meal's favorite field
    if (type === 'meal' && meal_id) {
      await Meal.findByIdAndUpdate(meal_id, { favorite: true });
    }
    
    // If it's a component, update the component's favorite field
    if (type === 'component' && component_id) {
      await Component.findByIdAndUpdate(component_id, { favorite: true });
    }
    
    return NextResponse.json({ 
      success: true, 
      favorite: convertIds(newFavorite)
    });
  } catch (error) {
    console.error('Error saving favorite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');
      const mealId = searchParams.get('mealId');
      const componentId = searchParams.get('componentId');
      
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }
      
      await connect();
      
      // Build the query based on provided parameters
      let query = { user_id: userId };
      
      if (mealId) {
        query.meal_id = mealId;
        query.type = 'meal';
      }
      
      if (componentId) {
        query.component_id = componentId;
        query.type = 'component';
      }
      
      // Get matching favorites
      const favorites = await Favorite.find(query).lean();
      
      return NextResponse.json({ 
        success: true, 
        favorites: convertIds(favorites)
      });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }