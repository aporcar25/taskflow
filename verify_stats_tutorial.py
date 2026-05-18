import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async_playwright_instance = await async_playwright().start()
    browser = await async_playwright_instance.chromium.launch(headless=True)
    page = await browser.new_page()

    # Mock login and tutorial state
    await page.goto("http://localhost:3000/login")
    await page.fill('input[type="email"]', 'jules@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.wait_for_url("**/dashboard")

    # Go to stats page
    await page.goto("http://localhost:3000/stats")

    # Wait for tutorial to appear
    await page.wait_for_selector('.ring-black\/60')

    # Step 1: Header
    await page.screenshot(path="tutorial_step_1.png")
    print("Step 1 screenshot taken")

    # Click Next
    await page.click('button:has-text("Siguiente")')
    await asyncio.sleep(1)

    # Step 2: Productivity Chart
    await page.screenshot(path="tutorial_step_2.png")
    print("Step 2 screenshot taken")

    # Click Next
    await page.click('button:has-text("Siguiente")')
    await asyncio.sleep(1)

    # Step 3: Calendar
    await page.screenshot(path="tutorial_step_3.png")
    print("Step 3 screenshot taken")

    await browser.close()
    await async_playwright_instance.stop()

if __name__ == "__main__":
    # Start the dev server in the background
    # We assume it might already be running or we start it
    # For now, let's just run the script assuming server is handled or I start it here
    asyncio.run(run())
