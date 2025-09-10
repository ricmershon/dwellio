"use client";

import { useState, useEffect, useCallback } from "react";
import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { createCredentialsUser } from "@/lib/actions/user-actions";
import { ActionState, ActionStatus } from "@/types";
import LoginButtons from "@/ui/login/login-buttons";
import RegisterForm from "@/ui/login/register-form";
import SignInForm from "@/ui/login/signin-form";

export default function LoginUI() {
    const [actionState, formAction, isPending] = useActionState(
        createCredentialsUser, {} as ActionState
    );

    const [isRegister, setIsRegister] = useState(false);
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
        setSuccessMessage("");
        setLoginError("");

        if (actionState.status === ActionStatus.SUCCESS
            && actionState.shouldAutoLogin
            && actionState.email
            && actionState.password
            && actionState.message
        ) {            
            const performAutoLogin = async () => {
                setSuccessMessage(actionState.message || "Account created successfully.");
                
                try {
                    const result = await signIn("credentials", {
                        email: actionState.email,
                        password: actionState.password,
                        action: "signin",
                        redirect: false
                    });

                    if (result?.error) {
                        setLoginError(result.error);
                        return;
                    }

                    setSuccessMessage(prev => prev + " Loggin in...");

                    /**
                     * Short delay before logging in.
                     */
                    const timeoutId = setTimeout(() => {
                        router.push(callbackUrl);
                    }, 2000);

                    return () => clearTimeout(timeoutId);
                    
                } catch (error) {
                    setLoginError(`Login failed. Please try signing in manually: ${error}.`);
                }
            };

            performAutoLogin();

        } else if (actionState.status === ActionStatus.ERROR && actionState.message) {
            setLoginError(actionState.message);
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

    /**
     * Signin for existing users.
     */
    const handleSignIn = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsLoading(true);
        setLoginError("");

        const formData = new FormData(event.currentTarget);
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
                setLoginError(result.error);
            } else {
                router.push(callbackUrl);
            }

        } catch (error) {
            setLoginError(error instanceof Error ? error.message : "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [callbackUrl, router]);

    /**
     * SWitch between register and login modes.
     */
    const switchMode = () => {
        setIsRegister(!isRegister);
        setLoginError("");
        setSuccessMessage("");
    };

    /**
     * Clear login error and message when user clicks a field.
     */
    const handleClearInfo = useCallback(() => {
        setLoginError("");
        setSuccessMessage("");
    }, []);

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-2xl text-center">
                {isRegister ? "Create Account" : "Sign In"}
            </h1>

            {/* Switch between signin/signup */}
            <div className="text-center mb-4">
                <button
                    onClick={switchMode}
                    disabled={isLoading || isPending}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium hover:cursor-pointer disabled:text-gray-400"
                >
                    {isRegister 
                        ? "Already have an account? Sign in." 
                        : `Don't have an account? Create one.`
                    }
                </button>
            </div>

            <div className=" rounded-md shadow-lg p-6">
                {/* Success Message (for account linking) */}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        <div className="font-medium">Success</div>
                        <div className="text-sm">{successMessage}</div>
                    </div>
                )}

                {/* Error Messages */}
                {loginError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <h3 className="text-lg">Error</h3>
                        <div className="text-sm">{loginError}</div>
                    </div>
                )}

                {isRegister ? (
                    // Register
                    <RegisterForm
                        formAction={formAction}
                        isLoading={isLoading}
                        isPending={isPending}
                        handleClearInfo={handleClearInfo}
                    />
                ) : (
                    // Signin
                    <SignInForm
                        handleSignIn={handleSignIn}
                        isLoading={isLoading}
                        handleClearInfo={handleClearInfo}
                    />
                )}

                {/* Separator before OAuth login options */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white">or</span>
                        </div>
                    </div>
                </div>
                
                {/* OAuth Providers (Google, etc.) */}
                <div className="mt-6">
                    <LoginButtons />
                </div>
            </div>
        </div>
    );
}