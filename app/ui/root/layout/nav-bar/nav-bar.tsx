import NavBarLeft from "./nav-bar-left";
import NavBarDesktopMiddle from "./nav-bar-desktop-middle";
import NavBarRight from "./nav-bar-right";
import NavBarMobileRight from "./nav-bar-mobile-right";


// TODO: Update mobile menu button and move to left of screen.
const NavBar = () => {    
    return (
        <nav className='border-b border-gray-100'>
            <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
                <div className='relative flex h-14 items-center justify-between'>
                    <NavBarLeft />
                    <NavBarDesktopMiddle />
                    <div className="flex relative">
                        <NavBarRight />
                        <NavBarMobileRight />
                    </div>
                </div>
            </div>
        </nav>
    );
}
 
export default NavBar;