'use client';

import { Clock, Tag, ChevronRight, Star } from 'lucide-react';

export default function TemplateCard({ template, onClick, onImport, userPreferences }) {
  // Find matching preferences between template and user
  const matchingPreferences = template.dietary_preferences.filter(
    pref => userPreferences.includes(pref)
  );
  
  // Default image if none is provided
  const imageUrl = template.image_url || '/images/default-template.jpg';
  
  // Format date
  const formattedDate = new Date(template.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div 
        className="h-40 bg-cover bg-center" 
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="h-full w-full bg-black bg-opacity-30 flex items-center justify-center">
          <h3 className="text-xl font-bold text-white text-center px-4">
            {template.name}
          </h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm text-gray-700">
              {template.popularity > 1000 
                ? `${(template.popularity / 1000).toFixed(1)}k` 
                : template.popularity} users
            </span>
          </div>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {template.description}
        </p>
        
        {/* Info tags */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{template.prep_time} min prep time per week</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Tag className="h-4 w-4 mr-2" />
            <div className="flex flex-wrap gap-1">
              {template.dietary_preferences.slice(0, 3).map(pref => (
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
              {template.dietary_preferences.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{template.dietary_preferences.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Match indicator */}
        {matchingPreferences.length > 0 && (
          <div className="mb-4 bg-green-50 border border-green-100 text-green-700 px-3 py-2 rounded-md text-xs">
            <span className="font-medium">Good match!</span> Includes {matchingPreferences.length} of your dietary preferences.
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-between mt-2">
          <button
            onClick={onClick}
            className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center"
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onImport();
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}