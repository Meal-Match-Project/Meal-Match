import connect from "@/lib/mongodb";
import Favorite from "@/models/Favorites";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    
    // Validate required fields
    if (!body.user_id || !body.meal_id) {
      return NextResponse.json(
        { error: "Missing required fields: user_id and meal_id" },
        { status: 400 }
      );
    }
    
    // First check if this favorite already exists
    const existingFavorite = await Favorite.findOne({
      user_id: body.user_id,
      meal_id: body.meal_id
    });
    
    // If it already exists, return success without duplicating
    if (existingFavorite) {
      return NextResponse.json({ 
        success: true, 
        message: "Favorite already exists", 
        favorite: existingFavorite 
      });
    }
    
    // Otherwise create a new favorite
    const favorite = new Favorite({
      user_id: body.user_id,
      meal_id: body.meal_id,
      type: body.type || 'meal',
      created_at: new Date()
    });
    
    await favorite.save();
    
    return NextResponse.json({ 
      success: true, 
      message: "Favorite saved successfully", 
      favorite 
    });
  } catch (error) {
    console.error("Error saving favorite:", error);
    return NextResponse.json(
      { error: "Failed to save favorite: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connect();
    const body = await request.json();
    
    // Validate required fields
    if (!body.user_id || !body.meal_id) {
      return NextResponse.json(
        { error: "Missing required fields: user_id and meal_id" },
        { status: 400 }
      );
    }
    
    // Delete the favorite
    const result = await Favorite.findOneAndDelete({
      user_id: body.user_id,
      meal_id: body.meal_id
    });
    
    if (!result) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Favorite removed successfully"
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite: " + error.message },
      { status: 500 }
    );
  }
}