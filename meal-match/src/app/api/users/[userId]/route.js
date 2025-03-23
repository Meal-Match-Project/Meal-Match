import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import User from '@/models/Users';

// Helper to convert MongoDB ObjectIds to strings for JSON
function convertIds(doc) {
  return JSON.parse(JSON.stringify(doc, (key, value) => {
    // Convert MongoDB ObjectId to string
    if (key === '_id' || key === 'userId') {
      return value.toString();
    }
    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }));
}

// GET user data
export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    await connect();
    
    const user = await User.findById(userId).select('-password').lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(convertIds(user));
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE user data
export async function PUT(request, { params }) {
  try {
    const { userId } = await params;
    const userData = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    await connect();
    
    // Find the user first
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update user properties
    if (userData.username) user.username = userData.username;
    if (userData.email) user.email = userData.email;
    if (userData.password) user.password = userData.password; // This will be hashed by the pre-save hook
    if (userData.dietary_preferences !== undefined) user.dietary_preferences = userData.dietary_preferences;
    if (userData.allergies !== undefined) user.allergies = userData.allergies;
    
    // Save the updated user
    await user.save();
    
    return NextResponse.json({ 
      success: true, 
      user: convertIds(user.toObject()) 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}