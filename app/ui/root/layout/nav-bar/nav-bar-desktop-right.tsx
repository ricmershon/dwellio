'use client';

import { useState } from "react";
import { signOut, signIn, useSession } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";
import { HiOutlineBell } from "react-icons/hi2";
import Link from "next/link";
import Image from "next/image";

import { useAuthProviders } from "@/app/hooks/use-auth-providers";
import profileDefaultImage from '@/assets/images/profile.png';
import { useGlobalContext } from "@/app/context/global-context";
import UnreadMessageCount from "@/app/ui/messages/unread-message-count";

const NavBarDesktopRight = () => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const { data: session } = useSession();
    
    const profileImage = session?.user?.image;
    const { unreadCount } = useGlobalContext();
    const providers = useAuthProviders();

    const handleSignOutClick = () => {
        setIsProfileDropdownOpen(false);
        signOut();
    }

    return (
        <>
            {session ? (
                // Logged in
                <div className="flex items-center pr-2">
                    <Link className='relative group' href='/messages'>
                        <HiOutlineBell className='size-8 rounded-full btn btn-login-logout p-1'/>
                        {unreadCount > 0 && <UnreadMessageCount unreadCount={unreadCount} />}
                        
                    </Link>

                    {/* Profile dropdown button */}
                    <div className="ml-5 hidden md:block">
                        <div>
                            <button
                                type="button"
                                className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-200 cursor-pointer"
                                id="user-menu-button"
                                aria-expanded="false"
                                aria-haspopup="true"
                                onClick={() => setIsProfileDropdownOpen((prevState) => !prevState)}
                            >
                            <span className="absolute inset-1.5"></span>
                            <span className="sr-only">Open user menu</span>
                            <Image
                                className="h-8 w-8 rounded-full"
                                height={40}
                                width={40}
                                src={profileImage || profileDefaultImage}
                                alt=""
                            />
                            </button>
                        </div>

                        {/* Profile dropdown menu */}
                        {isProfileDropdownOpen && (
                            <div
                                id="user-menu"
                                className="absolute right-0 top-10 z-10 p-2 w-50 origin-top-right rounded-sm bg-white border-gray-100 shadow-md flex flex-col items-center justify-center space-y-2"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="user-menu-button"
                                tabIndex={-1}
                            >
                                <Link
                                    href="/profile"
                                    className="menu-btn menu-btn-not-current-path"
                                    role="menuitem"
                                    tabIndex={-1}
                                    id="user-menu-item-0"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="/properties/favorites"
                                    className="menu-btn menu-btn-not-current-path"
                                    role="menuitem"
                                    tabIndex={-1}
                                    id="user-menu-item-1"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                >
                                    Favorite Properties
                                </Link>
                                <button
                                    className="btn btn-login-logout w-full"
                                    role="menuitem"
                                    tabIndex={-1}
                                    id="user-menu-item-2"
                                    onClick={handleSignOutClick}
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
                        {providers && Object.values(providers).map((provider) => (
                            <button
                                key={provider.id}
                                className="flex items-center btn btn-login-logout py-[6px] px-3"
                                onClick={() => signIn(provider.id)}
                            >
                                <FaGoogle className='mr-2' />
                                <span>Login</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
};

export default NavBarDesktopRight;