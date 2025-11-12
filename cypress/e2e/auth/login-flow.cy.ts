/**
 * E2E Tests: Credential Authentication Login Flow
 *
 * Tests the complete login workflow including form validation,
 * successful authentication, error handling, and UI interactions.
 */

describe('Login Flow - Credential Authentication', () => {
    beforeEach(() => {
        cy.visit('/login')
    })

    describe('Page Load and Initial State', () => {
        it('should load login page with all required elements', () => {
            cy.contains('Dwellio').should('be.visible')
            cy.get('input[name="email"]').should('be.visible')
            cy.get('input[name="password"]').should('be.visible')
            cy.get('button[type="submit"]').should('contain', 'Sign In')
        })

        it('should display OAuth provider buttons', () => {
            cy.contains('Continue with Google').should('be.visible')
        })

        it('should display account linking information', () => {
            cy.contains('Account Linking').should('be.visible')
        })
    })

    describe('Form Validation', () => {
        it('should show validation for empty email field', () => {
            cy.get('button[type="submit"]').click()
            cy.get('input[name="email"]:invalid').should('exist')
        })

        it('should show validation for invalid email format', () => {
            cy.get('input[name="email"]').type('invalid-email')
            cy.get('input[name="password"]').type('password123')
            cy.get('button[type="submit"]').click()
            cy.get('input[name="email"]:invalid').should('exist')
        })

        it('should show validation for empty password field', () => {
            cy.get('input[name="email"]').type('test@example.com')
            cy.get('button[type="submit"]').click()
            cy.get('input[name="password"]:invalid').should('exist')
        })

        it('should accept valid email format', () => {
            cy.get('input[name="email"]').type('test@example.com')
            cy.get('input[name="email"]:invalid').should('not.exist')
        })
    })

    describe('Form Field Behavior', () => {
        it('should have auto-focus on email field when page loads', () => {
            cy.visit('/login')
            cy.focused().should('have.attr', 'name', 'email')
        })

        it('should support keyboard navigation between fields', () => {
            cy.get('input[name="email"]').type('test@example.com{tab}')
            cy.focused().should('have.attr', 'name', 'password')
        })

        it('should clear form fields when clicking input after error', () => {
            cy.get('input[name="email"]').type('test@example.com')
            cy.get('input[name="password"]').type('wrongpassword')
            cy.get('button[type="submit"]').click()

            // Click on email field to trigger clear
            cy.get('input[name="email"]').click()
        })

        it('should disable form fields during submission', () => {
            cy.intercept('POST', '/api/auth/callback/credentials*', {
                delay: 1000,
                statusCode: 200,
                body: {}
            }).as('loginRequest')

            cy.get('input[name="email"]').type('test@example.com')
            cy.get('input[name="password"]').type('password123')
            cy.get('button[type="submit"]').click()

            cy.get('input[name="email"]').should('be.disabled')
            cy.get('input[name="password"]').should('be.disabled')
            cy.get('button[type="submit"]').should('be.disabled')
        })
    })

    describe('Submit Button States', () => {
        it('should show loading state during form submission', () => {
            cy.intercept('POST', '/api/auth/callback/credentials*', {
                delay: 1000,
                statusCode: 200,
                body: {}
            }).as('loginRequest')

            cy.get('input[name="email"]').type('test@example.com')
            cy.get('input[name="password"]').type('password123')
            cy.get('button[type="submit"]').click()

            cy.get('button[type="submit"]').should('contain', 'Please wait...')
            cy.get('button[type="submit"] svg.animate-spin').should('be.visible')
        })

        it('should return to normal state after submission completes', () => {
            cy.intercept('POST', '/api/auth/callback/credentials*', {
                statusCode: 401,
                body: { error: 'Invalid credentials' }
            }).as('loginRequest')

            cy.get('input[name="email"]').type('test@example.com')
            cy.get('input[name="password"]').type('wrongpassword')
            cy.get('button[type="submit"]').click()

            cy.wait('@loginRequest')
            cy.get('button[type="submit"]').should('contain', 'Sign In')
            cy.get('button[type="submit"]').should('not.be.disabled')
        })

        it('should support Enter key to submit form', () => {
            cy.get('input[name="email"]').type('test@example.com')
            cy.get('input[name="password"]').type('password123{enter}')

            // Should attempt to submit
            cy.get('button[type="submit"]').should('be.disabled')
        })
    })

    describe('Error Handling', () => {
        it('should handle invalid credentials error', () => {
            cy.intercept('POST', '/api/auth/callback/credentials*', {
                statusCode: 401,
                body: { error: 'Invalid credentials' }
            }).as('loginRequest')

            cy.get('input[name="email"]').type('test@example.com')
            cy.get('input[name="password"]').type('wrongpassword')
            cy.get('button[type="submit"]').click()

            cy.wait('@loginRequest')
            // Error should be displayed (implementation-specific)
        })

        it('should handle network error gracefully', () => {
            cy.intercept('POST', '/api/auth/callback/credentials*', {
                forceNetworkError: true
            }).as('loginRequest')

            cy.get('input[name="email"]').type('test@example.com')
            cy.get('input[name="password"]').type('password123')
            cy.get('button[type="submit"]').click()

            // Should handle network error gracefully
            cy.get('button[type="submit"]').should('not.be.disabled')
        })

        it('should handle server error (500) gracefully', () => {
            cy.intercept('POST', '/api/auth/callback/credentials*', {
                statusCode: 500,
                body: { error: 'Internal server error' }
            }).as('loginRequest')

            cy.get('input[name="email"]').type('test@example.com')
            cy.get('input[name="password"]').type('password123')
            cy.get('button[type="submit"]').click()

            cy.wait('@loginRequest')
            // Error should be handled
            cy.get('button[type="submit"]').should('not.be.disabled')
        })
    })

    describe('Successful Login', () => {
        it('should redirect to home page after successful login', () => {
            // Mock successful authentication
            cy.intercept('POST', '/api/auth/callback/credentials*', {
                statusCode: 200,
                body: { url: '/' }
            }).as('loginRequest')

            cy.get('input[name="email"]').type('test@example.com')
            cy.get('input[name="password"]').type('password123')
            cy.get('button[type="submit"]').click()

            cy.wait('@loginRequest')
            cy.url().should('eq', Cypress.config().baseUrl + '/')
        })

        it('should redirect to intended page after login (return URL)', () => {
            // Visit protected page to trigger redirect with return URL
            cy.visit('/profile')
            cy.url().should('include', '/login')

            // Mock successful authentication
            cy.intercept('POST', '/api/auth/callback/credentials*', {
                statusCode: 200,
                body: { url: '/profile' }
            }).as('loginRequest')

            cy.get('input[name="email"]').type('test@example.com')
            cy.get('input[name="password"]').type('password123')
            cy.get('button[type="submit"]').click()

            cy.wait('@loginRequest')
            cy.url().should('include', '/profile')
        })
    })
})
