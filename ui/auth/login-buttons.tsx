"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import { useAuthProviders } from "@/hooks/use-auth-providers";
import Google__G__logo from "@/assets/images/Google__G__logo.svg";
import Image from "next/image";

const LoginButtons = () => {
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/"

    const providers = useAuthProviders();
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { credentials, ...otherProviders } = providers || {};

    if (!providers) return null;

    return (
        <>
            {Object.values(otherProviders).map((provider) => {
                let logo;
                let alt: string = "";
                let text: string = "";

                if (provider.id === 'google') {
                    logo = Google__G__logo;
                    alt = "Google logo";
                    text = "Continue with Google"
                }

                return (
                    <button
                        key={provider.id}
                        className="btn btn-login-logout flex items-center w-full content-center"
                        onClick={() => signIn(provider.id, { callbackUrl: returnTo })}
                    >
                        <Image
                            src={logo}
                            width={20}
                            height={20}
                            alt={alt}
                            className="mr-2"
                        />
                        {/* <div className="grow-0 shrink basis-[0%]">{icon}</div> */}
                        <div className="grow-1 shrink basis-[0%]">{text}</div>
                        <div className="grow-0 shrink basis-[0%]"></div>
                    </button>
                )
            })}
        </>
    );
}

export default LoginButtons;