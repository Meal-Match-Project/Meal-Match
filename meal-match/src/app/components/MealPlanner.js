'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import ComponentsSidebar from './ComponentsSidebar';
import MealGrid from './MealGrid';
import SaveMealModal from '@/app/components/modals/SaveMealModal';

export default function MealPlanner() {
  const { userId: urlUserId } = useParams();
  const [userId, setUserId] = useState(null);

  // Load userId from URL or localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (urlUserId) {
      setUserId(urlUserId);
      localStorage.setItem("userId", urlUserId);
    } else if (storedUserId) {
      setUserId(storedUserId);
    }
  }, [urlUserId]);

  // Default hardcoded components
  const defaultComponents = [
    { name: 'Garlic-herb chicken', servings: 3 },
    { name: 'Jasmine rice', servings: 4 },
    { name: 'Steamed broccoli', servings: 2 },
    { name: 'Spaghetti', servings: 3 }
  ];

  const [componentNames, setComponentNames] = useState([]);
  const [componentCounts, setComponentCounts] = useState([]);
  const [mealPlans, setMealPlans] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [savedMeals, setSavedMeals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedMealComponents, setSelectedMealComponents] = useState([]);
  const [selectedMealToppings, setSelectedMealToppings] = useState([]);

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

  // Load stored data from `localStorage`
  useEffect(() => {
    if (userId) {
      // Load user-created components
      const storedComponents = localStorage.getItem(`componentsData-${userId}`);
      if (storedComponents) {
        const parsedComponents = JSON.parse(storedComponents).thisWeek || [];

        setComponentNames(parsedComponents.map((comp) => comp.name));
        setComponentCounts(parsedComponents.map((comp) => comp.servings || 1));
      } else {
        setComponentNames(defaultComponents.map((comp) => comp.name));
        setComponentCounts(defaultComponents.map((comp) => comp.servings));
      }

      // Load meal plans
      const storedMeals = localStorage.getItem(`mealPlans-${userId}`);
      if (storedMeals) {
        setMealPlans(JSON.parse(storedMeals));
      }

      // Load saved meals
      const storedSavedMeals = localStorage.getItem(`savedMeals-${userId}`);
      if (storedSavedMeals) {
        try {
          const parsed = JSON.parse(storedSavedMeals);
          if (Array.isArray(parsed)) {
            setSavedMeals(parsed);
          } else {
            setSavedMeals([]);
          }
        } catch {
          setSavedMeals([]);
        }
      }
    }
  }, [userId]);

  // Save mealPlans to localStorage whenever it changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`mealPlans-${userId}`, JSON.stringify(mealPlans));
    }
  }, [mealPlans, userId]);

  // Save savedMeals to localStorage whenever it changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`savedMeals-${userId}`, JSON.stringify(savedMeals));
    }
  }, [savedMeals, userId]);

  const handleMealClick = (mealId) => {
    setSelectedMeal(mealId);
    const items = mealPlans[mealId] || [];

    // Separate items into components vs. mini
    setSelectedMealComponents(items.filter(item => item.type === 'component'));
    setSelectedMealToppings(items.filter(item => item.type === 'mini'));
  
    setModalOpen(true);
  };

  const handleClearMeal = (mealId) => {
    setMealPlans((prev) => {
      const updatedPlans = { ...prev };
      delete updatedPlans[mealId];
      return updatedPlans;
    });
  };

  const handleSaveMeal = (title, components, toppings, notes) => {
    setSavedMeals((prev) => ([
      ...prev,
      { name: title, components, toppings, notes },
    ]));
  };

  const handleDragStart = (event) => {
    setActiveItem(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!over) return;

    const componentName = active.id;
    
    if (componentNames.includes(componentName)) {
      const index = componentNames.indexOf(componentName);

      if (componentCounts[index] > 0) {
        setMealPlans((prev) => {
          const updatedMealPlans = {
            ...prev,
            [over.id]: [...(prev[over.id] || []), { name: componentName, type: 'component' }],
          };
          localStorage.setItem(`mealPlans-${userId}`, JSON.stringify(updatedMealPlans));
          return updatedMealPlans;
        });
        setComponentCounts((prev) => {
          const updatedCounts = [...prev];
          updatedCounts[index] -= 1;
          return updatedCounts;
        });
      }
    } else if (componentName.startsWith('meal-')) {
      // Handle dragging a favorite meal
      const mealName = componentName.replace('meal-', '');
      const mealObj = favoriteMeals.find((m) => m.name === mealName);
      if (mealObj) {
        mealObj.components.forEach((comp) => {
          if (componentNames.includes(comp)) {
            setMealPlans((prev) => ({
              ...prev,
              [over.id]: [...(prev[over.id] || []), { name: comp, type: 'component' }],
            }));
          }
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
      [mealId]: [{ name: miniComponent, type: 'mini' }, ...(prev[mealId] || [])],
    }));
  };
  console.log(componentNames)
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
          mealToppings={selectedMealToppings}
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
