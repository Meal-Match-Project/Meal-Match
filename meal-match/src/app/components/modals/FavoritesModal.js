'use client';

import { useState } from 'react';
import { Pencil, HeartOff, X } from 'lucide-react';

export default function FavoritesModal({ meal, onSave, onDelete, onClose, weeklyComponents, onAddMeal }) {
  const [editedMeal, setEditedMeal] = useState({ ...meal });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e, field) => {
    setEditedMeal({ ...editedMeal, [field]: e.target.value });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          {isEditing ? (
            <input
              type="text"
              value={editedMeal.name}
              placeholder="Meal Name"
              onChange={(e) => handleChange(e, 'name')}
              className="text-xl font-bold border-b-2 border-gray-300 w-full focus:outline-none focus:border-blue-500"
            />
          ) : (
            <h2 className="text-xl font-bold">{editedMeal.name}</h2>
          )}
          <div className="flex items-center gap-3">
            {!isEditing && <Pencil className="w-5 h-5 cursor-pointer text-gray-600 hover:text-black" onClick={() => setIsEditing(true)} />}
            <X className="w-6 h-6 cursor-pointer text-gray-600 hover:text-black" onClick={onClose} />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow mt-3 pr-2 max-h-[50vh] space-y-4">
          <div>

          {/* Components */}
          <div>
            <h3 className="text-md mb-4 font-semibold">Components</h3>
            {isEditing ? (
              <div className="space-y-2 my-4">
                {editedMeal.components.map((component, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={component}
                      onChange={(e) => {
                        const updatedComponents = [...editedMeal.components];
                        updatedComponents[index] = e.target.value;
                        setEditedMeal({ ...editedMeal, components: updatedComponents });
                      }}
                      className="border p-1 w-full rounded-md"
                    />
                    <button onClick={() => setEditedMeal({
                      ...editedMeal,
                      components: editedMeal.components.filter((_, i) => i !== index)
                    })} className="text-red-500 hover:text-red-700">
                      ✕
                    </button>
                  </div>
                ))}
                <button onClick={() => setEditedMeal({
                  ...editedMeal,
                  components: [...editedMeal.components, '']
                })} className="text-blue-600 hover:underline mt-2">
                  + Add Component
                </button>
              </div>
            ) : (
              <div className="space-y-2 my-4">
                {editedMeal.components.map((component, index) => {
                  const isInWeekly = weeklyComponents.includes(component);
                  return (
                    <div 
                      key={index} 
                      className={`rounded-md w-3/4 px-4 py-2 text-md flex items-center justify-between 
                        ${isInWeekly ? 'bg-orange-600 text-white' : 'bg-orange-300 text-black'}`}
                    >
                      <span>{component}</span>
                      {!isInWeekly && (
                        <button 
                          onClick={() => onAddMeal([component])} 
                          className="ml-2 bg-white text-orange-800 px-2 py-1 rounded"
                        >
                          Add
                        </button>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

          {/* Toppings */}
          <div>
            <h3 className="text-md font-semibold ">Additional Ingredients</h3>
            {isEditing ? (
              <div className="space-y-2 my-4">
                {editedMeal.toppings.map((topping, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={topping}
                      onChange={(e) => {
                        const updatedToppings = [...editedMeal.toppings];
                        updatedToppings[index] = e.target.value;
                        setEditedMeal({ ...editedMeal, toppings: updatedToppings });
                      }}
                      className="border p-1 w-full rounded-md"
                    />
                    <button onClick={() => setEditedMeal({
                      ...editedMeal,
                      toppings: editedMeal.toppings.filter((_, i) => i !== index)
                    })} className="text-red-500 hover:text-red-700">
                      ✕
                    </button>
                  </div>
                ))}
                <button onClick={() => setEditedMeal({
                  ...editedMeal,
                  toppings: [...editedMeal.toppings, '']
                })} className="text-blue-600 hover:underline mt-2">
                  + Add Topping
                </button>
              </div>
            ) : (
              <div className="space-y-2 my-4">
                {editedMeal.toppings.map((topping, index) => (
                  <div key={index} className="rounded-md bg-gray-200 w-3/4 px-4 py-2 text-md">{topping}</div>
                ))}
              </div>
            )}
          </div>
          {/* Cuisine */}
          <div>
            <h3 className="text-md font-semibold">Cuisine</h3>
            {isEditing ? (
              <textarea
                value={editedMeal.notes}
                onChange={(e) => handleChange(e, 'cuisine')}
                className="border p-1 w-full rounded-md"
              />
            ) : (
              <p className="text-md mb-4">{editedMeal.notes || 'Not specified.'}</p>
            )}
          </div>
          {/* Nutrition */}
          <div>
            <h3 className="text-md font-semibold">Nutrition Info</h3>
            {isEditing ? (
              <textarea
                value={editedMeal.notes}
                onChange={(e) => handleChange(e, 'nutrition')}
                className="border p-1 w-full rounded-md"
              />
            ) : (
              <p className="text-md mb-4">{editedMeal.notes || 'Not specified.'}</p>
            )}
          </div>
          {/* Meal Type */}
          <div>
            <h3 className="text-md font-semibold">Meal Type</h3>
            {isEditing ? (
              <select
                value={editedMeal.type}
                onChange={(e) => handleChange(e, 'type')}
                className="border p-1 w-full rounded-md"
              >
                <option value="">Select Meal Type</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </select>
            ) : (
              <p className="text-md mb-4">{editedMeal.type || 'Not specified.'}</p>
            )}
          </div>
          {/* Notes */}
          <div>
            <h3 className="text-md font-semibold">Notes</h3>
            {isEditing ? (
              <textarea
                value={editedMeal.notes}
                onChange={(e) => handleChange(e, 'notes')}
                className="border p-1 w-full rounded-md"
              />
            ) : (
              <p className="text-md">{editedMeal.notes || 'No notes added.'}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4 space-x-2">
            <button onClick={() => onDelete(editedMeal.name)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition flex items-center gap-1">
                <HeartOff className="w-4 h-4" /> Remove
            </button>
            {isEditing && (
                <>
                <button onClick={() => setIsEditing(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition">
                    Cancel
                </button>
                <button onClick={() => { onSave(editedMeal); setIsEditing(false); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition">
                    Save
                </button>
                </>
            )}
          
        </div>
      </div>
    </div>
    </div>
  );
}
