import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface StandaloneNavigator extends Navigator {
  standalone?: boolean;
}

type InstallResult = 'installed' | 'dismissed' | 'unavailable';

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const displayMode = window.matchMedia('(display-mode: standalone)').matches;
      const navigatorStandalone = Boolean((navigator as StandaloneNavigator).standalone);

      setIsInstalled(displayMode || navigatorStandalone);
    };

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    checkInstalled();
    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('focus', checkInstalled);
    document.addEventListener('visibilitychange', checkInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('focus', checkInstalled);
      document.removeEventListener('visibilitychange', checkInstalled);
    };
  }, []);

  const install = async (): Promise<InstallResult> => {
    if (!installPrompt) return 'unavailable';

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);

    return choice.outcome === 'accepted' ? 'installed' : 'dismissed';
  };

  return {
    install,
    isInstalled,
    canInstall: Boolean(installPrompt),
  };
}
