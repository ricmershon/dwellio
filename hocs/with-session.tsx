import { ComponentType } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

export interface WithSessionProps {
    session: Session | null;
}

export function withSession<P extends WithSessionProps>(
    WrappedComponent: ComponentType<P>
) {
    return function WithSession(props: Omit<P, keyof WithSessionProps>) {
        const { data: session } = useSession();

        return (
            <WrappedComponent
                {...(props as P)}
                session={session ?? null}
            />
        );
    };
}