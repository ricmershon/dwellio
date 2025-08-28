import React from 'react';
import { render, screen } from '@/__tests__/test-utils';

import NotFound from '@/app/not-found';

describe('NotFound', () => {
    describe('Rendering', () => {
        it('should render not found page layout', () => {
            const { container } = render(<NotFound />);
            
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
            expect(section).toHaveClass(
                'h-screen',
                'text-center',
                'flex',
                'flex-col',
                'jusitfy-center', // Note: this is a typo in the original component
                'items-center'
            );
        });

        it('should render with correct layout structure', () => {
            const { container } = render(<NotFound />);
            
            const mainDiv = container.querySelector('section > div');
            expect(mainDiv).toBeInTheDocument();
        });
    });

    describe('404 Status', () => {
        it('should display 404 heading', () => {
            render(<NotFound />);
            
            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('404');
        });

        it('should style 404 heading correctly', () => {
            render(<NotFound />);
            
            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toHaveClass(
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

        it('should render 404 as text content', () => {
            render(<NotFound />);
            
            expect(screen.getByText('404')).toBeInTheDocument();
        });
    });

    describe('Error Message', () => {
        it('should display page not found message', () => {
            render(<NotFound />);
            
            const message = screen.getByRole('heading', { level: 2 });
            expect(message).toBeInTheDocument();
            expect(message).toHaveTextContent('This page could not be found.');
        });

        it('should style error message correctly', () => {
            render(<NotFound />);
            
            const message = screen.getByRole('heading', { level: 2 });
            expect(message).toHaveClass(
                'font-medium',
                'text-lg',
                'leading-12',
                'mt-10'
            );
        });

        it('should render message in inline-block container', () => {
            const { container } = render(<NotFound />);
            
            const messageContainer = container.querySelector('.inline-block:nth-child(2)');
            expect(messageContainer).toBeInTheDocument();
            expect(messageContainer).toHaveClass('inline-block');
        });
    });

    describe('Layout Structure', () => {
        it('should have proper section structure', () => {
            const { container } = render(<NotFound />);
            
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
            
            const contentDiv = container.querySelector('section > div');
            expect(contentDiv).toBeInTheDocument();
        });

        it('should use inline-block layout for content', () => {
            const { container } = render(<NotFound />);
            
            // First inline-block (404 heading)
            const statusBlock = container.querySelector('.inline-block');
            expect(statusBlock).toBeInTheDocument();
            expect(statusBlock?.tagName).toBe('H1');
            
            // Second inline-block (message container)
            const messageBlock = container.querySelector('.inline-block:nth-child(2)');
            expect(messageBlock).toBeInTheDocument();
        });

        it('should center content properly', () => {
            const { container } = render(<NotFound />);
            
            const section = container.querySelector('section');
            expect(section).toHaveClass('text-center', 'flex', 'flex-col', 'items-center');
        });
    });

    describe('Visual Design', () => {
        it('should apply border separator between 404 and message', () => {
            render(<NotFound />);
            
            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toHaveClass('border-r', 'border-gray-800', 'mr-5', 'pr-5');
        });

        it('should use consistent spacing', () => {
            render(<NotFound />);
            
            const heading404 = screen.getByRole('heading', { level: 1 });
            const headingMessage = screen.getByRole('heading', { level: 2 });
            
            expect(heading404).toHaveClass('mt-10');
            expect(headingMessage).toHaveClass('mt-10');
        });

        it('should use consistent typography', () => {
            render(<NotFound />);
            
            const heading404 = screen.getByRole('heading', { level: 1 });
            const headingMessage = screen.getByRole('heading', { level: 2 });
            
            expect(heading404).toHaveClass('font-medium', 'text-2xl');
            expect(headingMessage).toHaveClass('font-medium', 'text-lg');
        });

        it('should apply proper alignment classes', () => {
            render(<NotFound />);
            
            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toHaveClass('align-top', 'leading-12');
            
            const message = screen.getByRole('heading', { level: 2 });
            expect(message).toHaveClass('leading-12');
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

        it('should have proper semantic structure', () => {
            const { container } = render(<NotFound />);
            
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
        });

        it('should have readable text content', () => {
            render(<NotFound />);
            
            expect(screen.getByText('404')).toBeInTheDocument();
            expect(screen.getByText('This page could not be found.')).toBeInTheDocument();
        });

        it('should not have any interactive elements requiring focus management', () => {
            render(<NotFound />);
            
            const buttons = screen.queryAllByRole('button');
            const links = screen.queryAllByRole('link');
            
            expect(buttons).toHaveLength(0);
            expect(links).toHaveLength(0);
        });
    });

    describe('Component Behavior', () => {
        it('should render consistently without props', () => {
            const { rerender } = render(<NotFound />);
            
            expect(screen.getByText('404')).toBeInTheDocument();
            expect(screen.getByText('This page could not be found.')).toBeInTheDocument();
            
            rerender(<NotFound />);
            
            expect(screen.getByText('404')).toBeInTheDocument();
            expect(screen.getByText('This page could not be found.')).toBeInTheDocument();
        });

        it('should be a functional component with no state', () => {
            render(<NotFound />);
            
            // Component should render the same content every time
            expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404');
            expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('This page could not be found.');
        });
    });

    describe('CSS Classes Verification', () => {
        it('should apply all required layout classes', () => {
            const { container } = render(<NotFound />);
            
            const section = container.querySelector('section');
            expect(section).toHaveClass(
                'h-screen',
                'text-center',
                'flex',
                'flex-col',
                'jusitfy-center', // Note: preserving the typo from original
                'items-center'
            );
        });

        it('should apply all required heading classes', () => {
            render(<NotFound />);
            
            const h1 = screen.getByRole('heading', { level: 1 });
            expect(h1).toHaveClass(
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

        it('should apply all required message classes', () => {
            render(<NotFound />);
            
            const h2 = screen.getByRole('heading', { level: 2 });
            expect(h2).toHaveClass(
                'font-medium',
                'text-lg',
                'leading-12',
                'mt-10'
            );
        });
    });

    describe('Content Verification', () => {
        it('should display exact status code text', () => {
            render(<NotFound />);
            
            const statusText = screen.getByText('404');
            expect(statusText.textContent).toBe('404');
        });

        it('should display exact error message text', () => {
            render(<NotFound />);
            
            const messageText = screen.getByText('This page could not be found.');
            expect(messageText.textContent).toBe('This page could not be found.');
        });

        it('should not contain any additional text content', () => {
            const { container } = render(<NotFound />);
            
            const allText = container.textContent;
            expect(allText).toBe('404This page could not be found.');
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot', () => {
            const { container } = render(<NotFound />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot consistently across renders', () => {
            const { container: container1 } = render(<NotFound />);
            const { container: container2 } = render(<NotFound />);
            
            expect(container1.innerHTML).toBe(container2.innerHTML);
        });
    });

    describe('DOM Structure', () => {
        it('should have expected DOM hierarchy', () => {
            const { container } = render(<NotFound />);
            
            // section > div > (h1 + div > h2)
            const section = container.querySelector('section');
            const mainDiv = section?.firstChild;
            const h1 = mainDiv?.firstChild;
            const messageDiv = mainDiv?.lastChild;
            const h2 = messageDiv?.firstChild;
            
            expect(section?.tagName).toBe('SECTION');
            expect(mainDiv?.nodeName).toBe('DIV');
            expect(h1?.nodeName).toBe('H1');
            expect(messageDiv?.nodeName).toBe('DIV');
            expect(h2?.nodeName).toBe('H2');
        });

        it('should have correct element count', () => {
            const { container } = render(<NotFound />);
            
            expect(container.querySelectorAll('section')).toHaveLength(1);
            expect(container.querySelectorAll('div')).toHaveLength(2); // Main div + message div
            expect(container.querySelectorAll('h1')).toHaveLength(1);
            expect(container.querySelectorAll('h2')).toHaveLength(1);
        });
    });
});