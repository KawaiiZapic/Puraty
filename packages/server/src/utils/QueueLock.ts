export class QueueLock {
  private maxConcurrent: number;
  private currentConcurrent: number;
  private queue: (() => void)[];

    constructor(maxConcurrent: number) {
        this.maxConcurrent = maxConcurrent;
        this.currentConcurrent = 0;
        this.queue = [];
    }

    async acquire() {
        const lock = new Promise<() => void>((resolve) => {
            const attemptAcquire = () => {
                if (this.currentConcurrent < this.maxConcurrent) {
                    this.currentConcurrent++;
                    resolve(() => this.release());
                } else {
                    this.queue.push(attemptAcquire);
                }
            };
            attemptAcquire();
        });
        return lock;
    }

    release() {
        this.currentConcurrent--;
        if (this.queue.length > 0) {
            const nextAcquire = this.queue.shift()!;
            nextAcquire();
        }
    }
}