import React, { useEffect, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';

export const TopLoadingBar: React.FC = () => {
  const isFetching = useIsFetching();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isFetching > 0) {
      setIsVisible(true);
      setProgress(10);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timeout);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFetching]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-indigo-100">
      <div
        className="h-full bg-indigo-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
