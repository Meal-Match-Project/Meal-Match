import { NextResponse } from "next/server";
import connect from "@/lib/mongodb";
import User from "@/models/Users";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password, username, dietary_preferences, allergies } = await request.json();
    
    await connect();
    
    // Check if email exists
    const userFoundByEmail = await User.findOne({ email });
    if (userFoundByEmail) {
      return NextResponse.json(
        { error: "email_exists", message: "This email is already registered" }, 
        { status: 400 }
      );
    }
    
    // Check if username exists
    const userFoundByUsername = await User.findOne({ username });
    if (userFoundByUsername) {
      return NextResponse.json(
        { error: "username_exists", message: "This username is already taken" }, 
        { status: 400 }
      );
    }
    
    
    const user = new User({
      username,
      email,
      password,
      dietary_preferences,
      allergies,
    });
    
    const savedUser = await user.save();
    
    return NextResponse.json({ 
      success: true, 
      userId: savedUser._id.toString() 
    }, { status: 201 });
  }
  catch(error) {
    console.error("Registration error:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field}_exists`, message: `This ${field} is already in use` }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "registration_failed", message: error.message }, 
      { status: 500 }
    );
  }
}