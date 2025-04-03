import connect from "@/lib/mongodb";
import Favorite from "@/models/Favorites";
import Component from "@/models/Components";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.componentId) {
      return NextResponse.json(
        { error: "Missing required fields: userId and componentId" },
        { status: 400 }
      );
    }
    
    // First check if this favorite already exists
    const existingFavorite = await Favorite.findOne({
      user_id: body.userId,
      component_id: body.componentId,
      type: 'component'
    });
    
    // If it already exists, return success without duplicating
    if (existingFavorite) {
      return NextResponse.json({ 
        success: true, 
        message: "Component favorite already exists" 
      });
    }
    
    // Otherwise create a new favorite
    const favorite = new Favorite({
      user_id: body.userId,
      component_id: body.componentId,
      type: 'component',
      created_at: new Date()
    });
    
    await favorite.save();
    
    // Update the component to mark it as a favorite
    await Component.findByIdAndUpdate(body.componentId, { favorite: true });
    
    return NextResponse.json({ 
      success: true, 
      message: "Component marked as favorite successfully"
    });
  } catch (error) {
    console.error("Error saving component favorite:", error);
    return NextResponse.json(
      { error: "Failed to save component as favorite: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const componentId = searchParams.get('componentId');
    const userId = searchParams.get('userId');
    
    if (!componentId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters: componentId and userId" },
        { status: 400 }
      );
    }
    
    // Delete from favorites collection
    await Favorite.deleteOne({
      user_id: userId,
      component_id: componentId,
      type: 'component'
    });
    
    // Update the component to unmark it as a favorite
    await Component.findByIdAndUpdate(componentId, { favorite: false });
    
    return NextResponse.json({ 
      success: true, 
      message: "Component removed from favorites successfully"
    });
  } catch (error) {
    console.error("Error removing component favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove component from favorites: " + error.message },
      { status: 500 }
    );
  }
}