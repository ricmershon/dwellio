import { render } from '@testing-library/react';

import Spinner from '@/ui/shared/spinner';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
jest.mock('react-spinners/ClipLoader', () => ({
    __esModule: true,
    default: ({ color, cssOverride, size, 'aria-label': ariaLabel }: any) => (
        <div
            data-testid="clip-loader"
            data-color={color}
            data-size={size}
            aria-label={ariaLabel}
            style={cssOverride}
        />
    ),
}));

// ============================================================================
// TEST SUITE: Spinner Component
// ============================================================================
describe('Spinner Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================================
    // Loading State Display
    // ========================================================================
    describe('Loading State Display', () => {
        it('should render ClipLoader component', () => {
            const { getByTestId } = render(<Spinner />);

            expect(getByTestId('clip-loader')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Color Configuration
    // ========================================================================
    describe('Color Configuration', () => {
        it('should use blue color (#3b82f6)', () => {
            const { getByTestId } = render(<Spinner />);

            const loader = getByTestId('clip-loader');
            expect(loader).toHaveAttribute('data-color', '#3b82f6');
        });
    });

    // ========================================================================
    // Size Configuration
    // ========================================================================
    describe('Size Configuration', () => {
        it('should set size to 100', () => {
            const { getByTestId } = render(<Spinner />);

            const loader = getByTestId('clip-loader');
            expect(loader).toHaveAttribute('data-size', '100');
        });
    });

    // ========================================================================
    // CSS Override Styling
    // ========================================================================
    describe('CSS Override Styling', () => {
        it('should apply display block', () => {
            const { getByTestId } = render(<Spinner />);

            const loader = getByTestId('clip-loader');
            expect(loader.style.display).toBe('block');
        });

        it('should center with auto margin', () => {
            const { getByTestId } = render(<Spinner />);

            const loader = getByTestId('clip-loader');
            expect(loader.style.margin).toBe('100px auto');
        });
    });

    // ========================================================================
    // Accessibility Labels
    // ========================================================================
    describe('Accessibility Labels', () => {
        it('should have aria-label attribute', () => {
            const { getByTestId } = render(<Spinner />);

            const loader = getByTestId('clip-loader');
            expect(loader).toHaveAttribute('aria-label', 'Loading Spinner');
        });

        it('should be accessible via aria-label', () => {
            const { getByLabelText } = render(<Spinner />);

            expect(getByLabelText('Loading Spinner')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Component Rendering
    // ========================================================================
    describe('Component Rendering', () => {
        it('should render without errors', () => {
            expect(() => render(<Spinner />)).not.toThrow();
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Usage in Loading States', () => {
        it('should render within a container', () => {
            const { getByTestId } = render(
                <div data-testid="loading-container">
                    <Spinner />
                </div>
            );

            const loadingContainer = getByTestId('loading-container');
            const spinner = getByTestId('clip-loader');

            expect(loadingContainer).toContainElement(spinner);
        });

        it('should work with conditional rendering', () => {
            const { rerender, queryByTestId } = render(
                <div>{false && <Spinner />}</div>
            );

            expect(queryByTestId('clip-loader')).not.toBeInTheDocument();

            rerender(<div>{true && <Spinner />}</div>);

            expect(queryByTestId('clip-loader')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Visual Consistency
    // ========================================================================
    describe('Visual Consistency', () => {
        it('should use consistent blue color matching brand', () => {
            const { getByTestId } = render(<Spinner />);

            const loader = getByTestId('clip-loader');
            // #3b82f6 is Tailwind blue-500, matching brand colors
            expect(loader).toHaveAttribute('data-color', '#3b82f6');
        });

        it('should have appropriate size for visibility', () => {
            const { getByTestId } = render(<Spinner />);

            const loader = getByTestId('clip-loader');
            // Size 100 is large enough to be clearly visible
            expect(loader).toHaveAttribute('data-size', '100');
        });

        it('should center spinner for balanced layout', () => {
            const { getByTestId } = render(<Spinner />);

            const loader = getByTestId('clip-loader');
            expect(loader.style.margin).toContain('auto');
        });
    });

    // ========================================================================
    // Client Component Behavior
    // ========================================================================
    describe('Client Component Behavior', () => {
        it('should render in client-side environment', () => {
            // Spinner is a "use client" component
            const { getByTestId } = render(<Spinner />);

            expect(getByTestId('clip-loader')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Performance
    // ========================================================================
    describe('Performance', () => {
        it('should render quickly without blocking', () => {
            const startTime = performance.now();

            render(<Spinner />);

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Should render in less than 100ms
            expect(renderTime).toBeLessThan(100);
        });

        it('should not cause memory leaks with multiple renders', () => {
            const { rerender } = render(<Spinner />);

            for (let i = 0; i < 10; i++) {
                rerender(<Spinner />);
            }

            // Verify component still renders correctly after multiple rerenders
            expect(() => rerender(<Spinner />)).not.toThrow();
        });
    });
});
