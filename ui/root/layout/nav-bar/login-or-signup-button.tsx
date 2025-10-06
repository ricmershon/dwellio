import Link from "next/link";
import { useSearchParams } from "next/navigation";

const LoginOrSignupButton = () => {
    const searchParams = useSearchParams();
    let loginParams: URLSearchParams | null = null;

    const returnTo = searchParams.get("returnTo")

    if (returnTo !== null) {
        loginParams = new URLSearchParams({
            callbackUrl: returnTo
        });
    }
    
    return (
        <div className="block">
            
            <div className="flex items-center">
                <Link
                    href={`/login${loginParams ? `?${loginParams.toString()}` : ""}`}
                    className="btn btn-login-logout py-[6px] px-3"
                >
                    Log In or Sign Up
                </Link>
            </div>
        </div>
    );
}
 
export default LoginOrSignupButton;