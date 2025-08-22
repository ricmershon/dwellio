import { ComponentType } from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

export interface WithAuthProps {
    session: Session | null;
}

export function withAuth<P extends WithAuthProps>(
    WrappedComponent: ComponentType<P>
) {
    return function WithAuth(props: Omit<P, keyof WithAuthProps>) {
        const { data: session } = useSession();

        return (
            <WrappedComponent
                {...(props as P)}
                session={session ?? null}
            />
        );
    };
}