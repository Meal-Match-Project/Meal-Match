import LoggedInNav from "@/components/LoggedInNav";
import IngredientsPage from "@/components/IngredientsPage";
import connect from "@/lib/mongodb";
import Ingredient from "@/models/Ingredients";

// Helper function to convert ObjectIds to strings and ensure all data is serializable
function convertIds(docs) {
    return JSON.parse(JSON.stringify(docs, (key, value) => {
        // Convert MongoDB ObjectId to string
        if (key === '_id' || key === 'userId') {
            return value.toString();
        }
        // Handle Date objects
        if (value instanceof Date) {
            return value.toISOString();
        }
        return value;
    }));
}

// Fetch ingredients for a user
export async function getIngredients(userId) {
    await connect();
    
    try {
        const ingredients = await Ingredient.find({ userId }).lean();
        return convertIds(ingredients);
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        return [];
    }
}

export default async function Ingredients({ params }) {
    const { userId } = await params;
    const ingredients = await getIngredients(userId);
    
    return(
        <div className="bg-gray-100 min-h-screen">
            <LoggedInNav />
            <main className="relative">
                <IngredientsPage userId={userId} ingredients={ingredients} />
            </main>
        </div>
    );
}