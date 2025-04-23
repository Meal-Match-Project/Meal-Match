'use server';

import connect from "@/lib/mongodb";
import Template from "@/models/Templates";
import Component from "@/models/Components";
import Meal from "@/models/Meals";

import { getUserMeals } from './mealActions';
import { getUserComponentData } from './componentActions';

/**
 * Server-side template creation - handles the entire flow
 */
export async function createTemplateFromUserData(userId, templateMetadata) {
  // Use the passed meals if available, otherwise fetch from server
  let meals;
  if (templateMetadata.currentMeals) {
    meals = templateMetadata.currentMeals;
    console.log(`Using ${meals.length} meals passed from client`);
  } else {
    // Fallback to fetching from server
    const { success: mealSuccess, meals: fetchedMeals } = await getUserMeals(userId);
    if (!mealSuccess) return { success: false, error: "Failed to fetch meals" };
    meals = fetchedMeals;
  }
  
  const componentData = await getUserComponentData(userId);
  const componentsData = componentData.components;
  
  // Process the meals - these should now be the current week's meals
  const filteredMeals = meals.filter(meal => 
    (meal.components && meal.components.length > 0) || 
    (meal.name && meal.name.trim() !== '')
  );
  
  // Log the days/meals to diagnose issues
  console.log("Days in meals:", [...new Set(filteredMeals.map(m => m.day_of_week))]);
  console.log("Meal types:", [...new Set(filteredMeals.map(m => m.meal_type))]);
  
  // Rest of the function remains the same
  const templateComponents = await extractComponentsForTemplate(filteredMeals, componentsData);
  const templateDays = await groupMealsByDayForTemplate(filteredMeals);

  // Debug to verify data
  console.log(`Template will have ${templateDays.length} days and ${templateComponents.length} components`);
  
  // 3. Create and save the template directly
  const templateData = {
    name: templateMetadata.name,
    description: templateMetadata.description,
    user_id: userId,
    is_public: templateMetadata.isPublic || false,
    days: templateDays,
    components_to_prepare: templateComponents,
    tags: templateMetadata.tags || [],
    dietary_preferences: templateMetadata.dietaryPreferences || []
  };
  
  // 4. Create the template and return the result
  return await createTemplate(templateData);
}

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
    
    console.log("Server received template data:", {
      name: templateData.name,
      description: templateData.description,
      user_id: templateData.user_id,
      has_days: Boolean(templateData.days),
      days_count: templateData.days?.length || 0,
      has_components: Boolean(templateData.components_to_prepare),
      components_count: templateData.components_to_prepare?.length || 0
    });
    
    // Validate required fields
    if (!templateData.name || !templateData.description || !templateData.user_id) {
      return { success: false, error: "Missing required fields" };
    }
    
    // Create the template
    const template = new Template(templateData);
    await template.save();
    
    console.log("Template saved successfully with ID:", template._id);
    
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
    
    const addedComponents = [];
    const newComponentNames = []; // Track names of newly added components
    
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
          newComponentNames.push(comp.name); // Track the name
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
            // IMPORTANT FIX: Ensure components are simple strings, not objects
            const mealComponents = Array.isArray(mealData.meal.components) 
              ? mealData.meal.components.map(comp => typeof comp === 'object' ? comp.name : comp)
              : [];
              
            const mealToppings = Array.isArray(mealData.meal.toppings) 
              ? mealData.meal.toppings.map(topping => typeof topping === 'object' ? topping.name : topping)
              : [];
              
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
                  favorite: false
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

    // Added debugging to check the state of meals after updates
    const updatedMealsFromDB = await Meal.find({ userId }).lean();
    console.log(`After updates - meals with components: ${updatedMealsFromDB.filter(m => 
      m.components && m.components.length > 0).length}`);

    console.log(`Import complete: ${mealsCreated} meals created, ${mealsUpdated} meals updated`);
    return { 
      success: true, 
      message: "Template imported successfully",
      componentsAdded: addedComponents.length,
      newComponentNames: newComponentNames,
      mealsCreated,
      mealsUpdated,
      // Return the full updated meals
      updatedMeals: convertIds(updatedMealsFromDB)
    };
  } catch (error) {
    console.error("Error importing template:", error);
    return { success: false, error: error.message };
  }
}

export async function extractComponentsForTemplate(meals, componentsData) {
  console.log("Extracting components from meals:", meals.length, "with components data:", componentsData.length);
  
  // Create a Set to track unique component names/ids across all meals
  const uniqueComponentNames = new Set();
  
  // First collect all unique component identifiers from meals
  meals.forEach(meal => {
    // Ensure components is an array before trying to iterate
    if (Array.isArray(meal.components) && meal.components.length > 0) {
      meal.components.forEach(comp => {
        // Handle different possible formats
        if (typeof comp === 'string') {
          // If component is a string name or ID
          uniqueComponentNames.add(comp);
        } else if (comp && typeof comp === 'object') {
          // If component is an object, try to get the name or ID
          if (comp.name) {
            uniqueComponentNames.add(comp.name);
          } else if (comp._id) {
            // Try to find the component by ID in componentsData
            const matchedComponent = componentsData.find(c => c._id === comp._id);
            if (matchedComponent && matchedComponent.name) {
              uniqueComponentNames.add(matchedComponent.name);
            }
          }
        }
      });
    }
  });
  
  // THIS IS KEY - Filter components first by those that are actually used in meals
  const templateComponents = [];
  
  uniqueComponentNames.forEach(compName => {
    // Find matching component in componentsData
    const componentData = componentsData.find(c => c.name === compName);
    
    if (componentData) {
      // Format for template's component schema
      templateComponents.push({
        name: componentData.name,
        description: componentData.notes || "",
        prep_time: componentData.prep_time || 0,
        storage_life: componentData.storage_life || 0,
        base_ingredients: Array.isArray(componentData.ingredients) 
          ? [...componentData.ingredients] 
          : []
      });
    }
  });
  
  console.log(`Created ${templateComponents.length} template components`);
  return templateComponents;
}
  
/**
 * Group meals by day of week for template format
 * @param {Array} meals - Array of meal objects
 * @returns {Array} Array of day objects with meals for template
 */

export async function groupMealsByDayForTemplate(meals) {
  console.log("GROUPING MEALS BY DAY:", meals.length);
  
  // Verify each meal has the essential fields
  const mealsWithValidStructure = meals.filter(meal => {
    const hasDayOfWeek = Boolean(meal.day_of_week);
    const hasMealType = Boolean(meal.meal_type);
    const hasContentOrName = (meal.components?.length > 0) || 
                             (meal.name && meal.name.trim() !== '');
    
    // Log any meals missing critical fields
    if (!hasDayOfWeek || !hasMealType) {
      console.log("MEAL MISSING FIELDS:", {
        id: meal._id,
        name: meal.name,
        hasDayOfWeek,
        hasMealType,
        day: meal.day_of_week,
        type: meal.meal_type
      });
    }
    
    return hasDayOfWeek && hasMealType && hasContentOrName;
  });
  
  console.log(`Found ${mealsWithValidStructure.length} valid meals out of ${meals.length}`);
  
  // Skip empty meals
  const nonEmptyMeals = meals.filter(meal => 
    (meal.components && meal.components.length > 0) || 
    (meal.name && meal.name.trim() !== '')
  );
  
  // Group by day
  const mealsByDay = {};
  
  nonEmptyMeals.forEach(meal => {
    const day = meal.day_of_week;
    if (!mealsByDay[day]) {
      mealsByDay[day] = new Map(); // Use Map to ensure unique meal types
    }
    
    const mealType = meal.meal_type;
    
    // Only add or replace if this meal has content
    if (meal.components?.length > 0 || (meal.name && meal.name.trim() !== '')) {
      mealsByDay[day].set(mealType, {
        meal_type: mealType,
        meal: {
          name: meal.name || '',
          components: meal.components || [],
          toppings: meal.toppings || [],
          notes: meal.notes || ''
        }
      });
    }
  });
  
  // Convert to array format
  return Object.keys(mealsByDay).map(day => ({
    day_of_week: day,
    meals: Array.from(mealsByDay[day].values()) // Convert Map values to array
  }));
}
