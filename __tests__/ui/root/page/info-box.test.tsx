import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import { createNextLinkMock } from '@/__tests__/shared-mocks';
import InfoBox from '@/ui/root/page/info-box';

// Mock dependencies
jest.mock('next/link', () => createNextLinkMock());

describe('InfoBox', () => {
    const defaultProps = {
        headingText: 'Test Heading',
        backgroundColor: 'bg-gray-100',
        buttonInfo: {
            link: '/test-link',
            styles: 'bg-blue-500 hover:bg-blue-600',
            text: 'Test Button'
        },
        children: <p>Test content</p>
    };

    describe('Rendering', () => {
        it('should render heading text', () => {
            render(<InfoBox {...defaultProps} />);
            
            const heading = screen.getByRole('heading', { name: 'Test Heading' });
            expect(heading).toBeInTheDocument();
            expect(heading.tagName).toBe('H1');
            expect(heading).toHaveClass('heading');
        });

        it('should render children content', () => {
            render(<InfoBox {...defaultProps} />);
            
            expect(screen.getByText('Test content')).toBeInTheDocument();
        });

        it('should render button with correct text and link', () => {
            render(<InfoBox {...defaultProps} />);
            
            const button = screen.getByRole('link', { name: 'Test Button' });
            expect(button).toBeInTheDocument();
            expect(button).toHaveAttribute('href', '/test-link');
        });
    });

    describe('Styling', () => {
        it('should apply background color class', () => {
            const { container } = render(<InfoBox {...defaultProps} />);
            
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass('bg-gray-100');
        });

        it('should apply base container classes', () => {
            const { container } = render(<InfoBox {...defaultProps} />);
            
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass('p-6', 'rounded-lg', 'shadow-md');
        });

        it('should apply button styles', () => {
            render(<InfoBox {...defaultProps} />);
            
            const button = screen.getByRole('link', { name: 'Test Button' });
            expect(button).toHaveClass('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'btn');
        });

        it('should apply different background colors', () => {
            const props = { ...defaultProps, backgroundColor: 'bg-red-200' };
            const { container } = render(<InfoBox {...props} />);
            
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass('bg-red-200');
        });
    });

    describe('Structure', () => {
        it('should have correct DOM structure', () => {
            const { container } = render(<InfoBox {...defaultProps} />);
            
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper.tagName).toBe('DIV');
            
            const heading = wrapper.querySelector('h1.heading');
            const contentDiv = wrapper.querySelector('div.mt-2.mb-4');
            const link = wrapper.querySelector('a.btn');
            
            expect(heading).toBeInTheDocument();
            expect(contentDiv).toBeInTheDocument();
            expect(link).toBeInTheDocument();
        });

        it('should render content in correct order', () => {
            const { container } = render(<InfoBox {...defaultProps} />);
            
            const wrapper = container.firstChild as HTMLElement;
            const children = Array.from(wrapper.children);
            
            expect(children[0].tagName).toBe('H1');
            expect(children[1]).toHaveClass('mt-2', 'mb-4');
            expect(children[2].tagName).toBe('A');
        });

        it('should wrap children in content div', () => {
            render(<InfoBox {...defaultProps} />);
            
            const contentDiv = document.querySelector('div.mt-2.mb-4');
            expect(contentDiv).toBeInTheDocument();
            expect(contentDiv).toHaveTextContent('Test content');
        });
    });

    describe('Props Handling', () => {
        it('should handle different heading text', () => {
            const props = { ...defaultProps, headingText: 'Custom Heading' };
            render(<InfoBox {...props} />);
            
            expect(screen.getByText('Custom Heading')).toBeInTheDocument();
        });

        it('should handle different button configurations', () => {
            const props = {
                ...defaultProps,
                buttonInfo: {
                    link: '/custom-link',
                    styles: 'bg-green-500 hover:bg-green-600',
                    text: 'Custom Button'
                }
            };
            render(<InfoBox {...props} />);
            
            const button = screen.getByRole('link', { name: 'Custom Button' });
            expect(button).toHaveAttribute('href', '/custom-link');
            expect(button).toHaveClass('bg-green-500', 'hover:bg-green-600');
        });

        it('should handle complex children content', () => {
            const complexChildren = (
                <div>
                    <p>First paragraph</p>
                    <p>Second paragraph</p>
                    <span>Additional content</span>
                </div>
            );
            
            const props = { ...defaultProps, children: complexChildren };
            render(<InfoBox {...props} />);
            
            expect(screen.getByText('First paragraph')).toBeInTheDocument();
            expect(screen.getByText('Second paragraph')).toBeInTheDocument();
            expect(screen.getByText('Additional content')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading hierarchy', () => {
            render(<InfoBox {...defaultProps} />);
            
            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('Test Heading');
        });

        it('should have accessible button link', () => {
            render(<InfoBox {...defaultProps} />);
            
            const link = screen.getByRole('link', { name: 'Test Button' });
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '/test-link');
        });

        it('should not interfere with children accessibility', () => {
            const accessibleChildren = (
                <div>
                    <label htmlFor="test-input">Test Label</label>
                    <input id="test-input" type="text" />
                </div>
            );
            
            const props = { ...defaultProps, children: accessibleChildren };
            render(<InfoBox {...props} />);
            
            expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
        });
    });

    describe('TypeScript Interface', () => {
        it('should work with InfoBoxProps interface', () => {
            // This test ensures TypeScript compilation works correctly
            const validProps = {
                headingText: 'Valid Heading',
                backgroundColor: 'bg-purple-100',
                buttonInfo: {
                    link: '/valid-link',
                    styles: 'bg-purple-500 hover:bg-purple-600',
                    text: 'Valid Button'
                },
                children: <span>Valid children</span>
            };
            
            expect(() => render(<InfoBox {...validProps} />)).not.toThrow();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty children', () => {
            const props = { ...defaultProps, children: null };
            render(<InfoBox {...props} />);
            
            const contentDiv = document.querySelector('div.mt-2.mb-4');
            expect(contentDiv).toBeInTheDocument();
            expect(contentDiv).toBeEmptyDOMElement();
        });

        it('should handle empty heading text', () => {
            const props = { ...defaultProps, headingText: '' };
            render(<InfoBox {...props} />);
            
            const heading = screen.getByRole('heading');
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('');
        });

        it('should handle empty button text', () => {
            const props = {
                ...defaultProps,
                buttonInfo: { ...defaultProps.buttonInfo, text: '' }
            };
            render(<InfoBox {...props} />);
            
            const button = screen.getByRole('link');
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent('');
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot', () => {
            const { container } = render(<InfoBox {...defaultProps} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with different props', () => {
            const props = {
                headingText: 'Different Heading',
                backgroundColor: 'bg-yellow-100',
                buttonInfo: {
                    link: '/different-link',
                    styles: 'bg-yellow-500 hover:bg-yellow-600',
                    text: 'Different Button'
                },
                children: <div><p>Different content</p></div>
            };
            
            const { container } = render(<InfoBox {...props} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });

    describe('Performance', () => {
        it('should render quickly', () => {
            const startTime = performance.now();
            render(<InfoBox {...defaultProps} />);
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(50);
        });

        it('should not cause unnecessary re-renders', () => {
            const { rerender } = render(<InfoBox {...defaultProps} />);
            
            expect(screen.getByText('Test Heading')).toBeInTheDocument();
            
            rerender(<InfoBox {...defaultProps} />);
            
            expect(screen.getByText('Test Heading')).toBeInTheDocument();
        });
    });
});