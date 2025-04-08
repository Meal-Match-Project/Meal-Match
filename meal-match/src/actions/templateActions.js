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
            userId: userId
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
    
    // Import meals if they exist
    if (template.days && template.days.length > 0) {
      // First clear existing meals for this user
      await Meal.deleteMany({ userId });
      
      // Add new meals from template
      for (const day of template.days) {
        if (day.meals && day.meals.length > 0) {
          for (const mealData of day.meals) {
            const newMeal = new Meal({
              name: mealData.meal.name || '',
              components: mealData.meal.components || [],
              toppings: mealData.meal.toppings || [],
              notes: mealData.meal.notes || '',
              day_of_week: day.day_of_week,
              meal_type: mealData.meal_type,
              userId
            });
            
            await newMeal.save();
          }
        }
      }
    }
    
    // Update template popularity
    template.popularity = (template.popularity || 0) + 1;
    await template.save();
    
    return { 
      success: true, 
      message: "Template imported successfully",
      componentsAdded: addedComponents.length
    };
  } catch (error) {
    console.error("Error importing template:", error);
    return { success: false, error: error.message };
  }
}