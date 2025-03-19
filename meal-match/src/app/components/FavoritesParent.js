'use client';
import { useState } from 'react';
import FavoriteMeals from './FavoriteMeals';

export default function FavoritesParent() {
    const [weeklyComponents, setWeeklyComponents] = useState([
        // Example: This should reflect the components actually planned for the week
        'Crepes', 'Mashed sweet potato', 'Tuna salad', 'Baby spinach',
        'Crisped chickpeas', 'Balsamic vinaigrette', 'Pickled red onions'
      ]);

      function handleAddToWeeklyPlan(components) {
        components = components.filter(comp => !weeklyComponents.includes(comp));
        setWeeklyComponents((prev) => [...prev, ...components]);
      }
    
    
    return(
        <FavoriteMeals weeklyComponents={weeklyComponents} onAddMeal={handleAddToWeeklyPlan} />
    )
  }