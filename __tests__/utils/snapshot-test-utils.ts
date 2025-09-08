/**
 * Shared snapshot testing utilities to reduce snapshot duplication
 */
import { render } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Standard snapshot test for component rendering
 */
export const expectComponentSnapshot = (component: ReactElement, testName?: string) => {
    const { container } = render(component);
    expect(container).toMatchSnapshot(testName);
};

/**
 * Snapshot test for component with different states
 */
export const expectMultiStateSnapshot = (
    componentStates: { name: string; component: ReactElement }[]
) => {
    componentStates.forEach(({ name, component }) => {
        expectComponentSnapshot(component, name);
    });
};

/**
 * Standard loading state snapshot
 */
export const expectLoadingSnapshot = (component: ReactElement) => {
    expectComponentSnapshot(component, 'loading state');
};

/**
 * Standard error state snapshot
 */
export const expectErrorSnapshot = (component: ReactElement) => {
    expectComponentSnapshot(component, 'error state');
};

/**
 * Standard authenticated vs unauthenticated snapshot comparison
 */
export const expectAuthStateSnapshots = (
    authenticatedComponent: ReactElement,
    unauthenticatedComponent: ReactElement
) => {
    expectComponentSnapshot(authenticatedComponent, 'authenticated state');
    expectComponentSnapshot(unauthenticatedComponent, 'unauthenticated state');
};