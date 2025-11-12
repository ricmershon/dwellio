/**
 * Smoke Test for Cypress E2E Setup
 *
 * Verifies that Cypress is properly configured and can access the application.
 * This test should be run first to ensure the E2E testing environment is set up correctly.
 */

describe('Cypress E2E Setup Smoke Test', () => {
    it('should load the application homepage', () => {
        cy.visit('/')
        cy.contains('Dwellio').should('be.visible')
    })

    it('should have the correct base URL configured', () => {
        cy.visit('/')
        cy.url().should('include', 'localhost:3000')
    })

    it('should be able to access environment variables', () => {
         
        expect(Cypress.env('apiUrl')).to.equal('http://localhost:3000/api')
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(Cypress.env('coverage')).to.be.true
    })

    it('should have viewport configured correctly', () => {
        cy.viewport(1280, 720)
        cy.window().its('innerWidth').should('equal', 1280)
        cy.window().its('innerHeight').should('equal', 720)
    })

    it('should be able to navigate to properties page', () => {
        cy.visit('/properties')
        cy.url().should('include', '/properties')
    })

    it('should handle 404 pages gracefully', () => {
        cy.visit('/non-existent-page', { failOnStatusCode: false })
        cy.contains('404').should('be.visible')
    })
})
