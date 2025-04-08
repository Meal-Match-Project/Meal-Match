'use client';

import { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, CirclePlus, Search, RefreshCw } from 'lucide-react';
import ComponentModal from './modals/ComponentModal';

// Sub-components
const Accordion = ({ title, isOpen, onToggle, children }) => (
  <div className="mb-4">
    <div
      className="flex justify-between items-center text-white font-bold text-lg cursor-pointer mb-2"
      onClick={onToggle}
    >
      <span>{title}</span>
      <ChevronDown className={`w-4 h-4 ${isOpen ? "rotate-180" : ""}`} />
    </div>
    
    <div className={isOpen ? 'block' : 'hidden'}>
      {children}
    </div>
  </div>
);

const SearchBar = ({ value, onChange, onClear }) => (
  <div className="bg-orange-700 rounded-lg p-2 mb-2">
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search components..."
        className="w-full pl-8 pr-2 py-1 bg-white/90 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
      />
      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
      {value && (
        <button 
          onClick={onClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label="Clear search"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  </div>
);

function DraggableComponent({ id, count, component }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });
  const depleted = count === 0;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2 rounded shadow-sm ${depleted ? 'bg-orange-300 cursor-not-allowed opacity-60' : 'bg-white hover:bg-orange-50 cursor-grab'} flex justify-between items-center`}
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

export default function ComponentsSidebar({ 
  components, 
  favorites, 
  userId, 
  onAddComponent, 
  className = "" 
}) {
  const [openSections, setOpenSections] = useState({ components: true, meals: false });
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get components that are available this week (servings > 0)
  const availableComponents = useMemo(() => 
    components.filter(comp => comp.servings > 0),
    [components]
  );
  
  // Extract component names from available components
  const availableComponentNames = useMemo(() => 
    availableComponents.map(comp => comp.name),
    [availableComponents]
  );
  
  // Filter meals that match all available components
  const fullyAvailableMeals = useMemo(() => 
    // Check if favorites array exists and is not empty
    favorites && favorites.length > 0 
      ? favorites.filter(meal =>
          // Make sure meal has components array and every component is available
          meal.components && 
          meal.components.length > 0 &&
          meal.components.every(compName => availableComponentNames.includes(compName))
        )
      : [],
    [favorites, availableComponentNames]
  );

  // Filter components based on search
  const filteredComponents = useMemo(() => 
    components
      .filter(component => 
        component.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by availability (servings > 0) first, then alphabetically
        if ((a.servings > 0) !== (b.servings > 0)) {
          return a.servings > 0 ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }),
    [components, searchTerm]
  );

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
      <SearchBar 
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
      />
      
      {/* Content Area - This is the main scrollable container */}
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-1">
        {/* Components Accordion */}
        <Accordion
          title="Components"
          isOpen={openSections.components}
          onToggle={() => toggleSection('components')}
        >
          <div className="space-y-1">
            {filteredComponents.length > 0 ? (
              filteredComponents.map((component) => (
                <DraggableComponent 
                  key={component._id} 
                  id={component.name}
                  count={component.servings} 
                  component={component}
                />
              ))
            ) : (
              <div className="text-white text-sm italic p-2">
                {searchTerm ? "No matching components" : "No components available"}
              </div>
            )}
          </div>
        </Accordion>
      
        {/* Favorite Meals Accordion */}
        <Accordion
          title="Favorite Meals"
          isOpen={openSections.meals}
          onToggle={() => toggleSection('meals')}
        >
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
        </Accordion>
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