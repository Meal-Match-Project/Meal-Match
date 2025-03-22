import LoggedInNav from '@/app/components/LoggedInNav';
import Profile from '@/app/components/Profile';

export default function ProfilePage() {
    
    return(
        <>
        <LoggedInNav />
        <main className="relative">
            <Profile />
        </main>
        </>
    );
}