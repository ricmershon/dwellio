'use client';

import React, { ComponentType, ReactNode } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import type { Session as NextAuthSession } from 'next-auth';

type SessionRenderProps = {
    session: NextAuthSession | null;
    signIn: typeof nextAuthSignIn;
    signOut: typeof nextAuthSignOut;
};

export const Session = ({ children }: { children: (args: SessionRenderProps) => ReactNode }) => {
    const { data: session } = useSession();
    return <>{children({ session: session ?? null, signIn: nextAuthSignIn, signOut: nextAuthSignOut })}</>;
}

export function withSession<P extends { session: NextAuthSession | null; signIn: typeof nextAuthSignIn; signOut: typeof nextAuthSignOut }>(WrappedComponent: ComponentType<P>) {
    const WithSession = (props: Omit<P, 'session' | 'signIn' | 'signOut'>) => {
        const { data: session } = useSession();
        return (
            <WrappedComponent
                {...props as P}
                session={session ?? null}
                signIn={nextAuthSignIn}
                signOut={nextAuthSignOut}
            />
        );
    };

    const wrappedName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    WithSession.displayName = `withSession(${wrappedName})`;

    return WithSession;
}

