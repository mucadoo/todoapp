from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url

    def find_element(self, locator):
        return WebDriverWait(self.driver, 10).until(EC.presence_of_element_located(locator))

    def click(self, locator):
        self.find_element(locator).click()

    def send_keys(self, locator, text):
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)

class LoginPage(BasePage):
    LOGIN_IDENTIFIER_INPUT = (By.ID, "loginIdentifier")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.XPATH, "//button[contains(text(), 'Login') or contains(text(), 'Entrar')]")
    REGISTER_LINK = (By.LINK_TEXT, "Register")

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
    REGISTER_BUTTON = (By.XPATH, "//button[contains(text(), 'Register') or contains(text(), 'Cadastrar')]")

    def navigate(self):
        self.driver.get(f"{self.base_url}/register")

    def register(self, name, username, email, password):
        self.send_keys(self.NAME_INPUT, name)
        self.send_keys(self.USERNAME_INPUT, username)
        self.send_keys(self.EMAIL_INPUT, email)
        self.send_keys(self.PASSWORD_INPUT, password)
        self.send_keys(self.CONFIRM_PASSWORD_INPUT, password)
        self.click(self.REGISTER_BUTTON)

class DashboardPage(BasePage):
    NEW_TASK_BUTTON = (By.XPATH, "//button[.//span[contains(text(), 'New Task')] or .//span[contains(text(), 'Nova Tarefa')]]")
    LOGOUT_BUTTON = (By.XPATH, "//button[.//span[contains(text(), 'Logout')] or .//span[contains(text(), 'Sair')]]")
    TASK_TITLE_INPUT = (By.NAME, "title")
    TASK_DESC_INPUT = (By.NAME, "description")
    TASK_SUBMIT_BUTTON = (By.XPATH, "//button[@type='submit' and (contains(text(), 'Create') or contains(text(), 'Criar'))]")
    TASK_LIST = (By.CSS_SELECTOR, "div.grid")
    
    def navigate(self):
        self.driver.get(f"{self.base_url}/")

    def create_task(self, title, description):
        self.click(self.NEW_TASK_BUTTON)
        self.send_keys(self.TASK_TITLE_INPUT, title)
        self.send_keys(self.TASK_DESC_INPUT, description)
        self.click(self.TASK_SUBMIT_BUTTON)

    def logout(self):
        self.click(self.LOGOUT_BUTTON)
