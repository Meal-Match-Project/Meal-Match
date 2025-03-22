'use client';

import { useState } from 'react';
import TemplatesModal from '@/app/components/modals/TemplatesModal';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([
    { name: 'Healthy Week', meals: { Monday: 'Oatmeal & Fruits', Tuesday: 'Salad & Soup', Wednesday: 'Rice & Tofu', Thursday: 'Pasta', Friday: 'Stir Fry', Saturday: 'Paneer Wrap', Sunday: 'Dal & Roti' } },
    { name: 'High Protein Plan', meals: { Monday: 'Protein Shake & Eggs', Tuesday: 'Lentils & Quinoa', Wednesday: 'Chickpea Salad', Thursday: 'Grilled Paneer', Friday: 'Soy Protein Meal', Saturday: 'Greek Yogurt Bowl', Sunday: 'Tofu Scramble' } }
  ]);

  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleToggleExpand = (templateName) => {
    setExpandedTemplate(expandedTemplate === templateName ? null : templateName);
  };

  const handleEditClick = (template) => {
    setSelectedTemplate(template);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedTemplate({ name: '', meals: { Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '', Saturday: '', Sunday: '' } });
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleDeleteTemplate = (templateName) => {
    setTemplates((prev) => prev.filter(template => template.name !== templateName));
    setIsModalOpen(false);
  };

  const handleSaveTemplate = (updatedTemplate) => {
    setTemplates((prev) => {
      if (isAdding) {
        return [...prev, updatedTemplate];
      } else {
        return prev.map(template => template.name === updatedTemplate.name ? updatedTemplate : template);
      }
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Weekly Meal Templates</h1>
      <div className="w-3/4 mx-auto my-6">
        <div className="bg-white shadow-md rounded-md">
          {templates.map((template) => (
            <div key={template.name} className="border-b last:border-none">
              {/* Template Name (Clickable for Expand/Collapse) */}
              <div 
                onClick={() => handleToggleExpand(template.name)}
                className="flex justify-between p-3 cursor-pointer bg-orange-100 hover:bg-orange-200 transition"
              >
                <span className="font-semibold text-lg">{template.name}</span>
                <span>{expandedTemplate === template.name ? '▲' : '▼'}</span>
              </div>

              {/* Expanded View: Display meals for each day */}
              {expandedTemplate === template.name && (
                <div className="p-4 bg-orange-50">
                  {Object.entries(template.meals).map(([day, meal]) => (
                    <div key={day} className="flex justify-between p-2 border-b last:border-none">
                      <span className="font-semibold">{day}:</span>
                      <span>{meal || 'No meal planned'}</span>
                    </div>
                  ))}
                  {/* Edit Button */}
                  <div className="flex justify-end mt-2">
                    <button onClick={() => handleEditClick(template)} className="text-blue-600 hover:underline">
                      Edit Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Template Button */}
          <div className="flex justify-center p-4 border-t">
            <button onClick={handleAddClick} className="text-blue-600 font-semibold">
              + Add New Template
            </button>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <TemplatesModal 
          template={selectedTemplate} 
          onSave={handleSaveTemplate} 
          onDelete={handleDeleteTemplate} 
          onClose={() => setIsModalOpen(false)} 
          isAdding={isAdding}
        />
      )}
    </div>
  );
}