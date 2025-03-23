import LoggedInNav from "@/app/components/LoggedInNav"; 
import MealPlanner from "@/app/components/MealPlanner";  
import connect from "@/lib/mongodb";
import Meal from "@/models/Meals";
import User from "@/models/Users";
import Component from "@/models/Components";
import Favorite from "@/models/Favorites";

function getToday() {
    const today = new Date();
    // Reset time to midnight (start of the day)
    today.setHours(0, 0, 0, 0);
    return today;
}

// Helper function to get day names for the next 7 days starting from today
function getNextSevenDayNames() {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    
    // Array to store the day names for the next 7 days
    const nextSevenDays = [];
    
    for (let i = 0; i < 7; i++) {
        const day = new Date();
        day.setDate(today.getDate() + i);
        nextSevenDays.push({
            date: new Date(day),
            name: dayNames[day.getDay()],
            display: i === 0 ? 'Today' : dayNames[day.getDay()]
        });
    }
    
    return nextSevenDays;
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
    const today = getToday();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Get the next seven day names
    const nextSevenDays = getNextSevenDayNames();

    // Try to find meals for the next 7 days
    const userMeals = await Meal.find({
        userId: userId,
        date: { $gte: today, $lt: nextWeek },
    }).lean();
    
    // If no or insufficient meals found for current week, initialize them
    if (userMeals.length < 21) { // Should have 21 meals (7 days × 3 meal types)
        const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
        const newMealIds = [];
        
        console.log("Initializing meals for the next 7 days...");
        
        // Create lookup for existing meals to avoid duplicates
        const existingMeals = {};
        userMeals.forEach(meal => {
            const key = `${meal.day_of_week}-${meal.meal_type}-${meal.date.toISOString().split('T')[0]}`;
            existingMeals[key] = true;
        });

        // Create meal slots for each day and meal type
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const dayOfWeek = nextSevenDays[i].name;

            for (const mealType of mealTypes) {
                const mealKey = `${dayOfWeek}-${mealType}-${currentDate.toISOString().split('T')[0]}`;
                
                // Skip if this meal already exists
                if (existingMeals[mealKey]) continue;
                
                try {
                    // Create a new meal document
                    const newMeal = new Meal({
                        userId: userId,
                        date: currentDate,
                        day_of_week: dayOfWeek,
                        meal_type: mealType,
                        name: `${dayOfWeek}-${mealType}`,
                        notes: '',
                        components: [],
                        toppings: [],
                        favorite: false
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
        if (newMealIds.length > 0) {
            await User.findByIdAndUpdate(userId, {
                $push: { meals: { $each: newMealIds } }
            });
        }

        // Refetch meals to get the newly created ones
        return fetchUserData(userId);
    }

    // Fetch components, favorites, and favorite meals
    const userComponents = await Component.find({
        userId: userId,
    }).lean();

    const userFavorites = await Favorite.find({
        user_id: userId,
    }).lean();

    const favoriteMeals = await Meal.find({
        _id: { $in: userFavorites.map(fav => fav.meal_id).filter(id => id) },
    }).lean();

    return { 
        favoriteMeals: convertIds(favoriteMeals), 
        userComponents: convertIds(userComponents), 
        userMeals: convertIds(userMeals),
        dayInfo: convertIds(nextSevenDays)
    };
}


export default async function Dashboard({ params }) {
    const { userId } = await params;
    const { favoriteMeals, userComponents, userMeals, dayInfo } = await fetchUserData(userId);
  
    return (
      <div className="min-h-screen bg-gray-100">
        <LoggedInNav />
        <main className="w-full px-2 py-4">
          <MealPlanner 
            components={userComponents} 
            meals={userMeals} 
            favorites={favoriteMeals} 
            userId={userId}
            dayInfo={dayInfo}
          />
        </main>
      </div>
    );
}