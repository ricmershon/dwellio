import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import Hero from '@/ui/root/page/hero';

// Mock dependencies
jest.mock('@/ui/properties/search-form', () => {
    const MockSearchForm = () => (
        <div data-testid="property-search-form">Property Search Form</div>
    );
    MockSearchForm.displayName = 'MockSearchForm';
    return MockSearchForm;
});

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    Suspense: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="suspense">{children}</div>
    ),
}));

describe('Hero', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the main heading', () => {
            render(<Hero />);
            
            const heading = screen.getByRole('heading', { name: 'Find The Perfect Rental' });
            expect(heading).toBeInTheDocument();
            expect(heading.tagName).toBe('H1');
        });

        it('should render the subtitle paragraph', () => {
            render(<Hero />);
            
            const subtitle = screen.getByText('Discover the perfect property.');
            expect(subtitle).toBeInTheDocument();
        });

        it('should render the PropertySearchForm within Suspense', () => {
            render(<Hero />);
            
            const suspense = screen.getByTestId('suspense');
            const searchForm = screen.getByTestId('property-search-form');
            
            expect(suspense).toBeInTheDocument();
            expect(searchForm).toBeInTheDocument();
            expect(suspense).toContainElement(searchForm);
        });
    });

    describe('Structure', () => {
        it('should render as a section element', () => {
            const { container } = render(<Hero />);
            
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
            expect(container.firstChild).toBe(section);
        });

        it('should have correct CSS classes', () => {
            const { container } = render(<Hero />);
            
            const section = container.querySelector('section');
            expect(section).toHaveClass('pt-20', 'mb-8');
        });

        it('should have proper nested structure', () => {
            const { container } = render(<Hero />);
            
            const section = container.querySelector('section');
            const outerDiv = section?.querySelector('div.max-w-7xl');
            const textDiv = outerDiv?.querySelector('div.text-center');
            const heading = textDiv?.querySelector('h1');
            const paragraph = textDiv?.querySelector('p');
            
            expect(outerDiv).toBeInTheDocument();
            expect(textDiv).toBeInTheDocument();
            expect(heading).toBeInTheDocument();
            expect(paragraph).toBeInTheDocument();
        });
    });

    describe('Content', () => {
        it('should display correct heading text', () => {
            render(<Hero />);
            
            expect(screen.getByText('Find The Perfect Rental')).toBeInTheDocument();
        });

        it('should display correct subtitle text', () => {
            render(<Hero />);
            
            expect(screen.getByText('Discover the perfect property.')).toBeInTheDocument();
        });

        it('should render all content in correct order', () => {
            const { container } = render(<Hero />);
            
            const textContent = container.textContent;
            const headingIndex = textContent?.indexOf('Find The Perfect Rental') || -1;
            const subtitleIndex = textContent?.indexOf('Discover the perfect property.') || -1;
            const formIndex = textContent?.indexOf('Property Search Form') || -1;
            
            expect(headingIndex).toBeLessThan(subtitleIndex);
            expect(subtitleIndex).toBeLessThan(formIndex);
        });
    });

    describe('Styling', () => {
        it('should have responsive heading classes', () => {
            render(<Hero />);
            
            const heading = screen.getByRole('heading', { name: 'Find The Perfect Rental' });
            expect(heading).toHaveClass('text-4xl', 'font-extrabold', 'text-gray-700', 'sm:text-5xl', 'md:text-6xl');
        });

        it('should have subtitle styling', () => {
            render(<Hero />);
            
            const subtitle = screen.getByText('Discover the perfect property.');
            expect(subtitle).toHaveClass('mt-4', 'text-xl', 'text-gray-700');
        });

        it('should have container styling', () => {
            const { container } = render(<Hero />);
            
            const outerDiv = container.querySelector('div.max-w-7xl');
            expect(outerDiv).toHaveClass('max-w-7xl', 'mx-auto', 'flex', 'flex-col', 'items-center');
            
            const textDiv = outerDiv?.querySelector('div.text-center');
            expect(textDiv).toHaveClass('text-center');
        });
    });

    describe('Component Integration', () => {
        it('should integrate with PropertySearchForm', () => {
            render(<Hero />);
            
            expect(screen.getByTestId('property-search-form')).toBeInTheDocument();
        });

        it('should wrap PropertySearchForm in Suspense', () => {
            render(<Hero />);
            
            const suspense = screen.getByTestId('suspense');
            const searchForm = screen.getByTestId('property-search-form');
            
            expect(suspense).toContainElement(searchForm);
        });

        it('should render without throwing errors', () => {
            expect(() => render(<Hero />)).not.toThrow();
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading hierarchy', () => {
            render(<Hero />);
            
            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('Find The Perfect Rental');
        });

        it('should use semantic section element', () => {
            const { container } = render(<Hero />);
            
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
        });

        it('should not have any accessibility violations', () => {
            render(<Hero />);
            
            // Basic accessibility checks
            expect(screen.getByRole('heading')).toBeInTheDocument();
            expect(screen.getByTestId('property-search-form')).toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        it('should have responsive text classes', () => {
            render(<Hero />);
            
            const heading = screen.getByRole('heading');
            expect(heading).toHaveClass('sm:text-5xl', 'md:text-6xl');
        });

        it('should have responsive container classes', () => {
            const { container } = render(<Hero />);
            
            const outerDiv = container.querySelector('div.max-w-7xl');
            expect(outerDiv).toHaveClass('max-w-7xl', 'mx-auto');
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot', () => {
            const { container } = render(<Hero />);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });

    describe('Error Handling', () => {
        it('should render even if PropertySearchForm fails', () => {
            render(<Hero />);
            
            // Should still render heading and text content
            expect(screen.getByText('Find The Perfect Rental')).toBeInTheDocument();
            expect(screen.getByText('Discover the perfect property.')).toBeInTheDocument();
        });
    });

    describe('Performance', () => {
        it('should render quickly', () => {
            const startTime = performance.now();
            render(<Hero />);
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(100);
        });

        it('should not cause unnecessary re-renders', () => {
            const { rerender } = render(<Hero />);
            
            expect(screen.getByText('Find The Perfect Rental')).toBeInTheDocument();
            
            rerender(<Hero />);
            
            expect(screen.getByText('Find The Perfect Rental')).toBeInTheDocument();
        });
    });
});