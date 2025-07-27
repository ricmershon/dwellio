import Link from "next/link";
import { IoHome } from 'react-icons/io5';

const NavBarLeft = () => (
    <Link
        className='flex flex-shrink-0 items-center'
        href='/'
    >
        <IoHome className='h-10 w-auto text-blue-800 p-[4px] bg-white' />
        <span className="block text-lg  text-blue-800 ml-2">
            dwellio
        </span>
    </Link>
);

export default NavBarLeft;