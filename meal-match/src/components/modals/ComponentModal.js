import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, X, Archive, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { addComponentFavorite, removeComponentFavorite } from '@/services/apiService';
import NotificationToast from '@/components/ui/NotificationToast';

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
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const nameInputRef = useRef(null);
  
  // Toast notification states
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Focus on name input when modal opens or switches to edit mode
  useEffect(() => {
    if ((isAdding || isEditing) && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isAdding, isEditing]);

  const handleChange = (e, field) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }

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

  // Validate component before saving
  const validateComponent = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!editedComponent.name.trim()) {
      newErrors.name = 'Component name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Before saving, ensure all numeric fields have valid values (at least 0)
  const validateAndSave = () => {
    if (!validateComponent()) return;
    
    setIsLoading(true);
    
    const numericFields = ['servings', 'prep_time', 'calories', 'protein', 'carbs', 'fat'];
    const validatedComponent = { ...editedComponent };
    
    // Ensure all numeric fields are at least 0
    numericFields.forEach(field => {
      if (validatedComponent[field] === '' || validatedComponent[field] < 0) {
        validatedComponent[field] = 0;
      }
    });
    
    // Clean up any empty ingredients
    validatedComponent.ingredients = validatedComponent.ingredients
      .filter(ingredient => ingredient.trim() !== '');
    
    // If ingredients array is empty, add one empty string
    if (validatedComponent.ingredients.length === 0) {
      validatedComponent.ingredients = [''];
    }
    
    try {
      onSave(validatedComponent);
      setNotification({
        show: true,
        message: isAdding ? 'Component added successfully!' : 'Component updated successfully!',
        type: 'success'
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving component:", error);
      setErrors({ global: 'Failed to save component. Please try again.' });
      setNotification({
        show: true,
        message: 'Failed to save component. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    // Toggle the local state for immediate feedback
    setEditedComponent({ ...editedComponent, favorite: !editedComponent.favorite });
    
    if (!editedComponent._id || !editedComponent.userId) return; // Skip if component has no ID or userId
    
    try {
      if (!editedComponent.favorite) {
        // Add to favorites - use apiService instead of direct fetch
        await addComponentFavorite(editedComponent.userId, editedComponent._id);
      } else {
        // Remove from favorites - use apiService instead of direct fetch
        await removeComponentFavorite(editedComponent.userId, editedComponent._id);
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      // Revert the local state change if the API call failed
      setEditedComponent({ ...editedComponent, favorite: !editedComponent.favorite });
      setNotification({
        show: true,
        message: 'Failed to update favorite status.',
        type: 'error'
      });
    }
  };

  const handleDeleteClick = () => {
    // Validate that we have a proper ID before attempting to delete
    if (!editedComponent._id) {
      setErrors({ global: 'Cannot delete a component that hasn\'t been saved yet.' });
      setNotification({
        show: true,
        message: 'Cannot delete a component that hasn\'t been saved yet.',
        type: 'error'
      });
      return;
    }
    
    // Check if it's a valid MongoDB ObjectId format (24 hex characters)
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(editedComponent._id)) {
      setErrors({ global: 'Invalid component ID format.' });
      setNotification({
        show: true,
        message: 'Invalid component ID format.',
        type: 'error'
      });
      return;
    }
    
    // Directly delete the component without confirmation
    setIsLoading(true);
    try {
      onDelete(editedComponent._id);
      // Toast will be shown in the parent component after successful deletion
    } catch (error) {
      console.error("Error deleting component:", error);
      setErrors({ global: 'Failed to delete component. Please try again.' });
      setNotification({
        show: true,
        message: 'Failed to delete component. Please try again.',
        type: 'error'
      });
      setIsLoading(false);
    }
  };

  const handleSaveForLater = () => {
    const updatedComponent = { ...editedComponent, servings: 0 };
    setIsLoading(true);
    try {
      onSave(updatedComponent);
      setNotification({
        show: true,
        message: 'Component saved for later successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error("Error saving component for later:", error);
      setErrors({ global: 'Failed to save component for later. Please try again.' });
      setNotification({
        show: true,
        message: 'Failed to save component for later. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
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

  // Helper function to add a new ingredient
  const addIngredient = () => {
    setEditedComponent({
      ...editedComponent,
      ingredients: [...editedComponent.ingredients, '']
    });
  };

  // Helper function to remove an ingredient
  const removeIngredient = (index) => {
    setEditedComponent({
      ...editedComponent,
      ingredients: editedComponent.ingredients.filter((_, i) => i !== index)
    });
  };

  // Helper function to update an ingredient
  const updateIngredient = (index, value) => {
    const updatedIngredients = [...editedComponent.ingredients];
    updatedIngredients[index] = value;
    setEditedComponent({ ...editedComponent, ingredients: updatedIngredients });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4" onKeyDown={handleKeyDown}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold">{isAdding ? "Add New Component" : (isEditing ? "Edit Component" : editedComponent.name)}</h2>
          <div className="flex items-center gap-3">
            {!isEditing && <Pencil className="w-5 h-5 cursor-pointer text-gray-600 hover:text-black" onClick={() => setIsEditing(true)} />}
            <X className="w-6 h-6 cursor-pointer text-gray-600 hover:text-black" onClick={onClose} />
          </div>
        </div>

        {/* Global Error */}
        {errors.global && (
          <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{errors.global}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow mt-3 pr-2 max-h-[60vh] space-y-4">
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
                  className={`border p-2 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g., Grilled Chicken Breast"
                  required
                  disabled={isLoading}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
                  className="border p-2 w-24 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" 
                  min="0"
                  disabled={isLoading}
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
                  <div className="space-y-2 mt-2">
                    {editedComponent.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                          className="border p-2 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          placeholder={`Ingredient ${index + 1}`}
                          disabled={isLoading}
                        />
                        <button 
                          onClick={() => removeIngredient(index)} 
                          disabled={isLoading || editedComponent.ingredients.length <= 1}
                          className={`text-red-500 hover:text-red-700 p-1 rounded ${editedComponent.ingredients.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={editedComponent.ingredients.length <= 1 ? "At least one ingredient is required" : "Remove ingredient"}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={addIngredient} 
                      className="text-blue-600 hover:underline mt-2 text-sm flex items-center"
                      disabled={isLoading}
                    >
                      <span className="mr-1">+</span> Add Ingredient
                    </button>
                  </div>
                ) : (
                  <ul className="list-disc pl-5 text-sm mt-2">
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
                        className="border p-2 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1" 
                        min="0"
                        disabled={isLoading}
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
                        className="border p-2 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1" 
                        min="0"
                        disabled={isLoading}
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
                        className="border p-2 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1" 
                        min="0"
                        disabled={isLoading}
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
                        className="border p-2 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1" 
                        min="0"
                        disabled={isLoading}
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
                        className="border p-2 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1" 
                        min="0"
                        disabled={isLoading}
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
                    className="border p-2 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1" 
                    placeholder="e.g., gluten-free, vegan, etc."
                    disabled={isLoading}
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
                    className="border p-2 w-full rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none mt-1"
                    rows={3}
                    placeholder="Add preparation notes or instructions..."
                    disabled={isLoading}
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
                disabled={isLoading}
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
            {!isAdding && !isEditing && editedComponent.servings > 0 && (
              <button 
                onClick={handleSaveForLater} 
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition flex items-center gap-1"
                disabled={isLoading}
              >
                <Archive className="w-4 h-4" />
                <span className="ml-1">Save for Later</span>
              </button>
            )}
            {!isAdding && (
              <button 
                onClick={handleDeleteClick} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition flex items-center gap-1"
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
            {isEditing && (
              <>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  onClick={validateAndSave} 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    isAdding ? 'Add' : 'Save'
                  )}
                </button>
              </>
            )}
        </div>
      </div>

      {/* Notification Toast */}
      <NotificationToast
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
}