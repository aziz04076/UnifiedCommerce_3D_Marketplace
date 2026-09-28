/**
 * Production-ready Circuit Breaker and Slow Request Logger
 */

interface CircuitBreakerOptions {
  timeoutMs?: number;
  failureThreshold?: number;
  resetTimeoutMs?: number;
}

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private timeoutMs: number;
  private failureThreshold: number;
  private resetTimeoutMs: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.timeoutMs = options.timeoutMs || 2000; // Strict 2-second timeout
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeoutMs = options.resetTimeoutMs || 30000;
  }

  async execute<T>(fn: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        return fallback();
      }
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('CircuitBreaker: Execution timed out')), this.timeoutMs)
        ),
      ]);

      if (this.state === CircuitState.HALF_OPEN) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
      }

      return result;
    } catch (err: any) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = CircuitState.OPEN;
      }

      return fallback();
    }
  }

  getState(): string {
    return this.state;
  }
}

// Global AI Circuit Breaker instance
export const aiCircuitBreaker = new CircuitBreaker({ timeoutMs: 2000, failureThreshold: 3 });

/**
 * Slow Request Profiler: Logs any execution exceeding 300ms
 */
export async function withSlowRequestLogger<T>(
  label: string,
  thresholdMs = 300,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    return await operation();
  } finally {
    const elapsed = performance.now() - start;
    if (elapsed > thresholdMs) {
      console.warn(`[SLOW_PATH_WARNING] ${label} took ${elapsed.toFixed(1)}ms (> ${thresholdMs}ms threshold)`);
    }
  }
}
