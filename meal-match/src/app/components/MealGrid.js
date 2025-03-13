'use client';

import { useDroppable } from '@dnd-kit/core';
import { useState } from 'react';

export default function MealGrid({ mealPlans, onRemoveComponent, onAddMiniComponent, onMealClick }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals = ['Breakfast', 'Lunch', 'Dinner'];

  return (
    <div className="overflow-auto p-4 w-3/4">
      <div className="min-w-max grid grid-cols-7 gap-4">
        {days.map((day) => (
          <div key={day} className="border rounded-lg shadow-md p-2 bg-gray-100 min-w-[150px]">
            <h2 className="text-lg font-bold text-center">{day}</h2>
            <div className="space-y-4 mt-2">
              {meals.map((meal) => (
                <DroppableMeal
                  key={meal}
                  id={`${day}-${meal}`}
                  items={mealPlans[`${day}-${meal}`] || []}
                  onRemoveComponent={onRemoveComponent}
                  onAddMiniComponent={onAddMiniComponent}
                  onMealClick={onMealClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DroppableMeal({ id, items, onRemoveComponent, onAddMiniComponent, onMealClick }) {
    const { setNodeRef } = useDroppable({ id });
    const [miniComponentInput, setMiniComponentInput] = useState('');
  
    return (
      <div onClick={() => onMealClick(id)} ref={setNodeRef} className="border rounded-lg p-4 bg-white shadow-md text-center min-h-[80px]">
        <p className="font-medium">{id.split('-')[1]}</p>
  
        {/* Display Components */}
        {items.map((item, index) => (
          <div
            key={index}
            className={`mt-2 p-1 rounded flex justify-between items-center ${
              item.type === 'component' ? 'bg-orange-300' : 'bg-gray-300 italic'
            }`}
          >
            <span>{item.name}</span>
            <button
              className="text-red-600 font-bold px-1"
              onClick={() => onRemoveComponent(id, index, item.name)}
            >
              ✕
            </button>
          </div>
        ))}
  
        {/* Conditionally Render Mini Component Input */}
        {items.length > 0 && (
          <div className="mt-2 flex">
            <input
              type="text"
              value={miniComponentInput}
              onChange={(e) => setMiniComponentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onAddMiniComponent(id, miniComponentInput);
                  setMiniComponentInput('');
                }
              }}
              placeholder="Add toppings..."
              className="border p-1 rounded w-full"
            />
          </div>
        )}
      </div>
    );
  }
  
