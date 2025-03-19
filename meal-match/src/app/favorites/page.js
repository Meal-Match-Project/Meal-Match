import FavoriteMeals from "@/app/components/FavoriteMeals";
import LoggedInNav from "@/app/components/LoggedInNav";
import FavoritesParent from "../components/FavoritesParent";

export default function Favorites() {
    return(
        <>
            <LoggedInNav />
            <main className="relative">
                <FavoritesParent />
            </main>
            
        </>
    );
}