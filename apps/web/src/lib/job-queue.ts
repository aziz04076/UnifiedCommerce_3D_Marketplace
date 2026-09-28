/**
 * Simple in-process job queue with retry and dead-letter.
 * For production, replace with BullMQ + Redis or a managed queue.
 */

export type JobType = 'email' | 'whatsapp' | 'invoice' | 'image_process';

export interface Job<T = unknown> {
  id: string;
  type: JobType;
  payload: T;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  nextRunAt: number;
  error?: string;
}

type Handler<T = unknown> = (payload: T) => Promise<void>;

const queue: Job[] = [];
const deadLetter: Job[] = [];
const handlers = new Map<JobType, Handler>();
let running = false;

import crypto from 'crypto';

/** Register a handler for a job type. */
export function registerHandler<T>(type: JobType, handler: Handler<T>): void {
  handlers.set(type, handler as Handler);
}

/** Enqueue a new job. */
export function enqueue<T>(type: JobType, payload: T, maxAttempts = 3): string {
  const id = crypto.randomUUID();
  queue.push({
    id,
    type,
    payload,
    attempts: 0,
    maxAttempts,
    createdAt: Date.now(),
    nextRunAt: Date.now(),
  });
  if (!running) void processQueue();
  return id;
}

/** Process jobs in the queue (called automatically). */
async function processQueue(): Promise<void> {
  running = true;
  while (queue.length > 0) {
    const now = Date.now();
    const index = queue.findIndex((j) => j.nextRunAt <= now);
    if (index === -1) {
      // All jobs are scheduled for the future — wait a bit
      await sleep(1000);
      continue;
    }

    const job = queue.splice(index, 1)[0];
    const handler = handlers.get(job.type);

    if (!handler) {
      console.warn(`[job-queue] No handler for job type "${job.type}"`);
      deadLetter.push({ ...job, error: 'No handler registered' });
      continue;
    }

    job.attempts++;
    try {
      await handler(job.payload);
    } catch (err) {
      job.error = err instanceof Error ? err.message : String(err);
      console.error(`[job-queue] Job ${job.id} (${job.type}) failed: ${job.error}`);

      if (job.attempts < job.maxAttempts) {
        // Exponential backoff: 2^attempt seconds
        job.nextRunAt = Date.now() + Math.pow(2, job.attempts) * 1000;
        queue.push(job);
      } else {
        console.error(`[job-queue] Job ${job.id} moved to dead-letter after ${job.attempts} attempts`);
        deadLetter.push(job);
      }
    }
  }
  running = false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns all dead-letter jobs for inspection. */
export function getDeadLetterJobs(): Job[] {
  return [...deadLetter];
}
