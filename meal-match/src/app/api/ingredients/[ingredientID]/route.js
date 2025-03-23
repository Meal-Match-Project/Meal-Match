import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import Ingredient from '@/models/Ingredients';

export async function PUT(request, { params }) {
  try {
    const ingredientID = await params.ingredientID;
    
    if (!ingredientID) {
      return NextResponse.json({ error: 'Ingredient ID is required' }, { status: 400 });
    }
    
    const updatedData = await request.json();
    
    await connect();
    
    const updatedIngredient = await Ingredient.findByIdAndUpdate(
      ingredientID,
      updatedData,
      { new: true, runValidators: true }
    ).lean();
    
    if (!updatedIngredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      ingredient: JSON.parse(JSON.stringify(updatedIngredient))
    });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const ingredientID = await params.ingredientID;
    
    if (!ingredientID) {
      return NextResponse.json({ error: 'Ingredient ID is required' }, { status: 400 });
    }
    
    await connect();
    
    const deletedIngredient = await Ingredient.findByIdAndDelete(ingredientID);
    
    if (!deletedIngredient) {
      return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}