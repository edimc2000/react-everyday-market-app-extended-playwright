import { test, expect } from '@playwright/test';

import { Variables } from './test_var_data/vars_test_data.ts';
import { CATEGORIES } from './test_var_data/category.ts';
import { HomePOM } from './POM/HomePOM.ts';

test.describe('GUI Tests', () => {
  const env = new Variables
  // const categories: string[] = CATEGORIES //.map(category => category.name.toLowerCase())
  let homePage: HomePOM;
  // console.log(`categories: ${categories}`)


  test.beforeEach(async ({ page }) => {
    homePage = new HomePOM(page);
    await page.goto(env.baseURL);
  })

  test('TS001: Validate Page Title', async ({ page }) => {
    expect(await page.title()).toBe(env.headerTitle)
  });

  test('TS002: Validate Header', async ({ page }) => {
    await expect(homePage.headerLogo).toBeVisible();
    await expect(homePage.headerLogo).toHaveText(env.headerTitle)


  });

  test('TS003: Validate Categories', async ({ page }) => {
    for (let index = 0; index < CATEGORIES.length; index++) {
      const categoryTitle = await homePage.categoryTitle.nth(index).textContent();
      expect.soft(categoryTitle?.toLowerCase()).toBe(`${CATEGORIES[index].name.toLowerCase()}`)
      await expect.soft(homePage.categoryImage.nth(index)).toBeVisible()
      await expect.soft(homePage.categoryLongDescription.nth(index)).toHaveText(CATEGORIES[index].longDescription)
    }

  })






})

