import type { Browser, Locator, Page } from 'playwright';

const SOCCARENA_URL = 'https://shop.olympiapark.de/de/match-court-30x15-meter-montag-bis-freitag-ab-50';

const navigateToPage = async (browser: Browser): Promise<Page> => {
  const page = await browser.newPage();
  await page.goto(SOCCARENA_URL);
  await page.waitForLoadState();
  return page;
};

const acceptCookies = async (page: Page) => {
  const cookiesButton = page.locator('button', { hasText: 'Use necessary cookies only' });
  if ((await cookiesButton.count()) > 0) {
    await cookiesButton.click();
  }
};

const getFreeSlotsLocator = async (page: Page) => {
  return page.getByRole('gridcell').filter({ hasText: 'frei' });
};

const checkForFreeSlots = async (elemLocator: Locator): Promise<boolean> => {
  const freeSlotsCount = await elemLocator.count();
  console.log('Checking for free slots', { elemLocator, freeSlots: freeSlotsCount });
  return freeSlotsCount > 0;
};

const printFreeSlots = async ($freeSlotsLocator: Locator) => {
  const $freeSlots = await $freeSlotsLocator.all();
  const freeSlots = await Promise.all(
    $freeSlots.map(async (el) => {
      return {
        text: (await el.textContent())?.trim(),
      };
    }),
  );
  console.log({ freeSlots });
};

const checkNextDay = async (page: Page) => {
  for (let index = 0; index < 14; index++) {
    const nextDayButton = await page.locator('.week-calendar-item:not(.current):not(.selected):not(.not-available)').nth(index);
    const nextDayButtonText = await nextDayButton.textContent();

    if (!Number.isNaN(Number(nextDayButtonText))) {
      console.log('clicking next day button', nextDayButtonText);
      await nextDayButton.click();
      break;
    }
  }
  await page.waitForLoadState();
};

export async function automate(browser: Browser, retryCount: number = 5) {
  // navigate via url bar
  const page = await navigateToPage(browser);

  // accept cookies
  await acceptCookies(page);

  // check for free slots
  const $freeSlotsLocator = await getFreeSlotsLocator(page);

  for (let i = 0; i < retryCount; i++) {
    if (await checkForFreeSlots($freeSlotsLocator)) {
      console.log(`Found free slots - attempt ${i + 1}`);
      await printFreeSlots($freeSlotsLocator);
      break;
    } else {
      console.log(`No free slots found - attempt ${i + 1}`);
      // await page.pause();
      await checkNextDay(page);
    }
  }

  await page.waitForLoadState();
  // await page.pause();

  return 'End of scraping';
}
