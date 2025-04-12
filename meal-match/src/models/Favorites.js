import mongoose from 'mongoose';

// Define the schema
const FavoriteSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    meal: {
        type: Object,  // Store the complete meal object
        required: false,
    },
    type: {
        type: String,
        required: true,
        enum: ['meal'],
        default: 'meal'
    }
}, {timestamps: true});

// Safe model registration that handles potential Next.js hot reloading issues
const Favorite = mongoose.models?.Favorite || mongoose.model("Favorite", FavoriteSchema);

export default Favorite;