import pytest
from pages import LoginPage, RegisterPage, DashboardPage
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@pytest.mark.e2e
def test_user_flow(driver, base_url):
    # 1. Register a new user
    register_page = RegisterPage(driver, base_url)
    register_page.navigate()
    register_page.register("John Doe", "john@example.com", "password123")
    
    # 2. Login with valid credentials
    login_page = LoginPage(driver, base_url)
    WebDriverWait(driver, 10).until(EC.url_contains("/login"))
    login_page.login("john@example.com", "password123")
    
    # 3. Create a task
    dashboard_page = DashboardPage(driver, base_url)
    WebDriverWait(driver, 10).until(EC.url_to_be(f"{base_url}/"))
    dashboard_page.create_task("Complete project", "Finish all steps of the test")
    
    # 4. Verify task exists
    task_list = dashboard_page.find_element(dashboard_page.TASK_LIST)
    assert "Complete project" in task_list.text
    
    # 5. Toggle task completion
    toggle_button = driver.find_element(By.CSS_SELECTOR, "button[class*='focus:outline-none']")
    toggle_button.click()
    # Check if opacity changes or class changes (optimistic update)
    WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, "div[class*='opacity-75']")))
    
    # 6. Filter tasks
    status_filter = driver.find_element(By.CSS_SELECTOR, "select[value='active']") # default is active? no, all
    # find by text content if value is not reliable
    # Let's use simpler selector
    selects = driver.find_elements(By.TAG_NAME, "select")
    status_select = selects[0]
    status_select.send_keys("Completed")
    
    # 7. Logout
    dashboard_page.logout()
    WebDriverWait(driver, 10).until(EC.url_contains("/login"))
