"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import { HiOutlineBell } from "react-icons/hi2";
import Link from "next/link";
import Image from "next/image";

import LoginButtons from "@/ui/auth/login-buttons";
import profileDefaultImage from "@/assets/images/profile.png";
import { useGlobalContext } from "@/context/global-context";
import UnreadMessageCount from "@/ui/messages/unread-message-count";
import { withAuth, WithAuthProps } from "@/hocs/with-auth";
import LogoutButton from "@/ui/auth/logout-button";

interface NavBarDesktopRightProps extends WithAuthProps {
    viewportWidth: number;
}

const NavBarDesktopRight = ({ viewportWidth, session }: NavBarDesktopRightProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    
    const profileImage = session?.user?.image;
    const { unreadCount } = useGlobalContext();

    return (
        <>
            {session ? (
                // Logged in
                <div className="flex items-center pr-2">
                    <Link className="relative group" href="/messages">
                        <HiOutlineBell className="size-8 rounded-full btn btn-login-logout p-1"/>
                        {unreadCount > 0 &&
                            <UnreadMessageCount
                                unreadCount={unreadCount}
                                viewportWidth={viewportWidth}
                            />
                        }
                        
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
                                    Profile
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
            ) : (
                // Logged out
                <div className="hidden md:block md:ml-6">
                    <div className="flex items-center">
                        <LoginButtons
                            buttonClassName="flex items-center btn btn-login-logout py-[6px] px-3"
                            text="Login"
                            icon={<FaGoogle className="mr-2" />}
                        />
                    </div>
                </div>
            )}
        </>
    )
};

export default withAuth(NavBarDesktopRight);