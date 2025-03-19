'use client';

import { useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import ComponentsSidebar from './ComponentsSidebar';
import MealGrid from './MealGrid';
import SaveMealModal from '@/app/components/modals/SaveMealModal';

export default function MealPlanner() {
  const componentNames = ['Garlic-herb chicken', 'Jasmine rice', 'Steamed broccoli', 'Spaghetti'];
  const [componentCounts, setComponentCounts] = useState([3, 4, 2, 3]);

  const [mealPlans, setMealPlans] = useState({});
  const [activeItem, setActiveItem] = useState(null);

  const [savedMeals, setSavedMeals] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedMealComponents, setSelectedMealComponents] = useState([]);

  const [favoriteMeals] = useState([
    {
      name: 'Chicken & Broccoli',
      components: ['Garlic-herb chicken', 'Steamed broccoli'],
      toppings: ['Hot sauce', 'Parmesan'],
    },
    {
      name: 'Spaghetti Delight',
      components: ['Spaghetti'],
      toppings: ['Marinara sauce'],
    },
  ]);

  const handleMealClick = (mealId) => {
    setSelectedMeal(mealId);
    setSelectedMealComponents(mealPlans[mealId] || []); // Get components added to the meal
    setModalOpen(true);
  };

  const handleClearMeal = (mealId) => {
    setMealPlans((prev) => {
      const updatedPlans = { ...prev };
      delete updatedPlans[mealId];
      return updatedPlans;
    });
  };

  const handleSaveMeal = (mealId, title, notes) => {
    setSavedMeals((prev) => ({
      ...prev,
      [mealId]: { title, notes },
    }));
  };

  const handleDragStart = (event) => {
    setActiveItem(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!over) return;

    // Check if dragging a favorite meal or a single component
    if (active.id.startsWith('meal-')) {
      // Extract meal name from ID (e.g. "meal-Chicken & Broccoli")
      const mealName = active.id.replace('meal-', '');
      const mealObj = favoriteMeals.find((m) => m.name === mealName);
      if (mealObj) {
        // Add components
        mealObj.components.forEach((comp) => {
          const idx = componentNames.indexOf(comp);
          if (idx !== -1 && componentCounts[idx] > 0) {
            setMealPlans((prev) => ({
              ...prev,
              [over.id]: [...(prev[over.id] || []), { name: comp, type: 'component' }],
            }));
            setComponentCounts((prev) => {
              const updated = [...prev];
              updated[idx] -= 1;
              return updated;
            });
          } else {
            // If no matching index (or 0 count), you can skip or handle differently
          }
        });

        // Add toppings (mini components)
        mealObj.toppings.forEach((topping) => {
          setMealPlans((prev) => ({
            ...prev,
            [over.id]: [...(prev[over.id] || []), { name: topping, type: 'mini' }],
          }));
        });
      }
    } else {
      // Dropped a single component
      const index = componentNames.indexOf(active.id);
      if (index !== -1 && componentCounts[index] > 0) {
        setMealPlans((prev) => ({
          ...prev,
          [over.id]: [...(prev[over.id] || []), { name: active.id, type: 'component' }],
        }));
        setComponentCounts((prev) => {
          const updatedCounts = [...prev];
          updatedCounts[index] -= 1;
          return updatedCounts;
        });
      }
    }
  };

  const handleRemoveComponent = (mealId, index, componentName) => {
    setMealPlans((prev) => {
      const updatedMeal = [...prev[mealId]];
      updatedMeal.splice(index, 1);
      return { ...prev, [mealId]: updatedMeal };
    });

    const componentIndex = componentNames.indexOf(componentName);
    if (componentIndex !== -1) {
      setComponentCounts((prev) => {
        const updatedCounts = [...prev];
        updatedCounts[componentIndex] += 1;
        return updatedCounts;
      });
    }
  };

  const handleAddMiniComponent = (mealId, miniComponent) => {
    setMealPlans((prev) => ({
      ...prev,
      [mealId]: [{ name: miniComponent, type: 'mini' }, ...(prev[mealId] || []) ],
    }));
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-[80vh] bg-gray-100 p-4 rounded-lg shadow-lg">
        <ComponentsSidebar
            componentNames={componentNames}
            componentCounts={componentCounts}
            favoriteMeals={favoriteMeals}
          />
        <MealGrid 
          mealPlans={mealPlans} 
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
        />
      </div>
      <DragOverlay>
        {activeItem ? <DraggableItem id={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function DraggableItem({ id }) {
  return (
    <div className="p-2 max-w-[150px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing transform scale-110 transition-transform duration-200">
      {id}
    </div>
  );
}
