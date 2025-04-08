import { AlertTriangle, Check, X, RefreshCw, Trash2 } from 'lucide-react';

export default function IngredientItem({
  ingredient,
  activeTab,
  onClick,
  onPurchase,
  onOutOfStock,
  onAddToList,
  onDelete
}) {
  // Helper to check if an ingredient is expiring soon (within 2 days)
  const isExpiringSoon = () => {
    if (!ingredient.purchase_date) return false;
    
    // Calculate expiration date based on purchase date and shelf life
    const purchaseDate = new Date(ingredient.purchase_date);
    const expirationDate = new Date(purchaseDate);
    expirationDate.setDate(expirationDate.getDate() + (ingredient.shelf_life || 7));
    
    // Check if expiration date is within the next TWO days
    const now = new Date();
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
    return expirationDate - now < twoDaysInMs && expirationDate > now;
  };

  return (
    <div className="p-4 hover:bg-gray-50 flex items-center justify-between">
      <div className="flex-1 mr-4" onClick={onClick}>
        <div className="font-medium flex items-center">
          <span>{ingredient.name}</span>
          {activeTab === 'in-stock' && isExpiringSoon() && (
            <div className="flex items-center text-yellow-600 ml-2">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-xs">Expiring soon</span>
            </div>
          )}
        </div>
        <div className="text-sm flex items-center mt-1">
          <span className="text-gray-500">
            {ingredient.amount} {ingredient.unit}
          </span>
          {ingredient.purchase_date && (
            <span className="text-green-500 ml-2 text-xs">
              Purchased on {new Date(ingredient.purchase_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      {/* Quick Action Buttons */}
      <div className="flex items-center space-x-2">
        {activeTab === 'to-buy' ? (
          <button
            onClick={onPurchase}
            className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200 focus:outline-none"
            title="Mark as purchased"
          >
            <Check className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onOutOfStock}
            className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 focus:outline-none"
            title="Mark as out of stock"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {activeTab === 'in-stock' && (
          <button
            onClick={onAddToList}
            className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 focus:outline-none"
            title="Add to shopping list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={onDelete}
          className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 focus:outline-none"
          title="Delete ingredient"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}