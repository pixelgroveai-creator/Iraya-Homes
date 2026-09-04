import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AdminCredentials {
  username: string;
  passkey: string;
  pin: string;
  updatedAt: string;
}

export interface AdminAccessLog {
  id: string;
  timestamp: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'CREDENTIALS_UPDATED' | 'SESSION_LOCKED';
  detail: string;
}

interface AdminAuthContextType {
  isAdminUnlocked: boolean;
  credentials: AdminCredentials;
  unlockAdmin: (identifier: string, secretOrPin: string, rememberSession?: boolean) => { success: boolean; error?: string };
  lockAdmin: () => void;
  updateCredentials: (newUsername: string, newPasskey: string, newPin: string) => { success: boolean; message: string };
  generateNewPasskey: () => string;
  accessLogs: AdminAccessLog[];
  failedAttempts: number;
  isLockedOut: boolean;
  lockoutRemainingSeconds: number;
  autoLockMinutes: number;
  setAutoLockMinutes: (mins: number) => void;
  lastUnlockedAt: number | null;
}

const STORAGE_KEY_CREDS = 'iraya_admin_credentials_v2';
const STORAGE_KEY_LOGS = 'iraya_admin_access_logs_v2';
const SESSION_KEY_AUTH = 'iraya_admin_unlocked_session';

const DEFAULT_CREDENTIALS: AdminCredentials = {
  username: 'admin@irayahomes.in',
  passkey: 'Iraya@Luxury#2026!',
  pin: '808099',
  updatedAt: '2026-09-03T00:00:00.000Z'
};

const INITIAL_LOGS: AdminAccessLog[] = [
  {
    id: 'LOG-INIT',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    action: 'CREDENTIALS_UPDATED',
    detail: 'Default Master Administrator Credentials provisioned for Iraya Homes'
  }
];

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Credentials state
  const [credentials, setCredentials] = useState<AdminCredentials>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CREDS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse admin credentials:', e);
    }
    return DEFAULT_CREDENTIALS;
  });

  // Session unlock state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      const sessionVal = sessionStorage.getItem(SESSION_KEY_AUTH);
      return sessionVal === 'true';
    } catch {
      return false;
    }
  });

  const [lastUnlockedAt, setLastUnlockedAt] = useState<number | null>(() => {
    const sessionVal = sessionStorage.getItem(SESSION_KEY_AUTH);
    return sessionVal === 'true' ? Date.now() : null;
  });

  const [autoLockMinutes, setAutoLockMinutesState] = useState<number>(() => {
    const saved = localStorage.getItem('iraya_admin_autolock_mins');
    return saved ? Number(saved) : 15;
  });

  // Access Logs
  const [accessLogs, setAccessLogs] = useState<AdminAccessLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse admin access logs:', e);
    }
    return INITIAL_LOGS;
  });

  // Security Lockout
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  // Sync credentials to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(credentials));
    } catch (e) {
      console.error('Failed to save admin credentials:', e);
    }
  }, [credentials]);

  // Sync access logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(accessLogs.slice(-50)));
    } catch (e) {
      console.error('Failed to save access logs:', e);
    }
  }, [accessLogs]);

  // Handle countdown for lockout
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemainingSeconds(remaining);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Auto-lock idle timer
  useEffect(() => {
    if (!isAdminUnlocked || autoLockMinutes <= 0) return;

    const timeoutMs = autoLockMinutes * 60 * 1000;
    const timer = setTimeout(() => {
      lockAdmin();
      logEvent('SESSION_LOCKED', `Admin session automatically locked after ${autoLockMinutes} minutes of inactivity.`);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [isAdminUnlocked, autoLockMinutes, lastUnlockedAt]);

  const setAutoLockMinutes = (mins: number) => {
    setAutoLockMinutesState(mins);
    localStorage.setItem('iraya_admin_autolock_mins', String(mins));
  };

  const logEvent = useCallback((action: AdminAccessLog['action'], detail: string) => {
    const newLog: AdminAccessLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      detail
    };
    setAccessLogs(prev => [newLog, ...prev.slice(0, 49)]);
  }, []);

  const generateNewPasskey = useCallback((): string => {
    const specials = ['@', '#', '!', '$', '%', '&', '*'];
    const randomSpecial = specials[Math.floor(Math.random() * specials.length)];
    const randomSpecial2 = specials[Math.floor(Math.random() * specials.length)];
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const words = ['Iraya', 'Luxury', 'Heritage', 'Gomti', 'Palace', 'Royal', 'Suites'];
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    return `${word1}${randomSpecial}${word2}${randNum}${randomSpecial2}`;
  }, []);

  const unlockAdmin = (identifier: string, secretOrPin: string, rememberSession = true): { success: boolean; error?: string } => {
    // Check if locked out
    if (lockoutUntil && Date.now() < lockoutUntil) {
      return {
        success: false,
        error: `Security Lockout Active. Please wait ${lockoutRemainingSeconds} seconds before trying again.`
      };
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanSecret = secretOrPin.trim();

    if (!cleanId && !cleanSecret) {
      return { success: false, error: 'Please provide administrator credentials.' };
    }

    // Check if matches username or secondary alias
    const usernameMatch = 
      cleanId === credentials.username.toLowerCase() ||
      cleanId === 'admin' ||
      cleanId === 'iraya_admin' ||
      cleanId === 'admin@irayahomes.com';

    // Secret can be either the passkey or the 6-digit PIN
    const secretMatch = 
      cleanSecret === credentials.passkey || 
      cleanSecret === credentials.pin;

    if (usernameMatch && secretMatch) {
      setIsAdminUnlocked(true);
      setLastUnlockedAt(Date.now());
      setFailedAttempts(0);
      setLockoutUntil(null);

      if (rememberSession) {
        sessionStorage.setItem(SESSION_KEY_AUTH, 'true');
      }

      logEvent('LOGIN_SUCCESS', `Master Admin session unlocked successfully using ${cleanSecret === credentials.pin ? '6-digit PIN' : 'Passkey'}.`);
      return { success: true };
    }

    // Failed attempt handling
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);

    if (nextAttempts >= 5) {
      const lockoutTime = Date.now() + 30000; // 30 seconds
      setLockoutUntil(lockoutTime);
      setLockoutRemainingSeconds(30);
      logEvent('LOGIN_FAILED', `5 consecutive invalid admin attempts. Security lockout initiated for 30 seconds.`);
      return {
        success: false,
        error: 'Too many incorrect attempts. Security lockout activated for 30 seconds.'
      };
    }

    logEvent('LOGIN_FAILED', `Invalid admin credential attempt for identifier "${cleanId || 'unspecified'}" (${5 - nextAttempts} attempts remaining).`);
    return {
      success: false,
      error: `Invalid Administrator Username or Secret Key. ${5 - nextAttempts} attempts remaining before temporary lockout.`
    };
  };

  const lockAdmin = useCallback(() => {
    setIsAdminUnlocked(false);
    setLastUnlockedAt(null);
    try {
      sessionStorage.removeItem(SESSION_KEY_AUTH);
    } catch {
      // ignore
    }
    logEvent('SESSION_LOCKED', 'Admin session locked by user or system timer.');
  }, [logEvent]);

  const updateCredentials = (newUsername: string, newPasskey: string, newPin: string): { success: boolean; message: string } => {
    const cleanUser = newUsername.trim();
    const cleanPass = newPasskey.trim();
    const cleanPin = newPin.trim();

    if (!cleanUser || cleanUser.length < 3) {
      return { success: false, message: 'Admin username must be at least 3 characters long.' };
    }

    if (!cleanPass || cleanPass.length < 8) {
      return { success: false, message: 'Admin passkey must be at least 8 characters long.' };
    }

    if (!cleanPin || cleanPin.length !== 6 || !/^\d+$/.test(cleanPin)) {
      return { success: false, message: 'Quick Admin PIN must be exactly 6 numeric digits.' };
    }

    const updated: AdminCredentials = {
      username: cleanUser,
      passkey: cleanPass,
      pin: cleanPin,
      updatedAt: new Date().toISOString()
    };

    setCredentials(updated);
    logEvent('CREDENTIALS_UPDATED', `Master Administrator credentials updated by admin user.`);
    return { success: true, message: 'Admin credentials successfully updated and secured.' };
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminUnlocked,
        credentials,
        unlockAdmin,
        lockAdmin,
        updateCredentials,
        generateNewPasskey,
        accessLogs,
        failedAttempts,
        isLockedOut: !!lockoutUntil && Date.now() < lockoutUntil,
        lockoutRemainingSeconds,
        autoLockMinutes,
        setAutoLockMinutes,
        lastUnlockedAt
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
