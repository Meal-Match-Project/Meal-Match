'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown, ChevronUp, Trash2, Edit, Save } from 'lucide-react';
import { updateTemplate } from '@/services/apiService';

export default function TemplateDetailModal({ template, userId, onClose, onDelete, onImport, onUpdate }) {
  const [expandedDay, setExpandedDay] = useState(
    template.days && template.days.length > 0 ? template.days[0].day_of_week : null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: template.name || '',
    description: template.description || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Check if the current user is the owner of the template
  const isOwner = template.user_id === userId;
  
  // Update form data when template changes
  useEffect(() => {
    setEditFormData({
      name: template.name || '',
      description: template.description || ''
    });
  }, [template]);
  
  const toggleDay = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      name: template.name || '',
      description: template.description || ''
    });
    setError('');
  };
  
  const handleSave = async () => {
    // Basic validation
    if (!editFormData.name.trim()) {
      setError('Template name is required');
      return;
    }
    
    try {
      setIsSaving(true);
      setError('');
      
      const result = await updateTemplate(template._id, {
        name: editFormData.name.trim(),
        description: editFormData.description.trim(),
        userId: userId // Required for authorization check
      });
      
      if (result.success) {
        setIsEditing(false);
        if (onUpdate && typeof onUpdate === 'function') {
          onUpdate(result.template);
        }
      } else {
        setError(result.error || 'Failed to update template');
      }
    } catch (err) {
      setError('An error occurred while saving template');
      console.error('Error saving template:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          {isEditing ? (
            <div className="w-full">
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleChange}
                className="text-2xl font-bold w-full border-b border-orange-300 focus:outline-none focus:border-orange-500 pb-1"
                placeholder="Template name"
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
          ) : (
            <h2 className="text-2xl font-bold">{template.name}</h2>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-4"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content - scrollable */}
        <div className="flex-grow overflow-y-auto p-6">
          {isEditing ? (
            <textarea
              name="description"
              value={editFormData.description}
              onChange={handleChange}
              className="w-full border rounded-md p-3 text-gray-700 mb-6 min-h-[100px] focus:outline-none focus:border-orange-500"
              placeholder="Template description"
            />
          ) : (
            <p className="text-gray-700 mb-6">{template.description}</p>
          )}
          
          {/* Meal Plan Schedule */}
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Weekly Meal Plan
          </h3>
          
          <div className="space-y-4 mb-6">
            {(template.days || []).map((day, dayIndex) => (
              <div key={dayIndex} className="border rounded-lg overflow-hidden">
                {/* Day Header */}
                <div 
                  className={`flex justify-between items-center p-3 cursor-pointer ${
                    expandedDay === day.day_of_week ? 'bg-orange-50' : 'bg-gray-50'
                  }`}
                  onClick={() => toggleDay(day.day_of_week)}
                >
                  <h4 className="font-medium">{day.day_of_week}</h4>
                  {expandedDay === day.day_of_week ? 
                    <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  }
                </div>
                
                {/* Day Content */}
                {expandedDay === day.day_of_week && (
                  <div className="p-4 space-y-4">
                    {day.meals && day.meals.map((mealData, mealIndex) => (
                      <div key={mealIndex}>
                        <h5 className="font-medium text-sm text-gray-700 mb-2">
                          {mealData.meal_type || 'Meal'}
                        </h5>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="font-medium">{mealData.meal.name}</p>
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-600">Components:</p>
                            <ul className="list-disc list-inside text-sm ml-2">
                              {mealData.meal.components.map((component, idx) => (
                                <li key={idx}>{component}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Components List */}
          <h3 className="font-bold text-lg mb-3">Components Used</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(template.components_to_prepare ? 
              template.components_to_prepare.map(component => component.name) : 
              template.components_used || []
            ).map((component, idx) => (
              <li key={idx} className="text-sm">• {component}</li>
            ))}
            </ul>
          </div>
        </div>
        
        {/* Footer with buttons */}
        <div className="p-6 border-t flex justify-between gap-3">
          <div>
            {/* Show delete button if onDelete is provided (user is the owner) */}
            {isOwner && !isEditing && (
              <button
                onClick={() => onDelete()}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Template
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className={`px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center ${
                    isSaving ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                {isOwner && (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Template
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onImport}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
                >
                  Apply to My Meal Plan
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}