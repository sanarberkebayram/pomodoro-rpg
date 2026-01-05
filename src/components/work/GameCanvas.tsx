/**
 * GameCanvas - SolidJS wrapper component for canvas rendering
 * Provides mobile-first responsive canvas with automatic resizing
 */

import { Component, createSignal, onMount, onCleanup, createEffect, Show } from 'solid-js';
import { CanvasRenderer } from '@/rendering/CanvasRenderer';
import type { CanvasConfig, RenderLayer } from '@/rendering/types';

export interface GameCanvasProps {
  config?: Partial<CanvasConfig>;
  layers?: RenderLayer[];
  targetFPS?: number;
  autoStart?: boolean;
  showStats?: boolean;
  onRendererReady?: (renderer: CanvasRenderer) => void;
  class?: string;
}

export const GameCanvas: Component<GameCanvasProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;

  const [renderer, setRenderer] = createSignal<CanvasRenderer | null>(null);
  const [fps, setFps] = createSignal(0);
  const [isLoading, setIsLoading] = createSignal(true);

  /**
   * Initialize canvas renderer
   */
  const initializeRenderer = (): void => {
    if (!canvasRef || !containerRef) {
      return;
    }

    try {
      // Calculate initial size based on container
      const rect = containerRef.getBoundingClientRect();
      const width = rect.width || props.config?.width || 375; // Default to iPhone SE width
      const height = rect.height || props.config?.height || 500;

      const canvasRenderer = new CanvasRenderer({
        canvas: canvasRef,
        config: {
          ...props.config,
          width,
          height,
        },
        targetFPS: props.targetFPS || 60,
      });

      // Add initial layers if provided
      if (props.layers) {
        props.layers.forEach((layer) => canvasRenderer.addLayer(layer));
      }

      setRenderer(canvasRenderer);
      props.onRendererReady?.(canvasRenderer);

      // Auto-start if enabled
      if (props.autoStart !== false) {
        canvasRenderer.start();
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize canvas renderer:', error);
      setIsLoading(false);
    }
  };

  /**
   * Handle container resize
   */
  const handleResize = (): void => {
    const currentRenderer = renderer();
    if (!currentRenderer || !containerRef) {
      return;
    }

    const rect = containerRef.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      currentRenderer.resize(rect.width, rect.height);
    }
  };

  /**
   * Update FPS display
   */
  const updateFPS = (): void => {
    const currentRenderer = renderer();
    if (currentRenderer && props.showStats) {
      const stats = currentRenderer.getStats();
      setFps(stats.fps);
    }
  };

  onMount(() => {
    // Initialize renderer
    initializeRenderer();

    // Set up resize observer for responsive sizing
    if (containerRef) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerRef);
    }

    // Update FPS if stats are enabled
    if (props.showStats) {
      const fpsInterval = setInterval(updateFPS, 1000);
      onCleanup(() => clearInterval(fpsInterval));
    }
  });

  onCleanup(() => {
    // Clean up renderer
    const currentRenderer = renderer();
    if (currentRenderer) {
      currentRenderer.destroy();
    }

    // Clean up resize observer
    if (resizeObserver && containerRef) {
      resizeObserver.unobserve(containerRef);
      resizeObserver.disconnect();
    }
  });

  // Update layers when props change
  createEffect(() => {
    const currentRenderer = renderer();
    if (currentRenderer && props.layers) {
      currentRenderer.clearLayers();
      props.layers.forEach((layer) => currentRenderer.addLayer(layer));
    }
  });

  return (
    <div
      ref={containerRef}
      class={`relative w-full h-full ${props.class || ''}`}
      style={{
        'touch-action': 'none', // Prevent default touch behaviors
        '-webkit-user-select': 'none',
        'user-select': 'none',
      }}
    >
      {/* Loading indicator */}
      <Show when={isLoading()}>
        <div class="absolute inset-0 flex items-center justify-center bg-slate-900/80">
          <div class="text-white text-lg">Loading canvas...</div>
        </div>
      </Show>

      {/* Canvas element */}
      <canvas
        ref={canvasRef}
        class="block w-full h-full"
        style={{
          'image-rendering': 'pixelated', // For crisp pixel art (if needed)
        }}
      />

      {/* FPS counter (if enabled) */}
      <Show when={props.showStats}>
        <div class="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm font-mono">
          FPS: {fps()}
        </div>
      </Show>
    </div>
  );
};

export default GameCanvas;
