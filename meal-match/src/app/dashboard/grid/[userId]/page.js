import LoggedInNav from "@/components/LoggedInNav"; 
import MealPlanner from "@/components/MealPlanner";
import { Suspense } from 'react';
import connect from "@/lib/mongodb";
import Meal from "@/models/Meals";
import User from "@/models/Users";
import Component from "@/models/Components";
import Favorite from "@/models/Favorites";
import { notFound } from 'next/navigation';

// Loading fallback component
function MealPlannerLoading() {
  return (
    <div className="w-full h-[calc(100vh-150px)] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
        <p className="mt-2 text-orange-600 font-medium">Loading your meal plan...</p>
      </div>
    </div>
  );
}

function getToday() {
    // Create date object using Eastern Time (ET)
    const options = { timeZone: 'America/New_York' };
    const etDate = new Date(new Date().toLocaleString('en-US', options));
    
    // Reset time to midnight (start of the day)
    etDate.setHours(0, 0, 0, 0);
    return etDate;
  }
  
  // Helper function to get day names for the next 7 days starting from today
  function getNextSevenDayNames() {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Get today's date in Eastern Time
    const options = { timeZone: 'America/New_York' };
    const today = new Date(new Date().toLocaleString('en-US', options));
    
    // Array to store the day names for the next 7 days
    const nextSevenDays = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
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

export async function fetchUserData(userId) {
  await connect();

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return null; // Will trigger notFound() in the component
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
    if (userMeals.length < 21) {
      // ...existing code...
    }

    // Fetch components and favorites
    const userComponents = await Component.find({
      userId: userId,
    }).lean();

    // Get the favorites - now using the updated schema
    const userFavorites = await Favorite.find({
      user_id: userId,
    }).lean();
    
    // Extract favorite meals directly from the favorites objects
    const favoriteMeals = userFavorites.map(favorite => favorite.meal || {});

    return { 
      favoriteMeals: convertIds(favoriteMeals), 
      userComponents: convertIds(userComponents), 
      userMeals: convertIds(userMeals),
      dayInfo: convertIds(nextSevenDays)
    };
    
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export default async function Dashboard({ params }) {
  const { userId } = await params;
  
  if (!userId) {
    notFound();
  }
  
  const userData = await fetchUserData(userId);
  
  if (!userData) {
    notFound();
  }
  
  const { favoriteMeals, userComponents, userMeals, dayInfo } = userData;

  return (
    <div className="bg-gray-100 min-h-screen">
      <LoggedInNav />
      <main className="w-full px-2 py-4">
        <Suspense fallback={<MealPlannerLoading />}>
          <MealPlanner 
            components={userComponents} 
            meals={userMeals} 
            favorites={favoriteMeals} 
            userId={userId}
            dayInfo={dayInfo}
          />
        </Suspense>
      </main>
    </div>
  );
}