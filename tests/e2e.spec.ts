import { test, expect } from '@playwright/test';

import { Variables } from './test_var_data/vars_test_data.ts';
import { CATEGORIES } from './test_var_data/category.ts';
import { HomePOM } from './POM/HomePOM.ts';
import { count } from 'node:console';

test.describe('End to end', () => {
    const env = new Variables
    let locators: HomePOM;

    test.beforeEach(async ({ page }) => {
        locators = new HomePOM(page);
        await page.goto(env.baseURL);
    })

    test('TS001: Add a product and assert the cart counter and cart page', async ({ page }) => {
        let clickCount = [5, 4, 3, 2]
        let cartTotal = clickCount.reduce((acc, curr) => curr + acc)
        const addToCartCount = 4
        const upcArr = []
        const priceArr = []

        await locators.categoryImage.nth(0).click()
        await locators.brandLogo.nth(0).click()

        await page.waitForSelector('.add-to-cart')

        expect.soft(await locators.addToCart.count()).toEqual(addToCartCount)

        for (let i = 0; i < clickCount.length; i++) {
            console.log(`click count : ${clickCount[i]}`)
            await locators.addToCart.nth(i).click({ delay: 50, clickCount: clickCount[i] })
            upcArr.push(await locators.shopUpc.nth(i).textContent())
            priceArr.push((await locators.priceContainer.nth(i).textContent())?.slice(1))
        }

        await expect.soft(locators.cartCounterId).toHaveText(cartTotal.toString())
        await locators.shoppingBag.click()

        await page.waitForSelector('.order-details-container')
        expect.soft(await locators.containerOrderDetails.count()).toEqual(addToCartCount + 1)

        for (let i = 0; i < upcArr.length; i++) {
            await expect.soft(locators.quantity.nth(i)).toHaveText(`${clickCount[i]}`)
            await expect.soft(locators.cartUpc.nth(i)).toHaveText(`${upcArr[i]}`)
            
            let subTotal = (clickCount[i] * Number( priceArr[i])).toFixed(2)
            console.log (`subtotal ${subTotal}`)
            await expect.soft(locators.unitPrice.nth(i)).toContainText(`${priceArr[i]}`)

            await expect.soft(locators.subToTal.nth(i)).toContainText(`${subTotal}`)
        }
        await page.waitForTimeout(3000)
    });

})




