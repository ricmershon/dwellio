import { render, screen } from '@testing-library/react';
import PaginationArrow from '@/ui/shared/pagination-arrow';
import PaginationNumber from '@/ui/shared/pagination-number';

// Mock Next.js Link component (inline mock for specific component behavior)
jest.mock('next/link', () => {
    return function MockLink({ href, children, className }: any) {
        return (
            <a href={href} className={className} data-testid="mock-link">
                {children}
            </a>
        );
    };
});

describe('Pagination Components', () => {
    describe('PaginationArrow Component', () => {
        describe('Component Rendering', () => {
            it('should render left arrow with proper icon', () => {
                render(
                    <PaginationArrow
                        href="/page/1"
                        direction="left"
                        isDisabled={false}
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute('href', '/page/1');

                // Check for left arrow icon
                const icon = link.querySelector('svg');
                expect(icon).toBeInTheDocument();
            });

            it('should render right arrow with proper icon', () => {
                render(
                    <PaginationArrow
                        href="/page/3"
                        direction="right"
                        isDisabled={false}
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute('href', '/page/3');

                // Check for right arrow icon
                const icon = link.querySelector('svg');
                expect(icon).toBeInTheDocument();
            });

            it('should render as div when disabled', () => {
                render(
                    <PaginationArrow
                        href="/page/1"
                        direction="left"
                        isDisabled={true}
                    />
                );

                // Should not render as link when disabled
                expect(screen.queryByTestId('mock-link')).not.toBeInTheDocument();

                // Should render as div instead
                const container = document.querySelector('div');
                expect(container).toBeInTheDocument();

                // Should still have the icon
                const icon = container?.querySelector('svg');
                expect(icon).toBeInTheDocument();
            });
        });

        describe('CSS Classes and Styling', () => {
            it('should apply base classes to enabled left arrow', () => {
                render(
                    <PaginationArrow
                        href="/page/1"
                        direction="left"
                        isDisabled={false}
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toHaveClass(
                    'flex',
                    'h-10',
                    'w-10',
                    'items-center',
                    'justify-center',
                    'rounded-md',
                    'border',
                    'border-gray-300',
                    'hover:bg-gray-100',
                    'mr-2',
                    'md:mr-4'
                );
            });

            it('should apply base classes to enabled right arrow', () => {
                render(
                    <PaginationArrow
                        href="/page/3"
                        direction="right"
                        isDisabled={false}
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toHaveClass(
                    'flex',
                    'h-10',
                    'w-10',
                    'items-center',
                    'justify-center',
                    'rounded-md',
                    'border',
                    'border-gray-300',
                    'hover:bg-gray-100',
                    'ml-2',
                    'md:ml-4'
                );
            });

            it('should apply disabled classes when disabled', () => {
                render(
                    <PaginationArrow
                        href="/page/1"
                        direction="left"
                        isDisabled={true}
                    />
                );

                const container = document.querySelector('div > div');
                expect(container).toHaveClass(
                    'flex',
                    'h-10',
                    'w-10',
                    'items-center',
                    'justify-center',
                    'rounded-md',
                    'border',
                    'border-gray-300',
                    'pointer-events-none',
                    'text-gray-300',
                    'mr-2',
                    'md:mr-4'
                );
            });

            it('should not apply hover classes when disabled', () => {
                render(
                    <PaginationArrow
                        href="/page/1"
                        direction="right"
                        isDisabled={true}
                    />
                );

                const container = document.querySelector('div');
                expect(container).not.toHaveClass('hover:bg-gray-100');
            });
        });

        describe('Direction-based Positioning', () => {
            it('should apply left margin classes for right direction', () => {
                render(
                    <PaginationArrow
                        href="/page/3"
                        direction="right"
                        isDisabled={false}
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toHaveClass('ml-2', 'md:ml-4');
                expect(link).not.toHaveClass('mr-2', 'md:mr-4');
            });

            it('should apply right margin classes for left direction', () => {
                render(
                    <PaginationArrow
                        href="/page/1"
                        direction="left"
                        isDisabled={false}
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toHaveClass('mr-2', 'md:mr-4');
                expect(link).not.toHaveClass('ml-2', 'md:ml-4');
            });
        });

        describe('Icon Rendering', () => {
            it('should render correct icon size', () => {
                render(
                    <PaginationArrow
                        href="/page/1"
                        direction="left"
                        isDisabled={false}
                    />
                );

                const icon = document.querySelector('svg');
                expect(icon).toHaveClass('w-4');
            });
        });

        describe('Accessibility', () => {
            it('should be accessible when enabled', () => {
                render(
                    <PaginationArrow
                        href="/page/2"
                        direction="left"
                        isDisabled={false}
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toHaveAttribute('href', '/page/2');
            });

            it('should not be clickable when disabled', () => {
                render(
                    <PaginationArrow
                        href="/page/1"
                        direction="left"
                        isDisabled={true}
                    />
                );

                expect(screen.queryByTestId('mock-link')).not.toBeInTheDocument();

                const container = document.querySelector('div > div');
                expect(container).toHaveClass('pointer-events-none');
            });
        });
    });

    describe('PaginationNumber Component', () => {
        describe('Component Rendering', () => {
            it('should render active page number as div', () => {
                render(
                    <PaginationNumber
                        page={2}
                        href="/page/2"
                        isActive={true}
                        position="middle"
                    />
                );

                expect(screen.getByText('2')).toBeInTheDocument();
                expect(screen.queryByTestId('mock-link')).not.toBeInTheDocument();
            });

            it('should render inactive page number as link', () => {
                render(
                    <PaginationNumber
                        page={3}
                        href="/page/3"
                        isActive={false}
                        position="first"
                    />
                );

                expect(screen.getByText('3')).toBeInTheDocument();
                const link = screen.getByTestId('mock-link');
                expect(link).toHaveAttribute('href', '/page/3');
            });

            it('should render middle position as div regardless of active state', () => {
                render(
                    <PaginationNumber
                        page="..."
                        href="/page/5"
                        isActive={false}
                        position="middle"
                    />
                );

                expect(screen.getByText('...')).toBeInTheDocument();
                expect(screen.queryByTestId('mock-link')).not.toBeInTheDocument();
            });

            it('should handle string page values', () => {
                render(
                    <PaginationNumber
                        page="..."
                        href="/page/5"
                        isActive={false}
                        position="middle"
                    />
                );

                expect(screen.getByText('...')).toBeInTheDocument();
            });

            it('should handle numeric page values', () => {
                render(
                    <PaginationNumber
                        page={1}
                        href="/page/1"
                        isActive={false}
                        position="first"
                    />
                );

                expect(screen.getByText('1')).toBeInTheDocument();
            });
        });

        describe('Position-based Styling', () => {
            it('should apply first position classes', () => {
                render(
                    <PaginationNumber
                        page={1}
                        href="/page/1"
                        isActive={false}
                        position="first"
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toHaveClass('rounded-l-md');
                expect(link).not.toHaveClass('rounded-r-md');
            });

            it('should apply last position classes', () => {
                render(
                    <PaginationNumber
                        page={5}
                        href="/page/5"
                        isActive={false}
                        position="last"
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toHaveClass('rounded-r-md');
                expect(link).not.toHaveClass('rounded-l-md');
            });

            it('should apply single position classes', () => {
                render(
                    <PaginationNumber
                        page={1}
                        href="/page/1"
                        isActive={false}
                        position="single"
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toHaveClass('rounded-l-md', 'rounded-r-md');
            });

            it('should not apply rounded classes for middle position', () => {
                render(
                    <PaginationNumber
                        page="..."
                        href="/page/3"
                        isActive={false}
                        position="middle"
                    />
                );

                const container = document.querySelector('div');
                expect(container).not.toHaveClass('rounded-l-md', 'rounded-r-md');
            });
        });

        describe('Active State Styling', () => {
            it('should apply active styles when active', () => {
                render(
                    <PaginationNumber
                        page={2}
                        href="/page/2"
                        isActive={true}
                        position="middle"
                    />
                );

                const container = document.querySelector('div > div');
                expect(container).toHaveClass('z-10', 'bg-blue-700', 'text-white', 'flex', 'h-10', 'w-10', 'items-center', 'justify-center', 'text-sm', 'border', 'border-gray-300', 'text-gray-300');
                expect(container).not.toHaveClass('hover:bg-gray-100');
            });

            it('should apply inactive styles when not active', () => {
                render(
                    <PaginationNumber
                        page={3}
                        href="/page/3"
                        isActive={false}
                        position="first"
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toHaveClass('hover:bg-gray-100');
                expect(link).not.toHaveClass('z-10', 'bg-blue-700', 'text-white');
            });

            it('should apply middle position styles', () => {
                render(
                    <PaginationNumber
                        page="..."
                        href="/page/5"
                        isActive={false}
                        position="middle"
                    />
                );

                const container = document.querySelector('div > div');
                expect(container).toHaveClass('text-gray-300', 'flex', 'h-10', 'w-10', 'items-center', 'justify-center', 'text-sm', 'border', 'border-gray-300');
                expect(container).not.toHaveClass('hover:bg-gray-100');
            });
        });

        describe('Base Styling', () => {
            it('should apply base classes to all variants', () => {
                render(
                    <PaginationNumber
                        page={1}
                        href="/page/1"
                        isActive={false}
                        position="first"
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toHaveClass(
                    'flex',
                    'h-10',
                    'w-10',
                    'items-center',
                    'justify-center',
                    'text-sm',
                    'border',
                    'border-gray-300'
                );
            });

            it('should apply base classes to active state', () => {
                render(
                    <PaginationNumber
                        page={2}
                        href="/page/2"
                        isActive={true}
                        position="middle"
                    />
                );

                const container = document.querySelector('div > div');
                expect(container).toHaveClass(
                    'flex',
                    'h-10',
                    'w-10',
                    'items-center',
                    'justify-center',
                    'text-sm',
                    'border',
                    'border-gray-300'
                );
            });
        });

        describe('Link Behavior', () => {
            it('should not render link when active', () => {
                render(
                    <PaginationNumber
                        page={2}
                        href="/page/2"
                        isActive={true}
                        position="first"
                    />
                );

                expect(screen.queryByTestId('mock-link')).not.toBeInTheDocument();
            });

            it('should not render link for middle position', () => {
                render(
                    <PaginationNumber
                        page="..."
                        href="/page/5"
                        isActive={false}
                        position="middle"
                    />
                );

                expect(screen.queryByTestId('mock-link')).not.toBeInTheDocument();
            });

            it('should render link for inactive non-middle positions', () => {
                const positions: Array<"first" | "last" | "single"> = ["first", "last", "single"];

                positions.forEach(position => {
                    const { unmount } = render(
                        <PaginationNumber
                            page={1}
                            href="/page/1"
                            isActive={false}
                            position={position}
                        />
                    );

                    expect(screen.getByTestId('mock-link')).toBeInTheDocument();
                    unmount();
                });
            });
        });

        describe('Edge Cases', () => {
            it('should handle undefined position', () => {
                render(
                    <PaginationNumber
                        page={1}
                        href="/page/1"
                        isActive={false}
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toBeInTheDocument();
                expect(link).toHaveClass('hover:bg-gray-100');
            });

            it('should handle very large page numbers', () => {
                render(
                    <PaginationNumber
                        page={999999}
                        href="/page/999999"
                        isActive={false}
                        position="middle"
                    />
                );

                expect(screen.getByText('999999')).toBeInTheDocument();
            });

            it('should handle zero page number', () => {
                render(
                    <PaginationNumber
                        page={0}
                        href="/page/0"
                        isActive={false}
                        position="first"
                    />
                );

                expect(screen.getByText('0')).toBeInTheDocument();
            });

            it('should handle negative page numbers', () => {
                render(
                    <PaginationNumber
                        page={-1}
                        href="/page/-1"
                        isActive={false}
                        position="first"
                    />
                );

                expect(screen.getByText('-1')).toBeInTheDocument();
            });
        });

        describe('Accessibility', () => {
            it('should provide proper href for clickable links', () => {
                render(
                    <PaginationNumber
                        page={3}
                        href="/properties?page=3"
                        isActive={false}
                        position="first"
                    />
                );

                const link = screen.getByTestId('mock-link');
                expect(link).toHaveAttribute('href', '/properties?page=3');
            });

            it('should not be clickable when active', () => {
                render(
                    <PaginationNumber
                        page={2}
                        href="/page/2"
                        isActive={true}
                        position="middle"
                    />
                );

                expect(screen.queryByTestId('mock-link')).not.toBeInTheDocument();
            });

            it('should not be clickable for middle position (ellipsis)', () => {
                render(
                    <PaginationNumber
                        page="..."
                        href="/page/5"
                        isActive={false}
                        position="middle"
                    />
                );

                expect(screen.queryByTestId('mock-link')).not.toBeInTheDocument();
            });
        });
    });
});