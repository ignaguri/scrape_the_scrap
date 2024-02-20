import * as pw from 'playwright';
import type { Browser } from 'playwright';

type AutomationFn<T> = (b: Browser) => Promise<T>;

/**
 * Manages the browser lifecycle for an automation function.
 *
 * We split the runner from the agents so that we can easily test them with `@playwright/test`. This abstraction is also a great starting point for managing config and parallelization.
 */
export async function runAutomation<T>(fn: AutomationFn<T>): Promise<T> {
  const isDev = process.env.NODE_ENV !== 'production';

  const browser = await pw.chromium.launch({
    devtools: isDev,
    headless: !isDev,
  });

  const result = await fn(browser);
  await browser.close();

  return result;
}
