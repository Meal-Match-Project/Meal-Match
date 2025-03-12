import connect from '@/lib/mongodb';
import User from '@/models/Users';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await connect();
        const { username, email, password, dietary_preferences, allergies } = req.json();
        const user = await User.create({ username, email, password, dietary_preferences, allergies });
        await user.save();
        return NextResponse.json({ message: 'User created successfully' }, { status: 201 });

    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
    }
}