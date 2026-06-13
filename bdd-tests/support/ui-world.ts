import { setWorldConstructor, World, IWorldOptions, BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';

export class CustomWorld extends World {
  page!: Page;
  
  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);

let browser: Browser;

BeforeAll(async () => {
  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
});

AfterAll(async () => {
  if (browser) {
    await browser.close();
  }
});

Before(async function (this: CustomWorld) {
  this.page = await browser.newPage();
  await this.page.setViewportSize({ width: 1280, height: 720 });
});

After(async function (this: CustomWorld) {
  if (this.page) {
    await this.page.close();
  }
});
