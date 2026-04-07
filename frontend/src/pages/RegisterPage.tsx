import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../api/queries';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../api/auth';
import { Sun, Moon, Languages, Loader2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailTaken, setIsEmailTaken] = useState(false);
  
  const navigate = useNavigate();
  const { register: registerUser, isRegistering, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'pt' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (name === 'username') {
      setIsUsernameTaken(false);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.username;
        return newErrors;
      });
    }

    if (name === 'email') {
      setIsEmailTaken(false);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const checkUsernameAvailability = async () => {
    if (!formData.username || formData.username.length < 3) return;

    setIsCheckingUsername(true);
    try {
      const { exists } = await authApi.checkUsername(formData.username);
      setIsUsernameTaken(exists);
      if (exists) {
        setErrors(prev => ({ ...prev, username: t('auth.usernameTaken') }));
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const checkEmailAvailability = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) return;

    setIsCheckingEmail(true);
    try {
      const { exists } = await authApi.checkEmail(formData.email);
      setIsEmailTaken(exists);
      if (exists) {
        setErrors(prev => ({ ...prev, email: t('auth.emailTaken') }));
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-z_]+$/; // Updated regex for lowercase and underscores

    if (!formData.name) {
      newErrors.name = t('auth.nameRequired');
    } else if (formData.name.length < 2) {
      newErrors.name = t('auth.nameTooShort');
    }

    if (!formData.username) {
      newErrors.username = t('auth.usernameRequired');
    } else if (formData.username.length < 3) {
      newErrors.username = t('auth.usernameTooShort');
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username = t('auth.invalidUsernameFormat'); // New error message key
    } else if (isUsernameTaken) {
      newErrors.username = t('auth.usernameTaken');
    }

    if (!formData.email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('auth.invalidEmail');
    } else if (isEmailTaken) {
      newErrors.email = t('auth.emailTaken');
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('auth.passwordTooShort');
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isCheckingUsername || isUsernameTaken || isCheckingEmail || isEmailTaken) return;

    try {
      await registerUser({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ general: t('auth.registrationFailed') });
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

      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md my-8 transition-colors duration-200">
        <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">{t('auth.register')}</h2>

        {errors.general && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded transition-colors">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.fullName')}</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.username')}</label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                onBlur={checkUsernameAvailability}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              />
              {isCheckingUsername && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {errors.username && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.email')}</label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={checkEmailAvailability}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              />
              {isCheckingEmail && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.password')}</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('auth.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
          </div>
          <button
            type="submit"
            disabled={isRegistering || isCheckingUsername || isUsernameTaken || isCheckingEmail || isEmailTaken}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isRegistering ? t('common.loading') : t('auth.register')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
};
