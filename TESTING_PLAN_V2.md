# Testing Plan v2.0

## Overview

This document outlines a **balanced testing strategy** for the Dwellio application, targeting 80-85% test coverage through a proper test pyramid approach that prioritizes unit and functional tests while maintaining strategic integration testing.

## Testing Philosophy v2.0

### Core Principles
- **Coverage-Driven Development**: Track coverage weekly, identify gaps early
- **Test Pyramid Adherence**: Proper distribution of unit, functional, and integration tests
- **Efficiency First**: Maximize coverage with minimum test maintenance overhead
- **Real Component Testing**: Reduce over-mocking, test actual component behavior

### Test Distribution Strategy
```
    /\
   /  \    E2E Tests (5%)
  /____\   Integration Tests (25-30%)
 /      \  Functional Tests (35-40%)
/________\ Unit Tests (30-35%)
```

## Testing Goals v2.0

- **Coverage Target**: 80-85% with balanced test types
- **Primary Focus**: Unit tests for individual functions and components
- **Secondary Focus**: Functional tests for page-level behavior and user workflows
- **Tertiary Focus**: Strategic integration tests for critical cross-component interactions
- **Testing Philosophy**: Test both behavior AND implementation completeness

### Quality Gates (Non-Negotiable Requirements)
- ✅ **All Tests Must Pass**: 100% pass rate required at all times
- ✅ **TypeScript Compilation**: Zero `tsc` errors in both source and test code
- ✅ **Linting Standards**: All code must pass `npm run lint` and `npm run lint:tests`
- ✅ **Test Stability**: < 2% flaky test rate across all test suites

## Test Categories & Responsibilities

### 1. Unit Tests (30-35% of coverage)
**Purpose**: Test individual functions, components, and modules in isolation

#### Scope
- **Pure Functions**: Utilities, calculations, data transformations
- **Component Logic**: Individual React components with mocked dependencies
- **Business Logic**: Action functions, validation logic, data processing
- **Error Handling**: Edge cases, boundary conditions, error scenarios

#### When to Write Unit Tests
- ✅ Every utility function in `utils/`
- ✅ Every component in `ui/` (isolated testing)
- ✅ Every function in `lib/actions/`
- ✅ Every function in `lib/data/`
- ✅ Custom hooks and complex logic
- ✅ Error handling and validation logic

#### Unit Test Examples
```typescript
// utils/calculate-price.test.ts
describe('calculatePrice', () => {
  it('should handle nightly rates correctly')
  it('should apply discounts for weekly stays')
  it('should throw error for invalid inputs')
  it('should handle edge case of zero rates')
})

// ui/property-card.test.tsx
describe('PropertyCard', () => {
  it('should render property information correctly')
  it('should handle missing image gracefully')
  it('should call onClick when card is clicked')
  it('should display price formatting correctly')
})
```

### 2. Functional Tests (35-40% of coverage)
**Purpose**: Test page-level functionality, form workflows, and user interactions

#### Scope
- **Page Components**: Next.js pages with server-side rendering
- **Form Workflows**: Multi-step forms, validation flows, submission handling
- **Navigation**: Routing, URL parameters, search params
- **User Interactions**: Click handlers, form inputs, dynamic UI updates

#### When to Write Functional Tests
- ✅ Every page component in `app/`
- ✅ Complex form interactions (property creation, user registration)
- ✅ Search and filtering functionality
- ✅ Navigation and routing behavior
- ✅ Dynamic content loading and state management

#### Functional Test Examples
```typescript
// app/(root)/properties/page.test.tsx
describe('Properties Page', () => {
  it('should render property listings based on search params')
  it('should handle pagination via URL parameters')
  it('should filter properties by type and location')
  it('should display loading states during data fetching')
})

// ui/properties/add-property-form-workflow.test.tsx
describe('Add Property Form Workflow', () => {
  it('should guide user through multi-step property creation')
  it('should validate inputs at each step')
  it('should handle image upload with preview')
  it('should submit complete property data')
})
```

### 3. Integration Tests (25-30% of coverage)
**Purpose**: Test cross-component interactions and critical user journeys

#### Scope
- **Authentication Flows**: Login/logout with real session management
- **Data Persistence**: Form submission → database → UI update
- **External Services**: API interactions with proper mocking
- **Critical User Journeys**: End-to-end workflows for core features

#### When to Write Integration Tests
- ✅ Authentication and authorization flows
- ✅ Property CRUD operations (create → list → view → edit)
- ✅ Messaging system workflows
- ✅ Payment and booking flows (if applicable)
- ✅ Cross-component state synchronization

#### Integration Test Examples
```typescript
// integration/property-management-flow.test.tsx
describe('Property Management Flow', () => {
  it('should create property and display in user listings')
  it('should update property and reflect changes immediately')
  it('should handle property deletion with confirmation')
  it('should manage property ownership authorization')
})
```

### 4. E2E Tests (5% of coverage) - Cypress
**Purpose**: Test complete user journeys in real browser environment

**Framework**: Cypress (https://www.cypress.io/)
- Modern E2E testing framework built for web applications
- Real browser automation (Chrome, Firefox, Edge, Electron)
- Time-travel debugging with automatic waiting
- Network stubbing and request/response interception
- Visual regression testing capabilities

#### Scope
- **Critical User Journeys**: Complete flows from start to finish in real browser
- **Authentication Flows**: Login, logout, session persistence
- **Property Management**: Create → Edit → Delete property workflows
- **Search & Filter**: Search execution, filter application, result display
- **Messaging**: Send message, view messages, mark as read
- **Favorites**: Add to favorites, view favorites, remove from favorites
- **Cross-Browser Testing**: Chrome, Firefox, Edge compatibility
- **Mobile Responsiveness**: Touch interactions, responsive layouts
- **Performance Monitoring**: Page load times, API response times
- **Accessibility**: Keyboard navigation, focus management, ARIA attributes

#### When to Write E2E Tests (Cypress)
- ✅ Critical user paths that generate revenue or conversions
- ✅ Authentication and authorization workflows
- ✅ Multi-step processes (property creation, user registration)
- ✅ Features that require real browser APIs (file uploads, geolocation)
- ✅ Visual regression testing for critical UI components
- ⚠️ NOT for every feature - E2E tests are slow and expensive

#### Cypress Test Structure
```javascript
// cypress/e2e/property-management/create-property.cy.js
describe('Property Creation Flow', () => {
  beforeEach(() => {
    cy.login('testuser@example.com', 'password123')
  })

  it('should create a new property with all required fields', () => {
    // Navigate to create property page
    cy.visit('/properties/add')

    // Fill in property details
    cy.get('[data-cy=property-name]').type('Luxury Downtown Apartment')
    cy.get('[data-cy=property-type]').select('Apartment')
    cy.get('[data-cy=property-beds]').type('2')
    cy.get('[data-cy=property-baths]').type('2')

    // Upload images
    cy.get('[data-cy=image-upload]').selectFile([
      'cypress/fixtures/images/property1.jpg',
      'cypress/fixtures/images/property2.jpg'
    ])

    // Submit form
    cy.get('[data-cy=submit-property]').click()

    // Verify success
    cy.url().should('include', '/properties/')
    cy.contains('Property created successfully').should('be.visible')
  })

  it('should display validation errors for missing required fields', () => {
    cy.visit('/properties/add')
    cy.get('[data-cy=submit-property]').click()

    cy.get('[data-cy=error-property-name]').should('contain', 'Name is required')
    cy.get('[data-cy=error-images]').should('contain', 'At least three images are required')
  })
})

// cypress/e2e/search/property-search.cy.js
describe('Property Search & Filter', () => {
  it('should search properties and display results', () => {
    cy.visit('/properties')

    // Perform search
    cy.get('[data-cy=search-input]').type('downtown apartment')
    cy.get('[data-cy=search-button]').click()

    // Wait for results
    cy.get('[data-cy=property-card]').should('have.length.at.least', 1)
    cy.get('[data-cy=property-card]').first()
      .should('contain', 'downtown')
  })

  it('should filter properties by type and location', () => {
    cy.visit('/properties')

    // Apply filters
    cy.get('[data-cy=filter-type]').select('Apartment')
    cy.get('[data-cy=filter-city]').type('New York')

    // Verify URL updated
    cy.url().should('include', 'type=Apartment')
    cy.url().should('include', 'city=New+York')

    // Verify filtered results
    cy.get('[data-cy=property-card]').each(($card) => {
      cy.wrap($card).should('contain', 'Apartment')
    })
  })
})
```

#### Cypress Best Practices
1. **Use data-cy attributes** for test selectors instead of classes or IDs
2. **Create custom commands** for common operations (login, create property)
3. **Intercept network requests** to test loading states and error handling
4. **Use fixtures** for consistent test data
5. **Avoid hard waits** - use Cypress automatic waiting
6. **Test one thing per test** - keep tests focused and isolated
7. **Run headless in CI** - use `cy.run()` for automated pipelines

#### Cypress Configuration
```javascript
// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    apiUrl: 'http://localhost:3000/api',
  },
})
```

## Project Structure & Organization v2.0

### Test Directory Structure
```
__tests__/                  # Jest unit, component, functional, and integration tests
├── unit/                   # Pure unit tests (Jest)
│   ├── utils/             # Utility function tests
│   ├── lib/               # Business logic tests
│   └── models/            # Data model tests
├── functional/            # Page and workflow tests (Jest)
│   ├── pages/             # Page component tests
│   ├── workflows/         # User workflow tests
│   └── forms/             # Form interaction tests
├── integration/           # Cross-component tests (Jest)
│   ├── auth-flow/         # Authentication integration
│   ├── property-mgmt/     # Property management integration
│   └── messaging/         # Messaging system integration
├── components/            # Individual component tests (Jest)
│   ├── ui/                # UI component tests
│   └── shared/            # Shared component tests
└── __mocks__/             # Mock implementations for Jest

cypress/                   # Cypress E2E tests (separate from Jest)
├── e2e/                   # End-to-end test specs
│   ├── auth/              # Authentication flows
│   ├── property-management/ # Property CRUD workflows
│   ├── search/            # Search and filter tests
│   ├── messaging/         # Messaging system tests
│   └── favorites/         # Favorites functionality
├── fixtures/              # Test data and files
│   ├── images/            # Test images for uploads
│   ├── properties.json    # Property test data
│   └── users.json         # User test data
├── support/               # Custom commands and utilities
│   ├── commands.js        # Cypress custom commands
│   └── e2e.js            # Global test setup
└── downloads/             # Downloaded files during tests
```

### Naming Conventions
- **Unit Tests (Jest)**: `[function-name].unit.test.ts`
- **Functional Tests (Jest)**: `[page-name].functional.test.tsx`
- **Integration Tests (Jest)**: `[workflow-name].integration.test.tsx`
- **Component Tests (Jest)**: `[component-name].component.test.tsx`
- **E2E Tests (Cypress)**: `[journey-name].cy.js`

## Implementation Strategy v2.0

### Phase 1: Foundation Unit Tests (Weeks 1-2)
**Target**: 25-30% coverage through comprehensive unit testing

#### Week 1: Core Utilities and Business Logic
```bash
# Utility functions - high coverage impact
touch __tests__/unit/utils/build-form-error-map.unit.test.ts
touch __tests__/unit/utils/password-utils.unit.test.ts
touch __tests__/unit/utils/get-rate-display.unit.test.ts
touch __tests__/unit/utils/generate-pagination.unit.test.ts

# Business logic - critical functionality
touch __tests__/unit/lib/actions/property-actions.unit.test.ts
touch __tests__/unit/lib/actions/message-actions.unit.test.ts
touch __tests__/unit/lib/actions/user-actions.unit.test.ts
```

#### Week 2: Data Layer and Models
```bash
# Data functions
touch __tests__/unit/lib/data/property-data.unit.test.ts
touch __tests__/unit/lib/data/message-data.unit.test.ts
touch __tests__/unit/lib/data/images-data.unit.test.ts

# Model validation
touch __tests__/unit/models/property-model.unit.test.ts
touch __tests__/unit/models/user-model.unit.test.ts
touch __tests__/unit/models/message-model.unit.test.ts
```

### Phase 2: Component Unit Tests (Weeks 3-4)
**Target**: 45-55% coverage through component testing

#### Week 3: Core UI Components
```bash
# Property components
touch __tests__/components/ui/properties/property-card.component.test.tsx
touch __tests__/components/ui/properties/properties-list.component.test.tsx
touch __tests__/components/ui/properties/search-form.component.test.tsx

# Shared components
touch __tests__/components/ui/shared/pagination.component.test.tsx
touch __tests__/components/ui/shared/form-errors.component.test.tsx
touch __tests__/components/ui/shared/input.component.test.tsx
```

#### Week 4: Complex Components and Forms
```bash
# Form components
touch __tests__/components/ui/properties/add-property-form.component.test.tsx
touch __tests__/components/ui/properties/shared/form/image-picker.component.test.tsx
touch __tests__/components/ui/auth/login-form.component.test.tsx

# Navigation components
touch __tests__/components/ui/root/layout/nav-bar.component.test.tsx
touch __tests__/components/ui/root/layout/footer.component.test.tsx
```

### Phase 3: Functional Tests (Weeks 5-6)
**Target**: 65-75% coverage through page and workflow testing

#### Week 5: Page Component Testing
```bash
# Core pages
touch __tests__/functional/pages/home-page.functional.test.tsx
touch __tests__/functional/pages/properties-page.functional.test.tsx
touch __tests__/functional/pages/property-detail-page.functional.test.tsx
touch __tests__/functional/pages/profile-page.functional.test.tsx
touch __tests__/functional/pages/messages-page.functional.test.tsx
```

#### Week 6: User Workflow Testing
```bash
# Critical workflows
touch __tests__/functional/workflows/property-creation.functional.test.tsx
touch __tests__/functional/workflows/user-registration.functional.test.tsx
touch __tests__/functional/workflows/property-search.functional.test.tsx
touch __tests__/functional/workflows/messaging.functional.test.tsx
```

### Phase 4: Strategic Integration Tests (Week 7)
**Target**: 80-85% coverage through targeted integration testing

#### Week 7: Critical Integration Points
```bash
# High-value integration tests
touch __tests__/integration/auth-flow/complete-auth-flow.integration.test.tsx
touch __tests__/integration/property-mgmt/crud-workflow.integration.test.tsx
touch __tests__/integration/messaging/message-flow.integration.test.tsx
```

## Coverage Monitoring Strategy

### Weekly Coverage Targets
- **Week 1**: 15-20% (Core utilities and business logic)
- **Week 2**: 30-35% (Data layer and models)
- **Week 3**: 45-50% (Core UI components)
- **Week 4**: 60-65% (Complex components and forms)
- **Week 5**: 70-75% (Page components)
- **Week 6**: 78-83% (User workflows)
- **Week 7**: 80-85% (Strategic integration)

### Coverage Quality Metrics
```bash
# Run coverage analysis
npm run test:coverage

# Coverage targets by category
Statement Coverage: 80-85%
Branch Coverage: 75-80%
Function Coverage: 85-90%
Line Coverage: 80-85%
```

### Coverage Tracking Commands
```bash
# Daily coverage check
npm run test:coverage -- --silent | grep "All files"

# Coverage by directory
npm run test:coverage -- --collectCoverageFrom="ui/**/*.{ts,tsx}"

# Coverage gaps identification
npm run test:coverage -- --coverage-reporters=text-lcov | npx lcov-summary
```

## Test Types Guidelines

### Unit Test Guidelines

#### DO:
- **Test Public Interface**: Focus on function inputs and outputs
- **Mock External Dependencies**: Database, APIs, file system
- **Test Edge Cases**: Null, undefined, empty arrays, boundary values
- **Test Error Conditions**: Invalid inputs, network failures
- **Keep Tests Fast**: < 1ms per test, no real I/O

#### DON'T:
- **Test Implementation Details**: Private methods, internal state
- **Test Framework Code**: React lifecycle, Next.js routing
- **Test Mocked Behavior**: Don't verify mock implementations
- **Over-Assert**: One concept per test

#### Example Unit Test Pattern:
```typescript
describe('calculateMonthlyRate', () => {
  // Arrange, Act, Assert pattern
  it('should calculate correct monthly rate from nightly rate', () => {
    // Arrange
    const nightlyRate = 100;
    const expectedMonthly = 2500;

    // Act
    const result = calculateMonthlyRate(nightlyRate);

    // Assert
    expect(result).toBe(expectedMonthly);
  });

  it('should throw error for negative rates', () => {
    expect(() => calculateMonthlyRate(-50)).toThrow('Rate must be positive');
  });
});
```

### Functional Test Guidelines

#### DO:
- **Test User Scenarios**: Complete page interactions
- **Test Real Data Flow**: Use realistic test data
- **Test Navigation**: URL changes, route parameters
- **Test Form Workflows**: Validation, submission, error handling
- **Mock External Services**: APIs, databases, but keep internal logic real

#### DON'T:
- **Test Individual Components**: Use component tests instead
- **Mock Internal Components**: Let components render naturally
- **Test Implementation**: Focus on user-visible behavior
- **Duplicate Unit Test Logic**: Test page-level concerns only

#### Example Functional Test Pattern:
```typescript
describe('Property Search Page', () => {
  it('should filter properties by location and type', async () => {
    // Arrange - render page with test data
    render(<PropertiesPage searchParams={{ location: 'Miami', type: 'apartment' }} />);

    // Act - user searches
    await user.type(screen.getByPlaceholderText('Search location'), 'Beach');
    await user.click(screen.getByText('Search'));

    // Assert - results update
    await waitFor(() => {
      expect(screen.getByText('Beach Properties')).toBeInTheDocument();
    });
  });
});
```

### Integration Test Guidelines

#### DO:
- **Test Cross-Component Workflows**: Real component interactions
- **Test Data Persistence**: Form → API → Database → UI
- **Test State Synchronization**: Shared state across components
- **Mock External Services Only**: Keep internal interactions real
- **Test Error Boundaries**: Component failure scenarios

#### DON'T:
- **Test Everything**: Focus on critical workflows only
- **Duplicate Lower-Level Tests**: Don't re-test unit/functional scenarios
- **Mock Internal Components**: Test real component interactions
- **Test UI Details**: Focus on workflow completion

#### Example Integration Test Pattern:
```typescript
describe('Property Creation Workflow', () => {
  it('should create property and display in user listings', async () => {
    // Arrange - authenticated user
    const { user } = renderWithAuth(<App />);

    // Act - complete property creation
    await user.click(screen.getByText('Add Property'));
    await fillPropertyForm(user);
    await user.click(screen.getByText('Submit'));

    // Navigate to listings
    await user.click(screen.getByText('My Properties'));

    // Assert - property appears in listings
    await waitFor(() => {
      expect(screen.getByText('Test Property Name')).toBeInTheDocument();
    });
  });
});
```

## Mock Organization v2.0

### Mock Strategy by Test Type

#### Unit Tests: Mock Everything External
```typescript
// Mock external dependencies only
jest.mock('next/navigation');
jest.mock('@/lib/db-connect');
jest.mock('cloudinary');

// Keep internal logic real
import { calculateRate } from '@/utils/rates'; // Don't mock
```

**Special Case: Mongoose Model Schema Tests**
```typescript
// DON'T mock Mongoose for schema configuration tests
// Import schemas directly from model files
import { PropertySchema } from '@/models/property-model';

// Test schema configuration (what we control)
expect(PropertySchema.path('name').options.required).toBe(true);

// NOT: Testing validation behavior (Mongoose's responsibility)
// Save actual validation testing for integration tests
```

**Why?** Following Jest best practice: "Don't mock what you don't own." Mongoose is complex external library - mocking it creates maintenance burden and false confidence. Instead:
- **Unit tests**: Test schema structure/configuration only
- **Integration tests**: Test actual validation with real Mongoose + MongoDB

#### Functional Tests: Mock Services, Keep Components Real
```typescript
// Mock external services
jest.mock('@/lib/data/property-data');
jest.mock('@/lib/actions/property-actions');

// Keep UI components real - don't mock
import PropertyCard from '@/ui/properties/property-card'; // Real component
```

#### Integration Tests: Mock External Services Only
```typescript
// Mock only external boundaries
jest.mock('mongodb');
jest.mock('cloudinary');
jest.mock('next-auth');

// Keep all internal code real
// No mocking of internal components or functions
```

### Mock Directory Structure
```
__mocks__/                  # External service mocks
├── next-auth.ts           # NextAuth mocking
├── cloudinary.ts          # Cloudinary API mocking
├── mongodb.ts             # MongoDB mocking
└── stripe.ts              # Payment processing mocking

__tests__/
├── __mocks__/             # Test-specific mocks
│   ├── test-data/         # Realistic test data sets
│   ├── test-utils/        # Custom render functions
│   └── fixtures/          # Reusable test fixtures
```

## Test Environment Setup v2.0

### Jest Configuration Optimization
```typescript
// jest.config.ts
module.exports = {
  // Separate test environments by type
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/unit/**/*.test.{ts,tsx}'],
      testEnvironment: 'node', // Faster for pure logic tests
    },
    {
      displayName: 'component',
      testMatch: ['**/__tests__/components/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom', // Required for React components
    },
    {
      displayName: 'functional',
      testMatch: ['**/__tests__/functional/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom',
    },
    {
      displayName: 'integration',
      testMatch: ['**/__tests__/integration/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom',
    }
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'ui/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],

  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80,
    },
  },
};
```

### Test Execution Strategy
```bash
# Jest Tests (Unit, Component, Functional, Integration)
npm run test:unit          # Fast unit tests only
npm run test:functional    # Page and workflow tests
npm run test:integration   # Cross-component tests
npm run test:all          # All Jest tests

# Development workflow (Jest)
npm run test:watch         # Watch mode for active development
npm run test:coverage      # Coverage analysis
npm run test:changed       # Only test changed files

# Cypress E2E Tests
npm run cypress:open       # Open Cypress Test Runner (interactive)
npm run cypress:run        # Run Cypress tests headless (CI)
npm run cypress:run:chrome # Run in Chrome browser
npm run cypress:run:firefox # Run in Firefox browser

# Complete Test Suite (Jest + Cypress)
npm run test:e2e          # Run all E2E tests headless
npm run test:complete     # Run all Jest tests + Cypress E2E
```

### Cypress Installation & Setup
```bash
# Install Cypress
npm install --save-dev cypress @testing-library/cypress

# Initialize Cypress (creates cypress/ directory structure)
npx cypress open

# Add to package.json scripts
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "cypress:run:chrome": "cypress run --browser chrome",
    "cypress:run:firefox": "cypress run --browser firefox",
    "test:e2e": "cypress run --headless",
    "test:complete": "npm test && npm run test:e2e"
  }
}
```

### Cypress Custom Commands
Create reusable commands for common operations:

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('[data-cy=email-input]').type(email)
    cy.get('[data-cy=password-input]').type(password)
    cy.get('[data-cy=login-button]').click()
    cy.url().should('not.include', '/login')
  })
})

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

Cypress.Commands.add('seedDatabase', () => {
  cy.exec('npm run db:seed:test')
})

Cypress.Commands.add('cleanDatabase', () => {
  cy.exec('npm run db:clean:test')
})
```

### Implementing data-cy Attributes for Cypress
To make components testable with Cypress, add `data-cy` attributes to key interactive elements:

```typescript
// ✅ GOOD: Components with data-cy attributes
export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <div data-cy="property-card" data-cy-id={property.id}>
      <h2 data-cy="property-name">{property.name}</h2>
      <p data-cy="property-price">{getRateDisplay(property.rates)}</p>
      <button data-cy="favorite-button" onClick={handleFavorite}>
        Add to Favorites
      </button>
      <Link href={`/properties/${property.id}`} data-cy="view-details-link">
        View Details
      </Link>
    </div>
  )
}

// ✅ GOOD: Form inputs with data-cy attributes
export default function PropertySearchForm() {
  return (
    <form data-cy="search-form" onSubmit={handleSubmit}>
      <input
        data-cy="search-input"
        type="text"
        placeholder="Search properties..."
      />
      <button data-cy="search-button" type="submit">
        Search
      </button>
    </form>
  )
}

// ✅ GOOD: Error messages with data-cy attributes
export default function FormErrors({ errors }: FormErrorsProps) {
  return (
    <div data-cy="form-errors">
      {errors.map((error, index) => (
        <p key={index} data-cy={`error-${error.field}`}>
          {error.message}
        </p>
      ))}
    </div>
  )
}
```

**When to Add data-cy Attributes:**
- ✅ Interactive elements (buttons, links, inputs, selects)
- ✅ Form fields and validation error messages
- ✅ Dynamic content that changes based on user actions
- ✅ Navigation elements and modals
- ✅ Loading states and error states
- ⚠️ NOT needed for static text or purely decorative elements

**Naming Conventions for data-cy:**
- Use kebab-case: `data-cy="property-name"`
- Be descriptive: `data-cy="submit-property-button"` not `data-cy="btn1"`
- Include context: `data-cy="error-email"` not just `data-cy="error"`
- Use consistent patterns: all buttons end with `-button`, all inputs end with `-input`

## Quality Assurance

### Daily Quality Gates (MANDATORY)
Every commit and pull request MUST pass all quality gates:

```bash
# 1. All Tests Must Pass (REQUIRED)
npm test
# ❌ FAIL: If any test fails, fix before proceeding

# 2. TypeScript Compilation (REQUIRED)
npx tsc --noEmit
# ❌ FAIL: If any TypeScript errors, fix before proceeding

# 3. Linting Standards (REQUIRED)
npm run lint
npm run lint:tests
# ❌ FAIL: If any linting errors, fix before proceeding

# 4. Coverage Verification (TRACKING)
npm run test:coverage
# 📊 TRACK: Monitor coverage progress, but not blocking
```

### Test Quality Metrics
- **Coverage**: 80-85% overall
- **Performance**: Unit tests < 5s, Functional < 15s, Integration < 30s
- **Reliability**: < 2% flaky test rate
- **Maintainability**: Clear test names, minimal duplication
- **Quality Gates**: 100% pass rate for tests, TypeScript, and linting

### Continuous Integration
```yaml
# .github/workflows/test.yml
- name: Install Dependencies
  run: npm ci

- name: TypeScript Compilation Check (REQUIRED)
  run: npx tsc --noEmit

- name: Linting Check (REQUIRED)
  run: |
    npm run lint
    npm run lint:tests

- name: Run All Tests (REQUIRED)
  run: npm test

- name: Run Unit Tests
  run: npm run test:unit

- name: Run Functional Tests
  run: npm run test:functional

- name: Run Integration Tests
  run: npm run test:integration

- name: Generate Coverage Report
  run: npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

### Performance Monitoring
```bash
# Test execution time tracking
npm run test -- --verbose --detectOpenHandles

# Slow test identification
npm run test -- --listTests --findRelatedTests

# Memory usage monitoring
npm run test -- --logHeapUsage
```

## Success Criteria v2.0

### Coverage Goals
- ✅ **80-85% overall coverage** achieved through balanced test distribution
- ✅ **90%+ coverage** for critical business logic (utils, actions, data)
- ✅ **75%+ coverage** for UI components and pages
- ✅ **100% coverage** for authentication and security functions

### Quality Goals
- ✅ **All tests passing** with 0% flaky rate
- ✅ **Fast execution** (< 30s total test suite)
- ✅ **Zero TypeScript errors** in test code
- ✅ **Comprehensive error coverage** for all failure scenarios

### Maintainability Goals
- ✅ **Clear test organization** by type and purpose
- ✅ **Minimal mock complexity** with reusable fixtures
- ✅ **Easy debugging** with descriptive test names and clear assertions
- ✅ **Scalable structure** that grows with application features

## Migration from v1.0

### Phase 1: Assessment (Week 1)
1. **Audit existing tests**: Categorize current 592 tests by type
2. **Identify gaps**: Map uncovered areas using coverage report
3. **Plan migration**: Determine which tests to keep, modify, or replace

### Phase 2: Restructure (Week 2)
1. **Reorganize test files**: Move tests to new directory structure
2. **Update naming**: Apply new naming conventions
3. **Refactor over-mocked tests**: Reduce mocking in integration tests

### Phase 3: Fill Gaps (Weeks 3-7)
1. **Add missing unit tests**: Focus on uncovered functions and components
2. **Add functional tests**: Create page-level and workflow tests
3. **Optimize integration tests**: Keep only high-value cross-component tests

## Conclusion

This v2.0 testing strategy addresses the coverage gaps identified in the v1.0 implementation by:

1. **Balancing test types** according to the test pyramid
2. **Prioritizing unit and functional tests** for better coverage efficiency
3. **Reducing over-mocking** to test real component behavior
4. **Implementing coverage-driven development** with weekly tracking
5. **Providing clear guidelines** for when to write each test type

The result is a more efficient path to 80-85% coverage while maintaining high test quality and maintainability.