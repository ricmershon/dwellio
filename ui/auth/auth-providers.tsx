'use client';

import React, { ComponentType, ReactNode } from 'react';
import { signIn as nextAuthSignIn, ClientSafeProvider, LiteralUnion } from 'next-auth/react';
import { BuiltInProviderType } from 'next-auth/providers/index';

import { useAuthProviders } from '@/hooks/use-auth-providers';

export type ProvidersRecord = Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null;

// Render-prop component
export const AuthProviders = ({ children }: { children: (args: { providers: ProvidersRecord, signIn: typeof nextAuthSignIn }) => ReactNode }) => {
    const providers = useAuthProviders();
    return <>{children({ providers, signIn: nextAuthSignIn })}</>;
}

// Higher-order component
export function withAuthProviders<P extends { providers: ProvidersRecord }>(WrappedComponent: ComponentType<P>) {
    const WithAuthProviders = (props: Omit<P, 'providers'>) => {
        const providers = useAuthProviders();
        return <WrappedComponent {...props as P} providers={providers} />;
    };

    const wrappedName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    WithAuthProviders.displayName = `withAuthProviders(${wrappedName})`;

    return WithAuthProviders;
}

