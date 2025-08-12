'use client';

import {
    createContext,
    useContext,
    useState,
    Dispatch,
    SetStateAction,
    ReactNode,
    useEffect,
} from 'react';
import { useSession } from 'next-auth/react';

import { getUnreadMessageCount } from '@/lib/actions/message-actions';

interface GlobalContextProps {
    isLoggedIn: boolean;
    unreadCount: number;
    setUnreadCount: Dispatch<SetStateAction<number>>;
}

const GlobalContext = createContext<GlobalContextProps>({
    isLoggedIn: false,
    unreadCount: 0,
    setUnreadCount: (() => undefined) as Dispatch<SetStateAction<number>>,
});

export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const { data: session } = useSession();

    /**
     * Track logged in state and message count
     */
    useEffect(() => {
        if (session && session.user) {
            setIsLoggedIn(true);
            getUnreadMessageCount().then((result) => {
                if (result.unreadCount) {
                    setUnreadCount(result.unreadCount);
                }
            })
        }
    }, [session])

    return (
        <GlobalContext.Provider value={{ isLoggedIn, unreadCount, setUnreadCount }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);