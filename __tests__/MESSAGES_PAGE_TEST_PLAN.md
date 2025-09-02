# **MESSAGES PAGE TEST PLAN**

## **Overview**

This document outlines a comprehensive testing strategy for the Messages page (`/app/messages`) and all its associated components. The plan covers unit tests, integration tests, and snapshot tests to ensure robust functionality, proper state management, and visual consistency.

## **Architecture Analysis**

### **Page Structure**
- **Main Page**: `/app/messages/page.tsx` - Server component with authentication
- **Data Layer**: `fetchMessages()` from `lib/data/message-data.ts`
- **Authentication**: `requireSessionUser()` for protected access

### **Components Hierarchy**
```
MessagesPage
├── Breadcrumbs (shared component)
└── MessageCard[] (message list iteration)
    ├── ToggleMessageReadButton (client component)
    └── DeleteMessageButton (client component)

UnreadMessageCount (used in navigation, not on page)
```

### **External Dependencies**
- **Server Actions**: `toggleMessageRead`, `deleteMessage` from `lib/actions/message-actions.ts`
- **Global Context**: `useGlobalContext()` for unread count management
- **Toast Notifications**: `react-toastify` for user feedback
- **Database Models**: `MessageDocument` interface

---

## **Phase 1: Component Unit Tests**

### **1.1 UnreadMessageCount Component Tests** 
*File: `__tests__/ui/messages/unread-message-count.test.tsx`*

#### **Test Categories:**
- **Rendering Logic**
  - Should render badge with correct positioning classes
  - Should display count number when viewport > 640px
  - Should hide count number when viewport ≤ 640px
  - Should render with correct size classes (15px mobile, 14px desktop)

- **Props Handling**
  - Should accept unreadCount and viewportWidth props
  - Should handle zero count (still show badge)
  - Should handle large numbers (99+)
  - Should handle negative values gracefully

- **Responsive Behavior**
  - Should conditionally render count based on viewportWidth
  - Should maintain badge visibility across all screen sizes
  - Should apply correct CSS classes for different breakpoints

- **Styling and Accessibility**
  - Should apply correct Tailwind classes
  - Should have proper contrast (red background, white text)
  - Should be positioned absolutely with transform utilities

**Estimated Tests: 12-15**

---

### **1.2 MessageCard Component Tests**
*File: `__tests__/ui/messages/message-card.test.tsx`*

#### **Test Categories:**
- **Content Display**
  - Should display property name from populated property object
  - Should render message body text
  - Should show formatted creation date with `toLocaleString()`
  - Should display sender email with mailto link
  - Should display sender phone with tel link

- **Conditional Rendering**
  - Should show "New" badge for unread messages (`!message.read`)
  - Should hide "New" badge for read messages
  - Should handle property as object with name field
  - Should gracefully handle missing property data

- **Link Generation**
  - Should create correct mailto links with email addresses
  - Should create correct tel links with phone numbers
  - Should apply blue text color to contact links
  - Should handle special characters in email/phone

- **Child Component Integration**
  - Should render ToggleMessageReadButton with correct props
  - Should render DeleteMessageButton with messageId
  - Should pass message read state to toggle button
  - Should maintain component layout and spacing

- **Data Handling**
  - Should handle MessageDocument interface correctly
  - Should type-cast _id as string for child components
  - Should access nested property object safely
  - Should format dates consistently

- **Styling and Layout**
  - Should apply card styling (shadow, border, padding)
  - Should position "New" badge in top-right corner
  - Should maintain proper text hierarchy and spacing
  - Should handle long message content gracefully

**Estimated Tests: 20-25**

---

### **1.3 ToggleMessageReadButton Component Tests**
*File: `__tests__/ui/messages/toggle-message-read-button.test.tsx`*

#### **Test Categories:**
- **State Management**
  - Should initialize `isRead` state from props
  - Should update local state when action succeeds
  - Should sync state with server response (`result.isRead`)
  - Should maintain state consistency across re-renders

- **User Interactions**
  - Should handle form submission on button click
  - Should call `toggleMessageRead` server action
  - Should pass correct messageId to action
  - Should prevent default form behavior

- **Global Context Integration**
  - Should call `setUnreadCount` on successful toggle
  - Should increment count when marking as unread (+1)
  - Should decrement count when marking as read (-1)
  - Should not update count on action failure

- **Toast Notifications**
  - Should show success toast with action result message
  - Should show error toast for failed actions
  - Should handle ActionStatus.SUCCESS responses
  - Should handle ActionStatus.ERROR responses

- **Button Text Logic**
  - Should show "Mark as Read" for unread messages
  - Should show "Mark as Unread" for read messages
  - Should update button text after successful toggle
  - Should maintain text consistency with state

- **Error Handling**
  - Should handle server action failures gracefully
  - Should maintain original state on error
  - Should display error messages to user
  - Should not update global context on error

- **Form Integration**
  - Should wrap button in form element
  - Should use server action as form action
  - Should handle form submission properly
  - Should apply correct CSS classes

**Estimated Tests: 25-30**

---

### **1.4 DeleteMessageButton Component Tests**
*File: `__tests__/ui/messages/delete-message-button.test.tsx`*

#### **Test Categories:**
- **Form Submission**
  - Should call `deleteMessage` server action
  - Should pass correct messageId to action
  - Should handle form submission events
  - Should use inline-block form styling

- **Global Context Integration**
  - Should call `setUnreadCount` on successful deletion
  - Should decrement unread count by 1
  - Should not update count on action failure
  - Should handle context updates properly

- **Toast Notifications**
  - Should show dynamic toast based on result status
  - Should use `toast[result.status]` pattern
  - Should display success messages for deletions
  - Should display error messages for failures

- **Action Integration**
  - Should handle ActionStatus.SUCCESS responses
  - Should handle ActionStatus.ERROR responses
  - Should process result.message correctly
  - Should validate result.status existence

- **Error Handling**
  - Should handle authorization errors (not owner)
  - Should handle database errors gracefully
  - Should handle network failures
  - Should maintain UI state on errors

- **Button Styling**
  - Should apply danger button styling (`btn btn-danger`)
  - Should display "Delete" text
  - Should maintain consistent button appearance
  - Should handle hover and focus states

**Estimated Tests: 18-22**

---

## **Phase 2: Data Layer Tests**

### **2.1 Message Data Functions**
*File: `__tests__/lib/data/message-data.test.ts`*

#### **fetchMessages Function Tests:**
- **Query Logic**
  - Should fetch unread messages first (read: false)
  - Should fetch read messages second (read: true)
  - Should filter by recipient userId
  - Should sort both queries by createdAt desc

- **Data Population**
  - Should populate sender with username field
  - Should populate property with name field
  - Should handle missing population data
  - Should maintain original document structure

- **Data Transformation**
  - Should apply `toSerializedObject` to each message
  - Should combine unread and read arrays correctly
  - Should maintain message ordering (unread first)
  - Should handle empty result sets

- **Database Integration**
  - Should call `dbConnect()` before queries
  - Should handle connection failures
  - Should handle query errors gracefully
  - Should log appropriate error messages

- **Error Handling**
  - Should throw descriptive errors on failure
  - Should log database errors to console
  - Should propagate errors to calling code
  - Should handle malformed userId parameters

**Estimated Tests: 15-20**

---

### **2.2 Message Actions Tests**
*File: `__tests__/lib/actions/message-actions.test.ts`*

#### **toggleMessageRead Action Tests:**
- **Authentication**
  - Should call `requireSessionUser()`
  - Should handle authentication failures
  - Should verify user authorization
  - Should reject unauthorized requests

- **Message Validation**
  - Should find message by ID
  - Should verify message exists
  - Should check recipient ownership
  - Should reject non-owner access

- **State Toggle Logic**
  - Should flip message.read boolean
  - Should save updated message
  - Should return new read state
  - Should handle save failures

- **Cache Invalidation**
  - Should call `revalidatePath("/messages")`
  - Should update cache after changes
  - Should maintain data consistency
  - Should handle revalidation errors

- **Response Format**
  - Should return ActionState with status
  - Should include success/error messages
  - Should return isRead flag on success
  - Should format messages consistently

#### **deleteMessage Action Tests:**
- **Authorization Flow**
  - Should require authenticated user
  - Should verify message ownership
  - Should reject unauthorized deletions
  - Should handle authentication errors

- **Deletion Process**
  - Should call `message.deleteOne()`
  - Should handle deletion failures
  - Should confirm successful removal
  - Should clean up related data

- **Cache Management**
  - Should revalidate messages page
  - Should update UI state properly
  - Should handle cache errors
  - Should maintain consistency

#### **getUnreadMessageCount Action Tests:**
- **Count Logic**
  - Should count unread messages for user
  - Should filter by recipient and read status
  - Should return accurate count
  - Should handle zero results

**Estimated Tests: 25-30**

---

## **Phase 3: Messages Page Integration Tests**

### **3.1 Page Structure and Rendering**
*File: `__tests__/app/messages/page.test.tsx`*

#### **Test Categories:**
- **Authentication Integration**
  - Should call `requireSessionUser()` before rendering
  - Should handle authentication redirects
  - Should pass user ID to data fetching
  - Should handle session errors gracefully

- **Data Fetching Integration**
  - Should call `fetchMessages()` with user ID
  - Should handle successful data retrieval
  - Should process message array correctly
  - Should handle empty message arrays

- **Component Orchestration**
  - Should render main element as container
  - Should render Breadcrumbs with correct props
  - Should render MessageCard for each message
  - Should maintain proper component hierarchy

- **Breadcrumbs Integration**
  - Should pass correct breadcrumb array
  - Should set "Your Messages" as active
  - Should include Home link
  - Should handle navigation properly

- **Message List Rendering**
  - Should iterate over messages array
  - Should use message._id as React key
  - Should pass complete message object
  - Should maintain message order

- **Empty State Handling**
  - Should show "You have no messages." when empty
  - Should hide message list when no messages
  - Should maintain layout structure
  - Should handle null/undefined arrays

- **Layout and Styling**
  - Should apply margin auto to container
  - Should use space-y-5 for message spacing
  - Should maintain responsive design
  - Should handle overflow content

**Estimated Tests: 20-25**

---

### **3.2 Error Handling and Edge Cases**
- **Authentication Failures**
  - Should redirect unauthenticated users
  - Should handle expired sessions
  - Should show appropriate error messages
  - Should maintain security boundaries

- **Data Fetch Errors**
  - Should handle database connection failures
  - Should show user-friendly error messages
  - Should provide fallback UI states
  - Should log errors appropriately

- **Server Action Failures**
  - Should handle toggle action failures
  - Should handle delete action failures
  - Should maintain UI consistency
  - Should show error feedback

**Estimated Tests: 12-15**

---

## **Phase 4: Snapshot Testing**

### **4.1 Visual Regression Protection**
*Files: Various `*.test.tsx` files*

#### **UnreadMessageCount Snapshots:**
- Mobile viewport (count hidden)
- Desktop viewport (count visible)
- Different count values (0, 1, 99+)

#### **MessageCard Snapshots:**
- Read message state
- Unread message state (with "New" badge)
- Long message content
- Different property types

#### **Button Component Snapshots:**
- ToggleMessageReadButton (read/unread states)
- DeleteMessageButton (consistent styling)

#### **Messages Page Snapshots:**
- Empty messages state
- Single message display
- Multiple messages (mixed read/unread)
- Long message list

**Estimated Tests: 15-20**

---

## **Phase 5: Integration with Global Context**

### **5.1 Context Integration Tests**
*Files: Component test files*

#### **Test Categories:**
- **Context Provider Setup**
  - Should wrap components in GlobalContextProvider
  - Should provide initial unread count
  - Should handle context updates
  - Should maintain state consistency

- **Unread Count Synchronization**
  - Should update count when toggling messages
  - Should decrement count when deleting
  - Should handle concurrent updates
  - Should maintain accurate totals

- **Cross-Component Communication**
  - Should sync button actions with global state
  - Should update counts in real-time
  - Should handle multiple message operations
  - Should maintain UI consistency

**Estimated Tests: 12-15**

---

## **Implementation Strategy**

### **Phase Execution Order:**
1. **Phase 1**: Component unit tests (foundation)
2. **Phase 2**: Data layer tests (backend integration)
3. **Phase 3**: Page integration tests (full flow)
4. **Phase 4**: Snapshot tests (visual protection)
5. **Phase 5**: Context integration tests (state management)

### **Testing Utilities:**
- **React Testing Library**: Component rendering and interaction
- **Jest**: Test framework and mocking
- **MSW (Mock Service Worker)**: API mocking for server actions
- **Testing Library User Event**: User interaction simulation

### **Mock Strategy:**
- **Server Actions**: Mock with controlled responses
- **Global Context**: Mock provider with state management
- **Toast Notifications**: Mock react-toastify calls
- **Database**: Mock data layer functions
- **Authentication**: Mock requireSessionUser responses

### **Performance Considerations:**
- **Parallel Test Execution**: Group related tests
- **Mock Optimization**: Reuse mocks across test suites
- **Cleanup Strategy**: Proper teardown between tests
- **Memory Management**: Clean up event listeners

---

## **Success Criteria**

### **Coverage Goals:**
- **Unit Tests**: 95%+ code coverage
- **Integration Tests**: All user flows covered
- **Error Scenarios**: All error paths tested
- **Edge Cases**: Boundary conditions handled

### **Quality Metrics:**
- **Test Performance**: <2s per test suite
- **Reliability**: 0% flaky tests
- **Maintainability**: Clear, readable test code
- **Documentation**: Comprehensive test descriptions

### **Regression Protection:**
- **Snapshot Coverage**: All visual components
- **State Management**: Context updates tested
- **Server Actions**: All action paths covered
- **Authentication**: Security boundaries verified

---

## **Total Estimated Test Count: 130-160 Tests**

### **Breakdown by Phase:**
- **Phase 1 (Components)**: 75-92 tests
- **Phase 2 (Data Layer)**: 40-50 tests
- **Phase 3 (Integration)**: 32-40 tests
- **Phase 4 (Snapshots)**: 15-20 tests
- **Phase 5 (Context)**: 12-15 tests

This comprehensive test plan ensures robust coverage of the Messages page functionality, from individual component behavior to full user workflow integration, providing confidence in code quality and preventing regressions.