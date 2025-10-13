// ***********************************************************
// Support file for Cypress E2E tests
// This file is loaded automatically before test files
// ***********************************************************

// Import commands
import './commands'

// Import Cypress Testing Library commands
import '@testing-library/cypress/add-commands'

// Import Cypress Axe for accessibility testing
import 'cypress-axe'

// Global before hook
before(() => {
    // Any global setup before all tests
})

// Global beforeEach hook
beforeEach(() => {
    // Reset any global state before each test
    // Clear cookies and local storage
    cy.clearCookies()
    cy.clearLocalStorage()
})

// Global afterEach hook
afterEach(() => {
    // Cleanup after each test if needed
})

// Prevent Cypress from failing tests on uncaught exceptions
// This is useful for third-party scripts that may throw errors
Cypress.on('uncaught:exception', (err) => {
    // Return false to prevent the test from failing
    // Adjust this logic based on your app's error handling
    if (err.message.includes('ResizeObserver loop')) {
        return false
    }
    // Let other errors fail the test
    return true
})

// Add custom logging for better debugging
Cypress.on('fail', (error) => {
    // Log additional context when tests fail
    console.error('Error:', error.message)
    throw error
})
