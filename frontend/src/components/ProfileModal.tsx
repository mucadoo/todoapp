import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User, Mail, Save, Loader2, AtSign, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../api/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useToast } from '../hooks/useToast';
import { ChangePasswordData } from '../types/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'profile' | 'security';

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailTaken, setIsEmailTaken] = useState(false);

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name);
      setEmail(user.email);
      setUsername(user.username);
      setErrors({});
      setPasswordErrors({});
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setActiveTab('profile');
    }
  }, [user, isOpen]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; email: string }) => authApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: () => {
      showToast(t('auth.profileUpdateError'), 'error');
    },
  });

  const updateUsernameMutation = useMutation({
    mutationFn: (newUsername: string) => authApi.updateUsername(newUsername),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: Error) => {
      const axiosError = error as any;
      const message = axiosError.response?.data?.username?.[0] || t('auth.usernameUpdateError');
      showToast(message, 'error');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) => authApi.changePassword(data),
    onSuccess: () => {
      showToast(t('auth.passwordChangeSuccess'), 'success');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setPasswordErrors({});
      setActiveTab('profile');
    },
    onError: (error: Error) => {
      const axiosError = error as any;
      if (axiosError.response?.data?.old_password) {
        setPasswordErrors(prev => ({ ...prev, old_password: t('auth.wrongOldPassword') }));
      } else if (axiosError.response?.data?.new_password) {
        setPasswordErrors(prev => ({ ...prev, new_password: axiosError.response.data.new_password[0] }));
      } else if (axiosError.response?.data?.confirm_password) {
        setPasswordErrors(prev => ({ ...prev, confirm_password: axiosError.response.data.confirm_password[0] }));
      } else {
        showToast(t('auth.passwordChangeError'), 'error');
      }
    },
  });

  if (!isOpen) return null;

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') setName(value);
    if (name === 'email') setEmail(value);
    if (name === 'username') setUsername(value);

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    if (name === 'username') setIsUsernameTaken(false);
    if (name === 'email') setIsEmailTaken(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const checkUsernameAvailability = async () => {
    if (!username || username.length < 3 || username === user?.username) return;
    setIsCheckingUsername(true);
    try {
      const { exists } = await authApi.checkUsername(username, user?.id);
      setIsUsernameTaken(exists);
      if (exists) setErrors(prev => ({ ...prev, username: t('auth.usernameTaken') }));
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const checkEmailAvailability = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email === user?.email) return;
    setIsCheckingEmail(true);
    try {
      const { exists } = await authApi.checkEmail(email, user?.id);
      setIsEmailTaken(exists);
      if (exists) setErrors(prev => ({ ...prev, email: t('auth.emailTaken') }));
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-z_]+$/; // Updated regex for lowercase and underscores

    if (!name) newErrors.name = t('auth.nameRequired');
    else if (name.length < 2) newErrors.name = t('auth.nameTooShort');

    if (!username) newErrors.username = t('auth.usernameRequired');
    else if (username.length < 3) newErrors.username = t('auth.usernameTooShort');
    else if (!usernameRegex.test(username)) newErrors.username = t('auth.invalidUsernameFormat'); // New error message
    else if (isUsernameTaken) newErrors.username = t('auth.usernameTaken');

    if (!email) newErrors.email = t('auth.emailRequired');
    else if (!emailRegex.test(email)) newErrors.email = t('auth.invalidEmail');
    else if (isEmailTaken) newErrors.email = t('auth.emailTaken');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordChange = () => {
    const newErrors: Record<string, string> = {};
    if (!passwordData.old_password) newErrors.old_password = t('auth.passwordRequired');
    if (!passwordData.new_password) {
      newErrors.new_password = t('auth.passwordRequired');
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = t('auth.passwordTooShort');
    }
    if (!passwordData.confirm_password) newErrors.confirm_password = t('auth.passwordRequired');
    else if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = t('auth.passwordsDoNotMatch');
    }
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile() || isCheckingUsername || isUsernameTaken || isCheckingEmail || isEmailTaken) return;

    const promises = [];
    if (name !== user?.name || email !== user?.email) promises.push(updateProfileMutation.mutateAsync({ name, email }));
    if (username !== user?.username) promises.push(updateUsernameMutation.mutateAsync(username));

    if (promises.length > 0) {
      try {
        await Promise.all(promises);
        showToast(t('auth.profileUpdateSuccess'), 'success');
        onClose();
      } catch (error) {
        // Error handled by mutation onError
      }
    } else {
      onClose();
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordChange()) return;
    try {
      await changePasswordMutation.mutateAsync(passwordData);
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  const isProfilePending = updateProfileMutation.isPending || updateUsernameMutation.isPending || isCheckingUsername || isCheckingEmail;
  const isPasswordPending = changePasswordMutation.isPending;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <User className="mr-2" size={20} />
            {t('auth.profile')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center space-x-2 border-b-2 transition-colors ${activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
          >
            <User size={16} />
            <span>{t('auth.account')}</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center space-x-2 border-b-2 transition-colors ${activeTab === 'security'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
          >
            <ShieldCheck size={16} />
            <span>{t('auth.security')}</span>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.name')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors"
                    value={name}
                    onChange={handleProfileChange}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.username')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSign size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors"
                    value={username}
                    onChange={handleProfileChange}
                    onBlur={checkUsernameAvailability}
                  />
                  {isCheckingUsername && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                {errors.username && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors"
                    value={email}
                    onChange={handleProfileChange}
                    onBlur={checkEmailAvailability}
                  />
                  {isCheckingEmail && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isProfilePending || Object.keys(errors).length > 0}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isProfilePending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  <span>{t('common.save')}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.oldPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="old_password"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                  />
                </div>
                {passwordErrors.old_password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{passwordErrors.old_password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.newPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="new_password"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                  />
                </div>
                {passwordErrors.new_password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{passwordErrors.new_password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.confirmNewPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirm_password"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                  />
                </div>
                {passwordErrors.confirm_password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{passwordErrors.confirm_password}</p>}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isPasswordPending || Object.keys(passwordErrors).length > 0}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isPasswordPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  <span>{t('auth.changePassword')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
