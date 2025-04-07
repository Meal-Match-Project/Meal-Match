'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Clock, Tag, Users, Star } from 'lucide-react';
import TemplateCard from './TemplateCard';
import TemplateDetailModal from './modals/TemplateDetailModal';

export default function TemplatesPage({ userId, templates, userPreferences, userAllergies }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState(templates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    dietaryPreferences: [],
    prepTime: null,
    sortBy: 'popularity'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Parse user preferences into an array
  const userPreferencesArray = userPreferences ? userPreferences.split(',').map(p => p.trim()) : [];
  const userAllergiesArray = userAllergies ? userAllergies.split(',').map(a => a.trim()) : [];

  // Diet options
  const dietOptions = [
    'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-Free', 
    'Dairy-Free', 'Low-Carb', 'High-Protein', 'Mediterranean'
  ];
  
  // Apply filters
  useEffect(() => {
    let result = [...templates];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(template => 
        template.name.toLowerCase().includes(term) || 
        template.description.toLowerCase().includes(term) ||
        template.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Apply dietary filters
    if (filters.dietaryPreferences.length > 0) {
      result = result.filter(template => 
        filters.dietaryPreferences.every(pref => 
          template.dietary_preferences.includes(pref)
        )
      );
    }
    
    // Apply prep time filter
    if (filters.prepTime) {
      result = result.filter(template => template.prep_time <= filters.prepTime);
    }
    
    // Sort results
    if (filters.sortBy === 'popularity') {
      result.sort((a, b) => b.popularity - a.popularity);
    } else if (filters.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (filters.sortBy === 'prep_time') {
      result.sort((a, b) => a.prep_time - b.prep_time);
    }
    
    setFilteredTemplates(result);
  }, [searchTerm, filters, templates]);

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleImportTemplate = async (templateId) => {
    try {
      const response = await fetch('/api/templates/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          userId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to import template');
      }
      
      // Show success message and redirect to meal plan page
      alert('Template imported successfully!');
      window.location.href = `/dashboard/grid/${userId}`;
    } catch (error) {
      console.error('Error importing template:', error);
      alert('Failed to import template. Please try again.');
    }
  };

  const toggleDietaryFilter = (preference) => {
    setFilters(prev => {
      const current = [...prev.dietaryPreferences];
      
      if (current.includes(preference)) {
        return {
          ...prev,
          dietaryPreferences: current.filter(p => p !== preference)
        };
      } else {
        return {
          ...prev,
          dietaryPreferences: [...current, preference]
        };
      }
    });
  };

  const setPrepTimeFilter = (time) => {
    setFilters(prev => ({
      ...prev,
      prepTime: time
    }));
  };

  const setSortBy = (sortOption) => {
    setFilters(prev => ({
      ...prev,
      sortBy: sortOption
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Weekly Meal Plan Templates</h1>
      <p className="text-gray-600 mb-8">
        Discover ready-made meal plans created by our team and community. 
        Find plans that match your preferences and import them to your weekly meal grid.
      </p>
      
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search templates by name, description, or tags..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg border mb-4 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dietary Preferences */}
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Dietary Preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dietOptions.map(diet => (
                    <button
                      key={diet}
                      onClick={() => toggleDietaryFilter(diet)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        filters.dietaryPreferences.includes(diet)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      } ${
                        userPreferencesArray.includes(diet) 
                          ? 'ring-2 ring-orange-300' 
                          : ''
                      }`}
                    >
                      {diet}
                      {userPreferencesArray.includes(diet) && ' ★'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Prep Time */}
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Max Prep Time
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[30, 60, 90, 120].map(time => (
                    <button
                      key={time}
                      onClick={() => setPrepTimeFilter(time)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        filters.prepTime === time
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {time} mins
                    </button>
                  ))}
                  <button
                    onClick={() => setPrepTimeFilter(null)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filters.prepTime === null
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Any
                  </button>
                </div>
              </div>
              
              {/* Sort By */}
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Sort By
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSortBy('popularity')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filters.sortBy === 'popularity'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Most Popular
                  </button>
                  <button
                    onClick={() => setSortBy('newest')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filters.sortBy === 'newest'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => setSortBy('prep_time')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filters.sortBy === 'prep_time'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Quickest Prep
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Active Filters Display */}
        {(filters.dietaryPreferences.length > 0 || filters.prepTime !== null) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Active filters:</span>
            
            {filters.dietaryPreferences.map(pref => (
              <span 
                key={pref} 
                className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center"
              >
                {pref}
                <button
                  onClick={() => toggleDietaryFilter(pref)}
                  className="ml-1 text-orange-800 hover:text-orange-900"
                >
                  ×
                </button>
              </span>
            ))}
            
            {filters.prepTime && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center">
                Under {filters.prepTime} mins
                <button
                  onClick={() => setPrepTimeFilter(null)}
                  className="ml-1 text-orange-800 hover:text-orange-900"
                >
                  ×
                </button>
              </span>
            )}
            
            <button
              onClick={() => setFilters({
                dietaryPreferences: [],
                prepTime: null,
                sortBy: 'popularity'
              })}
              className="text-xs text-orange-600 hover:text-orange-800 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
      
      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template._id}
              template={template}
              onClick={() => handleTemplateClick(template)}
              onImport={() => handleImportTemplate(template._id)}
              userPreferences={userPreferencesArray}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No templates found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filters to find meal plan templates.
          </p>
        </div>
      )}
      
      {/* Template Detail Modal */}
      {showModal && selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => setShowModal(false)}
          onImport={() => handleImportTemplate(selectedTemplate._id)}
          userPreferences={userPreferencesArray}
          userAllergies={userAllergiesArray}
        />
      )}
    </div>
  );
}