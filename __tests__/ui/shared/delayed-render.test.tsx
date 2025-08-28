import React from 'react';
import { render, screen, act } from '@/__tests__/test-utils';
import DelayedRender from '@/ui/shared/delayed-render';

// Use fake timers for precise timing control
beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

describe('DelayedRender', () => {
    const testChildren = <div data-testid="delayed-content">Test Content</div>;

    describe('Default Behavior', () => {
        it('should not render children initially', () => {
            render(
                <DelayedRender>
                    {testChildren}
                </DelayedRender>
            );

            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();
        });

        it('should render children after default delay (500ms)', () => {
            render(
                <DelayedRender>
                    {testChildren}
                </DelayedRender>
            );

            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();

            // Fast-forward time by 500ms
            act(() => {
                jest.advanceTimersByTime(500);
            });

            expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
        });

        it('should not render children before delay completes', () => {
            render(
                <DelayedRender>
                    {testChildren}
                </DelayedRender>
            );

            // Fast-forward by less than default delay
            act(() => {
                jest.advanceTimersByTime(499);
            });

            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();
        });
    });

    describe('Custom Delay', () => {
        it('should render children after custom delay', () => {
            const customDelay = 1000;

            render(
                <DelayedRender delay={customDelay}>
                    {testChildren}
                </DelayedRender>
            );

            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();

            // Fast-forward by custom delay
            act(() => {
                jest.advanceTimersByTime(customDelay);
            });

            expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
        });

        it('should handle zero delay (immediate render)', () => {
            render(
                <DelayedRender delay={0}>
                    {testChildren}
                </DelayedRender>
            );

            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();

            // Fast-forward by 0ms (next tick)
            act(() => {
                jest.advanceTimersByTime(0);
            });

            expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
        });

        it('should handle very short delays', () => {
            render(
                <DelayedRender delay={1}>
                    {testChildren}
                </DelayedRender>
            );

            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();

            act(() => {
                jest.advanceTimersByTime(1);
            });

            expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
        });

        it('should handle long delays', () => {
            const longDelay = 2000;

            render(
                <DelayedRender delay={longDelay}>
                    {testChildren}
                </DelayedRender>
            );

            // Should not render before delay
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();

            // Should render after full delay
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
        });
    });

    describe('Children Content', () => {
        it('should render simple text children', () => {
            render(
                <DelayedRender delay={100}>
                    Simple text content
                </DelayedRender>
            );

            act(() => {
                jest.advanceTimersByTime(100);
            });

            expect(screen.getByText('Simple text content')).toBeInTheDocument();
        });

        it('should render complex JSX children', () => {
            const complexChildren = (
                <div>
                    <h1 data-testid="title">Title</h1>
                    <p data-testid="paragraph">Paragraph content</p>
                    <button data-testid="button">Click me</button>
                </div>
            );

            render(
                <DelayedRender delay={200}>
                    {complexChildren}
                </DelayedRender>
            );

            act(() => {
                jest.advanceTimersByTime(200);
            });

            expect(screen.getByTestId('title')).toBeInTheDocument();
            expect(screen.getByTestId('paragraph')).toBeInTheDocument();
            expect(screen.getByTestId('button')).toBeInTheDocument();
        });

        it('should render multiple children', () => {
            render(
                <DelayedRender delay={150}>
                    <span data-testid="first">First</span>
                    <span data-testid="second">Second</span>
                    <span data-testid="third">Third</span>
                </DelayedRender>
            );

            act(() => {
                jest.advanceTimersByTime(150);
            });

            expect(screen.getByTestId('first')).toBeInTheDocument();
            expect(screen.getByTestId('second')).toBeInTheDocument();
            expect(screen.getByTestId('third')).toBeInTheDocument();
        });

        it('should handle null children gracefully', () => {
            render(
                <DelayedRender delay={100}>
                    {null}
                </DelayedRender>
            );

            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Should not crash - React fragment with null children
            expect(screen.queryByText('anything')).not.toBeInTheDocument();
        });
    });

    describe('Component Lifecycle', () => {
        it('should cleanup timer on unmount', () => {
            const { unmount } = render(
                <DelayedRender delay={1000}>
                    {testChildren}
                </DelayedRender>
            );

            // Unmount before delay completes
            unmount();

            // Fast-forward past the delay - should not cause issues
            act(() => {
                jest.advanceTimersByTime(1000);
            });

            // Should not cause any issues (no memory leaks)
            expect(() => {
                act(() => {
                    jest.advanceTimersByTime(1000);
                });
            }).not.toThrow();
        });

        it('should handle delay prop changes', () => {
            const { rerender } = render(
                <DelayedRender delay={1000}>
                    {testChildren}
                </DelayedRender>
            );

            // Change delay prop
            rerender(
                <DelayedRender delay={500}>
                    {testChildren}
                </DelayedRender>
            );

            // Should use new delay (500ms), not original (1000ms)
            act(() => {
                jest.advanceTimersByTime(500);
            });

            expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
        });

        it('should restart timer when delay prop changes mid-delay', () => {
            const { rerender } = render(
                <DelayedRender delay={500}>
                    {testChildren}
                </DelayedRender>
            );

            // Advance partway through delay
            act(() => {
                jest.advanceTimersByTime(300);
            });
            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();

            // Change delay prop (should restart timer)
            rerender(
                <DelayedRender delay={200}>
                    {testChildren}
                </DelayedRender>
            );

            // Should not render yet (timer restarted)
            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();

            // Should render after new delay from restart point
            act(() => {
                jest.advanceTimersByTime(200);
            });

            expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
        });

        it('should handle children prop changes', () => {
            const initialChildren = <div data-testid="initial">Initial</div>;
            const updatedChildren = <div data-testid="updated">Updated</div>;

            const { rerender } = render(
                <DelayedRender delay={300}>
                    {initialChildren}
                </DelayedRender>
            );

            // Change children before delay completes
            rerender(
                <DelayedRender delay={300}>
                    {updatedChildren}
                </DelayedRender>
            );

            act(() => {
                jest.advanceTimersByTime(300);
            });

            // Should render updated children
            expect(screen.queryByTestId('initial')).not.toBeInTheDocument();
            expect(screen.getByTestId('updated')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle negative delay values (immediate render)', () => {
            render(
                <DelayedRender delay={-100}>
                    {testChildren}
                </DelayedRender>
            );

            // Negative delay should be treated as immediate
            act(() => {
                jest.advanceTimersByTime(0);
            });

            expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
        });

        it('should handle multiple instances with different delays', () => {
            render(
                <div>
                    <DelayedRender delay={100}>
                        <div data-testid="first-delayed">First</div>
                    </DelayedRender>
                    <DelayedRender delay={200}>
                        <div data-testid="second-delayed">Second</div>
                    </DelayedRender>
                    <DelayedRender delay={300}>
                        <div data-testid="third-delayed">Third</div>
                    </DelayedRender>
                </div>
            );

            // After 100ms - only first should render
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(screen.getByTestId('first-delayed')).toBeInTheDocument();
            expect(screen.queryByTestId('second-delayed')).not.toBeInTheDocument();
            expect(screen.queryByTestId('third-delayed')).not.toBeInTheDocument();

            // After 200ms - first and second should render
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(screen.getByTestId('first-delayed')).toBeInTheDocument();
            expect(screen.getByTestId('second-delayed')).toBeInTheDocument();
            expect(screen.queryByTestId('third-delayed')).not.toBeInTheDocument();

            // After 300ms - all should render
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(screen.getByTestId('first-delayed')).toBeInTheDocument();
            expect(screen.getByTestId('second-delayed')).toBeInTheDocument();
            expect(screen.getByTestId('third-delayed')).toBeInTheDocument();
        });
    });

    describe('TypeScript Interface', () => {
        it('should work with DelayedRenderProps interface', () => {
            const validProps = {
                children: <div>Valid children</div>,
                delay: 100
            };

            expect(() => render(<DelayedRender {...validProps} />)).not.toThrow();
        });

        it('should work with optional delay prop', () => {
            const propsWithoutDelay = {
                children: <div data-testid="no-delay">No delay specified</div>
            };

            render(<DelayedRender {...propsWithoutDelay} />);

            // Should use default delay (500ms)
            act(() => {
                jest.advanceTimersByTime(500);
            });

            expect(screen.getByTestId('no-delay')).toBeInTheDocument();
        });
    });

    describe('Performance', () => {
        it('should render quickly after delay completes', () => {
            render(
                <DelayedRender delay={100}>
                    {testChildren}
                </DelayedRender>
            );

            const startTime = performance.now();
            
            act(() => {
                jest.advanceTimersByTime(100);
            });
            
            const endTime = performance.now();

            expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
            expect(endTime - startTime).toBeLessThan(150); // Should be reasonably fast
        });

        it('should not cause unnecessary re-renders', () => {
            const { rerender } = render(
                <DelayedRender delay={200}>
                    {testChildren}
                </DelayedRender>
            );

            act(() => {
                jest.advanceTimersByTime(200);
            });

            expect(screen.getByTestId('delayed-content')).toBeInTheDocument();

            // Re-render with same props
            rerender(
                <DelayedRender delay={200}>
                    {testChildren}
                </DelayedRender>
            );

            // Should still be present without issues
            expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot before delay', () => {
            const { container } = render(
                <DelayedRender delay={500}>
                    {testChildren}
                </DelayedRender>
            );

            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot after delay', () => {
            const { container } = render(
                <DelayedRender delay={500}>
                    {testChildren}
                </DelayedRender>
            );

            act(() => {
                jest.advanceTimersByTime(500);
            });

            expect(container.firstChild).toMatchSnapshot();
        });
    });
});