import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import Favorite from '@/models/Favorites';
import Meal from '@/models/Meals';
import Component from '@/models/Components';

export async function DELETE(request, { params }) {
  try {
    const { favoriteId } = params;
    
    await connect();
    
    // Find the favorite before deleting it to get its details
    const favorite = await Favorite.findById(favoriteId);
    
    if (!favorite) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
    }
    
    // Delete the favorite
    await Favorite.findByIdAndDelete(favoriteId);
    
    // Update the related item's favorite status
    if (favorite.type === 'meal' && favorite.meal_id) {
      // Check if there are any other favorites for this meal
      const otherFavorites = await Favorite.findOne({ 
        meal_id: favorite.meal_id,
        _id: { $ne: favoriteId }
      });
      
      // If no other favorites, update the meal
      if (!otherFavorites) {
        await Meal.findByIdAndUpdate(favorite.meal_id, { favorite: false });
      }
    }
    
    if (favorite.type === 'component' && favorite.component_id) {
      // Check if there are any other favorites for this component
      const otherFavorites = await Favorite.findOne({ 
        component_id: favorite.component_id,
        _id: { $ne: favoriteId }
      });
      
      // If no other favorites, update the component
      if (!otherFavorites) {
        await Component.findByIdAndUpdate(favorite.component_id, { favorite: false });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}