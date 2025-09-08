import { HomeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const DwellioLogo = () => (
    <Link
        className="flex flex-shrink-0 items-center justify-center"
        href="/"
    >
        <HomeIcon className="h-10 w-auto text-blue-800 p-[4px] bg-white" />
        <span className="block text-xl md:text-lg text-blue-800 ml-1">
            Dwellio
        </span>
    </Link>
);
 
export default DwellioLogo;