import { test, expect } from '@playwright/test';

import { Variables } from './test_var_data/vars_test_data.ts';
import { CATEGORIES } from './test_var_data/category.ts';
import { SpaPOM } from './POM/HomePOM.ts';
import { count } from 'node:console';

test.describe('End to end', () => {
    const env = new Variables
    let locators: SpaPOM;

    test.beforeEach(async ({ page }) => {
        locators = new SpaPOM(page);
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
            // console.log(`click count : ${clickCount[i]}`)
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

            let subTotal = (clickCount[i] * Number(priceArr[i])).toFixed(2)
            // console.log (`subtotal ${subTotal}`)
            await expect.soft(locators.unitPrice.nth(i)).toContainText(`${priceArr[i]}`)

            await expect.soft(locators.subToTal.nth(i)).toContainText(`${subTotal}`)
        }
        // await page.waitForTimeout(3000)
    });

    test('TS002: Add products from each category and assert the cart counter and cart page', async ({ page }) => {
        let clickCount = [1]
        let categoryCount = 5
        let cartTotal = clickCount.reduce((acc, curr) => curr + acc)
        const addToCartCount = 4
        const upcArr = []
        const priceArr = []


        for (let i = 0; i < categoryCount; i++) {
            console.log(i)
            await locators.categoryImage.nth(i).click()
            await locators.brandLogo.nth(0).click()
            await page.waitForSelector('.add-to-cart')
            await locators.addToCart.nth(0).click({ delay: 50 })
            upcArr.push(await locators.shopUpc.nth(0).textContent())
            priceArr.push((await locators.priceContainer.nth(0).textContent())?.slice(1))
            await locators.headerLogo.click()

            if (i == categoryCount - 1) { await locators.shoppingBag.click() }

        }

        // assert the  number of items in the cart 
        await expect.soft(locators.cartCounterId).toHaveText(categoryCount.toString())

        for (let i = 0; i < upcArr.length; i++) {
            await expect.soft(locators.quantity.nth(i)).toHaveText(`1`)
            await expect.soft(locators.cartUpc.nth(i)).toHaveText(`${upcArr[i]}`)

            let subTotal = (Number(priceArr[i])).toFixed(2)

            //assert price and subtotal column 
            await expect.soft(locators.unitPrice.nth(i)).toContainText(`${priceArr[i]}`)
            await expect.soft(locators.subToTal.nth(i)).toContainText(`${subTotal}`)
        }
        await page.waitForTimeout(3000)
    });

    test('TS003: Multi-window test with localStorage - Add products in window 1 and view in window 2', async ({ browser }) => {
        let clickCount = [3, 2, 1]
        let cartTotal = clickCount.reduce((acc, curr) => curr + acc)
        const addToCartCount = 3
        const upcArr = []
        const priceArr = []

        // Create browser context with shared localStorage
        const context = await browser.newContext({
            storageState: undefined // Start with clean state
        })
        
        const page1 = await context.newPage()
        const page2 = await context.newPage()

        // Initialize single POM instance - will update page reference as needed
        let locators = new SpaPOM(page1)

        try {
            // === WINDOW 1: Add products to cart ===
            console.log('Window 1: Adding products to cart')
            await page1.goto(env.baseURL)
            
            await locators.categoryImage.nth(0).click()
            await locators.brandLogo.nth(0).click()
            await page1.waitForSelector('.add-to-cart')

            // Add products to cart - let the application handle localStorage naturally
            for (let i = 0; i < clickCount.length; i++) {
                await locators.addToCart.nth(i).click({ delay: 50, clickCount: clickCount[i] })
                upcArr.push(await locators.shopUpc.nth(i).textContent())
                priceArr.push((await locators.priceContainer.nth(i).textContent())?.slice(1))
            }

            // Assert cart counter in window 1
            await expect.soft(locators.cartCounterId).toHaveText(cartTotal.toString())
            console.log(`Window 1: Cart counter shows ${cartTotal} items`)

            // Verify cart page in window 1
            await locators.shoppingBag.click()
            await page1.waitForSelector('.order-details-container')
            expect.soft(await locators.containerOrderDetails.count()).toEqual(addToCartCount + 1)

            for (let i = 0; i < addToCartCount; i++) {
                await expect.soft(locators.quantity.nth(i)).toHaveText(`${clickCount[i]}`)
                await expect.soft(locators.cartUpc.nth(i)).toHaveText(`${upcArr[i]}`)
                let subTotal = (clickCount[i] * Number(priceArr[i])).toFixed(2)
                await expect.soft(locators.unitPrice.nth(i)).toContainText(`${priceArr[i]}`)
                await expect.soft(locators.subToTal.nth(i)).toContainText(`${subTotal}`)
            }
            console.log('Window 1: Cart page verification completed')

            // === WINDOW 2: Verify cart persists using same localStorage ===
            console.log('Window 2: Verifying cart persistence through application localStorage')
            
            // Update POM to work with page2
            locators = new SpaPOM(page2)
            await page2.goto(env.baseURL)
            
            // Check if cart counter persists in window 2
            await page2.waitForLoadState('domcontentloaded')
            
            // Wait a moment for any cart data to load from localStorage
            await page2.waitForTimeout(1000)
            
            // Verify cart counter shows the same total in window 2
            await expect.soft(locators.cartCounterId).toHaveText(cartTotal.toString())
            console.log(`Window 2: Cart counter shows ${cartTotal} items (persisted from window 1)`)

            // Navigate to cart page in window 2 and verify all items are there
            await locators.shoppingBag.click()
            await page2.waitForSelector('.order-details-container')
            
            // Verify same number of items in cart
            expect.soft(await locators.containerOrderDetails.count()).toEqual(addToCartCount + 1)

            // Verify each cart item persisted correctly
            for (let i = 0; i < addToCartCount; i++) {
                await expect.soft(locators.quantity.nth(i)).toHaveText(`${clickCount[i]}`)
                await expect.soft(locators.cartUpc.nth(i)).toHaveText(`${upcArr[i]}`)
                
                let subTotal = (clickCount[i] * Number(priceArr[i])).toFixed(2)
                await expect.soft(locators.unitPrice.nth(i)).toContainText(`${priceArr[i]}`)
                await expect.soft(locators.subToTal.nth(i)).toContainText(`${subTotal}`)
                
                console.log(`Window 2: Item ${i+1} verified - UPC: ${upcArr[i]}, Qty: ${clickCount[i]}, Price: $${priceArr[i]}`)
            }

            // === Test that both windows share the same cart localStorage ===
            // Add one more item in window 2
            await locators.headerLogo.click() // Go back to home
            await locators.categoryImage.nth(1).click() // Different category 
            await locators.brandLogo.nth(0).click()
            await page2.waitForSelector('.add-to-cart')
            
            // Add 1 item from window 2
            await locators.addToCart.nth(0).click({ delay: 50, clickCount: 1 })
            const newUpc = await locators.shopUpc.nth(0).textContent()
            const newPrice = (await locators.priceContainer.nth(0).textContent())?.slice(1)
            
            // Verify cart counter updated
            const newTotal = cartTotal + 1
            await expect.soft(locators.cartCounterId).toHaveText(newTotal.toString())
            console.log(`Window 2: Added 1 item, cart now shows ${newTotal}`)

            // === Verify the change is reflected in window 1 (same localStorage) ===
            // Switch POM back to work with page1
            locators = new SpaPOM(page1)
            await page1.goto(env.baseURL) // Refresh window 1 to load updated cart
            await page1.waitForLoadState('domcontentloaded')
            await page1.waitForTimeout(1000) // Allow cart to load from localStorage
            
            // Window 1 should now show the updated cart count
            await expect.soft(locators.cartCounterId).toHaveText(newTotal.toString())
            console.log(`Window 1: Cart counter updated to ${newTotal} (reflecting window 2 changes)`)

            // Verify cart page in window 1 now contains the new item
            await locators.shoppingBag.click()
            await page1.waitForSelector('.order-details-container')
            
            // Should now have one more item (4 total)
            expect.soft(await locators.containerOrderDetails.count()).toEqual(addToCartCount + 2)
            console.log('Window 1: Verified cart now contains item added from window 2')

            console.log('TS003: Multi-window localStorage test completed successfully - Both windows share same cart storage')
            
        } finally {
            // Clean up context
            await context.close()
        }
    });

});




