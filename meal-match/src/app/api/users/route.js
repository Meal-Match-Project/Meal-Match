import connect from '@/lib/mongodb';
import User from '@/models/Users';
import { NextResponse } from 'next/server';

export const POST = async (request) => {
    try {
        await connect();
        const { username, email, password, dietary_preferences, allergies, type } = await request.json();

        if (type === "register") {
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
                allergies,
                components: [],
                meals: []
            });

            await newUser.save();

            return new NextResponse(
                JSON.stringify({ message: "User created successfully", userId: newUser._id }),
                { status: 201 }
            );
        } 
        
        else if (type === "login") {
            console.log(`Looking for user with email or username: ${email}`);

            // Find user by email OR username
            const user = await User.findOne({
                $or: [{ email: email }, { username: email }] 
            });

            if (!user) {
                console.log("User not found!");
                return new NextResponse(
                    JSON.stringify({ error: "User not found" }),
                    { status: 404 }
                );
            }

            // Verify password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                console.log("Invalid password");
                return new NextResponse(
                    JSON.stringify({ error: "Invalid credentials" }),
                    { status: 401 }
                );
            }

            // Generate JWT token
            console.log("Password matched, generating token...");
            const token = user.jwtGenerateToken();

            return new NextResponse(
                JSON.stringify({ 
                    message: "Login successful", 
                    token, 
                    userId: user._id  // Return userId here
                }),
                { status: 200 }
            );
        } 

        return new NextResponse(
            JSON.stringify({ error: "Invalid request type" }),
            { status: 400 }
        );
      
    } catch (error) {
        console.error(error);
        return new NextResponse(
            JSON.stringify({ error: "Error processing request", details: error.message }),
            { status: 500 }
        );
    }
};
