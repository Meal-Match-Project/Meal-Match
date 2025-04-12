import { CalendarDays } from 'lucide-react';
import Image from "next/image";

export default function TemplateCard({ template, onClick, onImport, isOwner }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        {/* Template image or placeholder */}
        <div className="h-40 bg-orange-100 flex items-center justify-center">
          {template.image_url ? (
            <Image
              src={template.image_url} 
              alt={template.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <CalendarDays className="h-16 w-16 text-orange-300" />
          )}
        </div>
        
        {/* Owner badge */}
        {isOwner && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Your Template
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg truncate" title={template.name}>
          {template.name}
        </h3>
        
        <p className="text-gray-600 text-sm h-12 overflow-hidden mt-1">
          {template.description}
        </p>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onClick}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm"
          >
            View Details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onImport();
            }}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}