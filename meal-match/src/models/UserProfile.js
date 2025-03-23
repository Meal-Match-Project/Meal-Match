import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        required: false,
    }
}, {timestamps: true});

const UserProfile = mongoose.models.UserProfile || mongoose.model("UserProfile", UserProfileSchema);
export default UserProfile;