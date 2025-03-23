'use client';

import { X, Trash2, Heart } from 'lucide-react';

export default function FavoriteMealModal({ meal, weeklyComponents, onClose, onRemoveFavorite }) {
  // Check if a component is in the weekly components list
  const isComponentAvailable = (component) => {
    return weeklyComponents.includes(component);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold">{meal.name}</h2>
          <X className="w-6 h-6 cursor-pointer text-gray-600 hover:text-black" onClick={onClose} />
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow mt-4 pr-2 space-y-5">
          {/* Meal Info */}
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <span className="px-2 py-1 bg-gray-100 rounded">{meal.meal_type}</span>
          </div>
          
          {/* Components */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Components</h3>
            <div className="space-y-2">
              {meal.components && meal.components.map((component, index) => (
                <div 
                  key={index} 
                  className={`px-4 py-2 rounded-md ${
                    isComponentAvailable(component) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{component}</span>
                    {isComponentAvailable(component) ? (
                      <span className="text-xs font-medium">Available</span>
                    ) : (
                      <span className="text-xs font-medium">Not Available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Toppings/Additional ingredients */}
          {meal.toppings && meal.toppings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Ingredients</h3>
              <div className="space-y-2">
                {meal.toppings.map((topping, index) => (
                  <div key={index} className="bg-gray-100 px-4 py-2 rounded-md">
                    {topping}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Notes */}
          {meal.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-line">{meal.notes}</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-3 border-t flex justify-end">
          <button 
            onClick={() => onRemoveFavorite(meal._id)}
            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove from Favorites</span>
          </button>
        </div>
      </div>
    </div>
  );
}