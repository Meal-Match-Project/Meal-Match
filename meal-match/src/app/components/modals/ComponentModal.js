import { useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';

export default function ComponentModal({ component, onSave, onDelete, onClose, isAdding }) {
  const [editedComponent, setEditedComponent] = useState({ ...component });
  const [isEditing, setIsEditing] = useState(isAdding);

  const handleChange = (e, field) => {
    setEditedComponent({ ...editedComponent, [field]: e.target.value });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          {isEditing ? (
            <input
              type="text"
              value={editedComponent.name}
              placeholder="Component Name"
              onChange={(e) => handleChange(e, 'name')}
              className="text-xl font-bold border-b-2 border-gray-300 w-full focus:outline-none focus:border-blue-500"
            />
          ) : (
            <h2 className="text-xl font-bold">{editedComponent.name}</h2>
          )}
          <div className="flex items-center gap-3">
            {!isEditing && <Pencil className="w-5 h-5 cursor-pointer text-gray-600 hover:text-black" onClick={() => setIsEditing(true)} />}
            <X className="w-6 h-6 cursor-pointer text-gray-600 hover:text-black" onClick={onClose} />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow mt-3 pr-2 max-h-[50vh] space-y-4">
          <div>
            <p className="text-sm font-semibold">Servings</p>
            {isEditing ? (
              <input type="number" value={editedComponent.servings} onChange={(e) => handleChange(e, 'servings')} className="border p-1 w-16 rounded-md" />
            ) : (
              <p>{editedComponent.servings}</p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Prep Time</p>
            {isEditing ? (
              <input type="text" value={editedComponent.prepTime} onChange={(e) => handleChange(e, 'prepTime')} className="border p-1 w-32 rounded-md" />
            ) : (
              <p>{editedComponent.prepTime}</p>
            )}
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-sm font-semibold">Ingredients</h3>
            {isEditing ? (
              <div className="space-y-2">
                {editedComponent.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => {
                        const updatedIngredients = [...editedComponent.ingredients];
                        updatedIngredients[index] = e.target.value;
                        setEditedComponent({ ...editedComponent, ingredients: updatedIngredients });
                      }}
                      className="border p-1 w-full rounded-md"
                    />
                    <button onClick={() => setEditedComponent({
                      ...editedComponent,
                      ingredients: editedComponent.ingredients.filter((_, i) => i !== index)
                    })} className="text-red-500 hover:text-red-700">
                      ✕
                    </button>
                  </div>
                ))}
                <button onClick={() => setEditedComponent({
                  ...editedComponent,
                  ingredients: [...editedComponent.ingredients, '']
                })} className="text-blue-600 hover:underline mt-2">
                  + Add Ingredient
                </button>
              </div>
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {editedComponent.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold">Notes</h3>
            {isEditing ? (
              <textarea
                value={editedComponent.notes}
                onChange={(e) => handleChange(e, 'notes')}
                className="border p-1 w-full rounded-md"
              />
            ) : (
              <p className="text-sm">{editedComponent.notes || 'No notes added.'}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4 space-x-2">
            <button onClick={() => onDelete(editedComponent.name)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> Delete
            </button>
            {isEditing && (
                <>
                <button onClick={() => setIsEditing(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition">
                    Cancel
                </button>
                <button onClick={() => { onSave(editedComponent); setIsEditing(false); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition">
                    Save
                </button>
                </>
            )}
          
        </div>
      </div>
    </div>
  );
}
