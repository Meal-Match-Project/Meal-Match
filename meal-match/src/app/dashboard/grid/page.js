'use client';

import LoggedInNav from "../../components/LoggedInNav";
import MealGrid from "@/app/components/Grid";

export default function WeeklyGrid() {
    return(
        <>
            <LoggedInNav />
            <MealGrid />
        </>
    );
}