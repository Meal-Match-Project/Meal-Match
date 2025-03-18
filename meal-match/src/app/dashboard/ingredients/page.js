import LoggedInNav from "@/app/components/LoggedInNav";
import IngredientsPage from "@/app/components/IngredientsPage";

export default function Ingredients() {
    return(
        <>
            <LoggedInNav />
            <main className="relative">
                <IngredientsPage />
            </main>
            
        </>
    );
}