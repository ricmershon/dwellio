// Mock for react-toastify
export const toast = {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
};

export const ToastContainer = ({ children }: { children: React.ReactNode }) => children;