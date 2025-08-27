# Test Organization & Utilities

This directory contains all test files and shared testing utilities for the Dwellio application.

## 📁 Structure

```
__tests__/
├── README.md                          # This file
├── test-utils.tsx                     # Shared testing utilities and components
├── setup-mocks.ts                    # Consolidated mock configurations
├── app/
│   └── layout.test.tsx               # Root layout component tests
└── ui/
    ├── auth/
    │   └── login-buttons.test.tsx    # Authentication component tests
    └── root/
        └── viewport-cookie-writer.test.tsx  # Viewport utility component tests
```

## 🔧 Shared Utilities

### `test-utils.tsx`
Contains reusable testing utilities to reduce code duplication:

#### **Mock Components**
- `MockViewportCookieWriter` - Mock for viewport cookie writer
- `MockAuthProvider` - Mock for authentication provider  
- `MockGlobalContextProvider` - Mock for global context
- `MockNavBar`, `MockFooter`, `MockToastContainer` - Layout component mocks

#### **Mock Factories**
- `createMockSearchParams()` - Creates Next.js search params mock
- `createMockRouter()` - Creates Next.js router mock
- `createMockViewportUtils()` - Creates viewport/cookie testing utilities

#### **Testing Utilities**
- Custom `render()` function that imports from testing-library
- `setupCommonMocks()` - Common beforeEach patterns
- `setupFakeTimers()` - Timer mocking for debounce tests

### `setup-mocks.ts`
Consolidated Jest mock configurations:

#### **Mock Categories**
- `setupCssMocks()` - CSS import mocks
- `setupNextNavigationMocks()` - Next.js navigation mocks
- `setupNextAuthMocks()` - NextAuth.js mocks
- `setupLayoutComponentMocks()` - Layout-related component mocks
- `setupAuthComponentMocks()` - Authentication component mocks

## 🏗️ Before Consolidation vs After

### Before: Overlapping Mocks
Each test file had duplicate mock setups:

```typescript
// In multiple files:
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

jest.mock('@/ui/root/auth-provider', () => ({
    __esModule: true, 
    default: function MockAuthProvider({ children }) {
        return <div data-testid="auth-provider">{children}</div>;
    }
}));
```

### After: Centralized & Reusable
Single source of truth with shared utilities:

```typescript
// In test files:
import { render, createMockRouter, MockAuthProvider } from '../../test-utils';

// In test-utils.tsx:
export const MockAuthProvider = ({ children }) => (
    <div data-testid="auth-provider">{children}</div>
);
```

## ✅ Benefits Achieved

1. **Reduced Duplication**: Eliminated 60+ lines of duplicate mock code
2. **Consistency**: All tests use identical mock implementations
3. **Maintainability**: Single place to update mock behavior
4. **Reusability**: Easy to add new tests using existing utilities
5. **Type Safety**: Shared TypeScript types for mock objects

## 🎯 Test Coverage

### Current Test Suites (66 tests total)

#### `layout.test.tsx` (12 tests)
- Metadata validation
- Layout structure verification  
- Component integration
- CSS classes
- Data loading
- Snapshot testing

#### `login-buttons.test.tsx` (17 tests)
- Component rendering with various props
- User interaction handling
- URL parameter processing
- Provider variations
- Snapshot testing

#### `viewport-cookie-writer.test.tsx` (37 tests)
- Cookie operations (4 tests)
- Viewport width detection (4 tests)
- Breakpoint logic (13 tests)
- Component behavior (8 tests)
- Router integration (4 tests)
- Edge cases (4 tests)

## 🔄 Usage Patterns

### For New Component Tests
```typescript
import { render, screen } from '../../test-utils';
// Add any specific mocks needed
// Write tests using consistent mock components
```

### For Tests Needing DOM Utilities
```typescript
import { createMockViewportUtils } from '../../test-utils';

const { setViewportSize, clearCookies } = createMockViewportUtils();
```

### For Tests Needing Navigation Mocks
```typescript
import { createMockRouter, createMockSearchParams } from '../../test-utils';

const mockRouter = createMockRouter();
const mockSearchParams = createMockSearchParams();
```

This organization ensures maintainable, consistent, and efficient testing across the entire application.