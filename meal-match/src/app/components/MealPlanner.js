'use client';

import { useState, useEffect, useCallback } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import ComponentsSidebar from './ComponentsSidebar';
import MealGrid from './MealGrid';
import SaveMealModal from '@/app/components/modals/SaveMealModal';
import { addComponent } from '../actions/componentActions';
import TutorialModal from './TutorialModal';
import MealRecommendations from '@/app/components/MealRecommendations';
import { ChevronLeft, MessageSquare } from 'lucide-react';


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
  const [quickComponentName, setQuickComponentName] = useState('');
  const [compSidebarCollapsed, setCompSidebarCollapsed] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);


  // State for saving data
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [saveNeeded, setSaveNeeded] = useState(false);
  
  // Add recommended meal to the grid
  const handleAddRecommendedMeal = (meal) => {
    // Find an empty meal slot, preferably for the current day
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Try to find an empty lunch or dinner slot for today
    let targetMeal = mealsData.find(meal => 
      meal.day_of_week === today && 
      (meal.meal_type === 'Lunch' || meal.meal_type === 'Dinner') && 
      meal.components.length === 0
    );
    
    // If no empty slot found for today, use any empty slot
    if (!targetMeal) {
      targetMeal = mealsData.find(meal => meal.components.length === 0);
    }
    
    if (!targetMeal) {
      alert("No empty meal slots available. Please clear a meal first.");
      return;
    }
    
    // Update the meal with recommendation data
    setMealsData((prev) => {
      return prev.map((m) => 
        m._id === targetMeal._id ? {
          ...m,
          name: meal.mealName,
          components: [...meal.components],
          toppings: [...(meal.additionalIngredients || [])],
          notes: meal.preparationInstructions || ''
        } : m
      );
    });
    
    // Update component servings
    meal.components.forEach((compName) => {
      const compIndex = componentsData.findIndex(comp => comp.name === compName);
      
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
    
    markSaveNeeded();
  };

  // Save data function - memoized to avoid recreation on each render
  const saveData = useCallback(async () => {
    if (isSaving) return; // Prevent multiple simultaneous saves
    
    setIsSaving(true);
    try {
      console.log("Saving data to database...");
      
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
        console.log("Data saved successfully");
        setLastSaved(new Date());
        setSaveNeeded(false);
      } else {
        const errorData = await response.json();
        console.error("Failed to save data:", errorData);
        // Retry save after failure
        setSaveNeeded(true);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      // Retry save after error
      setSaveNeeded(true);
    } finally {
      setIsSaving(false);
    }
  }, [componentsData, mealsData, userId, isSaving]);

  // Effect to trigger save when changes are made
  useEffect(() => {
    if (saveNeeded && !isSaving) {
      saveData();
    }
  }, [saveNeeded, isSaving, saveData]);
  
  // Effect to retry saving periodically if needed
  useEffect(() => {
    let saveTimer;
    if (saveNeeded && !isSaving) {
      saveTimer = setTimeout(() => {
        saveData();
      }, 3000); // Retry after 3 seconds
    }
    
    return () => {
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [saveNeeded, isSaving, saveData]);
  
  // Utility function to mark that save is needed
  const markSaveNeeded = () => {
    setSaveNeeded(true);
  };

  // Quick add function
  const handleQuickAddComponent = async () => {
    if (!quickComponentName.trim()) return;
    
    const quickComponent = {
      name: quickComponentName.trim(),
      servings: 3,
      prep_time: 15,
      ingredients: [''],
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      notes: '',
      dietary_restrictions: '',
      favorite: false,
      userId
    };
    
    try {
      const result = await addComponent(quickComponent);
      if (result.success) {
        setComponentsData(prev => [...prev, result.component]);
        setQuickComponentName('');
        markSaveNeeded();
      }
    } catch (error) {
      console.error("Error adding quick component:", error);
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setCompSidebarCollapsed(!compSidebarCollapsed);
  };

  // Check if user has seen the tutorial
  useEffect(() => {
    const tutorialShown = localStorage.getItem(`tutorial-shown-${userId}`);
    if (!tutorialShown && userId) {
      setShowTutorial(true);
    }
  }, [userId]);

  // Function to handle adding a new component
  const handleAddComponent = async (componentData) => {
    try {
      // Call the server action to add component to database
      const result = await addComponent(componentData);
      
      if (result.success) {
        // Update local state with the new component
        setComponentsData(prev => [...prev, result.component]);
        markSaveNeeded();
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

  const handleComponentSave = async (componentData) => {
    try {
      // First save the component itself
      const response = await fetch(`/api/components/${componentData._id || 'new'}`, {
        method: componentData._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...componentData,
          userId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save component');
      }
      
      const savedData = await response.json();
      const componentId = savedData.component._id;
      
      // Handle favorite status
      if (componentData.favorite) {
        // Add to favorites if it's marked as a favorite
        await fetch('/api/favorites/component', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            componentId
          })
        });
      }
      
      // Update local state
      setComponentsData(prev => {
        const exists = prev.some(c => c._id === componentId);
        if (exists) {
          return prev.map(c => c._id === componentId ? savedData.component : c);
        } else {
          return [...prev, savedData.component];
        }
      });
      
      markSaveNeeded();
      
      return { success: true, component: savedData.component };
    } catch (error) {
      console.error('Error saving component:', error);
      return { success: false, error: error.message };
    }
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
    
    markSaveNeeded();
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
    
    // Mark for saving if a component was added
    if (componentAdded) {
      markSaveNeeded();
    }
  };

  const handleSaveMeal = async (mealData, isFavorite) => {
    try {
      console.log('Saving meal with favorite status:', isFavorite);
      
      // 1. First save/update the meal
      const mealResponse = await fetch(`/api/meals/${mealData._id || 'new'}`, {
        method: mealData._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mealData,
          userId, // Make sure userId is included
          favorite: isFavorite // Set the favorite status on the meal itself
        })
      });
      
      if (!mealResponse.ok) {
        throw new Error('Failed to save meal');
      }
      
      const savedMeal = await mealResponse.json();
      const mealId = savedMeal.meal._id;
  
      // 2. Handle favorite status in the favorites collection
      if (isFavorite) {
        // Add to favorites
        console.log('Adding to favorites:', userId, mealId);
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
          const errorData = await favoriteResponse.json();
          console.warn('Failed to save as favorite:', errorData);
        } else {
          // If successful, also add to local favoritesData
          const existingFavorite = favoritesData.find(f => f._id === mealId);
          if (!existingFavorite) {
            setFavoritesData(prev => [...prev, savedMeal.meal]);
          }
        }
      } else {
        // Remove from favorites if it was previously favorited
        console.log('Removing from favorites if needed');
        const favoriteResponse = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            meal_id: mealId
          })
        });
        
        if (!favoriteResponse.ok) {
          console.warn('Error removing from favorites');
        } else {
          // Remove from local favoritesData
          setFavoritesData(prev => prev.filter(f => f._id !== mealId));
        }
      }
      
      // 3. Update local state
      setMealsData(prev => {
        const exists = prev.some(m => m._id === mealId);
        if (exists) {
          return prev.map(m => m._id === mealId ? { 
            ...m, 
            ...mealData, 
            _id: mealId,
            favorite: isFavorite // Make sure favorite status is set
          } : m);
        } else {
          return [...prev, { 
            ...mealData, 
            _id: mealId,
            favorite: isFavorite 
          }];
        }
      });
      
      markSaveNeeded();
      
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
    
    markSaveNeeded();
  };

  const handleClearMeal = async (mealId) => {
    // Get the meal data before clearing it
    const mealToBeCleared = mealsData.find((meal) => meal._id === mealId);
    
    if (!mealToBeCleared) return;
    
    const isFavorite = mealToBeCleared.favorite || false;
    const { day, date } = mealToBeCleared; // Preserve day/date for the grid
    
    // Restore one serving to each component used in the meal
    const restoredComponents = mealToBeCleared.components || [];
    restoredComponents.forEach((compName) => {
      const compIndex = componentsData.findIndex((comp) => comp.name === compName);
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
    });
    
    // If the meal is favorited, save a copy without the day/date attributes
    if (isFavorite && mealToBeCleared.name) {
      try {
        console.log('Preserving favorited meal:', mealToBeCleared.name);
        
        // Create a clean copy of the meal without grid-specific attributes
        const favoriteMealCopy = {
          ...mealToBeCleared,
          day: undefined, // Remove grid-specific attributes
          date: undefined,
          dayOfWeek: undefined,
          _id: undefined, // Let the server generate a new ID for this copy
          favorite: true
        };
        
        // Save the favorite meal copy to the database
        const mealResponse = await fetch('/api/meals/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...favoriteMealCopy,
            userId
          })
        });
        
        if (mealResponse.ok) {
          const savedMeal = await mealResponse.json();
          const favoriteMealId = savedMeal.meal._id;
          
          // Add to favorites collection
          await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              meal_id: favoriteMealId,
              type: 'meal'
            })
          });
          
          // Update the local favorites data
          setFavoritesData(prev => {
            // Avoid duplicates by checking if a meal with this name already exists
            const nameExists = prev.some(m => m.name === mealToBeCleared.name);
            if (!nameExists) {
              return [...prev, { ...savedMeal.meal, favorite: true }];
            }
            return prev;
          });
          
          console.log('Meal saved to favorites successfully');
        }
      } catch (error) {
        console.error('Error preserving favorited meal:', error);
      }
    }
    
    // Clear the meal slot but preserve the day/date information
    setMealsData((prev) => 
      prev.map((meal) => 
        meal._id === mealId
          ? {
              ...meal,            // Keep ID 
              day,                // Preserve day
              date,               // Preserve date
              name: '',           // Reset name
              components: [],     // Clear components array
              toppings: [],       // Clear toppings array  
              notes: '',          // Reset notes to empty string
              favorite: false     // Reset favorite to false
            }
          : meal
      )
    );
    
    markSaveNeeded();
  };

  // Remove a single component from a meal slot
const handleRemoveComponent = (mealId, index, itemName, type = 'component') => {
  // Remove from mealsData based on type
  setMealsData((prev) => {
    const updatedMeals = prev.map((meal) => {
      if (meal._id === mealId) {
        if (type === 'topping') {
          // Remove from toppings array
          return {
            ...meal,
            toppings: meal.toppings.filter(
              (topping, toppingIndex) => toppingIndex !== index
            ),
          };
        } else {
          // Remove from components array
          return {
            ...meal,
            components: meal.components.filter(
              (comp, compIndex) => compIndex !== index
            ),
          };
        }
      }
      return meal;
    });
    return updatedMeals;
  });

  // Only restore servings if removing an actual component, not a topping
  if (type !== 'topping') {
    // Restore a serving to componentsData
    const compIndex = componentsData.findIndex(
      (comp) => comp.name === itemName
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
  }
  
  markSaveNeeded();
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
    
    markSaveNeeded();
  };

  return (
    <>
    {showTutorial && (
      <TutorialModal 
        userId={userId}
        onClose={() => setShowTutorial(false)}
      />
    )}
    
    {/* Save Status Indicator */}
    <div className="flex justify-between items-center mb-2 text-sm">
      <div>
        {!showRecommendations && (
          <button 
            onClick={() => setShowRecommendations(true)}
            className="flex items-center text-orange-600 hover:text-orange-700 bg-white px-3 py-1 rounded-md shadow-sm"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            <span>Get Meal Ideas</span>
          </button>
        )}
      </div>
      <span>
        {saveNeeded ? 
          <span className="text-orange-600">Saving changes...</span> : 
          <span className="text-green-600">
            All changes saved {lastSaved.toLocaleTimeString()}
          </span>
        }
      </span>
    </div>
    
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-[calc(100vh-150px)] bg-gray-100 rounded-lg shadow-lg overflow-hidden">
        {!compSidebarCollapsed && (
          <ComponentsSidebar
            components={componentsData}
            favorites={favoritesData}
            userId={userId}
            onAddComponent={handleAddComponent}
            className="w-1/6 min-w-[200px]"
          />
        )}
        <MealGrid
          meals={mealsData}
          components={componentsData}
          onRemoveComponent={handleRemoveComponent}
          onAddMiniComponent={handleAddMiniComponent}
          onMealClick={handleMealClick}
          onClearMeal={handleClearMeal}
          onMoveComponent={handleMoveComponent}
          dayInfo={daysInfo}
          className={`${compSidebarCollapsed ? "w-full" : "w-5/6"} ${showRecommendations ? "w-3/4" : ""}`}
        />
        
        {/* AI Recommendations Side Panel */}
        <MealRecommendations 
          userId={userId}
          isVisible={showRecommendations}
          onToggleVisibility={() => setShowRecommendations(false)}
          onAddMealToPlanner={handleAddRecommendedMeal}
        />
        
        <SaveMealModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveMeal}
          mealId={selectedMeal}
          mealComponents={selectedMealComponents}
          mealToppings={selectedMealToppings}
          userId={userId}
          existingMeal={mealsData.find(m => m._id === selectedMeal)}
        />
      </div>
      <DragOverlay>
        {activeItem ? <DraggableItem id={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  </>
  );
}

// Enhanced DraggableItem with improved visuals
function DraggableItem({ id }) {
  // Check if this is a meal component
  if (id.toString().startsWith('meal-component:')) {
    // Extract just the component name (third part of the ID)
    const [, , component] = id.split(':');
    return (
      <div className="p-2 max-w-[200px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing transform scale-110 transition-transform duration-200 z-50">
        {component}
      </div>
    );
  }
  
  // If it's a component from sidebar or favorite meal
  if (id.startsWith('meal-')) {
    // It's a favorite meal - extract name after 'meal-' prefix
    const mealName = id.replace('meal-', '');
    return (
      <div className="p-2 max-w-[200px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing transform scale-110 transition-transform duration-200 z-50">
        {mealName}
      </div>
    );
  }
  
  // Default case - regular component from sidebar
  return (
    <div className="p-2 max-w-[200px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing transform scale-110 transition-transform duration-200 z-50">
      {id}
    </div>
  );
}