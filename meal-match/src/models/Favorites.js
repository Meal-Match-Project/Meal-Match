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
    type: {
        type: String,
        required: true,
    }
}, {timestamps: true});

const Favorite = mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);
export default Favorite;