import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeferredContent } from "./deferred-content";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("optional code activation", () => {
  it("does not initialize a tool until it approaches the viewport", () => {
    let notify: IntersectionObserverCallback | undefined;
    const disconnect = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe() {} disconnect = disconnect;
    });
    const initialize = vi.fn();
    function Tool() { initialize(); return null; }
    render(<DeferredContent><Tool /></DeferredContent>);
    expect(initialize).not.toHaveBeenCalled();
    act(() => notify?.([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(initialize).not.toHaveBeenCalled();
    act(() => notify?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalled();
  });

  it("waits for idle time before initializing optional popup code", () => {
    vi.useFakeTimers();
    let idleCallback: IdleRequestCallback | undefined;
    vi.stubGlobal("requestIdleCallback", vi.fn(callback => { idleCallback = callback; return 1; }));
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    const initialize = vi.fn();
    function Tool() { initialize(); return null; }
    render(<DeferredContent mode="idle"><Tool /></DeferredContent>);
    expect(initialize).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1500));
    expect(initialize).not.toHaveBeenCalled();
    act(() => idleCallback?.({ didTimeout: false, timeRemaining: () => 10 }));
    expect(initialize).toHaveBeenCalledTimes(1);
  });
});