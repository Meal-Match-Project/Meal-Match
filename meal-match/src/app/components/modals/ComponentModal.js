import { useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';

export default function ComponentModal({ component, onSave, onDelete, onClose, isAdding }) {
  // Initialize with empty component if needed
  const defaultComponent = {
    name: '',
    servings: 1,
    prep_time: 0,
    ingredients: [''],
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: '',
    dietary_restrictions: '',
    favorite: false
  };
  
  const [editedComponent, setEditedComponent] = useState({ ...defaultComponent, ...component });
  const [isEditing, setIsEditing] = useState(isAdding);

  const handleChange = (e, field) => {
    // Convert number fields from string to number
    if (['servings', 'prep_time', 'calories', 'protein', 'carbs', 'fat'].includes(field)) {
      setEditedComponent({ ...editedComponent, [field]: Number(e.target.value) });
    } else {
      setEditedComponent({ ...editedComponent, [field]: e.target.value });
    }
  };

  const toggleFavorite = () => {
    setEditedComponent({ ...editedComponent, favorite: !editedComponent.favorite });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold">{isEditing ? "Edit Component" : editedComponent.name}</h2>
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
                value={editedComponent.name}
                onChange={(e) => handleChange(e, 'name')}
                className="border p-1 w-full rounded-md" 
              />
            </div>
          }
          
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Servings</p>
              {isEditing ? (
                <input 
                  type="number" 
                  value={editedComponent.servings} 
                  onChange={(e) => handleChange(e, 'servings')} 
                  className="border p-1 w-16 rounded-md" 
                />
              ) : (
                <p>{editedComponent.servings}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Prep Time</p>
              {isEditing ? (
                <input 
                  type="number" 
                  value={editedComponent.prep_time} 
                  onChange={(e) => handleChange(e, 'prep_time')} 
                  className="border p-1 w-32 rounded-md" 
                />
              ) : (
                <p>{editedComponent.prep_time} minutes</p>
              )}
            </div>
          </div>

          {/* Favorite Status - shown in view mode */}
          {!isEditing && (
            <div>
              <p className="text-sm font-semibold">Favorite</p>
              <p>{editedComponent.favorite ? "Yes" : "No"}</p>
            </div>
          )}

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
                {editedComponent.ingredients.length > 0 ? (
                  editedComponent.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient || "Unnamed ingredient"}</li>
                  ))
                ) : (
                  <li className="text-gray-500 italic">No ingredients listed</li>
                )}
              </ul>
            )}
          </div>

          {/* Nutrition Information */}
          <div>
            <h3 className="text-sm font-semibold">Nutrition Information</h3>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold">Calories</p>
                  <input 
                    type="number" 
                    value={editedComponent.calories} 
                    onChange={(e) => handleChange(e, 'calories')} 
                    className="border p-1 w-full rounded-md" 
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">Protein (g)</p>
                  <input 
                    type="number" 
                    value={editedComponent.protein} 
                    onChange={(e) => handleChange(e, 'protein')} 
                    className="border p-1 w-full rounded-md" 
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">Carbs (g)</p>
                  <input 
                    type="number" 
                    value={editedComponent.carbs} 
                    onChange={(e) => handleChange(e, 'carbs')} 
                    className="border p-1 w-full rounded-md" 
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">Fat (g)</p>
                  <input 
                    type="number" 
                    value={editedComponent.fat} 
                    onChange={(e) => handleChange(e, 'fat')} 
                    className="border p-1 w-full rounded-md" 
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Calories:</strong> {editedComponent.calories || 0}</p>
                <p><strong>Protein:</strong> {editedComponent.protein || 0}g</p>
                <p><strong>Carbs:</strong> {editedComponent.carbs || 0}g</p>
                <p><strong>Fat:</strong> {editedComponent.fat || 0}g</p>
              </div>
            )}
          </div>

          {/* Dietary Restrictions */}
          <div>
            <p className="text-sm font-semibold">Dietary Restrictions</p>
            {isEditing ? (
              <input 
                type="text" 
                value={editedComponent.dietary_restrictions} 
                onChange={(e) => handleChange(e, 'dietary_restrictions')} 
                className="border p-1 w-full rounded-md" 
                placeholder="e.g., gluten-free, vegan, etc."
              />
            ) : (
              <p className="text-sm">{editedComponent.dietary_restrictions || 'None'}</p>
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

          {/* Favorite Toggle - edit mode only */}
          {isEditing && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="favorite"
                checked={editedComponent.favorite}
                onChange={toggleFavorite}
                className="mr-2"
              />
              <label htmlFor="favorite" className="text-sm font-semibold">Mark as Favorite</label>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4 space-x-2">
            {!isAdding && (
              <button 
                onClick={() => onDelete(editedComponent._id || editedComponent.name)} 
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
                  onClick={() => { onSave(editedComponent); setIsEditing(false); }} 
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