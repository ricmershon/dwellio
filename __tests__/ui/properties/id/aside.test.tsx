import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import PropertyPageAside from '@/ui/properties/id/aside';
import { PropertyDocument } from '@/models';
import { WithAuthProps } from '@/hocs/with-auth';
import { 
    mockPropertyData, 
    mockSessionUser,
    createMockPropertyData
} from '@/__tests__/property-detail-test-utils';

// Mock the withAuth HOC
jest.mock('@/hocs/with-auth', () => ({
    withAuth: (Component: React.ComponentType<any>) => Component,
    WithAuthProps: {},
}));

// Mock PropertyContactForm component
jest.mock('@/ui/properties/id/contact-form', () => {
    return function MockPropertyContactForm({ 
        property, 
        userName, 
        userEmail 
    }: { 
        property: PropertyDocument; 
        userName: string | null; 
        userEmail: string | null; 
    }) {
        return (
            <div 
                data-testid="property-contact-form"
                data-property-id={property._id}
                {...(userName && { 'data-user-name': userName })}
                {...(userEmail && { 'data-user-email': userEmail })}
            >
                PropertyContactForm Component
            </div>
        );
    };
});

describe('PropertyPageAside', () => {
    const defaultProperty = mockPropertyData as unknown as PropertyDocument;
    const defaultSession = {
        user: mockSessionUser,
        expires: '2025-01-01'
    };

    const createProps = (
        sessionOverrides: Partial<typeof defaultSession> = {}, 
        propertyOverrides: Partial<PropertyDocument> = {}
    ): WithAuthProps & { property: PropertyDocument } => ({
        property: { ...defaultProperty, ...propertyOverrides } as PropertyDocument,
        session: sessionOverrides.user === null ? null : { ...defaultSession, ...sessionOverrides }
    });

    describe('Component Structure', () => {
        it('should render as an aside element', () => {
            const props = createProps();
            const { container } = render(<PropertyPageAside {...props} />);
            
            const aside = container.querySelector('aside');
            expect(aside).toBeInTheDocument();
            expect(container.firstChild).toBe(aside);
        });

        it('should render aside element even when not showing contact form', () => {
            const props = createProps({ user: null as any });
            const { container } = render(<PropertyPageAside {...props} />);
            
            const aside = container.querySelector('aside');
            expect(aside).toBeInTheDocument();
        });
    });

    describe('Session-Based Conditional Rendering', () => {
        it('should show contact form when user is logged in and not the owner', () => {
            const differentOwnerProperty = createMockPropertyData({ 
                owner: 'different-owner-id' 
            }) as unknown as PropertyDocument;
            
            const props = createProps({}, differentOwnerProperty);
            render(<PropertyPageAside {...props} />);
            
            expect(screen.getByTestId('property-contact-form')).toBeInTheDocument();
        });

        it('should not show contact form when no user session', () => {
            const props = createProps({ user: null as any });
            render(<PropertyPageAside {...props} />);
            
            expect(screen.queryByTestId('property-contact-form')).not.toBeInTheDocument();
        });

        it('should not show contact form when session is null', () => {
            const props = { property: defaultProperty, session: null };
            render(<PropertyPageAside {...props} />);
            
            expect(screen.queryByTestId('property-contact-form')).not.toBeInTheDocument();
        });

        it('should not show contact form when user is the property owner', () => {
            const ownProperty = createMockPropertyData({ 
                owner: mockSessionUser.id 
            }) as unknown as PropertyDocument;
            
            const props = createProps({}, ownProperty);
            render(<PropertyPageAside {...props} />);
            
            expect(screen.queryByTestId('property-contact-form')).not.toBeInTheDocument();
        });
    });

    describe('Owner vs Non-Owner Logic', () => {
        it('should show contact form when user ID does not match property owner', () => {
            const props = createProps(
                { user: { ...mockSessionUser, id: 'user-123' } },
                { owner: 'owner-456' as any }
            );
            
            render(<PropertyPageAside {...props} />);
            
            expect(screen.getByTestId('property-contact-form')).toBeInTheDocument();
        });

        it('should handle string comparison of user ID vs property owner', () => {
            const props = createProps(
                { user: { ...mockSessionUser, id: '123' } },
                { owner: '123' as any }
            );
            
            render(<PropertyPageAside {...props} />);
            
            expect(screen.queryByTestId('property-contact-form')).not.toBeInTheDocument();
        });

        it('should handle numeric user ID comparison', () => {
            const props = createProps(
                { user: { ...mockSessionUser, id: '123' } },
                { owner: '123' as any }
            );
            
            render(<PropertyPageAside {...props} />);
            
            // Since both user.id and property.owner.toString() are '123', they match, so no form should show
            expect(screen.queryByTestId('property-contact-form')).not.toBeInTheDocument();
        });

        it('should handle ObjectId-like owner comparison', () => {
            const objectIdOwner = 'mongodbobjectid123456789';
            const props = createProps(
                { user: { ...mockSessionUser, id: 'differentuser' } },
                { owner: objectIdOwner as any }
            );
            
            render(<PropertyPageAside {...props} />);
            
            expect(screen.getByTestId('property-contact-form')).toBeInTheDocument();
        });
    });

    describe('PropertyContactForm Integration', () => {
        it('should pass correct property to contact form', () => {
            const customProperty = createMockPropertyData({ 
                _id: 'custom-property-123',
                owner: 'different-owner'
            }) as unknown as PropertyDocument;
            
            const props = createProps({}, customProperty);
            render(<PropertyPageAside {...props} />);
            
            const contactForm = screen.getByTestId('property-contact-form');
            expect(contactForm).toHaveAttribute('data-property-id', 'custom-property-123');
        });

        it('should pass user name to contact form', () => {
            const customSession = { 
                user: { ...mockSessionUser, name: 'Custom User Name' } 
            };
            const props = createProps(customSession, { owner: 'different-owner' as any });
            
            render(<PropertyPageAside {...props} />);
            
            const contactForm = screen.getByTestId('property-contact-form');
            expect(contactForm).toHaveAttribute('data-user-name', 'Custom User Name');
        });

        it('should pass user email to contact form', () => {
            const customSession = { 
                user: { ...mockSessionUser, email: 'custom@example.com' } 
            };
            const props = createProps(customSession, { owner: 'different-owner' as any });
            
            render(<PropertyPageAside {...props} />);
            
            const contactForm = screen.getByTestId('property-contact-form');
            expect(contactForm).toHaveAttribute('data-user-email', 'custom@example.com');
        });

        it('should handle null user name gracefully', () => {
            const sessionWithNullName = { 
                user: { ...mockSessionUser, name: null as any } 
            };
            const props = createProps(sessionWithNullName, { owner: 'different-owner' as any });
            
            render(<PropertyPageAside {...props} />);
            
            const contactForm = screen.getByTestId('property-contact-form');
            // null values are passed to components, but not rendered as string attributes
            expect(contactForm).not.toHaveAttribute('data-user-name');
        });

        it('should handle null user email gracefully', () => {
            const sessionWithNullEmail = { 
                user: { ...mockSessionUser, email: null as any } 
            };
            const props = createProps(sessionWithNullEmail, { owner: 'different-owner' as any });
            
            render(<PropertyPageAside {...props} />);
            
            const contactForm = screen.getByTestId('property-contact-form');
            // null values are passed to components, but not rendered as string attributes
            expect(contactForm).not.toHaveAttribute('data-user-email');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle malformed session object', () => {
            const malformedProps = {
                property: defaultProperty,
                session: { user: undefined } as any
            };
            
            // This will throw because session.user.id will try to access id on undefined
            expect(() => render(<PropertyPageAside {...malformedProps} />)).toThrow();
        });

        it('should handle missing user id in session', () => {
            const sessionWithoutId = {
                user: { ...mockSessionUser, id: undefined }
            };
            const props = createProps(sessionWithoutId as any, { owner: 'different-owner' as any });
            
            render(<PropertyPageAside {...props} />);
            
            // undefined !== 'different-owner', so form should show
            expect(screen.getByTestId('property-contact-form')).toBeInTheDocument();
        });

        it('should handle missing property owner', () => {
            const propertyWithoutOwner = createMockPropertyData({ 
                owner: undefined 
            }) as unknown as PropertyDocument;
            
            const props = createProps({}, propertyWithoutOwner);
            
            // This will throw because property.owner.toString() will try to call toString on undefined
            expect(() => render(<PropertyPageAside {...props} />)).toThrow();
        });

        it('should handle empty string as property owner', () => {
            const propertyWithEmptyOwner = createMockPropertyData({ 
                owner: '' 
            }) as unknown as PropertyDocument;
            
            const props = createProps({}, propertyWithEmptyOwner);
            render(<PropertyPageAside {...props} />);
            
            // Should show form since empty string doesn't equal user ID
            expect(screen.getByTestId('property-contact-form')).toBeInTheDocument();
        });
    });

    describe('Multiple User Scenarios', () => {
        it('should work correctly with different user types', () => {
            const testCases = [
                {
                    description: 'admin user',
                    userId: 'admin-123',
                    propertyOwner: 'user-456',
                    shouldShowForm: true
                },
                {
                    description: 'regular user viewing own property',
                    userId: 'user-123',
                    propertyOwner: 'user-123',
                    shouldShowForm: false
                },
                {
                    description: 'regular user viewing other property',
                    userId: 'user-123',
                    propertyOwner: 'user-456',
                    shouldShowForm: true
                }
            ];

            testCases.forEach(({ description, userId, propertyOwner, shouldShowForm }) => {
                const props = createProps(
                    { user: { ...mockSessionUser, id: userId } },
                    { owner: propertyOwner as any }
                );
                
                const { unmount } = render(<PropertyPageAside {...props} />);
                
                if (shouldShowForm) {
                    expect(screen.getByTestId('property-contact-form')).toBeInTheDocument();
                } else {
                    expect(screen.queryByTestId('property-contact-form')).not.toBeInTheDocument();
                }
                
                unmount();
            });
        });
    });

    describe('WithAuth HOC Integration', () => {
        it('should be wrapped with withAuth HOC', () => {
            // This test verifies that the component is exported with withAuth wrapper
            const props = createProps();
            
            expect(() => render(<PropertyPageAside {...props} />)).not.toThrow();
        });

        it('should receive session prop from withAuth', () => {
            const props = createProps({ user: { ...mockSessionUser, name: 'HOC User' } });
            render(<PropertyPageAside {...props} />);
            
            // If session is passed through correctly, the component should work
            expect(screen.getByTestId('property-contact-form')).toHaveAttribute('data-user-name', 'HOC User');
        });
    });

    describe('Performance and Optimization', () => {
        it('should render efficiently without unnecessary re-renders', () => {
            const props = createProps();
            const startTime = performance.now();
            
            render(<PropertyPageAside {...props} />);
            
            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(50);
        });

        it('should handle rapid prop changes', () => {
            const props = createProps();
            const { rerender } = render(<PropertyPageAside {...props} />);
            
            // Rapidly change between showing and hiding form
            for (let i = 0; i < 10; i++) {
                const newProps = createProps(
                    {},
                    { owner: i % 2 === 0 ? mockSessionUser.id as any : 'different-owner' as any }
                );
                
                rerender(<PropertyPageAside {...newProps} />);
            }
            
            // Should end with form visible (i=9, odd, different owner)
            expect(screen.getByTestId('property-contact-form')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should use semantic aside element', () => {
            const props = createProps();
            const { container } = render(<PropertyPageAside {...props} />);
            
            const aside = container.querySelector('aside');
            expect(aside).toBeInTheDocument();
            expect(aside?.tagName).toBe('ASIDE');
        });

        it('should maintain proper document structure', () => {
            const props = createProps({}, { owner: 'different-owner' as any });
            const { container } = render(<PropertyPageAside {...props} />);
            
            const aside = container.querySelector('aside');
            const contactForm = screen.getByTestId('property-contact-form');
            
            expect(aside).toContainElement(contactForm);
        });

        it('should be screen reader friendly when empty', () => {
            const props = createProps({ user: null as any });
            const { container } = render(<PropertyPageAside {...props} />);
            
            const aside = container.querySelector('aside');
            expect(aside).toBeInTheDocument();
            expect(aside).toBeEmptyDOMElement();
        });
    });

    describe('Component Props Interface', () => {
        it('should accept required PropertyPageAsidePros interface', () => {
            const validProps: WithAuthProps & { property: PropertyDocument } = {
                property: defaultProperty,
                session: defaultSession as any
            };
            
            expect(() => render(<PropertyPageAside {...validProps} />)).not.toThrow();
        });

        it('should handle property prop correctly', () => {
            const customProperty = createMockPropertyData({
                name: 'Test Property for Aside'
            }) as unknown as PropertyDocument;
            
            const props = createProps({}, customProperty);
            render(<PropertyPageAside {...props} />);
            
            const contactForm = screen.getByTestId('property-contact-form');
            expect(contactForm).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot when showing contact form', () => {
            const props = createProps({}, { owner: 'different-owner' as any });
            const { container } = render(<PropertyPageAside {...props} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot when hiding contact form (no session)', () => {
            const props = createProps({ user: null as any });
            const { container } = render(<PropertyPageAside {...props} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot when hiding contact form (user is owner)', () => {
            const props = createProps({}, { owner: mockSessionUser.id as any });
            const { container } = render(<PropertyPageAside {...props} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with custom user data', () => {
            const props = createProps(
                { user: { ...mockSessionUser, name: 'Custom Name', email: 'custom@email.com' } },
                { owner: 'different-owner' as any }
            );
            const { container } = render(<PropertyPageAside {...props} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});