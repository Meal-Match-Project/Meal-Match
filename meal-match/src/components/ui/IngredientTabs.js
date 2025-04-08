import { ShoppingCart, Package } from 'lucide-react';

export default function IngredientTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex border-b border-gray-200 mb-4">
      <button
        className={`py-2 px-4 font-medium flex items-center ${
          activeTab === 'to-buy'
            ? 'border-b-2 border-orange-500 text-orange-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('to-buy')}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Shopping List
      </button>
      <button
        className={`py-2 px-4 font-medium flex items-center ${
          activeTab === 'in-stock'
            ? 'border-b-2 border-orange-500 text-orange-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('in-stock')}
      >
        <Package className="w-4 h-4 mr-2" />
        Inventory
      </button>
    </div>
  );
}