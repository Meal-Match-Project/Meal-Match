'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LoggedInNav from "@/app/components/LoggedInNav";  // ✅ Ensure this component exists
import MealGrid from "@/app/components/MealPlanner";  // ✅ Keep old structure

export default function Dashboard() {
    const { userId: urlUserId } = useParams();  // Get userId from URL
    const router = useRouter();
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");

        if (urlUserId) {
            setUserId(urlUserId);
            localStorage.setItem("userId", urlUserId);  // Save to localStorage
        } else if (storedUserId) {
            setUserId(storedUserId);
            router.replace(`/dashboard/${storedUserId}`);  // Redirect to correct URL
        } else {
            console.error("🚨 No valid userId found! Redirecting to login.");
            router.push("/login"); // Redirect to login if no userId
        }
    }, [urlUserId]);

    if (!userId) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <LoggedInNav />
            <main className="relative">
                <h1 className="bg-gray-100 text-2xl font-bold px-8 py-4">My Week</h1>
                <MealGrid userId={userId} />
            </main>
        </>
    );
}
