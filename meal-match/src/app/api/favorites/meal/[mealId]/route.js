import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import Favorite from '@/models/Favorites';

export async function DELETE(request, { params }) {
  try {
    const { mealId } = params;
    const { userId } = await request.json();
    
    if (!userId || !mealId) {
      return NextResponse.json({ error: 'User ID and Meal ID are required' }, { status: 400 });
    }
    
    await connect();
    
    // Find and delete the favorite
    await Favorite.findOneAndDelete({
      user_id: userId,
      meal_id: mealId,
      type: 'meal'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing meal favorite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}