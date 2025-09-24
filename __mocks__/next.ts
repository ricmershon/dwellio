// Mock for next/navigation
export const useRouter = () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
});

export const useSearchParams = () => new URLSearchParams();
export const usePathname = () => '/test';
export const redirect = jest.fn();