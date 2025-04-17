'use client';

import ComponentModal from '@/components/modals/ComponentModal';
import ComponentTabs from './ui/ComponentTabs';
import ComponentList from './ui/ComponentList';
import AddComponentButton from './ui/AddComponentButton';

// Custom hooks
import useComponentsData from '@/hooks/useComponentsData';
import useComponentModal from '@/hooks/useComponentModal';
import useTabs from '@/hooks/useTabs';

export default function ComponentsPage({ userId, components = [] }) {
  // Use custom hooks for state management
  const { 
    componentsData, 
    getThisWeekComponents, 
    addNewComponent, 
    updateExistingComponent, 
    removeComponent
  } = useComponentsData(components, userId);
  
  const {
    isModalOpen,
    selectedComponent,
    isAdding,
    openEditModal,
    openAddModal,
    closeModal,
    delayedCloseModal
  } = useComponentModal();
  
  const { activeTab, setActiveTab } = useTabs('thisWeek');

  // Get components based on active tab
  const thisWeekComponents = getThisWeekComponents();
  const displayComponents = activeTab === 'thisWeek' ? thisWeekComponents : componentsData;

  // Handle saving a component (new or updated)
  const handleSaveComponent = async (updatedComponent) => {
    const isSaveForLater = 
      !isAdding && 
      updatedComponent._id && 
      updatedComponent.servings === 0 &&
      componentsData.find(comp => comp._id === updatedComponent._id)?.servings > 0;
    
    // If component is being saved for later and we're in "This Week" view, 
    // close the modal as the component will disappear from the list
    if (isSaveForLater && activeTab === 'thisWeek') {
      delayedCloseModal();
    }

    try {
      if (isAdding) {
        await addNewComponent(updatedComponent);
      } else {
        await updateExistingComponent(updatedComponent);
      }
      closeModal();
    } catch (error) {
      console.error("Error handling component:", error);
    }
  };

  // Handle deleting a component
  const handleDeleteComponent = async (componentId) => {
    const result = await removeComponent(componentId);
    if (result.success) {
      closeModal();
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">Components</h1>
      
      <div className="w-1/4 mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <ComponentTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {/* Component List */}
        <ComponentList 
          components={displayComponents} 
          activeTab={activeTab} 
          onComponentClick={openEditModal} 
        />
        
        {/* Add Component Button */}
        <AddComponentButton onClick={openAddModal} />
      </div>
      
      {/* Component Modal */}
      {isModalOpen && (
        <ComponentModal 
          component={selectedComponent} 
          onSave={handleSaveComponent} 
          onDelete={handleDeleteComponent} 
          onClose={closeModal} 
          isAdding={isAdding}
        />
      )}
    </div>
  );
}