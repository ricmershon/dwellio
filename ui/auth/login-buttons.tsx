"use client";

import { ReactNode } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import { useAuthProviders } from "@/hooks/use-auth-providers";

interface LoginButtonsProps {
    buttonClassName?: string;
    text?: string;
    icon?: ReactNode;
}

const LoginButtons = ({ buttonClassName = "", text = "Login", icon }: LoginButtonsProps) => {
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/"

    const providers = useAuthProviders();
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { credentials, ...otherProviders } = providers || {};

    if (!providers) return null;

    return (
        <>
            {Object.values(otherProviders).map((provider) => (
                <button
                    key={provider.id}
                    className={buttonClassName}
                    onClick={() => signIn(provider.id, { callbackUrl: returnTo })}
                >
                    {icon}
                    <span>{text}</span>
                </button>
            ))}
        </>
    );
}

export default LoginButtons;