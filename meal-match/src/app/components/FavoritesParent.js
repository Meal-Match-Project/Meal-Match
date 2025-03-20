'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import FavoriteMeals from './FavoriteMeals';

export default function FavoritesParent() {
    const { userId: urlUserId } = useParams(); // Get userId from URL
    const [userId, setUserId] = useState(null);
    const [components, setComponents] = useState({ thisWeek: [], saved: [] });
     // Load userId from URL or localStorage
      useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (urlUserId) {
          setUserId(urlUserId);
          localStorage.setItem("userId", urlUserId);
        } else if (storedUserId) {
          setUserId(storedUserId);
        }
      }, [urlUserId]);
    
      // Load user's components from localStorage when page loads
      useEffect(() => {
        if (userId) {
          const storedComponents = localStorage.getItem(`componentsData-${userId}`);
          if (storedComponents) {
            setComponents(JSON.parse(storedComponents));
          } else {
            // If no data exists for this user, initialize with default meals
            setComponents({
              thisWeek: [
                { name: 'Garlic-herb chicken', servings: 3, prepTime: '45 Minutes', ingredients: ['1.5lb Chicken breasts', '2 cloves garlic', '1 tbsp oregano'] },
                { name: 'Jasmine rice', servings: 4, prepTime: '30 Minutes', ingredients: ['1 cup jasmine rice', '2 cups water', 'Salt'] },
                { name: 'Steamed broccoli', servings: 2, prepTime: '10 Minutes', ingredients: ['1 head broccoli', 'Salt', 'Pepper'] },
                { name: 'Spaghetti', servings: 3, prepTime: '20 Minutes', ingredients: ['1 lb spaghetti', 'Water', 'Salt'] }
              ],
              saved: [
                { name: 'Garlic-herb chicken', servings: 3, prepTime: '45 Minutes', ingredients: ['1.5lb Chicken breasts', '2 cloves garlic', '1 tbsp oregano'] },
                { name: 'Jasmine rice', servings: 4, prepTime: '30 Minutes', ingredients: ['1 cup jasmine rice', '2 cups water', 'Salt'] }
              ]
            });
          }
        }
      }, [userId]);
    
      // Save components to localStorage whenever they change
      useEffect(() => {
        if (userId && (components.thisWeek.length || components.saved.length)) {
          localStorage.setItem(`componentsData-${userId}`, JSON.stringify(components));
        }
      }, [userId, components]);
    // const [weeklyComponents, setWeeklyComponents] = useState([
    //     // Example: This should reflect the components actually planned for the week
    //     'Crepes', 'Mashed sweet potato', 'Tuna salad', 'Baby spinach',
    //     'Crisped chickpeas', 'Balsamic vinaigrette', 'Pickled red onions'
    //   ]);

    //   function handleAddToWeeklyPlan(components) {
    //     components = components.filter(comp => !weeklyComponents.includes(comp));
    //     setWeeklyComponents((prev) => [...prev, ...components]);
    //   }
    
    
    return(
        <FavoriteMeals weeklyComponents={components.thisWeek} />
    )
  }