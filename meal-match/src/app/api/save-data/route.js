import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import Component from '@/models/Components';
import Meal from '@/models/Meals';

export async function POST(request) {
  try {
    const { userId, componentsData, mealsData } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}