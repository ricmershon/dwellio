/**
 * Shared toast notification testing utilities to reduce duplicate toast tests
 */
import { ActionStatus } from '@/types/types';

/**
 * Verifies dynamic toast notification based on action result status
 */
export const expectDynamicToast = (
    mockToast: any,
    status: typeof ActionStatus[keyof typeof ActionStatus],
    message: string
) => {
    expect(mockToast[status]).toHaveBeenCalledWith(message);
};

/**
 * Verifies success toast notification
 */
export const expectSuccessToast = (mockToast: any, message: string) => {
    expect(mockToast.success).toHaveBeenCalledWith(message);
};

/**
 * Verifies error toast notification
 */
export const expectErrorToast = (mockToast: any, message: string) => {
    expect(mockToast.error).toHaveBeenCalledWith(message);
};

/**
 * Verifies that no toast was called
 */
export const expectNoToast = (mockToast: any) => {
    expect(mockToast.success).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
    expect(mockToast.info).not.toHaveBeenCalled();
    expect(mockToast.warning).not.toHaveBeenCalled();
};

/**
 * Creates a mock action result for testing
 */
export const createMockActionResult = (
    status: typeof ActionStatus[keyof typeof ActionStatus],
    message: string
) => ({
    status,
    message
});

/**
 * Verifies toast behavior for different action result statuses
 */
export const expectToastByStatus = (
    mockToast: any,
    status: typeof ActionStatus[keyof typeof ActionStatus],
    message: string
) => {
    switch (status) {
        case ActionStatus.SUCCESS:
            expectSuccessToast(mockToast, message);
            break;
        case ActionStatus.ERROR:
            expectErrorToast(mockToast, message);
            break;
        default:
            expectDynamicToast(mockToast, status, message);
    }
};