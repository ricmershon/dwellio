import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import { createNextLinkMock, createReactIconsMocks } from '@/__tests__/shared-mocks';

import Footer from '@/ui/root/layout/footer';

// Use centralized mocks
jest.mock('next/link', () => createNextLinkMock());

jest.mock('react-icons/hi2', () => {
    const mocks = createReactIconsMocks();
    return {
        HiHome: mocks.HiHome,
    };
});

// Mock Date to ensure consistent year testing
const mockCurrentYear = 2024;
const mockDate = new Date(mockCurrentYear, 0, 1);

describe('Footer', () => {
    beforeEach(() => {
        // Mock Date constructor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
        // Mock getFullYear method
        jest.spyOn(mockDate, 'getFullYear').mockReturnValue(mockCurrentYear);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Rendering', () => {
        it('should render footer element', () => {
            render(<Footer />);
            
            const footer = screen.getByRole('contentinfo');
            expect(footer).toBeInTheDocument();
            expect(footer.tagName).toBe('FOOTER');
        });

        it('should render with correct CSS classes', () => {
            render(<Footer />);
            
            const footer = screen.getByRole('contentinfo');
            expect(footer).toHaveClass('bg-gray-100', 'py-4', 'mt-24');
        });

        it('should render container with correct layout classes', () => {
            const { container } = render(<Footer />);
            
            const containerDiv = container.querySelector('.container');
            expect(containerDiv).toBeInTheDocument();
            expect(containerDiv).toHaveClass(
                'container',
                'mx-auto',
                'flex',
                'flex-col',
                'md:flex-row',
                'items-center',
                'justify-between',
                'px-4'
            );
        });
    });

    describe('Home Icon', () => {
        it('should render home icon with correct styling', () => {
            render(<Footer />);
            
            const homeIcon = screen.getByTestId('home-icon');
            expect(homeIcon).toBeInTheDocument();
            expect(homeIcon).toHaveClass(
                'h-8',
                'w-auto',
                'text-gray-100',
                'rounded-full',
                'p-[4px]',
                'bg-blue-800'
            );
        });

        it('should render home icon in correct container', () => {
            const { container } = render(<Footer />);
            
            const iconContainer = container.querySelector('.mb-4.md\\:mb-0');
            expect(iconContainer).toBeInTheDocument();
            expect(screen.getByTestId('home-icon')).toBeInTheDocument();
        });
    });

    describe('Navigation Links', () => {
        it('should render properties link', () => {
            render(<Footer />);
            
            const propertiesLink = screen.getByRole('link', { name: 'Properties' });
            expect(propertiesLink).toBeInTheDocument();
            expect(propertiesLink).toHaveAttribute('href', '/properties');
        });

        it('should render terms of service link', () => {
            render(<Footer />);
            
            const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
            expect(termsLink).toBeInTheDocument();
            expect(termsLink).toHaveAttribute('href', '/terms');
        });

        it('should render navigation links in correct structure', () => {
            const { container } = render(<Footer />);
            
            const navContainer = container.querySelector('.flex.flex-wrap.justify-center.md\\:justify-start');
            expect(navContainer).toBeInTheDocument();
            
            const linksList = container.querySelector('ul.flex.space-x-4');
            expect(linksList).toBeInTheDocument();
            
            const listItems = container.querySelectorAll('li');
            expect(listItems).toHaveLength(2);
        });

        it('should render all navigation links', () => {
            render(<Footer />);
            
            const allLinks = screen.getAllByRole('link');
            expect(allLinks).toHaveLength(2);
            
            const linkTexts = allLinks.map(link => link.textContent);
            expect(linkTexts).toEqual(['Properties', 'Terms of Service']);
        });
    });

    describe('Copyright', () => {
        it('should render copyright text with current year', () => {
            render(<Footer />);
            
            const copyrightText = screen.getByText(`© ${mockCurrentYear} Dwellio. All rights reserved.`);
            expect(copyrightText).toBeInTheDocument();
        });

        it('should render copyright with correct styling', () => {
            render(<Footer />);
            
            const copyrightText = screen.getByText(/© .* Dwellio\. All rights reserved\./);
            expect(copyrightText).toHaveClass('text-sm', 'text-gray-500', 'mt-2', 'md:mt-0');
        });

        it('should use dynamic year from current date', () => {
            render(<Footer />);
            
            expect(mockDate.getFullYear).toHaveBeenCalled();
            expect(screen.getByText(/© 2024 Dwellio\. All rights reserved\./)).toBeInTheDocument();
        });
    });

    describe('Layout Structure', () => {
        it('should have three main sections', () => {
            const { container } = render(<Footer />);
            
            // Icon section
            const iconSection = container.querySelector('.mb-4.md\\:mb-0');
            expect(iconSection).toBeInTheDocument();
            
            // Navigation section
            const navSection = container.querySelector('.flex.flex-wrap.justify-center.md\\:justify-start');
            expect(navSection).toBeInTheDocument();
            
            // Copyright section (div containing paragraph)
            const copyrightSection = container.querySelector('div > p.text-sm.text-gray-500');
            expect(copyrightSection).toBeInTheDocument();
        });

        it('should maintain responsive layout classes', () => {
            const { container } = render(<Footer />);
            
            const mainContainer = container.querySelector('.container');
            expect(mainContainer).toHaveClass('flex-col', 'md:flex-row');
            
            const iconContainer = container.querySelector('.mb-4.md\\:mb-0');
            expect(iconContainer).toBeInTheDocument();
            
            const navContainer = container.querySelector('.justify-center.md\\:justify-start');
            expect(navContainer).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic structure', () => {
            render(<Footer />);
            
            const footer = screen.getByRole('contentinfo');
            expect(footer).toBeInTheDocument();
        });

        it('should have accessible links', () => {
            render(<Footer />);
            
            const propertiesLink = screen.getByRole('link', { name: 'Properties' });
            const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
            
            expect(propertiesLink).toBeInTheDocument();
            expect(termsLink).toBeInTheDocument();
        });

        it('should not have any accessibility violations', () => {
            render(<Footer />);
            
            // Verify no missing alt text or aria labels are needed
            const footer = screen.getByRole('contentinfo');
            expect(footer).toBeInTheDocument();
            
            // Verify links have proper text content
            const links = screen.getAllByRole('link');
            links.forEach(link => {
                expect(link).toHaveTextContent(/\w+/);
            });
        });
    });

    describe('Date Functionality', () => {
        it('should call Date constructor', () => {
            render(<Footer />);
            
            expect(global.Date).toHaveBeenCalled();
        });

        it('should call getFullYear method', () => {
            render(<Footer />);
            
            expect(mockDate.getFullYear).toHaveBeenCalled();
        });

        it('should handle different years correctly', () => {
            const differentYear = 2025;
            jest.spyOn(mockDate, 'getFullYear').mockReturnValue(differentYear);
            
            render(<Footer />);
            
            expect(screen.getByText(`© ${differentYear} Dwellio. All rights reserved.`)).toBeInTheDocument();
        });
    });

    describe('Component Behavior', () => {
        it('should render consistently', () => {
            const { rerender } = render(<Footer />);
            
            expect(screen.getByRole('contentinfo')).toBeInTheDocument();
            
            rerender(<Footer />);
            
            expect(screen.getByRole('contentinfo')).toBeInTheDocument();
            expect(screen.getByText(/© 2024 Dwellio\. All rights reserved\./)).toBeInTheDocument();
        });

        it('should not have any interactive elements that require testing', () => {
            render(<Footer />);
            
            // Footer is primarily presentational with links
            const buttons = screen.queryAllByRole('button');
            expect(buttons).toHaveLength(0);
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot', () => {
            const { container } = render(<Footer />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with different year', () => {
            jest.spyOn(mockDate, 'getFullYear').mockReturnValue(2023);
            
            const { container } = render(<Footer />);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});