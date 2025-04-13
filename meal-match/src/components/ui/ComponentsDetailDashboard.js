'use client';

export default function ComponentDetailsModal({ component, isOpen, onClose }) {
  if (!isOpen || !component) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">{component.name}</h2>

        {/* Ingredients */}
        <div className="mb-4">
          <h3 className="font-bold mb-1">Ingredients</h3>
          <ul className="list-disc list-inside text-gray-700">
            {component.ingredients && component.ingredients.length > 0
              ? component.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))
              : <li>None</li>}
          </ul>
        </div>

        {/* Prep Time and Favorite */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold mb-1">Prep Time (minutes)</h4>
            <p className="text-gray-700">{component.prep_time ? `${component.prep_time} minutes` : 'N/A'}</p>
          </div>
          <div>
            <h4 className="font-bold mb-1">Favorite</h4>
            <p className="text-gray-700">{component.favorite ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Nutrition */}
        <div className="mb-4">
          <h3 className="font-bold mb-1">Nutrition Information</h3>
          <div className="grid grid-cols-2 gap-y-1">
            <p><span className="font-bold">Calories:</span> <span className="text-gray-700">{component.calories || 0}</span></p>
            <p><span className="font-bold">Protein:</span> <span className="text-gray-700">{component.protein || 0}g</span></p>
            <p><span className="font-bold">Carbs:</span> <span className="text-gray-700">{component.carbs || 0}g</span></p>
            <p><span className="font-bold">Fat:</span> <span className="text-gray-700">{component.fat || 0}g</span></p>
          </div>
        </div>
        
        {/* Dietary Restrictions */}
        <div className="mb-4">
          <h3 className="font-bold">Dietary Restrictions</h3>
          <p className="text-gray-700">{component.dietary_restrictions || 'None'}</p>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <h3 className="font-bold">Notes</h3>
          <p className="text-gray-700">{component.notes || 'No notes available'}</p>
        </div>

        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
