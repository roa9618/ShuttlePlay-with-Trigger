import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const getMatches = () => (
    typeof window !== 'undefined'
      ? window.matchMedia(query).matches
      : false
  );

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);

    handleChange();
    media.addEventListener('change', handleChange);

    return () => media.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 769px)');
}
