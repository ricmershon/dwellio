import NavBarLeft from "./nav-bar-left";
import NavBarRight from "./nav-bar-right";
import NavBarDesktopMiddle from "./nav-bar-desktop-middle";
import NavBarDesktopRight from "./nav-bar-desktop-right";


const NavBar = () => {    
    return (
        <nav className='border-b border-gray-100'>
            <div className='mx-auto max-w-7xl px-4 md:px-6 lg:px-8'>
                <div className='relative flex h-15 md:h-11 items-center justify-between'>
                    <NavBarLeft />
                    <NavBarDesktopMiddle />
                    <div className="flex relative">
                        <NavBarDesktopRight />
                        <NavBarRight />
                    </div>
                </div>
            </div>
        </nav>
    );
}
 
export default NavBar;