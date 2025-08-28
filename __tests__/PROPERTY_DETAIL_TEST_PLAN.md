# Property Detail Pages Test Plan - app/properties/[id] Structure

## Overview
This document outlines a comprehensive testing strategy for the property detail pages ecosystem:
- `app/properties/[id]/page.tsx` - Property detail view page
- `app/properties/[id]/edit/page.tsx` - Property edit page
- All 8 supporting UI components

## Component Dependency Tree

```
app/properties/[id]/page.tsx (Main Property Page)
├── Breadcrumbs (shared/breadcrumbs)
├── PropertyFavoriteButton (shared/form/property-favorite-button) [✅ TESTED]
├── ShareButtons (id/share-buttons)
├── PropertyImages (id/images)
│   └── PropertyImagesGallery (id/images-gallery)
├── PropertyDetails (id/details)
│   └── PropertyMap (id/map)
└── PropertyPageAside (id/aside)
    └── PropertyContactForm (id/contact-form)

app/properties/[id]/edit/page.tsx (Edit Property Page)
├── Breadcrumbs (shared/breadcrumbs)
└── EditPropertyForm (id/edit/edit-property-form)
    ├── PropertyInfo
    ├── Location  
    ├── Specs
    ├── Amenities
    ├── Rates
    ├── HostInfo
    ├── PropertyFormButtons
    └── InputErrors
```

## Testing Strategy

### Phase 1: Simple Components (Low Complexity)
**Estimated Time: 4-6 hours**

#### 1.1 ShareButtons Component
**File**: `ui/properties/id/share-buttons.tsx`
**Type**: Client Component
**Complexity**: Simple
**Tests**: ~15-20 tests

**Test Categories**:
- Component rendering with property data
- Social share button generation (Facebook, LinkedIn, Twitter)
- URL generation with environment variables
- Hashtag generation based on property type
- Props validation and error handling
- Accessibility (button labels, aria attributes)

**Key Mock Requirements**:
- Environment variables (NEXT_PUBLIC_DOMAIN)
- `react-share` library components

#### 1.2 PropertyImages Component  
**File**: `ui/properties/id/images.tsx`
**Type**: Client Component (Wrapper)
**Complexity**: Simple
**Tests**: ~12-15 tests

**Test Categories**:
- Component rendering with images data
- Dynamic import integration
- Gallery wrapper functionality
- Props passing to child component
- Loading and error states
- Edge cases (empty images array)

**Key Mock Requirements**:
- `next/dynamic`
- `react-photoswipe-gallery`

### Phase 2: Moderate Components (Medium Complexity)
**Estimated Time: 8-12 hours**

#### 2.1 PropertyDetails Component
**File**: `ui/properties/id/details.tsx`
**Type**: Server Component (Async)
**Complexity**: Moderate  
**Tests**: ~25-30 tests

**Test Categories**:
- Component structure and rendering
- Property information display (name, beds, baths, sqft)
- Amenities list rendering with icons
- Rate display (nightly/weekly/monthly)
- Conditional owner vs host info display
- Session user integration
- Viewport width handling
- PropertyMap integration
- Data fetching error handling

**Key Mock Requirements**:
- `getSessionUser` utility
- `getViewportWidth` utility
- `react-icons/fa`
- PropertyMap child component

#### 2.2 PropertyPageAside Component
**File**: `ui/properties/id/aside.tsx`
**Type**: Client Component with HOC
**Complexity**: Moderate
**Tests**: ~20-25 tests

**Test Categories**:
- HOC integration (`withAuth`)
- Session-based conditional rendering
- Property owner vs visitor logic
- Contact form integration
- Props validation and error handling
- Authentication state changes

**Key Mock Requirements**:
- `withAuth` HOC
- `next-auth/react`
- PropertyContactForm child component

### Phase 3: Complex Components (High Complexity)
**Estimated Time: 16-24 hours**

#### 3.1 PropertyContactForm Component
**File**: `ui/properties/id/contact-form.tsx`
**Type**: Client Component (Complex Forms)
**Complexity**: Complex
**Tests**: ~35-45 tests

**Test Categories**:
- Form rendering and structure
- Server action integration (`createMessage`)
- Form validation and error handling
- Loading states and disabled states
- Pre-filled user data handling
- Toast notification integration
- Form submission success/failure flows
- Input validation (email, message, etc.)
- Edge cases and error boundaries
- Accessibility (form labels, ARIA attributes)

**Key Mock Requirements**:
- `useActionState` hook
- Server action `createMessage`
- `react-toastify`
- `Input` and `InputErrors` components
- `react-icons/fa`, `react-icons/lu`

#### 3.2 PropertyImagesGallery Component
**File**: `ui/properties/id/images-gallery.tsx`
**Type**: Client Component (Complex UI)
**Complexity**: Complex
**Tests**: ~30-40 tests

**Test Categories**:
- Dynamic grid layout calculation based on image count
- Image rendering and optimization
- Photo gallery integration
- Click handlers and interactions
- Complex CSS grid positioning logic
- Responsive behavior
- Image loading states
- Gallery navigation
- Edge cases (single image, many images)
- Performance considerations

**Key Mock Requirements**:
- `react-photoswipe-gallery`
- `next/image`
- `next/dynamic`
- `clsx`
- `react-icons/ri`

#### 3.3 PropertyMap Component
**File**: `ui/properties/id/map.tsx`
**Type**: Client Component (API Integration)
**Complexity**: Complex
**Tests**: ~30-40 tests

**Test Categories**:
- Geocoding API integration (Google Maps)
- Mapbox integration
- Dynamic import handling
- Loading states with skeleton
- Error handling for API failures
- Responsive map height calculation
- Map marker placement
- Navigation controls
- Viewport width responsive behavior
- API key validation
- Network error resilience

**Key Mock Requirements**:
- `react-geocode`
- `react-map-gl/mapbox`
- `mapbox-gl`
- Google Maps API
- Mapbox API
- `MapSkeleton` component

#### 3.4 EditPropertyForm Component
**File**: `ui/properties/id/edit/edit-property-form.tsx`
**Type**: Client Component (Complex Forms)
**Complexity**: Complex
**Tests**: ~40-50 tests

**Test Categories**:
- Multi-section form rendering
- Server action integration (`updateProperty`)
- Form section composition
- Property data pre-population
- Form validation across sections
- Loading states during submission
- Error handling and display
- Toast notification integration
- Form reset and cancellation
- Section navigation and state preservation
- Input validation for each section
- File upload handling (if applicable)

**Key Mock Requirements**:
- `useActionState` hook
- Server action `updateProperty`
- `react-toastify`
- Multiple child form components:
  - `PropertyInfo`, `Location`, `Specs`, `Amenities`
  - `Rates`, `HostInfo`, `PropertyFormButtons`, `InputErrors`

### Phase 4: Page-Level Integration Tests
**Estimated Time: 8-12 hours**

#### 4.1 Property Detail Page
**File**: `app/properties/[id]/page.tsx`
**Type**: Async Server Component (Page)
**Complexity**: High (Integration)
**Tests**: ~35-45 tests

**Test Categories**:
- Page structure and layout
- Params handling (`Promise<{ id: string }>`)
- Property data fetching (`fetchProperty`)
- User session integration
- Property owner vs visitor logic
- Component orchestration
- Breadcrumbs navigation
- Conditional rendering (favorite button, aside)
- Layout responsive behavior (`clsx` with grid)
- Error handling (property not found, fetch errors)
- Metadata validation
- Integration between all child components

**Key Mock Requirements**:
- `fetchProperty` data function
- `getSessionUser` utility
- `toSerializedOjbect` utility
- All child components (mocked for integration)

#### 4.2 Edit Property Page
**File**: `app/properties/[id]/edit/page.tsx`
**Type**: Async Server Component (Page)
**Complexity**: Moderate (Integration)
**Tests**: ~25-30 tests

**Test Categories**:
- Page structure and rendering
- Params handling (`Promise<{ id: string }>`)
- Property data fetching and serialization
- Breadcrumbs navigation structure
- EditPropertyForm integration
- Property data transformation (JSON serialization)
- Error handling (property not found, access denied)
- Metadata validation
- Page-level error boundaries

**Key Mock Requirements**:
- `fetchProperty` data function
- `EditPropertyForm` child component
- `Breadcrumbs` shared component

## Testing Implementation Order

### Bottom-Up Approach (Recommended)
1. **Week 1**: Simple components (ShareButtons, PropertyImages)
2. **Week 2**: Moderate components (PropertyDetails, PropertyPageAside)  
3. **Week 3-4**: Complex components (ContactForm, ImagesGallery)
4. **Week 5**: Complex components (PropertyMap, EditPropertyForm)
5. **Week 6**: Page-level integration tests

### Total Estimated Tests: ~280-350 tests
### Total Estimated Time: 36-54 hours (6-9 weeks at 6 hours/week)

## Mock Strategy and Shared Utilities

### Unified Mock Requirements
Create shared mocks for commonly used dependencies:

```typescript
// __tests__/property-detail-mocks.tsx
export const mockPropertyData = {
  _id: 'test-property-id',
  name: 'Test Property',
  type: 'Apartment',
  // ... complete property structure
};

export const mockSession = {
  user: { id: 'user-123', email: 'test@example.com' }
};

export const createReactShareMocks = () => ({
  FacebookShareButton: ({ children, url, ...props }) => 
    <button data-testid="facebook-share" data-url={url} {...props}>{children}</button>,
  // ... other share buttons
});

export const createMapMocks = () => ({
  'react-geocode': {
    setApiKey: jest.fn(),
    fromAddress: jest.fn(),
  },
  'react-map-gl/mapbox': {
    default: ({ children, ...props }) => 
      <div data-testid="mapbox-map" {...props}>{children}</div>,
  },
});
```

### Testing Environment Setup
- Jest configuration for dynamic imports
- Mock service worker for API calls
- Custom render utilities for HOC testing
- Snapshot testing for complex layouts

## Success Criteria

### Code Coverage Targets
- **Unit Tests**: 95%+ line coverage per component
- **Integration Tests**: 90%+ feature coverage per page
- **Edge Cases**: 85%+ error path coverage

### Quality Gates
- All TypeScript checks pass
- All ESLint rules pass  
- No duplicate mock conflicts
- Proper accessibility testing
- Performance regression testing

### Documentation Requirements
- Component behavior documentation
- Mock strategy documentation
- Test maintenance guidelines
- Performance benchmarking

This comprehensive test plan ensures thorough coverage of the property detail pages ecosystem with a structured, priority-based approach that balances thoroughness with efficiency.