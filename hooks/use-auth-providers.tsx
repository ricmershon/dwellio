import { useEffect, useState } from "react";
import { getProviders, ClientSafeProvider, LiteralUnion } from "next-auth/react";
import { BuiltInProviderType } from "next-auth/providers/index";

export const useAuthProviders = () => {
    const [providers, setProviders] = useState<
        Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null
    >(null);

    useEffect(() => {
        getProviders().then((response) => setProviders(response));
    }, []);

    return providers;
};