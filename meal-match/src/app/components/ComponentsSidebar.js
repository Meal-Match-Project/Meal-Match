'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, CirclePlus } from 'lucide-react';
import ComponentModal from './modals/ComponentModal';

export default function ComponentsSidebar({ components, favorites, userId, onAddComponent }) {
  const [openSections, setOpenSections] = useState({ components: true, meals: false });
  const [showAddModal, setShowAddModal] = useState(false);

  // Extract component names from the full component objects
  const componentNames = components.map(comp => comp.name);
  
  // Filter meals that match all current components, but only if favorites exists and is not empty
  const fullyAvailableMeals = favorites && favorites.length > 0 
    ? favorites.filter(meal =>
        meal.components && meal.components.every((compName) => componentNames.includes(compName))
      )
    : [];

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Create default empty component for adding new ones
  const emptyComponent = {
    name: '',
    servings: 1,
    prep_time: 0,
    ingredients: [''],
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: '',
    dietary_restrictions: '',
    favorite: false
  };

  const handleSaveComponent = async (component) => {
    // Add userId to the component object
    const componentWithUserId = { ...component, userId };
    
    // Call the onAddComponent function from parent
    if (onAddComponent) {
      await onAddComponent(componentWithUserId);
    }
    
    setShowAddModal(false);
  };

  return (
    <div className="overflow-scroll w-1/4 bg-orange-600 p-4">
      {/* Components Accordion */}
      <div
        className="flex justify-between items-center text-white font-bold text-lg cursor-pointer mb-2"
        onClick={() => toggleSection('components')}
      >
        <span>Components</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${openSections.components ? "rotate-180" : ""}`} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${openSections.components ? 'max-h-96' : 'max-h-0'}`}>
        <div className="space-y-2">
          {components.map((component) => (
            <DraggableComponent 
              key={component._id} 
              id={component.name}
              count={component.servings} 
              component={component}
            />
          ))}
        </div>
      </div>
      <button 
        onClick={() => setShowAddModal(true)}
        className="flex space-x-2 justify-center w-full py-2 bg-white text-orange-600 font-bold mt-4 rounded-md"
      >
        <CirclePlus className="my-auto w-6 h-6" />
        <p className="my-auto">Add Component</p>
      </button>
  
      {/* Favorite Meals Accordion */}
      <div
        className="flex justify-between items-center text-white font-bold text-lg cursor-pointer mt-4 mb-2"
        onClick={() => toggleSection('meals')}
      >
        <span>Favorite Meals</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${openSections.meals ? "rotate-180" : ""}`} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${openSections.meals ? 'max-h-96' : 'max-h-0'}`}>
        <div className="space-y-2">
          {fullyAvailableMeals.length > 0 ? (
            fullyAvailableMeals.map((meal) => (
              <DraggableMeal key={meal._id} meal={meal} />
            ))
          ) : (
            <div className="text-white text-sm italic">
              {favorites && favorites.length > 0 
                ? "No favorites available with current components" 
                : "No favorite meals saved yet"}
            </div>
          )}
        </div>
      </div>
  
      {/* Component Modal */}
      {showAddModal && (
        <ComponentModal
          component={emptyComponent}
          onSave={handleSaveComponent}
          onDelete={() => {}}
          onClose={() => setShowAddModal(false)}
          isAdding={true}
        />
      )}
    </div>
  );
}

// ...existing DraggableComponent and DraggableMeal components...
function DraggableComponent({ id, count, component }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });
  const depleted = count === 0;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2 rounded shadow-md cursor-grab ${depleted ? 'bg-orange-300 cursor-not-allowed' : 'bg-white'}`}
    >
      <div className="flex justify-between items-center">
        <span>{id}</span>
        <span className="text-sm font-bold">{count}</span>
      </div>
    </div>
  );
}

function DraggableMeal({ meal }) {
  // Use meal-{name} as the ID format to match handleFavoriteMealDrop in MealPlanner
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `meal-${meal.name}` });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="p-2 rounded shadow-md cursor-grab bg-white"
    >
      {meal.name}
    </div>
  );
}