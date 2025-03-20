'use client';

import { useState } from 'react';
import ComponentModal from '@/app/components/modals/ComponentModal';

export default function ComponentsPage() {
  const [components, setComponents] = useState({
    thisWeek: [
      { name: 'Garlic-herb chicken', servings: 3, prepTime: '45 Minutes', ingredients: ['1.5lb Chicken breasts', '2 cloves garlic', '1 tbsp oregano'] },
      { name: 'Jasmine rice', servings: 4, prepTime: '30 Minutes', ingredients: ['1 cup jasmine rice', '2 cups water', 'Salt'] },
      { name: 'Steamed broccoli', servings: 2, prepTime: '10 Minutes', ingredients: ['1 head broccoli', 'Salt', 'Pepper'] },
      { name: 'Spaghetti', servings: 3, prepTime: '20 Minutes', ingredients: ['1 lb spaghetti', 'Water', 'Salt'] }
    ],
    saved: [
      { name: 'Garlic-herb chicken', servings: 3, prepTime: '45 Minutes', ingredients: ['1.5lb Chicken breasts', '2 cloves garlic', '1 tbsp oregano'] },
      { name: 'Jasmine rice', servings: 4, prepTime: '30 Minutes', ingredients: ['1 cup jasmine rice', '2 cups water', 'Salt'] }
    ]
  });

  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

 const handleDeleteComponent = (component) => {
    setComponents((prev) => {
      return {
        ...prev,
        thisWeek: prev.thisWeek.filter(comp => comp.name !== component.name),
        saved: prev.saved.filter(comp => comp.name !== component.name)
      };
    });
    setIsModalOpen(false);
  };
  
 const handleEditClick = (component) => {
    setSelectedComponent(component);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedComponent({ name: '', servings: '', prepTime: '', ingredients: [] }); // Empty component for new entry
    setIsAdding(true);
    setIsModalOpen(true);
  };

    // Move a component from 'thisWeek' to 'saved'
    const handleSaveToLibrary = (component) => {
      setComponents((prev) => {
        // Only add if not already in saved
        if (!prev.saved.some(comp => comp.name === component.name)) {
          return {
            ...prev,
            saved: [...prev.saved, component]
          };
        }
        return prev;
      });
    };
  
    // Move a component from 'saved' to 'thisWeek'
    const handleUseInWeek = (component) => {
      setComponents((prev) => {
        // Only add if not already in thisWeek
        if (!prev.thisWeek.some(comp => comp.name === component.name)) {
          return {
            ...prev,
            thisWeek: [...prev.thisWeek, component]
          };
        }
        return prev;
      });
    };

  const handleSaveComponent = (updatedComponent) => {
    setComponents((prev) => {
      if (isAdding) {
        // Adding new component
        return {
          ...prev,
          thisWeek: [...prev.thisWeek, updatedComponent] // Add to "This Week"
        };
      } else {
        // Editing existing component
        return {
          ...prev,
          thisWeek: prev.thisWeek.map(comp => comp.name === updatedComponent.name ? updatedComponent : comp),
          saved: prev.saved.map(comp => comp.name === updatedComponent.name ? updatedComponent : comp)
        };
      }
    });
    setComponents((prev) => ({
      ...prev,
      thisWeek: prev.thisWeek.map(comp => comp.name === updatedComponent.name ? updatedComponent : comp),
      saved: prev.saved.map(comp => comp.name === updatedComponent.name ? updatedComponent : comp)
    }));
    setIsModalOpen(false);
  };


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Components</h1>
      {['thisWeek', 'saved'].map((category) => (
        <div key={category} className="w-3/4 mx-auto my-6">
          <h2 className="text-lg font-semibold bg-blue-100 p-2">{category === 'thisWeek' ? 'THIS WEEK' : 'SAVED'}</h2>
          <div className="bg-white shadow-md rounded-md">
            {components[category].map((component) => (
              <div key={component.name} className="flex justify-between p-2 border-b last:border-none">
                <span>{component.name}</span>
                {category === 'thisWeek' && (
                  <button onClick={() => handleSaveToLibrary(component)} className="ml-auto px-4 py-1 mr-2 bg-orange-600 text-white rounded-md font-semibold">
                    Save
                  </button>
                )}
                {category === 'saved' && (
                  <button onClick={() => handleUseInWeek(component)} className="ml-auto px-4 py-1 mr-2 bg-green-600 text-white rounded-md font-semibold">
                    Use
                  </button>
                )}
                <button onClick={() => handleEditClick(component)} className="text-gray-600 font-semibold">
                  &#x22EE;
                </button>
              </div>
            ))}
             {/* Add Component Button */}
             {category === 'thisWeek' && (
              <div className="flex justify-center p-2 border-t">
                <button onClick={handleAddClick} className="text-blue-600">
                  + Add Component
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      {isModalOpen && (
        <div className="relative">
          <ComponentModal 
            component={selectedComponent} 
            onSave={handleSaveComponent} 
            onDelete={handleDeleteComponent} 
            onClose={() => setIsModalOpen(false)} 
            isAdding={isAdding}
          />
        </div>
      )}
    </div>
  );
}