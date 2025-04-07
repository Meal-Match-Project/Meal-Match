'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function SaveMealModal({ isOpen, onClose, onSave, mealId, mealComponents, mealToppings, userId, existingMeal = null }) {
  // Get the existing meal data from the parent component
  const [currentMeal, setCurrentMeal] = useState(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update form state when the modal opens or existingMeal changes
  useEffect(() => {
    if (isOpen) {
      // If we have an existing meal, use its data
      if (existingMeal) {
        setCurrentMeal(existingMeal);
        setTitle(existingMeal.name || '');
        setNotes(existingMeal.notes || '');
        setIsFavorite(existingMeal.favorite || false);
      } else {
        // Otherwise, look for the meal in meals data by ID
        setTitle('');
        setNotes('');
        setIsFavorite(false);
      }
    }
  }, [isOpen, existingMeal, mealId]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a meal title');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Prepare the meal data with correct favorite status
      const mealData = {
        _id: mealId,
        name: title,
        notes,
        components: mealComponents,
        toppings: mealToppings,
        favorite: true,
      };

      // Call the parent component's save handler with the favorite status
      await onSave(mealData, true);
      
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