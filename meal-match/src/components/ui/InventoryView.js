import { AlertTriangle, ShoppingCart, Trash2 } from 'lucide-react';
import EmptyState from './EmptyState';

export default function InventoryView({ 
  ingredients, 
  searchTerm, 
  onItemClick, 
  onOutOfStock, 
  onAddToList, 
  onDelete 
}) {
  const ingredientsArray = Array.isArray(ingredients) ? ingredients : [];

  // Filter in-stock items
  const stockItems = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (ingredient.status === 'in-stock' || ingredient.status.startsWith('Bought '));
  });

  if (stockItems.length === 0) {
    return <EmptyState searchTerm={searchTerm} activeTab="in-stock" />;
  }

  // Helper to check if an ingredient is expiring soon
  const isExpiringSoon = (ingredient) => {
    if (!ingredient.purchase_date || !ingredient.shelf_life) return false;
    
    const purchaseDate = new Date(ingredient.purchase_date);
    const expirationDate = new Date(purchaseDate);
    expirationDate.setDate(expirationDate.getDate() + (ingredient.shelf_life || 7));
    
    const now = new Date();
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
    return expirationDate - now < twoDaysInMs && expirationDate > now;
  };

  // Sort: expiring items first, then alphabetically
  const sortedItems = [...stockItems].sort((a, b) => {
    const aExpiring = isExpiringSoon(a);
    const bExpiring = isExpiringSoon(b);
    
    if (aExpiring && !bExpiring) return -1;
    if (!aExpiring && bExpiring) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="divide-y">
      {sortedItems.map(item => (
        <div key={item._id || item.name} className="px-4 py-3 flex items-center hover:bg-gray-50">
          <div className="flex-1" onClick={() => onItemClick(item)}>
            <div className="font-medium flex items-center">
              {item.name}
              {isExpiringSoon(item) && (
                <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full flex items-center text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Expiring soon
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {item.amount} {item.unit}
              {item.purchase_date && (
                <span className="ml-2 text-green-600 text-xs">
                  Purchased: {new Date(item.purchase_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onAddToList(item)}
              className="p-1.5 rounded-full bg-blue-50 text-blue-600"
              title="Add to shopping list"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onOutOfStock(item)}
              className="p-1.5 rounded-full bg-red-50 text-red-600"
              title="Mark as out of stock"
            >
              ×
            </button>
            
            <button
              onClick={() => onDelete(item._id)}
              className="p-1.5 text-gray-400 hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}