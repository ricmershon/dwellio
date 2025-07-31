'use client';

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";

import { useAuthProviders } from "@/app/hooks/use-auth-providers";

const NavBarMobileRight = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { data: session } = useSession();
    const pathname = usePathname();

    const providers = useAuthProviders();

    const handleSignOutClick = () => {
        setIsMobileMenuOpen(false);
        signOut();
    }

    return (
        <>
            {/* Mobile menu button */}
            <div className='flex items-center md:hidden'>
                <button
                    type='button'
                    id='mobile-menu-button'
                    className={`z-40 block mobile-menu md:hidden focus:outline-none mt-2 ml-4 ${isMobileMenuOpen && 'mobile-menu-open'}`}
                    aria-controls='mobile-menu'
                    aria-expanded='false'
                    onClick={() => setIsMobileMenuOpen((prevState) => !prevState)}
                >
                    <span className="mobile-menu-top"></span>
                    <span className="mobile-menu-middle"></span>
                    <span className="mobile-menu-bottom"></span>
                </button>
            </div>
            
            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div
                    id="mobile-menu"
                    className="absolute w-75 px-3 py-3 rounded-md bg-white text-sm right-0 top-10 z-40 md:hidden border border-gray-100 shadow-md"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="mobile-menu-button"
                    tabIndex={-1}
                >
                    <div className="flex flex-col items-center justify-center w-full space-y-3">
                        <Link
                            href='/'
                            className={`${pathname === '/' ? 'menu-btn-current-path' : 'menu-btn-not-current-path'} menu-btn`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            role="menuitem"
                            id="mobile-menu-item-0"
                            tabIndex={-1}
                        >
                            Home
                        </Link>
                        <Link
                            href='/properties'
                            className={`${pathname === '/properties' ? 'menu-btn-current-path' : 'menu-btn-not-current-path'} menu-btn`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            role="menuitem"
                            id="mobile-menu-item-1"
                            tabIndex={-1}
                    >
                            Properties
                        </Link>
                        {session ? (
                            <Link
                                href='/properties/add'
                                className={`${pathname === '/properties/add' ? 'menu-btn-current-path' : 'menu-btn-not-current-path'} menu-btn`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                role="menuitem"
                                id="mobile-menu-item-2"
                                tabIndex={-1}
                            >
                                Add Property
                            </Link>
                        ) : (
                            <>
                                <hr className="w-full border-t border-gray-200"/>
                                {providers && Object.values(providers).map((provider) => (
                                    <button
                                        key={provider.id}
                                        className="flex items-center justify-center btn btn-login-logout w-full"
                                        role="menuitem"
                                        id="mobile-menu-item-3"
                                        tabIndex={-1}
                                        onClick={() => signIn(provider.id)}
                                    >
                                        <FaGoogle className='mr-2' />
                                        <span>Login</span>
                                    </button>
                                ))}
                            </>
                        )}
                        {session && (
                            <>
                                <hr className="w-full border-t border-gray-200"/>
                                <Link
                                    href='/profile'
                                    className={`${pathname === '/profile' ? 'menu-btn-current-path' : 'menu-btn-not-current-path'} menu-btn`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    role="menuitem"
                                    id="mobile-menu-item-4"
                                    tabIndex={-1}
                                >
                                    Your Profile
                                </Link>
                                <Link
                                    href='/properties/favorites'
                                    className={`${pathname === '/properties/favorites' ? 'menu-btn-current-path' : 'menu-btn-not-current-path'} menu-btn`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    role="menuitem"
                                    id="mobile-menu-item-5"
                                    tabIndex={-1}
                                >
                                    Favorite Properties
                                </Link>
                                <hr className="w-full border-t border-gray-200"/>

                                <button
                                    className="btn btn-login-logout w-full"
                                    role="menuitem"
                                    tabIndex={-1}
                                    id="user-menu-item-6"
                                    onClick={handleSignOutClick}
                                >
                                    Sign Out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
 
export default NavBarMobileRight;