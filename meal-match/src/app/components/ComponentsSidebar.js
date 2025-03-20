'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown } from 'lucide-react';

export default function ComponentsSidebar({ favoriteMeals }) {
  const { userId: urlUserId } = useParams();
  const [userId, setUserId] = useState(null);
  const [componentNames, setComponentNames] = useState([]);
  const [componentCounts, setComponentCounts] = useState([]);
  const [openSections, setOpenSections] = useState({ components: true, meals: false });

  // Load userId from URL or localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (urlUserId) {
      setUserId(urlUserId);
      localStorage.setItem("userId", urlUserId);
    } else if (storedUserId) {
      setUserId(storedUserId);
    }
  }, [urlUserId]);

  // Load user's "This Week" components
  useEffect(() => {
    if (userId) {
      const storedComponents = localStorage.getItem(`componentsData-${userId}`);
      if (storedComponents) {
        const parsedComponents = JSON.parse(storedComponents).thisWeek || [];
        setComponentNames(parsedComponents.map(comp => comp.name));
        setComponentCounts(parsedComponents.map(comp => comp.servings || 1)); // Default servings to 1 if missing
      }
    }
  }, [userId]);

  // Filter meals that match all current components
  const fullyAvailableMeals = favoriteMeals.filter(meal =>
    meal.components.every((c) => componentNames.includes(c))
  );

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-1/4 bg-orange-600 p-4">
      {/* Components Accordion */}
      <div
        className="flex justify-between items-center text-white font-bold text-lg cursor-pointer mb-2"
        onClick={() => toggleSection('components')}
      >
        <span>Components</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${openSections.components ? "rotate-180" : ""}`} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${openSections.components ? 'max-h-96' : 'max-h-0'}`}>
        <div className="space-y-2">
          {componentNames.map((name, index) => (
            <DraggableComponent key={name} id={name} count={componentCounts[index]} />
          ))}
        </div>
      </div>

      {/* Favorite Meals Accordion */}
      <div
        className="flex justify-between items-center text-white font-bold text-lg cursor-pointer mt-4 mb-2"
        onClick={() => toggleSection('meals')}
      >
        <span>Favorite Meals</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${openSections.meals ? "rotate-180" : ""}`} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${openSections.meals ? 'max-h-96' : 'max-h-0'}`}>
        <div className="space-y-2">
          {fullyAvailableMeals.map((meal) => (
            <DraggableMeal key={meal.name} meal={meal} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DraggableComponent({ id, count }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });
  const depleted = count === 0;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2 rounded shadow-md cursor-grab ${depleted ? 'bg-orange-300 cursor-not-allowed' : 'bg-white'}`}
    >
      <div className="flex justify-between items-center">
        <span>{id}</span>
        <span className="text-sm font-bold">{count}</span>
      </div>
    </div>
  );
}

function DraggableMeal({ meal }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `meal-${meal.name}` });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="p-2 rounded shadow-md cursor-grab bg-white"
    >
      {meal.name}
    </div>
  );
}
