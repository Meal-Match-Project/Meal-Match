import { Check, Trash2 } from 'lucide-react';
import EmptyState from './EmptyState';

export default function ShoppingListView({ 
  ingredients = [], // Set default empty array
  searchTerm, 
  onItemClick, 
  onPurchase, 
  onDelete 
}) {
  // Ensure ingredients is always an array
  const ingredientsArray = Array.isArray(ingredients) ? ingredients : [];
  
  // Filter shopping list items
  const shoppingItems = ingredientsArray.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (ingredient.status === 'to-buy' || ingredient.status === 'Need to buy');
  });

  if (shoppingItems.length === 0) {
    return <EmptyState searchTerm={searchTerm} activeTab="to-buy" />;
  }

  // Group items by category if available
  const groupedItems = shoppingItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className="divide-y">
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="py-2">
          <div className="px-4 py-2 bg-gray-50 font-medium text-gray-600">{category}</div>
          {items.map(item => (
            <div key={item._id || item.name} className="px-4 py-3 flex items-center hover:bg-gray-50">
              <div className="mr-3">
                <button
                  onClick={() => onPurchase(item)}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-green-500 flex items-center justify-center"
                  title="Mark as purchased"
                >
                  <Check className="w-4 h-4 text-transparent hover:text-green-500" />
                </button>
              </div>
              
              <div className="flex-1" onClick={() => onItemClick(item)}>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">
                  {item.amount} {item.unit}
                </div>
              </div>
              
              <button
                onClick={() => onDelete(item._id)}
                className="p-1.5 text-gray-400 hover:text-red-500"
                title="Remove from list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}