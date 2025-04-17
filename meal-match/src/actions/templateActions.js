'use server';

import connect from "@/lib/mongodb";
import Template from "@/models/Templates";
import Component from "@/models/Components";
import Meal from "@/models/Meals";

// Helper to convert MongoDB objects for JSON serialization
function convertIds(doc) {
  return JSON.parse(JSON.stringify(doc));
}

export async function getTemplates(userId) {
  try {
    await connect();
    
    let query = {};
    
    // If userId is provided, get templates for that user + public templates
    if (userId) {
      query = {
        $or: [
          { user_id: userId },
          { is_public: true }
        ]
      };
    } else {
      // Only get public templates if no userId
      query = { is_public: true };
    }
    
    const templates = await Template.find(query).sort({ created_at: -1 }).lean();
    
    return { success: true, templates: convertIds(templates) };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return { success: false, error: error.message };
  }
}

export async function getTemplateById(templateId) {
  try {
    await connect();
    
    const template = await Template.findById(templateId).lean();
    
    if (!template) {
      return { success: false, error: "Template not found" };
    }
    
    return { success: true, template: convertIds(template) };
  } catch (error) {
    console.error("Error fetching template:", error);
    return { success: false, error: error.message };
  }
}

export async function createTemplate(templateData) {
  try {
    await connect();
    
    // Validate required fields
    if (!templateData.name || !templateData.description || !templateData.user_id) {
      return { success: false, error: "Missing required fields" };
    }
    
    // Create the template
    const template = new Template(templateData);
    await template.save();
    
    return { success: true, template: convertIds(template.toObject()) };
  } catch (error) {
    console.error("Error creating template:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTemplate(templateId, templateData) {
  try {
    await connect();
    
    // Find the template first to verify ownership
    const template = await Template.findById(templateId);
    
    if (!template) {
      return { success: false, error: "Template not found" };
    }
    
    // Verify the requesting user owns this template
    if (template.user_id !== templateData.userId) {
      return { success: false, error: "Unauthorized to update this template" };
    }
    
    // Update the template
    const updatedTemplate = await Template.findByIdAndUpdate(
      templateId,
      { $set: templateData },
      { new: true }
    ).lean();
    
    return { success: true, template: convertIds(updatedTemplate) };
  } catch (error) {
    console.error("Error updating template:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTemplate(templateId, userId) {
  try {
    await connect();
    
    // Find the template first to verify ownership
    const template = await Template.findById(templateId);
    
    if (!template) {
      return { success: false, error: "Template not found" };
    }
    
    // Verify the requesting user owns this template
    if (template.user_id !== userId) {
      return { success: false, error: "Unauthorized to delete this template" };
    }
    
    // Delete the template
    await Template.findByIdAndDelete(templateId);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting template:", error);
    return { success: false, error: error.message };
  }
}

export async function importTemplate(templateId, userId) {
  try {
    await connect();
    
    // Find the template
    const template = await Template.findById(templateId);
    
    if (!template) {
      return { success: false, error: "Template not found" };
    }
    
    // Import components first
    const addedComponents = [];
    
    if (template.components_to_prepare && template.components_to_prepare.length > 0) {
      for (const comp of template.components_to_prepare) {
        // Check if component already exists
        const existingComponent = await Component.findOne({ 
          userId: userId,
          name: comp.name 
        });
        
        if (!existingComponent) {
          // Create new component
          const newComponent = new Component({
            name: comp.name,
            notes: comp.description,
            prep_time: comp.prep_time,
            ingredients: comp.base_ingredients,
            servings: 3, // Default value
            userId: userId,
            favorite: false,
          });
          
          await newComponent.save();
          addedComponents.push(newComponent);
        } else {
          // Increase servings of existing component
          existingComponent.servings += 3;
          await existingComponent.save();
          addedComponents.push(existingComponent);
        }
      }
    }
    
    // Get current week's days and meals
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all the user's existing meals for the week
    const existingMeals = await Meal.find({ userId }).lean();
    
    // Get the current day names for this week (to match the user's current week)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentWeekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      currentWeekDays.push({
        date: new Date(day),
        name: dayNames[day.getDay()],
        display: i === 0 ? 'Today' : dayNames[day.getDay()]
      });
    }
    
    // Map template days to the current week days
    const dayMapping = {};
    if (template.days && template.days.length > 0) {
      template.days.forEach(templateDay => {
        // Find matching day in current week
        const matchingDay = currentWeekDays.find(day => 
          day.name.toLowerCase() === templateDay.day_of_week.toLowerCase()
        );
        
        if (matchingDay) {
          dayMapping[templateDay.day_of_week] = matchingDay.name;
        } else {
          // If no exact match, keep the original
          dayMapping[templateDay.day_of_week] = templateDay.day_of_week;
        }
      });
    }
    
    // Process each day in the template
    let mealsCreated = 0;
    let mealsUpdated = 0;

    // Define field name constants to ensure consistency
    const DAY_FIELD = "day_of_week";
    const MEAL_TYPE_FIELD = "meal_type";

    console.log("Starting to process template days:", template.days.length);
    console.log("Existing meals count:", existingMeals.length);

    if (template.days && template.days.length > 0) {
      for (const day of template.days) {
        const templateDayName = day.day_of_week;
        // Use the mapped day name to match the current week
        const currentDayName = dayMapping[templateDayName] || templateDayName;
        
        console.log(`Processing day: ${templateDayName} -> ${currentDayName}`);
        
        if (day.meals && day.meals.length > 0) {
          for (const mealData of day.meals) {
            const mealType = mealData.meal_type;
            
            console.log(`  Processing meal type: ${mealType}`);
            
            const existingMeal = existingMeals.find(meal => {
              // Make case-insensitive comparisons to avoid case-related duplicates
              const dayMatches = (meal[DAY_FIELD] || '').toLowerCase() === currentDayName.toLowerCase();
              const typeMatches = (meal[MEAL_TYPE_FIELD] || '').toLowerCase() === mealType.toLowerCase();
              return dayMatches && typeMatches;
            });
            
            // Set components and meal data from the template
            const mealComponents = mealData.meal.components || [];
            const mealToppings = mealData.meal.toppings || [];
            const mealName = mealData.meal.name || '';
            const mealNotes = mealData.meal.notes || '';
            
            // Convert meal name if needed
            let finalMealName = mealName;
            if (!finalMealName) {
              finalMealName = mealComponents.length > 0 
                ? `${currentDayName} ${mealType}` 
                : '';
            }
            
            console.log(`  Components: ${mealComponents.join(', ')}`);
            console.log(`  Existing meal found: ${!!existingMeal}`);
            
            try {
              if (existingMeal) {
                // Update the existing meal
                console.log(`  Updating meal: ${existingMeal._id}`);
                await Meal.findByIdAndUpdate(existingMeal._id, {
                  $set: {
                    name: finalMealName,
                    components: mealComponents,
                    toppings: mealToppings,
                    notes: mealNotes
                  }
                });
                mealsUpdated++;
              } else {
                // If no existing meal found, create a new one
                console.log(`  Creating new meal for ${currentDayName} ${mealType}`);
                const newMeal = new Meal({
                  name: finalMealName,
                  components: mealComponents,
                  toppings: mealToppings,
                  notes: mealNotes,
                  [DAY_FIELD]: currentDayName,
                  [MEAL_TYPE_FIELD]: mealType,
                  userId: userId,
                  date: new Date(),
                  favorite: false  // Add this missing required field
                });

                await newMeal.save();
                mealsCreated++;
              }
            } catch (mealError) {
              console.error(`Error processing meal for ${currentDayName} ${mealType}:`, mealError);
            }
          }
        }
      }
    }

  console.log(`Import complete: ${mealsCreated} meals created, ${mealsUpdated} meals updated`);
  return { 
    success: true, 
    message: "Template imported successfully",
    componentsAdded: addedComponents.length,
    mealsCreated,
    mealsUpdated
  };
  } catch (error) {
    console.error("Error importing template:", error);
    return { success: false, error: error.message };
  }
}
