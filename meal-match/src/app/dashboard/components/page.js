'use client';

import LoggedInNav from "../../components/LoggedInNav";
import FoodList from "@/app/components/FoodList";
import ComponentsPage from "@/app/components/ComponentsPage";

export default function WeeklyGrid() {
    const items = [
        { id: 1, name: "Garlic-herb chicken", type: "component" },
        { id: 2, name: "Jasmine rice", type: "component" },
        { id: 3, name: "Steamed broccoli", type: "component" },
        { id: 4, name: "Spaghetti", type: "component" },
    ];

    function handleMenuClick() {
        return;
    }
    return(
        <>
            <LoggedInNav />
            <main className="relative">
                {/* <div className="max-w-4xl mx-auto p-6 space-y-8">
                    <FoodList items={items} listName="This Week" listColor="bg-gradient-to-r from-red-400 to-orange-500" handleMenuClick={handleMenuClick} />
                </div>
                 */}
                <ComponentsPage />
            </main>
            
        </>
    );
}