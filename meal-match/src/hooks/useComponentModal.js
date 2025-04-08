import { useState } from 'react';

export default function useComponentModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Open modal with existing component
  const openEditModal = (component) => {
    setSelectedComponent(component);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  // Open modal with new component
  const openAddModal = () => {
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

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Delayed close modal (useful when component will disappear from view)
  const delayedCloseModal = (delay = 100) => {
    setTimeout(() => {
      setIsModalOpen(false);
    }, delay);
  };

  return {
    isModalOpen,
    selectedComponent,
    isAdding,
    openEditModal,
    openAddModal,
    closeModal,
    delayedCloseModal
  };
}