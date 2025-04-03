'use client';

import { useDroppable, useDraggable } from '@dnd-kit/core';
import { useEffect, useRef, useState } from 'react';
import { Heart, GripVertical } from 'lucide-react';

export default function MealGrid({ 
    meals, 
    components, 
    onRemoveComponent, 
    onAddMiniComponent, 
    onMealClick, 
    onClearMeal, 
    onMoveComponent,
    dayInfo = []
  }) {
    // Use dynamic days from dayInfo, or fallback to default days if not provided
    const days = dayInfo.length === 7 
      ? dayInfo.map(day => ({ date: new Date(day.date).getDate(), display: day.display, name: day.name }))
      : [
          { display: 'Today', name: new Date().toLocaleDateString('en-US', { weekday: 'long' }) },
          ...Array(6).fill().map((_, i) => {
            const day = new Date();
            day.setDate(day.getDate() + i + 1);
            return { 
              display: day.toLocaleDateString('en-US', { weekday: 'long' }), 
              name: day.toLocaleDateString('en-US', { weekday: 'long' }) 
            };
          })
        ];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
  
    // Create a list of valid component names
    const validComponentNames = components.map(comp => comp.name);
  
    return (
      <div className="overflow-auto p-4 w-3/4">
        <div className="min-w-max grid grid-cols-7 gap-4">
          {days.map((day, index) => (
            <div key={index} className="border rounded-lg shadow-md p-2 bg-gray-100 min-w-[150px]">
              <h2 className="text-lg font-bold text-center">
                {day.display}
              </h2>
              <h1 className="text-sm text-center">
                {day.date}
              </h1>
              <div className="space-y-4 mt-2">
                {mealTypes.map((mealType) => {
                  // Find the meal document that matches this day and meal type
                  const meal = meals.find(
                    m => m.day_of_week === day.name && m.meal_type === mealType
                  ) || { _id: `${day.name}-${mealType}`, components: [], toppings: [] };
                  
                  // Filter out components that don't exist anymore in the master list
                  const validComponents = (meal.components || []).filter(
                    comp => validComponentNames.includes(comp)
                  );
                  
                  // If components were filtered out, we need to update the meal
                  if (validComponents.length !== (meal.components || []).length) {
                    meal.components = validComponents;
                  }
                  
                  return (
                    <DroppableMeal
                      key={mealType}
                      id={meal._id}
                      meal={meal}
                      onRemoveComponent={onRemoveComponent}
                      onAddMiniComponent={onAddMiniComponent}
                      onMealClick={onMealClick}
                      onClearMeal={onClearMeal}
                      onMoveComponent={onMoveComponent}
                      validComponentNames={validComponentNames}
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

function DroppableMeal({ id, meal, onRemoveComponent, onAddMiniComponent, onMealClick, onClearMeal, onMoveComponent, validComponentNames }) {
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
                <DraggableComponent
                    key={`${id}-component-${index}`}
                    mealId={id}
                    component={component}
                    index={index}
                    onRemoveComponent={onRemoveComponent}
                    onMoveComponent={onMoveComponent}
                    isValid={validComponentNames.includes(component)}
                />
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

function DraggableComponent({ mealId, component, index, onRemoveComponent, onMoveComponent, isValid }) {
    // Create a unique ID for this component instance in this meal
    const dragId = `meal-component:${mealId}:${component}:${index}`;
    
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: dragId,
        data: {
            type: 'meal-component',
            mealId,
            component,
            index
        }
    });

    // Apply warning styling if component not valid (deleted from components list)
    const invalidClass = !isValid ? 'from-red-500 to-red-400 opacity-70' : 'from-orange-600 to-orange-500';
    
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            className={`mt-2 p-1 flex justify-between items-center 
                      bg-gradient-to-r ${invalidClass} text-white font-semibold rounded-lg shadow-lg 
                      hover:scale-105 transition-transform duration-300 ease-in-out
                      ${isDragging ? 'opacity-50' : ''}`}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <div className="flex items-center">
                <div className="mr-2 cursor-grab" {...listeners}>
                    <GripVertical className="w-4 h-4" />
                </div>
                <span>{component}</span>
            </div>
            <button
                className="font-bold px-1 text-white"
                onClick={() => onRemoveComponent(mealId, index, component)}
            >
                ✕
            </button>
        </div>
    );
}