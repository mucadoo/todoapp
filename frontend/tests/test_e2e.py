import pytest
import uuid
from pages import LoginPage, RegisterPage, DashboardPage
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@pytest.mark.e2e
def test_user_flow(driver, base_url):
    # Generate unique credentials
    unique_id = str(uuid.uuid4())[:8]
    username = f"user_{unique_id}"
    email = f"user_{unique_id}@example.com"
    password = "password123"

    # 1. Register a new user
    register_page = RegisterPage(driver, base_url)
    register_page.navigate()
    # Wait for the page to load by checking for the register button
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable(register_page.REGISTER_BUTTON))
    register_page.register("John Doe", username, email, password)
    
    # 2. Login with valid credentials
    login_page = LoginPage(driver, base_url)
    # The app should navigate to /login upon successful registration
    try:
        WebDriverWait(driver, 20).until(EC.url_contains("/login"))
    except Exception:
        # If timeout, print current URL for debugging
        print(f"Current URL after registration attempt: {driver.current_url}")
        # Check for error messages on page
        try:
            error_msg = driver.find_element(By.CSS_SELECTOR, "div[class*='bg-red-100']").text
            print(f"Error message on page: {error_msg}")
        except:
            pass
        raise

    # Also wait for the login button to be clickable to ensure the page is fully ready
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable(login_page.LOGIN_BUTTON))
    login_page.login(email, password)
    
    # 3. Create a task
    dashboard_page = DashboardPage(driver, base_url)
    WebDriverWait(driver, 10).until(EC.url_to_be(f"{base_url}/"))
    dashboard_page.create_task("Complete project", "Finish all steps of the test")
    
    # 4. Verify task exists
    task_list = dashboard_page.find_element(dashboard_page.TASK_LIST)
    assert "Complete project" in task_list.text
    
    # 5. Toggle task completion
    # Find the toggle button (checkbox-like) inside the task item
    try:
        # Use a more specific selector for the completion button
        # The button is likely the first button in the task card or has a specific class
        toggle_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'grid')]//button[contains(@class, 'rounded-full')]"))
        )
        toggle_button.click()
        # Verify it looks completed (opacity change)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'opacity-75')]")))
    except Exception as e:
        print(f"Failed to toggle task: {e}")
        # Log the page source for debugging
        print(driver.page_source[:1000])
        raise

    # 6. Logout
    dashboard_page.logout()
    WebDriverWait(driver, 10).until(EC.url_contains("/login"))
