import connect from '@/lib/mongodb';
import User from '@/models/Users';
import { NextResponse } from 'next/server';

export const POST = async (request) => {
    try {
      await connect();
      const { username, email, password, dietary_preferences, allergies } = await request.json();

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return new NextResponse(
          JSON.stringify({ error: "User already exists" }),
          { status: 400 }
        );
      }

      // Create new user
      const newUser = new User({
        username,
        email,
        password,
        dietary_preferences,
        allergies
      });

      await newUser.save();

      return new NextResponse(
        JSON.stringify({ message: "User created successfully", user: newUser }),
        { status: 201 }
      );
    } catch (error) {
      console.error(error);
      return new NextResponse(
        JSON.stringify({ error: "Error creating user", details: error.message }),
        { status: 500 }
      );
    }
};
