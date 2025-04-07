/**
 * Script to create sample meal plan templates
 * Run with: node scripts/createSampleTemplates.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const sampleTemplates = [
  {
    name: "Simple Weeknight Dinners",
    description: "A beginner-friendly meal plan focused on quick and easy weeknight dinners with minimal ingredients. Perfect for busy professionals.",
    tags: ["beginner", "quick", "simple", "weeknight"],
    dietary_preferences: ["Gluten-Free", "High-Protein"],
    days: [
      {
        day: "Monday",
        lunch: {
          name: "Mediterranean Salad Bowl",
          components: ["Grilled Chicken", "Mixed Greens"],
          toppings: ["Feta Cheese", "Olives", "Cucumber"],
          notes: "Dress with olive oil and lemon juice"
        },
        dinner: {
          name: "Simple Pasta Marinara",
          components: ["Pasta", "Marinara Sauce"],
          toppings: ["Parmesan Cheese", "Basil"],
          notes: "Add red pepper flakes for heat if desired"
        }
      },
      {
        day: "Tuesday",
        lunch: {
          name: "Turkey Wrap",
          components: ["Turkey Breast", "Whole Wheat Wrap"],
          toppings: ["Lettuce", "Tomato", "Avocado"],
          notes: "Add mustard or mayo"
        },
        dinner: {
          name: "Sheet Pan Chicken & Vegetables",
          components: ["Chicken Thighs", "Roasted Vegetables"],
          toppings: ["Fresh Herbs"],
          notes: "Season well with salt, pepper, and herbs"
        }
      },
      // Add more days...
    ],
    components_used: [
      "Grilled Chicken", "Mixed Greens", "Pasta", "Marinara Sauce", 
      "Turkey Breast", "Whole Wheat Wrap", "Chicken Thighs", "Roasted Vegetables"
    ],
    prep_time: 90,
    calories_per_day: 1800,
    protein_per_day: 100,
    image_url: "/images/templates/simple-weeknight.jpg",
    author: "Meal Match Team",
    popularity: 1245,
    created_at: new Date()
  },
  // Add more templates...
];

async function createTemplates() {
  try {
    await client.connect();
    const database = client.db("meal_match");
    const templatesCollection = database.collection("templates");
    
    // Delete existing templates
    await templatesCollection.deleteMany({});
    
    // Insert new templates
    const result = await templatesCollection.insertMany(sampleTemplates);
    
    console.log(`${result.insertedCount} templates inserted successfully`);
  } catch (err) {
    console.error("Error creating templates:", err);
  } finally {
    await client.close();
  }
}

createTemplates();