'use client';

import { useState } from 'react';
import ComponentModal from './ComponentModal';

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

  const handleEditClick = (component) => {
    setSelectedComponent(component);
    setIsModalOpen(true);
  };

  const handleSaveComponent = (updatedComponent) => {
    setComponents((prev) => ({
      ...prev,
      thisWeek: prev.thisWeek.map(comp => comp.name === updatedComponent.name ? updatedComponent : comp),
      saved: prev.saved.map(comp => comp.name === updatedComponent.name ? updatedComponent : comp)
    }));
    setIsModalOpen(false);
  };

  const handleDeleteComponent = (componentName) => {
    setComponents((prev) => ({
      thisWeek: prev.thisWeek.filter(comp => comp.name !== componentName),
      saved: prev.saved.filter(comp => comp.name !== componentName)
    }));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Components</h1>
      {['thisWeek', 'saved'].map((category) => (
        <div key={category} className="mb-6">
          <h2 className="text-lg font-semibold bg-gray-300 p-2">{category === 'thisWeek' ? 'THIS WEEK' : 'SAVED'}</h2>
          <div className="bg-white shadow-md rounded-md">
            {components[category].map((component) => (
              <div key={component.name} className="flex justify-between p-2 border-b last:border-none">
                <span>{component.name}</span>
                <button onClick={() => handleEditClick(component)} className="text-gray-600">
                  &#x22EE;
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {isModalOpen && 
          <div className="relative">
            <ComponentModal component={selectedComponent} onSave={handleSaveComponent} onDelete={handleDeleteComponent} onClose={() => setIsModalOpen(false)} />
          </div>}
    </div>
  );
}