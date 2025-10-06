import { render, screen } from '@testing-library/react';

import PaginationArrow from '@/ui/shared/pagination-arrow';
import PaginationNumber from '@/ui/shared/pagination-number';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ href, children, className }: any) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));

jest.mock('@heroicons/react/24/outline', () => ({
    ArrowLeftIcon: ({ className }: { className?: string }) => (
        <span data-testid="arrow-left-icon" className={className} />
    ),
    ArrowRightIcon: ({ className }: { className?: string }) => (
        <span data-testid="arrow-right-icon" className={className} />
    ),
}));

// ============================================================================
// TEST SUITE: PaginationArrow Component
// ============================================================================
describe('PaginationArrow Component', () => {
    // ========================================================================
    // Arrow Rendering
    // ========================================================================
    describe('Arrow Rendering', () => {
        it('should render left arrow icon', () => {
            render(<PaginationArrow href="/test" direction="left" />);

            expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
        });

        it('should render right arrow icon', () => {
            render(<PaginationArrow href="/test" direction="right" />);

            expect(screen.getByTestId('arrow-right-icon')).toBeInTheDocument();
        });

        it('should apply correct icon className', () => {
            render(<PaginationArrow href="/test" direction="left" />);

            const icon = screen.getByTestId('arrow-left-icon');
            expect(icon).toHaveClass('w-4');
        });
    });

    // ========================================================================
    // Link Functionality
    // ========================================================================
    describe('Link Functionality', () => {
        it('should render as link when not disabled', () => {
            const { container } = render(
                <PaginationArrow href="/page/2" direction="left" isDisabled={false} />
            );

            const link = container.querySelector('a');
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '/page/2');
        });

        it('should render as div when disabled', () => {
            const { container } = render(
                <PaginationArrow href="/page/2" direction="left" isDisabled={true} />
            );

            const link = container.querySelector('a');
            const div = container.querySelector('div.pointer-events-none');

            expect(link).not.toBeInTheDocument();
            expect(div).toBeInTheDocument();
        });

        it('should not have href attribute when disabled', () => {
            const { container } = render(
                <PaginationArrow href="/page/2" direction="left" isDisabled={true} />
            );

            const element = container.querySelector('[href]');
            expect(element).not.toBeInTheDocument();
        });
    });

    // ========================================================================
    // Disabled State Styling
    // ========================================================================
    describe('Disabled State Styling', () => {
        it('should apply disabled styles when isDisabled is true', () => {
            const { container } = render(
                <PaginationArrow href="/test" direction="left" isDisabled={true} />
            );

            const wrapper = container.querySelector('div');
            expect(wrapper).toHaveClass('pointer-events-none');
            expect(wrapper).toHaveClass('text-gray-300');
        });

        it('should apply hover styles when not disabled', () => {
            const { container } = render(
                <PaginationArrow href="/test" direction="left" isDisabled={false} />
            );

            const link = container.querySelector('a');
            expect(link).toHaveClass('hover:bg-gray-100');
        });

        it('should not apply hover styles when disabled', () => {
            const { container } = render(
                <PaginationArrow href="/test" direction="left" isDisabled={true} />
            );

            const div = container.querySelector('div');
            expect(div).not.toHaveClass('hover:bg-gray-100');
        });
    });

    // ========================================================================
    // Direction-Based Styling
    // ========================================================================
    describe('Direction-Based Styling', () => {
        it('should apply left margin for left arrow', () => {
            const { container } = render(
                <PaginationArrow href="/test" direction="left" />
            );

            const element = container.querySelector('a');
            expect(element).toHaveClass('mr-2');
            expect(element).toHaveClass('md:mr-4');
        });

        it('should apply right margin for right arrow', () => {
            const { container } = render(
                <PaginationArrow href="/test" direction="right" />
            );

            const element = container.querySelector('a');
            expect(element).toHaveClass('ml-2');
            expect(element).toHaveClass('md:ml-4');
        });

        it('should not apply left margin for right arrow', () => {
            const { container } = render(
                <PaginationArrow href="/test" direction="right" />
            );

            const element = container.querySelector('a');
            expect(element).not.toHaveClass('mr-2');
            expect(element).not.toHaveClass('md:mr-4');
        });

        it('should not apply right margin for left arrow', () => {
            const { container } = render(
                <PaginationArrow href="/test" direction="left" />
            );

            const element = container.querySelector('a');
            expect(element).not.toHaveClass('ml-2');
            expect(element).not.toHaveClass('md:ml-4');
        });
    });

    // ========================================================================
    // Common Styling
    // ========================================================================
    describe('Common Styling', () => {
        it('should apply base classes to enabled arrow', () => {
            const { container } = render(
                <PaginationArrow href="/test" direction="left" />
            );

            const link = container.querySelector('a');
            expect(link).toHaveClass('flex');
            expect(link).toHaveClass('h-10');
            expect(link).toHaveClass('w-10');
            expect(link).toHaveClass('items-center');
            expect(link).toHaveClass('justify-center');
            expect(link).toHaveClass('rounded-md');
            expect(link).toHaveClass('border');
            expect(link).toHaveClass('border-gray-300');
        });

        it('should apply base classes to disabled arrow', () => {
            const { container } = render(
                <PaginationArrow href="/test" direction="left" isDisabled={true} />
            );

            const div = container.querySelector('div');
            expect(div).toHaveClass('flex');
            expect(div).toHaveClass('h-10');
            expect(div).toHaveClass('w-10');
            expect(div).toHaveClass('items-center');
            expect(div).toHaveClass('justify-center');
            expect(div).toHaveClass('rounded-md');
            expect(div).toHaveClass('border');
            expect(div).toHaveClass('border-gray-300');
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle undefined isDisabled (defaults to enabled)', () => {
            const { container } = render(
                <PaginationArrow href="/test" direction="left" />
            );

            const link = container.querySelector('a');
            expect(link).toBeInTheDocument();
            expect(link).toHaveClass('hover:bg-gray-100');
        });

        it('should render correctly with empty href', () => {
            const { container } = render(
                <PaginationArrow href="" direction="left" />
            );

            const link = container.querySelector('a');
            expect(link).toHaveAttribute('href', '');
        });
    });
});

// ============================================================================
// TEST SUITE: PaginationNumber Component
// ============================================================================
describe('PaginationNumber Component', () => {
    // ========================================================================
    // Number Rendering
    // ========================================================================
    describe('Number Rendering', () => {
        it('should render page number', () => {
            render(
                <PaginationNumber page={1} href="/page/1" isActive={false} />
            );

            expect(screen.getByText('1')).toBeInTheDocument();
        });

        it('should render string page number', () => {
            render(
                <PaginationNumber page="..." href="/page/1" isActive={false} position="middle" />
            );

            expect(screen.getByText('...')).toBeInTheDocument();
        });

        it('should render larger page numbers', () => {
            render(
                <PaginationNumber page={99} href="/page/99" isActive={false} />
            );

            expect(screen.getByText('99')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Active State
    // ========================================================================
    describe('Active State', () => {
        it('should render as div when active', () => {
            const { container } = render(
                <PaginationNumber page={1} href="/page/1" isActive={true} />
            );

            const link = container.querySelector('a');
            const div = container.querySelector('div');

            expect(link).not.toBeInTheDocument();
            expect(div).toBeInTheDocument();
        });

        it('should render as link when not active', () => {
            const { container } = render(
                <PaginationNumber page={1} href="/page/1" isActive={false} />
            );

            const link = container.querySelector('a');
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '/page/1');
        });

        it('should apply active styles when isActive is true', () => {
            const { container } = render(
                <PaginationNumber page={1} href="/page/1" isActive={true} />
            );

            const div = container.querySelector('div');
            expect(div).toHaveClass('z-10');
            expect(div).toHaveClass('bg-blue-700');
            expect(div).toHaveClass('text-white');
        });

        it('should not apply active styles when isActive is false', () => {
            const { container } = render(
                <PaginationNumber page={1} href="/page/1" isActive={false} />
            );

            const link = container.querySelector('a');
            expect(link).not.toHaveClass('bg-blue-700');
            expect(link).not.toHaveClass('text-white');
        });
    });

    // ========================================================================
    // Position-Based Styling
    // ========================================================================
    describe('Position-Based Styling', () => {
        it('should apply rounded-left for first position', () => {
            const { container } = render(
                <PaginationNumber page={1} href="/page/1" isActive={false} position="first" />
            );

            const link = container.querySelector('a');
            expect(link).toHaveClass('rounded-l-md');
        });

        it('should apply rounded-right for last position', () => {
            const { container } = render(
                <PaginationNumber page={10} href="/page/10" isActive={false} position="last" />
            );

            const link = container.querySelector('a');
            expect(link).toHaveClass('rounded-r-md');
        });

        it('should apply both rounded classes for single position', () => {
            const { container } = render(
                <PaginationNumber page={1} href="/page/1" isActive={false} position="single" />
            );

            const link = container.querySelector('a');
            expect(link).toHaveClass('rounded-l-md');
            expect(link).toHaveClass('rounded-r-md');
        });

        it('should not apply rounded classes for middle position', () => {
            const { container } = render(
                <PaginationNumber page="..." href="#" isActive={false} position="middle" />
            );

            const div = container.querySelector('div');
            expect(div).not.toHaveClass('rounded-l-md');
            expect(div).not.toHaveClass('rounded-r-md');
        });
    });

    // ========================================================================
    // Middle Position (Ellipsis)
    // ========================================================================
    describe('Middle Position (Ellipsis)', () => {
        it('should render as div for middle position', () => {
            const { container } = render(
                <PaginationNumber page="..." href="#" isActive={false} position="middle" />
            );

            const link = container.querySelector('a');
            const div = container.querySelector('div');

            expect(link).not.toBeInTheDocument();
            expect(div).toBeInTheDocument();
        });

        it('should apply gray text for middle position', () => {
            const { container } = render(
                <PaginationNumber page="..." href="#" isActive={false} position="middle" />
            );

            const div = container.querySelector('div');
            expect(div).toHaveClass('text-gray-300');
        });

        it('should not apply hover styles for middle position', () => {
            const { container } = render(
                <PaginationNumber page="..." href="#" isActive={false} position="middle" />
            );

            const div = container.querySelector('div');
            expect(div).not.toHaveClass('hover:bg-gray-100');
        });
    });

    // ========================================================================
    // Hover Styles
    // ========================================================================
    describe('Hover Styles', () => {
        it('should apply hover styles when not active and not middle', () => {
            const { container } = render(
                <PaginationNumber page={1} href="/page/1" isActive={false} />
            );

            const link = container.querySelector('a');
            expect(link).toHaveClass('hover:bg-gray-100');
        });

        it('should not apply hover styles when active', () => {
            const { container } = render(
                <PaginationNumber page={1} href="/page/1" isActive={true} />
            );

            const div = container.querySelector('div');
            expect(div).not.toHaveClass('hover:bg-gray-100');
        });

        it('should not apply hover styles for middle position', () => {
            const { container } = render(
                <PaginationNumber page="..." href="#" isActive={false} position="middle" />
            );

            const div = container.querySelector('div');
            expect(div).not.toHaveClass('hover:bg-gray-100');
        });
    });

    // ========================================================================
    // Common Styling
    // ========================================================================
    describe('Common Styling', () => {
        it('should apply base classes to all numbers', () => {
            const { container } = render(
                <PaginationNumber page={1} href="/page/1" isActive={false} />
            );

            const link = container.querySelector('a');
            expect(link).toHaveClass('flex');
            expect(link).toHaveClass('h-10');
            expect(link).toHaveClass('w-10');
            expect(link).toHaveClass('items-center');
            expect(link).toHaveClass('justify-center');
            expect(link).toHaveClass('text-sm');
            expect(link).toHaveClass('border');
            expect(link).toHaveClass('border-gray-300');
        });

        it('should apply base classes to active numbers', () => {
            const { container } = render(
                <PaginationNumber page={1} href="/page/1" isActive={true} />
            );

            const div = container.querySelector('div');
            expect(div).toHaveClass('flex');
            expect(div).toHaveClass('h-10');
            expect(div).toHaveClass('w-10');
            expect(div).toHaveClass('items-center');
            expect(div).toHaveClass('justify-center');
            expect(div).toHaveClass('text-sm');
            expect(div).toHaveClass('border');
            expect(div).toHaveClass('border-gray-300');
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle no position prop (undefined)', () => {
            const { container } = render(
                <PaginationNumber page={1} href="/page/1" isActive={false} />
            );

            const link = container.querySelector('a');
            expect(link).toBeInTheDocument();
            expect(link).not.toHaveClass('rounded-l-md');
            expect(link).not.toHaveClass('rounded-r-md');
        });

        it('should render correctly with page number 0', () => {
            render(
                <PaginationNumber page={0} href="/page/0" isActive={false} />
            );

            expect(screen.getByText('0')).toBeInTheDocument();
        });

        it('should handle empty string href', () => {
            const { container } = render(
                <PaginationNumber page={1} href="" isActive={false} />
            );

            const link = container.querySelector('a');
            expect(link).toHaveAttribute('href', '');
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Combined Positions', () => {
        it('should render first, middle, and last positions together', () => {
            const { container } = render(
                <div>
                    <PaginationNumber page={1} href="/page/1" isActive={true} position="first" />
                    <PaginationNumber page="..." href="#" isActive={false} position="middle" />
                    <PaginationNumber page={10} href="/page/10" isActive={false} position="last" />
                </div>
            );

            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('...')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();

            const elements = container.querySelectorAll('div');
            // First (active) + middle + container div = 3
            expect(elements.length).toBeGreaterThanOrEqual(2);
        });

        it('should handle active state with different positions', () => {
            const { rerender, container } = render(
                <PaginationNumber page={1} href="/page/1" isActive={true} position="first" />
            );

            let activeDiv = container.querySelector('.bg-blue-700');
            expect(activeDiv).toHaveClass('rounded-l-md');

            rerender(
                <PaginationNumber page={10} href="/page/10" isActive={true} position="last" />
            );

            activeDiv = container.querySelector('.bg-blue-700');
            expect(activeDiv).toHaveClass('rounded-r-md');
        });
    });
});
