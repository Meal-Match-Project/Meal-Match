import { useState } from 'react';
import { 
  addComponent, 
  updateComponent, 
  deleteComponent,
  addComponentFavorite,
  deleteFavoriteById
} from '@/services/apiService';

export default function useComponentsData(initialComponents = [], userId) {
  const [componentsData, setComponentsData] = useState(initialComponents);

  // Get components filtered by their servings
  const getThisWeekComponents = () => 
    componentsData.filter(comp => comp.servings > 0);

  // Add a new component
  const addNewComponent = async (newComponent) => {
    try {
      // Add userId to the new component
      const componentWithUserId = {
        ...newComponent,
        userId
      };
      
      const result = await addComponent(componentWithUserId);
      
      if (result.success) {
        // Update local state with the new component
        setComponentsData(prev => [...prev, result.component]);
        
        // If marked as favorite, add to favorites collection
        if (result.component.favorite) {
          await addComponentFavorite(userId, result.component._id);
        }
        return { success: true, component: result.component };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error adding component:", error);
      return { success: false, error: error.message };
    }
  };

  // Update an existing component
  const updateExistingComponent = async (updatedComponent) => {
    try {
      // Get the previous state to check if favorite status changed
      const previousComponent = componentsData.find(comp => comp._id === updatedComponent._id);
      const favoriteChanged = previousComponent && previousComponent.favorite !== updatedComponent.favorite;
      
      const result = await updateComponent(updatedComponent._id, updatedComponent);

      if (result.success) {
        // Update local state
        setComponentsData(prev => 
          prev.map(comp => comp._id === updatedComponent._id ? updatedComponent : comp)
        );
        
        // Handle favorite status change
        if (favoriteChanged) {
          if (updatedComponent.favorite) {
            await addComponentFavorite(userId, updatedComponent._id);
          } else {
            const favoritesResponse = await fetch(`/api/favorites?userId=${userId}&componentId=${updatedComponent._id}`);
            const favoritesData = await favoritesResponse.json();
            
            if (favoritesData.favorites && favoritesData.favorites.length > 0) {
              const favoriteId = favoritesData.favorites[0]._id;
              await deleteFavoriteById(favoriteId);
            }
          }
        }
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error updating component:", error);
      return { success: false, error: error.message };
    }
  };

  // Delete a component
  const removeComponent = async (componentId) => {
    try {
      const result = await deleteComponent(componentId);
      if (result.success) {
        // Remove from local state
        setComponentsData(prev => prev.filter(comp => comp._id !== componentId));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error deleting component:", error);
      return { success: false, error: error.message };
    }
  };

  // Save a component for later (set servings to 0)
  const saveComponentForLater = async (componentId) => {
    // Find the component
    const component = componentsData.find(comp => comp._id === componentId);
    if (!component) return { success: false, error: "Component not found" };
    
    // Create updated component with servings set to 0
    const updatedComponent = { ...component, servings: 0 };
    
    return await updateExistingComponent(updatedComponent);
  };

  return {
    componentsData,
    getThisWeekComponents,
    addNewComponent,
    updateExistingComponent,
    removeComponent,
    saveComponentForLater
  };
}