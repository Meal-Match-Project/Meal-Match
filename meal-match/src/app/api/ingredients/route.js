import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import Ingredient from '@/models/Ingredients';

export async function POST(request) {
  try {
    const ingredientData = await request.json();
    
    await connect();
    const newIngredient = await Ingredient.create(ingredientData);
    
    return NextResponse.json({ 
      success: true, 
      ingredient: JSON.parse(JSON.stringify(newIngredient))
    });
  } catch (error) {
    console.error('Error adding ingredient:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    await connect();
    const ingredients = await Ingredient.find({ userId }).lean();
    
    return NextResponse.json({ 
      success: true, 
      ingredients: JSON.parse(JSON.stringify(ingredients))
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}