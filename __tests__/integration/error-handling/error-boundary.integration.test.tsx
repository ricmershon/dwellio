/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorPage from '@/app/(root)/error';

// Custom Error Boundary for testing
class ErrorBoundary extends React.Component<
    { children: React.ReactNode; FallbackComponent?: React.ComponentType<{ error: Error }> },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch() {
        // Log error in real app
    }

    render() {
        if (this.state.hasError && this.state.error) {
            const FallbackComponent = this.props.FallbackComponent || (() => <div>Error occurred</div>);
            return <FallbackComponent error={this.state.error} />;
        }

        return this.props.children;
    }
}

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
jest.mock('next/link', () => {
    const MockLink = ({ children, href, className }: any) => (
        <a href={href} className={className}>{children}</a>
    );
    MockLink.displayName = 'MockLink';
    return MockLink;
});

jest.mock('react-icons/fa', () => ({
    FaExclamationCircle: () => <div data-testid="exclamation-icon">!</div>
}));

// Test components that throw errors
const ThrowError = ({ shouldThrow, message }: { shouldThrow: boolean; message: string }) => {
    if (shouldThrow) {
        throw new Error(message);
    }
    return <div data-testid="success-content">Success Content</div>;
};

const ThrowTypeError = () => {
    throw new TypeError('Type error in component');
};

const ThrowReferenceError = () => {
    throw new ReferenceError('Reference error in component');
};

describe('Error Boundary Integration', () => {
    // Suppress console.error in tests to avoid cluttering test output
    const originalError = console.error;
    beforeAll(() => {
        console.error = jest.fn();
    });

    afterAll(() => {
        console.error = originalError;
    });

    describe('Error Catching', () => {
        it('should catch component errors and display error page', () => {
            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowError shouldThrow={true} message="Component crashed" />
                </ErrorBoundary>
            );

            expect(screen.getByText(/Component crashed/i)).toBeInTheDocument();
            expect(screen.queryByTestId('success-content')).not.toBeInTheDocument();
        });

        it('should display error boundary fallback when error occurs', () => {
            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowError shouldThrow={true} message="Test error" />
                </ErrorBoundary>
            );

            // Error page elements should be visible
            expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /return home/i })).toBeInTheDocument();
        });

        it('should render children normally when no error occurs', () => {
            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowError shouldThrow={false} message="" />
                </ErrorBoundary>
            );

            expect(screen.getByTestId('success-content')).toBeInTheDocument();
            expect(screen.queryByText(/return home/i)).not.toBeInTheDocument();
        });

        it('should catch TypeError from components', () => {
            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowTypeError />
                </ErrorBoundary>
            );

            expect(screen.getByText(/Type error in component/i)).toBeInTheDocument();
        });

        it('should catch ReferenceError from components', () => {
            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowReferenceError />
                </ErrorBoundary>
            );

            expect(screen.getByText(/Reference error in component/i)).toBeInTheDocument();
        });
    });

    describe('Error State Display', () => {
        it('should display error icon when component fails', () => {
            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowError shouldThrow={true} message="Failed" />
                </ErrorBoundary>
            );

            expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument();
        });

        it('should display return home link when component fails', () => {
            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowError shouldThrow={true} message="Failed" />
                </ErrorBoundary>
            );

            const homeLink = screen.getByRole('link', { name: /return home/i });
            expect(homeLink).toBeInTheDocument();
            expect(homeLink).toHaveAttribute('href', '/');
        });

        it('should display full-height error page', () => {
            const { container } = render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowError shouldThrow={true} message="Failed" />
                </ErrorBoundary>
            );

            const section = container.querySelector('section.h-screen');
            expect(section).toBeInTheDocument();
        });

        it('should center error content', () => {
            const { container } = render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowError shouldThrow={true} message="Failed" />
                </ErrorBoundary>
            );

            const section = container.querySelector('section.items-center');
            expect(section).toBeInTheDocument();
        });
    });

    describe('Error Isolation', () => {
        it('should isolate errors to specific error boundary', () => {
            const SafeComponent = () => <div data-testid="safe-component">Safe</div>;

            render(
                <div>
                    <ErrorBoundary FallbackComponent={ErrorPage}>
                        <ThrowError shouldThrow={true} message="Isolated error" />
                    </ErrorBoundary>
                    <SafeComponent />
                </div>
            );

            // Error page should render
            expect(screen.getByText(/Isolated error/i)).toBeInTheDocument();

            // Safe component outside boundary should still render
            expect(screen.getByTestId('safe-component')).toBeInTheDocument();
        });

        it('should contain error within boundary', () => {
            render(
                <div>
                    <div data-testid="before-boundary">Before</div>
                    <ErrorBoundary FallbackComponent={ErrorPage}>
                        <ThrowError shouldThrow={true} message="Contained error" />
                    </ErrorBoundary>
                    <div data-testid="after-boundary">After</div>
                </div>
            );

            expect(screen.getByTestId('before-boundary')).toBeInTheDocument();
            expect(screen.getByTestId('after-boundary')).toBeInTheDocument();
            expect(screen.getByText(/Contained error/i)).toBeInTheDocument();
        });
    });

    describe('Nested Error Boundaries', () => {
        it('should handle nested error boundaries', () => {
            render(
                <ErrorBoundary
                    FallbackComponent={() => <div data-testid="outer-error">Outer Error</div>}
                >
                    <div data-testid="outer-content">Outer Content</div>
                    <ErrorBoundary FallbackComponent={ErrorPage}>
                        <ThrowError shouldThrow={true} message="Inner error" />
                    </ErrorBoundary>
                </ErrorBoundary>
            );

            // Inner error boundary should catch the error
            expect(screen.getByText(/Inner error/i)).toBeInTheDocument();
            expect(screen.getByTestId('outer-content')).toBeInTheDocument();
            expect(screen.queryByTestId('outer-error')).not.toBeInTheDocument();
        });

        it('should catch errors in outer boundary if inner fails', () => {
            const InnerErrorBoundary = () => {
                throw new Error('Inner boundary failed');
            };

            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <InnerErrorBoundary />
                </ErrorBoundary>
            );

            expect(screen.getByText(/Inner boundary failed/i)).toBeInTheDocument();
        });
    });

    describe('Multiple Components Under Boundary', () => {
        it('should catch error from any child component', () => {
            const GoodComponent1 = () => <div data-testid="good-1">Good 1</div>;
            const GoodComponent2 = () => <div data-testid="good-2">Good 2</div>;

            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <GoodComponent1 />
                    <ThrowError shouldThrow={true} message="Middle component error" />
                    <GoodComponent2 />
                </ErrorBoundary>
            );

            // When error boundary catches error, all children are replaced with fallback
            expect(screen.getByText(/Middle component error/i)).toBeInTheDocument();
            expect(screen.queryByTestId('good-1')).not.toBeInTheDocument();
            expect(screen.queryByTestId('good-2')).not.toBeInTheDocument();
        });

        it('should render all children when no errors', () => {
            const Component1 = () => <div data-testid="comp-1">Component 1</div>;
            const Component2 = () => <div data-testid="comp-2">Component 2</div>;
            const Component3 = () => <div data-testid="comp-3">Component 3</div>;

            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <Component1 />
                    <Component2 />
                    <Component3 />
                </ErrorBoundary>
            );

            expect(screen.getByTestId('comp-1')).toBeInTheDocument();
            expect(screen.getByTestId('comp-2')).toBeInTheDocument();
            expect(screen.getByTestId('comp-3')).toBeInTheDocument();
        });
    });

    describe('Error Boundary Behavior', () => {
        it('should prevent error propagation to parent', () => {
            const ParentComponent = () => {
                return (
                    <div data-testid="parent-component">
                        <ErrorBoundary FallbackComponent={ErrorPage}>
                            <ThrowError shouldThrow={true} message="Child error" />
                        </ErrorBoundary>
                    </div>
                );
            };

            render(<ParentComponent />);

            // Parent should still render
            expect(screen.getByTestId('parent-component')).toBeInTheDocument();
            // Error should be caught and displayed
            expect(screen.getByText(/Child error/i)).toBeInTheDocument();
        });

        it('should handle conditional error throwing', () => {
            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowError shouldThrow={false} message="" />
                </ErrorBoundary>
            );

            expect(screen.getByTestId('success-content')).toBeInTheDocument();

            // Note: Error boundaries don't support recovery on rerender by default
            // This test shows the initial successful state
        });
    });

    describe('Error Message Handling', () => {
        it('should pass error object to fallback component', () => {
            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowError shouldThrow={true} message="Detailed error message" />
                </ErrorBoundary>
            );

            expect(screen.getByText(/Detailed error message/i)).toBeInTheDocument();
        });

        it('should handle long error messages', () => {
            const longMessage = 'A'.repeat(200);
            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowError shouldThrow={true} message={longMessage} />
                </ErrorBoundary>
            );

            expect(screen.getByText(new RegExp(longMessage))).toBeInTheDocument();
        });

        it('should handle special characters in error messages', () => {
            render(
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <ThrowError shouldThrow={true} message="Error: <div>test</div>" />
                </ErrorBoundary>
            );

            // React escapes HTML in text content
            expect(screen.getByText(/Error: <div>test<\/div>/i)).toBeInTheDocument();
        });
    });
});
