import { describe, it, expect, vi } from 'vitest';
import { delay } from '@/utils/delay';

describe('delay', () => {
  it('在指定毫秒数后 resolve', async () => {
    vi.useFakeTimers();
    let resolved = false;
    const promise = delay(500).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(499);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await promise;
    expect(resolved).toBe(true);
    vi.useRealTimers();
  });
});
