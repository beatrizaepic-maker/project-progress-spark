import { useState, useEffect } from 'react';

interface UseLoadingScreenOptions {
  duration?: number;
  autoShow?: boolean;
  onComplete?: () => void;
}

export const useLoadingScreen = (options: UseLoadingScreenOptions = {}) => {
  const { duration = 3000, autoShow = false, onComplete } = options;
  const [isLoading, setIsLoading] = useState(autoShow);

  const showLoading = () => setIsLoading(true);
  
  const hideLoading = () => {
    setIsLoading(false);
    onComplete?.();
  };

  useEffect(() => {
    if (isLoading && duration > 0) {
      const timer = setTimeout(() => {
        hideLoading();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isLoading, duration]);

  return {
    isLoading,
    showLoading,
    hideLoading,
    setIsLoading
  };
};
