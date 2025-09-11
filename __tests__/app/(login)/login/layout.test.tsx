import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginLayout from '@/app/(login)/layout';

// Mock global CSS import
jest.mock('@/app/globals.css', () => ({}));

describe('LoginLayout', () => {
    const mockChildren = <div data-testid="mock-children">Test Content</div>;

    describe('Component Structure', () => {
        it('should render children content', () => {
            // Test the layout component by just checking the inner structure
            const { container } = render(<LoginLayout>{mockChildren}</LoginLayout>);
            
            expect(screen.getByTestId('mock-children')).toBeInTheDocument();
            expect(screen.getByText('Test Content')).toBeInTheDocument();
            
            // Check that the container has the expected classes
            const layoutContainer = container.querySelector('.flex-grow');
            expect(layoutContainer).toBeInTheDocument();
        });

        it('should wrap children in styled container', () => {
            const { container } = render(<LoginLayout>{mockChildren}</LoginLayout>);

            const layoutContainer = container.querySelector('.flex-grow');
            expect(layoutContainer).toHaveClass(
                'flex-grow',
                'md:overflow-y-auto',
                'px-4',
                'md:px-6',
                'lg:px-8',
                'py-6',
                'lg:py-8'
            );
        });
    });

    describe('Styling and Layout', () => {
        it('should apply correct CSS classes for responsive design', () => {
            const { container } = render(<LoginLayout>{mockChildren}</LoginLayout>);

            const layoutContainer = container.querySelector('.flex-grow');
            
            // Responsive horizontal padding
            expect(layoutContainer).toHaveClass('px-4', 'md:px-6', 'lg:px-8');
            
            // Responsive vertical padding
            expect(layoutContainer).toHaveClass('py-6', 'lg:py-8');
            
            // Responsive overflow handling
            expect(layoutContainer).toHaveClass('md:overflow-y-auto');
        });

        it('should provide flex-grow for full height layout', () => {
            const { container } = render(<LoginLayout>{mockChildren}</LoginLayout>);

            const layoutContainer = container.querySelector('.flex-grow');
            expect(layoutContainer).toHaveClass('flex-grow');
        });

        it('should handle overflow on medium+ screens', () => {
            const { container } = render(<LoginLayout>{mockChildren}</LoginLayout>);

            const layoutContainer = container.querySelector('.flex-grow');
            expect(layoutContainer).toHaveClass('md:overflow-y-auto');
        });
    });

    describe('Accessibility', () => {
        it('should render content without navigation elements', () => {
            render(<LoginLayout>{mockChildren}</LoginLayout>);

            // Login layout should be minimal without nav/header/footer
            expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
            expect(screen.queryByRole('banner')).not.toBeInTheDocument();
            expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
            
            // But should render the children content
            expect(screen.getByTestId('mock-children')).toBeInTheDocument();
        });
    });

    describe('Children Handling', () => {
        it('should handle React node children', () => {
            const complexChildren = (
                <div data-testid="complex-children">
                    <h1>Login Page</h1>
                    <form>
                        <input type="email" />
                        <button type="submit">Submit</button>
                    </form>
                </div>
            );

            render(<LoginLayout>{complexChildren}</LoginLayout>);

            expect(screen.getByTestId('complex-children')).toBeInTheDocument();
            expect(screen.getByText('Login Page')).toBeInTheDocument();
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle null/undefined children gracefully', () => {
            expect(() => {
                render(<LoginLayout>{null}</LoginLayout>);
            }).not.toThrow();

            expect(() => {
                render(<LoginLayout>{undefined}</LoginLayout>);
            }).not.toThrow();
        });

        it('should handle string children', () => {
            render(<LoginLayout>Simple text content</LoginLayout>);

            expect(screen.getByText('Simple text content')).toBeInTheDocument();
        });
    });

    describe('Global CSS Integration', () => {
        it('should import global CSS', () => {
            // The import is mocked, but we verify it exists in the component
            render(<LoginLayout>{mockChildren}</LoginLayout>);

            // Component should render without CSS import errors
            expect(screen.getByTestId('mock-children')).toBeInTheDocument();
        });
    });

    describe('Layout Comparison', () => {
        it('should be minimal compared to main app layout', () => {
            render(<LoginLayout>{mockChildren}</LoginLayout>);

            // Should not have complex navigation or footer
            // Just basic HTML structure with styled container
            const container = screen.getByTestId('mock-children').closest('.flex-grow');
            expect(container?.children.length).toBe(1); // Only contains children
        });

        it('should focus on centering content', () => {
            render(<LoginLayout>{mockChildren}</LoginLayout>);

            const container = screen.getByTestId('mock-children').closest('.flex-grow');
            // The layout uses flex-grow and centered padding
            expect(container).toHaveClass('flex-grow');
        });
    });

    describe('Responsive Behavior', () => {
        it('should have different padding at different breakpoints', () => {
            render(<LoginLayout>{mockChildren}</LoginLayout>);

            const container = screen.getByTestId('mock-children').closest('.px-4');
            
            // Mobile: px-4 py-6
            expect(container).toHaveClass('px-4', 'py-6');
            
            // Medium: md:px-6
            expect(container).toHaveClass('md:px-6');
            
            // Large: lg:px-8 lg:py-8
            expect(container).toHaveClass('lg:px-8', 'lg:py-8');
        });

        it('should enable scrolling on medium+ screens', () => {
            render(<LoginLayout>{mockChildren}</LoginLayout>);

            const container = screen.getByTestId('mock-children').closest('.md\\:overflow-y-auto');
            expect(container).toHaveClass('md:overflow-y-auto');
        });
    });

    describe('TypeScript Props', () => {
        it('should accept readonly children prop', () => {
            // This test verifies TypeScript compilation
            const readonlyChildren = mockChildren;
            
            expect(() => {
                render(<LoginLayout>{readonlyChildren}</LoginLayout>);
            }).not.toThrow();
        });

        it('should work with React.ReactNode type', () => {
            const nodeChildren: React.ReactNode = [
                <div key="1">Item 1</div>,
                <div key="2">Item 2</div>,
                "Text node"
            ];

            render(<LoginLayout>{nodeChildren}</LoginLayout>);

            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
            expect(screen.getByText('Text node')).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with simple children', () => {
            const { container } = render(
                <LoginLayout>
                    <div>Simple login content</div>
                </LoginLayout>
            );
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with complex children', () => {
            const complexChildren = (
                <>
                    <div>Login Form</div>
                    <button>Submit</button>
                    <p>Footer text</p>
                </>
            );

            const { container } = render(
                <LoginLayout>{complexChildren}</LoginLayout>
            );
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});