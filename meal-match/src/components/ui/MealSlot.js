export default function MealSlot({ meal, cellClass, onMealClick, onClearMeal }) {
    const hasContent = meal.components?.length > 0 || (meal.name && meal.name !== `${meal.day_of_week} ${meal.meal_type}`);
  
    return (
      <div 
        id={meal._id} // Important for the drag and drop functionality
        className={`${cellClass} bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative 
          ${hasContent 
            ? 'border-l-4 border-orange-500 cursor-pointer' 
            : 'border border-dashed border-gray-300 hover:border-orange-300'
          }`}
        onClick={() => onMealClick(meal._id)}
      >
        {hasContent ? (
          <>
            <h4 className="font-medium text-sm mb-1 truncate pr-6">
              {meal.name || `${meal.day_of_week} ${meal.meal_type}`}
            </h4>
            <ul className="text-xs text-gray-600 space-y-1 overflow-y-auto max-h-[80px]">
              {meal.components.slice(0, 3).map((comp, idx) => (
                <li key={idx} className="truncate flex items-center">
                  <span className="w-1 h-1 bg-orange-400 rounded-full mr-1.5 inline-block"></span>
                  {comp}
                </li>
              ))}
              {meal.components.length > 3 && (
                <li className="text-gray-500 italic">+{meal.components.length - 3} more</li>
              )}
            </ul>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearMeal(meal._id);
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100"
              title="Clear meal"
              aria-label="Clear meal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs">
            <div className="text-center">
              <p>Drop components here</p>
              <p className="text-gray-300 mt-1 text-[10px]">{meal.day_of_week} {meal.meal_type}</p>
            </div>
          </div>
        )}
      </div>
    );
  }