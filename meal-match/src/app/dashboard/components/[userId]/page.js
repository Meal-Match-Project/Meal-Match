import LoggedInNav from "../../../components/LoggedInNav";
import ComponentsPage from "@/app/components/ComponentsPage";
import connect from "@/lib/mongodb";
import Component from "@/models/Components";

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
    await connect();
    const components = await Component.find({ userId }).lean();
    return convertIds(components);
}

export default async function WeeklyGrid({ params }) {
    const { userId } = await params;
    const components = getComponents(userId);
    return(
        <>
            <LoggedInNav />
            <main className="relative">
                <ComponentsPage userId={userId} components={components} />
            </main>
            
        </>
    );
}