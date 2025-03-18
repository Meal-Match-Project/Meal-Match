'use client';
import { useState } from 'react';

export default function SaveMealModal({ isOpen, onClose, onSave, mealId, mealComponents }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Meal to Favorites</h2>

        {/* List Components Added to the Meal */}
        <div className="mb-3">
          <h3 className="font-semibold">Added Components:</h3>
          {mealComponents && mealComponents.length > 0 ? (
            <ul className="list-disc list-inside">
              {mealComponents.map((component, index) => (
                <li key={index} className="text-gray-700">{component.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No components added.</p>
          )}
        </div>

        {/* Meal Title Input */}
        <label className="block font-medium">Meal Title</label>
        <input
          type="text"
          className="w-full border p-2 rounded mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Notes Input */}
        <label className="block font-medium">Notes</label>
        <textarea
          className="w-full border p-2 rounded mb-3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>

        {/* Save/Cancel Buttons */}
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => {
              onSave(mealId, title, notes);
              setTitle('');
              setNotes('');
              onClose();
            }}
          >
            Favorite
          </button>
        </div>
      </div>
    </div>
  );
}
