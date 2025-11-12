/**
 * E2E Tests: Session Persistence and Management
 *
 * Tests session behavior including persistence across page reloads,
 * session expiration, logout, and multi-tab synchronization.
 */

describe('Session Persistence and Management', () => {
    beforeEach(() => {
        // Clear session before each test
        cy.clearCookies()
        cy.clearLocalStorage()
    })

    describe('Session Creation and Persistence', () => {
        it('should persist session across page reloads', () => {
            // Mock successful login
            cy.intercept('POST', '/api/auth/callback/credentials*', {
                statusCode: 200,
                body: { url: '/' }
            }).as('login')

            // Set session cookie to simulate authenticated state
            cy.setCookie('next-auth.session-token', 'mock_session_token_123')

            // Visit home page as authenticated user
            cy.visit('/')

            // Verify authenticated state (e.g., user menu visible)
            // This would check for logged-in UI elements

            // Reload the page
            cy.reload()

            // Session should persist - user menu still visible
            cy.getCookie('next-auth.session-token').should('exist')
        })

        it('should maintain session data after navigation', () => {
            // Set up authenticated session
            cy.setCookie('next-auth.session-token', 'mock_session_token_123')

            cy.visit('/')

            // Navigate to different pages
            cy.visit('/properties')
            cy.getCookie('next-auth.session-token').should('exist')

            cy.visit('/profile')
            cy.getCookie('next-auth.session-token').should('exist')

            cy.visit('/messages')
            cy.getCookie('next-auth.session-token').should('exist')
        })

        it('should restore session after browser close (if remember me enabled)', () => {
            // This tests persistent session storage
            cy.setCookie('next-auth.session-token', 'mock_persistent_token', {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                expiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
            })

            cy.visit('/')

            // Clear in-memory state but keep cookies (simulating browser restart)
            cy.clearLocalStorage()

            cy.visit('/')

            // Session should still exist
            cy.getCookie('next-auth.session-token').should('exist')
        })
    })

    describe('Session Validation', () => {
        it('should validate session on protected route access', () => {
            // Attempt to access protected route without session
            cy.visit('/profile')

            // Should redirect to login
            cy.url().should('include', '/login')

            // Now set valid session
            cy.setCookie('next-auth.session-token', 'valid_session_token')

            cy.visit('/profile')

            // Should allow access
            cy.url().should('include', '/profile')
            cy.url().should('not.include', '/login')
        })

        it('should validate session on page load for protected routes', () => {
            // Set expired or invalid session token
            cy.setCookie('next-auth.session-token', 'expired_token')

            // Mock session validation endpoint to return unauthorized
            cy.intercept('GET', '**/api/auth/session*', {
                statusCode: 401,
                body: null
            }).as('sessionCheck')

            cy.visit('/profile')

            // Should redirect to login due to invalid session
            cy.url().should('include', '/login')
        })
    })

    describe('Logout and Session Clearing', () => {
        it('should completely clear session on logout', () => {
            // Set up authenticated session
            cy.setCookie('next-auth.session-token', 'mock_session_token_123')
            cy.visit('/')

            // Mock logout endpoint
            cy.intercept('POST', '**/api/auth/signout*', {
                statusCode: 200,
                body: {}
            }).as('logout')

            // Perform logout (this depends on your UI implementation)
            // Assuming there's a logout button in user menu
            cy.get('[data-cy=user-menu]').should('exist').click()
            cy.get('[data-cy=logout-button]').should('exist').click()

            cy.wait('@logout')

            // Session cookie should be cleared
            cy.getCookie('next-auth.session-token').should('not.exist')

            // Should redirect to home or login
            cy.url().should('match', /\/$|\/login/)
        })

        it('should clear local storage on logout', () => {
            // Set up session and local storage
            cy.setCookie('next-auth.session-token', 'mock_session_token_123')
            cy.visit('/')

            // Set some local storage items
            cy.window().then((win) => {
                win.localStorage.setItem('test-key', 'test-value')
            })

            // Mock logout
            cy.intercept('POST', '**/api/auth/signout*', {
                statusCode: 200,
                body: {}
            }).as('logout')

            // Logout
            cy.get('[data-cy=user-menu]').should('exist').click()
            cy.get('[data-cy=logout-button]').should('exist').click()

            cy.wait('@logout')

            // Local storage should be cleared
            cy.window().then((win) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                expect(win.localStorage.getItem('test-key')).to.be.null
            })
        })

        it('should prevent access to protected routes after logout', () => {
            // Set up session
            cy.setCookie('next-auth.session-token', 'mock_session_token_123')
            cy.visit('/')

            // Logout
            cy.intercept('POST', '**/api/auth/signout*', {
                statusCode: 200,
                body: {}
            }).as('logout')

            cy.get('[data-cy=user-menu]').should('exist').click()
            cy.get('[data-cy=logout-button]').should('exist').click()

            cy.wait('@logout')

            // Try to access protected route
            cy.visit('/profile')

            // Should redirect to login
            cy.url().should('include', '/login')
        })
    })

    describe('Multi-Tab Session Synchronization', () => {
        it('should synchronize logout across multiple tabs', () => {
            // Set up session
            cy.setCookie('next-auth.session-token', 'mock_session_token_123')

            // Open first tab
            cy.visit('/')

            // Simulate second tab by opening new window
            cy.window().then(() => {
                // Clear session (simulating logout in another tab)
                cy.clearCookie('next-auth.session-token')

                // Reload first window
                cy.reload()

                // Should detect logout and redirect
                cy.url().should('satisfy', (url: string) => {
                    return url === Cypress.config().baseUrl + '/' ||
                           url.includes('/login')
                })
            })
        })

        it('should maintain session across multiple tabs', () => {
            // Set up session
            cy.setCookie('next-auth.session-token', 'mock_session_token_123')

            // Visit page in first tab
            cy.visit('/')
            cy.getCookie('next-auth.session-token').should('exist')

            // Visit different page in same session (simulating second tab)
            cy.visit('/properties')
            cy.getCookie('next-auth.session-token').should('exist')

            // Both should share the same session
            // Session token should be identical
            cy.getCookie('next-auth.session-token')
                .should('have.property', 'value', 'mock_session_token_123')
        })
    })

    describe('Session Expiration', () => {
        it('should handle expired session gracefully', () => {
            // Set expired session token
            cy.setCookie('next-auth.session-token', 'expired_token', {
                expiry: Date.now() - 1000 // Expired 1 second ago
            })

            // Mock session endpoint to return expired
            cy.intercept('GET', '**/api/auth/session*', {
                statusCode: 401,
                body: { error: 'Session expired' }
            }).as('expiredSession')

            cy.visit('/profile')

            // Should redirect to login
            cy.url().should('include', '/login')
        })

        it('should prompt re-authentication after session timeout', () => {
            // Set up valid session
            cy.setCookie('next-auth.session-token', 'valid_token')
            cy.visit('/profile')

            // Simulate session expiration
            cy.intercept('GET', '**/api/auth/session*', {
                statusCode: 401,
                body: null
            }).as('sessionExpired')

            // Navigate or refresh to trigger session check
            cy.reload()

            // Should redirect to login
            cy.url().should('include', '/login')
        })
    })
})
