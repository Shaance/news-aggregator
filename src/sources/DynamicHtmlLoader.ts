/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
import chromium from 'chrome-aws-lambda';
import { Page } from 'puppeteer-core';

async function getCount(page: Page, elementToTrack: string) {
  await page.waitForSelector(elementToTrack);
  return (await page.$$(elementToTrack)).length;
}

async function scrollDown(page: Page) {
  await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, 6000);
}

async function elementVisible(page: Page, cssSelector: string) {
  let visible = true;
  await page
    .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
    .catch(() => {
      visible = false;
    });
  return visible;
}

async function scrollUntilLimit(page: Page, elementToTrack: string, limit: number, delay: number) {
  const count = await getCount(page, elementToTrack);
  if (count < limit) {
    await scrollDown(page);
    await page.waitFor(delay);
    await scrollUntilLimit(page, elementToTrack, limit, delay);
  }
}

async function clickUntilLimit(page: Page, elementToTrack: string, limit: number, delay: number, button: string) {
  let loadMoreVisible = await elementVisible(page, button);
  let count = await getCount(page, elementToTrack);
  while (loadMoreVisible && count < limit) {
    await page.click(button).catch(() => { });
    await page.waitFor(delay);
    loadMoreVisible = await elementVisible(page, button);
    count = await getCount(page, elementToTrack);
  }
}

/**
 * Scroll the page while monitoring count for a certain element to return fully loaded html page
 * @param url the url to fetch hmtl from
 * @param elementToTrack the element to keep track of
 * @param limit will stop scrolling when we attain the set limit number of the tracked element
 * @param loadButton if exists, will search the load button to load the limit number of articles,
 * otherwise will scroll to load page
 */
async function getFullHtml(url: string, elementToTrack: string, limit: number, loadButton?: string): Promise<string> {

  const browser = await chromium.puppeteer.launch({
    executablePath: await chromium.executablePath,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.goto(url);
    const delay = 350;

    if (loadButton) {
      await clickUntilLimit(page, elementToTrack, limit, delay, loadButton);
    } else {
      await scrollUntilLimit(page, elementToTrack, limit, delay);
    }

    const result = await page.evaluate(() => document.body.innerHTML);

    await browser.close();
    return result;
  } catch (error) {
    console.error(error);
    return Promise.resolve('');
  } finally {
    await browser.close();
  }
}

export default getFullHtml;
