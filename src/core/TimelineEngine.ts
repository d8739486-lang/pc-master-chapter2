/**
 * TimelineEngine — Deterministic event sequencer.
 *
 * Pure TypeScript, no React dependency.
 * All events are scheduled with absolute delays from sequence start.
 * Every timer is tracked for deterministic cleanup.
 */

export interface ITimelineEvent {
  /** Unique identifier for cancellation */
  id: string;
  /** Milliseconds from sequence start */
  delay: number;
  /** The action to execute */
  action: () => void;
}

export class TimelineEngine {
  private timers: Map<string, number> = new Map();
  private destroyed = false;

  /**
   * Queue and immediately schedule a list of events.
   * All delays are absolute from the moment `queue()` is called.
   */
  queue(events: ITimelineEvent[]): void {
    if (this.destroyed) return;

    for (const event of events) {
      const timerId = window.setTimeout(() => {
        if (this.destroyed) return;
        this.timers.delete(event.id);
        event.action();
      }, event.delay);

      this.timers.set(event.id, timerId);
    }
  }

  /** Cancel a single event by id */
  cancel(id: string): void {
    const timerId = this.timers.get(id);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      this.timers.delete(id);
    }
  }

  /** Cancel all pending events and mark engine as destroyed */
  destroy(): void {
    this.destroyed = true;
    for (const timerId of this.timers.values()) {
      clearTimeout(timerId);
    }
    this.timers.clear();
  }

  /** Check if the engine has any pending events */
  get hasPending(): boolean {
    return this.timers.size > 0;
  }

  /** Check if the engine has been destroyed */
  get isDestroyed(): boolean {
    return this.destroyed;
  }
}
