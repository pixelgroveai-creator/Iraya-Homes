import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Copy, 
  Check, 
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface AdminLockScreenProps {
  onReturnToDashboard: () => void;
}

export const AdminLockScreen: React.FC<AdminLockScreenProps> = ({ onReturnToDashboard }) => {
  const { 
    credentials, 
    unlockAdmin, 
    isLockedOut, 
    lockoutRemainingSeconds, 
    failedAttempts 
  } = useAdminAuth();

  const [authMethod, setAuthMethod] = useState<'passkey' | 'pin'>('passkey');
  const [username, setUsername] = useState('admin@irayahomes.in');
  const [passkey, setPasskey] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showOwnerCredentialModal, setShowOwnerCredentialModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isLockedOut) {
      setErrorMessage(`Access temporarily locked. Try again in ${lockoutRemainingSeconds}s.`);
      return;
    }

    if (authMethod === 'passkey') {
      if (!username.trim()) {
        setErrorMessage('Please enter your administrator email or username.');
        return;
      }
      if (!passkey.trim()) {
        setErrorMessage('Please enter your administrator passkey.');
        return;
      }
      const res = unlockAdmin(username, passkey, rememberSession);
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    } else {
      if (!pin.trim()) {
        setErrorMessage('Please enter the 6-digit Master PIN.');
        return;
      }
      const res = unlockAdmin('admin@irayahomes.in', pin, rememberSession);
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleQuickFillAndUnlock = () => {
    setUsername(credentials.username);
    setPasskey(credentials.passkey);
    unlockAdmin(credentials.username, credentials.passkey, true);
    setShowOwnerCredentialModal(false);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white border border-[#e4d8cf] rounded-3xl shadow-xl overflow-hidden relative">
        
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-[#721828]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Lock Screen Header */}
        <div className="bg-gradient-to-r from-[#2d1217] via-[#5c1320] to-[#721828] text-white p-6 text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-amber-300 shadow-inner mb-3">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
            Restricted Admin Console
          </h2>
          <p className="text-xs text-[#e8d5ce] mt-1.5 max-w-xs mx-auto leading-relaxed">
            Backend database records, system logs, and server diagnostics are protected. Master Administrator credentials required.
          </p>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-mono text-amber-200/90 bg-white/10 py-1 px-3 rounded-full border border-white/15 w-fit mx-auto backdrop-blur-xs">
            <Lock className="w-3 h-3 text-amber-300" />
            <span>Encrypted Access Gate</span>
          </div>
        </div>

        {/* Method Toggle Tabs */}
        <div className="p-2 bg-[#fbf5f1] border-b border-[#e4d8cf] flex gap-1">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('passkey');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMethod === 'passkey'
                ? 'bg-white text-[#721828] shadow-xs border border-[#e4d8cf]'
                : 'text-[#7f6b6f] hover:text-[#2d1217]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Master Passkey</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('pin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMethod === 'pin'
                ? 'bg-white text-[#721828] shadow-xs border border-[#e4d8cf]'
                : 'text-[#7f6b6f] hover:text-[#2d1217]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>6-Digit Master PIN</span>
          </button>
        </div>

        {/* Lockout Warning Banner */}
        {isLockedOut && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">Security Lockout Active</p>
              <p className="text-[11px] text-rose-700">
                Too many incorrect attempts. Retry available in <strong className="font-mono">{lockoutRemainingSeconds}s</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && !isLockedOut && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {authMethod === 'passkey' ? (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7f6b6f] mb-1.5">
                  Administrator Username / Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLockedOut}
                  placeholder="admin@irayahomes.in"
                  className="w-full bg-[#fdfaf8] border border-[#e4d8cf] focus:border-[#721828] focus:ring-1 focus:ring-[#721828] rounded-xl px-3.5 py-2.5 text-xs text-[#2d1217] font-medium outline-none transition-all placeholder-[#968186] disabled:opacity-50"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7f6b6f] mb-1.5 flex items-center justify-between">
                  <span>Master Passkey</span>
                  <span className="text-[10px] text-[#968186] font-normal lowercase">Case-sensitive</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    disabled={isLockedOut}
                    placeholder="••••••••••••••••"
                    className="w-full bg-[#fdfaf8] border border-[#e4d8cf] focus:border-[#721828] focus:ring-1 focus:ring-[#721828] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[#2d1217] font-mono outline-none transition-all placeholder-[#968186] disabled:opacity-50"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#968186] hover:text-[#2d1217] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7f6b6f] mb-1.5">
                Enter 6-Digit Master Security PIN
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPin(val);
                  }}
                  disabled={isLockedOut}
                  placeholder="808099"
                  className="w-full bg-[#fdfaf8] border border-[#e4d8cf] focus:border-[#721828] focus:ring-1 focus:ring-[#721828] rounded-xl px-3.5 py-2.5 text-center text-lg tracking-[0.4em] font-mono text-[#2d1217] font-bold outline-none transition-all placeholder-[#c0b0a8] disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#968186] hover:text-[#2d1217] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#968186] mt-1.5 text-center">
                Quick numeric PIN for fast authorization on mobile or tablets
              </p>
            </div>
          )}

          {/* Session Persistence Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="w-4 h-4 rounded text-[#721828] focus:ring-[#721828] border-[#e4d8cf] accent-[#721828]"
              />
              <span className="text-xs text-[#554347]">
                Keep unlocked for this browser session
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLockedOut}
            className="w-full bg-gradient-to-r from-[#2d1217] to-[#721828] hover:from-[#421921] hover:to-[#8a1d30] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-amber-300" />
            <span>Unlock Admin Panel</span>
          </button>
        </form>

        {/* Footer Actions: Back to Dashboard & Owner Credential Reveal */}
        <div className="p-4 bg-[#fbf5f1] border-t border-[#e4d8cf] flex items-center justify-between text-xs text-[#7f6b6f]">
          <button
            type="button"
            onClick={onReturnToDashboard}
            className="flex items-center gap-1.5 text-[#721828] hover:underline font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>

          {/* Authorized Admin Credentials Disclosure Button */}
          <button
            type="button"
            onClick={() => setShowOwnerCredentialModal(true)}
            className="flex items-center gap-1 text-[#7f6b6f] hover:text-[#2d1217] text-[11px] transition-colors cursor-pointer"
            title="View generated master credentials"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>Owner Passkey Info</span>
          </button>
        </div>

      </div>

      {/* OWNER CREDENTIALS DIALOG */}
      {showOwnerCredentialModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e4d8cf] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            
            <div className="bg-gradient-to-r from-[#2d1217] to-[#721828] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-white">
                    Master Administrator Credentials
                  </h3>
                  <p className="text-[11px] text-[#e8d5ce]">
                    Generated specifically for Iraya Homes owner & leadership
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOwnerCredentialModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs bg-[#fdfaf8]">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  These master credentials guard sensitive guest leads, reservation payments, and system tables from unauthorized staff. You can update or change them once logged in.
                </p>
              </div>

              {/* Username row */}
              <div className="bg-white p-3 rounded-xl border border-[#e4d8cf] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#7f6b6f] block">
                    Admin Username / Email
                  </span>
                  <p className="font-mono font-bold text-[#2d1217] mt-0.5">
                    {credentials.username}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.username, 'user')}
                  className="px-2.5 py-1 bg-[#f4ece7] hover:bg-[#ebdcd4] text-[#721828] rounded-lg text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedKey === 'user' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'user' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Passkey row */}
              <div className="bg-white p-3 rounded-xl border border-[#e4d8cf] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#7f6b6f] block">
                    Master Passkey
                  </span>
                  <p className="font-mono font-bold text-[#721828] mt-0.5">
                    {credentials.passkey}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.passkey, 'pass')}
                  className="px-2.5 py-1 bg-[#f4ece7] hover:bg-[#ebdcd4] text-[#721828] rounded-lg text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedKey === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'pass' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Quick PIN row */}
              <div className="bg-white p-3 rounded-xl border border-[#e4d8cf] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#7f6b6f] block">
                    6-Digit Quick PIN
                  </span>
                  <p className="font-mono font-bold text-emerald-700 tracking-widest mt-0.5">
                    {credentials.pin}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.pin, 'pin')}
                  className="px-2.5 py-1 bg-[#f4ece7] hover:bg-[#ebdcd4] text-[#721828] rounded-lg text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedKey === 'pin' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'pin' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Instant fill & unlock action */}
              <button
                type="button"
                onClick={handleQuickFillAndUnlock}
                className="w-full py-2.5 bg-[#c29342] hover:bg-[#d6a54f] text-[#2d1217] rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto-Fill & Unlock Admin Panel</span>
              </button>
            </div>

            <div className="p-3 bg-[#f7efe9] border-t border-[#e4d8cf] text-center">
              <button
                onClick={() => setShowOwnerCredentialModal(false)}
                className="text-xs text-[#721828] hover:underline font-semibold"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
