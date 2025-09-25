// Mock for next/navigation
export const useRouter = jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
}));

export const useSearchParams = jest.fn(() => new URLSearchParams());
export const usePathname = jest.fn(() => '/test');
export const redirect = jest.fn();