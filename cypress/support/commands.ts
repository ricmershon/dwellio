/// <reference types="cypress" />

// ***********************************************
// Custom commands for Dwellio E2E testing
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to log in via the UI
             * @example cy.login('user@example.com', 'password123')
             */
            login(email: string, password: string): Chainable<void>

            /**
             * Custom command to log out
             * @example cy.logout()
             */
            logout(): Chainable<void>

            /**
             * Custom command to seed the test database
             * @example cy.seedDatabase()
             */
            seedDatabase(): Chainable<void>

            /**
             * Custom command to clean the test database
             * @example cy.cleanDatabase()
             */
            cleanDatabase(): Chainable<void>

            /**
             * Custom command to create a property via API
             * @example cy.createProperty({ name: 'Test Property', ... })
             */
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            createProperty(propertyData: Record<string, unknown>): Chainable<Record<string, unknown>>
        }
    }
}

// Authentication commands
Cypress.Commands.add('login', (email: string, password: string) => {
    cy.session([email, password], () => {
        cy.visit('/login')
        cy.get('[data-cy=email-input]').type(email)
        cy.get('[data-cy=password-input]').type(password)
        cy.get('[data-cy=login-button]').click()
        cy.url().should('not.include', '/login')
    })
})

Cypress.Commands.add('logout', () => {
    cy.get('[data-cy=user-menu]').click()
    cy.get('[data-cy=logout-button]').click()
    cy.url().should('include', '/')
})

// Database seeding commands
Cypress.Commands.add('seedDatabase', () => {
    cy.exec('npm run db:seed:test')
})

Cypress.Commands.add('cleanDatabase', () => {
    cy.exec('npm run db:clean:test')
})

// Property management commands
Cypress.Commands.add('createProperty', (propertyData) => {
    cy.request({
        method: 'POST',
        url: '/api/properties',
        body: propertyData,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        expect(response.status).to.eq(201)
        return response.body
    })
})

export {}
