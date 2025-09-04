"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { createCredentialsUser } from "@/lib/actions/user-actions";
import { ActionState, ActionStatus } from "@/types";
import Input from "../shared/input";
import LoginButtons from "../auth/login-buttons";
import { FaGoogle } from "react-icons/fa";

export default function LoginUI() {
    const [actionState, formAction, isPending] = useActionState(
        createCredentialsUser, {} as ActionState
    );

    const [isSignup, setIsSignup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    /**
     * Handle successful registration with auto-login.
     */
    useEffect(() => {
        if (actionState.status === ActionStatus.SUCCESS
            && actionState.shouldAutoLogin
            && actionState.email
            && actionState.password
        ) {
            let timeoutId: NodeJS.Timeout;
            
            const performAutoLogin = async () => {
                setSuccessMessage(actionState.message || "Account created successfully!");
                
                try {
                    const result = await signIn("credentials", {
                        email: actionState.email,
                        password: actionState.password,
                        action: "signin",
                        redirect: false
                    });

                    if (result?.error) {
                        setLoginError("Account created but login failed. Please try signing in manually.");
                        return;
                    }

                    // Store timeout ID for cleanup
                    timeoutId = setTimeout(() => {
                        router.push(callbackUrl);
                    }, actionState.isAccountLinked ? 2000 : 500);
                    
                } catch (error) {
                    setLoginError(`Login failed. Please try signing in manually: ${error}`);
                }
            };

            performAutoLogin();

            // Cleanup function to clear timeout
            return () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };
        }
    }, [
        actionState.email,
        actionState.isAccountLinked,
        actionState.message,
        actionState.password,
        actionState.shouldAutoLogin,
        actionState.status,
        callbackUrl,
        router
    ]);

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                email: email.toLowerCase().trim(),
                password,
                action: "signin",
                redirect: false
            });

            if (result?.error) {
                if (result.error.includes("Google account")) {
                    throw new Error(`This email is linked to Google. Try "Sign in with Google" or add a password by using "Create Account" below.`);
                } else {
                    throw new Error(result.error);
                }
            }

            router.push(callbackUrl);
        } catch (error) {
            setLoginError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setIsSignup(!isSignup);
        setLoginError("");
        setSuccessMessage("");
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                {isSignup ? "Create Account" : "Sign In"}
            </h2>

            {/* Success Message (for account linking) */}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <div className="font-medium">Success!</div>
                    <div className="text-sm">{successMessage}</div>
                </div>
            )}

            {/* Error Message */}
            {loginError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <div className="font-medium">Error</div>
                    <div className="text-sm">{loginError}</div>
                </div>
            )}

            {/* Error Messages */}
            {(actionState.error || loginError) && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <div className="font-medium">Error</div>
                    <div className="text-sm">{actionState.error || loginError}</div>
                </div>
            )}

            {isSignup ? (
                <form action={formAction} className="space-y-4">{/* Registration Form with useActionState */}
                    {/* Username */}
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        inputType="input"
                        placeholder="Enter a username"
                        label="Username (optional)"
                        disabled={isLoading || isPending}
                    />

                    {/* Email */}
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        inputType="input"
                        placeholder="your@email.com"
                        label="Email Address *"
                        disabled={isLoading || isPending}
                    />

                    {/* Password */}
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        inputType="input"
                        placeholder="Create a strong password"
                        label="Password *"
                        disabled={isLoading || isPending}
                    />
                    <div className="-mt-3 text-xs text-gray-500">
                        <div>Password requirements:</div>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                            <li>At least 8 characters long</li>
                            <li>Contains uppercase and lowercase letters</li>
                            <li>Contains at least one number</li>
                            <li>Contains at least one special character (@$!%*?&)</li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || isPending}
                        className="btn btn-login-logout h-10 w-full"
                    >
                        {(isLoading || isPending) ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Please wait...
                            </div>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleSignIn} className="space-y-4">{/* Sign In Form */}
                    {/* Email Field */}
                    <div>
                        <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            id="signin-email"
                            name="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="your@email.com"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700">
                            Password *
                        </label>
                        <input
                            type="password"
                            id="signin-password"
                            name="password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className=" w-full btn btn-login-logout"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Please wait...
                            </div>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
            )}

            {/* Switch between signin/signup */}
            <div className="mt-6 text-center">
                <button
                    onClick={switchMode}
                    disabled={isLoading || isPending}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:text-gray-400"
                >
                    {isSignup 
                        ? "Already have an account? Sign in." 
                        : `Don't have an account? Create one.`
                    }
                </button>
            </div>

            {/* OAuth Separator */}
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                </div>
            </div>
            
            {/* OAuth Providers (Google, etc.) */}
            <div className="mt-6">
                <LoginButtons />
            </div>
        </div>
    );
}