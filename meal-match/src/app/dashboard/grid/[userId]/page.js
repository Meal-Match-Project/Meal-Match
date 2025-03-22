import LoggedInNav from "@/app/components/LoggedInNav"; 
import MealPlanner from "@/app/components/MealPlanner";  
import connect from "@/lib/mongodb";
import Meal from "@/models/Meals";
import User from "@/models/Users";
import Component from "@/models/Components";
import Favorite from "@/models/Favorites";

//Helper function to get most recent monday to display weekly grid
function getMostRecentMonday() {
    const today = new Date();
    
    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = today.getDay();
    
    // Calculate days to subtract to get to the most recent Monday
    // If today is Monday (1), subtract 0 days
    // If today is Tuesday (2), subtract 1 day
    // If today is Wednesday (3), subtract 2 days
    // ...and so on
    // If today is Sunday (0), subtract 6 days
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Create a new date object for the most recent Monday
    const mostRecentMonday = new Date(today);
    mostRecentMonday.setDate(today.getDate() - daysToSubtract);
    
    // Reset time to midnight (start of the day)
    mostRecentMonday.setHours(0, 0, 0, 0);
    
    return mostRecentMonday;
}

// Helper function to convert ObjectIds to strings and ensure all data is serializable
function convertIds(docs) {
    return JSON.parse(JSON.stringify(docs, (key, value) => {
        // Convert MongoDB ObjectId to string
        if (key === '_id' || key === 'userId' || key === 'mealId') {
            return value.toString();
        }
        // Handle Date objects
        if (value instanceof Date) {
            return value.toISOString();
        }
        return value;
    }));
}

export async function saveUserData(userId, componentsData, mealsData) {
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
  
  export async function fetchUserData(userId) {
    await connect();

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Calculate date range for the current week
    const lastMonday = getMostRecentMonday();
    const nextWeek = new Date(lastMonday.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Try to find meals for the current week
    const userMeals = await Meal.find({
        userId: userId,
        date: { $gte: lastMonday, $lt: nextWeek },
    }).lean();
    
    // If no meals found for current week, initialize them
    if (userMeals.length === 0) {
        const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const newMealIds = [];

        console.log("No meals found for current week. Creating new ones...");

        // Create meal slots for each day and meal type
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(lastMonday);
            currentDate.setDate(lastMonday.getDate() + i);
            const dayOfWeek = daysOfWeek[i];

            for (const mealType of mealTypes) {
                try {
                    // Create a new meal document
                    const newMeal = new Meal({
                        userId: userId,  // Make sure to add the userId
                        date: currentDate,
                        day_of_week: dayOfWeek,
                        meal_type: mealType,
                        name: `${dayOfWeek}-${mealType}`,
                        notes: '',
                        components: [],
                        toppings: [],
                        favorite: false   // Initialize as not favorite
                    });

                    // Save the meal and get its ID
                    const savedMeal = await newMeal.save();
                    newMealIds.push(savedMeal._id);
                } catch (error) {
                    console.error(`Error creating meal ${dayOfWeek}-${mealType}:`, error);
                }
            }
        }

        // Update user with new meal IDs
        await User.findByIdAndUpdate(userId, {
            $push: { meals: { $each: newMealIds } }
        });

        // Refetch meals to get the newly created ones
        return fetchUserData(userId);
    }

    // Fetch components, favorites, and favorite meals
    const userComponents = await Component.find({
        userId: userId,
    }).lean();

    const userFavorites = await Favorite.find({
        userId: userId,
    }).lean();

    const favoriteMeals = await Meal.find({
        _id: { $in: userFavorites.map(fav => fav.mealId) },
    }).lean();

    return { 
        favoriteMeals: convertIds(favoriteMeals), 
        userComponents: convertIds(userComponents), 
        userMeals: convertIds(userMeals),
     };
}

export default async function Dashboard({ params }) {
    const { userId } = await params;
    const { favoriteMeals, userComponents, userMeals } = await fetchUserData(userId);
  
    return (
      <div className="min-h-full bg-gray-100">
        <LoggedInNav />
        <main className="container mx-auto p-4">
          <MealPlanner 
            components={userComponents} 
            meals={userMeals} 
            favorites={favoriteMeals} 
            userId={userId}
          />
        </main>
      </div>
    );
  }
