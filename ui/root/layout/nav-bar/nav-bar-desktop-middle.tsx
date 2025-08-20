'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

import { withSession, WithSessionProps } from "@/hocs/with-session";

const NavBarDesktopMiddle = ({ session }: WithSessionProps) => {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:flex-shrink-1 md:items-center md:justify-center">
            <div className="hidden md:block">
                <div className="flex space-x-3">
                    <Link
                        href='/'
                        className={`${pathname === '/'
                            ? 'menu-btn-desktop-current-path'
                            : 'menu-btn-not-current-path'
                        } menu-btn w-auto`}
                    >
                        Home
                    </Link>
                    <Link
                        href='/properties'
                        className={`${pathname === '/properties'
                            ? 'menu-btn-desktop-current-path'
                            : 'menu-btn-not-current-path'
                        } menu-btn w-auto`}
                    >
                        Properties
                    </Link>
                    {session && (
                        <Link
                            href='/properties/add'
                        className={`${pathname === '/properties/add'
                                ? 'menu-btn-desktop-current-path'
                                : 'menu-btn-not-current-path'
                            } menu-btn w-auto`}
                        >
                            Add Property
                        </Link>                        
                    )}
                </div>
            </div>
        </div>
    );
}

export default withSession(NavBarDesktopMiddle);