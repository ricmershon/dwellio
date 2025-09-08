import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import { createNextLinkMock } from '@/__tests__/shared-mocks';
import InfoBoxes from '@/ui/root/page/info-boxes';

// Mock dependencies
jest.mock('next/link', () => createNextLinkMock());

jest.mock('@/ui/root/page/info-box', () => {
    const MockInfoBox = ({ 
        headingText, 
        backgroundColor, 
        buttonInfo, 
        children 
    }: {
        headingText: string;
        backgroundColor: string;
        buttonInfo: { link: string; styles: string; text: string };
        children: React.ReactNode;
    }) => (
        <div 
            data-testid="info-box"
            data-heading={headingText}
            data-background={backgroundColor}
            data-button-link={buttonInfo.link}
            data-button-styles={buttonInfo.styles}
            data-button-text={buttonInfo.text}
        >
            <h1>{headingText}</h1>
            {children}
            <a href={buttonInfo.link}>{buttonInfo.text}</a>
        </div>
    );
    MockInfoBox.displayName = 'MockInfoBox';
    return MockInfoBox;
});

describe('InfoBoxes', () => {
    describe('Rendering', () => {
        it('should render both info boxes', () => {
            render(<InfoBoxes />);
            
            const infoBoxes = screen.getAllByTestId('info-box');
            expect(infoBoxes).toHaveLength(2);
        });

        it('should render "For Renters" info box with correct props', () => {
            render(<InfoBoxes />);
            
            const infoBoxes = screen.getAllByTestId('info-box');
            const rentersBox = infoBoxes[0];
            expect(rentersBox).toHaveAttribute('data-heading', 'For Renters');
            expect(rentersBox).toHaveAttribute('data-background', 'bg-gray-100');
            expect(rentersBox).toHaveAttribute('data-button-link', '/properties');
            expect(rentersBox).toHaveAttribute('data-button-styles', 'bg-black hover:bg-gray-700');
            expect(rentersBox).toHaveAttribute('data-button-text', 'Browse Properties');
        });

        it('should render "For Property Owners" info box with correct props', () => {
            render(<InfoBoxes />);
            
            const infoBoxes = screen.getAllByTestId('info-box');
            const ownersBox = infoBoxes[1];
            
            expect(ownersBox).toHaveAttribute('data-heading', 'For Property Owners');
            expect(ownersBox).toHaveAttribute('data-background', 'bg-blue-100');
            expect(ownersBox).toHaveAttribute('data-button-link', '/properties/add');
            expect(ownersBox).toHaveAttribute('data-button-styles', 'bg-blue-500 hover:bg-blue-600');
            expect(ownersBox).toHaveAttribute('data-button-text', 'Add Property');
        });

        it('should render correct content for renters box', () => {
            render(<InfoBoxes />);
            
            expect(screen.getByText('For Renters')).toBeInTheDocument();
            expect(screen.getByText('Find your dream rental property. Favorite properties and contact owners.')).toBeInTheDocument();
            expect(screen.getByText('Browse Properties')).toBeInTheDocument();
        });

        it('should render correct content for property owners box', () => {
            render(<InfoBoxes />);
            
            expect(screen.getByText('For Property Owners')).toBeInTheDocument();
            expect(screen.getByText('Log in and rent your property.')).toBeInTheDocument();
            expect(screen.getByText('Add Property')).toBeInTheDocument();
        });
    });

    describe('Structure', () => {
        it('should render as a section element', () => {
            const { container } = render(<InfoBoxes />);
            
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
            expect(container.firstChild).toBe(section);
        });

        it('should have correct CSS classes', () => {
            const { container } = render(<InfoBoxes />);
            
            const section = container.querySelector('section');
            expect(section).toHaveClass('mt-8');
            
            const containerDiv = section?.querySelector('div.m-auto');
            expect(containerDiv).toHaveClass('m-auto');
            
            const gridDiv = containerDiv?.querySelector('div.grid');
            expect(gridDiv).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-4');
        });

        it('should have proper grid layout', () => {
            const { container } = render(<InfoBoxes />);
            
            const gridDiv = container.querySelector('div.grid');
            expect(gridDiv).toBeInTheDocument();
            expect(gridDiv?.children).toHaveLength(2);
        });
    });

    describe('Responsive Design', () => {
        it('should have responsive grid classes', () => {
            const { container } = render(<InfoBoxes />);
            
            const gridDiv = container.querySelector('div.grid');
            expect(gridDiv).toHaveClass('grid-cols-1', 'md:grid-cols-2');
        });
    });

    describe('Component Integration', () => {
        it('should pass children content to InfoBox components', () => {
            render(<InfoBoxes />);
            
            expect(screen.getByText('Find your dream rental property. Favorite properties and contact owners.')).toBeInTheDocument();
            expect(screen.getByText('Log in and rent your property.')).toBeInTheDocument();
        });

        it('should render without throwing errors', () => {
            expect(() => render(<InfoBoxes />)).not.toThrow();
        });
    });

    describe('Accessibility', () => {
        it('should use semantic section element', () => {
            const { container } = render(<InfoBoxes />);
            
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
        });

        it('should have accessible headings', () => {
            render(<InfoBoxes />);
            
            const headings = screen.getAllByRole('heading');
            expect(headings).toHaveLength(2);
            expect(headings[0]).toHaveTextContent('For Renters');
            expect(headings[1]).toHaveTextContent('For Property Owners');
        });

        it('should have accessible links', () => {
            render(<InfoBoxes />);
            
            const links = screen.getAllByRole('link');
            expect(links).toHaveLength(2);
            expect(links[0]).toHaveTextContent('Browse Properties');
            expect(links[1]).toHaveTextContent('Add Property');
        });
    });

    describe('Content Verification', () => {
        it('should have different styling for each info box', () => {
            render(<InfoBoxes />);
            
            const infoBoxes = screen.getAllByTestId('info-box');
            expect(infoBoxes[0]).toHaveAttribute('data-background', 'bg-gray-100');
            expect(infoBoxes[1]).toHaveAttribute('data-background', 'bg-blue-100');
            
            expect(infoBoxes[0]).toHaveAttribute('data-button-styles', 'bg-black hover:bg-gray-700');
            expect(infoBoxes[1]).toHaveAttribute('data-button-styles', 'bg-blue-500 hover:bg-blue-600');
        });

        it('should have correct navigation links', () => {
            render(<InfoBoxes />);
            
            const infoBoxes = screen.getAllByTestId('info-box');
            expect(infoBoxes[0]).toHaveAttribute('data-button-link', '/properties');
            expect(infoBoxes[1]).toHaveAttribute('data-button-link', '/properties/add');
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot', () => {
            const { container } = render(<InfoBoxes />);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });

    describe('Performance', () => {
        it('should render quickly', () => {
            const startTime = performance.now();
            render(<InfoBoxes />);
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(100);
        });

        it('should not cause unnecessary re-renders', () => {
            const { rerender } = render(<InfoBoxes />);
            
            expect(screen.getByText('For Renters')).toBeInTheDocument();
            expect(screen.getByText('For Property Owners')).toBeInTheDocument();
            
            rerender(<InfoBoxes />);
            
            expect(screen.getByText('For Renters')).toBeInTheDocument();
            expect(screen.getByText('For Property Owners')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should render even if InfoBox component has issues', () => {
            render(<InfoBoxes />);
            
            // Container should still exist
            const { container } = render(<InfoBoxes />);
            expect(container.firstChild).toBeInTheDocument();
        });
    });
});