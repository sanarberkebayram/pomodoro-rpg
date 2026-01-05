import { Component, JSX, createSignal, onCleanup, onMount } from 'solid-js';

interface DraggablePanelProps {
  class?: string;
  handleClass?: string;
  handleLabel?: string;
  handleSelector?: string;
  showHandleBar?: boolean;
  children: JSX.Element;
}

export const DraggablePanel: Component<DraggablePanelProps> = (props) => {
  const [offset, setOffset] = createSignal({ x: 0, y: 0 });
  let rootRef: HTMLDivElement | undefined;
  let dragStart: {
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null = null;

  const shouldIgnoreTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest('button, a, input, textarea, select'));
  };

  const startDrag = (clientX: number, clientY: number, target: EventTarget | null) => {
    if (shouldIgnoreTarget(target)) return;
    dragStart = {
      startX: clientX,
      startY: clientY,
      startOffsetX: offset().x,
      startOffsetY: offset().y,
    };
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!dragStart) return;
    const nextX = dragStart.startOffsetX + (event.clientX - dragStart.startX);
    const nextY = dragStart.startOffsetY + (event.clientY - dragStart.startY);
    setOffset({ x: nextX, y: nextY });
  };

  const handlePointerUp = () => {
    dragStart = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    startDrag(event.clientX, event.clientY, event.target);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!dragStart) return;
    const nextX = dragStart.startOffsetX + (event.clientX - dragStart.startX);
    const nextY = dragStart.startOffsetY + (event.clientY - dragStart.startY);
    setOffset({ x: nextX, y: nextY });
  };

  const handleMouseUp = () => {
    dragStart = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (window.PointerEvent) return;
    if (event.button !== 0) return;
    event.preventDefault();
    startDrag(event.clientX, event.clientY, event.target);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (!dragStart || event.touches.length === 0) return;
    event.preventDefault();
    const touch = event.touches[0];
    const nextX = dragStart.startOffsetX + (touch.clientX - dragStart.startX);
    const nextY = dragStart.startOffsetY + (touch.clientY - dragStart.startY);
    setOffset({ x: nextX, y: nextY });
  };

  const handleTouchEnd = () => {
    dragStart = null;
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  };

  const handleTouchStart = (event: TouchEvent) => {
    if (window.PointerEvent) return;
    if (event.touches.length === 0) return;
    event.preventDefault();
    const touch = event.touches[0];
    startDrag(touch.clientX, touch.clientY, event.target);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  onMount(() => {
    if (!props.handleSelector || !rootRef) return;
    const handles = Array.from(rootRef.querySelectorAll(props.handleSelector));
    handles.forEach((handle) => {
      handle.addEventListener('pointerdown', handlePointerDown as EventListener);
      handle.addEventListener('mousedown', handleMouseDown as EventListener);
      handle.addEventListener('touchstart', handleTouchStart as EventListener, { passive: false });
    });
  });

  onCleanup(() => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
    if (props.handleSelector && rootRef) {
      const handles = Array.from(rootRef.querySelectorAll(props.handleSelector));
      handles.forEach((handle) => {
        handle.removeEventListener('pointerdown', handlePointerDown as EventListener);
        handle.removeEventListener('mousedown', handleMouseDown as EventListener);
        handle.removeEventListener('touchstart', handleTouchStart as EventListener);
      });
    }
  });

  return (
    <div
      class={props.class}
      style={{
        transform: `translate(${offset().x}px, ${offset().y}px)`,
      }}
      ref={rootRef}
    >
      {(props.showHandleBar ?? true) && (
        <div
          class={`w-full flex items-center justify-center gap-2 select-none cursor-grab active:cursor-grabbing touch-none ${
            props.handleClass ?? ''
          }`}
          onPointerDown={handlePointerDown}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          role="button"
          aria-label={props.handleLabel ?? 'Drag panel'}
          style={{ 'touch-action': 'none' }}
        >
          <span class="text-base">↕</span>
          <span class="text-xs uppercase tracking-[0.22em]">Drag to Move</span>
        </div>
      )}
      <div class="flex-1 min-h-0">{props.children}</div>
    </div>
  );
};
