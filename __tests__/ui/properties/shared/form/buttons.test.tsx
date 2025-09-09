import { render, screen } from '@testing-library/react';
import PropertyFormButtons from '@/ui/properties/shared/form/buttons';

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockLink({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
        return <a href={href} className={className}>{children}</a>;
    };
});

// Mock react-icons
jest.mock('react-icons/lu', () => ({
    LuRefreshCw: function MockLuRefreshCw({ className }: { className?: string }) {
        return <div data-testid="refresh-icon" className={className} />;
    }
}));

// Mock clsx
jest.mock('clsx', () => {
    return function mockClsx(...args: any[]) {
        // Simple implementation for testing
        return args
            .flat()
            .filter(Boolean)
            .map(arg => {
                if (typeof arg === 'string') return arg;
                if (typeof arg === 'object') {
                    return Object.entries(arg)
                        .filter(([, value]) => value)
                        .map(([key]) => key)
                        .join(' ');
                }
                return '';
            })
            .join(' ');
    };
});

describe('PropertyFormButtons Component', () => {
    const defaultProps = {
        cancelButtonHref: '/properties',
        isPending: false,
        primaryButtonText: 'Create Property'
    };

    describe('Component Structure', () => {
        it('renders the buttons container with correct structure', () => {
            const { container } = render(<PropertyFormButtons {...defaultProps} />);

            const buttonsContainer = container.querySelector('.mt-4.flex.justify-end.gap-4');
            expect(buttonsContainer).toBeInTheDocument();
        });

        it('renders both cancel and submit buttons', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            expect(screen.getByRole('link', { name: 'Cancel' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Create Property' })).toBeInTheDocument();
        });

        it('applies correct container CSS classes', () => {
            const { container } = render(<PropertyFormButtons {...defaultProps} />);

            const buttonsContainer = container.firstChild;
            expect(buttonsContainer).toHaveClass('mt-4', 'flex', 'justify-end', 'gap-4');
        });
    });

    describe('Cancel Button', () => {
        it('renders as Link with correct href', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            const cancelButton = screen.getByRole('link', { name: 'Cancel' });
            expect(cancelButton).toBeInTheDocument();
            expect(cancelButton).toHaveAttribute('href', '/properties');
        });

        it('applies correct CSS classes to cancel button', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            const cancelButton = screen.getByRole('link', { name: 'Cancel' });
            expect(cancelButton).toHaveClass('flex', 'btn', 'btn-secondary');
        });

        it('uses different href when provided', () => {
            const props = {
                ...defaultProps,
                cancelButtonHref: '/dashboard'
            };

            render(<PropertyFormButtons {...props} />);

            const cancelButton = screen.getByRole('link', { name: 'Cancel' });
            expect(cancelButton).toHaveAttribute('href', '/dashboard');
        });

        it('displays Cancel text', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            expect(screen.getByText('Cancel')).toBeInTheDocument();
        });
    });

    describe('Submit Button', () => {
        it('renders as button with correct type', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: 'Create Property' });
            expect(submitButton).toBeInTheDocument();
            expect(submitButton).toHaveAttribute('type', 'submit');
        });

        it('displays custom primary button text', () => {
            const props = {
                ...defaultProps,
                primaryButtonText: 'Update Property'
            };

            render(<PropertyFormButtons {...props} />);

            expect(screen.getByRole('button', { name: 'Update Property' })).toBeInTheDocument();
            expect(screen.getByText('Update Property')).toBeInTheDocument();
        });

        it('applies correct base CSS classes', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            const submitButton = screen.getByRole('button');
            expect(submitButton).toHaveClass('flex', 'gap-1', 'btn', 'btn-primary');
        });

        it('contains span element with button text', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            const span = screen.getByRole('button').querySelector('span');
            expect(span).toBeInTheDocument();
            expect(span).toHaveTextContent('Create Property');
        });
    });

    describe('Button States - Not Pending', () => {
        it('submit button is not disabled when not pending', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            const submitButton = screen.getByRole('button');
            expect(submitButton).not.toBeDisabled();
        });

        it('applies correct cursor class when not pending', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            const submitButton = screen.getByRole('button');
            expect(submitButton).toHaveClass('hover:cursor-pointer');
            expect(submitButton).not.toHaveClass('hover:cursor-not-allowed');
        });

        it('does not show pending icon when not pending', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            expect(screen.queryByTestId('refresh-icon')).not.toBeInTheDocument();
        });
    });

    describe('Button States - Pending', () => {
        const pendingProps = {
            ...defaultProps,
            isPending: true
        };

        it('submit button is disabled when pending', () => {
            render(<PropertyFormButtons {...pendingProps} />);

            const submitButton = screen.getByRole('button');
            expect(submitButton).toBeDisabled();
        });

        it('applies correct cursor class when pending', () => {
            render(<PropertyFormButtons {...pendingProps} />);

            const submitButton = screen.getByRole('button');
            expect(submitButton).toHaveClass('hover:cursor-not-allowed');
            expect(submitButton).not.toHaveClass('hover:cursor-pointer');
        });

        it('shows pending icon when pending', () => {
            render(<PropertyFormButtons {...pendingProps} />);

            const refreshIcon = screen.getByTestId('refresh-icon');
            expect(refreshIcon).toBeInTheDocument();
            expect(refreshIcon).toHaveClass('btn-pending-icon', 'icon-spin');
        });

        it('still displays button text when pending', () => {
            render(<PropertyFormButtons {...pendingProps} />);

            expect(screen.getByText('Create Property')).toBeInTheDocument();
        });

        it('renders both icon and text when pending', () => {
            render(<PropertyFormButtons {...pendingProps} />);

            expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
            expect(screen.getByText('Create Property')).toBeInTheDocument();
        });
    });

    describe('Props Validation', () => {
        it('handles empty primary button text', () => {
            const props = {
                ...defaultProps,
                primaryButtonText: ''
            };

            render(<PropertyFormButtons {...props} />);

            const span = screen.getByRole('button').querySelector('span');
            expect(span).toHaveTextContent('');
        });

        it('handles empty cancel href', () => {
            const props = {
                ...defaultProps,
                cancelButtonHref: ''
            };

            render(<PropertyFormButtons {...props} />);

            const cancelButton = screen.getByRole('generic', { name: 'Cancel' });
            expect(cancelButton).toHaveAttribute('href', '');
        });

        it('handles long primary button text', () => {
            const props = {
                ...defaultProps,
                primaryButtonText: 'This is a very long button text that should still render correctly'
            };

            render(<PropertyFormButtons {...props} />);

            expect(screen.getByText('This is a very long button text that should still render correctly')).toBeInTheDocument();
        });

        it('handles complex href paths', () => {
            const props = {
                ...defaultProps,
                cancelButtonHref: '/properties?page=1&filter=active'
            };

            render(<PropertyFormButtons {...props} />);

            const cancelButton = screen.getByRole('link', { name: 'Cancel' });
            expect(cancelButton).toHaveAttribute('href', '/properties?page=1&filter=active');
        });
    });

    describe('Component Layout', () => {
        it('buttons are laid out in correct order', () => {
            const { container } = render(<PropertyFormButtons {...defaultProps} />);

            const buttons = container.querySelectorAll('a, button');
            expect(buttons).toHaveLength(2);
            
            // Cancel button should come first
            expect(buttons[0]).toHaveTextContent('Cancel');
            expect(buttons[0].tagName.toLowerCase()).toBe('a');
            
            // Submit button should come second
            expect(buttons[1]).toHaveTextContent('Create Property');
            expect(buttons[1].tagName.toLowerCase()).toBe('button');
        });

        it('maintains gap between buttons', () => {
            const { container } = render(<PropertyFormButtons {...defaultProps} />);

            const buttonsContainer = container.firstChild;
            expect(buttonsContainer).toHaveClass('gap-4');
        });

        it('justifies content to end', () => {
            const { container } = render(<PropertyFormButtons {...defaultProps} />);

            const buttonsContainer = container.firstChild;
            expect(buttonsContainer).toHaveClass('justify-end');
        });
    });

    describe('Accessibility', () => {
        it('submit button has correct role and type', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            const submitButton = screen.getByRole('button');
            expect(submitButton).toHaveAttribute('type', 'submit');
        });

        it('cancel button has correct role as link', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            const cancelButton = screen.getByRole('link', { name: 'Cancel' });
            expect(cancelButton).toBeInTheDocument();
        });

        it('disabled submit button is not focusable via tab', () => {
            const props = {
                ...defaultProps,
                isPending: true
            };

            render(<PropertyFormButtons {...props} />);

            const submitButton = screen.getByRole('button');
            expect(submitButton).toBeDisabled();
            // Disabled buttons are automatically removed from tab order
        });

        it('buttons have accessible names', () => {
            render(<PropertyFormButtons {...defaultProps} />);

            expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAccessibleName('Cancel');
            expect(screen.getByRole('button', { name: 'Create Property' })).toHaveAccessibleName('Create Property');
        });
    });

    describe('Icon Integration', () => {
        it('refresh icon has correct classes when pending', () => {
            const props = {
                ...defaultProps,
                isPending: true
            };

            render(<PropertyFormButtons {...props} />);

            const refreshIcon = screen.getByTestId('refresh-icon');
            expect(refreshIcon).toHaveClass('btn-pending-icon', 'icon-spin');
        });

        it('icon is positioned before text in submit button', () => {
            const props = {
                ...defaultProps,
                isPending: true
            };

            const { container } = render(<PropertyFormButtons {...props} />);

            const submitButton = screen.getByRole('button');
            const children = Array.from(submitButton.children);
            
            expect(children).toHaveLength(2);
            expect(children[0]).toHaveAttribute('data-testid', 'refresh-icon');
            expect(children[1].tagName.toLowerCase()).toBe('span');
        });
    });

    describe('Dynamic Class Application', () => {
        it('applies conditional classes based on pending state', () => {
            // Test not pending state
            const { rerender } = render(<PropertyFormButtons {...defaultProps} />);
            
            let submitButton = screen.getByRole('button');
            expect(submitButton).toHaveClass('hover:cursor-pointer');
            expect(submitButton).not.toHaveClass('hover:cursor-not-allowed');

            // Test pending state
            rerender(<PropertyFormButtons {...defaultProps} isPending={true} />);
            
            submitButton = screen.getByRole('button');
            expect(submitButton).toHaveClass('hover:cursor-not-allowed');
            expect(submitButton).not.toHaveClass('hover:cursor-pointer');
        });

        it('maintains base classes regardless of pending state', () => {
            const { rerender } = render(<PropertyFormButtons {...defaultProps} />);
            
            let submitButton = screen.getByRole('button');
            expect(submitButton).toHaveClass('flex', 'gap-1', 'btn', 'btn-primary');

            rerender(<PropertyFormButtons {...defaultProps} isPending={true} />);
            
            submitButton = screen.getByRole('button');
            expect(submitButton).toHaveClass('flex', 'gap-1', 'btn', 'btn-primary');
        });
    });
});