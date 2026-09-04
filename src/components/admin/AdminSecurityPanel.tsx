import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  History,
  Save,
  AlertCircle
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminSecurityPanel: React.FC = () => {
  const { 
    credentials, 
    updateCredentials, 
    generateNewPasskey, 
    accessLogs, 
    lockAdmin,
    autoLockMinutes,
    setAutoLockMinutes
  } = useAdminAuth();

  const [usernameInput, setUsernameInput] = useState(credentials.username);
  const [passkeyInput, setPasskeyInput] = useState(credentials.passkey);
  const [pinInput, setPinInput] = useState(credentials.pin);
  const [showSecret, setShowSecret] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGeneratePasskey = () => {
    const newPass = generateNewPasskey();
    setPasskeyInput(newPass);
    setShowSecret(true);
    setFeedback({
      type: 'success',
      message: 'Generated new cryptographically strong passkey! Click "Save Credentials" to apply.'
    });
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = updateCredentials(usernameInput, passkeyInput, pinInput);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="p-5 sm:p-7 space-y-7 bg-white">
      
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e4d8cf]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-serif font-bold text-[#2d1217] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#721828]" />
              Admin Credentials & Access Gate Configuration
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              PROTECTED
            </span>
          </div>
          <p className="text-xs text-[#7f6b6f] mt-1 max-w-2xl">
            Configure the master administrator credentials that restrict access to the Backend Admin Panel. Unauthorized staff without these credentials will not be able to view database records.
          </p>
        </div>

        <button
          onClick={lockAdmin}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto active:scale-95"
          title="Instantly lock the administrator session"
        >
          <Lock className="w-3.5 h-3.5 text-rose-700" />
          <span>Lock Admin Session Now</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 animate-fadeIn ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grid: Credentials Form (Left) & Active Status / Key Box (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form to update credentials */}
        <form onSubmit={handleSaveCredentials} className="lg:col-span-7 bg-[#fdfaf8] border border-[#e4d8cf] rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e4d8cf]">
            <h4 className="font-serif font-bold text-sm text-[#2d1217] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#721828]" />
              Update Master Credentials
            </h4>
            <span className="text-[11px] text-[#968186]">
              Last updated: {new Date(credentials.updatedAt).toLocaleDateString('en-IN')}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7f6b6f] mb-1.5">
              Admin Username / Email
            </label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full bg-white border border-[#e4d8cf] focus:border-[#721828] focus:ring-1 focus:ring-[#721828] rounded-xl px-3.5 py-2.5 text-xs text-[#2d1217] font-medium outline-none transition-all"
              required
            />
            <p className="text-[11px] text-[#968186] mt-1">
              Used as the login identifier to access the admin console.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7f6b6f]">
                Master Administrator Passkey
              </label>
              <button
                type="button"
                onClick={handleGeneratePasskey}
                className="text-[11px] text-[#721828] hover:text-[#961f34] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Generate Strong Passkey</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                className="w-full bg-white border border-[#e4d8cf] focus:border-[#721828] focus:ring-1 focus:ring-[#721828] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[#2d1217] font-mono font-medium outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#968186] hover:text-[#2d1217] transition-colors cursor-pointer"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#968186] mt-1">
              Must be at least 8 characters. Mix symbols, uppercase, and digits for maximum protection.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7f6b6f] mb-1.5">
              6-Digit Quick PIN (Mobile & Tablet)
            </label>
            <input
              type="text"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              className="w-full sm:w-48 bg-white border border-[#e4d8cf] focus:border-[#721828] focus:ring-1 focus:ring-[#721828] rounded-xl px-3.5 py-2.5 text-center text-base tracking-widest font-mono font-bold text-[#2d1217] outline-none transition-all"
              required
            />
            <p className="text-[11px] text-[#968186] mt-1">
              Convenient 6-digit numeric passkey for rapid access on villa iPads or host devices.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setUsernameInput(credentials.username);
                setPasskeyInput(credentials.passkey);
                setPinInput(credentials.pin);
                setFeedback({ type: 'success', message: 'Restored saved credentials.' });
              }}
              className="px-3 py-2 text-xs text-[#7f6b6f] hover:text-[#2d1217] font-semibold transition-colors cursor-pointer"
            >
              Reset to Current
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#721828] hover:bg-[#8e1e32] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Credentials</span>
            </button>
          </div>
        </form>

        {/* Right Column: Active Keys Overview & Idle Timeout */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Active Key Snapshot Box */}
          <div className="bg-[#2d1217] text-white rounded-2xl p-5 border border-[#4a1c24] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Active Master Credentials
              </span>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-[11px] text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer font-sans"
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSecret ? 'Hide' : 'Reveal'}</span>
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-white/10 p-3 rounded-xl flex items-center justify-between border border-white/10">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block font-sans">Admin Username</span>
                  <span className="text-amber-200 font-bold">{credentials.username}</span>
                </div>
                <button
                  onClick={() => handleCopy(credentials.username, 'active_user')}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy Username"
                >
                  {copiedField === 'active_user' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-white/10 p-3 rounded-xl flex items-center justify-between border border-white/10">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block font-sans">Active Passkey</span>
                  <span className="text-emerald-300 font-bold">
                    {showSecret ? credentials.passkey : '••••••••••••••••'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(credentials.passkey, 'active_pass')}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy Passkey"
                >
                  {copiedField === 'active_pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-white/10 p-3 rounded-xl flex items-center justify-between border border-white/10">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block font-sans">6-Digit PIN</span>
                  <span className="text-amber-300 font-bold tracking-widest">
                    {showSecret ? credentials.pin : '••••••'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(credentials.pin, 'active_pin')}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy PIN"
                >
                  {copiedField === 'active_pin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Idle Auto-Lock Configuration */}
          <div className="bg-[#fdfaf8] border border-[#e4d8cf] rounded-2xl p-5 space-y-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#2d1217] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#721828]" />
              Inactivity Auto-Lock Timer
            </h4>
            <p className="text-xs text-[#7f6b6f] leading-relaxed">
              To prevent unauthorized viewing when staff leave the screen unattended, automatically lock the admin panel after:
            </p>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[5, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setAutoLockMinutes(mins)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    autoLockMinutes === mins
                      ? 'bg-[#721828] text-white border-[#721828] shadow-xs'
                      : 'bg-white text-[#554347] border-[#e4d8cf] hover:bg-[#f7efe9]'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Security Audit Activity Trail */}
      <div className="border border-[#e4d8cf] rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-[#fbf5f1] p-4 border-b border-[#e4d8cf] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#721828]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2d1217]">
              Admin Security Access Trail
            </h4>
          </div>
          <span className="text-[11px] text-[#968186]">
            Recent {accessLogs.length} audit records
          </span>
        </div>

        <div className="divide-y divide-[#f2e6de] max-h-64 overflow-y-auto">
          {accessLogs.map((log) => {
            const isSuccess = log.action === 'LOGIN_SUCCESS';
            const isFailed = log.action === 'LOGIN_FAILED';
            const isUpdate = log.action === 'CREDENTIALS_UPDATED';

            return (
              <div key={log.id} className="p-3.5 flex items-start justify-between gap-3 text-xs hover:bg-[#fcf8f6] transition-colors">
                <div className="flex items-start gap-2.5">
                  <span className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                    isSuccess 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : isFailed 
                      ? 'bg-rose-100 text-rose-800' 
                      : isUpdate 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {log.action}
                  </span>
                  <div>
                    <p className="text-[#2d1217] font-medium">{log.detail}</p>
                    <span className="text-[11px] text-[#968186]">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
