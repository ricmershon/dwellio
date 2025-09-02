# **PROFILE PAGE TEST PLAN**

## **Overview**

This document outlines a comprehensive testing strategy for the Profile page (`/app/profile`) and all its associated components. The plan covers unit tests, integration tests, and snapshot tests to ensure robust functionality, proper data display, user interactions, and visual consistency.

## **Architecture Analysis**

### **Page Structure**
- **Main Page**: `/app/profile/page.tsx` - Server component with authentication
- **Data Layer**: `fetchPropertiesByUserId()` from `lib/data/property-data.ts`
- **Authentication**: `requireSessionUser()` for protected access

### **Components Hierarchy**
```
ProfilePage
├── Breadcrumbs (shared component)
├── User Profile Section
│   ├── Profile Image (Next.js Image component)
│   ├── User Name Display
│   └── User Email Display
└── ProfileProperties
    └── PropertyCard[] (user's property listings)
        ├── Property Image (Link to property details)
        ├── Property Info (name, address)
        ├── Edit Button (Link to edit page)
        └── DeletePropertyButton (client component)
```

### **External Dependencies**
- **Server Actions**: `deleteProperty` from `lib/actions/property-actions.ts`
- **Toast Notifications**: `react-toastify` for user feedback
- **Database Models**: `PropertyDocument` interface
- **Next.js Image**: Optimized image handling
- **Assets**: Default profile image

---

## **Phase 1: Component Unit Tests**

### **1.1 ProfileProperties Component Tests** 
*File: `__tests__/ui/profile/profile-properties.test.tsx`*

#### **Test Categories:**
- **Grid Layout and Responsiveness**
  - Should render responsive grid with correct breakpoint classes
  - Should use `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
  - Should apply proper gap spacing (`gap-3 md:gap-4`)
  - Should handle different screen sizes appropriately

- **Property Card Rendering**
  - Should render property cards for each property in array
  - Should use property._id as React key
  - Should display property image from `imagesData[0].secureUrl`
  - Should show property name and formatted address

- **Property Image Handling**
  - Should render Next.js Image with correct props
  - Should link image to property details page (`/properties/${propertyId}`)
  - Should apply proper image styling (rounded corners, object-cover)
  - Should handle missing or invalid image data gracefully

- **Property Information Display**
  - Should show property name from property.name
  - Should format address as "street city state"
  - Should extract location data from property.location object
  - Should apply appropriate text styling and hierarchy

- **Action Buttons Integration**
  - Should render Edit link with correct href (`/properties/${propertyId}/edit`)
  - Should apply proper button styling (`btn btn-primary`)
  - Should render DeletePropertyButton with propertyId prop
  - Should maintain button layout and spacing

- **Data Handling**
  - Should handle PropertyDocument interface correctly
  - Should cast _id to string for routing
  - Should access nested location properties safely
  - Should handle arrays with different lengths

- **Empty State Handling**
  - Should handle empty properties array gracefully
  - Should not render any cards when properties.length === 0
  - Should maintain grid structure regardless of content

**Estimated Tests: 22-28**

---

### **1.2 DeletePropertyButton Component Tests**
*File: `__tests__/ui/profile/delete-property-button.test.tsx`*

#### **Test Categories:**
- **Component Initialization**
  - Should accept propertyId prop correctly
  - Should bind deleteProperty action with propertyId
  - Should create bound action function properly
  - Should render form with inline-block styling

- **Form Submission**
  - Should call bound deleteProperty action on form submit
  - Should pass correct propertyId to action
  - Should handle form submission events properly
  - Should prevent default form behavior when needed

- **Server Action Integration**
  - Should call `deleteProperty.bind(null, propertyId)`
  - Should execute bound action in deletePropertyAction
  - Should handle action result properly
  - Should process ActionState response format

- **Toast Notifications**
  - Should show toast notification based on result status
  - Should use `toast[result.status]` dynamic pattern
  - Should display result.message as toast content
  - Should handle missing message or status gracefully

- **Action Results Handling**
  - Should handle ActionStatus.SUCCESS responses
  - Should handle ActionStatus.ERROR responses  
  - Should validate result object structure
  - Should handle undefined/null results

- **Button Rendering**
  - Should render button with "Delete" text
  - Should apply danger button styling (`btn btn-danger`)
  - Should set button type to "submit"
  - Should maintain consistent button appearance

- **Error Scenarios**
  - Should handle server action failures gracefully
  - Should show error messages to user via toast
  - Should handle network connectivity issues
  - Should handle authorization errors

**Estimated Tests: 20-25**

---

## **Phase 2: Data Layer Tests**

### **2.1 Property Data Functions Enhancement**
*File: `__tests__/lib/data/property-data.test.ts` (existing file - add these tests)*

#### **fetchPropertiesByUserId Function Tests:**
- **Query Logic**
  - Should filter properties by owner field matching userId
  - Should return all properties owned by the user
  - Should handle valid ObjectId strings
  - Should handle invalid userId parameters

- **Database Integration**
  - Should call `dbConnect()` before query execution
  - Should handle database connection failures
  - Should execute `Property.find({ owner: userId })`
  - Should return PropertyDocument array

- **Data Handling**
  - Should return array of PropertyDocument objects
  - Should preserve all property fields and structure
  - Should handle empty result sets (no properties)
  - Should maintain document integrity

- **Error Handling**
  - Should throw descriptive errors on failure
  - Should log database errors to console with prefix
  - Should propagate errors to calling code
  - Should handle malformed userId parameters

- **Edge Cases**
  - Should handle non-existent userId gracefully
  - Should return empty array for users with no properties
  - Should handle database query failures
  - Should manage memory efficiently for large datasets

**Estimated Tests: 15-18**

---

### **2.2 Property Actions Tests Enhancement**
*File: `__tests__/lib/actions/property-actions.test.ts` (existing file - verify coverage)*

#### **deleteProperty Action Tests:**
- **Authentication and Authorization**
  - Should require authenticated user session
  - Should verify property ownership before deletion
  - Should reject unauthorized deletion attempts
  - Should handle authentication failures properly

- **Property Validation**
  - Should find property by ID before deletion
  - Should verify property exists in database
  - Should check property ownership matches session user
  - Should handle non-existent property IDs

- **Deletion Process**
  - Should call property.deleteOne() or equivalent
  - Should handle successful deletions
  - Should clean up associated data if needed
  - Should handle deletion failures gracefully

- **Cache Invalidation**
  - Should call `revalidatePath("/profile")`
  - Should update relevant page caches
  - Should maintain data consistency across pages
  - Should handle revalidation errors

- **Response Format**
  - Should return ActionState with proper status
  - Should include success/error messages
  - Should format responses consistently
  - Should handle various error scenarios

**Note**: These tests likely already exist - verify coverage is complete

---

## **Phase 3: Profile Page Integration Tests**

### **3.1 Page Structure and Rendering**
*File: `__tests__/app/profile/page.test.tsx`*

#### **Test Categories:**
- **Authentication Integration**
  - Should call `requireSessionUser()` before rendering
  - Should handle authentication redirects properly
  - Should pass user data to profile display
  - Should handle session errors gracefully

- **Data Fetching Integration**
  - Should call `fetchPropertiesByUserId()` with session user ID
  - Should handle successful data retrieval
  - Should pass properties array to ProfileProperties
  - Should handle data fetching errors

- **Breadcrumbs Integration**
  - Should render Breadcrumbs with correct navigation path
  - Should set "Profile" as active breadcrumb
  - Should include "Home" link in breadcrumb trail
  - Should handle breadcrumb navigation properly

- **Layout Structure**
  - Should render main element as page container
  - Should apply responsive flexbox layout (`flex-col md:flex-row`)
  - Should allocate proper width ratios (3/4 for listings, 1/4 for profile)
  - Should maintain proper spacing and margins

- **User Profile Section**
  - Should display "About me" heading
  - Should render user profile card with styling
  - Should show user image (or default profile image)
  - Should display user name from session
  - Should show user email from session

- **Profile Image Handling**
  - Should use session user image if available
  - Should fallback to default profile image if no user image
  - Should apply proper image styling and sizing
  - Should handle image loading errors gracefully

- **Properties Section**
  - Should display "My listings" heading
  - Should render ProfileProperties component
  - Should pass properties array to child component
  - Should handle empty properties array

- **Responsive Design**
  - Should adapt layout for mobile screens
  - Should adjust image sizes based on screen size
  - Should maintain proper spacing across breakpoints
  - Should handle content overflow appropriately

**Estimated Tests: 25-30**

---

### **3.2 Error Handling and Edge Cases**
- **Authentication Failures**
  - Should redirect unauthenticated users
  - Should handle expired or invalid sessions
  - Should maintain security boundaries
  - Should show appropriate error states

- **Data Loading Errors**
  - Should handle property fetch failures
  - Should show user-friendly error messages
  - Should provide fallback UI states
  - Should log errors appropriately

- **Image Loading Issues**
  - Should handle missing user images gracefully
  - Should fallback to default images when needed
  - Should handle broken image URLs
  - Should maintain layout when images fail

- **Empty States**
  - Should handle users with no properties
  - Should show appropriate empty state message
  - Should maintain page layout structure
  - Should provide guidance for adding properties

**Estimated Tests: 15-18**

---

## **Phase 4: Snapshot Testing**

### **4.1 Visual Regression Protection**
*Files: Various `*.test.tsx` files*

#### **ProfileProperties Snapshots:**
- Empty properties array (no listings)
- Single property display
- Multiple properties grid layout
- Different property types and locations
- Responsive grid at different breakpoints

#### **DeletePropertyButton Snapshots:**
- Default button state
- Button styling consistency
- Form layout structure

#### **Profile Page Snapshots:**
- Complete page with user profile and properties
- User with default profile image
- User with custom profile image
- Empty properties state
- Mobile vs desktop layout
- Different user information lengths

#### **Profile Card Snapshots:**
- Standard profile card layout
- Long user names
- Long email addresses
- Missing user information handling

**Estimated Tests: 18-22**

---

## **Phase 5: User Interaction and Navigation Tests**

### **5.1 Navigation Integration Tests**
*Files: Component test files*

#### **Test Categories:**
- **Property Detail Navigation**
  - Should navigate to property details on image click
  - Should generate correct URLs for property pages
  - Should handle property ID routing properly
  - Should maintain navigation state

- **Edit Property Navigation**
  - Should navigate to edit page on Edit button click
  - Should generate correct edit URLs
  - Should handle property ID parameter passing
  - Should maintain user context

- **Property Deletion Flow**
  - Should trigger deletion on Delete button click
  - Should show confirmation/feedback via toast
  - Should update page state after successful deletion
  - Should handle deletion errors gracefully

- **Breadcrumb Navigation**
  - Should navigate to home page from breadcrumbs
  - Should highlight current page in breadcrumbs
  - Should maintain navigation consistency
  - Should handle navigation errors

**Estimated Tests: 15-18**

---

### **5.2 User Experience Tests**
- **Loading States**
  - Should handle initial page loading gracefully
  - Should manage image loading states
  - Should provide feedback during actions
  - Should maintain responsive layout during loading

- **Toast Feedback**
  - Should show appropriate success messages
  - Should display clear error messages
  - Should handle toast timing and dismissal
  - Should avoid duplicate notifications

- **Accessibility**
  - Should provide proper image alt text
  - Should maintain keyboard navigation
  - Should have appropriate ARIA labels
  - Should support screen readers

**Estimated Tests: 12-15**

---

## **Phase 6: Integration with Authentication System**

### **6.1 Session Management Tests**
*Files: Component test files*

#### **Test Categories:**
- **Session Validation**
  - Should require valid session for page access
  - Should handle session expiration gracefully
  - Should redirect on authentication failures
  - Should maintain session state consistency

- **User Data Integration**
  - Should display correct user information from session
  - Should handle missing user data gracefully
  - Should update display when session changes
  - Should maintain data privacy and security

- **Property Ownership**
  - Should only show properties owned by current user
  - Should filter properties by user ID correctly
  - Should handle ownership verification
  - Should prevent unauthorized access

**Estimated Tests: 12-15**

---

## **Implementation Strategy**

### **Phase Execution Order:**
1. **Phase 1**: Component unit tests (foundation)
2. **Phase 2**: Data layer tests (backend integration)  
3. **Phase 3**: Page integration tests (full flow)
4. **Phase 4**: Snapshot tests (visual protection)
5. **Phase 5**: User interaction tests (UX flows)
6. **Phase 6**: Authentication integration tests (security)

### **Testing Utilities:**
- **React Testing Library**: Component rendering and interaction
- **Jest**: Test framework and mocking
- **Next.js Testing**: Server component testing utilities
- **Testing Library User Event**: User interaction simulation
- **MSW (Mock Service Worker)**: API mocking for server actions

### **Mock Strategy:**
- **Server Actions**: Mock deleteProperty with controlled responses
- **Authentication**: Mock requireSessionUser responses
- **Data Fetching**: Mock fetchPropertiesByUserId function
- **Toast Notifications**: Mock react-toastify calls
- **Next.js Image**: Mock Image component for testing
- **Navigation**: Mock Next.js Link component

### **Performance Considerations:**
- **Parallel Test Execution**: Group related tests efficiently
- **Mock Optimization**: Reuse mocks across test suites
- **Cleanup Strategy**: Proper teardown between tests
- **Image Mocking**: Optimize image component mocking
- **Memory Management**: Clean up resources properly

---

## **Success Criteria**

### **Coverage Goals:**
- **Unit Tests**: 95%+ code coverage
- **Integration Tests**: All user workflows covered
- **Error Scenarios**: All error paths tested
- **Edge Cases**: Boundary conditions handled
- **Authentication**: Security boundaries verified

### **Quality Metrics:**
- **Test Performance**: <2s per test suite
- **Reliability**: 0% flaky tests
- **Maintainability**: Clear, readable test code
- **Documentation**: Comprehensive test descriptions

### **Regression Protection:**
- **Snapshot Coverage**: All visual components
- **Navigation Flows**: All routing scenarios tested
- **Server Actions**: Action paths covered
- **Data Display**: Content rendering verified
- **Authentication**: Security flows tested

### **User Experience Validation:**
- **Responsive Design**: All breakpoints tested
- **Accessibility**: ARIA and keyboard navigation
- **Loading States**: Async operation handling
- **Error Feedback**: Clear error messaging

---

## **Total Estimated Test Count: 155-190 Tests**

### **Breakdown by Phase:**
- **Phase 1 (Components)**: 42-53 tests
- **Phase 2 (Data Layer)**: 15-18 tests
- **Phase 3 (Integration)**: 40-48 tests
- **Phase 4 (Snapshots)**: 18-22 tests
- **Phase 5 (User Interaction)**: 27-33 tests
- **Phase 6 (Authentication)**: 12-15 tests

This comprehensive test plan ensures robust coverage of the Profile page functionality, from individual component behavior to complete user workflows, providing confidence in code quality, security, and user experience while preventing regressions across all aspects of the profile management system.