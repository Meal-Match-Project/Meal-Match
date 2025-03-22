import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    meal_id: {
        type: String,
        required: false,
    },
    component_id: {
        type: String,
        required: false,
    },
}, {timestamps: true});

const Favorite = mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);
export default Favorite;