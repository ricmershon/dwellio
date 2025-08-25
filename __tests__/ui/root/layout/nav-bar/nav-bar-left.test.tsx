import React from 'react';
import { render, screen } from '@/__tests__/test-utils';

import NavBarLeft from '@/ui/root/layout/nav-bar/nav-bar-left';

// Mock Next.js Link component
jest.mock('next/link', () => {
    const MockLink = ({ children, href, className }: {
        children: React.ReactNode;
        href: string;
        className?: string;
    }) => (
        <a href={href} className={className}>
            {children}
        </a>
    );
    MockLink.displayName = 'MockLink';
    return MockLink;
});

// Mock Heroicons
jest.mock('@heroicons/react/24/solid', () => ({
    HomeIcon: ({ className }: { className: string }) => (
        <svg data-testid="home-icon" className={className}>
            <title>Home</title>
        </svg>
    ),
}));

describe('NavBarLeft', () => {
    describe('Component Structure', () => {
        it('should render the logo link with correct href', () => {
            render(<NavBarLeft />);
            
            const logoLink = screen.getByRole('link');
            expect(logoLink).toBeInTheDocument();
            expect(logoLink).toHaveAttribute('href', '/');
        });

        it('should apply correct CSS classes to the link', () => {
            render(<NavBarLeft />);
            
            const logoLink = screen.getByRole('link');
            expect(logoLink).toHaveClass('flex', 'flex-shrink-0', 'items-center');
        });

        it('should render the home icon with correct classes', () => {
            render(<NavBarLeft />);
            
            const homeIcon = screen.getByTestId('home-icon');
            expect(homeIcon).toBeInTheDocument();
            expect(homeIcon).toHaveClass('h-10', 'w-auto', 'text-blue-800', 'p-[4px]', 'bg-white');
        });

        it('should render the Dwellio brand text', () => {
            render(<NavBarLeft />);
            
            const brandText = screen.getByText('Dwellio');
            expect(brandText).toBeInTheDocument();
        });

        it('should apply correct classes to the brand text', () => {
            render(<NavBarLeft />);
            
            const brandText = screen.getByText('Dwellio');
            expect(brandText).toHaveClass('block', 'text-xl', 'md:text-lg', 'text-blue-800', 'ml-1');
        });
    });

    describe('Navigation Behavior', () => {
        it('should link to home page', () => {
            render(<NavBarLeft />);
            
            const logoLink = screen.getByRole('link');
            expect(logoLink).toHaveAttribute('href', '/');
        });

        it('should be accessible with proper link semantics', () => {
            render(<NavBarLeft />);
            
            const logoLink = screen.getByRole('link');
            expect(logoLink).toBeInTheDocument();
            
            // Should have both icon and text for accessibility
            expect(screen.getByTestId('home-icon')).toBeInTheDocument();
            expect(screen.getByText('Dwellio')).toBeInTheDocument();
        });
    });

    describe('Visual Design', () => {
        it('should use consistent blue color scheme', () => {
            render(<NavBarLeft />);
            
            const homeIcon = screen.getByTestId('home-icon');
            const brandText = screen.getByText('Dwellio');
            
            expect(homeIcon).toHaveClass('text-blue-800');
            expect(brandText).toHaveClass('text-blue-800');
        });

        it('should have responsive text sizing', () => {
            render(<NavBarLeft />);
            
            const brandText = screen.getByText('Dwellio');
            expect(brandText).toHaveClass('text-xl', 'md:text-lg');
        });

        it('should properly space icon and text', () => {
            render(<NavBarLeft />);
            
            const brandText = screen.getByText('Dwellio');
            expect(brandText).toHaveClass('ml-1');
        });
    });

    describe('Icon Integration', () => {
        it('should render HomeIcon with proper dimensions', () => {
            render(<NavBarLeft />);
            
            const homeIcon = screen.getByTestId('home-icon');
            expect(homeIcon).toHaveClass('h-10', 'w-auto');
        });

        it('should style icon with background and padding', () => {
            render(<NavBarLeft />);
            
            const homeIcon = screen.getByTestId('home-icon');
            expect(homeIcon).toHaveClass('p-[4px]', 'bg-white');
        });
    });

    describe('Layout Structure', () => {
        it('should use flexbox layout', () => {
            render(<NavBarLeft />);
            
            const logoLink = screen.getByRole('link');
            expect(logoLink).toHaveClass('flex', 'items-center');
        });

        it('should prevent flex shrinking', () => {
            render(<NavBarLeft />);
            
            const logoLink = screen.getByRole('link');
            expect(logoLink).toHaveClass('flex-shrink-0');
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot', () => {
            const { container } = render(<NavBarLeft />);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});