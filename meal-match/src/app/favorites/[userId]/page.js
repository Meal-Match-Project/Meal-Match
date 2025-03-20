import FavoriteMeals from "@/app/components/FavoriteMeals";
import LoggedInNav from "@/app/components/LoggedInNav";

export default function Favorites() {
    return(
        <>
            <LoggedInNav />
            <main className="relative">
                <FavoriteMeals />
            </main>
            
        </>
    );
}