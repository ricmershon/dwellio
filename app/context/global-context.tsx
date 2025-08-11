'use client';

import { useSession } from 'next-auth/react';
import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
  useEffect,
} from 'react';

import { getUnreadMessageCount } from '@/app/lib/actions/message-actions';

interface GlobalContextProps {
    unreadCount: number;
    setUnreadCount: Dispatch<SetStateAction<number>>;
    // Screen width tracking
    screenWidth: number;
    setScreenWidth: Dispatch<SetStateAction<number>>;
}

const GlobalContext = createContext<GlobalContextProps>({
    unreadCount: 0,
    setUnreadCount: (() => undefined) as Dispatch<SetStateAction<number>>,
    // Defaults for screen width
    screenWidth: 0,
    setScreenWidth: (() => undefined) as Dispatch<SetStateAction<number>>,
});

export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [screenWidth, setScreenWidth] = useState<number>(0);

    const { data: session } = useSession();

    useEffect(() => {
        if (session && session.user) (
            getUnreadMessageCount().then((result) => {
                if (result.unreadCount) {
                    setUnreadCount(result.unreadCount);
                }
            })
        )
    }, [session])

    // Track screen width on mount and on resize
    useEffect(() => {
        const updateWidth = () => setScreenWidth(window.innerWidth);
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    return (
        <GlobalContext.Provider value={{ unreadCount, setUnreadCount, screenWidth, setScreenWidth }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);