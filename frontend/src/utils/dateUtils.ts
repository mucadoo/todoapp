import { parseISO } from 'date-fns';

/**
 * Gets the user's browser locale.
 * Defaults to 'en-US' if detection fails.
 */
const getUserLocale = () => {
  if (typeof window !== 'undefined' && window.navigator) {
    return window.navigator.languages?.[0] || window.navigator.language || 'en-US';
  }
  return 'en-US';
};

export const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }) => {
  try {
    const date = parseISO(dateString);
    return new Intl.DateTimeFormat(getUserLocale(), options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const formatRelativeDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    // Use 'P' equivalent (numeric date) but localized
    return new Intl.DateTimeFormat(getUserLocale(), { dateStyle: 'short' }).format(date);
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return dateString;
  }
};
