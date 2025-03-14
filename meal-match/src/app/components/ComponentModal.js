import { useState } from 'react';
import { Pencil } from 'lucide-react';

export default function ComponentModal({ component, onSave, onDelete, onClose, isAdding }) {
  const [editedComponent, setEditedComponent] = useState({ ...component });
  const [isEditing, setIsEditing] = useState(isAdding);

  const handleChange = (e, field) => {
    setEditedComponent({ ...editedComponent, [field]: e.target.value });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center">
          {isEditing ? (
            <input
              type="text"
              value={editedComponent.name}
              placeholder="Component Name"
              onChange={(e) => handleChange(e, 'name')}
              className="text-xl font-bold border-b-2 border-gray-300 w-full"
            />
          ) : (
            <h2 className="text-xl font-bold">{editedComponent.name}</h2>
          )}
          <div className="ml-auto items-center flex gap-4">
            {isEditing === false && (
                <Pencil className="w-6 h-6 cursor-pointer" onClick={() => setIsEditing(true)}></Pencil>
            )}
            <button onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow mt-2 pr-2 max-h-[50vh]">
          <p>
            <strong>Servings:</strong>{' '}
            {isEditing ? (
              <input type="number" value={editedComponent.servings} onChange={(e) => handleChange(e, 'servings')} className="border p-1 w-16" />
            ) : (
              editedComponent.servings
            )}
          </p>

          <p>
            <strong>Prep Time:</strong>{' '}
            {isEditing ? (
              <input type="text" value={editedComponent.prepTime} onChange={(e) => handleChange(e, 'prepTime')} className="border p-1 w-32" />
            ) : (
              editedComponent.prepTime
            )}
          </p>

          {/* Ingredients */}
          <h3 className="mt-4 font-semibold">Ingredients:</h3>
          {isEditing ? (
            <div>
              {editedComponent.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => {
                      const updatedIngredients = [...editedComponent.ingredients];
                      updatedIngredients[index] = e.target.value;
                      setEditedComponent({ ...editedComponent, ingredients: updatedIngredients });
                    }}
                    className="border p-1 w-full"
                  />
                  <button onClick={() => setEditedComponent({
                    ...editedComponent,
                    ingredients: editedComponent.ingredients.filter((_, i) => i !== index)
                  })} className="text-red-600 font-bold">✕</button>
                </div>
              ))}
              <button onClick={() => setEditedComponent({
                ...editedComponent,
                ingredients: [...editedComponent.ingredients, '']
              })} className="text-green-600 mt-2">+ Add Ingredient</button>
            </div>
          ) : (
            <ul className="list-disc pl-5">
              {editedComponent.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          )}
          {/* Notes */}
            <h3 className="mt-4 font-semibold">Notes:</h3>
            {isEditing ? (
              <textarea
                value={editedComponent.notes}
                onChange={(e) => handleChange(e, 'notes')}
                className="border p-1 w-full"
              />
            ) : (
              <p>{editedComponent.notes}</p>
            )}
        </div>

        {/* Buttons */}
        <div className="justify-end mt-4 flex gap-2">
          {isEditing && (
            <>
            <button onClick={() => { onSave(editedComponent); setIsEditing(false); }} className="bg-green-600 text-white px-4 py-1 rounded-lg">Save Changes</button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-600 text-white px-4 py-1 rounded-lg">Cancel</button>
            </>
          )}
          <button onClick={() => onDelete(editedComponent.name)} className="rounded-lg bg-red-600 text-white px-4 py-1 ">Delete</button>
          
        </div>
      </div>
    </div>
  );
}
