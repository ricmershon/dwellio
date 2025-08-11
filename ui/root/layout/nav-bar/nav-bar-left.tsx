import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/solid";

const NavBarLeft = () => (
    <Link
        className='flex flex-shrink-0 items-center'
        href='/'
    >
        <HomeIcon className='h-10 w-auto text-blue-800 p-[4px] bg-white' />
        <span className="block text-xl md:text-lg text-blue-800 ml-1">
            Dwellio
        </span>
    </Link>
);

export default NavBarLeft;