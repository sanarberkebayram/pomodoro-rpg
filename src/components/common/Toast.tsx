/**
 * Toast Notification System
 * Displays temporary notifications for important events
 */

import { Component, For, createSignal, onMount, onCleanup } from 'solid-js';
import { GameEvent } from '@/core/types/events';

export interface ToastNotification {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  duration?: number;
  timestamp: number;
}

interface ToastProps {
  /** Custom class name */
  class?: string;

  /** Position of toast container */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';

  /** Maximum number of toasts to show at once */
  maxToasts?: number;
}

/**
 * Toast notification manager
 * Singleton-style global toast system
 */
class ToastManager {
  private listeners: Set<(toasts: ToastNotification[]) => void> = new Set();
  private toasts: ToastNotification[] = [];
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Add a toast notification
   */
  public show(notification: Omit<ToastNotification, 'id' | 'timestamp'>): string {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const toast: ToastNotification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? 4000,
    };

    this.toasts.push(toast);
    this.notifyListeners();

    // Auto-dismiss after duration
    if (toast.duration > 0) {
      const timeout = setTimeout(() => {
        this.dismiss(id);
      }, toast.duration);
      this.timeouts.set(id, timeout);
    }

    return id;
  }

  /**
   * Show toast from GameEvent
   */
  public showFromEvent(event: GameEvent): string | null {
    // Only show toasts for warning and critical events
    if (event.severity !== 'warning' && event.severity !== 'critical') {
      return null;
    }

    return this.show({
      message: event.message,
      severity: event.severity,
      duration: event.severity === 'critical' ? 6000 : 4000,
    });
  }

  /**
   * Dismiss a toast
   */
  public dismiss(id: string): void {
    const index = this.toasts.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.toasts.splice(index, 1);
      this.notifyListeners();
    }

    // Clear timeout
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
  }

  /**
   * Clear all toasts
   */
  public clear(): void {
    this.toasts = [];
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
    this.notifyListeners();
  }

  /**
   * Subscribe to toast changes
   */
  public subscribe(listener: (toasts: ToastNotification[]) => void): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener([...this.toasts]);
    });
  }

  /**
   * Get current toasts
   */
  public getToasts(): ToastNotification[] {
    return [...this.toasts];
  }
}

// Global toast manager instance
export const toastManager = new ToastManager();

/**
 * Toast Container Component
 * Renders toast notifications
 */
export const ToastContainer: Component<ToastProps> = (props) => {
  const [toasts, setToasts] = createSignal<ToastNotification[]>([]);
  const maxToasts = () => props.maxToasts ?? 3;

  onMount(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    onCleanup(unsubscribe);
  });

  /**
   * Get position classes
   */
  const getPositionClasses = (): string => {
    const position = props.position ?? 'top-right';
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
    }
  };

  /**
   * Get severity styles
   */
  const getSeverityStyles = (severity: ToastNotification['severity']) => {
    switch (severity) {
      case 'info':
        return {
          bg: 'bg-blue-600',
          border: 'border-blue-500',
          icon: 'ℹ',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-600',
          border: 'border-yellow-500',
          icon: '⚠',
        };
      case 'critical':
        return {
          bg: 'bg-red-600',
          border: 'border-red-500',
          icon: '⚡',
        };
    }
  };

  /**
   * Get displayed toasts (limit to maxToasts)
   */
  const displayedToasts = () => {
    const all = toasts();
    return all.slice(-maxToasts());
  };

  return (
    <div
      class={`toast-container fixed z-50 flex flex-col gap-2 pointer-events-none ${getPositionClasses()} ${
        props.class || ''
      }`}
    >
      <For each={displayedToasts()}>
        {(toast) => {
          const styles = getSeverityStyles(toast.severity);

          return (
            <div
              class={`toast pointer-events-auto flex items-start gap-3 ${styles.bg} ${styles.border} border-l-4 rounded-lg shadow-lg p-4 min-w-[280px] max-w-[400px] animate-slide-in-right`}
              style={{
                animation: 'slideInRight 0.3s ease-out',
              }}
            >
              {/* Icon */}
              <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-white text-xl">
                {styles.icon}
              </div>

              {/* Content */}
              <div class="flex-1 min-w-0">
                <p class="text-sm text-white leading-tight break-words">{toast.message}</p>
              </div>

              {/* Close Button */}
              <button
                class="flex-shrink-0 w-5 h-5 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                onClick={() => toastManager.dismiss(toast.id)}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          );
        }}
      </For>
    </div>
  );
};

/**
 * Helper function to show a toast
 */
export function showToast(
  message: string,
  severity: 'info' | 'warning' | 'critical' = 'info',
  duration?: number
): string {
  return toastManager.show({ message, severity, duration });
}

/**
 * Helper function to show toast from event
 */
export function showEventToast(event: GameEvent): string | null {
  return toastManager.showFromEvent(event);
}

export default ToastContainer;
