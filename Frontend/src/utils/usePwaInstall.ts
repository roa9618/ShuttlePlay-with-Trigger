import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface StandaloneNavigator extends Navigator {
  standalone?: boolean;
}

type InstallResult = 'installed' | 'dismissed' | 'unavailable';

function getInstallGuide() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIpad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const isIos = /iphone|ipad|ipod/.test(userAgent) || isIpad;
  const isAndroid = userAgent.includes('android');

  if (isIos) {
    return '공유 버튼을 누른 뒤 홈 화면에 추가를 선택해 주세요.';
  }

  if (isAndroid) {
    return '브라우저 메뉴에서 앱 설치 또는 홈 화면에 추가를 선택해 주세요.';
  }

  return '주소창 오른쪽 설치 아이콘이나 브라우저 메뉴에서 설치해 주세요.';
}

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
    installGuide: getInstallGuide(),
  };
}
