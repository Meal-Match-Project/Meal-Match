import mongoose from 'mongoose';

const ComponentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    servings: {
        type: Number,
        required: true,
    },
    prep_time: {
        type: Number,
        required: false,
    },
    ingredients: {
        type: Array,
        required: false,
    },
    calories: {
        type: Number,
        required: false,
    },
    protein: {
        type: Number,
        required: false,
    },
    carbs: {
        type: Number,
        required: false,
    },
    fat: {
        type: Number,
        required: false,
    },
    notes: {
        type: String,
        required: false,
    },
    dietary_restrictions: {
        type: String,
        required: false,
    },
    favorite: {
        type: Boolean,
        required: true,
    }
}, {timestamps: true});
const Component = mongoose.models.Component || mongoose.model("Component", ComponentSchema);

export default Component;