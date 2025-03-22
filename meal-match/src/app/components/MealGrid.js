'use client';

import { useDroppable } from '@dnd-kit/core';
import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';

export default function MealGrid({ meals, onRemoveComponent, onAddMiniComponent, onMealClick, onClearMeal }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

  return (
    <div className="overflow-auto p-4 w-3/4">
      <div className="min-w-max grid grid-cols-7 gap-4">
        {days.map((day) => (
          <div key={day} className="border rounded-lg shadow-md p-2 bg-gray-100 min-w-[150px]">
            <h2 className="text-lg font-bold text-center">{day}</h2>
            <div className="space-y-4 mt-2">
              {mealTypes.map((mealType) => {
                // Find the meal document that matches this day and meal type
                const meal = meals.find(
                  m => m.day_of_week === day && m.meal_type === mealType
                ) || { _id: `${day}-${mealType}`, components: [], toppings: [] };
                
                return (
                  <DroppableMeal
                    key={mealType}
                    id={meal._id}
                    meal={meal}
                    onRemoveComponent={onRemoveComponent}
                    onAddMiniComponent={onAddMiniComponent}
                    onMealClick={onMealClick}
                    onClearMeal={onClearMeal}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DroppableMeal({ id, meal, onRemoveComponent, onAddMiniComponent, onMealClick, onClearMeal }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const [miniComponentInput, setMiniComponentInput] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);

    // Get components and toppings from the meal object
    const components = meal.components || [];
    const toppings = meal.toppings || [];

    useEffect(() => {
        function handleClickOutside(event) {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={setNodeRef}
            className={`border rounded-lg p-4 bg-white shadow-md text-center min-w-[200px] min-h-[60px] relative
                transition-all duration-200 ${isOver ? 'scale-105 border-orange-500 shadow-lg' : ''}`}
        >
            {/* Meal Title and Options Button */}
            <div className="flex justify-between items-center">
                <p className="font-medium">{meal.meal_type}</p>
                <button
                    className="text-gray-500 hover:text-gray-700 text-lg"
                    onClick={() => setShowOptions(!showOptions)}
                >
                    ⋮
                </button>
            </div>

            {/* Options Menu */}
            {showOptions && (
                <div ref={optionsRef} className="absolute top-8 right-0 bg-white border shadow-lg rounded-lg py-1 w-36 z-10">
                    <button
                        className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                        onClick={() => {
                            onMealClick(id);
                            setShowOptions(false);
                        }}
                    >
                        Favorite
                        <Heart className={`w-4 h-4 ${meal.favorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        onClick={() => {
                            onClearMeal(id);
                            setShowOptions(false);
                        }}
                    >
                        Clear Meal
                    </button>
                </div>
            )}

            {/* Conditionally Render Mini Component Input */}
            {components.length > 0 && (
                <div className="mt-2 flex">
                    <input
                        type="text"
                        value={miniComponentInput}
                        onChange={(e) => setMiniComponentInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && miniComponentInput.trim()) {
                                onAddMiniComponent(id, miniComponentInput);
                                setMiniComponentInput('');
                            }
                        }}
                        placeholder="Add toppings..."
                        className="border p-1 rounded w-full"
                    />
                </div>
            )}

            {/* Display Components */}
            {components.map((component, index) => (
                <div
                    key={index}
                    className="mt-2 p-1 flex justify-between items-center bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out"
                >
                    <span>{component}</span>
                    <button
                        className="font-bold px-1 text-white"
                        onClick={() => onRemoveComponent(id, index, component)}
                    >
                        ✕
                    </button>
                </div>
            ))}

            {/* Display Toppings */}
            {toppings.map((topping, index) => (
                <div
                    key={`topping-${index}`}
                    className="mt-2 p-1 rounded flex justify-between items-center bg-blue-100 italic"
                >
                    <span>{topping}</span>
                    <button
                        className="font-bold px-1"
                        onClick={() => onRemoveComponent(id, index, topping, 'topping')}
                    >
                        ✕
                    </button>
                </div>
            ))}

            {/* If meal has a name (not auto-generated), show it */}
            {meal.name && meal.name !== `${meal.day_of_week}-${meal.meal_type}` && (
                <div className="mt-2 text-sm font-medium text-gray-700">
                    {meal.name}
                </div>
            )}
        </div>
    );
}