import mongoose from 'mongoose';

const { Schema } = mongoose;

const mealSchema = new Schema({
  name: String,
  components: [String],
  toppings: [Array],
  notes: String
});

const daySchema = new Schema({
  day: String,
  lunch: mealSchema,
  dinner: mealSchema
});

const templateSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [String],
  dietary_preferences: [String],
  days: [daySchema],
  components_used: [String],
  prep_time: Number,
  calories_per_day: Number,
  protein_per_day: Number,
  image_url: String,
  author: {
    type: String,
    default: 'Meal Match Team'
  },
  popularity: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);

export default Template;