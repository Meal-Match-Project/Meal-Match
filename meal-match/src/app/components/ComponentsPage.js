'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ComponentModal from '@/app/components/modals/ComponentModal';
import { addComponent, updateComponent, deleteComponent } from '@/app/actions/componentActions';
import { Plus } from 'lucide-react';

export default function ComponentsPage({ userId, components = [] }) {
  const [componentsData, setComponentsData] = useState(components);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('thisWeek'); // 'thisWeek' or 'all'

  // Filter components for display
  const thisWeekComponents = componentsData && componentsData.length > 0 ? componentsData.filter(comp => comp.servings > 0) : [];
  const allComponents = componentsData;

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    // Create empty component with default values matching the schema
    setSelectedComponent({
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
    });
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleSaveComponent = async (updatedComponent) => {
    if (isAdding) {
      // Add userId to the new component
      const newComponent = {
        ...updatedComponent,
        userId: userId
      };
      
      
      try {
        // Call the server action to add component to database
        const result = await addComponent(newComponent);
        
        if (result.success) {
          // Update local state with the new component
          setComponentsData(prev => [...prev, result.component]);
          
          // If marked as favorite, add to favorites collection
          if (result.component.favorite) {
            await fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                component_id: result.component._id,
                type: 'component'
              })
            });
          }
        } else {
          console.error("Failed to add component:", result.error);
        }
      } catch (error) {
        console.error("Error adding component:", error);
      }
    } else {
      try {
        // Get the previous state of the component to check if favorite status changed
        const previousComponent = componentsData.find(comp => comp._id === updatedComponent._id);
        const favoriteChanged = previousComponent && previousComponent.favorite !== updatedComponent.favorite;
        
        // Call the server action to update the component
        const result = await updateComponent(updatedComponent._id, updatedComponent);
  
        if (result.success) {
          // Update local state with the updated component
          setComponentsData(componentsData.map(comp => 
            comp._id === updatedComponent._id ? updatedComponent : comp
          ));
          
          // Handle favorite status change
          if (favoriteChanged) {
            if (updatedComponent.favorite) {
              // Add to favorites
              await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: userId,
                  component_id: updatedComponent._id,
                  type: 'component'
                })
              });
            } else {
              // Remove from favorites - we'll need to get the favorite ID first
              const favoritesResponse = await fetch(`/api/favorites?userId=${userId}&componentId=${updatedComponent._id}`);
              const favoritesData = await favoritesResponse.json();
              
              if (favoritesData.favorites && favoritesData.favorites.length > 0) {
                const favoriteId = favoritesData.favorites[0]._id;
                
                await fetch(`/api/favorites/${favoriteId}`, {
                  method: 'DELETE'
                });
              }
            }
          }
        } else {
          console.error("Failed to update component:", result.error);
        }
      }
      catch(error) {
        console.error("Error updating component:", error);
      }
    }
    
    setIsModalOpen(false);
  };

  const handleDeleteComponent = async (componentId) => {
    try {
      const result = await deleteComponent(componentId);
      if (result.success) {
        // Remove from local state
        setComponentsData(componentsData.filter(comp => comp._id !== componentId));
      }
      else {
        console.error("Failed to delete component:", result.error);
      }
    }
    catch (error) {
      console.error("Error deleting component:", error);
    }
    setIsModalOpen(false);
  };


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Components</h1>
      
      <div className="w-1/4 mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button 
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'thisWeek' ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-white'}`}
            onClick={() => setActiveTab('thisWeek')}
          >
            This Week
          </button>
          <button 
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'all' ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-white'}`}
            onClick={() => setActiveTab('all')}
          >
            All Components
          </button>
        </div>
        
        {/* Component List */}
        <div className="divide-y">
          {(activeTab === 'thisWeek' ? thisWeekComponents : allComponents).map((component) => (
            <div 
              key={component._id || component.name} 
              className="p-3 hover:bg-gray-50 cursor-pointer flex items-center"
              onClick={() => handleComponentClick(component)}
            >
              <div className="flex-1">
                <div className="font-medium">{component.name}</div>
                {activeTab === 'thisWeek' && <div className="text-sm text-gray-500">Servings: {component.servings}</div>}
              </div>
            </div>
          ))}
          
          {/* Empty state */}
          {(activeTab === 'thisWeek' ? thisWeekComponents : allComponents).length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No components found. Add your first component below.
            </div>
          )}
        </div>
        
        {/* Add Component Button */}
        <div className="p-3 border-t">
          <button 
            onClick={handleAddClick}
            className="w-full py-2 flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white rounded-md transition"
          >
            <Plus size={16} className="mr-1" />
            Add Component
          </button>
        </div>
      </div>
      
      {/* Component Modal */}
      {isModalOpen && (
        <ComponentModal 
          component={selectedComponent} 
          onSave={handleSaveComponent} 
          onDelete={handleDeleteComponent} 
          onClose={() => setIsModalOpen(false)} 
          isAdding={isAdding}
        />
      )}
    </div>
  );
}