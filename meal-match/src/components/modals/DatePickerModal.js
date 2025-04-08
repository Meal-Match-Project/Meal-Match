'use client';
import { useState } from 'react';

export default function DatePickerModal({ ingredient, onClose }) {
    const [date, setDate] = useState('');
  
    const handleSave = () => {
      // Logic to update the ingredient status with the selected date
      onClose();
    };
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-lg font-bold">Mark as Bought</h2>
          <input
            type="date"
            className="border p-2 w-full mt-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded ml-2">Save</button>
          </div>
        </div>
      </div>
    );
  }
  