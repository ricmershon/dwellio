import Link from "next/link";
import { HiHome } from "react-icons/hi2";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 py-4 mt-24">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
                <div className="mb-4 md:mb-0">
                    <HiHome className="h-8 w-auto text-gray-100 rounded-full p-[4px] bg-blue-800" />
                </div>
                <div className="flex flex-wrap justify-center md:justify-start mb-4 md:mb-0">
                    <ul className="flex space-x-4">
                        <li><Link href="/properties">Properties</Link></li>
                        <li><Link href="/terms.html">Terms of Service</Link></li>
                    </ul>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mt-2 md:mt-0">
                        &copy; {currentYear} Dwellio. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
 
export default Footer;