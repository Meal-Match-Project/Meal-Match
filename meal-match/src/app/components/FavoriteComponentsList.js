'use client';

import { useState } from 'react';
import ComponentModal from './modals/ComponentModal';

export default function FavoriteComponentsList({ userId, favoriteComponents }) {
  const [components, setComponents] = useState(favoriteComponents);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleComponentClick = (component) => {
    setSelectedComponent(component);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComponent(null);
  };
  
  const handleRemoveFavorite = async (componentId) => {
    try {
      // Remove the favorite from database
      const response = await fetch(`/api/favorites/component/${componentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        // Remove from local state
        setComponents(components.filter(comp => comp._id !== componentId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
    setIsModalOpen(false);
  };
  
  return (
    <div>
      {components.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">You don't have any favorite components yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {components.map(component => (
            <div 
              key={component._id}
              onClick={() => handleComponentClick(component)}
              className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg">{component.name}</h3>
                  <div className="flex text-sm text-gray-600 space-x-2">
                    <span>Servings: {component.servings}</span>
                    {component.prep_time && <span>• {component.prep_time} min prep</span>}
                    {component.calories > 0 && <span>• {component.calories} cal</span>}
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal for viewing component details */}
      {isModalOpen && selectedComponent && (
        <ComponentModal
          component={selectedComponent}
          onSave={() => {}} // Not editing in this view
          onDelete={() => handleRemoveFavorite(selectedComponent._id)}
          onClose={handleCloseModal}
          isAdding={false}
          viewOnly={true}
        />
      )}
    </div>
  );
}