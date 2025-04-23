import { ShoppingCart, Package } from 'lucide-react';

export default function EmptyState({ searchTerm, activeTab }) {
  if (searchTerm) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-400 mb-2">No matching ingredients found</div>
        <div className="text-sm text-gray-500">Try a different search term</div>
      </div>
    );
  }
  
  return (
    <div className="p-8 text-center">
      {activeTab === 'to-buy' ? (
        <>
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-500 font-medium mb-1">Your shopping list is empty</h3>
          <p className="text-sm text-gray-400">
            Add ingredients that you need to buy
          </p>
        </>
      ) : (
        <>
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-500 font-medium mb-1">No ingredients in your inventory</h3>
          <p className="text-sm text-gray-400">
            Mark items as purchased from your shopping list to see them here
          </p>
        </>
      )}
    </div>
  );
}