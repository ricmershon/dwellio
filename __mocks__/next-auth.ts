export const getServerSession = jest.fn()
export const signIn = jest.fn()
export const signOut = jest.fn()

export const useSession = jest.fn(() => ({
    data: null,
    status: 'unauthenticated'
}))

export const SessionProvider = ({ children }: { children: React.ReactNode }) => children

const nextAuth = {
    getServerSession,
    signIn,
    signOut,
    useSession,
    SessionProvider
}

export default nextAuth