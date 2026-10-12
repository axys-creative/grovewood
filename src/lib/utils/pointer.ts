export const pointer = { x: 0, y: 0, moved: false };

type Listener = (event: PointerEvent) => void;

const listeners = new Set<Listener>();

const onMove = (event: PointerEvent) => {
	if (event.pointerType !== 'mouse') return;
	pointer.x = event.clientX;
	pointer.y = event.clientY;
	pointer.moved = true;
	listeners.forEach((listener) => listener(event));
};

/** True for devices with a mouse-like pointer that can hover. */
export const hasMouse = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Subscribes to mouse movement. One shared window listener serves every caller and is removed
 * when the last one unsubscribes. Returns the unsubscribe function.
 */
export function trackPointer(listener: Listener): () => void {
	if (!listeners.size) addEventListener('pointermove', onMove, { passive: true });
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
		if (!listeners.size) removeEventListener('pointermove', onMove);
	};
}
