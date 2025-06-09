import { useEffect, useState } from "react";

// Type definitions for Electron API
interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  saveFile: (data: any) => Promise<void>;
  openFile: () => Promise<any>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  onUpdateAvailable: (callback: (event: any, ...args: any[]) => void) => void;
  onUpdateDownloaded: (callback: (event: any, ...args: any[]) => void) => void;
}

interface Platform {
  name: string;
  isDesktop: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    platform?: Platform;
  }
}

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");

  useEffect(() => {
    // Check if running in Electron
    const electronAvailable = window.electronAPI !== undefined;
    setIsElectron(electronAvailable);

    if (electronAvailable) {
      // Get app version
      window.electronAPI!.getAppVersion().then((version) => {
        setAppVersion(version);
      });

      // Get platform info
      if (window.platform) {
        setPlatform(window.platform.name);
      }
    }
  }, []);

  const openExternal = async (url: string) => {
    if (isElectron && window.electronAPI) {
      await window.electronAPI.openExternal(url);
    } else {
      // Fallback for web version
      window.open(url, "_blank");
    }
  };

  const saveFile = async (data: any) => {
    if (isElectron && window.electronAPI) {
      await window.electronAPI.saveFile(data);
    } else {
      console.warn("File save not available in web version");
    }
  };

  const openFile = async () => {
    if (isElectron && window.electronAPI) {
      return await window.electronAPI.openFile();
    } else {
      console.warn("File open not available in web version");
      return null;
    }
  };

  const minimizeWindow = async () => {
    if (isElectron && window.electronAPI) {
      await window.electronAPI.minimize();
    }
  };

  const maximizeWindow = async () => {
    if (isElectron && window.electronAPI) {
      await window.electronAPI.maximize();
    }
  };

  const closeWindow = async () => {
    if (isElectron && window.electronAPI) {
      await window.electronAPI.close();
    }
  };

  return {
    isElectron,
    appVersion,
    platform,
    openExternal,
    saveFile,
    openFile,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
  };
};

export default useElectron;
