/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import AddPropertyPage from '@/app/(root)/properties/add/page';

// Mock child components
jest.mock('@/ui/properties/add/add-property-form', () => {
    return function MockAddPropertyForm() {
        return <div data-testid="add-property-form">Add Property Form Component</div>;
    };
});

jest.mock('@/ui/shared/breadcrumbs', () => {
    return function MockBreadcrumbs({ breadcrumbs }: any) {
        return (
            <nav data-testid="breadcrumbs">
                {breadcrumbs.map((crumb: any, index: number) => (
                    <span key={index} data-active={crumb.active}>
                        {crumb.label}
                    </span>
                ))}
            </nav>
        );
    };
});

describe('AddPropertyPage', () => {
    describe('Component Rendering', () => {
        it('should render main element', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
        });

        it('should render breadcrumbs', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
        });

        it('should have correct breadcrumb labels', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Properties');
            expect(breadcrumbs).toHaveTextContent('Add Property');
        });

        it('should mark "Add Property" breadcrumb as active', async () => {
            const jsx = await AddPropertyPage();
            const { container } = render(jsx);

            const breadcrumbSpans = container.querySelectorAll('[data-testid="breadcrumbs"] span');
            const addPropertyCrumb = Array.from(breadcrumbSpans).find(
                span => span.textContent === 'Add Property'
            );

            expect(addPropertyCrumb).toHaveAttribute('data-active', 'true');
        });

        it('should render AddPropertyForm component', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const form = screen.getByTestId('add-property-form');
            expect(form).toBeInTheDocument();
            expect(form).toHaveTextContent('Add Property Form Component');
        });
    });

    describe('Breadcrumb Navigation', () => {
        it('should have breadcrumb for Properties page', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Properties');
        });

        it('should have correct breadcrumb structure', async () => {
            const jsx = await AddPropertyPage();
            const { container } = render(jsx);

            const breadcrumbSpans = container.querySelectorAll('[data-testid="breadcrumbs"] span');
            expect(breadcrumbSpans).toHaveLength(2);
            expect(breadcrumbSpans[0]).toHaveTextContent('Properties');
            expect(breadcrumbSpans[1]).toHaveTextContent('Add Property');
        });

        it('should only mark last breadcrumb as active', async () => {
            const jsx = await AddPropertyPage();
            const { container } = render(jsx);

            const breadcrumbSpans = container.querySelectorAll('[data-testid="breadcrumbs"] span');
            const firstCrumbActive = breadcrumbSpans[0].getAttribute('data-active');
            const lastCrumbActive = breadcrumbSpans[1].getAttribute('data-active');

            expect(firstCrumbActive === 'false' || firstCrumbActive === null).toBe(true);
            expect(lastCrumbActive).toBe('true');
        });
    });

    describe('Layout Structure', () => {
        it('should have breadcrumbs within main element', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const main = screen.getByRole('main');
            const breadcrumbs = screen.getByTestId('breadcrumbs');

            expect(main).toContainElement(breadcrumbs);
        });

        it('should have form within main element', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const main = screen.getByRole('main');
            const form = screen.getByTestId('add-property-form');

            expect(main).toContainElement(form);
        });

        it('should render breadcrumbs before form', async () => {
            const jsx = await AddPropertyPage();
            const { container } = render(jsx);

            const main = container.querySelector('main');
            const children = main?.children;

            expect(children?.[0]).toContainHTML('breadcrumbs');
            expect(children?.[1]).toContainHTML('add-property-form');
        });
    });

    describe('Metadata', () => {
        it('should export metadata object', async () => {
            const { metadata } = await import('@/app/(root)/properties/add/page');
            expect(metadata).toBeDefined();
        });

        it('should have correct page title in metadata', async () => {
            const { metadata } = await import('@/app/(root)/properties/add/page');
            expect(metadata.title).toBe('Add New Property');
        });
    });

    describe('Component Type', () => {
        it('should be an async server component', async () => {
            const component = AddPropertyPage();
            expect(component).toBeInstanceOf(Promise);
        });

        it('should render JSX after awaiting', async () => {
            const jsx = await AddPropertyPage();
            expect(() => render(jsx)).not.toThrow();
        });
    });

    describe('Integration Tests', () => {
        it('should render complete page with all elements', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('add-property-form')).toBeInTheDocument();
        });

        it('should maintain consistent structure across renders', async () => {
            const jsx = await AddPropertyPage();
            const { rerender } = render(jsx);

            const initialMain = screen.getByRole('main');
            expect(initialMain).toBeInTheDocument();

            const jsx2 = await AddPropertyPage();
            rerender(jsx2);

            const rerenderedMain = screen.getByRole('main');
            expect(rerenderedMain).toBeInTheDocument();
            expect(screen.getByTestId('add-property-form')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic HTML structure', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const main = screen.getByRole('main');
            expect(main.tagName).toBe('MAIN');
        });

        it('should have breadcrumb navigation', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs.tagName).toBe('NAV');
        });

        it('should be accessible to screen readers', async () => {
            const jsx = await AddPropertyPage();
            render(jsx);

            const main = screen.getByRole('main');
            expect(main).toBeVisible();
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid re-renders gracefully', async () => {
            const jsx = await AddPropertyPage();
            const { rerender } = render(jsx);

            for (let i = 0; i < 5; i++) {
                const newJsx = await AddPropertyPage();
                rerender(newJsx);
            }

            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('add-property-form')).toBeInTheDocument();
        });

        it('should render consistently when unmounted and remounted', async () => {
            const jsx = await AddPropertyPage();
            const { unmount } = render(jsx);
            unmount();

            const jsx2 = await AddPropertyPage();
            render(jsx2);

            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('add-property-form')).toBeInTheDocument();
        });
    });

    describe('Page Structure', () => {
        it('should have exactly two main child elements', async () => {
            const jsx = await AddPropertyPage();
            const { container } = render(jsx);

            const main = container.querySelector('main');
            const children = main?.children;

            expect(children).toHaveLength(2);
        });

        it('should render without errors', async () => {
            const jsx = await AddPropertyPage();
            expect(() => render(jsx)).not.toThrow();
        });

        it('should have clean component structure', async () => {
            const jsx = await AddPropertyPage();
            const { container } = render(jsx);

            const main = container.querySelector('main');
            expect(main?.children.length).toBeGreaterThan(0);
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('add-property-form')).toBeInTheDocument();
        });
    });

    describe('Async Rendering', () => {
        it('should return a promise', () => {
            const result = AddPropertyPage();
            expect(result).toBeInstanceOf(Promise);
        });

        it('should resolve to valid JSX', async () => {
            const jsx = await AddPropertyPage();
            expect(jsx).toBeDefined();
            expect(jsx).not.toBeNull();
        });

        it('should be renderable after promise resolution', async () => {
            const jsx = await AddPropertyPage();
            const { container } = render(jsx);

            expect(container.firstChild).toBeInTheDocument();
        });
    });
});
