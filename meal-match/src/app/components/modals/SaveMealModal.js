'use client';
import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function SaveMealModal({ isOpen, onClose, onSave, mealId, mealComponents, mealToppings, userId, existingMeal = null }) {
  // Initialize state with existing meal data if editing
  const [title, setTitle] = useState(existingMeal?.name || '');
  const [notes, setNotes] = useState(existingMeal?.notes || '');
  const [isFavorite, setIsFavorite] = useState(existingMeal?.favorite || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a meal title');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. First update the meal data
      const mealData = {
        _id: mealId,
        name: title,
        notes,
        components: mealComponents,
        toppings: mealToppings,
        favorite: isFavorite
      };

      // Call the parent component's save handler
      await onSave(mealData, isFavorite);
      
      // Reset form
      setTitle('');
      setNotes('');
      setIsFavorite(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save meal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Save Meal</h2>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* List Components Added to the Meal */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Components:</h3>
          {mealComponents && mealComponents.length > 0 ? (
            <div className="space-y-1">
              {mealComponents.map((component, index) => (
                <div key={index} className="bg-orange-100 p-2 rounded">
                  {component}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No components added.</p>
          )}
        </div>

        {/* Toppings */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Toppings/Additional Ingredients:</h3>
          {mealToppings && mealToppings.length > 0 ? (
            <div className="space-y-1">
              {mealToppings.map((topping, index) => (
                <div key={index} className="bg-blue-100 p-2 rounded">
                  {topping}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No toppings added.</p>
          )}
        </div>

        {/* Meal Title Input */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Meal Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a name for this meal"
          />
        </div>

        {/* Notes Input */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Notes</label>
          <textarea
            className="w-full border p-2 rounded resize-none h-24"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add preparation notes, cooking time, etc."
          ></textarea>
        </div>

        {/* Favorite Toggle */}
        <div className="mb-6">
          <button 
            className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-50"
            onClick={toggleFavorite}
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            />
            <span>{isFavorite ? 'Added to Favorites' : 'Add to Favorites'}</span>
          </button>
        </div>

        {/* Save/Cancel Buttons */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <button 
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded flex items-center gap-2"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Meal'}
          </button>
        </div>
      </div>
    </div>
  );
}