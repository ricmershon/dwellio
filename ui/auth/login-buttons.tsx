'use client';

import { ReactNode } from 'react';
import { signIn } from 'next-auth/react';

import { useAuthProviders } from '@/hooks/use-auth-providers';

interface LoginButtonsProps {
    buttonClassName?: string;
    text?: string;
    icon?: ReactNode;
}

const LoginButtons = ({ buttonClassName = '', text = 'Login', icon }: LoginButtonsProps) => {
    const providers = useAuthProviders();

    if (!providers) return null;

    return (
        <>
            {Object.values(providers).map((provider) => (
                <button
                    key={provider.id}
                    className={buttonClassName}
                    onClick={() => signIn(provider.id)}
                >
                    {icon}
                    <span>{text}</span>
                </button>
            ))}
        </>
    );
}

export default LoginButtons;