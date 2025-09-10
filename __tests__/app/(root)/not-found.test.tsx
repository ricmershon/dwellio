import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/(root)/not-found';

describe('NotFound Component', () => {
    describe('Component Structure', () => {
        it('should render section element with correct classes', () => {
            render(<NotFound />);
            
            const sectionElement = document.querySelector('section');
            expect(sectionElement).toBeInTheDocument();
            expect(sectionElement).toHaveClass('h-screen', 'text-center', 'flex', 'flex-col', 'jusitfy-center', 'items-center');
        });

        it('should display 404 heading', () => {
            render(<NotFound />);
            
            const heading404 = screen.getByRole('heading', { level: 1 });
            expect(heading404).toBeInTheDocument();
            expect(heading404).toHaveTextContent('404');
        });

        it('should display "This page could not be found" message', () => {
            render(<NotFound />);
            
            const notFoundMessage = screen.getByRole('heading', { level: 2 });
            expect(notFoundMessage).toBeInTheDocument();
            expect(notFoundMessage).toHaveTextContent('This page could not be found.');
        });

        it('should apply correct classes to 404 heading', () => {
            render(<NotFound />);
            
            const heading404 = screen.getByRole('heading', { level: 1 });
            expect(heading404).toHaveClass(
                'inline-block',
                'mt-10',
                'mr-5',
                'pr-5',
                'font-medium',
                'align-top',
                'leading-12',
                'border-r',
                'border-gray-800',
                'text-2xl',
                'text-gray-800'
            );
        });

        it('should apply correct classes to error message', () => {
            render(<NotFound />);
            
            const errorMessage = screen.getByRole('heading', { level: 2 });
            expect(errorMessage).toHaveClass('font-medium', 'text-lg', 'leading-12', 'mt-10');
        });
    });

    describe('Layout Structure', () => {
        it('should have proper flex layout', () => {
            render(<NotFound />);
            
            const section = document.querySelector('section');
            expect(section).toHaveClass('flex', 'flex-col', 'items-center', 'text-center');
        });

        it('should have correct container structure', () => {
            render(<NotFound />);
            
            const heading404 = screen.getByRole('heading', { level: 1 });
            const heading2 = screen.getByRole('heading', { level: 2 });
            
            // Both headings should be in the same container structure
            expect(heading404.parentElement).toBeInTheDocument();
            expect(heading2.parentElement?.parentElement).toBeInTheDocument();
        });

        it('should use inline-block layout for headings', () => {
            render(<NotFound />);
            
            const heading404 = screen.getByRole('heading', { level: 1 });
            const messageContainer = screen.getByRole('heading', { level: 2 }).parentElement;
            
            expect(heading404).toHaveClass('inline-block');
            expect(messageContainer).toHaveClass('inline-block');
        });
    });

    describe('Styling', () => {
        it('should have full height screen layout', () => {
            render(<NotFound />);
            
            const section = document.querySelector('section');
            expect(section).toHaveClass('h-screen');
        });

        it('should center content', () => {
            render(<NotFound />);
            
            const section = document.querySelector('section');
            expect(section).toHaveClass('text-center', 'items-center');
        });

        it('should have border styling on 404 heading', () => {
            render(<NotFound />);
            
            const heading404 = screen.getByRole('heading', { level: 1 });
            expect(heading404).toHaveClass('border-r', 'border-gray-800');
        });

        it('should apply gray color theme', () => {
            render(<NotFound />);
            
            const heading404 = screen.getByRole('heading', { level: 1 });
            expect(heading404).toHaveClass('text-gray-800');
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading hierarchy', () => {
            render(<NotFound />);
            
            const h1 = screen.getByRole('heading', { level: 1 });
            const h2 = screen.getByRole('heading', { level: 2 });
            
            expect(h1).toBeInTheDocument();
            expect(h2).toBeInTheDocument();
        });

        it('should have descriptive heading text', () => {
            render(<NotFound />);
            
            expect(screen.getByRole('heading', { level: 1, name: '404' })).toBeInTheDocument();
            expect(screen.getByRole('heading', { level: 2, name: 'This page could not be found.' })).toBeInTheDocument();
        });
    });

    describe('Component Properties', () => {
        it('should be a function component', () => {
            expect(typeof NotFound).toBe('function');
        });

        it('should render without props', () => {
            expect(() => render(<NotFound />)).not.toThrow();
        });

        it('should return JSX element', () => {
            const result = NotFound();
            expect(React.isValidElement(result)).toBe(true);
        });
    });
});