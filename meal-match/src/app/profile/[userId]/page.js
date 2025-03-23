import LoggedInNav from '@/app/components/LoggedInNav';
import Profile from '@/app/components/Profile';

export default async function ProfilePage({ params }) {
    const { userId } = await params;
    
    return (
        <>
            <LoggedInNav />
            <main className="relative">
                <Profile userId={userId} />
            </main>
        </>
    );
}