import Link from "next/link";
import CustomButton from "./ui/CustomButton";

const Navbar = () => {
    return (
        <nav className="flex justify-between items-center p-4 bg-white shadow-md">
            <Link href="/">
                <div className="text-xl font-bold bg-orange-600 text-white px-10 py-4 rounded-md cursor-pointer">
                    Meal Match
                </div>
            </Link>
            <div className="space-x-6 text-gray-700">
            <Link href="/about">
                <span className="hover:text-orange-500">ABOUT</span>
            </Link>
                <a href="#" className="hover:text-orange-500">TEMPLATES</a>
                <a href="#" className="hover:text-orange-500">PRICING</a>
                <Link href="/login">
                    <CustomButton className="bg-orange-500 text-white hover:bg-orange-500">
                        LOGIN
                    </CustomButton>
                </Link>
                
                <Link href="/register">
                    <CustomButton className="border border-gray-400 hover:bg-gray-200">
                        SIGN UP
                    </CustomButton>
                </Link>
            </div>
        </nav>
    );
}

export default Navbar;