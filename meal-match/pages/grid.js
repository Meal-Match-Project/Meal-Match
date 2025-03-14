'use client';

import LoggedInNav from "../src/app/components/LoggedInNav";
import MealGrid from "@/app/components/Grid";

export default function WeeklyGrid() {
    return(
        <>
            <LoggedInNav />
            <main className="relative">
                <MealGrid />
            </main>
            
        </>
    );
}