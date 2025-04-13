import LoggedInNav from "@/components/LoggedInNav";
import ComponentsPage from "@/components/ComponentsPage"; // Updated import path
import connect from "@/lib/mongodb";
import { getUserComponentData } from "@/services/apiService"; // Using apiService instead of direct model access

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

export async function getComponents(userId) {
    try {
        // Using apiService to get user components
        const componentsData = await getUserComponentData(userId);
        return convertIds(componentsData.components || []);
    } catch (error) {
        console.error("Error fetching components:", error);
        return [];
    }
}

export default async function ComponentsPageWrapper({ params }) {
    const { userId } = await params;
    const components = await getComponents(userId);
    
    return (
        <div className="bg-gray-100 min-h-screen">
            <LoggedInNav />
            <main className="relative">
                <ComponentsPage userId={userId} components={components} />
            </main>
        </div>
    );
}