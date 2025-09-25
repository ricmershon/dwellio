import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import DelayedRender from '@/ui/shared/delayed-render';

describe('DelayedRender Component', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('Component Rendering', () => {
        it('should not render children immediately', () => {
            render(
                <DelayedRender>
                    <div data-testid="delayed-content">Delayed Content</div>
                </DelayedRender>
            );

            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();
        });

        it('should render children after default delay', async () => {
            render(
                <DelayedRender>
                    <div data-testid="delayed-content">Delayed Content</div>
                </DelayedRender>
            );

            // Initially not visible
            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();

            // Fast-forward time by 500ms (default delay)
            act(() => {
                jest.advanceTimersByTime(500);
            });

            await waitFor(() => {
                expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
            });
        });

        it('should render children after custom delay', async () => {
            const customDelay = 1000;

            render(
                <DelayedRender delay={customDelay}>
                    <div data-testid="delayed-content">Delayed Content</div>
                </DelayedRender>
            );

            // Should not be visible before custom delay
            act(() => {
                jest.advanceTimersByTime(999);
            });
            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();

            // Should be visible after custom delay
            act(() => {
                jest.advanceTimersByTime(1);
            });

            await waitFor(() => {
                expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
            });
        });
    });

    describe('Timer Management', () => {
        it('should clean up timer when component unmounts', () => {
            const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

            const { unmount } = render(
                <DelayedRender>
                    <div data-testid="delayed-content">Content</div>
                </DelayedRender>
            );

            // Unmount before delay completes
            unmount();

            expect(clearTimeoutSpy).toHaveBeenCalled();
            clearTimeoutSpy.mockRestore();
        });

        it('should handle multiple timer setups with delay changes', async () => {
            let delay = 500;
            const { rerender } = render(
                <DelayedRender delay={delay}>
                    <div data-testid="delayed-content">Content</div>
                </DelayedRender>
            );

            // Change delay before first timer fires
            delay = 1000;
            rerender(
                <DelayedRender delay={delay}>
                    <div data-testid="delayed-content">Content</div>
                </DelayedRender>
            );

            // Original delay (500ms) should not trigger
            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(screen.queryByTestId('delayed-content')).not.toBeInTheDocument();

            // New delay (1000ms) should trigger
            act(() => {
                jest.advanceTimersByTime(500);
            });

            await waitFor(() => {
                expect(screen.getByTestId('delayed-content')).toBeInTheDocument();
            });
        });
    });

    describe('Children Rendering', () => {
        it('should render simple text children', async () => {
            render(<DelayedRender>Simple text</DelayedRender>);

            act(() => {
                jest.advanceTimersByTime(500);
            });

            await waitFor(() => {
                expect(screen.getByText('Simple text')).toBeInTheDocument();
            });
        });

        it('should render multiple children', async () => {
            render(
                <DelayedRender>
                    <div data-testid="child1">Child 1</div>
                    <div data-testid="child2">Child 2</div>
                    <span data-testid="child3">Child 3</span>
                </DelayedRender>
            );

            act(() => {
                jest.advanceTimersByTime(500);
            });

            await waitFor(() => {
                expect(screen.getByTestId('child1')).toBeInTheDocument();
                expect(screen.getByTestId('child2')).toBeInTheDocument();
                expect(screen.getByTestId('child3')).toBeInTheDocument();
            });
        });

        it('should render complex nested children', async () => {
            render(
                <DelayedRender>
                    <div data-testid="parent">
                        <p data-testid="nested">Nested content</p>
                        <button data-testid="button">Click me</button>
                    </div>
                </DelayedRender>
            );

            act(() => {
                jest.advanceTimersByTime(500);
            });

            await waitFor(() => {
                expect(screen.getByTestId('parent')).toBeInTheDocument();
                expect(screen.getByTestId('nested')).toBeInTheDocument();
                expect(screen.getByTestId('button')).toBeInTheDocument();
            });
        });

        it('should handle empty children', async () => {
            const { container } = render(<DelayedRender>{null}</DelayedRender>);

            act(() => {
                jest.advanceTimersByTime(500);
            });

            // Should not error and should not render anything visible
            await waitFor(() => {
                // Container should be empty
                expect(container.firstChild).toBeNull();
            });
        });
    });

    describe('Delay Configuration', () => {
        it('should handle zero delay', async () => {
            render(
                <DelayedRender delay={0}>
                    <div data-testid="immediate-content">Immediate</div>
                </DelayedRender>
            );

            // Even with 0 delay, it should use setTimeout
            expect(screen.queryByTestId('immediate-content')).not.toBeInTheDocument();

            act(() => {
                jest.advanceTimersByTime(0);
            });

            await waitFor(() => {
                expect(screen.getByTestId('immediate-content')).toBeInTheDocument();
            });
        });

        it('should handle very large delay values', () => {
            const largeDelay = 999999999; // Very large delay

            render(
                <DelayedRender delay={largeDelay}>
                    <div data-testid="very-delayed-content">Very Delayed</div>
                </DelayedRender>
            );

            // Should not be visible even after default delay
            act(() => {
                jest.advanceTimersByTime(500);
            });
            expect(screen.queryByTestId('very-delayed-content')).not.toBeInTheDocument();

            // Should not be visible even after a reasonable time
            act(() => {
                jest.advanceTimersByTime(5000);
            });
            expect(screen.queryByTestId('very-delayed-content')).not.toBeInTheDocument();
        });

        it('should handle negative delay values', async () => {
            // Negative delays should be treated as 0 or minimal delay
            render(
                <DelayedRender delay={-100}>
                    <div data-testid="negative-delay-content">Negative Delay</div>
                </DelayedRender>
            );

            act(() => {
                jest.advanceTimersByTime(0);
            });

            await waitFor(() => {
                expect(screen.getByTestId('negative-delay-content')).toBeInTheDocument();
            });
        });
    });

    describe('State Management', () => {
        it('should maintain visibility state after initial render', async () => {
            const { rerender } = render(
                <DelayedRender>
                    <div data-testid="persistent-content">Persistent</div>
                </DelayedRender>
            );

            // Wait for content to appear
            act(() => {
                jest.advanceTimersByTime(500);
            });

            await waitFor(() => {
                expect(screen.getByTestId('persistent-content')).toBeInTheDocument();
            });

            // Re-render with new children but same delay
            rerender(
                <DelayedRender>
                    <div data-testid="new-content">New Content</div>
                </DelayedRender>
            );

            // Content should still be visible (component re-initialization would trigger new delay)
            await waitFor(() => {
                expect(screen.getByTestId('new-content')).toBeInTheDocument();
            });
        });

        it('should reset visibility when delay prop changes', async () => {
            const { rerender } = render(
                <DelayedRender delay={500}>
                    <div data-testid="resetting-content">Resetting</div>
                </DelayedRender>
            );

            // Content appears after first delay
            act(() => {
                jest.advanceTimersByTime(500);
            });

            await waitFor(() => {
                expect(screen.getByTestId('resetting-content')).toBeInTheDocument();
            });

            // Change delay - this should trigger new effect
            rerender(
                <DelayedRender delay={1000}>
                    <div data-testid="resetting-content">Resetting</div>
                </DelayedRender>
            );

            // Component should reset and content should still be visible
            // (since the previous timer already completed)
            expect(screen.getByTestId('resetting-content')).toBeInTheDocument();
        });
    });

    describe('Performance', () => {
        it('should not cause memory leaks with multiple instances', () => {
            const instances = [];

            // Create multiple instances
            for (let i = 0; i < 10; i++) {
                instances.push(
                    render(
                        <DelayedRender delay={100}>
                            <div data-testid={`content-${i}`}>Content {i}</div>
                        </DelayedRender>
                    )
                );
            }

            // Unmount all instances before timers complete
            instances.forEach(instance => instance.unmount());

            // Advance time to see if any timers still fire
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // No content should be rendered
            for (let i = 0; i < 10; i++) {
                expect(screen.queryByTestId(`content-${i}`)).not.toBeInTheDocument();
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle rendering errors gracefully', () => {
            const ThrowingComponent = () => {
                throw new Error('Render error');
            };

            // This would normally be wrapped in an error boundary in real apps
            expect(() => {
                render(
                    <DelayedRender>
                        <ThrowingComponent />
                    </DelayedRender>
                );

                act(() => {
                    jest.advanceTimersByTime(500);
                });
            }).toThrow('Render error');
        });
    });
});