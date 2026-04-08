import pytest
import uuid
from pages import LoginPage, RegisterPage, DashboardPage
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@pytest.mark.e2e
def test_user_flow(driver, base_url):
    # Generate unique credentials
    # Project validation rules: lowercase letters and underscores only
    unique_id = "".join(filter(str.isalpha, str(uuid.uuid4()))).lower()[:8]
    username = f"user_{unique_id}"
    email = f"user_{unique_id}@example.com"
    password = "password123"

    # 1. Register a new user
    register_page = RegisterPage(driver, base_url)
    register_page.navigate()
    register_page.register("John Doe", username, email, password)
    
    # Wait for success toast to ensure registration is processed
    register_page.wait_for_success()
    
    # 2. Login with valid credentials
    login_page = LoginPage(driver, base_url)
    # The app should navigate to /login upon successful registration
    WebDriverWait(driver, 20).until(EC.url_contains("/login"))
    
    # Ensure the login page is ready
    login_page.find_element(login_page.LOGIN_BUTTON)
    login_page.login(email, password)
    
    # 3. Create a task
    dashboard_page = DashboardPage(driver, base_url)
    WebDriverWait(driver, 10).until(EC.url_to_be(f"{base_url}/"))
    dashboard_page.create_task("Complete project", "Finish all steps of the test")
    
    # 4. Verify task exists
    task_list = dashboard_page.find_element(dashboard_page.TASK_LIST)
    assert "Complete project" in task_list.text
    
    # 5. Toggle task completion
    try:
        dashboard_page.toggle_task()
    except Exception as e:
        print(f"Failed to toggle task: {e}")
        # Log the page source for debugging
        print(driver.page_source[:1000])
        raise

    # 6. Logout
    dashboard_page.logout()
    WebDriverWait(driver, 10).until(EC.url_contains("/login"))
