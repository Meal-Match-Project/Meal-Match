import { NextResponse } from "next/server";
import connect from "@/lib/mongodb";
import User from "@/models/Users";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  
  try {
    await connect();
    
    // Look for user with this email (case insensitive)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Return user without password
    return NextResponse.json({ 
      found: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        // Don't include password!
      }
    });
  } catch (error) {
    console.error("Error testing user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}