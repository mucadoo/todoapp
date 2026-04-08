import pytest
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

@pytest.fixture(scope="function")
def driver():
    chrome_options = Options()
    
    # Check if a custom binary location is provided (useful for WSL/local run)
    binary_location = os.environ.get("CHROME_BINARY_PATH")
    if binary_location:
        chrome_options.binary_location = binary_location
        
    headless = os.environ.get("CHROME_HEADLESS", "true").lower() == "true"
    if headless:
        chrome_options.add_argument("--headless")
        
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--remote-debugging-port=9222")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Use pre-installed chromium-driver if it exists (common in Docker)
    if os.path.exists("/usr/bin/chromedriver"):
        service = Service("/usr/bin/chromedriver")
        driver = webdriver.Chrome(service=service, options=chrome_options)
    else:
        # Fallback to webdriver-manager
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        
    driver.implicitly_wait(10)
    yield driver
    driver.quit()

@pytest.fixture
def base_url():
    return "http://localhost:3000"
