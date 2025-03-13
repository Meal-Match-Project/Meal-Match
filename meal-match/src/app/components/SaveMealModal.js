'use client';
import { useState } from 'react';

export default function SaveMealModal({ isOpen, onClose, onSave, mealId }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null; // Don't render if modal is closed

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Save Meal</h2>

        <label className="block font-medium">Meal Title</label>
        <input
          type="text"
          className="w-full border p-2 rounded mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block font-medium">Notes</label>
        <textarea
          className="w-full border p-2 rounded mb-3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>

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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
