# Property Detail Page Test Plan - app/properties/[id] (Main View Only)

## Overview
This document outlines a comprehensive testing strategy for the property detail page ecosystem, **excluding the `/edit` path**:
- `app/properties/[id]/page.tsx` - Property detail view page
- 7 supporting UI components for property display

## Component Dependency Tree

```
app/properties/[id]/page.tsx (Main Property Page)
├── Breadcrumbs (shared/breadcrumbs)
├── PropertyFavoriteButton (shared/form/property-favorite-button) [✅ ALREADY TESTED]
├── ShareButtons (id/share-buttons) [NEW]
├── PropertyImages (id/images) [NEW]
│   └── PropertyImagesGallery (id/images-gallery) [NEW]
├── PropertyDetails (id/details) [NEW]
│   └── PropertyMap (id/map) [NEW]
└── PropertyPageAside (id/aside) [NEW]
    └── PropertyContactForm (id/contact-form) [NEW]
```

## Testing Strategy - Focused Scope

### Phase 1: Simple Components (Low Complexity)
**Estimated Time: 3-4 hours**

#### 1.1 ShareButtons Component ⭐️ START HERE
**File**: `ui/properties/id/share-buttons.tsx`
**Type**: Client Component
**Complexity**: Simple
**Tests**: ~15-18 tests
**Priority**: Low (but good starting point)

**Test Categories**:
- Component rendering with property data
- Social share buttons (Facebook, LinkedIn, Twitter)
- URL generation with `NEXT_PUBLIC_DOMAIN` environment variable
- Hashtag generation based on property type/location
- Share button props and accessibility
- Edge cases (missing environment variables)

**Key Mock Requirements**:
```typescript
jest.mock('react-share', () => ({
  FacebookShareButton: ({ children, url, hashtag, ...props }) => (
    <button data-testid="facebook-share" data-url={url} data-hashtag={hashtag} {...props}>
      {children}
    </button>
  ),
  LinkedinShareButton: ({ children, url, title, summary, ...props }) => (
    <button data-testid="linkedin-share" data-url={url} data-title={title} {...props}>
      {children}
    </button>
  ),
  TwitterShareButton: ({ children, url, title, hashtags, ...props }) => (
    <button data-testid="twitter-share" data-url={url} data-title={title} {...props}>
      {children}
    </button>
  ),
}));
```

#### 1.2 PropertyImages Component
**File**: `ui/properties/id/images.tsx`
**Type**: Client Component (Wrapper)
**Complexity**: Simple
**Tests**: ~10-12 tests
**Priority**: Low

**Test Categories**:
- Component rendering with images data array
- Dynamic import integration testing
- Props passing to PropertyImagesGallery
- Error handling for empty images array
- Gallery wrapper functionality

**Key Mock Requirements**:
```typescript
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importFn, options) => {
    return ({ imagesData }) => (
      <div data-testid="property-images-gallery" data-image-count={imagesData.length}>
        Dynamic PropertyImagesGallery
      </div>
    );
  },
}));
```

### Phase 2: Moderate Components (Medium Complexity)
**Estimated Time: 6-8 hours**

#### 2.1 PropertyDetails Component
**File**: `ui/properties/id/details.tsx`
**Type**: Server Component (Async)
**Complexity**: Moderate
**Tests**: ~25-30 tests
**Priority**: Medium-High

**Test Categories**:
- Server component rendering and structure
- Property information display (name, beds, baths, sqft)
- Amenities list with `react-icons/fa` icons
- Rate display logic (nightly/weekly/monthly with fallbacks)
- Conditional owner vs visitor information display
- Session user integration with `getSessionUser`
- Viewport width integration with `getViewportWidth`
- PropertyMap child component integration
- Error handling for missing property data

**Key Mock Requirements**:
```typescript
jest.mock('@/utils/get-session-user', () => ({
  getSessionUser: jest.fn(),
}));

jest.mock('@/utils/get-viewport-width', () => ({
  getViewportWidth: jest.fn(),
}));

jest.mock('@/ui/properties/id/map', () => ({
  __esModule: true,
  default: ({ property, viewportWidth }) => (
    <div data-testid="property-map" data-viewport-width={viewportWidth}>
      PropertyMap Component
    </div>
  ),
}));
```

#### 2.2 PropertyPageAside Component
**File**: `ui/properties/id/aside.tsx`
**Type**: Client Component with HOC
**Complexity**: Moderate  
**Tests**: ~18-22 tests
**Priority**: Medium

**Test Categories**:
- `withAuth` HOC integration and session handling
- Conditional rendering based on authentication state
- Property owner vs visitor logic
- PropertyContactForm integration
- Session prop passing from HOC
- Authentication state edge cases

**Key Mock Requirements**:
```typescript
// Mock the withAuth HOC
jest.mock('@/lib/with-auth', () => ({
  __esModule: true,
  default: (Component) => {
    return ({ property, session = mockSession }) => (
      <Component property={property} session={session} />
    );
  },
}));

jest.mock('@/ui/properties/id/contact-form', () => ({
  __esModule: true,
  default: ({ property, userName, userEmail }) => (
    <div data-testid="property-contact-form" 
         data-user-name={userName} 
         data-user-email={userEmail}>
      PropertyContactForm Component
    </div>
  ),
}));
```

### Phase 3: Complex Components (High Complexity)
**Estimated Time: 16-20 hours**

#### 3.1 PropertyContactForm Component 🔥 HIGH PRIORITY
**File**: `ui/properties/id/contact-form.tsx`
**Type**: Client Component (Complex Forms + Server Actions)
**Complexity**: Complex
**Tests**: ~35-42 tests
**Priority**: High

**Test Categories**:
- Form structure and field rendering
- Server action integration with `createMessage`
- `useActionState` hook usage and state management
- Form validation and error handling
- Loading states during form submission
- Success/failure toast notifications
- Pre-filled user data (name, email) handling
- Form reset after successful submission
- Input validation (email format, required fields)
- Error message display with `InputErrors`
- Accessibility (form labels, ARIA attributes)

**Key Mock Requirements**:
```typescript
// Mock React 19 useActionState hook
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useActionState: jest.fn(),
}));

// Mock server action
jest.mock('@/lib/actions/message-actions', () => ({
  createMessage: jest.fn(),
}));

// Mock toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));
```

#### 3.2 PropertyImagesGallery Component 🔥 HIGH PRIORITY
**File**: `ui/properties/id/images-gallery.tsx`
**Type**: Client Component (Complex UI Logic)
**Complexity**: Complex
**Tests**: ~28-35 tests
**Priority**: High

**Test Categories**:
- Dynamic grid layout calculation based on image count
- Complex CSS class generation with `clsx`
- Image rendering with `next/image` optimization
- Photo gallery integration with `react-photoswipe-gallery`
- Click handlers for gallery opening
- Grid positioning logic for different image counts
- Responsive behavior and layout changes
- Image loading and error states
- Gallery navigation and controls
- Performance considerations (dynamic imports)

**Key Mock Requirements**:
```typescript
jest.mock('react-photoswipe-gallery', () => ({
  Item: ({ children, original, thumbnail, width, height }) => (
    <div data-testid="gallery-item" 
         data-original={original} 
         data-thumbnail={thumbnail}
         onClick={() => children.onClick && children.onClick()}>
      {children}
    </div>
  ),
  useGallery: jest.fn(() => ({ open: jest.fn() })),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className, onClick, ...props }) => (
    <img src={src} 
         alt={alt} 
         width={width} 
         height={height} 
         className={className}
         onClick={onClick}
         data-testid="next-image" 
         {...props} />
  ),
}));
```

#### 3.3 PropertyMap Component 🔥 HIGH PRIORITY
**File**: `ui/properties/id/map.tsx`
**Type**: Client Component (External API Integration)
**Complexity**: Complex
**Tests**: ~30-38 tests
**Priority**: High

**Test Categories**:
- Google Geocoding API integration with `react-geocode`
- Mapbox map rendering with `react-map-gl`
- Dynamic import handling for map components
- Loading states with MapSkeleton
- Geocoding error handling and fallbacks
- API key validation and environment setup
- Responsive map height calculation
- Map marker placement and accuracy
- Navigation controls functionality
- Network error resilience
- Viewport width responsive behavior

**Key Mock Requirements**:
```typescript
jest.mock('react-geocode', () => ({
  setApiKey: jest.fn(),
  fromAddress: jest.fn(),
}));

jest.mock('react-map-gl/mapbox', () => ({
  __esModule: true,
  default: ({ children, longitude, latitude, zoom, style, ...props }) => (
    <div data-testid="mapbox-map" 
         data-longitude={longitude} 
         data-latitude={latitude} 
         data-zoom={zoom}
         {...props}>
      {children}
    </div>
  ),
  NavigationControl: (props) => (
    <div data-testid="navigation-control" {...props} />
  ),
  Marker: ({ longitude, latitude, children, ...props }) => (
    <div data-testid="map-marker" 
         data-longitude={longitude} 
         data-latitude={latitude} 
         {...props}>
      {children}
    </div>
  ),
}));
```

### Phase 4: Page-Level Integration Tests
**Estimated Time: 8-10 hours**

#### 4.1 Property Detail Page Integration 🎯 FINAL GOAL
**File**: `app/properties/[id]/page.tsx`
**Type**: Async Server Component (Page Integration)
**Complexity**: High
**Tests**: ~35-42 tests
**Priority**: Final Integration

**Test Categories**:
- Page structure and main element rendering
- Next.js 15 params handling (`Promise<{ id: string }>`)
- Property data fetching with `fetchProperty`
- User session integration with `getSessionUser`
- Property serialization with `toSerializedOjbect`
- Owner vs visitor conditional logic
- Component orchestration and layout
- Breadcrumbs navigation with dynamic property info
- Conditional rendering (favorite button, aside panel)
- Responsive grid layout with `clsx` integration
- Error handling (property not found, network errors)
- Metadata validation and SEO
- Integration testing between all child components

**Key Mock Requirements**:
```typescript
jest.mock('@/lib/data/property-data', () => ({
  fetchProperty: jest.fn(),
}));

jest.mock('@/utils/get-session-user', () => ({
  getSessionUser: jest.fn(),
}));

jest.mock('@/utils/to-serialized-object', () => ({
  toSerializedOjbect: jest.fn((obj) => JSON.parse(JSON.stringify(obj))),
}));
```

## Implementation Priority Order

### Bottom-Up Approach (Recommended)
1. **Week 1**: Simple components (ShareButtons, PropertyImages) - 4 hours
2. **Week 2**: Moderate components (PropertyDetails, PropertyPageAside) - 8 hours  
3. **Week 3**: Complex component #1 (PropertyContactForm) - 8 hours
4. **Week 4**: Complex component #2 (PropertyImagesGallery) - 7 hours
5. **Week 5**: Complex component #3 (PropertyMap) - 8 hours
6. **Week 6**: Page-level integration (Property Detail Page) - 9 hours

### Focused Scope Totals
- **Components to Test**: 7 new components + 1 page integration
- **Estimated Tests**: 195-245 tests
- **Estimated Time**: 44-53 hours (7-9 weeks at 6-8 hours/week)

## Shared Mock Strategy

### Create Property Detail Test Utilities
```typescript
// __tests__/property-detail-test-utils.tsx
export const mockPropertyData = {
  _id: 'property-123',
  name: 'Luxury Downtown Apartment',
  type: 'Apartment',
  beds: 2,
  baths: 2,
  square_feet: 1200,
  location: {
    street: '123 Main St',
    city: 'Downtown',
    state: 'CA',
    zip: '90210'
  },
  rates: {
    nightly: 150,
    weekly: 900,
    monthly: 3500
  },
  amenities: ['WiFi', 'Kitchen', 'Parking'],
  imagesData: [
    {
      secureUrl: 'https://example.com/image1.jpg',
      publicId: 'image1',
      width: 800,
      height: 600
    }
  ],
  owner: 'owner-456',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockSessionUser = {
  id: 'user-789',
  email: 'user@example.com',
  name: 'Test User'
};
```

## Success Criteria (Focused)

### Coverage Targets
- **Unit Tests**: 95%+ line coverage per component
- **Integration Tests**: 90%+ feature coverage for main page
- **Complex Components**: 100% critical path coverage

### Quality Gates
- All TypeScript compilation passes
- All ESLint rules pass
- No duplicate mock conflicts  
- Proper error boundary testing
- Accessibility compliance (WCAG AA)

This focused test plan excludes the `/edit` path entirely, concentrating on the core property viewing experience with 7 components and comprehensive page integration testing.