import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'cypress/support/e2e.ts',
        video: true,
        screenshotOnRunFailure: true,
        viewportWidth: 1280,
        viewportHeight: 720,
        experimentalStudio: true,
        setupNodeEvents(on, config) {
            // Code coverage plugin
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            require('@cypress/code-coverage/task')(on, config)
            return config
        },
    },
    env: {
        // Test environment variables
        apiUrl: 'http://localhost:3000/api',
        coverage: true,
    },
    retries: {
        runMode: 2,
        openMode: 0,
    },
})
