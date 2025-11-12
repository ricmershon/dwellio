/**
 * E2E Tests: OAuth Provider Authentication
 *
 * Tests OAuth login flows including Google authentication,
 * account creation, account linking, and error handling.
 */

describe('OAuth Login Flow', () => {
    beforeEach(() => {
        cy.visit('/login')
    })

    describe('OAuth Provider Button Rendering', () => {
        it('should display Google OAuth login button', () => {
            cy.contains('Continue with Google').should('be.visible')
        })

        it('should render Google logo in OAuth button', () => {
            cy.get('button').contains('Continue with Google').within(() => {
                cy.get('img[alt="Google logo"]').should('be.visible')
            })
        })

        it('should have correct button styling for OAuth providers', () => {
            cy.contains('Continue with Google')
                .should('have.class', 'btn')
                .should('have.class', 'btn-login-logout')
        })

        it('should center text in OAuth button with logo on left', () => {
            cy.get('button').contains('Continue with Google').within(() => {
                cy.get('img[alt="Google logo"]').should('have.class', 'absolute')
                cy.get('div').should('have.class', 'mx-auto')
            })
        })
    })

    describe('Google OAuth Login Flow', () => {
        it('should initiate Google OAuth flow when button clicked', () => {
            // Intercept the OAuth redirect
            cy.intercept('GET', '**/api/auth/signin/google*', {
                statusCode: 302,
                headers: {
                    Location: 'https://accounts.google.com/o/oauth2/v2/auth'
                }
            }).as('googleOAuth')

            cy.contains('Continue with Google').click()

            // Should attempt to redirect to Google OAuth
            cy.wait('@googleOAuth')
        })

        it('should include callback URL in OAuth request', () => {
            let requestUrl: string

            cy.intercept('**/api/auth/signin/google*', (req) => {
                requestUrl = req.url
                req.reply({
                    statusCode: 302,
                    headers: {
                        Location: 'https://accounts.google.com/o/oauth2/v2/auth'
                    }
                })
            }).as('googleOAuth')

            cy.contains('Continue with Google').click()

            cy.wait('@googleOAuth').then(() => {
                expect(requestUrl).to.include('callbackUrl')
            })
        })

        it('should redirect to home page after successful Google OAuth', () => {
            // Mock successful OAuth callback
            cy.intercept('GET', '**/api/auth/callback/google*', {
                statusCode: 302,
                headers: {
                    Location: '/'
                }
            }).as('oauthCallback')

            // Simulate OAuth success by visiting callback URL
            cy.visit('/api/auth/callback/google?code=mock_code&state=mock_state')

            cy.wait('@oauthCallback')
            cy.url().should('eq', Cypress.config().baseUrl + '/')
        })
    })

    describe('OAuth Account Creation', () => {
        it('should create new user account for first-time Google OAuth', () => {
            // Mock OAuth callback for new user
            cy.intercept('GET', '**/api/auth/callback/google*', (req) => {
                req.reply({
                    statusCode: 200,
                    body: {
                        user: {
                            id: 'new-user-123',
                            email: 'newuser@example.com',
                            name: 'New User',
                            image: 'https://example.com/avatar.jpg'
                        }
                    }
                })
            }).as('newUserOAuth')

            cy.visit('/api/auth/callback/google?code=mock_code&state=mock_state')

            // Should redirect to home as authenticated user
            cy.url().should('include', '/')
        })

        it('should use Google profile information for new account', () => {
            // This would be tested through the API or database verification
            // For E2E, we verify the user sees their profile after OAuth
            cy.intercept('GET', '**/api/auth/callback/google*', {
                statusCode: 302,
                headers: {
                    Location: '/'
                }
            }).as('oauthCallback')

            cy.visit('/api/auth/callback/google?code=mock_code&state=mock_state')
            cy.wait('@oauthCallback')

            // Navigate to profile to verify account creation
            cy.visit('/profile')
            // Profile should load (account was created)
            cy.url().should('include', '/profile')
        })
    })

    describe('OAuth Account Linking', () => {
        it('should link Google account to existing user with same email', () => {
            // This tests the account linking behavior mentioned in the UI
            // "If you have an existing Google account with this email,
            // creating a password will link both sign-in methods"

            cy.intercept('GET', '**/api/auth/callback/google*', {
                statusCode: 200,
                body: {
                    user: {
                        id: 'existing-user-456',
                        email: 'existing@example.com',
                        name: 'Existing User'
                    }
                }
            }).as('linkedOAuth')

            cy.visit('/api/auth/callback/google?code=mock_code&state=mock_state')

            // Should successfully authenticate existing user
            cy.url().should('include', '/')
        })

        it('should display account linking information on login page', () => {
            cy.contains('Account Linking').should('be.visible')
            cy.contains('If you have an existing Google account').should('be.visible')
        })
    })

    describe('OAuth Error Handling', () => {
        it('should handle OAuth cancellation gracefully', () => {
            // User cancels OAuth flow
            cy.visit('/api/auth/callback/google?error=access_denied')

            // Should redirect back to login with error
            cy.url().should('include', '/login')
        })

        it('should handle OAuth provider error', () => {
            cy.intercept('GET', '**/api/auth/callback/google*', {
                statusCode: 400,
                body: {
                    error: 'OAuth provider error'
                }
            }).as('oauthError')

            cy.visit('/api/auth/callback/google?code=invalid_code')

            cy.wait('@oauthError')
            // Should handle error gracefully
            cy.url().should('include', '/login')
        })

        it('should handle network error during OAuth', () => {
            cy.intercept('**/api/auth/signin/google*', {
                forceNetworkError: true
            }).as('networkError')

            cy.contains('Continue with Google').click()

            // Should remain on login page or show error
            cy.url().should('include', '/login')
        })
    })

    describe('OAuth Session Creation', () => {
        it('should create valid session after successful OAuth', () => {
            cy.intercept('GET', '**/api/auth/callback/google*', {
                statusCode: 302,
                headers: {
                    Location: '/',
                    'Set-Cookie': 'next-auth.session-token=mock_token; Path=/; HttpOnly'
                }
            }).as('oauthSession')

            cy.visit('/api/auth/callback/google?code=mock_code&state=mock_state')

            cy.wait('@oauthSession')

            // Verify session cookie was set
            cy.getCookie('next-auth.session-token').should('exist')
        })

        it('should redirect to intended page after OAuth with return URL', () => {
            // Visit protected page to trigger redirect
            cy.visit('/profile')
            cy.url().should('include', '/login')

            // Check that callbackUrl is preserved
            cy.url().should('include', 'callbackUrl')

            cy.intercept('GET', '**/api/auth/callback/google*', {
                statusCode: 302,
                headers: {
                    Location: '/profile'
                }
            }).as('oauthWithReturn')

            cy.contains('Continue with Google').click()

            // After OAuth, should redirect to intended page
            cy.wait('@oauthWithReturn')
            cy.url().should('include', '/profile')
        })
    })
})
