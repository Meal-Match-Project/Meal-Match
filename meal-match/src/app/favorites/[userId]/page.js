import LoggedInNav from "@/components/LoggedInNav";
import FavoritesPage from "@/components/FavoritesPage";
import connect from "@/lib/mongodb";
import Favorite from "@/models/Favorites";
import Meal from "@/models/Meals";
import Component from "@/models/Components";

// Helper function to convert ObjectIds to strings and ensure all data is serializable
function convertIds(docs) {
  return JSON.parse(JSON.stringify(docs, (key, value) => {
    // Convert MongoDB ObjectId to string
    if (key === '_id' || key === 'userId' || key === 'mealId' || key === 'user_id' || key === 'meal_id' || key === 'component_id') {
      return value.toString();
    }
    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }));
}

export async function getFavorites(userId) {

    await connect();
    
    try {
      console.log("Fetching favorites for userId:", userId);
      
      // Get all user favorites
      const favorites = await Favorite.find({ user_id: userId }).lean();
      console.log("Found favorites:", favorites);
      
      if (favorites.length === 0) {
        console.log("No favorites found for this user");
        return {
          favoriteMeals: [],
          favoriteComponents: [],
          weeklyComponents: []
        };
      }
      
      // Separate meal and component favorites
      const mealFavorites = favorites.filter(fav => 
        fav.type === 'meal' || (fav.meal_id && !fav.component_id)
      );
      const componentFavorites = favorites.filter(fav => 
        fav.type === 'component' || (fav.component_id && !fav.meal_id)
      );
      
      console.log("Meal favorites:", mealFavorites);
      console.log("Component favorites:", componentFavorites);
      
      // Get meal IDs, properly handle string vs ObjectId
      const mealIds = mealFavorites.map(fav => {
        // Handle both string and ObjectId cases
        return typeof fav.meal_id === 'string' ? fav.meal_id : fav.meal_id.toString();
      }).filter(id => id); // Filter out null/undefined
      
      console.log("Looking for meals with IDs:", mealIds);
      
      // Get component IDs, properly handle string vs ObjectId
      const componentIds = componentFavorites.map(fav => {
        return typeof fav.component_id === 'string' ? fav.component_id : fav.component_id.toString();
      }).filter(id => id); // Filter out null/undefined
      
      // Only query if we have IDs to look for
      let favoriteMeals = [];
      let favoriteComponents = [];
      
      if (mealIds.length > 0) {
        favoriteMeals = await Meal.find({ _id: { $in: mealIds } }).lean();
        console.log("Found favorite meals:", favoriteMeals);
      }
      
      if (componentIds.length > 0) {
        favoriteComponents = await Component.find({ _id: { $in: componentIds } }).lean();
        console.log("Found favorite components:", favoriteComponents);
      }
      
      // Get active components for this week (servings > 0)
      const weeklyComponents = await Component.find({ 
        userId,
        servings: { $gt: 0 } 
      }).lean();
      
      return {
        favoriteMeals: convertIds(favoriteMeals),
        favoriteComponents: convertIds(favoriteComponents),
        weeklyComponents: convertIds(weeklyComponents)
      };
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return {
        favoriteMeals: [],
        favoriteComponents: [],
        weeklyComponents: []
      };
    }
  }
export default async function Favorites({ params }) {
  const { userId } = await params;
  const { favoriteMeals, favoriteComponents, weeklyComponents } = await getFavorites(userId);
  
  return(
    <>
      <LoggedInNav />
      <main className="relative">
        <FavoritesPage 
          userId={userId}
          favoriteMeals={favoriteMeals}
          favoriteComponents={favoriteComponents}
          weeklyComponents={weeklyComponents}
        />
      </main>
    </>
  );
}