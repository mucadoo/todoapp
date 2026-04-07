import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../api/queries';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Languages } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleDarkMode } = useTheme();
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ loginIdentifier?: string; password?: string; general?: string }>({});
  
  const navigate = useNavigate();
  const { login, isLoggingIn, user } = useAuth();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'pt' : 'en';
    i18n.changeLanguage(nextLang);
  };

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors: { loginIdentifier?: string; password?: string } = {};

    if (!loginIdentifier) {
      newErrors.loginIdentifier = t('auth.emailOrUsernameRequired');
    }

    if (!password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (password.length < 8) {
      newErrors.password = t('auth.passwordTooShort');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const credentials = emailRegex.test(loginIdentifier)
        ? { email: loginIdentifier, password }
        : { username: loginIdentifier, password };

      await login(credentials);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({ general: t('auth.invalidCredentials') });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-200 relative">
      <div className="fixed top-4 right-4 flex space-x-2 z-50">
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title={i18n.language.startsWith('en') ? 'Português' : 'English'}
        >
          <Languages size={20} />
        </button>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title={isDark ? t('common.lightMode') : t('common.darkMode')}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md transition-colors duration-200">
        <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">{t('auth.login')}</h2>
        
        {errors.general && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded transition-colors">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="loginIdentifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.emailOrUsername')}</label>
            <input
              id="loginIdentifier"
              type="text"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            />
            {errors.loginIdentifier && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.loginIdentifier}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoggingIn ? t('common.loading') : t('auth.login')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
};
