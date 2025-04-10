"use server";

import { connect } from "@/lib/mongodb";
import User from "@/models/Users";
import bcrypt from "bcryptjs";

export const register = async(values) => {
    const { email, password, username, dietaryPreferences, allergies } = values;
    try {
        await connect();
        const userFound = await User.findOne({ email });
        if (userFound) {
            return { error: "User already exists" };
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            dietary_preferences,
            allergies,
        });
        const savedUser = await user.save();
    }

    catch(e) {
        console.log(e);
    }
}