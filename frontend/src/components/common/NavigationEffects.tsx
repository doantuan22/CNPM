import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function NavigationEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (import.meta.env.MODE !== 'test') window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
