import asyncio
from playwright.async_api import async_playwright
import os
import time

async def verify_stats_enhanced():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 1600})
        page = await context.new_page()

        # Mock API responses
        await page.route("**/api/stats", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"totalTareas":30,"tareasCompletadas":20,"tareasPendientes":10,"porcentajeProductividad":66,"actividadSemanal":[{"day":"Lun","tasks":5},{"day":"Mar","tasks":8}],"habitosDetalles":[],"mejorDia":"Mar"}'
        ))

        await page.route("**/api/tasks", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='['
                 '{"_id":"1","categoria":"trabajo","prioridad":"alta","completada":true,"updatedAt":"' + time.strftime("%Y-%m-%dT%H:%M:%SZ") + '"},'
                 '{"_id":"2","categoria":"personal","prioridad":"media","completada":true,"updatedAt":"' + time.strftime("%Y-%m-%dT%H:%M:%SZ") + '"},'
                 '{"_id":"3","categoria":"salud","prioridad":"baja","completada":false,"updatedAt":"' + time.strftime("%Y-%m-%dT%H:%M:%SZ") + '"}'
                 ']'
        ))

        await page.route("**/api/habits", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"_id":"1","nombre":"Meditar","racha":5,"historial":["' + time.strftime("%Y-%m-%d") + '"]}]'
        ))

        # Add auth token to localStorage
        await page.add_init_script("""
            localStorage.setItem('taskflow_token', 'mock_token');
            localStorage.setItem('taskflow_user', JSON.stringify({id: '1', nombre: 'Jules', email: 'jules@example.com'}));
        """)

        print("Starting dev server...")
        # Start the dev server in the background
        process = await asyncio.create_subprocess_exec(
            "npm", "run", "dev",
            cwd="web",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        try:
            # Wait for server to be ready
            print("Waiting for server to be ready...")
            url = "http://localhost:3000/stats"
            for _ in range(60):
                try:
                    await page.goto(url)
                    if page.url == url:
                        break
                except:
                    pass
                await asyncio.sleep(1)
            else:
                print("Server failed to start")
                return

            print("Page loaded, waiting for content...")
            await page.wait_for_load_state("networkidle")
            await page.wait_for_selector("h1", timeout=10000)

            # Wait a bit more for client-side hydration and useMemo effects
            await asyncio.sleep(5)

            # Take screenshot
            os.makedirs("verification/screenshots", exist_ok=True)
            screenshot_path = "verification/screenshots/stats_page_enhanced_v2.png"
            await page.screenshot(path=screenshot_path, full_page=True)
            print(f"Screenshot saved to {screenshot_path}")

            # Also print some of the HTML to verify structure
            content = await page.content()
            print(f"Page title: {await page.title()}")
            print(f"Contains 'Tareas por Categoría': {'Tareas por Categoría' in content}")
            print(f"Contains 'Tareas por Prioridad': {'Tareas por Prioridad' in content}")

        finally:
            process.terminate()
            await process.wait()

if __name__ == "__main__":
    asyncio.run(verify_stats_enhanced())
