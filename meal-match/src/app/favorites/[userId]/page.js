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
    
    // 1. Get favorite meals directly from Favorites collection (with complete meal data)
    const favoriteMeals = await Favorite.find({ 
      user_id: userId,
      type: 'meal'
    }).lean();
    
    console.log("Found favorite meals:", favoriteMeals.length);
    
    // 2. Get favorite components directly from Components collection (with favorite: true)
    const favoriteComponents = await Component.find({
      userId: userId,
      favorite: true
    }).lean();
    
    console.log("Found favorite components:", favoriteComponents.length);
    
    // 3. Get active components for this week (servings > 0)
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
    <div className="bg-gray-100 min-h-screen">
      <LoggedInNav />
      <main className="relative">
        <FavoritesPage 
          userId={userId}
          favoriteMeals={favoriteMeals}
          favoriteComponents={favoriteComponents}
          weeklyComponents={weeklyComponents}
        />
      </main>
    </div>
  );
}