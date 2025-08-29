import React from 'react';
import { render, screen } from '@/__tests__/test-utils';

import UnreadMessageCount from '@/ui/messages/unread-message-count';

describe('UnreadMessageCount', () => {
    describe('Rendering Logic', () => {
        it('should render badge with correct positioning classes', () => {
            render(<UnreadMessageCount unreadCount={5} viewportWidth={1024} />);
            
            const badge = screen.getByText('5');
            expect(badge).toHaveClass(
                'absolute',
                'top-1',
                'right-1',
                'inline-flex',
                'items-center',
                'justify-center',
                'transform',
                'translate-x-1/2',
                '-translate-y-1/2',
                'bg-red-500',
                'rounded-full'
            );
        });

        it('should display count number when viewport > 640px', () => {
            render(<UnreadMessageCount unreadCount={3} viewportWidth={768} />);
            
            expect(screen.getByText('3')).toBeInTheDocument();
        });

        it('should hide count number when viewport ≤ 640px', () => {
            render(<UnreadMessageCount unreadCount={7} viewportWidth={640} />);
            
            expect(screen.queryByText('7')).not.toBeInTheDocument();
        });

        it('should hide count number on mobile viewport', () => {
            render(<UnreadMessageCount unreadCount={12} viewportWidth={480} />);
            
            expect(screen.queryByText('12')).not.toBeInTheDocument();
        });

        it('should render with correct size classes', () => {
            render(<UnreadMessageCount unreadCount={1} viewportWidth={1024} />);
            
            const badge = screen.getByText('1');
            expect(badge).toHaveClass('size-[15px]', 'md:size-[14px]');
        });

        it('should render with correct text styling', () => {
            render(<UnreadMessageCount unreadCount={8} viewportWidth={1024} />);
            
            const badge = screen.getByText('8');
            expect(badge).toHaveClass(
                'text-[10px]',
                'leading-none',
                'text-white'
            );
        });
    });

    describe('Props Handling', () => {
        it('should accept unreadCount and viewportWidth props', () => {
            render(<UnreadMessageCount unreadCount={15} viewportWidth={1200} />);
            
            expect(screen.getByText('15')).toBeInTheDocument();
        });

        it('should handle zero count', () => {
            const { container } = render(<UnreadMessageCount unreadCount={0} viewportWidth={1024} />);
            
            // Badge should still render and show 0 on desktop
            const badge = container.querySelector('span');
            expect(badge).toHaveClass('bg-red-500');
            expect(screen.getByText('0')).toBeInTheDocument();
        });

        it('should handle large numbers', () => {
            render(<UnreadMessageCount unreadCount={999} viewportWidth={1024} />);
            
            expect(screen.getByText('999')).toBeInTheDocument();
        });

        it('should handle single digit numbers', () => {
            render(<UnreadMessageCount unreadCount={9} viewportWidth={1024} />);
            
            expect(screen.getByText('9')).toBeInTheDocument();
        });

        it('should handle negative values gracefully', () => {
            const { container } = render(<UnreadMessageCount unreadCount={-5} viewportWidth={1024} />);
            
            // Component should still render but may show unexpected content
            const badge = container.querySelector('span');
            expect(badge).toBeInTheDocument();
        });
    });

    describe('Responsive Behavior', () => {
        it('should conditionally render count based on viewportWidth', () => {
            const { rerender } = render(<UnreadMessageCount unreadCount={5} viewportWidth={800} />);
            
            expect(screen.getByText('5')).toBeInTheDocument();
            
            rerender(<UnreadMessageCount unreadCount={5} viewportWidth={600} />);
            
            expect(screen.queryByText('5')).not.toBeInTheDocument();
        });

        it('should maintain badge visibility across all screen sizes', () => {
            const { rerender, container } = render(<UnreadMessageCount unreadCount={3} viewportWidth={320} />);
            
            let badge = container.querySelector('span');
            expect(badge).toHaveClass('bg-red-500');
            
            rerender(<UnreadMessageCount unreadCount={3} viewportWidth={1920} />);
            
            badge = screen.getByText('3');
            expect(badge).toHaveClass('bg-red-500');
        });

        it('should apply correct CSS classes for different breakpoints', () => {
            render(<UnreadMessageCount unreadCount={2} viewportWidth={768} />);
            
            const badge = screen.getByText('2');
            expect(badge).toHaveClass('size-[15px]', 'md:size-[14px]');
        });

        it('should handle boundary viewport width (641px)', () => {
            render(<UnreadMessageCount unreadCount={4} viewportWidth={641} />);
            
            expect(screen.getByText('4')).toBeInTheDocument();
        });
    });

    describe('Styling and Accessibility', () => {
        it('should apply correct Tailwind classes', () => {
            render(<UnreadMessageCount unreadCount={1} viewportWidth={1024} />);
            
            const badge = screen.getByText('1');
            expect(badge).toHaveClass(
                'absolute',
                'top-1',
                'right-1',
                'inline-flex',
                'items-center',
                'justify-center',
                'size-[15px]',
                'md:size-[14px]',
                'text-[10px]',
                'leading-none',
                'text-white',
                'transform',
                'translate-x-1/2',
                '-translate-y-1/2',
                'bg-red-500',
                'rounded-full'
            );
        });

        it('should have proper contrast with red background and white text', () => {
            render(<UnreadMessageCount unreadCount={6} viewportWidth={1024} />);
            
            const badge = screen.getByText('6');
            expect(badge).toHaveClass('bg-red-500', 'text-white');
        });

        it('should be positioned absolutely with transform utilities', () => {
            render(<UnreadMessageCount unreadCount={2} viewportWidth={1024} />);
            
            const badge = screen.getByText('2');
            expect(badge).toHaveClass(
                'absolute',
                'transform',
                'translate-x-1/2',
                '-translate-y-1/2'
            );
        });

        it('should render as span element', () => {
            render(<UnreadMessageCount unreadCount={3} viewportWidth={1024} />);
            
            const badge = screen.getByText('3');
            expect(badge.tagName).toBe('SPAN');
        });
    });

    describe('Edge Cases', () => {
        it('should handle extremely large viewport widths', () => {
            render(<UnreadMessageCount unreadCount={5} viewportWidth={9999} />);
            
            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('should handle zero viewport width', () => {
            render(<UnreadMessageCount unreadCount={8} viewportWidth={0} />);
            
            expect(screen.queryByText('8')).not.toBeInTheDocument();
        });

        it('should handle very large count numbers', () => {
            render(<UnreadMessageCount unreadCount={9999} viewportWidth={1024} />);
            
            expect(screen.getByText('9999')).toBeInTheDocument();
        });

        it('should render consistently across multiple renders', () => {
            const { rerender } = render(<UnreadMessageCount unreadCount={5} viewportWidth={1024} />);
            
            expect(screen.getByText('5')).toBeInTheDocument();
            
            rerender(<UnreadMessageCount unreadCount={5} viewportWidth={1024} />);
            
            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot for mobile viewport (count hidden)', () => {
            const { container } = render(<UnreadMessageCount unreadCount={3} viewportWidth={480} />);
            expect(container.firstChild).toMatchSnapshot('mobile-viewport-count-hidden');
        });

        it('should match snapshot for desktop viewport (count visible)', () => {
            const { container } = render(<UnreadMessageCount unreadCount={5} viewportWidth={1024} />);
            expect(container.firstChild).toMatchSnapshot('desktop-viewport-count-visible');
        });

        it('should match snapshot for zero count', () => {
            const { container } = render(<UnreadMessageCount unreadCount={0} viewportWidth={1024} />);
            expect(container.firstChild).toMatchSnapshot('zero-count');
        });

        it('should match snapshot for single count', () => {
            const { container } = render(<UnreadMessageCount unreadCount={1} viewportWidth={1024} />);
            expect(container.firstChild).toMatchSnapshot('single-count');
        });

        it('should match snapshot for large count (99+)', () => {
            const { container } = render(<UnreadMessageCount unreadCount={150} viewportWidth={1024} />);
            expect(container.firstChild).toMatchSnapshot('large-count-99-plus');
        });

        it('should match snapshot for mobile with large count', () => {
            const { container } = render(<UnreadMessageCount unreadCount={42} viewportWidth={320} />);
            expect(container.firstChild).toMatchSnapshot('mobile-large-count');
        });
    });
});