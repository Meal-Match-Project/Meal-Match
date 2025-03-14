'use client';

import LoggedInNav from "@/app/components/LoggedInNav";
import MealGrid from "@/app/components/Grid";

export default function WeeklyGrid() {
    return(
        <>
            <LoggedInNav />
            <main className="relative">
                <h1 className="bg-gray-100 text-2xl font-bold px-8 py-4">My Week</h1>
                <MealGrid />
            </main>
            
        </>
    );
}