'use client';

import { useState, useEffect } from 'react';
import FavoriteMealsList from './FavoriteMealsList';
import FavoriteComponentsList from './FavoriteComponentsList';

export default function FavoritesPage({ userId, favoriteMeals, favoriteComponents, weeklyComponents }) {
    const [activeTab, setActiveTab] = useState('meals');
    
    // Debug logging
    useEffect(() => {
      console.log("FavoritesPage received props:", { 
        userId, 
        favoriteMeals, 
        favoriteComponents, 
        weeklyComponents 
      });
    }, [userId, favoriteMeals, favoriteComponents, weeklyComponents]);
    
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-orange-600 mb-6">My Favorites</h1>
      
      {/* Tab Navigation */}
      <div className="w-3/4 mx-auto mb-6">
        <div className="flex border-b">
          <button 
            className={`flex-1 py-3 px-4 text-center ${activeTab === 'meals' ? 'bg-orange-100 text-orange-600 font-bold border-b-2 border-orange-600' : 'bg-white'}`}
            onClick={() => setActiveTab('meals')}
          >
            Favorite Meals
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-center ${activeTab === 'components' ? 'bg-orange-100 text-orange-600 font-bold border-b-2 border-orange-600' : 'bg-white'}`}
            onClick={() => setActiveTab('components')}
          >
            Favorite Components
          </button>
        </div>
      </div>
      
      {/* Content based on active tab */}
      <div className="w-3/4 mx-auto">
        {activeTab === 'meals' ? (
          <FavoriteMealsList 
            userId={userId}
            favoriteMeals={favoriteMeals} 
            weeklyComponents={weeklyComponents.map(comp => comp.name)} 
          />
        ) : (
          <FavoriteComponentsList 
            userId={userId}
            favoriteComponents={favoriteComponents} 
          />
        )}
      </div>
    </div>
  );
}