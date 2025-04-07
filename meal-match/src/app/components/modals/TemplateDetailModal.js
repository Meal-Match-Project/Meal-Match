'use client';

import { useState } from 'react';
import { X, Calendar, Clock, Tag, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function TemplateDetailModal({ template, onClose, onImport, userPreferences, userAllergies }) {
  const [expandedDay, setExpandedDay] = useState("Monday");
  
  // Check for potential allergen conflicts
  const potentialAllergens = [];
  if (userAllergies && userAllergies.length > 0) {
    // This is a simplified check - in a real app you'd want to do deeper ingredient analysis
    template.components_used.forEach(component => {
      userAllergies.forEach(allergen => {
        if (component.toLowerCase().includes(allergen.toLowerCase())) {
          potentialAllergens.push({
            component,
            allergen
          });
        }
      });
    });
  }
  
  // Format nutritional info
  const nutritionInfo = {
    calories: template.calories_per_day || 0,
    protein: template.protein_per_day || 0,
    // Add more nutritional info as needed
  };
  
  const toggleDay = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">{template.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content - scrollable */}
        <div className="flex-grow overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2">
              <p className="text-gray-700 mb-6">{template.description}</p>
              
              {/* Warning for potential allergens */}
              {potentialAllergens.length > 0 && (
                <div className="mb-6 bg-yellow-50 border border-yellow-100 text-yellow-800 p-4 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Potential Allergen Warning</h4>
                      <p className="text-sm">
                        This template contains components that may include your allergens:
                      </p>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {potentialAllergens.map((item, index) => (
                          <li key={index}>
                            {item.component} (may contain {item.allergen})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Meal Plan Schedule */}
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Weekly Meal Plan
              </h3>
              
              <div className="space-y-4 mb-6">
                {template.days.map((day) => (
                  <div key={day.day} className="border rounded-lg overflow-hidden">
                    {/* Day Header */}
                    <div 
                      className={`flex justify-between items-center p-3 cursor-pointer ${
                        expandedDay === day.day ? 'bg-orange-50' : 'bg-gray-50'
                      }`}
                      onClick={() => toggleDay(day.day)}
                    >
                      <h4 className="font-medium">{day.day}</h4>
                      {expandedDay === day.day ? 
                        <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      }
                    </div>
                    
                    {/* Day Content */}
                    {expandedDay === day.day && (
                      <div className="p-4 space-y-4">
                        {/* Lunch */}
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Lunch</h5>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="font-medium">{day.lunch.name}</p>
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-600">Components:</p>
                              <ul className="list-disc list-inside text-sm ml-2">
                                {day.lunch.components.map((component, idx) => (
                                  <li key={idx}>{component}</li>
                                ))}
                              </ul>
                            </div>
                            {day.lunch.notes && (
                              <p className="mt-2 text-sm text-gray-600">{day.lunch.notes}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Dinner */}
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Dinner</h5>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="font-medium">{day.dinner.name}</p>
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-600">Components:</p>
                              <ul className="list-disc list-inside text-sm ml-2">
                                {day.dinner.components.map((component, idx) => (
                                  <li key={idx}>{component}</li>
                                ))}
                              </ul>
                            </div>
                            {day.dinner.notes && (
                              <p className="mt-2 text-sm text-gray-600">{day.dinner.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Column - Summary & Stats */}
            <div className="space-y-6">
              <div className="bg-orange-50 p-5 rounded-lg">
                <h3 className="font-bold text-lg mb-4">Template Summary</h3>
                
                <div className="space-y-4">
                  {/* Prep Time */}
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-orange-500 mr-3" />
                    <div>
                      <p className="font-medium">Total Weekly Prep</p>
                      <p className="text-sm text-gray-600">{template.prep_time} minutes</p>
                    </div>
                  </div>
                  
                  {/* Dietary Info */}
                  <div className="flex items-start">
                    <Tag className="h-5 w-5 text-orange-500 mr-3 mt-1" />
                    <div>
                      <p className="font-medium">Dietary Preferences</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.dietary_preferences.map(pref => (
                          <span 
                            key={pref}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              userPreferences.includes(pref)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Nutrition Per Day (Average) */}
                  <div>
                    <p className="font-medium mb-2">Average Daily Nutrition</p>
                    <div className="bg-white rounded-md p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Calories:</span>
                        <span className="text-sm font-medium">
                          {nutritionInfo.calories} kcal
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Protein:</span>
                        <span className="text-sm font-medium">
                          {nutritionInfo.protein}g
                        </span>
                      </div>
                      {/* Add more nutritional info here */}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Components List */}
              <div>
                <h3 className="font-bold text-lg mb-3">Components Used</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-1">
                    {template.components_used.map((component, idx) => (
                      <li key={idx} className="text-sm">• {component}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Created By */}
              <div className="text-sm text-gray-600">
                <p>Created by: {template.author}</p>
                <p>Used by {template.popularity} meal planners</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with buttons */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onImport}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center"
          >
            Import to My Meal Plan
          </button>
        </div>
      </div>
    </div>
  );
}