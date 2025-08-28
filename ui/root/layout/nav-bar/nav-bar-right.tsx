"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { FaGoogle } from "react-icons/fa";

import LoginButtons from "@/ui/auth/login-buttons";
import { withAuth, WithAuthProps } from "@/hocs/with-auth";
import LogoutButton from "@/ui/auth/logout-button";
import { useClickOutside } from "@/hooks/use-click-outside";

const NavBarRight = ({ session }: WithAuthProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileButtonRef = useRef<HTMLButtonElement>(null);
    const pathname = usePathname();

    const close = useCallback(() => setIsMenuOpen(false), []);

    useClickOutside([dropdownRef, mobileButtonRef], close, isMenuOpen)

    return (
        <>
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
                <button
                    ref={mobileButtonRef}
                    type="button"
                    id="mobile-menu-button"
                    className={`md:hidden z-40 block mobile-menu focus:outline-none mt-2 ml-4 ${isMenuOpen && "mobile-menu-open"}`}
                    aria-controls="mobile-menu"
                    aria-expanded="false"
                    onClick={() => setIsMenuOpen((prevState) => !prevState)}
                >
                    <span className="mobile-menu-top"></span>
                    <span className="mobile-menu-middle"></span>
                    <span className="mobile-menu-bottom"></span>
                </button>
            </div>
            
            {/* Mobile menu */}
            {isMenuOpen && (
                <div
                    ref={dropdownRef}
                    id="mobile-menu"
                    className="md:hidden absolute w-screen -mr-4 p-3 rounded-sm bg-white text-sm right-0 top-10 z-10 border border-gray-100 shadow-md flex flex-col items-center justify-center space-y-3"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="mobile-menu-button"
                    tabIndex={-1}
                >
                    <Link
                        href="/"
                        className={clsx(
                            "menu-btn",
                            {
                                "menu-btn-current-path": pathname === "/",
                                "menu-btn-not-current-path": pathname !== "/"
                            }
                        )}
                        onClick={() => setIsMenuOpen(false)}
                        role="menuitem"
                        id="mobile-menu-item-0"
                        tabIndex={-1}
                    >
                        Home
                    </Link>
                    <Link
                        href="/properties"
                        className={clsx(
                            "menu-btn",
                            {
                                "menu-btn-current-path": pathname === "/properties",
                                "menu-btn-not-current-path": pathname !== "/properties"
                            }
                        )}
                        onClick={() => setIsMenuOpen(false)}
                        role="menuitem"
                        id="mobile-menu-item-1"
                        tabIndex={-1}
                >
                        Properties
                    </Link>
                    {session ? (
                        <Link
                            href="/properties/add"
                            className={clsx(
                                "menu-btn",
                                {
                                    "menu-btn-current-path": pathname === "/properties/add",
                                    "menu-btn-not-current-path": pathname !== "/properties/add"
                                }
                            )}
                            onClick={() => setIsMenuOpen(false)}
                            role="menuitem"
                            id="mobile-menu-item-2"
                            tabIndex={-1}
                        >
                            Add Property
                        </Link>
                    ) : (
                        <>
                            <hr className="w-full border-t border-gray-200"/>
                            <LoginButtons
                                buttonClassName="flex items-center justify-center btn btn-login-logout w-full"
                                text="Login"
                                icon={<FaGoogle className="mr-2" />}
                            />
                        </>
                    )}
                    {session && (
                        <>
                            <hr className="w-full border-t border-gray-200"/>
                            <Link
                                href="/profile"
                                className={clsx(
                                    "menu-btn",
                                    {
                                        "menu-btn-current-path": pathname === "/profile",
                                        "menu-btn-not-current-path": pathname !== "/profile"
                                    }
                                )}
                                onClick={() => setIsMenuOpen(false)}
                                role="menuitem"
                                id="mobile-menu-item-4"
                                tabIndex={-1}
                            >
                                My Listings
                            </Link>
                            <Link
                                href="/properties/favorites"
                                className={clsx(
                                    "menu-btn",
                                    {
                                        "menu-btn-current-path": pathname === "/properties/favorites",
                                        "menu-btn-not-current-path": pathname !== "/properties/favorites"
                                    }
                                )}
                                onClick={() => setIsMenuOpen(false)}
                                role="menuitem"
                                id="mobile-menu-item-5"
                                tabIndex={-1}
                            >
                                Favorite Properties
                            </Link>

                            <hr className="w-full border-t border-gray-200"/>

                                <LogoutButton
                                    setIsMenuOpen={setIsMenuOpen}
                                    id="user-menu-item-2"
                                />

                            {/* <button
                                className="btn btn-login-logout w-full"
                                role="menuitem"
                                tabIndex={-1}
                                id="user-menu-item-6"
                                onClick={handleSignOutClick}
                            >
                                Sign Out
                            </button> */}
                        </>
                    )}
                </div>
            )}
        </>
    );
}
 
export default withAuth(NavBarRight);