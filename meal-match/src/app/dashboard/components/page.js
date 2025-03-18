import LoggedInNav from "../../components/LoggedInNav";
import ComponentsPage from "@/app/components/ComponentsPage";

export default function WeeklyGrid() {
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