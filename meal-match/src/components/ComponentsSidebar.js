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
  // Get the actual meal data (handle both data structures)
  const mealData = meal.meal || meal;
  
  // Make sure we have a name property
  const mealName = mealData.name || "Unnamed Meal";
  
  // Use useDraggable with additional data
  const { attributes, listeners, setNodeRef } = useDraggable({ 
    id: `meal-${mealName}`,
    data: {
      type: 'favorite-meal',
      mealName: mealName,
      components: mealData.components || [],
      toppings: mealData.toppings || [],
      notes: mealData.notes || ''
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="p-2 rounded shadow-sm cursor-grab bg-white hover:bg-orange-50 truncate"
      style={{ touchAction: 'none' }}
    >
      {mealName}
    </div>
  );
}

function DraggableSuggestion({ suggestion, availableComponents }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ 
    id: `suggestion-${suggestion.name}`,
    data: {
      type: 'suggestion-meal',
      mealName: suggestion.name,
      components: suggestion.components || [],
      toppings: suggestion.additionalIngredients || [], // Pass additional ingredients as toppings
      notes: suggestion.description || '',
      additionalInfo: suggestion.nutritionalInfo || {}
    }
  });

  // Check if any components are missing
  const missingComponents = suggestion.components.filter(comp => !availableComponents.includes(comp));
  const isMissing = missingComponents.length > 0;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2 rounded shadow-sm ${isMissing ? 'bg-gray-200 cursor-not-allowed opacity-60' : 'bg-white hover:bg-orange-50 cursor-grab'} truncate mb-2`}
      style={{ touchAction: 'none' }}
      title={isMissing 
        ? `Missing: ${missingComponents.join(', ')}` 
        : suggestion.description || `Components: ${suggestion.components.join(', ')}`
      }
    >
      <div className="flex justify-between items-center">
        <span className="truncate">{suggestion.name}</span>
        <div className="flex items-center gap-1">
          {suggestion.type === 'recommendation' ? (
            <span className="text-xs bg-green-100 text-green-800 px-1 rounded">meal</span>
          ) : (
            <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">template</span>
          )}
          {isMissing && (
            <span className="text-xs text-red-600">
              {missingComponents.length} missing
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ComponentsSidebar({ 
  components, 
  favorites, 
  userId, 
  suggestions = [],
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
  // Get available component names for filtering suggestions
  const availableComponentNames = useMemo(() => 
    components.filter(comp => comp.servings > 0).map(comp => comp.name),
    [components]
  );
  
  // Filter suggestions to only show those where all components are available
  const availableSuggestions = useMemo(() => 
    suggestions.filter(suggestion => 
      suggestion.components &&
      suggestion.components.every(component => availableComponentNames.includes(component))
    ),
    [suggestions, availableComponentNames]
  );
  
  const fullyAvailableMeals = useMemo(() => 
    // Check if favorites array exists and is not empty
    favorites && favorites.length > 0 
      ? favorites.filter(favorite => {
          // Get the meal object - either direct or nested
          const meal = favorite.meal || favorite;
          
          // Make sure meal has components array and every component is available
          return meal.components && 
            meal.components.length > 0 &&
            meal.components.every(compName => availableComponentNames.includes(compName));
        })
      : [],
    [favorites, availableComponentNames]
  );

  // Filter components based on search
  const filteredComponents = useMemo(() => 
    components
      .filter(component => 
        // Only include components that match search AND have servings > 0
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        component.servings > 0
      )
      .sort((a, b) => {
        // Just sort alphabetically since all components now have servings > 0
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
        
        { /* AI Suggestions */ }
        <Accordion
          title="AI Suggestions"
          isOpen={openSections.suggestions}
          onToggle={() => toggleSection('suggestions')}
        >
          <div className="space-y-1">
            {suggestions.length > 0 ? (
              <>
                {suggestions
                  .sort((a, b) => {
                    // Sort available items first, then by type
                    if ((a.components.every(c => availableComponentNames.includes(c))) !==
                        (b.components.every(c => availableComponentNames.includes(c)))) {
                      return a.components.every(c => availableComponentNames.includes(c)) ? -1 : 1;
                    }
                    return 0;
                  })
                  .map((suggestion, index) => (
                    <DraggableSuggestion 
                      key={`suggestion-${suggestion.type}-${index}`} 
                      suggestion={suggestion} 
                      availableComponents={availableComponentNames}
                    />
                  ))}
              </>
            ) : (
              <div className="text-white text-sm italic p-2">
                No meal suggestions available yet
              </div>
            )}
          </div>
        </Accordion>
      
        {/* Favorite Meals Accordion */}
        <Accordion
          title="Saved Meals"
          isOpen={openSections.meals}
          onToggle={() => toggleSection('meals')}
        >
          <div className="space-y-1">
            {fullyAvailableMeals.length > 0 ? (
              fullyAvailableMeals.map((meal, index) => (
                <DraggableMeal 
                  key={meal._id || `favorite-meal-${index}`} 
                  meal={meal} 
                />
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