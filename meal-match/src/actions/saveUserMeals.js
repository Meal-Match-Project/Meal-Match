'use server';

import connect from '@/lib/connect';
import Component from '@/models/Components';
import Meal from '@/models/Meals';

export async function saveUserMeals(componentsData, mealsData) {
  await connect();

  // 1) Upsert all Components from componentsData
  for (const comp of componentsData) {
    // Example: find by _id, if comp._id exists; otherwise create new.
    if (comp._id) {
      await Component.findByIdAndUpdate(comp._id, comp, { upsert: true });
    } else {
      await Component.create(comp);
    }
  }

  // 2) Upsert all Meals from mealsData
  for (const meal of mealsData) {
    if (meal._id) {
      await Meal.findByIdAndUpdate(meal._id, meal, { upsert: true });
    } else {
      await Meal.create(meal);
    }
  }

  // You can return a success status if you want
  return { success: true };
}