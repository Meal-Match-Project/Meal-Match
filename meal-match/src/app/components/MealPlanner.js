'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import ComponentsSidebar from './ComponentsSidebar';
import MealGrid from './MealGrid';
import SaveMealModal from '@/app/components/modals/SaveMealModal';
import { addComponent } from '../actions/componentActions';
import TutorialModal from './TutorialModal';


export default function MealPlanner({ components = [], meals = [], favorites = [], userId, dayInfo = [] }) {
  // Initialize state from props
  const [componentsData, setComponentsData] = useState(components);
  const [mealsData, setMealsData] = useState(meals);
  const [favoritesData, setFavoritesData] = useState(favorites);
  const [daysInfo, setDaysInfo] = useState(dayInfo);

  // Additional local states
  const [activeItem, setActiveItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedMealComponents, setSelectedMealComponents] = useState([]);
  const [selectedMealToppings, setSelectedMealToppings] = useState([]);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if user has seen the tutorial
  useEffect(() => {
    const tutorialShown = localStorage.getItem(`tutorial-shown-${userId}`);
    if (!tutorialShown && userId) {
      setShowTutorial(true);
    }
  }, [userId]);

  // Save data function - only called explicitly when needed
  const saveData = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          componentsData,
          mealsData
        }),
      });
      
      if (response.ok) {
        setLastSaved(new Date());
      } else {
        console.error("Failed to save data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle adding a new component
  const handleAddComponent = async (componentData) => {
    try {
      // Call the server action to add component to database
      const result = await addComponent(componentData);
      
      if (result.success) {
        // Update local state with the new component
        setComponentsData(prev => [...prev, result.component]);
      } else {
        console.error("Failed to add component:", result.error);
      }
    } catch (error) {
      console.error("Error adding component:", error);
    }
  };

  // Clicking on a meal in the grid
  const handleMealClick = (mealId) => {
    setSelectedMeal(mealId);
    const meal = mealsData.find((meal) => meal._id === mealId) || {};
    setSelectedMealComponents(meal.components || []);
    setSelectedMealToppings(meal.toppings || []);
    setModalOpen(true);
  };

  // Clearing a meal from the grid
  const handleClearMeal = (mealId) => {
    setMealsData((prev) => 
      prev.map((meal) => 
        meal._id === mealId
          ? {
              ...meal,            // Keep ID and other base properties
              name: '',
              components: [],     // Clear components array
              toppings: [],       // Clear toppings array  
              notes: '',          // Reset notes to empty string
              favorite: false     // Set favorite to false
            }
          : meal
      )
    );
    
    // Save after clearing a meal
    saveData();
  };

  const handleMoveComponent = (sourceMealId, sourceIndex, component, targetMealId) => {
    // 1. Remove from source meal
    setMealsData((prev) => {
      const updatedMeals = prev.map((meal) =>
        meal._id === sourceMealId
          ? {
              ...meal,
              components: meal.components.filter((_, idx) => idx !== sourceIndex),
            }
          : meal
      );
      return updatedMeals;
    });
  
    // 2. Add to target meal
    setMealsData((prev) => {
      const updatedMeals = prev.map((meal) =>
        meal._id === targetMealId
          ? {
              ...meal,
              components: [...meal.components, component],
            }
          : meal
      );
      return updatedMeals;
    });
    
    // Save after moving a component
    saveData();
  };

  // Start dragging
  const handleDragStart = (event) => {
    setActiveItem(event.active.id);
  };

  // Dropping an item (component or meal) onto a meal slot
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);
    
    if (!over) return; // dropped outside a valid meal slot
    
    const draggedItemId = active.id;
    const targetMealId = over.id;
    
    let componentAdded = false; // Flag to track if a component was added
    
    // Check if this is a meal component being dragged
    if (draggedItemId.toString().startsWith('meal-component:')) {
      // Extract the source meal ID, component name, and index
      const [, sourceMealId, component, sourceIndex] = draggedItemId.split(':');
      
      // If dropping onto a different meal, move the component
      if (sourceMealId !== targetMealId) {
        handleMoveComponent(sourceMealId, parseInt(sourceIndex), component, targetMealId);
        componentAdded = true;
      }
      
      // If same meal, do nothing
      return;
    }
    
    // Case 1: If it's a favorite meal
    if (draggedItemId.startsWith('meal-')) {
      handleFavoriteMealDrop(draggedItemId, targetMealId);
      componentAdded = true;
      return;
    }
    
    // Case 2: If it's a component from the sidebar
    const compIndex = componentsData.findIndex(
      (comp) => comp.name === draggedItemId
    );
    
    if (compIndex !== -1) {
      // Existing component handling logic
      const draggedComp = componentsData[compIndex];
      if (draggedComp.servings > 0) {
        // Add it to that meal plan's array
        setMealsData((prev) => {
          const updatedMeals = prev.map((meal) =>
            meal._id === targetMealId
              ? {
                  ...meal,
                  components: [
                    ...meal.components,
                    draggedComp.name,
                  ],
                }
              : meal
          );
          return updatedMeals;
        });
        
        // Decrement the serving count in componentsData
        setComponentsData((prev) => {
          const updated = [...prev];
          updated[compIndex] = {
            ...updated[compIndex],
            servings: updated[compIndex].servings - 1,
          };
          return updated;
        });
        
        componentAdded = true;
      }
    }
    
    // Save data only if a component was added
    if (componentAdded) {
      saveData();
    }
  };

  const handleSaveMeal = async (mealData, isFavorite) => {
    try {
      // 1. First save/update the meal
      const mealResponse = await fetch(`/api/meals/${mealData._id || 'new'}`, {
        method: mealData._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mealData,
          userId, // Make sure userId is included
        })
      });
      
      if (!mealResponse.ok) {
        throw new Error('Failed to save meal');
      }
      
      const savedMeal = await mealResponse.json();
      const mealId = savedMeal.meal._id;
      
      // 2. Handle favorite status
      if (isFavorite) {
        const favoriteResponse = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            meal_id: mealId,
            type: 'meal'
          })
        });
        
        if (!favoriteResponse.ok) {
          console.warn('Failed to save as favorite');
        }
      }
      
      // 3. Update local state
      setMealsData(prev => {
        const exists = prev.some(m => m._id === mealId);
        if (exists) {
          return prev.map(m => m._id === mealId ? { ...m, ...mealData, _id: mealId } : m);
        } else {
          return [...prev, { ...mealData, _id: mealId }];
        }
      });
      
      // Save data when a meal is saved through the modal
      saveData();
      
      return true;
    } catch (error) {
      console.error('Error saving meal:', error);
      throw error;
    }
  };

  const handleFavoriteMealDrop = (favoriteMealId, targetMealId) => {
    // Extract meal name from the id (remove 'meal-' prefix)
    const mealName = favoriteMealId.replace('meal-', '');
    
    // Find the matching favorite meal object
    const favMealObj = mealsData.find((m) => m.name === mealName);
    if (!favMealObj) return;
    
    // Get all component names from the favorite meal
    const componentNames = favMealObj.components || [];
    
    // First update the target meal to include all these components
    setMealsData((prev) => {
      const updatedMeals = prev.map((meal) =>
        meal._id === targetMealId
          ? {
              ...meal,
              components: [
                ...meal.components,
                ...componentNames.map((compName) => compName),
              ],
            }
          : meal
      );
      return updatedMeals;
    });
    
    // Then decrement the servings count for each component used
    componentNames.forEach((compName) => {
      const compIndex = componentsData.findIndex(
        (comp) => comp.name === compName
      );
      
      if (compIndex !== -1 && componentsData[compIndex].servings > 0) {
        setComponentsData((prev) => {
          const updated = [...prev];
          updated[compIndex] = {
            ...updated[compIndex],
            servings: updated[compIndex].servings - 1,
          };
          return updated;
        });
      }
    });
    
    // Save data after dropping a favorite meal
    saveData();
  };

  // Remove a single component from a meal slot
  const handleRemoveComponent = (mealId, index, componentName) => {
    // Remove from mealsData
    setMealsData((prev) => {
      const updatedMeals = prev.map((meal) =>
        meal._id === mealId
          ? {
              ...meal,
              components: meal.components.filter(
                (comp, compIndex) => compIndex !== index
              ),
            }
          : meal
      );
      return updatedMeals;
    });

    // Restore a serving to componentsData
    const compIndex = componentsData.findIndex(
      (comp) => comp.name === componentName
    );
    if (compIndex !== -1) {
      setComponentsData((prev) => {
        const updated = [...prev];
        updated[compIndex] = {
          ...updated[compIndex],
          servings: updated[compIndex].servings + 1,
        };
        return updated;
      });
    }
    
    // Save after removing a component
    saveData();
  };

  // Add a "mini" component (like a topping) to a meal slot
  const handleAddMiniComponent = (mealId, miniComponentName) => {
    setMealsData((prev) => {
      const updatedMeals = prev.map((meal) =>
        meal._id === mealId
          ? {
              ...meal,
              toppings: [
                miniComponentName,
                ...meal.toppings,
              ],
            }
          : meal
      );
      return updatedMeals;
    });
    
    // Save after adding a mini component
    saveData();
  };

  return (
    <>
      {showTutorial && (
        <TutorialModal 
          userId={userId}
          onClose={() => setShowTutorial(false)}
        />
      )}
      
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex h-[80vh] bg-gray-100 p-4 rounded-lg shadow-lg">
          <ComponentsSidebar
            components={componentsData}
            favorites={favoritesData}
            userId={userId}
            onAddComponent={handleAddComponent}
          />
          <MealGrid
            meals={mealsData}
            components={componentsData}
            onRemoveComponent={handleRemoveComponent}
            onAddMiniComponent={handleAddMiniComponent}
            onMealClick={handleMealClick}
            onClearMeal={handleClearMeal}
            onMoveComponent={handleMoveComponent}
            dayInfo={daysInfo} />
          <SaveMealModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSaveMeal}
            mealId={selectedMeal}
            mealComponents={selectedMealComponents}
            mealToppings={selectedMealToppings}
          />
        </div>
        <DragOverlay>
          {activeItem ? <DraggableItem id={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}

function DraggableItem({ id }) {
  // Check if this is a meal component
  if (id.toString().startsWith('meal-component:')) {
    // Extract just the component name (third part of the ID)
    const [, , component] = id.split(':');
    return (
      <div className="p-2 max-w-[150px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing transform scale-110 transition-transform duration-200">
        {component}
      </div>
    );
  }
  
  // If it's a component from sidebar or favorite meal
  if (id.startsWith('meal-')) {
    // It's a favorite meal - extract name after 'meal-' prefix
    const mealName = id.replace('meal-', '');
    return (
      <div className="p-2 max-w-[150px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing transform scale-110 transition-transform duration-200">
        {mealName}
      </div>
    );
  }
  
  // Default case - regular component from sidebar
  return (
    <div className="p-2 max-w-[150px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing transform scale-110 transition-transform duration-200">
      {id}
    </div>
  );
}