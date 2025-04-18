'use server';

import connect from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import User from "@/models/Users";
import UserProfile from "@/models/UserProfile";

// Helper to convert MongoDB objects for JSON serialization
function convertIds(doc) {
  return JSON.parse(JSON.stringify(doc));
}

export async function registerUser(userData) {
  try {
    await connect();
    const { username, email, password, dietary_preferences, allergies } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: "User already exists" };
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

    return { 
      success: true, 
      message: "User created successfully", 
      userId: newUser._id.toString() 
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
}

export async function loginUser(credentials) {
  try {
    await connect();
    const { email, password } = credentials;

    // Find user by email OR username
    const user = await User.findOne({
      $or: [{ email }, { username: email }] 
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return { success: false, error: "Invalid credentials" };
    }

    // Generate JWT token
    const token = user.jwtGenerateToken();

    return { 
      success: true, 
      message: "Login successful", 
      token, 
      userId: user._id.toString() 
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserProfile(userId) {
  try {
    await connect();
    
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }
    
    const user = await User.findById(userId).select('-password').lean();
    
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    return { success: true, user: convertIds(user) };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserProfile(userId, userData) {
  try {
    await connect();
    
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }
    
    // Find the user first
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    // Update user properties
    if (userData.username) user.username = userData.username;
    if (userData.email) user.email = userData.email;
    if (userData.password) user.password = userData.password;
    if (userData.dietary_preferences !== undefined) user.dietary_preferences = userData.dietary_preferences;
    if (userData.allergies !== undefined) user.allergies = userData.allergies;
    
    // Save the updated user
    await user.save();
    
    return { success: true, user: convertIds(user.toObject()) };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserProfilePic(userId) {
  try {
    await connect();
    
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }
    
    let userProfile = await UserProfile.findOne({ userId }).lean();
    
    // If no profile found, create a default one
    if (!userProfile) {
      const newProfile = new UserProfile({ userId });
      userProfile = await newProfile.save();
      userProfile = userProfile.toObject();
    }
    
    return { success: true, profile: convertIds(userProfile) };
  } catch (error) {
    console.error("Error fetching user profile picture:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserProfilePic(userId, profileData) {
  try {
    await connect();
    
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }
    
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
    
    return { success: true, profile: convertIds(userProfile.toObject()) };
  } catch (error) {
    console.error("Error updating user profile picture:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserPassword(userId, passwordData) {
  try {
    // Validate inputs
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }
    
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return { success: false, error: 'Current password and new password are required' };
    }
    
    // Minimum password length check
    if (passwordData.newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long' };
    }
    
    // Get user data to verify current password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Compare current password
    const isPasswordCorrect = await bcrypt.compare(passwordData.currentPassword, user.password);
    if (!isPasswordCorrect) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordData.newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error: error.message || 'Failed to update password' };
  }
}