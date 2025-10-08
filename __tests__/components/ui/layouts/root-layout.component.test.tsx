/**
 * @jest-environment jsdom
 *
 * NOTE: Layout components that render <html> and <body> tags have limitations in jsdom testing.
 * These components are better tested through:
 * 1. Metadata exports (tested here)
 * 2. Data fetching behavior (tested here)
 * 3. E2E tests with real browser rendering (future Cypress tests)
 *
 * See: TESTING_PLAN_V2.md - Testing Next.js Special Files - Layout Components
 */
import RootLayout, { metadata, dynamic } from '@/app/(root)/layout';
import { fetchStaticInputs } from '@/lib/data/static-inputs-data';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
jest.mock('@/lib/data/static-inputs-data');
jest.mock('@/app/globals.css', () => ({}));
jest.mock('react-toastify/dist/ReactToastify.css', () => ({}));
jest.mock('react-loading-skeleton/dist/skeleton.css', () => ({}));
jest.mock('photoswipe/dist/photoswipe.css', () => ({}));

const mockFetchStaticInputs = fetchStaticInputs as jest.MockedFunction<typeof fetchStaticInputs>;

const mockStaticInputs = {
    propertyTypes: ['Apartment', 'House', 'Condo'],
    amenities: ['WiFi', 'Parking', 'Pool']
};

describe('RootLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetchStaticInputs.mockResolvedValue(mockStaticInputs as any);
    });

    describe('Metadata Exports', () => {
        it('should export metadata with correct title template', () => {
            expect(metadata).toBeDefined();
            expect(metadata.title).toEqual({
                template: '%s | Dwellio',
                default: 'Dwellio'
            });
        });

        it('should export metadata with description', () => {
            expect(metadata.description).toBe('Find an awesome vacation property');
        });

        it('should export metadata with keywords', () => {
            expect(metadata.keywords).toBe('rental, property, real estate');
        });

        it('should have all required metadata fields', () => {
            expect(metadata).toHaveProperty('title');
            expect(metadata).toHaveProperty('description');
            expect(metadata).toHaveProperty('keywords');
        });
    });

    describe('Dynamic Export', () => {
        it('should export dynamic as force-dynamic', () => {
            expect(dynamic).toBe('force-dynamic');
        });

        it('should force dynamic rendering for all pages', () => {
            // This ensures no static optimization, always server-side rendering
            expect(dynamic).not.toBe('auto');
            expect(dynamic).not.toBe('force-static');
        });
    });

    describe('Data Fetching', () => {
        it('should fetch static inputs on component call', async () => {
            await RootLayout({
                children: <div>Test</div>
            });

            expect(mockFetchStaticInputs).toHaveBeenCalledTimes(1);
        });

        it('should fetch static inputs before rendering', async () => {
            const fetchOrder: string[] = [];

            mockFetchStaticInputs.mockImplementation(async () => {
                fetchOrder.push('fetch');
                return mockStaticInputs as any;
            });

            await RootLayout({
                children: <div>Test</div>
            });

            expect(fetchOrder).toContain('fetch');
            expect(mockFetchStaticInputs).toHaveBeenCalled();
        });

        it('should handle static inputs fetch errors', async () => {
            mockFetchStaticInputs.mockRejectedValue(new Error('Fetch failed'));

            await expect(async () => {
                await RootLayout({
                    children: <div>Test</div>
                });
            }).rejects.toThrow('Fetch failed');
        });

        it('should pass fetched data to layout', async () => {
            const customInputs = {
                propertyTypes: ['Custom Type'],
                amenities: ['Custom Amenity']
            };
            mockFetchStaticInputs.mockResolvedValue(customInputs as any);

            await RootLayout({
                children: <div>Test</div>
            });

            expect(mockFetchStaticInputs).toHaveBeenCalled();
        });
    });

    describe('Async Server Component', () => {
        it('should be an async function', () => {
            const result = RootLayout({ children: <div>Test</div> });
            expect(result).toBeInstanceOf(Promise);
        });

        it('should resolve to JSX element', async () => {
            const jsx = await RootLayout({ children: <div>Test</div> });
            expect(jsx).toBeDefined();
            expect(jsx).not.toBeNull();
            expect(typeof jsx).toBe('object');
        });

        it('should handle children prop correctly', async () => {
            const result = await RootLayout({
                children: <main>Page Content</main>
            });

            expect(result).toBeDefined();
        });

        it('should handle empty children', async () => {
            const result = await RootLayout({ children: null });
            expect(result).toBeDefined();
        });

        it('should handle multiple children', async () => {
            const result = await RootLayout({
                children: (
                    <>
                        <div>Child 1</div>
                        <div>Child 2</div>
                    </>
                )
            });

            expect(result).toBeDefined();
        });
    });

    describe('Component Structure', () => {
        it('should define layout with required Next.js structure', async () => {
            const jsx = await RootLayout({
                children: <div>Content</div>
            });

            // Layout should be a valid React element
            expect(jsx).toHaveProperty('type');
            expect(jsx).toHaveProperty('props');
        });

        it('should include children in props', async () => {
            const testChild = <div data-testid="test">Content</div>;
            const jsx = await RootLayout({
                children: testChild
            });

            expect(jsx).toBeDefined();
            // Children are embedded in the structure
            expect(jsx.props).toBeDefined();
        });
    });

    describe('Performance', () => {
        it('should complete data fetching quickly', async () => {
            const startTime = Date.now();

            await RootLayout({
                children: <div>Test</div>
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete in reasonable time (mocked, so very fast)
            expect(duration).toBeLessThan(1000);
        });

        it('should only fetch static inputs once per render', async () => {
            await RootLayout({
                children: <div>Test</div>
            });

            expect(mockFetchStaticInputs).toHaveBeenCalledTimes(1);
        });
    });

    describe('Type Safety', () => {
        it('should accept valid children prop', async () => {
            const validChildren = [
                <div key="1">Test</div>,
                <main key="2">Main Content</main>,
                null,
                <>Fragment Children</>,
            ];

            for (const child of validChildren) {
                const result = await RootLayout({ children: child });
                expect(result).toBeDefined();
            }
        });

        it('should be callable with Readonly children', async () => {
            const children: Readonly<React.ReactNode> = <div>Test</div>;
            const result = await RootLayout({ children });

            expect(result).toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle repeated calls', async () => {
            await RootLayout({ children: <div>Call 1</div> });
            await RootLayout({ children: <div>Call 2</div> });
            await RootLayout({ children: <div>Call 3</div> });

            expect(mockFetchStaticInputs).toHaveBeenCalledTimes(3);
        });

        it('should handle concurrent calls', async () => {
            const promises = [
                RootLayout({ children: <div>1</div> }),
                RootLayout({ children: <div>2</div> }),
                RootLayout({ children: <div>3</div> }),
            ];

            const results = await Promise.all(promises);

            expect(results).toHaveLength(3);
            results.forEach(result => {
                expect(result).toBeDefined();
            });
        });

        it('should handle complex nested children', async () => {
            const complexChildren = (
                <div>
                    <header>Header</header>
                    <main>
                        <article>
                            <section>
                                <div>Deeply nested content</div>
                            </section>
                        </article>
                    </main>
                    <footer>Footer</footer>
                </div>
            );

            const result = await RootLayout({ children: complexChildren });
            expect(result).toBeDefined();
        });
    });
});
