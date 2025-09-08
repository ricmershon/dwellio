import { Suspense } from "react";
import { redirect } from "next/navigation";

import LoginUI from "@/ui/login/login-ui";
import DwellioLogo from "@/ui/shared/logo";
import { getSessionUser } from "@/utils/get-session-user";

export const dynamic = "force-dynamic";

const LoginPage = async () => {
    /**
     * Redirect to the home page if user logged in.
     */
    const sessionUser = await getSessionUser();
    if (sessionUser) {
        redirect("/");
    }

    return (
        <div className="flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <DwellioLogo />
                </div>

                {/* Main Signin/Signup Form */}
                <Suspense fallback={<div>Loading...</div>}>
                    <LoginUI />
                </Suspense>
                
                {/* Account Linking Info */}
                <div className="p-4 bg-blue-50 rounded-lg shadow-lg">
                    <div className="text-sm text-blue-800">
                        <h3 className="font-medium text-lg">Account Linking</h3>
                        <div className="text-sm">
                            If you have an existing Google account with this email, 
                            creating a password will link both sign-in methods to the same account.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
 
export default LoginPage;