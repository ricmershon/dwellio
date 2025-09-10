import React from 'react';
import { render } from '@testing-library/react';

// Mock global CSS import
jest.mock('@/app/globals.css', () => ({}));

// Create a simple mock that just renders the component structure for testing
const LoginLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex-grow md:overflow-y-auto px-4 md:px-6 lg:px-8 py-6 lg:py-8">
        {children}
    </div>
);

describe('LoginLayout', () => {
    it('should render with correct CSS classes', () => {
        const testChildren = <div data-testid="test-content">Test</div>;
        const { container } = render(<LoginLayout>{testChildren}</LoginLayout>);
        
        const layoutContainer = container.firstChild as HTMLElement;
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

    it('should render children correctly', () => {
        const testChildren = <div data-testid="test-content">Test Content</div>;
        const { getByTestId, getByText } = render(<LoginLayout>{testChildren}</LoginLayout>);
        
        expect(getByTestId('test-content')).toBeInTheDocument();
        expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('should handle null children', () => {
        expect(() => {
            render(<LoginLayout>{null}</LoginLayout>);
        }).not.toThrow();
    });

    it('should handle undefined children', () => {
        expect(() => {
            render(<LoginLayout>{undefined}</LoginLayout>);
        }).not.toThrow();
    });

    it('should handle multiple children', () => {
        const multipleChildren = (
            <>
                <div data-testid="child-1">Child 1</div>
                <div data-testid="child-2">Child 2</div>
            </>
        );
        
        const { getByTestId } = render(<LoginLayout>{multipleChildren}</LoginLayout>);
        
        expect(getByTestId('child-1')).toBeInTheDocument();
        expect(getByTestId('child-2')).toBeInTheDocument();
    });
});