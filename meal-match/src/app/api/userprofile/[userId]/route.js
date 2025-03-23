import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';

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

// GET user profile
export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    await connect();
    
    let userProfile = await UserProfile.findOne({ userId }).lean();
    
    // If no profile found, create a default one
    if (!userProfile) {
      const newProfile = new UserProfile({ userId });
      userProfile = await newProfile.save();
      userProfile = userProfile.toObject();
    }
    
    return NextResponse.json(convertIds(userProfile));
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE user profile
export async function PUT(request, { params }) {
  try {
    const { userId } = await params;
    const profileData = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    await connect();
    
    // Find or create the user profile
    let userProfile = await UserProfile.findOne({ userId });
    
    if (!userProfile) {
      userProfile = new UserProfile({ userId });
    }
    
    // Update profile picture
    if (profileData.profilePicture) {
      userProfile.profilePicture = profileData.profilePicture;
    }
    
    // Save the updated profile
    await userProfile.save();
    
    return NextResponse.json({ 
      success: true, 
      profile: convertIds(userProfile.toObject()) 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}