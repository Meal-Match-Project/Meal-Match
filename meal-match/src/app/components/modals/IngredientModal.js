import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';

export default function IngredientModal({ ingredient, onSave, onDelete, onClose, isAdding }) {
  // Initialize with empty ingredient if needed
  const defaultIngredient = {
    name: '',
    amount: 1,
    unit: 'unit',
    status: 'to-buy',
    shelf_life: 7,
  };
  
  const [editedIngredient, setEditedIngredient] = useState({ ...defaultIngredient, ...ingredient });
  const [isEditing, setIsEditing] = useState(isAdding);
  const nameInputRef = useRef(null);

  // Focus on name input when modal opens
  useEffect(() => {
    if (isAdding && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isAdding]);

  const handleChange = (e, field) => {
    // Convert number fields from string to number and ensure non-negative values
    if (['amount', 'shelf_life'].includes(field)) {
      const value = Number(e.target.value);
      // Only update if value is non-negative or empty (for typing)
      if (value >= 0 || e.target.value === '') {
        setEditedIngredient({ 
          ...editedIngredient, 
          [field]: e.target.value === '' ? '' : value 
        });
      }
    } else {
      setEditedIngredient({ ...editedIngredient, [field]: e.target.value });
    }
  };

  // Validate numeric fields before saving
  const validateAndSave = () => {
    const numericFields = ['amount', 'shelf_life'];
    const validatedIngredient = { ...editedIngredient };
    
    // Ensure all numeric fields are at least 0
    numericFields.forEach(field => {
      if (validatedIngredient[field] === '' || validatedIngredient[field] < 0) {
        validatedIngredient[field] = 0;
      }
    });
    
    onSave(validatedIngredient);
    setIsEditing(false);
  };

  // Mark as bought with today's date
  const markAsBought = () => {
    const today = new Date();
    setEditedIngredient({ 
      ...editedIngredient, 
      status: 'in-stock',
      purchase_date: today.toISOString()
    });
  };

  // Mark as needing to buy
  const markAsNeedToBuy = () => {
    setEditedIngredient({ 
      ...editedIngredient, 
      status: 'to-buy',
      purchase_date: null
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
                ref={nameInputRef}
                type="text"
                value={editedIngredient.name}
                onChange={(e) => handleChange(e, 'name')}
                className="border p-1 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g., Chicken breast"
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
                  className="border p-1 w-16 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" 
                  min="0"
                  onBlur={() => {
                    if (editedIngredient.amount === '' || editedIngredient.amount < 0) {
                      setEditedIngredient({...editedIngredient, amount: 0});
                    }
                  }}
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
                  className="border p-1 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                    className={`px-3 py-1 rounded ${editedIngredient.status === 'in-stock' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                  >
                    Mark as Bought
                  </button>
                  <button 
                    onClick={markAsNeedToBuy}
                    className={`px-3 py-1 rounded ${editedIngredient.status === 'to-buy' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                  >
                    Need to Buy
                  </button>
                </div>
              </div>
            ) : (
              <p className={`${editedIngredient.status === 'in-stock' ? 'text-green-500' : 'text-yellow-500'} font-medium`}>
                {editedIngredient.status === 'in-stock' ? 'In Stock' : 'Need to Buy'}
                {editedIngredient.purchase_date && (
                  <span className="text-xs ml-2 text-gray-500">
                    (Purchased: {new Date(editedIngredient.purchase_date).toLocaleDateString()})
                  </span>
                )}
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
                className="border p-1 w-16 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" 
                min="0"
                onBlur={() => {
                  if (editedIngredient.shelf_life === '' || editedIngredient.shelf_life < 0) {
                    setEditedIngredient({...editedIngredient, shelf_life: 0});
                  }
                }}
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
                  onClick={validateAndSave} 
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