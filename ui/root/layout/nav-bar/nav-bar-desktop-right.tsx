"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import profileDefaultImage from "@/assets/images/profile.png";
import { withAuth, WithAuthProps } from "@/hocs/with-auth";
import LogoutButton from "@/ui/auth/logout-button";
import { useClickOutside } from "@/hooks/use-click-outside";

const NavBarDesktopRight = ({ session }: WithAuthProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    
    const profileImage = session?.user?.image;

    const close = useCallback(() => setIsMenuOpen(false), []);
    
    useClickOutside([menuButtonRef, dropdownRef], close, isMenuOpen);

    return (
        <>
            {session && (
                // Logged in
                <div className="flex items-center pr-2">

                    {/* Profile dropdown button */}
                    <div className="ml-5 hidden md:block">
                        <div>
                            <button
                                ref={menuButtonRef}
                                type="button"
                                className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-200 cursor-pointer"
                                id="user-menu-button"
                                aria-expanded="false"
                                aria-haspopup="true"
                                onClick={() => setIsMenuOpen((prevState) => !prevState)}
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
                        {isMenuOpen && (
                            <div
                                ref={dropdownRef}
                                id="user-menu"
                                className="absolute right-0 top-10 z-10 p-2 w-50 origin-top-right rounded-sm bg-white border-gray-100 shadow-md flex flex-col items-center justify-center space-y-2"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="user-menu-button"
                                tabIndex={-1}
                            >
                                <Link
                                    href="/profile"
                                    className={`${pathname === "/profile" ? "menu-btn-current-path" : "menu-btn-not-current-path"} menu-btn`}
                                    role="menuitem"
                                    tabIndex={-1}
                                    id="user-menu-item-0"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    My Listings
                                </Link>
                                <Link
                                    href="/properties/favorites"
                                    className={`${pathname === "/properties/favorites" ? "menu-btn-current-path" : "menu-btn-not-current-path"} menu-btn`}
                                    role="menuitem"
                                    tabIndex={-1}
                                    id="user-menu-item-1"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Favorite Properties
                                </Link>
                                <LogoutButton
                                    setIsMenuOpen={setIsMenuOpen}
                                    id="user-menu-item-2"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
};

export default withAuth(NavBarDesktopRight);