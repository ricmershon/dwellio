'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BellAlertIcon } from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/24/solid";
import { FaGoogle } from 'react-icons/fa'

import profileDefault from '@/assets/images/profile.png';

const NavBar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const pathname = usePathname();

    return (
        <nav className='bg-blue-700 border-b border-blue-500'>
            <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
                <div className='relative flex h-18 items-center justify-between'>

                    {/* Mobile menu button */}
                    <div className='absolute inset-y-0 left-0 flex items-center md:hidden'>

                        <button
                            type='button'
                            id='mobile-dropdown-button'
                            className='relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
                            aria-controls='mobile-menu'
                            aria-expanded='false'
                            onClick={() => setIsMobileMenuOpen((prevState) => !prevState)}
                        >
                            <span className='absolute -inset-0.5'></span>
                            <span className='sr-only'>Open main menu</span>
                            <svg
                                className='block h-6 w-6'
                                fill='none'
                                viewBox='0 0 24 24'
                                strokeWidth='1.5'
                                stroke='currentColor'
                                aria-hidden='true'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Menu left side */}
                    <div className='flex flex-1 items-center justify-center md:justify-start'>

                        {/* Logo */}
                        <Link
                            className='flex flex-shrink-0 items-center' href='/' >
                            <HomeIcon className='h-10 w-auto text-blue-700 rounded-full p-[4px] bg-white' />
                            <span
                                className="hidden md:block text-xl text-white ml-2"
                            >
                                dwellio
                            </span>
                        </Link>

                        {/* Desktop menu left side */}
                        <div className="hidden md:ml-8 md:block">
                            <div className="flex space-x-5">
                                <Link
                                    href='/'
                                    className={`${pathname === '/'
                                        && 'border-b border-white'
                                    } text-white hover:border-b hover:border-white`}
                                >
                                    Home
                                </Link>
                                <Link
                                    href='/properties'
                                    className={`${pathname === '/properties'
                                        && 'border-b border-white'
                                    } text-white hover:border-b hover:border-white`}
                                >
                                    Properties
                                </Link>
                                {isLoggedIn && (
                                    <Link
                                        href='/properties/add'
                                        className={`${pathname === '/properties/add'
                                            && 'border-b border-white'
                                        } text-white hover:border-b hover:border-white`}
                                    >
                                        Add Property
                                    </Link>                        
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right side menus */}
                    {isLoggedIn ? (
                        // Logged in
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:static md:inset-auto md:ml-6 md:pr-0">
                            <Link className='relative group' href='/messages'>
                                <BellAlertIcon className='relative h-8 w-8 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'/>
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center h-[18px] w-[18px] text-[12px] leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                                    1
                                </span>
                            </Link>
    
                            {/* Profile dropdown button */}
                            <div className="relative ml-5">
                                <div>
                                    <button
                                        type="button"
                                        className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                        id="user-menu-button"
                                        aria-expanded="false"
                                        aria-haspopup="true"
                                        onClick={() => setIsProfileDropdownOpen((prevState) => !prevState)}
                                    >
                                    <span className="absolute -inset-1.5"></span>
                                    <span className="sr-only">Open user menu</span>
                                    <Image
                                        className="h-8 w-8 rounded-full"
                                        height={32}
                                        width={32}
                                        src={profileDefault}
                                        alt=""
                                    />
                                    </button>
                                </div>
    
                                {/* Profile dropdown menu */}
                                {isProfileDropdownOpen && (
                                    <div
                                        id="user-menu"
                                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu-button"
                                        tabIndex={-1}
                                    >
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700"
                                            role="menuitem"
                                            tabIndex={-1}
                                            id="user-menu-item-0"
                                        >
                                            Your Profile
                                        </Link>
                                        <Link
                                            href="/properties/saved"
                                            className="block px-4 py-2 text-sm text-gray-700"
                                            role="menuitem"
                                            tabIndex={-1}
                                            id="user-menu-item-2"
                                        >
                                            Saved Properties
                                        </Link>
                                        <button
                                            className="block px-4 py-2 text-sm text-gray-700"
                                            role="menuitem"
                                            tabIndex={-1}
                                            id="user-menu-item-2"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Logged out
                        <div className="hidden md:block md:ml-6">
                            <div className="flex items-center">
                                <button className="flex items-center text-white bg-gray-700 hover:bg-gray-900 hover:text-white rounded-md px-3 py-2 my-5">
                                    <FaGoogle className='text-white mr-2' />
                                    <span>Login or Register</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile menu, items shown or hidden based on menu state */}
            {isMobileMenuOpen && (
                <div id='mobile-menu'>
                    <div className="space-y-1 px-2 pb-3 pt-2">
                        <Link
                            href='/'
                            className={`${pathname === '/' && 'bg-black'} text-white block rounded-md px-3 py-2 text-base font-medium`}
                        >
                            Home
                        </Link>
                        <Link
                            href='/properties'
                            className={`${pathname === '/properties' && 'bg-black'} text-white block rounded-md px-3 py-2 text-base font-medium`}
                        >
                            Properties
                        </Link>
                        {isLoggedIn ? (
                            <Link
                                href='/properties/add'
                                className={`${pathname === '/properties/add' && 'bg-black'} text-white block rounded-md px-3 py-2 text-base font-medium`}
                            >
                                Add Property
                            </Link>
                        ) : (
                            <button className="flex items-center text-white bg-gray-700 hover:bg-gray-900 hover:text-white rounded-md px-3 py-2 my-2">
                                <FaGoogle className='text-white mr-2' />
                                <span>Login or Register</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
 
export default NavBar;