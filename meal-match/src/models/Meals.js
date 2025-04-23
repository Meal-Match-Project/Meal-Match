import mongoose from 'mongoose';

const MealSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
    },
    day_of_week: {
        type: String,
        required: true,
    },
    meal_type: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        required: false,
    },
    components: {
        type: Array,
        required: true,
    },
    toppings: {
        type: Array,
        required: false,
    },
    favorite: {
        type: Boolean,
        required: true,
    }
}, {timestamps: true});

const Meal = mongoose.models.Meal || mongoose.model("Meal", MealSchema);
export default Meal;