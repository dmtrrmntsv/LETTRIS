interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  expand: () => void;
  disableVerticalSwipes?: () => void; // Make optional since not all versions support it
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback?: {
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    selectionChanged: () => void;
  };
  CloudStorage?: {
    setItems: (items: Record<string, string>) => void;
    getItems: (keys: string[], callback: (error: any, values: any) => void) => void;
  };
  initData: string;
  initDataUnsafe: any;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export {};