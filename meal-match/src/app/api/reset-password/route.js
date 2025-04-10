import { NextResponse } from "next/server";
import connect from "@/lib/mongodb";
import User from "@/models/Users";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, newPassword } = await request.json();
    
    // SECURITY: This is for development only
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Only available in development" }, { status: 403 });
    }
    
    await connect();
    
    // Create a simple hash
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    const user = await User.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${email}$`, 'i') } },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Password reset successfully"
    });
    
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}