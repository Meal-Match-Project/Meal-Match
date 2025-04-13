'use client';

// Components
import { useState, useEffect } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Trash2, Save, MessageSquare, ChevronLeft } from 'lucide-react';
import { CSSTransition } from 'react-transition-group';
import ComponentsSidebar from './ComponentsSidebar';
import MealGrid from './MealGrid';
import TutorialModal from './modals/TutorialModal';
import SaveMealModal from './modals/SaveMealModal';
import AIAssistantModal from './modals/AIAssistantModal';
import SaveTemplateModal from './modals/SaveTemplateModal';
import NotificationToast from './ui/NotificationToast';
import ConfirmationModal from './ui/ConfirmationModal';
import SaveStatusIndicator from './ui/SaveStatusIndicator';
import ComponentsDetailDashboard from './ui/ComponentsDetailDashboard';
// Custom Hooks
import useNotification from '@/hooks/useNotification';
import useMealComponents from '@/hooks/useMealComponents';
import useSaveData from '@/hooks/useSaveData';
import useMealDragAndDrop from '@/hooks/useMealDragAndDrop';

// Utils & Actions
import { 
  addComponent, 
  createMeal, 
  updateMeal, 
  addFavorite, 
  removeFavorite, 
  createTemplate, 
  importTemplate,
  saveMealPlanData 
} from '@/services/apiService';

// Meal Utilities
import { findMealSlot } from '@/utils/mealUtils';

// Template Utilities 
import { 
  extractComponentsForTemplate, 
  groupMealsByDayForTemplate 
} from '@/utils/templateUtils';


// Prevent Hydration Error
function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : null;
}

export default function MealPlanner({ components = [], meals = [], favorites = [], userId, dayInfo = [] }) {
  // Initialize state from props
  const [favoritesData, setFavoritesData] = useState(favorites);
  const [daysInfo, setDaysInfo] = useState(dayInfo);

  // UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedMealComponents, setSelectedMealComponents] = useState([]);
  const [selectedMealToppings, setSelectedMealToppings] = useState([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [quickComponentName, setQuickComponentName] = useState('');
  const [compSidebarCollapsed, setCompSidebarCollapsed] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [showClearWeekConfirm, setShowClearWeekConfirm] = useState(false);
  const [isTemplateImporting, setIsTemplateImporting] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);



  // Custom hooks for state management
  const { notification, showNotification, hideNotification } = useNotification();
  
  const { 
    componentsData, 
    setComponentsData,
    mealsData, 
    setMealsData,
    handleAddComponent,
    handleRemoveComponent,
    directRemoveComponent,
    handleAddMiniComponent,
    handleMoveComponent
  } = useMealComponents({ 
    initialComponents: components, 
    initialMeals: meals, 
    onSaveNeeded: () => markSaveNeeded() 
  });

  const { 
    isSaving, 
    lastSaved, 
    saveNeeded, 
    markSaveNeeded 
  } = useSaveData({ 
    userId, 
    componentsData, 
    mealsData 
  });

  // Drag and drop hook
  const {
    activeItem,
    handleDragStart,
    handleDragEnd
  } = useMealDragAndDrop({
    componentsData,
    setComponentsData,
    mealsData,
    setMealsData,
    onSaveNeeded: markSaveNeeded
  });

  // Check if user has seen the tutorial
  useEffect(() => {
    const tutorialShown = localStorage.getItem(`tutorial-shown-${userId}`);
    if (!tutorialShown && userId) {
      setShowTutorial(true);
    }
  }, [userId]);

  // Clicking on a meal in the grid
  const handleMealClick = (mealId) => {
    setSelectedMeal(mealId);
    const meal = mealsData.find((meal) => meal._id === mealId) || {};
    setSelectedMealComponents(meal.components || []);
    setSelectedMealToppings(meal.toppings || []);
    setModalOpen(true);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setCompSidebarCollapsed(!compSidebarCollapsed);
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
      showNotification("Failed to add component", "error");
    }
  };

  const handleRemoveComponentFromMeal = (mealId, componentIndex, componentName, type = 'component') => {
    // Find the meal in the current state
    const mealToUpdate = mealsData.find(meal => meal._id === mealId);
    
    if (!mealToUpdate) return;
    
    if (type === 'topping') {
      // Handle topping removal
      setMealsData(prev => 
        prev.map(meal => 
          meal._id === mealId 
            ? {
                ...meal,
                toppings: meal.toppings.filter((_, i) => i !== componentIndex)
              }
            : meal
        )
      );
    } else {
      // Handle component removal
      setMealsData(prev => 
        prev.map(meal => 
          meal._id === mealId 
            ? {
                ...meal,
                components: meal.components.filter((_, i) => i !== componentIndex)
              }
            : meal
        )
      );
      
      // Restore one serving to the component that was removed
      const componentToRestore = componentName;
      const compIndex = componentsData.findIndex(comp => comp.name === componentToRestore);
      
      if (compIndex !== -1) {
        setComponentsData(prev => {
          const updated = [...prev];
          updated[compIndex] = {
            ...updated[compIndex],
            servings: updated[compIndex].servings + 1
          };
          return updated;
        });
      }
    }
    
    markSaveNeeded();
  };

  // Handle saving a meal
  const handleSaveMeal = async (mealData, isFavorite) => {
    try {
      // 1. First save/update the meal
      let savedMealData;
      
      if (mealData._id) {
        // Update existing meal
        savedMealData = await updateMeal(mealData._id, {
          ...mealData,
          favorite: isFavorite,
          userId
        });
      } else {
        // Create new meal
        savedMealData = await createMeal({
          ...mealData,
          favorite: isFavorite,
          userId
        });
      }
      
      if (!savedMealData.success) {
        throw new Error(savedMealData.error || "Failed to save meal");
      }
      
      const mealId = savedMealData.meal._id;
    
      // 2. Handle favorite status in the favorites collection
      try {
        if (isFavorite) {
          const favoriteData = {
            user_id: userId,
            meal: {
              name: mealData.name,
              meal_type: mealData.meal_type,
              components: mealData.components,
              toppings: mealData.toppings || [],
              notes: mealData.notes || '',
              day_of_week: mealData.day_of_week
            },
          };
          
          await addFavorite(favoriteData);
        } else {
          await removeFavorite(userId, mealId);
          // Remove from local favoritesData
          setFavoritesData(prev => prev.filter(f => f._id !== mealId));
        }
      } catch (error) {
        console.warn('Error updating favorite status:', error);
      }
      
      // 3. Update local state
      setMealsData(prev => {
        const exists = prev.some(m => m._id === mealId);
        if (exists) {
          return prev.map(m => m._id === mealId ? { 
            ...m, 
            ...mealData, 
            _id: mealId,
            favorite: isFavorite
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
      showNotification("Meal saved successfully", "success");
      
      return true;
    } catch (error) {
      console.error('Error saving meal:', error);
      showNotification("Failed to save meal", "error");
      throw error;
    }
  };

  // Handle clearing a meal
  const handleClearMeal = async (mealId) => {
    // Get the meal data before clearing it
    const mealToBeCleared = mealsData.find((meal) => meal._id === mealId);
    
    if (!mealToBeCleared) return;
    
    const isFavorite = mealToBeCleared.favorite || false;
    const { day, date, day_of_week, meal_type } = mealToBeCleared; // Preserve meal identifiers
    
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
    
    // If the meal is favorited, create a fresh copy for favorites
    if (isFavorite && mealToBeCleared.name) {
      try {
        // Create a clean copy of the meal without grid-specific attributes
        const favoriteMealCopy = {
          name: mealToBeCleared.name,
          components: [...mealToBeCleared.components],
          toppings: [...(mealToBeCleared.toppings || [])],
          notes: mealToBeCleared.notes || '',
          userId
        };
        
        // Save the favorite meal copy using the existing handleSaveMeal function
        await handleSaveMeal(favoriteMealCopy, true);
        showNotification("Meal cleared but saved to favorites", "success");
      } catch (error) {
        console.error('Error preserving favorited meal:', error);
        showNotification("Meal cleared but failed to save to favorites", "warning");
      }
    } else {
      showNotification("Meal cleared", "info");
    }
    
    // Clear the meal slot but preserve the meal identifiers
    setMealsData((prev) => 
      prev.map((meal) => 
        meal._id === mealId
          ? {
              ...meal,
              day,
              date,
              day_of_week,
              meal_type,
              name: '',
              components: [],
              toppings: [],
              notes: '',
              favorite: false
            }
          : meal
      )
    );
    
    markSaveNeeded();
  }

  // Handle clear all meals
  const handleClearAllMeals = () => {
    // Show the confirmation modal
    setShowClearWeekConfirm(true);
  };
  
  const performClearAllMeals = async () => {
    // Track components to restore
    const componentsToRestore = {};
    
    // Keep track of favorite meals to preserve
    const favoriteMealsToPreserve = [];
    
    // Collect all components used across all meals and build a count map
    // Also collect favorite meals that need to be preserved
    mealsData.forEach(meal => {
      // Restore component servings for all meals with components
      if (meal.components && meal.components.length > 0) {
        meal.components.forEach(component => {
          componentsToRestore[component] = (componentsToRestore[component] || 0) + 1;
        });
      }
      
      // If this is a favorite meal, preserve it - regardless of whether it has components
      // But only if it has at least a name to make it meaningful
      if (meal.favorite && meal.name) {
        favoriteMealsToPreserve.push({
          name: meal.name,
          components: [...(meal.components || [])],
          toppings: [...(meal.toppings || [])],
          notes: meal.notes || '',
          userId
        });
      }
    });
    
    console.log("Preserving favorite meals:", favoriteMealsToPreserve);
    
    // Preserve favorite meals by creating fresh copies
    for (const mealToSave of favoriteMealsToPreserve) {
      try {
        if (mealToSave.name) {
          // Only save meals that have at least a name
          const savedResult = await handleSaveMeal(mealToSave, true);
          console.log("Saved favorite meal:", savedResult);
        }
      } catch (error) {
        console.error('Error preserving favorited meal:', error);
      }
    }
    
    // Update all meals - clear them but keep identification info
    setMealsData(prev => 
      prev.map(meal => ({
        ...meal,
        name: '',
        components: [],
        toppings: [],
        notes: '',
        favorite: false // Reset favorite status too
      }))
    );
    
    // Restore component servings
    setComponentsData(prev => {
      const updated = [...prev];
      Object.entries(componentsToRestore).forEach(([componentName, count]) => {
        const componentIndex = updated.findIndex(comp => comp.name === componentName);
        if (componentIndex !== -1) {
          updated[componentIndex] = {
            ...updated[componentIndex],
            servings: updated[componentIndex].servings + count
          };
        }
      });
      return updated;
    });
    
    markSaveNeeded();
    
    if (favoriteMealsToPreserve.length > 0) {
      showNotification(`All meals cleared. Preserved ${favoriteMealsToPreserve.length} favorite meals.`, 'success');
    } else {
      showNotification('All meals have been cleared', 'success');
    }
  }

  // Add recommended meal to the grid
  const handleAddRecommendedMeal = (meal) => {
    // Use the specified day and meal type if provided, otherwise find an empty slot
    const targetDay = meal.dayOfWeek || new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const targetMealType = meal.mealType || 'Dinner';
    
    // Find an appropriate meal slot
    const targetMeal = findMealSlot(mealsData, targetDay, targetMealType);
    
    if (!targetMeal) {
      showNotification("No empty meal slots available. Please clear a meal first.", "error");
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
    showNotification(`Added ${meal.mealName} to your meal plan`, "success");
  };

  // Handle template creation
  const handleSaveAsTemplate = () => {
    // Check if there are any meals to save
    const hasContent = mealsData.some(meal => meal.components.length > 0 || meal.name);
    
    if (!hasContent) {
      showNotification("Please add some meals to your week before saving as a template.", "error");
      return;
    }
    
    setSaveTemplateModalOpen(true);
  };

  const handleCreateTemplate = async (templateData) => {
    try {
      // Extract components data
      const componentsToInclude = extractComponentsForTemplate(mealsData, componentsData);
      
      // Group meals by day
      const daysArray = groupMealsByDayForTemplate(mealsData);
      
      // Create the template data structure
      const fullTemplateData = {
        ...templateData,
        user_id: userId,
        components_to_prepare: componentsToInclude,
        days: daysArray
      };
      
      // Save the template using server action
      const result = await createTemplate(fullTemplateData);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to save template");
      }
      
      setSaveTemplateModalOpen(false);
      showNotification('Template saved successfully', 'success');
    } catch (error) {
      console.error('Error saving template:', error);
      showNotification('Failed to save template: ' + error.message, 'error');
    }
  };

  // Handle applying a template
  const handleApplyTemplate = async (template) => {
    if (!template || !template.components_to_prepare) {
      console.error("Invalid template format");
      return;
    }
  
    try {
      // Show loading state if needed
      setIsTemplateImporting(true);
      
      if (template._id) {
        // Case 1: Template with ID - use the server action to import from database
        const result = await importTemplate(template._id, userId);
        
        if (result.success) {
          // Update components based on server response
          showNotification(`Template applied successfully! Added ${result.componentsAdded} components.`, "success");
          markSaveNeeded();
        } else {
          throw new Error(result.error || "Failed to apply template");
        }
      } else {
        // Case 2: Direct template from AI - add components directly to state
        const newComponents = [];
        let componentsAdded = 0;
        
        // Process each component in the AI-generated template
        for (const component of template.components_to_prepare) {
          // Check if component already exists
          const existingComponent = componentsData.find(c => 
            c.name.toLowerCase() === component.name.toLowerCase()
          );
          
          if (existingComponent) {
            // Update existing component's servings
            setComponentsData(prev => 
              prev.map(c => c.name.toLowerCase() === component.name.toLowerCase() 
                ? { ...c, servings: c.servings + (component.servings || 3) }
                : c
              )
            );
            componentsAdded++;
          } else {
            // Prepare new component with required fields
            const newComponent = {
              name: component.name,
              category: component.category || 'uncategorized',
              servings: component.servings || 3,
              prep_time: component.prep_time || 15,
              storage_life: component.storage_life || 5,
              ingredients: component.ingredients || [],
              notes: component.notes || '',
              favorite: false,
              userId
            };
            
            // Add to array of new components to be added
            newComponents.push(newComponent);
          }
        }
        
        // If we have new components, add them all at once
        if (newComponents.length > 0) {
          try {
            // Add each component to the database
            for (const comp of newComponents) {
              const result = await addComponent(comp);
              if (result.success) {
                componentsAdded++;
                setComponentsData(prev => [...prev, result.component]);
              }
            }
          } catch (error) {
            console.error("Error adding components:", error);
            throw new Error("Failed to add some components to your collection");
          }
        }
        
        showNotification(`Template applied successfully! Added ${componentsAdded} components.`, "success");
        markSaveNeeded();
      }
    } catch (error) {
      console.error("Error applying template:", error);
      showNotification("Error applying template: " + error.message, "error");
    } finally {
      setIsTemplateImporting(false);
    }
  };

  // DraggableItem Component for drag overlay
  const DraggableItem = ({ id }) => {
    // Check if this is a meal component
    if (id.toString().startsWith('meal-component:')) {
      // Extract just the component name (third part of the ID)
      const [, , component] = id.split(':');
      return (
        <div className="p-2 max-w-[200px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing z-50">
          {component}
        </div>
      );
    }
    
    // If it's a component from sidebar or favorite meal
    if (id.startsWith('meal-')) {
      // It's a favorite meal - extract name after 'meal-' prefix
      const mealName = id.replace('meal-', '');
      return (
        <div className="p-2 max-w-[200px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing z-50">
          {mealName}
        </div>
      );
    }
    
    // Default case - regular component from sidebar
    return (
      <div className="p-2 max-w-[200px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing z-50">
        {id}
      </div>
    );
  };

  return (
    <>
      {showTutorial && (
        <TutorialModal 
          userId={userId}
          onClose={() => setShowTutorial(false)}
        />
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200"
            title="Get meal recommendations from AI"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            <span className="font-medium">AI Assistant</span>
          </button>
          
          <button 
            onClick={handleSaveAsTemplate}
            className="flex items-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200"
            title="Save your current meal plan as a reusable template"
          >
            <Save className="w-5 h-5 mr-2" />
            <span className="font-medium">Save Template</span>
          </button>
          
          <button 
            onClick={handleClearAllMeals}
            className="flex items-center bg-white border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            title="Clear all meals from your weekly plan"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            <span className="font-medium">Clear Week</span>
          </button>
          
          <button
            onClick={toggleSidebar}
            className="flex items-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md shadow-sm hover:shadow-md"
            title={compSidebarCollapsed ? "Show component sidebar" : "Hide component sidebar"}
          >
            <ChevronLeft className={`w-5 h-5 mr-2 ${compSidebarCollapsed ? 'rotate-180' : ''}`} />
            <span className="font-medium">{compSidebarCollapsed ? 'Show' : 'Hide'} Components</span>
          </button>
          
          {/* New Show Tutorial button */}
          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            title="Show the app tutorial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span className="font-medium">Show Tutorial</span>
          </button>
        </div>
        <div className="bg-white px-4 py-2 rounded-md shadow-sm">
          <SaveStatusIndicator isSaving={saveNeeded} lastSaved={lastSaved} />
        </div>
      </div>
      
      <ClientOnly>
        <DndContext 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
          accessibility={{
            // This prevents the aria-describedby errors by using a more consistent ID strategy
            announcements: {
              onDragStart: ({ active }) => `Picked up ${active.id}`,
              onDragOver: ({ active, over }) => over ? `Hovering over ${over.id}` : undefined,
              onDragEnd: ({ active, over }) => over ? `Dropped ${active.id} onto ${over.id}` : `Dropped ${active.id}`,
              onDragCancel: ({ active }) => `Cancelled dragging ${active.id}`
            },
            restoreFocus: true
          }}
        >
          <div className="flex h-[calc(100vh-150px)] bg-gray-100 rounded-lg shadow-lg overflow-hidden">
            {!compSidebarCollapsed && (
              <div className="w-1/4 min-w-[250px] h-full">
                <ComponentsSidebar
                  components={componentsData}
                  favorites={favoritesData}
                  userId={userId}
                  onAddComponent={handleAddComponent}
                  className="h-full"
                />
              </div>
            )}
            
            <div className={`${compSidebarCollapsed ? "w-full" : "w-3/4"} h-full`}>
            <MealGrid
              meals={mealsData}
              components={componentsData}
              onRemoveComponent={handleRemoveComponentFromMeal}
              onAddMiniComponent={handleAddMiniComponent}
              onMealClick={handleMealClick}
              onClearMeal={handleClearMeal}
              onMoveComponent={handleMoveComponent}
              dayInfo={daysInfo}
              isFullWidth={compSidebarCollapsed}
              setSelectedComponent={(componentName) => {
                const fullComponent = componentsData.find(c => c.name === componentName);
                if (fullComponent) setSelectedComponent(fullComponent);
              }}
              setIsComponentModalOpen={setIsComponentModalOpen}
              className="h-full"
            />
            </div>
          </div>
          <DragOverlay>
            {activeItem ? <DraggableItem id={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      </ClientOnly>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        userId={userId}
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onAddMealToPlanner={handleAddRecommendedMeal}
        onApplyTemplate={handleApplyTemplate}
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
      <SaveTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setSaveTemplateModalOpen(false)}
        onSave={handleCreateTemplate}
        isLoading={isSaving}
      />

      {/* Notifications */}
      <NotificationToast 
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />

      {/* Clear Week Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearWeekConfirm}
        title="Clear Weekly Meal Plan"
        message="Are you sure you want to clear all meals for the week? This will reset all meal slots and restore component servings."
        confirmText="Clear All Meals"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600 text-white"
        onConfirm={() => {
          performClearAllMeals();
          setShowClearWeekConfirm(false);
        }}
        onCancel={() => setShowClearWeekConfirm(false)}
      />
      <ComponentsDetailDashboard
        component={selectedComponent}
        isOpen={isComponentModalOpen}
        onClose={() => setIsComponentModalOpen(false)}
      />
    </>
  );
}