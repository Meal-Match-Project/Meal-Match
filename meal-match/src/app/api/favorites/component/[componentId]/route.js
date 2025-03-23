import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import Favorite from '@/models/Favorites';

export async function DELETE(request, { params }) {
  try {
    const { componentId } = params;
    const { userId } = await request.json();
    
    if (!userId || !componentId) {
      return NextResponse.json({ error: 'User ID and Component ID are required' }, { status: 400 });
    }
    
    await connect();
    
    // Find and delete the favorite
    await Favorite.findOneAndDelete({
      user_id: userId,
      component_id: componentId,
      type: 'component'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing component favorite:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}