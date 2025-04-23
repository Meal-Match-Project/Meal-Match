/**
 * Utility functions for working with meal data
 */

/**
 * Filter valid components based on available component list
 * @param {Array} components - Components to validate
 * @param {Array} validComponentNames - List of valid component names
 * @returns {Array} - Filtered array of valid components
 */
export function filterValidComponents(components, validComponentNames) {
  if (!components || !Array.isArray(components)) return [];
  if (!validComponentNames || !Array.isArray(validComponentNames)) return components;
  
  return components.filter(comp => validComponentNames.includes(comp));
}

/**
 * Check if a meal has any content
 * @param {Object} meal - The meal object to check
 * @returns {boolean} - True if the meal has components or a name
 */
export function mealHasContent(meal) {
  if (!meal) return false;
  
  return (
    (meal.components && meal.components.length > 0) || 
    (meal.name && meal.name.trim() !== '')
  );
}

/**
 * Group meals by day of week
 * @param {Array} meals - Array of meal objects
 * @returns {Object} - Object with days as keys and arrays of meals as values
 */
export function groupMealsByDay(meals) {
  if (!meals || !Array.isArray(meals)) return {};
  
  const mealsByDay = {};
  
  meals.forEach(meal => {
    if (!mealHasContent(meal)) return; // Skip empty meals
    
    const day = meal.day_of_week;
    if (!mealsByDay[day]) {
      mealsByDay[day] = [];
    }
    
    mealsByDay[day].push({
      meal_type: meal.meal_type,
      meal: {
        name: meal.name,
        components: meal.components || [],
        toppings: meal.toppings || [],
        notes: meal.notes || ''
      }
    });
  });
  
  return mealsByDay;
}

/**
 * Find an appropriate meal slot based on day and meal type
 * @param {Array} meals - Array of all meal objects
 * @param {string} targetDay - Day of the week to target
 * @param {string} targetMealType - Meal type to target (Breakfast, Lunch, Dinner)
 * @returns {Object|null} - The found meal slot or null if none available
 */
export function findMealSlot(meals, targetDay, targetMealType) {
  if (!meals || !Array.isArray(meals)) return null;
  
  // Try to find the specified meal slot first
  let targetMeal = meals.find(mealItem => 
    mealItem.day_of_week === targetDay && 
    mealItem.meal_type === targetMealType
  );
  
  // If no specified slot found or it's already filled, find any empty slot
  if (!targetMeal || targetMeal.components.length > 0) {
    // Look for an empty slot on the target day
    targetMeal = meals.find(mealItem => 
      mealItem.day_of_week === targetDay && 
      mealItem.components.length === 0
    );
    
    // If still no empty slot, find any empty slot
    if (!targetMeal) {
      targetMeal = meals.find(mealItem => mealItem.components.length === 0);
    }
  }
  
  return targetMeal || null;
}

/**
 * Count the number of used servings for each component across all meals
 * @param {Array} meals - Array of all meal objects
 * @returns {Object} - Object with component names as keys and count as values
 */
export function countComponentUsages(meals) {
  if (!meals || !Array.isArray(meals)) return {};
  
  const usageCount = {};
  
  meals.forEach(meal => {
    if (!meal.components || !Array.isArray(meal.components)) return;
    
    meal.components.forEach(component => {
      usageCount[component] = (usageCount[component] || 0) + 1;
    });
  });
  
  return usageCount;
}

/**
 * Find favorite meals that can be made with available components
 * @param {Array} favorites - Array of favorite meal objects
 * @param {Array} availableComponentNames - Array of available component names
 * @returns {Array} - Array of favorite meals that can be made
 */
export function findAvailableFavoriteMeals(favorites, availableComponentNames) {
  if (!favorites || !Array.isArray(favorites)) return [];
  if (!availableComponentNames || !Array.isArray(availableComponentNames)) return [];
  
  return favorites.filter(meal =>
    meal.components && 
    meal.components.length > 0 &&
    meal.components.every(compName => availableComponentNames.includes(compName))
  );
}

/**
 * Create a meal name based on its components
 * @param {Array} components - Array of component names
 * @returns {string} - Generated meal name
 */
export function generateMealName(components) {
  if (!components || !Array.isArray(components) || components.length === 0) {
    return '';
  }

  // If only one component, use that as the name with a suffix
  if (components.length === 1) {
    return `${components[0]} Bowl`;
  }

  // For multiple components, list them with commas and "and"
  if (components.length <= 3) {
    const lastComponent = components[components.length - 1];
    const previousComponents = components.slice(0, -1).join(', ');
    return `${previousComponents} and ${lastComponent}`;
  }

  // For more than 3 components, use first two and count
  return `${components[0]}, ${components[1]} & ${components.length - 2} more`;
}