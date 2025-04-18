/**
 * Utilities for working with meal plan templates
 */

/**
 * Extract components used in meals
 * @param {Array} meals - Array of meal objects
 * @param {Array} componentsData - Full component data
 * @returns {Array} Components data for the template
 */
export function extractComponentsForTemplate(meals, componentsData) {
  console.log("Extracting components from meals:", meals.length, "with components data:", componentsData.length);
  
  // DEBUG: Add more detailed inspection of components
  if (meals.length > 0) {
    const firstMeal = meals[0];
    console.log("First meal structure:", {
      name: firstMeal.name,
      hasComponents: Boolean(firstMeal.components),
      isArray: Array.isArray(firstMeal.components),
      componentsLength: Array.isArray(firstMeal.components) ? firstMeal.components.length : 0,
      componentsType: typeof firstMeal.components,
      componentsContent: JSON.stringify(firstMeal.components).substring(0, 100)
    });
  }
  
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
  
  console.log(`Found ${uniqueComponentNames.size} unique component names`);
  
  // Map the names to the full component data
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
    } else {
      // Fallback if component data not found
      console.warn(`Component data not found for: ${compName}`);
      templateComponents.push({
        name: compName,
        description: "",
        prep_time: 0,
        storage_life: 0,
        base_ingredients: []
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

export function groupMealsByDayForTemplate(meals) {
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
  
  /**
   * Map template components to user component format
   * @param {Array} templateComponents - Array of components from a template
   * @param {string} userId - User ID
   * @returns {Array} Array of components in user component format
   */
  export function mapTemplateComponentsToUserFormat(templateComponents, userId) {
    return templateComponents.map(component => ({
      name: component.name,
      favorite: false,
      servings: 3, // Default value
      prep_time: component.prep_time || 30,
      ingredients: component.base_ingredients || [],
      notes: component.description || '',
      userId
    }));
  }
  
  /**
   * Calculate shopping list from template components
   * @param {Array} templateComponents - Array of components from a template
   * @returns {Array} Shopping list items grouped by category
   */
  export function calculateShoppingList(templateComponents) {
    // First, extract all ingredients with their quantities
    const allIngredients = [];
    
    templateComponents.forEach(component => {
      if (!component.base_ingredients) return;
      
      component.base_ingredients.forEach(ingredient => {
        // Handle different ingredient formats
        if (typeof ingredient === 'string') {
          allIngredients.push({
            name: ingredient.trim(),
            quantity: '',
            category: 'Miscellaneous'
          });
        } else if (typeof ingredient === 'object') {
          allIngredients.push({
            name: ingredient.name || '',
            quantity: ingredient.quantity || '',
            category: ingredient.category || 'Miscellaneous'
          });
        }
      });
    });
    
    // Group ingredients by category
    const groupedIngredients = {};
    
    allIngredients.forEach(ingredient => {
      const { category, name, quantity } = ingredient;
      
      if (!groupedIngredients[category]) {
        groupedIngredients[category] = [];
      }
      
      // Check if this ingredient already exists in the group
      const existingIndex = groupedIngredients[category].findIndex(item => 
        item.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingIndex >= 0) {
        // If it exists and both have quantities, combine them
        const existing = groupedIngredients[category][existingIndex];
        if (quantity && existing.quantity) {
          // This is a simple concatenation, but you might want to
          // implement more sophisticated quantity adding logic
          existing.quantity = `${existing.quantity}, ${quantity}`;
        }
      } else {
        // Add new ingredient
        groupedIngredients[category].push({ name, quantity });
      }
    });
    
    // Convert to array format
    return Object.keys(groupedIngredients).map(category => ({
      category,
      items: groupedIngredients[category]
    }));
  }
  
  /**
   * Generate a prep schedule from template
   * @param {Object} template - Template object with components
   * @returns {Array} Prep schedule with days and tasks
   */
  export function generatePrepSchedule(template) {
    if (!template?.components_to_prepare) {
      return [];
    }
    
    // Sort components by prep time (longest first)
    const sortedComponents = [...template.components_to_prepare]
      .sort((a, b) => (b.prep_time || 0) - (a.prep_time || 0));
    
    // Determine total prep time needed
    const totalPrepTime = sortedComponents.reduce(
      (total, comp) => total + (comp.prep_time || 30), 
      0
    );
    
    // Create prep schedule (simple version - you could make this more sophisticated)
    let remainingTime = totalPrepTime;
    const daysNeeded = Math.ceil(totalPrepTime / 120); // Assume 2 hours per day max
    
    const schedule = [];
    let currentDay = 1;
    let currentDayComponents = [];
    let currentDayTime = 0;
    
    sortedComponents.forEach(component => {
      const prepTime = component.prep_time || 30;
      
      // If adding this component exceeds 2 hours, move to next day
      if (currentDayTime + prepTime > 120 && currentDayComponents.length > 0) {
        schedule.push({
          day: currentDay,
          totalTime: currentDayTime,
          components: currentDayComponents
        });
        
        currentDay++;
        currentDayComponents = [];
        currentDayTime = 0;
      }
      
      // Add component to current day
      currentDayComponents.push({
        name: component.name,
        prepTime,
        description: component.description || ''
      });
      
      currentDayTime += prepTime;
      remainingTime -= prepTime;
    });
    
    // Add the last day if it has components
    if (currentDayComponents.length > 0) {
      schedule.push({
        day: currentDay,
        totalTime: currentDayTime,
        components: currentDayComponents
      });
    }
    
    return schedule;
  }