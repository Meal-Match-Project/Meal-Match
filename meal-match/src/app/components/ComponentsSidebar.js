'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, CirclePlus, Search, RefreshCw } from 'lucide-react';
import ComponentModal from './modals/ComponentModal';

export default function ComponentsSidebar({ components, favorites, userId, onAddComponent, className = "" }) {
  const [openSections, setOpenSections] = useState({ components: true, meals: false });
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get components that are available this week (servings > 0)
  const availableComponents = components.filter(comp => comp.servings > 0);
  
  // Extract component names from available components
  const availableComponentNames = availableComponents.map(comp => comp.name);
  
  // Filter meals that match all available components
  const fullyAvailableMeals = 
    // Check if favorites array exists and is not empty
    favorites && favorites.length > 0 
      ? favorites.filter(meal =>
          // Make sure meal has components array and every component is available
          meal.components && 
          meal.components.length > 0 &&
          meal.components.every(compName => availableComponentNames.includes(compName))
        )
      : [];

  // Filter components based on search
  const filteredComponents = components
    .filter(component => 
      component.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by availability (servings > 0) first, then alphabetically
      if ((a.servings > 0) !== (b.servings > 0)) {
        return a.servings > 0 ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

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
    <div className={`flex flex-col bg-orange-600 p-2 h-full ${className}`}>
      {/* Search Bar */}
      <div className="bg-orange-700 rounded-lg p-2 mb-2">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-8 pr-2 py-1 bg-white/90 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      
      {/* Content Area - This is the main scrollable container */}
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-1">
        {/* Components Accordion */}
        <div className="mb-4">
          <div
            className="flex justify-between items-center text-white font-bold text-lg cursor-pointer mb-2"
            onClick={() => toggleSection('components')}
          >
            <span>Components</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openSections.components ? "rotate-180" : ""}`} />
          </div>
          
          <div className={`transition-all duration-300 ${openSections.components ? 'block' : 'hidden'}`}>
            <div className="space-y-1">
              {filteredComponents.length > 0 ? (
                filteredComponents.map((component) => (
                  component.servings > 0 && (
                    <DraggableComponent 
                      key={component._id} 
                      id={component.name}
                      count={component.servings} 
                      component={component}
                    />
                  )
                ))
              ) : (
                <div className="text-white text-sm italic p-2">
                  {searchTerm ? "No matching components" : "No components available"}
                </div>
              )}
            </div>
          </div>
        </div>
      
        {/* Favorite Meals Accordion */}
        <div className="mb-4">
          <div
            className="flex justify-between items-center text-white font-bold text-lg cursor-pointer mb-2"
            onClick={() => toggleSection('meals')}
          >
            <span>Favorite Meals</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openSections.meals ? "rotate-180" : ""}`} />
          </div>
          
          <div className={`transition-all duration-300 ${openSections.meals ? 'block' : 'hidden'}`}>
            <div className="space-y-1">
              {fullyAvailableMeals.length > 0 ? (
                fullyAvailableMeals.map((meal) => (
                  <DraggableMeal key={meal._id} meal={meal} />
                ))
              ) : (
                <div className="text-white text-sm italic p-2">
                  {favorites && favorites.length > 0 
                    ? "No favorites available with current components" 
                    : "No favorite meals saved yet"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Component Button - Fixed at bottom */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="flex space-x-2 justify-center w-full py-2 bg-white text-orange-600 font-bold mt-2 rounded-md hover:bg-orange-100 transition-colors"
      >
        <CirclePlus className="my-auto w-5 h-5" />
        <span className="my-auto">Add Component</span>
      </button>
  
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

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}

function DraggableComponent({ id, count, component }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });
  const depleted = count === 0;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2 rounded shadow-sm cursor-grab ${depleted ? 'bg-orange-300 cursor-not-allowed opacity-60' : 'bg-white hover:bg-orange-50'} flex justify-between items-center`}
      style={{ touchAction: 'none' }}
    >
      <span className="truncate">{id}</span>
      <span className="text-sm font-bold ml-1 px-1.5 py-0.5 bg-orange-100 rounded-full text-orange-800">{count}</span>
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
      className="p-2 rounded shadow-sm cursor-grab bg-white hover:bg-orange-50 truncate"
      style={{ touchAction: 'none' }}
    >
      {meal.name}
    </div>
  );
}