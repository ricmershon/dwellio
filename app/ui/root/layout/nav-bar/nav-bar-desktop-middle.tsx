'use client';

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavBarDesktopMiddle = () => {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:flex-shrink-1 md:items-center md:justify-center">
            <div className="hidden md:block">
                <div className="flex space-x-5">
                    <Link
                        href='/'
                        className={`${pathname === '/'
                            && 'border-b border-blue-800'
                        } text-blue-800 hover:border-b text-sm hover:border-blue-800`}
                    >
                        Home
                    </Link>
                    <Link
                        href='/properties'
                        className={`${pathname === '/properties'
                            && 'border-b border-blue-800'
                        } text-blue-800 hover:border-b text-sm hover:border-blue-800`}
                    >
                        Properties
                    </Link>
                    {session && (
                        <Link
                            href='/properties/add'
                            className={`${pathname === '/properties/add'
                                && 'border-b border-blue-800'
                            } text-blue-800 hover:border-b text-sm hover:border-blue-800`}
                        >
                            Add Property
                        </Link>                        
                    )}
                </div>
            </div>
        </div>
    );
}

export default NavBarDesktopMiddle;