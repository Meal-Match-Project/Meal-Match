'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import ComponentsSidebar from './ComponentsSidebar';
import MealGrid from './MealGrid';
import SaveMealModal from '@/app/components/modals/SaveMealModal';
import { addComponent } from '../actions/componentActions';

export default function MealPlanner({ components = [], meals = [], favorites = [], userId }) {
  // Initialize state from props
  const [componentsData, setComponentsData] = useState(components);
  const [mealsData, setMealsData] = useState(meals);
  const [favoritesData, setFavoritesData] = useState(favorites);

  // Additional local states
  const [activeItem, setActiveItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedMealComponents, setSelectedMealComponents] = useState([]);
  const [selectedMealToppings, setSelectedMealToppings] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

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

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (componentsData.length > 0 || mealsData.length > 0) {
        saveData();
      }
    }, 60000); // Auto-save every minute
    
    return () => clearInterval(autoSaveInterval);
  }, [componentsData, mealsData, userId]);

  // Save on important data changes (debounced)
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (componentsData.length > 0 || mealsData.length > 0) {
        saveData();
      }
    }, 5000); // Wait 5 seconds after changes before saving
    
    return () => clearTimeout(saveTimer);
  }, [componentsData, mealsData]);
    
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
        // You could add error handling UI here
      }
    } catch (error) {
      console.error("Error adding component:", error);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = async () => {
      // Call our /api route to invoke the server action
      await fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentsData,
          mealsData
        }),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [componentsData, mealsData]);

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
  };

  // Saving a meal (to local state) when user hits “Save Meal” in modal
  const handleSaveMeal = (title, components, toppings, notes) => {
    setSavedMeals((prev) => [
      ...prev,
      { name: title, components, toppings, notes },
    ]);
  };

  // Start dragging
  const handleDragStart = (event) => {
    setActiveItem(event.active.id);
  };

  // Dropping an item (component or meal) onto a meal slot
  // Refactored handleDragEnd to use the new function
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!over) return; // dropped outside a valid meal slot

    const draggedItemId = active.id;
    const targetMealId = over.id;

    // Case 1: If it's a favorite meal
    if (draggedItemId.startsWith('meal-')) {
      handleFavoriteMealDrop(draggedItemId, targetMealId);
      return;
    }

    // Case 2: If it's a component
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
      }
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
  };

  // Add a “mini” component (like a topping) to a meal slot
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
  };

  console.log(componentsData, mealsData, favoritesData)

  return (
    <>
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
            onRemoveComponent={handleRemoveComponent}
            onAddMiniComponent={handleAddMiniComponent}
            onMealClick={handleMealClick}
            onClearMeal={handleClearMeal}
          />
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
      <div className="fixed bottom-4 right-4 flex gap-2">
      {lastSaved && (
        <span className="text-sm text-gray-500 self-center">
          Last saved: {lastSaved.toLocaleTimeString()}
        </span>
      )}
      <button
        onClick={saveData}
        disabled={isSaving}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-lg transition"
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  </>
  );
}

function DraggableItem({ id }) {
  return (
    <div className="p-2 max-w-[150px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing transform scale-110 transition-transform duration-200">
      {id}
    </div>
  );
}