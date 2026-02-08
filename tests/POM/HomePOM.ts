import { Page, Locator } from '@playwright/test';

export class SpaPOM {
    readonly page: Page
    readonly headerLogo: Locator
    readonly categoryTitle: Locator
    readonly categoryImage: Locator
    readonly categoryLongDescription: Locator
    readonly brandLogo: Locator
    readonly addToCart: Locator
    readonly cartCounterId: Locator
    readonly shoppingBag: Locator
    readonly shopUpc: Locator
    readonly containerOrderDetails: Locator
    readonly quantity: Locator
    readonly cartUpc: Locator
    readonly priceContainer: Locator
    readonly unitPrice: Locator
    readonly subToTal: Locator

    // Add your locators here
    // Example: readonly headerTitle: Locator;

    constructor(page: Page) {
        this.page = page;
        this.headerLogo = this.page.getByTestId('header-logo')

        this.categoryTitle = this.page.locator('.category-title')
        this.categoryImage = this.page.locator('.category-image')
        this.categoryLongDescription = this.page.locator('.category-longdesc')

        this.brandLogo = this.page.locator('.brand-logo')
        this.addToCart = this.page.locator('.add-to-cart')

        // shop 
        this.cartCounterId = this.page.locator('#cart-counter')
        this.shoppingBag = this.page.getByTestId('cart-link')
        this.shopUpc = this.page.locator('.upc')
        this.priceContainer = this.page.locator('.price-container')

        //cart
        this.containerOrderDetails = this.page.locator('.order-details-container')
        this.quantity = this.page.locator('.qtty')
        this.cartUpc = this.page.locator('.cart-upc')
        this.unitPrice = this.page.locator('.price-container.cart-price.unit-price')
        this.subToTal = this.page.locator('.price-container.cart-price.subtotal')




    }

    async goto() {
        await this.page.goto('http://localhost:5173/')
    }

    // Add your page methods here
    // Example:
    // async getHeaderText(): Promise<string> {
    //   return await this.headerTitle.textContent() || '';
    // }
}
