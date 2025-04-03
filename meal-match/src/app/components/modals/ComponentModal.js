import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, X, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const nameInputRef = useRef(null);

  // Focus on name input when modal opens
  useEffect(() => {
    if (isAdding && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isAdding]);

  const handleChange = (e, field) => {
    // Convert number fields from string to number and ensure non-negative values
    if (['servings', 'prep_time', 'calories', 'protein', 'carbs', 'fat'].includes(field)) {
      const value = Number(e.target.value);
      // Only update if value is non-negative
      if (value >= 0 || e.target.value === '') {
        setEditedComponent({ 
          ...editedComponent, 
          [field]: e.target.value === '' ? '' : value 
        });
      }
    } else {
      setEditedComponent({ ...editedComponent, [field]: e.target.value });
    }
  };

  // Before saving, ensure all numeric fields have valid values (at least 0)
  const validateAndSave = () => {
    const numericFields = ['servings', 'prep_time', 'calories', 'protein', 'carbs', 'fat'];
    const validatedComponent = { ...editedComponent };
    
    // Ensure all numeric fields are at least 0
    numericFields.forEach(field => {
      if (validatedComponent[field] === '' || validatedComponent[field] < 0) {
        validatedComponent[field] = 0;
      }
    });
    
    onSave(validatedComponent);
    setIsEditing(false);
  };

  const toggleFavorite = async () => {
    // Toggle the local state for immediate feedback
    setEditedComponent({ ...editedComponent, favorite: !editedComponent.favorite });
    
    if (!editedComponent._id) return; // Skip if component has no ID yet
    
    try {
      if (!editedComponent.favorite) {
        // Add to favorites
        await fetch('/api/favorites/component', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: editedComponent.userId,
            componentId: editedComponent._id
          })
        });
      } else {
        // Remove from favorites
        await fetch(`/api/favorites/component?componentId=${editedComponent._id}&userId=${editedComponent.userId}`, {
          method: 'DELETE'
        });
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      // Revert the local state change if the API call failed
      setEditedComponent({ ...editedComponent, favorite: !editedComponent.favorite });
    }
  };

  const handleKeyDown = (e) => {
    // Save on Ctrl+Enter or Command+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      validateAndSave();
    }
    // Close on Escape
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4" onKeyDown={handleKeyDown}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold">{isAdding ? "Add New Component" : (isEditing ? "Edit Component" : editedComponent.name)}</h2>
          <div className="flex items-center gap-3">
            {!isEditing && <Pencil className="w-5 h-5 cursor-pointer text-gray-600 hover:text-black" onClick={() => setIsEditing(true)} />}
            <X className="w-6 h-6 cursor-pointer text-gray-600 hover:text-black" onClick={onClose} />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow mt-3 pr-2 max-h-[50vh] space-y-4">
          {/* Essential Fields */}
          <div className="space-y-4">
            {/* Name - shown only in edit mode */}
            {isEditing &&
              <div>
                <p className="text-sm font-semibold flex items-center">
                  Name <span className="text-red-500 ml-1">*</span>
                </p>             
                <input
                  ref={nameInputRef}
                  type="text"
                  value={editedComponent.name}
                  onChange={(e) => handleChange(e, 'name')}
                  className="border p-1 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" 
                  placeholder="e.g., Grilled Chicken Breast"
                  required
                />
              </div>
            }
            
            {/* Servings */}
            {isEditing && (
              <div>
                <p className="text-sm font-semibold">Number of Servings</p>
                <input 
                  type="number" 
                  value={editedComponent.servings} 
                  onChange={(e) => handleChange(e, 'servings')} 
                  className="border p-1 w-24 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" 
                  min="0"
                  onBlur={() => {
                    if (editedComponent.servings === '' || editedComponent.servings < 0) {
                      setEditedComponent({...editedComponent, servings: 0});
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Advanced Fields Toggle */}
          <div 
            className="flex items-center justify-between cursor-pointer text-orange-600 hover:text-orange-700 border-t border-b py-2"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span className="font-medium">Advanced Details {showAdvanced ? '(Hide)' : '(Show)'}</span>
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {/* Advanced Fields (collapsible) */}
          {showAdvanced && (
            <div className="space-y-4 pt-2">
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
                          className="border p-1 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          placeholder={`Ingredient ${index + 1}`}
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
                    })} className="text-blue-600 hover:underline mt-2 text-sm">
                      + Add Ingredient
                    </button>
                  </div>
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {editedComponent.ingredients.length > 0 && editedComponent.ingredients[0] !== '' ? (
                      editedComponent.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient || "Unnamed ingredient"}</li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">No ingredients listed</li>
                    )}
                  </ul>
                )}
              </div>

              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-semibold">Details</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-gray-600">Prep Time (minutes)</p>
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={editedComponent.prep_time} 
                        onChange={(e) => handleChange(e, 'prep_time')} 
                        className="border p-1 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1" 
                        min="0"
                        onBlur={() => {
                          if (editedComponent.prep_time === '' || editedComponent.prep_time < 0) {
                            setEditedComponent({...editedComponent, prep_time: 0});
                          }
                        }}
                      />
                    ) : (
                      <p className="text-sm">{editedComponent.prep_time} minutes</p>
                    )}
                  </div>

                  {!isEditing && (
                    <div>
                      <p className="text-xs text-gray-600">Favorite</p>
                      <p className="text-sm">{editedComponent.favorite ? "Yes" : "No"}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nutrition Information */}
              <div>
                <h3 className="text-sm font-semibold">Nutrition Information</h3>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-gray-600">Calories</p>
                      <input 
                        type="number" 
                        value={editedComponent.calories} 
                        onChange={(e) => handleChange(e, 'calories')} 
                        className="border p-1 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1" 
                        min="0"
                        onBlur={() => {
                          if (editedComponent.calories === '' || editedComponent.calories < 0) {
                            setEditedComponent({...editedComponent, calories: 0});
                          }
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Protein (g)</p>
                      <input 
                        type="number" 
                        value={editedComponent.protein} 
                        onChange={(e) => handleChange(e, 'protein')} 
                        className="border p-1 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1" 
                        min="0"
                        onBlur={() => {
                          if (editedComponent.protein === '' || editedComponent.protein < 0) {
                            setEditedComponent({...editedComponent, protein: 0});
                          }
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Carbs (g)</p>
                      <input 
                        type="number" 
                        value={editedComponent.carbs} 
                        onChange={(e) => handleChange(e, 'carbs')} 
                        className="border p-1 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1" 
                        min="0"
                        onBlur={() => {
                          if (editedComponent.carbs === '' || editedComponent.carbs < 0) {
                            setEditedComponent({...editedComponent, carbs: 0});
                          }
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Fat (g)</p>
                      <input 
                        type="number" 
                        value={editedComponent.fat} 
                        onChange={(e) => handleChange(e, 'fat')} 
                        className="border p-1 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1" 
                        min="0"
                        onBlur={() => {
                          if (editedComponent.fat === '' || editedComponent.fat < 0) {
                            setEditedComponent({...editedComponent, fat: 0});
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-sm mt-1">
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
                    className="border p-1 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1" 
                    placeholder="e.g., gluten-free, vegan, etc."
                  />
                ) : (
                  <p className="text-sm mt-1">{editedComponent.dietary_restrictions || 'None'}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold">Notes</h3>
                {isEditing ? (
                  <textarea
                    value={editedComponent.notes}
                    onChange={(e) => handleChange(e, 'notes')}
                    className="border p-1 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1"
                    rows={3}
                    placeholder="Add preparation notes or instructions..."
                  />
                ) : (
                  <p className="text-sm mt-1">{editedComponent.notes || 'No notes added.'}</p>
                )}
              </div>
            </div>
          )}

          {/* Favorite Toggle - edit mode only */}
          {isEditing && (
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="favorite"
                checked={editedComponent.favorite}
                onChange={toggleFavorite}
                className="mr-2"
              />
              <label htmlFor="favorite" className="text-sm">Mark as Favorite</label>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        {isEditing && (
          <div className="text-xs text-gray-500 mt-2 text-center border-t pt-2">
            Press <kbd className="px-1 py-0.5 border rounded">Ctrl + Enter</kbd> to save, <kbd className="px-1 py-0.5 border rounded">Esc</kbd> to cancel
          </div>
        )}

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