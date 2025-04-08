import { NextResponse } from "next/server";
import connect from "@/lib/mongodb";
import User from "@/models/Users";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password, dietary_preferences, allergies } = body;
    
    console.log("Registration attempt for:", email);
    
    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connect();
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    
    if (existingUser) {
      console.log("Email already in use:", email);
      return NextResponse.json(
        { success: false, error: "Email already in use" },
        { status: 409 }
      );
    }
    
    
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      dietary_preferences: dietary_preferences || "",
      allergies: allergies || "",
      meals: [],
      created_at: new Date(),
    });
    
    // Save user to database
    console.log("Saving user to database...");
    await newUser.save();
    // After saving the user:
    console.log("User saved successfully with ID:", newUser._id);

    // Add verification check
    const verifyUser = await User.findById(newUser._id);

    
    // For debugging: Log raw password length to compare with auth flow
    console.log("Original password length:", password.length);
    
    // Return success without sensitive info
    return NextResponse.json({
      success: true,
      userId: newUser._id.toString(),
      message: "User registered successfully",
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}