import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import ShareButtons from '@/ui/properties/id/share-buttons';
import { PropertyDocument } from '@/models';
import { 
    mockPropertyData, 
    mockPropertyTypes, 
    mockEnvironment,
    getExpectedShareUrl,
    getExpectedHashtag,
    getExpectedHashtagArray
} from '@/__tests__/property-detail-test-utils';

// Mock react-share library
jest.mock('react-share', () => ({
    FacebookShareButton: ({ children, url, hashtag, ...props }: { children: React.ReactNode; url: string; hashtag: string; [key: string]: unknown }) => (
        <button 
            data-testid="facebook-share" 
            data-url={url} 
            data-hashtag={hashtag} 
            {...props}
        >
            {children}
        </button>
    ),
    FacebookIcon: ({ size, round, ...props }: { size: number; round: boolean; [key: string]: unknown }) => (
        <div 
            data-testid="facebook-icon" 
            data-size={size} 
            data-round={round} 
            {...props}
        />
    ),
    LinkedinShareButton: ({ children, url, title, summary, ...props }: { children: React.ReactNode; url: string; title?: string; summary?: string; [key: string]: unknown }) => (
        <button 
            data-testid="linkedin-share" 
            data-url={url} 
            data-title={title} 
            data-summary={summary}
            {...props}
        >
            {children}
        </button>
    ),
    LinkedinIcon: ({ size, round, ...props }: { size: number; round: boolean; [key: string]: unknown }) => (
        <div 
            data-testid="linkedin-icon" 
            data-size={size} 
            data-round={round} 
            {...props}
        />
    ),
    TwitterShareButton: ({ children, url, title, hashtags, ...props }: { children: React.ReactNode; url: string; title?: string; hashtags?: string[]; [key: string]: unknown }) => (
        <button 
            data-testid="twitter-share" 
            data-url={url} 
            data-title={title} 
            data-hashtags={hashtags?.join(',')}
            {...props}
        >
            {children}
        </button>
    ),
    TwitterIcon: ({ size, round, ...props }: { size: number; round: boolean; [key: string]: unknown }) => (
        <div 
            data-testid="twitter-icon" 
            data-size={size} 
            data-round={round} 
            {...props}
        />
    ),
}));

describe('ShareButtons', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        // Set up environment variables
        process.env = {
            ...originalEnv,
            NEXT_PUBLIC_DOMAIN: mockEnvironment.NEXT_PUBLIC_DOMAIN
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('Component Rendering', () => {
        it('should render all three share buttons', () => {
            render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            expect(screen.getByTestId('facebook-share')).toBeInTheDocument();
            expect(screen.getByTestId('linkedin-share')).toBeInTheDocument();
            expect(screen.getByTestId('twitter-share')).toBeInTheDocument();
        });

        it('should render all social media icons', () => {
            render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
            expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();
            expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
        });

        it('should render share text label', () => {
            render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            expect(screen.getByText('Share')).toBeInTheDocument();
        });

        it('should have proper container structure', () => {
            const { container } = render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            const flexContainer = container.querySelector('.flex.gap-1.justify-center.mr-2');
            expect(flexContainer).toBeInTheDocument();
            
            const shareText = container.querySelector('p.mr-1');
            expect(shareText).toBeInTheDocument();
            expect(shareText).toHaveTextContent('Share');
        });
    });

    describe('URL Generation', () => {
        it('should generate correct share URL for Facebook', () => {
            render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            const facebookButton = screen.getByTestId('facebook-share');
            const expectedUrl = getExpectedShareUrl(mockPropertyData._id);
            
            expect(facebookButton).toHaveAttribute('data-url', expectedUrl);
        });

        it('should generate correct share URL for Twitter', () => {
            render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            const twitterButton = screen.getByTestId('twitter-share');
            const expectedUrl = getExpectedShareUrl(mockPropertyData._id);
            
            expect(twitterButton).toHaveAttribute('data-url', expectedUrl);
        });

        it('should generate correct share URL for LinkedIn', () => {
            render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            const linkedinButton = screen.getByTestId('linkedin-share');
            const expectedUrl = getExpectedShareUrl(mockPropertyData._id);
            
            expect(linkedinButton).toHaveAttribute('data-url', expectedUrl);
        });

        it('should handle different property IDs correctly', () => {
            const customProperty = { ...mockPropertyData, _id: 'custom-id-123' };
            render(<ShareButtons property={customProperty as unknown as PropertyDocument} />);
            
            const buttons = [
                screen.getByTestId('facebook-share'),
                screen.getByTestId('twitter-share'),
                screen.getByTestId('linkedin-share')
            ];
            
            buttons.forEach(button => {
                expect(button).toHaveAttribute('data-url', `${mockEnvironment.NEXT_PUBLIC_DOMAIN}/properties/custom-id-123`);
            });
        });
    });

    describe('Hashtag Generation', () => {
        it('should generate Facebook hashtag for apartment type', () => {
            render(<ShareButtons property={mockPropertyTypes.apartment as unknown as PropertyDocument} />);
            
            const facebookButton = screen.getByTestId('facebook-share');
            const expectedHashtag = getExpectedHashtag('Apartment');
            
            expect(facebookButton).toHaveAttribute('data-hashtag', expectedHashtag);
        });

        it('should generate Twitter hashtags for apartment type', () => {
            render(<ShareButtons property={mockPropertyTypes.apartment as unknown as PropertyDocument} />);
            
            const twitterButton = screen.getByTestId('twitter-share');
            const expectedHashtags = getExpectedHashtagArray('Apartment');
            
            expect(twitterButton).toHaveAttribute('data-hashtags', expectedHashtags.join(','));
        });

        it('should handle multi-word property types by removing spaces', () => {
            render(<ShareButtons property={mockPropertyTypes.multiWordType as unknown as PropertyDocument} />);
            
            const facebookButton = screen.getByTestId('facebook-share');
            const twitterButton = screen.getByTestId('twitter-share');
            
            expect(facebookButton).toHaveAttribute('data-hashtag', '#StudioApartmentForRent');
            expect(twitterButton).toHaveAttribute('data-hashtags', 'StudioApartmentForRent');
        });

        it('should generate correct hashtags for different property types', () => {
            const testCases = [
                { property: mockPropertyTypes.house, expected: '#HouseForRent' },
                { property: mockPropertyTypes.condo, expected: '#CondoForRent' },
                { property: mockPropertyTypes.townhouse, expected: '#TownhouseForRent' }
            ];

            testCases.forEach(({ property, expected }) => {
                const { unmount } = render(<ShareButtons property={property as unknown as PropertyDocument} />);
                
                const facebookButton = screen.getByTestId('facebook-share');
                expect(facebookButton).toHaveAttribute('data-hashtag', expected);
                
                unmount();
            });
        });
    });

    describe('Social Media Icons Configuration', () => {
        it('should configure Facebook icon with correct properties', () => {
            render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            const facebookIcon = screen.getByTestId('facebook-icon');
            expect(facebookIcon).toHaveAttribute('data-size', '20');
            expect(facebookIcon).toHaveAttribute('data-round', 'true');
        });

        it('should configure Twitter icon with correct properties', () => {
            render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            const twitterIcon = screen.getByTestId('twitter-icon');
            expect(twitterIcon).toHaveAttribute('data-size', '20');
            expect(twitterIcon).toHaveAttribute('data-round', 'true');
        });

        it('should configure LinkedIn icon with correct properties', () => {
            render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            const linkedinIcon = screen.getByTestId('linkedin-icon');
            expect(linkedinIcon).toHaveAttribute('data-size', '20');
            expect(linkedinIcon).toHaveAttribute('data-round', 'true');
        });
    });

    describe('Environment Variable Handling', () => {
        it('should handle missing NEXT_PUBLIC_DOMAIN environment variable', () => {
            delete process.env.NEXT_PUBLIC_DOMAIN;
            
            render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            const facebookButton = screen.getByTestId('facebook-share');
            expect(facebookButton).toHaveAttribute('data-url', `undefined/properties/${mockPropertyData._id}`);
        });

        it('should use environment variable when available', () => {
            process.env.NEXT_PUBLIC_DOMAIN = 'https://custom-domain.com';
            
            render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            const facebookButton = screen.getByTestId('facebook-share');
            expect(facebookButton).toHaveAttribute('data-url', `https://custom-domain.com/properties/${mockPropertyData._id}`);
        });
    });

    describe('Accessibility', () => {
        it('should render buttons that are focusable', () => {
            render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            const buttons = [
                screen.getByTestId('facebook-share'),
                screen.getByTestId('twitter-share'),
                screen.getByTestId('linkedin-share')
            ];
            
            buttons.forEach(button => {
                expect(button.tagName).toBe('BUTTON');
                expect(button).not.toHaveAttribute('disabled');
            });
        });

        it('should maintain proper semantic structure', () => {
            const { container } = render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            // Check that buttons are properly nested within containers
            const shareContainer = container.querySelector('.flex.gap-1.justify-center.mr-2');
            const buttons = shareContainer?.querySelectorAll('button');
            
            expect(buttons).toHaveLength(3);
        });
    });

    describe('Component Structure', () => {
        it('should render as a React Fragment with expected children', () => {
            const { container } = render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            // Should have both the flex container and the paragraph
            expect(container.querySelector('.flex.gap-1.justify-center.mr-2')).toBeInTheDocument();
            expect(container.querySelector('p.mr-1')).toBeInTheDocument();
        });

        it('should maintain consistent styling classes', () => {
            const { container } = render(<ShareButtons property={mockPropertyData as unknown as PropertyDocument} />);
            
            const flexContainer = container.querySelector('div');
            expect(flexContainer).toHaveClass('flex', 'gap-1', 'justify-center', 'mr-2');
            
            const shareText = container.querySelector('p');
            expect(shareText).toHaveClass('mr-1');
        });
    });

    describe('Error Handling', () => {
        it('should render without throwing when property has minimal data', () => {
            const minimalProperty = {
                _id: 'test-id',
                type: 'Test'
            } as unknown as PropertyDocument;
            
            expect(() => render(<ShareButtons property={minimalProperty} />)).not.toThrow();
        });

        it('should handle empty property type gracefully', () => {
            const propertyWithEmptyType = {
                ...mockPropertyData,
                type: ''
            };
            
            render(<ShareButtons property={propertyWithEmptyType as unknown as PropertyDocument} />);
            
            const facebookButton = screen.getByTestId('facebook-share');
            expect(facebookButton).toHaveAttribute('data-hashtag', '#ForRent');
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with apartment property', () => {
            const { container } = render(<ShareButtons property={mockPropertyTypes.apartment as unknown as PropertyDocument} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with multi-word property type', () => {
            const { container } = render(<ShareButtons property={mockPropertyTypes.multiWordType as unknown as PropertyDocument} />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});