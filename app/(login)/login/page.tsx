
import LoginUI from "@/ui/login/login-ui";
import DwellioLogo from "@/ui/shared/logo";
import { Suspense } from "react";

const LoginPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6">
                {/* Main Login/Signup Form */}
                <Suspense fallback={<div>Loading...</div>}>
                    <LoginUI />
                </Suspense>
                
                {/* Account Linking Info */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">Account Linking</div>
                        <div>
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