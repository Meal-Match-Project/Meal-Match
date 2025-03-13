import connect from '@/lib/mongodb';
import User from '@/models/Users';
import { NextResponse } from 'next/server';

export const POST = async (request) => {
    try {
      const body = await request.json();
      await connect();
      const newUser = new User(body);
      await newUser.save();
  
      return new NextResponse(
        JSON.stringify({ message: "User is created", user: newUser }),
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return new NextResponse("Error in creating user" + error.message, {
        status: 500,
      });
    }
  };