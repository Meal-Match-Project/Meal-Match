/**
 * Draggable item component for drag and drop operations
 */

export default function DraggableItem({ id }) {
    // Handle different types of draggable items
    
    // Case 1: Meal component being moved between meals
    if (id.toString().startsWith('meal-component:')) {
      const [, , component] = id.split(':');
      return (
        <div className="p-2 max-w-[200px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing transform scale-110 transition-transform duration-200 z-50">
          {component}
        </div>
      );
    }
    
    // Case 2: Favorite meal being dragged
    if (id.startsWith('meal-')) {
      const mealName = id.replace('meal-', '');
      return (
        <div className="p-2 max-w-[200px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing transform scale-110 transition-transform duration-200 z-50">
          {mealName}
        </div>
      );
    }
    
    // Case 3: Component from sidebar being dragged
    return (
      <div className="p-2 max-w-[200px] bg-orange-500 text-white font-bold rounded-lg shadow-md cursor-grabbing transform scale-110 transition-transform duration-200 z-50">
        {id}
      </div>
    );
  }