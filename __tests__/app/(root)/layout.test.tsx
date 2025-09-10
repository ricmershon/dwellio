import React from 'react';
import { MockViewportCookieWriter, MockAuthProvider, MockGlobalContextProvider, MockNavBar, MockFooter, createReactToastifyMock } from '@/__tests__/test-utils';

// Mock all CSS imports  
jest.mock('@/app/globals.css', () => ({}));
jest.mock('react-toastify/dist/ReactToastify.css', () => ({}));
jest.mock('react-loading-skeleton/dist/skeleton.css', () => ({}));
jest.mock('photoswipe/dist/photoswipe.css', () => ({}));

import RootLayout, { metadata } from '@/app/(root)/layout';

// Mock all external dependencies
jest.mock('@/lib/data/static-inputs-data', () => ({
	fetchStaticInputs: jest.fn().mockResolvedValue({
		amenities: ['WiFi', 'Pool', 'Kitchen'],
		property_types: ['House', 'Apartment', 'Condo']
	})
}));

jest.mock('@/ui/root/viewport-cookie-writer', () => ({
	__esModule: true,
	default: MockViewportCookieWriter,
}));

jest.mock('@/ui/root/auth-provider', () => ({
	__esModule: true,
	default: MockAuthProvider,
}));

jest.mock('@/context/global-context', () => ({
	__esModule: true,
	GlobalContextProvider: MockGlobalContextProvider,
}));

jest.mock('@/ui/root/layout/nav-bar/nav-bar', () => ({
	__esModule: true,
	default: MockNavBar,
}));

jest.mock('@/ui/root/layout/footer', () => ({
	__esModule: true,
	default: MockFooter,
}));

// Mock react-toastify with unified mock
jest.mock('react-toastify', () => createReactToastifyMock());

describe('RootLayout', () => {
	const mockChildren = <div data-testid="page-content">Page Content</div>;

	describe('Metadata', () => {
		it('should have correct default title', () => {
			expect(metadata.title).toEqual({
				template: '%s | Dwellio',
				default: 'Dwellio'
			});
		});

		it('should have correct description', () => {
			expect(metadata.description).toBe('Find an awesome vacation property');
		});

		it('should have correct keywords', () => {
			expect(metadata.keywords).toBe('rental, property, real estate');
		});
	});

	describe('Layout Structure', () => {
		it('should return AuthProvider as the root element', async () => {
			const layoutElement = await RootLayout({ children: mockChildren });
			
			expect(layoutElement.type.name).toBe('MockAuthProvider');
		});

		it('should include GlobalContextProvider with correct props', async () => {
			const layoutElement = await RootLayout({ children: mockChildren });
			
			// Navigate to GlobalContextProvider (AuthProvider -> GlobalContextProvider)
			const globalContextProvider = layoutElement.props.children;
			expect(globalContextProvider.type.name).toBe('MockGlobalContextProvider');
			expect(globalContextProvider.props.initialStaticInputs).toEqual({
				amenities: ['WiFi', 'Pool', 'Kitchen'],
				property_types: ['House', 'Apartment', 'Condo']
			});
		});

		it('should contain html and body structure', async () => {
			const layoutElement = await RootLayout({ children: mockChildren });
			
			// Navigate to HTML element (AuthProvider -> GlobalContextProvider -> html)
			const htmlElement = layoutElement.props.children.props.children;
			expect(htmlElement.type).toBe('html');
			expect(htmlElement.props.lang).toBe('en');
			
			// Check body element
			const bodyElement = htmlElement.props.children;
			expect(bodyElement.type).toBe('body');
		});

		it('should include all main layout components in body', async () => {
			const layoutElement = await RootLayout({ children: mockChildren });
			
			// Navigate to body content (AuthProvider -> GlobalContextProvider -> html -> body -> children)
			const bodyChildren = layoutElement.props.children.props.children.props.children.props.children;
			const bodyElements = React.Children.toArray(bodyChildren);
			
			// The first two elements are ViewportCookieWriter and NavBar (with empty props due to mocking)
			// The third element is the main content div with flex-grow class
			// The fourth is Footer, fifth is ToastContainer
			expect(bodyElements).toHaveLength(5);
			
			// Check main content div exists
			const mainContentDiv = bodyElements.find((element): element is React.ReactElement => 
				React.isValidElement(element) && element.type === 'div' && 
				Boolean((element.props as { className?: string }).className?.includes('flex-grow'))
			);
			expect(mainContentDiv).toBeDefined();
		});

		it('should render children in the main content div', async () => {
			const layoutElement = await RootLayout({ children: mockChildren });
			
			// Navigate to body content and find the main content div
			const bodyChildren = layoutElement.props.children.props.children.props.children.props.children;
			const bodyElements = React.Children.toArray(bodyChildren);
			
			// Find the main content div (should contain the children)
			const mainContentDiv = bodyElements.find((element): element is React.ReactElement => 
				React.isValidElement(element) && element.type === 'div' && 
				Boolean((element.props as { className?: string }).className?.includes('flex-grow'))
			);
			
			expect(mainContentDiv).toBeDefined();
			expect((mainContentDiv?.props as { children?: React.ReactNode })?.children).toBe(mockChildren);
		});
	});

	describe('Data Loading', () => {
		it('should call fetchStaticInputs and pass data to GlobalContextProvider', async () => {
			await RootLayout({ children: mockChildren });

			const staticInputsModule = await import('@/lib/data/static-inputs-data');
			expect(staticInputsModule.fetchStaticInputs).toHaveBeenCalled();
		});

		it('should pass correct initial static inputs to GlobalContextProvider', async () => {
			const layoutElement = await RootLayout({ children: mockChildren });
			
			// Navigate to GlobalContextProvider (AuthProvider -> GlobalContextProvider)
			const globalContextProvider = layoutElement.props.children;
			expect(globalContextProvider.props.initialStaticInputs).toEqual({
				amenities: ['WiFi', 'Pool', 'Kitchen'],
				property_types: ['House', 'Apartment', 'Condo']
			});
		});
	});

	describe('CSS Classes', () => {
		it('should apply correct classes to main content area', async () => {
			const layoutElement = await RootLayout({ children: mockChildren });
			
			// Navigate to body content and find the main content div
			const bodyChildren = layoutElement.props.children.props.children.props.children.props.children;
			const bodyElements = React.Children.toArray(bodyChildren);
			
			// Find the main content div
			const mainContentDiv = bodyElements.find((element): element is React.ReactElement => 
				React.isValidElement(element) && element.type === 'div' && 
				Boolean((element.props as { className?: string }).className?.includes('flex-grow'))
			);
			
			expect((mainContentDiv?.props as { className?: string })?.className).toBe('flex-grow md:overflow-y-auto px-4 md:px-6 lg:px-8 py-6 lg:py-8');
		});
	});

	describe('Component Integration', () => {
		it('should include all required body elements', async () => {
			const layoutElement = await RootLayout({ children: mockChildren });
			
			// Navigate to body content
			const bodyChildren = layoutElement.props.children.props.children.props.children.props.children;
			const bodyElements = React.Children.toArray(bodyChildren);
			
			// Should have 5 elements: ViewportCookieWriter, NavBar, main content div, Footer, ToastContainer
			expect(bodyElements).toHaveLength(5);
		});

		it('should include ToastContainer component', async () => {
			const layoutElement = await RootLayout({ children: mockChildren });
			
			// Navigate to body content
			const bodyChildren = layoutElement.props.children.props.children.props.children.props.children;
			const bodyElements = React.Children.toArray(bodyChildren);
			
			// ToastContainer should be the 5th element (index 4)
			const toastContainer = bodyElements[4];
			expect(React.isValidElement(toastContainer)).toBe(true);
		});

		it('should include layout structure components', async () => {
			const layoutElement = await RootLayout({ children: mockChildren });
			
			// Navigate to body content
			const bodyChildren = layoutElement.props.children.props.children.props.children.props.children;
			const bodyElements = React.Children.toArray(bodyChildren);
			
			// Verify we have the expected number of components
			expect(bodyElements.length).toBeGreaterThanOrEqual(4);
			
			// All elements should be valid React elements
			bodyElements.forEach(element => {
				expect(React.isValidElement(element)).toBe(true);
			});
		});
	});

	describe('Async Behavior', () => {
		it('should be an async function', () => {
			const result = RootLayout({ children: mockChildren });
			expect(result).toBeInstanceOf(Promise);
		});

		it('should resolve successfully with valid data', async () => {
			const result = await RootLayout({ children: mockChildren });
			expect(React.isValidElement(result)).toBe(true);
		});
	});
});