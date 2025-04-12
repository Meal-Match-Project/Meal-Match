'use client';

import { useState, useEffect } from 'react';
import FavoriteMealsList from './FavoriteMealsList';
import FavoriteComponentsList from './FavoriteComponentsList';
import { getFavoriteMeals, getFavoriteComponents } from '@/actions/favoriteActions';

export default function FavoritesPage({ userId, weeklyComponents }) {
    const [activeTab, setActiveTab] = useState('meals');
    const [favoriteMeals, setFavoriteMeals] = useState([]);
    const [favoriteComponents, setFavoriteComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Fetch favorites data
    useEffect(() => {
      async function fetchFavorites() {
        if (userId) {
          setIsLoading(true);
          
          // Fetch favorite meals (stored as complete objects in Favorites collection)
          const mealsResult = await getFavoriteMeals(userId);
          if (mealsResult.success) {
            setFavoriteMeals(mealsResult.favorites);
          }
          
          // Fetch favorite components (components with favorite=true)
          const componentsResult = await getFavoriteComponents(userId);
          if (componentsResult.success) {
            setFavoriteComponents(componentsResult.components);
          }
          
          setIsLoading(false);
        }
      }
      
      fetchFavorites();
    }, [userId]);
    
    // Debug logging
    useEffect(() => {
      console.log("FavoritesPage state:", { 
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
      
      {/* Loading State */}
      {isLoading && (
        <div className="w-3/4 mx-auto text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading favorites...</p>
        </div>
      )}
      
      {/* Content based on active tab */}
      {!isLoading && (
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
      )}
    </div>
  );
}