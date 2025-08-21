import { Dispatch, SetStateAction } from "react";
import { signOut } from "next-auth/react";

interface LoginButtonProps {
    setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
    id: string;
}

const LogoutButton = ({ setIsMenuOpen, id }: LoginButtonProps) => {
    const handleSignOutClick = () => {
        setIsMenuOpen(false);
        signOut({ callbackUrl: "/?loggedOut" });
    }

    return (
        <button
            className="btn btn-login-logout w-full"
            role="menuitem"
            tabIndex={-1}
            id={id}
            onClick={handleSignOutClick}
        >
            Sign Out
        </button>
    );
}
 
export default LogoutButton;