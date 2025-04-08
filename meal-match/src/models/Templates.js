import mongoose from 'mongoose';

const { Schema } = mongoose;

const componentSchema = new Schema({
  name: String,
  description: String,
  prep_time: Number,
  storage_life: Number,
  base_ingredients: [String]
});

const mealSchema = new Schema({
  name: String,
  components: [String],
  toppings: [String],
  notes: String
});

const daySchema = new Schema({
  day_of_week: String,
  meals: [{
    meal_type: String,  // 'Lunch', 'Dinner', etc.
    meal: mealSchema
  }]
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
  user_id: {
    type: String,
    required: true,
    index: true
  },
  is_public: {
    type: Boolean,
    default: false
  },
  tags: [String],
  dietary_preferences: [String],
  days: [daySchema],
  components_to_prepare: [componentSchema],
  prep_time: Number,
  calories_per_day: Number,
  protein_per_day: Number,
  image_url: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);

export default Template;