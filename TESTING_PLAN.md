# Jest Unit and Integration Testing Plan

## Overview

This document outlines a comprehensive testing strategy for the Dwellio application, targeting 80-85% test coverage with a focus on integration tests and strategic unit testing.

## Testing Goals

- **Coverage Target**: 80-85%
- **Primary Focus**: Integration tests that verify component interactions
- **Secondary Focus**: Critical unit tests for edge cases and core logic
- **Testing Philosophy**: Test behavior over implementation

## Project Structure & Testing Organization

### Source Code Structure
```
├── app/              # Next.js App Router pages
├── ui/               # Reusable UI components
├── lib/              # Utilities, actions, and data layer
└── __tests__/        # Test files (mirrors source structure)
```

### Test Organization

Tests should be organized in the `__tests__` directory following the exact path structure of the source code:

```
__tests__/
├── app/
│   ├── (login)/
│   ├── (root)/
│   └── api/
├── ui/
│   ├── auth/
│   ├── login/
│   ├── messages/
│   ├── profile/
│   ├── properties/
│   ├── root/
│   ├── shared/
│   └── skeletons/
└── lib/
    ├── actions/
    ├── data/
    └── places/
```

**Naming Convention**: `[source-file-name].test.tsx` or `[source-file-name].test.ts`

Example: For `ui/auth/login-form.tsx`, create `__tests__/ui/auth/login-form.test.tsx`

## Mock Organization

### Application Module Mocks
- **Location**: `__tests__/[module-path]/__mocks__/`
- **Purpose**: Mock internal application modules when needed for isolation
- **Example**: Mock `ui/auth/auth-service.tsx` at `__tests__/ui/auth/__mocks__/auth-service.ts`

### Node Module Mocks
- **Location**: `__mocks__/` (project root)
- **Purpose**: Mock external dependencies
- **Naming**: Match the module name exactly
- **Examples**:
  - `__mocks__/next-auth.ts`
  - `__mocks__/mongodb.ts`
  - `__mocks__/cloudinary.ts`

## Integration Testing Strategy

### Focus Areas

#### 1. Authentication Flow Integration
**Files to Test**:
- `ui/auth/` components with `lib/actions/auth-actions.ts`
- `app/api/auth/` routes with NextAuth configuration
- User session state management across components

**Test Scenarios**:
- Login/logout flow end-to-end
- Protected route access control
- Session persistence across page navigation
- OAuth provider integration

#### 2. Property Management Integration
**Files to Test**:
- `ui/properties/` forms with `lib/actions/property-actions.ts`
- Property CRUD operations through UI components
- Image upload with Cloudinary integration
- Property filtering and search functionality

**Test Scenarios**:
- Add property form submission and database storage
- Property listing with real data fetching
- Image upload and display workflow
- Property search and filtering behavior

#### 3. Messaging System Integration
**Files to Test**:
- `ui/messages/` components with `lib/actions/message-actions.ts`
- Message state management and real-time updates
- Message read/unread status handling

**Test Scenarios**:
- Send message workflow
- Message list updates after actions
- Unread count calculations
- Message deletion confirmation flow

#### 4. Database Layer Integration
**Files to Test**:
- `lib/data/` modules with actual database operations
- Data validation with Zod schemas
- Error handling for database failures

**Test Scenarios**:
- CRUD operations with MongoDB
- Data transformation and validation
- Connection error handling
- Transaction rollback scenarios

### Integration Testing Best Practices

#### DO:
- **Balance Mocking**: Mock external services (APIs, databases) but keep component interactions real
- **Test User Journeys**: Focus on complete user workflows rather than isolated component behavior
- **Test Error Boundaries**: Verify system behavior when dependencies fail
- **Use Real Data Structures**: Test with realistic data shapes and edge cases
- **Test State Persistence**: Verify data persists correctly across component re-renders

#### AVOID:
- **Over-mocking**: Don't mock every dependency; preserve meaningful component interactions
- **Implementation-specific Tests**: Test what the user sees, not how the code works internally
- **Ignoring Edge Cases**: Always test error states, empty states, and boundary conditions

## Unit Testing Strategy

### Critical Areas for Unit Testing

#### 1. Utility Functions (`lib/` directory)
**Focus**: Pure functions with complex logic
- Data transformers
- Validation helpers
- Calculation utilities
- Date/time formatters

#### 2. Custom Hooks
**Focus**: Hook logic and state management
- Authentication state hooks
- Form validation hooks
- Data fetching hooks

#### 3. Complex Component Logic
**Focus**: Components with intricate state management
- Multi-step forms
- Complex filtering logic
- Dynamic UI calculations

### Unit Testing Best Practices

#### DO:
- **Test Edge Cases**: Empty inputs, null values, boundary conditions
- **Test Error Handling**: Invalid inputs, network failures, validation errors
- **Focus on Public Interface**: Test inputs and outputs, not internal implementation
- **Keep Tests Fast**: Use minimal setup, avoid heavy dependencies
- **Test Pure Functions**: Prioritize functions with no side effects

#### AVOID:
- **Testing Implementation Details**: Don't test internal state variables or private methods
- **Brittle Assertions**: Avoid testing exact DOM structure or CSS classes
- **External Dependencies**: Mock or stub any external services

## Test Environment Setup

### Configuration Files
- `jest.config.ts`: Main Jest configuration
- `jest.setup.ts`: Test environment setup and global mocks
- `__mocks__/`: Global mocks for node modules

### Required Setup
```typescript
// jest.setup.ts
import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    push: jest.fn(),
  }),
}))

// Mock next-auth
jest.mock('next-auth/react')
```

## Coverage Requirements

### Target Coverage: 80-85%

#### High Priority (90%+ coverage):
- Authentication logic
- Data validation functions
- Core business logic
- Error handling utilities

#### Medium Priority (70-85% coverage):
- UI components with complex interactions
- Form handling logic
- API route handlers

#### Lower Priority (60-70% coverage):
- Simple presentational components
- Static content components
- Basic layout components

### Coverage Exclusions
- Configuration files
- Type definitions
- Build/development tools
- Generated files

## Test Categories and Examples

### 1. Integration Tests

#### Authentication Integration
```typescript
// __tests__/ui/auth/login-integration.test.tsx
describe('Login Integration', () => {
  it('should authenticate user and redirect to dashboard', async () => {
    // Test complete login flow with real authentication logic
  })
})
```

#### Property Management Integration
```typescript
// __tests__/ui/properties/property-crud-integration.test.tsx
describe('Property CRUD Integration', () => {
  it('should create property and display in listing', async () => {
    // Test property creation through form submission
  })
})
```

### 2. Unit Tests

#### Utility Functions
```typescript
// __tests__/lib/data/property-utils.test.ts
describe('Property Utils', () => {
  it('should calculate correct price per night', () => {
    // Test price calculation edge cases
  })
})
```

#### Component Logic
```typescript
// __tests__/ui/shared/form-validation.test.tsx
describe('Form Validation', () => {
  it('should handle invalid email formats', () => {
    // Test validation edge cases
  })
})
```

## Continuous Integration

### Pre-commit Hooks
- Run `npm test` for quick validation
- Run `npm run test:coverage` for coverage check
- Ensure all tests pass before allowing commits

### CI Pipeline
- Full test suite execution
- Coverage reporting
- Integration test database setup
- Performance regression testing

## Maintenance Guidelines

### Adding New Tests
1. Identify if feature needs integration or unit testing
2. Follow the directory structure convention
3. Write tests before implementing features (TDD when possible)
4. Ensure new tests maintain coverage targets

### Updating Existing Tests
1. Update tests when changing component interfaces
2. Avoid changing tests for internal refactoring
3. Add regression tests for reported bugs
4. Regular review and cleanup of obsolete tests

### Test Performance
- Keep test suite execution under 30 seconds for unit tests
- Separate slow integration tests into different commands
- Use `jest --watch` for development efficiency
- Profile and optimize slow tests regularly

## Tools and Libraries

### Core Testing Stack
- **Jest**: Test runner and assertion library
- **@testing-library/react**: Component testing utilities
- **@testing-library/jest-dom**: Enhanced DOM assertions
- **@testing-library/user-event**: User interaction simulation

### Specialized Tools
- **mongodb-memory-server**: In-memory database for integration tests
- **supertest**: API route testing
- **jest-environment-jsdom**: Browser-like environment for React tests

### Development Tools
- **ts-jest**: TypeScript support
- **identity-obj-proxy**: CSS module mocking
- **eslint**: Test code linting

## Success Metrics

### Quality Indicators
- ✅ 80-85% overall test coverage
- ✅ All critical user journeys covered by integration tests
- ✅ Zero breaking changes without failing tests
- ✅ Fast test execution (< 30s for unit tests)
- ✅ Stable test suite (< 5% flaky test rate)

### Monitoring
- Weekly coverage reports
- Test execution time tracking
- Flaky test identification and resolution
- Regular test suite health assessments

---

This testing strategy prioritizes real-world usage scenarios while maintaining comprehensive coverage of critical application functionality. The focus on integration testing ensures that component interactions work correctly, while strategic unit testing covers edge cases and complex logic.