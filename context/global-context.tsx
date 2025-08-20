"use client";

import React, {
    createContext,
    useContext,
    useState,
    Dispatch,
    SetStateAction,
    ReactNode,
    useEffect,
    useMemo
} from "react";
import { useSession } from "next-auth/react";

import { getUnreadMessageCount } from "@/lib/actions/message-actions";
import { StaticInputsDocument } from "@/models";

interface GlobalContextProps {
    isLoggedIn: boolean;
    unreadCount: number;
    setUnreadCount: Dispatch<SetStateAction<number>>;
    staticInputs: StaticInputsDocument | null;
}

const GlobalContext = createContext<GlobalContextProps>({
    isLoggedIn: false,
    unreadCount: 0,
    setUnreadCount: (() => undefined) as Dispatch<SetStateAction<number>>,
    staticInputs: null
});

interface GlobalContextProviderProps {
    children: ReactNode,
    initialStaticInputs: StaticInputsDocument
}

export const GlobalContextProvider = ({ children, initialStaticInputs }: GlobalContextProviderProps) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const { data: session } = useSession();

    /**
     * Keep auth state and message count in sync
     */
    useEffect(() => {
        if (session && session.user) {
            getUnreadMessageCount().then((result) => {
                if (result.unreadCount) {
                    setUnreadCount(result.unreadCount);
                }
            })
        }
    }, [session]);

    const isLoggedIn = Boolean(session?.user);
    
    const value = useMemo(() => ({
        isLoggedIn,
        unreadCount,
        setUnreadCount,
        staticInputs: initialStaticInputs
    }), [initialStaticInputs, isLoggedIn, unreadCount]);

    return (
        <GlobalContext.Provider value={value}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);

export const useStaticInputs = () => {
    const { staticInputs } = useGlobalContext();
    return {
        propertyTypes: staticInputs?.property_types ?? [],
        amenities: staticInputs?.amenities ?? []
    }
}