import { useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';

export default function IngredientModal({ ingredient, onSave, onDelete, onClose, isAdding }) {
  // Initialize with empty ingredient if needed
  const defaultIngredient = {
    name: '',
    amount: 1,
    unit: 'unit',
    status: 'Need to buy',
    shelf_life: 7,
  };
  
  const [editedIngredient, setEditedIngredient] = useState({ ...defaultIngredient, ...ingredient });
  const [isEditing, setIsEditing] = useState(isAdding);

  const handleChange = (e, field) => {
    // Convert number fields from string to number
    if (['amount', 'shelf_life'].includes(field)) {
      setEditedIngredient({ ...editedIngredient, [field]: Number(e.target.value) });
    } else {
      setEditedIngredient({ ...editedIngredient, [field]: e.target.value });
    }
  };

  // Mark as bought with today's date
  const markAsBought = () => {
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}`;
    setEditedIngredient({ 
      ...editedIngredient, 
      status: `Bought ${formattedDate}` 
    });
  };

  // Mark as needing to buy
  const markAsNeedToBuy = () => {
    setEditedIngredient({ 
      ...editedIngredient, 
      status: 'Need to buy' 
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold">{isEditing ? "Edit Ingredient" : editedIngredient.name}</h2>
          <div className="flex items-center gap-3">
            {!isEditing && <Pencil className="w-5 h-5 cursor-pointer text-gray-600 hover:text-black" onClick={() => setIsEditing(true)} />}
            <X className="w-6 h-6 cursor-pointer text-gray-600 hover:text-black" onClick={onClose} />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow mt-3 pr-2 max-h-[50vh] space-y-4">
          {/* Name - shown only in edit mode */}
          {isEditing &&
            <div>
              <p className="text-sm font-semibold">Name</p>             
              <input
                type="text"
                value={editedIngredient.name}
                onChange={(e) => handleChange(e, 'name')}
                className="border p-1 w-full rounded-md" 
              />
            </div>
          }
          
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Amount</p>
              {isEditing ? (
                <input 
                  type="number" 
                  value={editedIngredient.amount} 
                  onChange={(e) => handleChange(e, 'amount')} 
                  className="border p-1 w-16 rounded-md" 
                />
              ) : (
                <p>{editedIngredient.amount}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Unit</p>
              {isEditing ? (
                <select
                  value={editedIngredient.unit}
                  onChange={(e) => handleChange(e, 'unit')}
                  className="border p-1 rounded-md"
                >
                  <option value="unit">unit</option>
                  <option value="oz">oz</option>
                  <option value="lb">lb</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="cup">cup</option>
                  <option value="tbsp">tbsp</option>
                  <option value="tsp">tsp</option>
                </select>
              ) : (
                <p>{editedIngredient.unit}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm font-semibold">Status</p>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button 
                    onClick={markAsBought}
                    className={`px-3 py-1 rounded ${editedIngredient.status.startsWith('Bought') ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                  >
                    Mark as Bought
                  </button>
                  <button 
                    onClick={markAsNeedToBuy}
                    className={`px-3 py-1 rounded ${editedIngredient.status === 'Need to buy' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                  >
                    Need to Buy
                  </button>
                </div>
              </div>
            ) : (
              <p className={`${editedIngredient.status.startsWith('Bought') ? 'text-green-500' : 'text-yellow-500'} font-medium`}>
                {editedIngredient.status}
              </p>
            )}
          </div>

          {/* Shelf Life */}
          <div>
            <p className="text-sm font-semibold">Shelf Life (days)</p>
            {isEditing ? (
              <input 
                type="number" 
                value={editedIngredient.shelf_life} 
                onChange={(e) => handleChange(e, 'shelf_life')} 
                className="border p-1 w-16 rounded-md" 
              />
            ) : (
              <p>{editedIngredient.shelf_life} days</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4 space-x-2">
            {!isAdding && (
              <button 
                onClick={() => onDelete(editedIngredient._id || editedIngredient.name)} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
            {isEditing && (
              <>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { onSave(editedIngredient); setIsEditing(false); }} 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
                >
                  {isAdding ? 'Add' : 'Save'}
                </button>
              </>
            )}
        </div>
      </div>
    </div>
  );
}