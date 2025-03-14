import { useState } from 'react';
import { Ellipsis } from 'lucide-react';

export default function FoodList({items, listName, handleMenuClick, listColor}) {

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">{listName}</h2>
            <div className="space-y-4">
                {items.map((component) => (
                <div
                    key={component.id}
                    className={`flex items-center justify-between p-4 ${listColor} rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out`}
                >
                    {/* Component name */}
                    <span className="text-lg font-medium text-white">{component.name}</span>

                    {/* Menu button */}
                    <button
                    onClick={() => handleMenuClick(component.id)}
                    className="text-white hover:text-gray-200 transition-colors"
                    >
                    <Ellipsis className="w-4 h-4" />
                    </button>
                </div>
                ))}
            </div>
        </div>
      );
}