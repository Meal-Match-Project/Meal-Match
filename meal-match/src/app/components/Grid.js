'use client';

export default function MealGrid() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals = ['Breakfast', 'Lunch', 'Dinner'];

  return (
    <div className="w-full h-full">
        <div className="overflow-auto p-4 h-[80vh] w-3/4 ml-auto">
            <div className="min-w-max grid grid-cols-7 gap-4">
                {days.map((day) => (
                <div key={day} className="border rounded-lg shadow-md p-2 bg-gray-100 min-w-[150px]">
                    <h2 className="text-lg font-bold text-center">{day}</h2>
                    <div className="space-y-4 mt-2">
                    {meals.map((meal) => (
                        <div key={meal} className="border rounded-lg p-4 bg-white shadow-sm text-center">
                        <p className="font-medium">{meal}</p>
                        <button className="mt-2 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600">
                            + Add
                        </button>
                        </div>
                    ))}
                    </div>
                </div>
                ))}
            </div>
        </div>
    </div>
    
  );
}
