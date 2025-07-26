'use client';

import { useEffect, useState } from "react";
import { ClientSafeProvider, getProviders, LiteralUnion, signIn, useSession } from "next-auth/react";
import { BuiltInProviderType } from "next-auth/providers/index";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";


const NavBarMobileRight = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    const pathname = usePathname();

    return (
        <>
            {/* Mobile menu button */}
            <div className='flex items-center md:hidden'>
                <button
                    type='button'
                    id='mobile-dropdown-button'
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
                        <div id="mobile-menu" className="absolute w-50 px-2 py-3 rounded-md bg-white text-sm right-0 top-10 z-40 md:hidden border border-gray-100 shadow-md">
                <div className="flex flex-col items-center justify-center w-full space-y-3">
                    <Link
                        href='/'
                        className={`${pathname === '/' ? 'border-b border-blue-800 hover:cursor-default' : 'hover:bg-gray-100 rounded-md'} text-blue-800 px-3 py-2 text-sm font-medium w-full text-left`}
                    >
                        Home
                    </Link>
                    <Link
                        href='/properties'
                        className={`${pathname === '/properties' ? 'border-b border-blue-800 hover:cursor-default' : 'hover:bg-gray-100 rounded-md'} text-blue-800 px-3 py-2 text-sm font-medium w-full text-left`}
                    >
                        Properties
                    </Link>
                    {session ? (
                    <Link
                        href='/properties/add'
                        className={`${pathname === '/properties/add' ? 'border-b border-blue-800 hover:cursor-default' : 'hover:bg-gray-100 rounded-md'} text-blue-800 px-3 py-2 text-sm font-medium w-full text-left`}
                    >
                        Add Properties
                    </Link>
                    ) : (
                        <>
                            {providers && Object.values(providers).map((provider) => (
                                <button
                                key={provider.id}
                                    className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:text-white active:text-white bg-gray-100 hover:bg-gray-300 active:bg-gray-200 text-sm font-medium w-full text-left hover:cursor-pointer"
                                    onClick={() => signIn(provider.id)}
                                >
                                    <FaGoogle className='mr-2' />
                                    <span>Login</span>
                                </button>
                            ))}
                        </>
                    )}
                </div>
            </div>
            )}
        </>
    );
}
 
export default NavBarMobileRight;