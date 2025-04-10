"use server";

import { Mistral } from "@mistralai/mistralai";
import { getUserComponentData } from "./getUserComponentData";

const apiKey = process.env.MISTRAL_API_KEY;
const mistral = new Mistral({ apiKey });

/**
 * Helper function to extract JSON from a potentially Markdown-formatted response
 * or convert plain text to a valid response format
 * @param {string} content - The raw content from the API
 * @returns {object} Parsed JSON object or formatted response object
 */
function extractJsonFromResponse(content) {
  // First, try to extract JSON from a Markdown code block
  if (content.includes("```")) {
    // Extract content between code block markers
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.log("Failed to parse JSON from code block, trying alternative methods");
      }
    }
  }
  
  // Second, try to parse the whole content as JSON
  try {
    return JSON.parse(content);
  } catch (e) {
    // If both methods fail, it's likely plain text - convert to our expected format
    console.log("Response appears to be plain text, converting to structured format");
    
    // Check if the response appears to contain meal recommendations
    const containsRecommendations = 
      content.includes("meal") || 
      content.includes("recipe") || 
      content.includes("dish") ||
      content.includes("ingredients");
      
    // Extract any potential meal names using regex
    const mealNameRegex = /"([^"]+)"/g;
    const potentialMealNames = [];
    let match;
    
    while ((match = mealNameRegex.exec(content)) !== null) {
      potentialMealNames.push(match[1]);
    }
    
    // If no quoted meal names, look for lines that might be meal titles
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Lines that look like titles (not too long, no punctuation at end)
      if (trimmedLine && 
          trimmedLine.length > 3 && 
          trimmedLine.length < 50 && 
          !trimmedLine.endsWith('.') &&
          !trimmedLine.includes(':') &&
          (
            trimmedLine.startsWith('1.') || 
            trimmedLine.startsWith('2.') || 
            trimmedLine.startsWith('3.') ||
            trimmedLine.startsWith('-') ||
            /^[A-Z]/.test(trimmedLine) // Starts with capital letter
          )) {
        potentialMealNames.push(trimmedLine.replace(/^[0-9.-]\s*/, ''));
      }
    }
    
    // Create a structured response
    if (containsRecommendations && potentialMealNames.length > 0) {
      // The response contains what looks like meal recommendations
      return {
        message: content,
        recommendations: potentialMealNames.slice(0, 3).map(name => ({
          mealName: name,
          components: [],
          additionalIngredients: [],
          preparationInstructions: "See full response for details.",
          nutritionalInfo: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          }
        }))
      };
    } else {
      // Just a regular text response
      return {
        message: content
      };
    }
  }
}

/**
 * Gets AI meal recommendations based on available components and user preferences
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} Meal recommendations from the AI
 */
export async function getMealRecommendations(userId) {
  try {
    // Get the user's component data and dietary info
    const userData = await getUserComponentData(userId);
    
    // Create a prompt for the AI
    const prompt = `
      You are a helpful meal planning assistant. Based on the components the user has available,
      suggest 3 different meals they could make. Consider their dietary preferences and allergies.
      
      Available Components:
      ${JSON.stringify(userData.components, null, 2)}
      
      User Dietary Preferences: ${userData.userDietaryInfo.preferences.join(', ') || 'None specified'}
      User Allergies: ${userData.userDietaryInfo.allergies.join(', ') || 'None specified'}
      
      For each meal suggestion, provide:
      1. A name for the meal
      2. Which components from their available list to use
      3. Any additional ingredients they might need
      4. Brief preparation instructions
      5. Approximate nutritional information
      
      Return your response as a JSON object with this structure:
      {
        "recommendations": [
          {
            "mealName": "Name of meal",
            "components": ["Component 1", "Component 2"],
            "additionalIngredients": ["Ingredient 1", "Ingredient 2"],
            "preparationInstructions": "Step-by-step instructions",
            "nutritionalInfo": {
              "calories": 0,
              "protein": 0,
              "carbs": 0,
              "fat": 0
            }
          }
        ]
      }
      
      It's extremely important you return valid JSON. Do not include any Markdown formatting, just return the raw JSON.
    `;
    
    // Get recommendations from Mistral
    const response = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    // Extract and parse the JSON, handling cases where the API returns Markdown
    const responseContent = response.choices[0].message.content;
    console.log("Raw API response:", responseContent);
    
    const recommendations = extractJsonFromResponse(responseContent);
    return recommendations;
  } catch (error) {
    console.error("Error generating meal recommendations:", error);
    throw new Error(`Failed to generate meal recommendations: ${error.message}`);
  }
}

/**
 * Handles follow-up questions and continuing conversations about meal recommendations
 * @param {string} userId - The ID of the user
 * @param {Array} chatHistory - Previous messages in the conversation
 * @returns {Promise<Object>} Response from the AI
 */
export async function getMealRecommendationChat(userId, chatHistory) {
  try {
    // Get the user's component data for context
    const userData = await getUserComponentData(userId);
    
    // Create a system message with context about available components
    const systemMessage = {
      role: 'system',
      content: `You are a helpful meal planning assistant helping a user plan meals.
      
The user has the following components available:
${JSON.stringify(userData.components.map(c => c.name), null, 2)}

User dietary preferences: ${userData.userDietaryInfo.preferences.join(', ') || 'None specified'}
User allergies: ${userData.userDietaryInfo.allergies.join(', ') || 'None specified'}

When suggesting meals, try to follow this JSON structure for recommendations:
{
  "message": "Your message to the user",
  "recommendations": [
    {
      "mealName": "Name of meal",
      "components": ["Component 1", "Component 2"],
      "additionalIngredients": ["Ingredient 1", "Ingredient 2"],
      "preparationInstructions": "Step-by-step instructions",
      "nutritionalInfo": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0
      }
    }
  ]
}

However, if you need to respond more conversationally, that's okay too. Just make sure your message is helpful and relevant to the user's needs.`
    };
    
    // Prepare messages for the API call
    const messages = [systemMessage, ...chatHistory];
    
    // Get response from Mistral
    const response = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: messages,
      temperature: 0.7 // Add some creativity, but not too much
    });

    // Get the raw response content
    const responseContent = response.choices[0].message.content;
    console.log("Raw API response:", responseContent);
    
    // Handle both JSON and plain text formats
    const parsedResponse = extractJsonFromResponse(responseContent);
    
    // Before returning, ensure response has a 'message' property
    if (!parsedResponse.message && typeof responseContent === 'string') {
      parsedResponse.message = responseContent;
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error in meal recommendation chat:", error);
    // Return a graceful error message instead of throwing
    return {
      message: `I'm sorry, I encountered an error: ${error.message}. Could you try asking in a different way?`,
      error: true
    };
  }
}


/**
 * Generates a full weekly meal template with component recommendations
 * @param {string} userId - The ID of the user
 * @param {object} options - Additional options like dietary preferences
 * @returns {Promise<Object>} A complete weekly meal plan template
 */
export async function generateWeeklyTemplate(userId, options = {}) {
  try {
    // Get the user's component data and dietary info
    const userData = await getUserComponentData(userId);
    
    // Create a simplified prompt for the AI to generate just components and example meals
    const prompt = `
      You are a meal planning expert. Create a list of versatile, reusable components that a user should prepare for their weekly meal plan.
      
      GUIDELINES:
      1. Focus on 6-10 practical components the user should prepare at the beginning of the week.
      2. These should include around 2-3 proteins, 2-3 grains, 2-3 different ways to prepare vegetables, 2-3 sauces or condiments, and 2-3 extras
      2. These components should be versatile and reusable in different meal combinations.
      3. Include 5-8 example meal ideas using these components that combine 1 protein, 1 grain, 1-2 veggies, 1 sauce, and 1-2 extras
      4. Components should have clear descriptions, prep times, and storage life.
      
      USER INFORMATION:
      Current Components: ${userData.components.map(c => c.name).join(', ') || 'None available'}
      User Dietary Preferences: ${userData.userDietaryInfo.preferences.join(', ') || 'None specified'}
      User Allergies: ${userData.userDietaryInfo.allergies.join(', ') || 'None specified'}
      Additional Preferences: ${options.additionalPreferences || 'None specified'}
      
      Return your response as a JSON object with this structure:
      {
        "name": "Name of the component collection",
        "description": "Brief description of the component-based approach",
        "components_to_prepare": [
          {
            "name": "Component name",
            "notes": "Brief description",
            "prep_time": 30,
            "storage_life": 5,
            "base_ingredients": ["ingredient 1", "ingredient 2"]
          }
        ],
        "example_meals": [
          {
            "name": "Example meal name",
            "components": ["Component 1", "Component 2"],
            "description": "Brief description of how to combine the components"
          }
        ]
      }
      
      Ensure the components are practical, easy to prepare, and that the example meal ideas make sense. Draw from the examples below and from your own knowledge of meal prep and planning.
      Examples of components include:

      -------
      🍗 Proteins
      Grilled Chicken Breast – Simple seasoning, great hot or cold.

      Ground Turkey – Cooked with taco or Italian seasoning.

      Baked Tofu – Soy-ginger glaze or smoky paprika rub.

      Boiled Eggs – Easy snack or salad topping.

      Slow-Cooked Pulled Pork – Neutral or BBQ-flavored.

      Baked Salmon – Lemon-dill or teriyaki versions.

      Lentil Patties or Loaf – High-protein vegetarian option.

      Crispy Chickpeas – Roasted with spices for bowls or wraps.

      Black Beans – Cooked with garlic, cumin, and lime.

      Tempeh Strips – Marinated and pan-seared.

      🍚 Carbohydrates
      Jasmine or Basmati Rice – Light and aromatic.

      Quinoa – Fluffy and protein-rich.

      Sweet Potatoes – Roasted cubes or mashed.

      Whole Wheat Pasta – Neutral base for different sauces.

      Couscous or Pearl Couscous – Quick-cooking and great for bowls.

      Brown Rice or Wild Rice Blend – Hearty and nutty.

      Flatbreads or Tortillas – Great for wraps or tacos.

      Roasted Potatoes – Herbs or paprika roasted.

      Farro – Chewy, great for grain salads.

      Rice Noodles or Soba – For stir-fries or cold noodle bowls.

      🥦 Veggies (Roasted or Steamed)
      Broccoli – Roasted with garlic or lemon.

      Bell Peppers – Roasted, grilled, or sautéed.

      Zucchini & Squash – Sliced and roasted.

      Brussels Sprouts – Roasted with balsamic or sriracha glaze.

      Carrots – Honey roasted or curry-spiced.

      Red Onions – Roasted or pickled.

      Spinach or Kale – Lightly sautéed or fresh.

      Green Beans – Blanched or stir-fried.

      Mushrooms – Sautéed with soy or herbs.

      Cauliflower – Roasted plain or curried.

      🥣 Sauces & Dressings
      Lemon-Tahini Sauce

      Chimichurri

      Peanut or Satay Sauce

      Sriracha-Honey Glaze

      Greek Yogurt Tzatziki

      Balsamic Vinaigrette

      Spicy Mayo

      Hummus or Garlic Hummus

      Soy-Ginger Dressing

      Avocado-Cilantro Lime Sauce

      🧀 Extras & Toppers
      Crumbled Feta or Goat Cheese

      Pickled Red Onions

      Toasted Nuts or Seeds (e.g., almonds, sunflower)

      Fresh Herbs (cilantro, parsley, basil)

      Lemon or Lime Wedges

      Sliced Avocado or Guacamole

      Olives

      Dried Fruit (e.g., cranberries, raisins)

      Hard-Boiled Egg Halves

      Everything Bagel Seasoning

      ------------

      It's extremely important you return valid JSON. Do not include any Markdown formatting, just return the raw JSON.
    `;
    
    // Get template from Mistral
    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    // Extract and parse the JSON, handling cases where the API returns Markdown
    const responseContent = response.choices[0].message.content;
    console.log("Raw API response for weekly template:", responseContent);
    
    const template = extractJsonFromResponse(responseContent);
    return template;
  } catch (error) {
    console.error("Error generating weekly template:", error);
    throw new Error(`Failed to generate weekly template: ${error.message}`);
  }
}

/**
 * Gets general food advice from the AI
 * @param {string} userId - The ID of the user
 * @param {Array} chatHistory - Previous messages in the conversation
 * @returns {Promise<Object>} Response from the AI with message content
 */
export async function getGeneralFoodAdvice(userId, chatHistory = []) {
  try {
    // Create the system message for general food advice
    const systemMessage = {
      role: 'system',
      content: 'You are a helpful culinary assistant providing general advice about food, cooking, and meal ideas. Provide conversational advice about cooking techniques, food pairings, meal planning, and nutritional information. Do not format responses as structured data - just give helpful plain text information.'
    };
    
    // Format the messages for the API call
    const messages = [
      systemMessage,
      ...chatHistory
    ];
    
    // Get response from Mistral
    const response = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: messages,
      temperature: 0.7
    });
    
    // Return the response message
    return {
      success: true,
      message: response.choices[0].message.content
    };
  } catch (error) {
    console.error("Error getting food advice:", error);
    return {
      success: false,
      message: `I'm sorry, I encountered an error. Could you try asking in a different way?`,
      error: error.message
    };
  }
}