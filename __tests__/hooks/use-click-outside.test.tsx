import { renderHook, act } from '@testing-library/react';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useRef } from 'react';

// Mock PointerEvent for test environment
const createPointerEvent = (target: EventTarget) => {
    const event = new Event('pointerdown', { bubbles: true });
    Object.defineProperty(event, 'target', { value: target, enumerable: true });
    return event as PointerEvent;
};

describe('useClickOutside Hook', () => {
    let mockCallback: jest.Mock;
    let mockRef: React.RefObject<HTMLElement>;
    let addEventListenerSpy: jest.SpyInstance;
    let removeEventListenerSpy: jest.SpyInstance;

    beforeEach(() => {
        mockCallback = jest.fn();
        mockRef = { current: document.createElement('div') };
        
        if (mockRef.current) {
            document.body.appendChild(mockRef.current);
        }

        addEventListenerSpy = jest.spyOn(document, 'addEventListener');
        removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    });

    afterEach(() => {
        jest.clearAllMocks();
        
        if (mockRef.current && document.body.contains(mockRef.current)) {
            document.body.removeChild(mockRef.current);
        }

        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
    });

    it('should add event listeners when enabled', () => {
        renderHook(() => useClickOutside(mockRef, mockCallback, true));

        expect(addEventListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function), true);
        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should not add event listeners when disabled', () => {
        renderHook(() => useClickOutside(mockRef, mockCallback, false));

        expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('should remove event listeners on unmount', () => {
        const { unmount } = renderHook(() => useClickOutside(mockRef, mockCallback, true));

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function), true);
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should call callback when clicking outside element', () => {
        renderHook(() => useClickOutside(mockRef, mockCallback, true));

        const outsideElement = document.createElement('div');
        document.body.appendChild(outsideElement);

        // Simulate pointerdown event on outside element
        act(() => {
            const event = createPointerEvent(outsideElement);
            document.dispatchEvent(event);
        });

        expect(mockCallback).toHaveBeenCalledTimes(1);
        
        document.body.removeChild(outsideElement);
    });

    it('should not call callback when clicking inside element', () => {
        renderHook(() => useClickOutside(mockRef, mockCallback, true));

        // Simulate pointerdown event on the ref element itself
        act(() => {
            const event = createPointerEvent(mockRef.current!);
            document.dispatchEvent(event);
        });

        expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should not call callback when disabled', () => {
        renderHook(() => useClickOutside(mockRef, mockCallback, false));

        const outsideElement = document.createElement('div');
        document.body.appendChild(outsideElement);

        act(() => {
            const event = createPointerEvent(outsideElement);
            document.dispatchEvent(event);
        });

        expect(mockCallback).not.toHaveBeenCalled();
        
        document.body.removeChild(outsideElement);
    });

    it('should handle keyboard Escape key', () => {
        renderHook(() => useClickOutside(mockRef, mockCallback, true));

        act(() => {
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            document.dispatchEvent(escapeEvent);
        });

        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));
    });

    it('should not call callback for non-Escape keys', () => {
        renderHook(() => useClickOutside(mockRef, mockCallback, true));

        act(() => {
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            document.dispatchEvent(enterEvent);
        });

        expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle array of refs', () => {
        const secondRef = { current: document.createElement('div') };
        document.body.appendChild(secondRef.current);

        renderHook(() => useClickOutside([mockRef, secondRef], mockCallback, true));

        const outsideElement = document.createElement('div');
        document.body.appendChild(outsideElement);

        act(() => {
            const event = createPointerEvent(outsideElement);
            document.dispatchEvent(event);
        });

        expect(mockCallback).toHaveBeenCalledTimes(1);

        document.body.removeChild(outsideElement);
        document.body.removeChild(secondRef.current);
    });

    it('should not call callback when clicking inside any ref in array', () => {
        const secondRef = { current: document.createElement('div') };
        document.body.appendChild(secondRef.current);

        renderHook(() => useClickOutside([mockRef, secondRef], mockCallback, true));

        // Click inside second ref
        act(() => {
            const event = createPointerEvent(secondRef.current);
            document.dispatchEvent(event);
        });

        expect(mockCallback).not.toHaveBeenCalled();

        document.body.removeChild(secondRef.current);
    });

    it('should handle null refs gracefully', () => {
        const nullRef = { current: null };
        
        expect(() => {
            renderHook(() => useClickOutside(nullRef, mockCallback, true));
        }).not.toThrow();

        const outsideElement = document.createElement('div');
        document.body.appendChild(outsideElement);

        act(() => {
            const event = createPointerEvent(outsideElement);
            document.dispatchEvent(event);
        });

        expect(mockCallback).toHaveBeenCalledTimes(1);

        document.body.removeChild(outsideElement);
    });

    it('should update enabled state correctly', () => {
        const { rerender } = renderHook(
            ({ enabled }) => useClickOutside(mockRef, mockCallback, enabled),
            { initialProps: { enabled: false } }
        );

        // Should not have listeners when disabled
        expect(addEventListenerSpy).not.toHaveBeenCalled();

        // Enable the hook
        rerender({ enabled: true });

        // Should now have listeners
        expect(addEventListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function), true);
        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should handle child elements correctly', () => {
        // Create a child element inside the ref element
        const childElement = document.createElement('span');
        mockRef.current!.appendChild(childElement);

        renderHook(() => useClickOutside(mockRef, mockCallback, true));

        // Click on child element - should not trigger callback
        act(() => {
            const event = createPointerEvent(childElement);
            document.dispatchEvent(event);
        });

        expect(mockCallback).not.toHaveBeenCalled();
    });
});