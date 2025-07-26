'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";
import { HiOutlineBell } from "react-icons/hi2";
import { signOut, signIn, LiteralUnion, ClientSafeProvider, getProviders } from "next-auth/react";
import { BuiltInProviderType } from "next-auth/providers/index";
import Link from "next/link";
import Image from "next/image";

import profileDefaultImage from '@/assets/images/profile.png';
import { useGlobalContext } from "@/app/context/global-context";
import UnreadMessageCount from "@/app/ui/messages/unread-message-count";

const NavBarRight = () => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [providers, setProviders] = useState<
        Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null
    >(null);

    const { data: session } = useSession();

    useEffect(() => {
        const setAuthProviders = async () => {
            const response = await getProviders();
            setProviders(response);
        }

        setAuthProviders();
    }, []);
    
    const { unreadCount } = useGlobalContext();

    const profileImage = session?.user?.image;

    return (
        <>
            {session ? (
                // Logged in
                <div className="flex items-center pr-2">
                    <Link className='relative group' href='/messages'>
                        <HiOutlineBell className='relative size-8 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'/>
                        {unreadCount > 0 && <UnreadMessageCount unreadCount={unreadCount} />}
                        
                    </Link>

                    {/* Profile dropdown button */}
                    <div className="ml-5">
                        <div>
                            <button
                                type="button"
                                className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
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
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                >
                                    Your Profile
                                </Link>
                                <Link
                                    href="/properties/favorites"
                                    className="block px-4 py-2 text-sm text-gray-700"
                                    role="menuitem"
                                    tabIndex={-1}
                                    id="user-menu-item-2"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                >
                                    Favorite Properties
                                </Link>
                                <button
                                    className="block px-4 py-2 text-sm text-gray-700 cursor-pointer"
                                    role="menuitem"
                                    tabIndex={-1}
                                    id="user-menu-item-2"
                                    onClick={() => {
                                        setIsProfileDropdownOpen(false);
                                        signOut();
                                    }}
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
                                className="flex items-center btn btn-secondary rounded-md my-5"
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

export default NavBarRight;