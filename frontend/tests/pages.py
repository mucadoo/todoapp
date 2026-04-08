from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url

    def find_element(self, locator, timeout=10):
        return WebDriverWait(self.driver, timeout).until(EC.visibility_of_element_located(locator))

    def click(self, locator, timeout=10):
        def perform_click(driver):
            try:
                element = WebDriverWait(driver, 5).until(EC.element_to_be_clickable(locator))
                element.click()
                return True
            except Exception:
                return False
        
        WebDriverWait(self.driver, timeout).until(perform_click)

    def send_keys(self, locator, text, timeout=10):
        def fill_field(driver):
            try:
                element = WebDriverWait(driver, 5).until(EC.visibility_of_element_located(locator))
                element.clear()
                element.send_keys(text)
                # Verify value was entered (robustness against re-renders clearing the field)
                return element.get_attribute("value") == text
            except Exception:
                return False
        
        WebDriverWait(self.driver, timeout).until(fill_field)

    SUCCESS_TOAST = (By.XPATH, "//div[contains(@class, 'bg-white') and contains(@class, 'border-green-200')]")

    def wait_for_success(self, timeout=10):
        return WebDriverWait(self.driver, timeout).until(EC.presence_of_element_located(self.SUCCESS_TOAST))

class LoginPage(BasePage):
    LOGIN_IDENTIFIER_INPUT = (By.ID, "loginIdentifier")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.XPATH, "//button[@type='submit' and (contains(., 'Login') or contains(., 'Entrar'))]")
    REGISTER_LINK = (By.XPATH, "//a[contains(., 'Register') or contains(., 'Cadastrar') or contains(@href, '/register')]")

    def navigate(self):
        self.driver.get(f"{self.base_url}/login")

    def login(self, identifier, password):
        self.send_keys(self.LOGIN_IDENTIFIER_INPUT, identifier)
        self.send_keys(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)

class RegisterPage(BasePage):
    NAME_INPUT = (By.ID, "name")
    USERNAME_INPUT = (By.ID, "username")
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    CONFIRM_PASSWORD_INPUT = (By.ID, "confirmPassword")
    REGISTER_BUTTON = (By.XPATH, "//button[@type='submit' and (contains(., 'Register') or contains(., 'Cadastrar'))]")

    def navigate(self):
        self.driver.get(f"{self.base_url}/register")

    def register(self, name, username, email, password):
        self.send_keys(self.NAME_INPUT, name)
        self.send_keys(self.USERNAME_INPUT, username)
        # Ensure the async username check finishes if any
        # Then fill remaining fields
        self.send_keys(self.EMAIL_INPUT, email)
        self.send_keys(self.PASSWORD_INPUT, password)
        self.send_keys(self.CONFIRM_PASSWORD_INPUT, password)
        # Re-verify the button is not disabled by validation
        self.click(self.REGISTER_BUTTON)

class DashboardPage(BasePage):
    NEW_TASK_BUTTON = (By.XPATH, "//button[contains(., 'New Task') or contains(., 'Nova Tarefa')]")
    LOGOUT_BUTTON = (By.XPATH, "//button[contains(., 'Logout') or contains(., 'Sair')]")
    TASK_TITLE_INPUT = (By.NAME, "title")
    TASK_DESC_INPUT = (By.NAME, "description")
    TASK_SUBMIT_BUTTON = (By.XPATH, "//button[@type='submit' and (contains(., 'Create') or contains(., 'Criar') or contains(., 'Save') or contains(., 'Salvar'))]")
    TASK_LIST = (By.CSS_SELECTOR, "div.grid")
    TOGGLE_BUTTON = (By.XPATH, "//div[contains(@class, 'grid')]//button[contains(@class, 'rounded-full')]")
    COMPLETED_TASK = (By.XPATH, "//div[contains(@class, 'opacity-75')]")
    
    def navigate(self):
        self.driver.get(f"{self.base_url}/")

    def create_task(self, title, description):
        self.click(self.NEW_TASK_BUTTON)
        self.send_keys(self.TASK_TITLE_INPUT, title)
        self.send_keys(self.TASK_DESC_INPUT, description)
        self.click(self.TASK_SUBMIT_BUTTON)

    def toggle_task(self):
        # The toggle action triggers a React Query mutation and optimistic update,
        # which can cause the task component to re-render.
        def click_and_wait_for_completion(driver):
            try:
                # Always try to find a fresh element
                toggle = driver.find_element(*self.TOGGLE_BUTTON)
                toggle.click()
                # If we successfully clicked and then see the completed state, we're done
                return driver.find_element(*self.COMPLETED_TASK)
            except Exception:
                return False

        WebDriverWait(self.driver, 10).until(click_and_wait_for_completion)

    def logout(self):
        self.click(self.LOGOUT_BUTTON)
