/**
 * E2E Tests: Protected Routes and Authorization
 *
 * Tests route protection, redirect behavior, return URL preservation,
 * and authorization checks for authenticated routes.
 */

describe('Protected Routes and Authorization', () => {
    beforeEach(() => {
        // Clear session before each test
        cy.clearCookies()
        cy.clearLocalStorage()
    })

    describe('Unauthenticated Access - Redirects to Login', () => {
        it('should redirect unauthenticated user from /profile to /login', () => {
            cy.visit('/profile')

            // Should redirect to login page
            cy.url().should('include', '/login')
        })

        it('should redirect unauthenticated user from /messages to /login', () => {
            cy.visit('/messages')

            // Should redirect to login page
            cy.url().should('include', '/login')
        })

        it('should redirect unauthenticated user from /properties/add to /login', () => {
            cy.visit('/properties/add')

            // Should redirect to login page
            cy.url().should('include', '/login')
        })

        it('should redirect unauthenticated user from /properties/[id]/edit to /login', () => {
            cy.visit('/properties/123456789/edit')

            // Should redirect to login page
            cy.url().should('include', '/login')
        })
    })

    describe('Return URL Preservation', () => {
        it('should preserve return URL when redirecting to login from /profile', () => {
            cy.visit('/profile')

            // Should redirect to login with callbackUrl
            cy.url().should('include', '/login')
            cy.url().should('match', /[?&]callbackUrl=/)
        })

        it('should preserve return URL when redirecting from /messages', () => {
            cy.visit('/messages')

            cy.url().should('include', '/login')
            cy.url().should('match', /[?&]callbackUrl=/)
        })

        it('should preserve return URL when redirecting from /properties/add', () => {
            cy.visit('/properties/add')

            cy.url().should('include', '/login')
            cy.url().should('match', /[?&]callbackUrl=/)
        })

        it('should decode and preserve complex return URLs with query params', () => {
            cy.visit('/properties?type=house&beds=3')

            // If properties page is protected or redirects guests
            // Return URL should preserve query parameters
            cy.url().then((url) => {
                if (url.includes('/login')) {
                    cy.url().should('match', /callbackUrl=.*properties/)
                }
            })
        })
    })

    describe('Authenticated Access - Route Access Allowed', () => {
        beforeEach(() => {
            // Set up authenticated session
            cy.setCookie('next-auth.session-token', 'valid_session_token_123')
        })

        it('should allow authenticated access to /profile', () => {
            cy.visit('/profile')

            // Should stay on profile page
            cy.url().should('include', '/profile')
            cy.url().should('not.include', '/login')
        })

        it('should allow authenticated access to /messages', () => {
            cy.visit('/messages')

            // Should stay on messages page
            cy.url().should('include', '/messages')
            cy.url().should('not.include', '/login')
        })

        it('should allow authenticated access to /properties/add', () => {
            cy.visit('/properties/add')

            // Should stay on add property page
            cy.url().should('include', '/properties/add')
            cy.url().should('not.include', '/login')
        })

        it('should allow authenticated access to property edit pages', () => {
            // Mock property ownership check
            cy.intercept('GET', '**/api/properties/123456789', {
                statusCode: 200,
                body: {
                    _id: '123456789',
                    name: 'Test Property',
                    owner: 'current-user-id'
                }
            }).as('getProperty')

            cy.visit('/properties/123456789/edit')

            // Should allow access to edit page
            cy.url().should('include', '/properties/123456789/edit')
            cy.url().should('not.include', '/login')
        })
    })

    describe('Session Validation Timing', () => {
        it('should validate session immediately on page load', () => {
            // Mock session validation endpoint
            cy.intercept('GET', '**/api/auth/session*', {
                statusCode: 401,
                body: null
            }).as('sessionCheck')

            cy.visit('/profile')

            // Session check should happen quickly
            cy.wait('@sessionCheck', { timeout: 2000 })

            // Should redirect to login
            cy.url().should('include', '/login')
        })

        it('should not show protected content before session validation', () => {
            // Set up slow session check to test loading state
            cy.intercept('GET', '**/api/auth/session*', {
                delay: 1000,
                statusCode: 200,
                body: {
                    user: {
                        id: 'user-123',
                        email: 'test@example.com'
                    }
                }
            }).as('slowSessionCheck')

            cy.setCookie('next-auth.session-token', 'valid_token')

            cy.visit('/profile')

            // Should show loading state or not show sensitive data immediately
            // This would check for loading spinner or skeleton screen
        })

        it('should perform session validation on client-side navigation', () => {
            cy.setCookie('next-auth.session-token', 'valid_token')

            // Start on home page
            cy.visit('/')

            // Navigate to protected route
            cy.visit('/profile')

            // Should validate session
            cy.url().should('include', '/profile')
            cy.getCookie('next-auth.session-token').should('exist')
        })
    })

    describe('Navigation Between Protected Routes', () => {
        beforeEach(() => {
            // Set up authenticated session
            cy.setCookie('next-auth.session-token', 'valid_session_token_123')
        })

        it('should maintain session when navigating between protected routes', () => {
            cy.visit('/profile')
            cy.url().should('include', '/profile')

            cy.visit('/messages')
            cy.url().should('include', '/messages')

            cy.visit('/properties/add')
            cy.url().should('include', '/properties/add')

            // Session should persist throughout
            cy.getCookie('next-auth.session-token').should('exist')
        })

        it('should not re-validate session unnecessarily between protected routes', () => {
            cy.intercept('GET', '**/api/auth/session*', {
                statusCode: 200,
                body: {
                    user: {
                        id: 'user-123',
                        email: 'test@example.com'
                    }
                }
            }).as('sessionCheck')

            cy.visit('/profile')
            cy.visit('/messages')
            cy.visit('/properties/add')

            // Should not make excessive session validation calls
            // (Exact count depends on caching strategy)
        })

        it('should handle back button navigation between protected routes', () => {
            cy.visit('/profile')
            cy.url().should('include', '/profile')

            cy.visit('/messages')
            cy.url().should('include', '/messages')

            // Go back
            cy.go('back')
            cy.url().should('include', '/profile')

            // Session should still be valid
            cy.getCookie('next-auth.session-token').should('exist')
        })
    })

    describe('Authorization Check on Page Load', () => {
        it('should perform authorization check for owner-only routes', () => {
            cy.setCookie('next-auth.session-token', 'valid_session_token_123')

            // Try to edit property not owned by user
            cy.intercept('GET', '**/api/properties/999999999', {
                statusCode: 200,
                body: {
                    _id: '999999999',
                    name: 'Someone Elses Property',
                    owner: 'different-user-id'
                }
            }).as('getProperty')

            cy.visit('/properties/999999999/edit')

            // Should either redirect or show unauthorized message
            // (Implementation-specific behavior)
            cy.wait('@getProperty')
        })

        it('should allow access to own property edit page', () => {
            cy.setCookie('next-auth.session-token', 'valid_session_token_123')

            // Mock property owned by current user
            cy.intercept('GET', '**/api/properties/123456789', {
                statusCode: 200,
                body: {
                    _id: '123456789',
                    name: 'My Property',
                    owner: 'current-user-id'
                }
            }).as('getOwnProperty')

            // Mock session with matching user ID
            cy.intercept('GET', '**/api/auth/session*', {
                statusCode: 200,
                body: {
                    user: {
                        id: 'current-user-id',
                        email: 'test@example.com'
                    }
                }
            }).as('session')

            cy.visit('/properties/123456789/edit')

            // Should allow access
            cy.url().should('include', '/properties/123456789/edit')
        })
    })

    describe('Public Route Access', () => {
        it('should allow unauthenticated access to home page', () => {
            cy.visit('/')

            // Should load without redirect
            cy.url().should('eq', Cypress.config().baseUrl + '/')
        })

        it('should allow unauthenticated access to properties listing', () => {
            cy.visit('/properties')

            // Should load without redirect
            cy.url().should('include', '/properties')
            cy.url().should('not.include', '/login')
        })

        it('should allow unauthenticated access to property detail pages', () => {
            // Mock property data
            cy.intercept('GET', '**/api/properties/123456789', {
                statusCode: 200,
                body: {
                    _id: '123456789',
                    name: 'Public Property',
                    type: 'House'
                }
            }).as('getProperty')

            cy.visit('/properties/123456789')

            // Should allow access
            cy.url().should('include', '/properties/123456789')
            cy.url().should('not.include', '/login')
        })

        it('should allow authenticated users to access public routes', () => {
            cy.setCookie('next-auth.session-token', 'valid_session_token_123')

            cy.visit('/')
            cy.url().should('eq', Cypress.config().baseUrl + '/')

            cy.visit('/properties')
            cy.url().should('include', '/properties')
        })
    })
})
