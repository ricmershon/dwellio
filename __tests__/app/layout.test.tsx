import React from 'react';
import RootLayout, { metadata } from '@/app/layout';

// Mock CSS imports
jest.mock('@/app/globals.css', () => ({}));

describe('App RootLayout', () => {
    describe('Component Structure', () => {
        it('should render JSX structure correctly', () => {
            const mockChildren = <div>Test content</div>;
            const result = RootLayout({ children: mockChildren });
            
            // Check it returns a JSX element
            expect(React.isValidElement(result)).toBe(true);
            expect(result.type).toBe('html');
            expect(result.props.lang).toBe('en');
        });

        it('should have body as direct child of html', () => {
            const mockChildren = <div>Test content</div>;
            const result = RootLayout({ children: mockChildren });
            
            // Check body element
            const bodyElement = result.props.children;
            expect(bodyElement.type).toBe('body');
        });

        it('should pass children to body element', () => {
            const mockChildren = <div>Test content</div>;
            const result = RootLayout({ children: mockChildren });
            
            // Check children are passed to body
            const bodyElement = result.props.children;
            expect(bodyElement.props.children).toBe(mockChildren);
        });

        it('should handle different types of children', () => {
            const stringChild = 'Test string';
            const result1 = RootLayout({ children: stringChild });
            const bodyElement1 = result1.props.children;
            expect(bodyElement1.props.children).toBe(stringChild);

            const multipleChildren = [
                <div key="1">First</div>,
                <div key="2">Second</div>
            ];
            const result2 = RootLayout({ children: multipleChildren });
            const bodyElement2 = result2.props.children;
            expect(bodyElement2.props.children).toBe(multipleChildren);
        });
    });

    describe('Metadata Export', () => {
        it('should export correct metadata title', () => {
            expect(metadata.title).toBe('Dwellio - Property Rentals');
        });

        it('should export correct metadata description', () => {
            expect(metadata.description).toBe('Find your perfect property rental');
        });

        it('should have metadata object with required properties', () => {
            expect(metadata).toHaveProperty('title');
            expect(metadata).toHaveProperty('description');
        });

        it('should export metadata with correct types', () => {
            expect(typeof metadata.title).toBe('string');
            expect(typeof metadata.description).toBe('string');
        });
    });

    describe('HTML Attributes', () => {
        it('should set html lang attribute to "en"', () => {
            const mockChildren = <div>Test</div>;
            const result = RootLayout({ children: mockChildren });
            
            expect(result.props.lang).toBe('en');
        });

        it('should render html element with correct props structure', () => {
            const mockChildren = <div>Test</div>;
            const result = RootLayout({ children: mockChildren });
            
            expect(result.props).toEqual({
                lang: 'en',
                children: expect.objectContaining({
                    type: 'body',
                    props: {
                        children: mockChildren
                    }
                })
            });
        });
    });
});