import { useEffect, useState } from 'react';

const NIGHT_MODE_KEY = 'sefedinjera-night-mode';

export default function useNightMode() {
  const [nightMode, setNightMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(NIGHT_MODE_KEY) === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (nightMode) {
      document.documentElement.classList.add('night-mode');
    } else {
      document.documentElement.classList.remove('night-mode');
    }
    localStorage.setItem(NIGHT_MODE_KEY, nightMode ? 'true' : 'false');
  }, [nightMode]);

  return [nightMode, setNightMode] as const;
}
