import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: false,
    },
    shelf_life: {
        type: Number,
        required: true,
    },
}, {timestamps: true});

const Ingredient = mongoose.models.Ingredient || mongoose.model("Ingredient", IngredientSchema);
export default Ingredient;