import React, { useState } from 'react';
import { 
  KeyRound, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Building2, 
  Waves, 
  BedDouble, 
  Phone, 
  HelpCircle,
  X
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { StaffUser } from '../../types';
import { IrayaLogo } from '../common/IrayaLogo';

export const LoginPage: React.FC = () => {
  const { staffList, login, loginAsStaff } = useCRM();
  
  const [identifier, setIdentifier] = useState('kunal.singh@irayahomes.in');
  const [passwordOrPin, setPasswordOrPin] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(identifier, passwordOrPin);
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    }, 350);
  };

  const handleQuickSelect = (staff: StaffUser) => {
    setIdentifier(staff.email);
    setPasswordOrPin(staff.pin || '1234');
    setErrorMessage(null);
  };

  const handleInstantLogin = (staffId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsStaff(staffId);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#fdf8f5] text-[#45373a] font-sans flex flex-col justify-between selection:bg-[#721828] selection:text-white">
      
      {/* Top Header Bar */}
      <header className="border-b border-[#e4d8cf] bg-[#f7efe9]/90 backdrop-blur-xs px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IrayaLogo variant="header" size="sm" theme="maroon" />
          </div>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e4d8cf] text-xs font-semibold text-[#721828] hover:bg-[#fbf2f4] transition-colors cursor-pointer shadow-2xs"
            id="btn-login-help"
          >
            <HelpCircle className="w-4 h-4 text-[#968186]" />
            <span className="hidden sm:inline">Access Assistance</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Property & Hospitality Story */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc] text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#c29342]" />
              <span>Internal Villa Operations Portal</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2d1217] leading-tight">
                Welcome to the <br />
                <span className="italic font-normal text-[#721828]">Iraya Homes</span> Workspace
              </h1>
              <p className="text-sm text-[#7f6b6f] leading-relaxed">
                Unified luxury management for Lucknow’s premier 4 BHK boutique villa. Coordinate VIP guest itineraries, manage direct bookings, monitor heated pool systems, and log daily housekeeping operations.
              </p>
            </div>

            {/* Property Highlights Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-2xl border border-[#e4d8cf] shadow-2xs">
                <div className="flex items-center gap-2 text-[#721828] font-semibold text-xs mb-1">
                  <BedDouble className="w-4 h-4 text-[#721828]" />
                  <span>4 Luxury Suites</span>
                </div>
                <p className="text-[11px] text-[#968186]">Daily room inspection & linen readiness logs</p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#e4d8cf] shadow-2xs">
                <div className="flex items-center gap-2 text-[#721828] font-semibold text-xs mb-1">
                  <Waves className="w-4 h-4 text-[#315f72]" />
                  <span>Indoor Heated Pool</span>
                </div>
                <p className="text-[11px] text-[#968186]">Water pH & filtration monitoring</p>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-3 p-3 bg-[#f7efe9] rounded-2xl border border-[#e4d8cf]">
              <ShieldCheck className="w-5 h-5 text-[#3e6f48] shrink-0" />
              <p className="text-xs text-[#45373a]">
                <span className="font-bold text-[#2d1217]">Role-Based Access Control (RBAC):</span> Privileges tailored for Executive, Front Desk, Ops, and Audit roles.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Login Card */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#e4d8cf] rounded-[28px] shadow-xl p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center justify-between pb-2 border-b border-[#f7efe9]">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#2d1217]">Staff Sign In</h2>
                  <p className="text-xs text-[#7f6b6f] mt-0.5">
                    Enter your registered villa credentials or select a staff profile below.
                  </p>
                </div>
                <IrayaLogo variant="mark" size="sm" theme="maroon" />
              </div>

              {/* Error Notification */}
              {errorMessage && (
                <div className="p-3.5 bg-[#fdf0f2] border border-[#f5ccd2] rounded-2xl flex items-start gap-2.5 text-xs text-[#961c2c] animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Authentication Error</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#721828] mb-1.5">
                    Email / Staff ID / Phone
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#968186]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. kunal.singh@irayahomes.in or +91 98765 43210"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full bg-[#fdf8f5] border border-[#e4d8cf] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2d1217] focus:border-[#721828] focus:ring-1 focus:ring-[#721828] focus:outline-none transition-colors"
                      id="input-staff-identifier"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#721828]">
                      Password / Security PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-[11px] text-[#c29342] hover:underline font-semibold cursor-pointer"
                    >
                      Default PIN: 1234
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#968186]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter security PIN or password"
                      value={passwordOrPin}
                      onChange={(e) => {
                        setPasswordOrPin(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full bg-[#fdf8f5] border border-[#e4d8cf] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2d1217] focus:border-[#721828] focus:ring-1 focus:ring-[#721828] focus:outline-none transition-colors"
                      id="input-staff-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#968186] hover:text-[#2d1217] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-[#45373a]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#721828] bg-[#fdf8f5] border-[#e4d8cf] focus:ring-[#721828]"
                    />
                    <span>Remember terminal session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-75"
                  id="btn-submit-login"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating Staff...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter CRM Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick One-Click Staff Switcher (Demo & Role Testing) */}
              <div className="pt-4 border-t border-[#e4d8cf] space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#968186]">
                    ⚡ Instant 1-Tap Staff Sign In
                  </p>
                  <span className="text-[10px] text-[#7f6b6f]">Select profile to switch roles</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {staffList.map((staff) => {
                    const isCurrent = identifier === staff.email;
                    return (
                      <div
                        key={staff.id}
                        onClick={() => handleQuickSelect(staff)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-left group ${
                          isCurrent 
                            ? 'bg-[#fbf2f4] border-[#721828] shadow-2xs' 
                            : 'bg-[#fdf8f5] hover:bg-[#f7efe9] border-[#e4d8cf]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#e4d8cf] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#2d1217] truncate">{staff.name}</p>
                            <p className="text-[10px] text-[#7f6b6f] truncate">{staff.role}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstantLogin(staff.id);
                          }}
                          className="px-2 py-1 rounded-lg bg-white group-hover:bg-[#721828] group-hover:text-white border border-[#e4d8cf] text-[10px] font-bold text-[#721828] transition-colors shrink-0 shadow-2xs"
                          title={`Log in immediately as ${staff.name}`}
                        >
                          Sign In
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Global Bottom Footer */}
      <footer className="border-t border-[#e4d8cf] bg-[#f7efe9] py-4 px-6 text-center text-xs text-[#968186]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-serif text-[#2d1217]">
            <span className="font-bold">IRAYA</span> <span className="font-normal italic">HOMES</span> • The Art of Unwinding
          </p>
          <p className="text-[11px] text-[#7f6b6f]">
            4 BHK Luxury Boutique Villa • Gomti Nagar, Lucknow
          </p>
        </div>
      </footer>

      {/* Access Assistance Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1217]/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#e4d8cf] rounded-[28px] shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e4d8cf] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#3e6f48]" />
                <h3 className="font-serif font-bold text-[#2d1217]">Staff Access Credentials</h3>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-xl text-[#968186] hover:text-[#2d1217] hover:bg-[#f7efe9] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#45373a]">
              <p>
                All Iraya Homes staff members can log in using either their registered email address or contact phone number.
              </p>
              
              <div className="bg-[#fdf8f5] p-3 rounded-2xl border border-[#e4d8cf] space-y-2">
                <p className="font-bold text-[#2d1217]">Staff Credentials:</p>
                <ul className="list-disc list-inside space-y-1 text-[#7f6b6f]">
                  <li><span className="font-semibold text-[#2d1217]">Security PIN:</span> <code className="bg-[#fbf2f4] px-1.5 py-0.5 rounded text-[#721828] font-mono font-bold">1234</code></li>
                  <li><span className="font-semibold text-[#2d1217]">Staff Email:</span> <code className="bg-[#fbf2f4] px-1.5 py-0.5 rounded text-[#721828] font-mono">kunal.singh@irayahomes.in</code></li>
                  <li><span className="font-semibold text-[#2d1217]">Staff Phone:</span> <code className="bg-[#fbf2f4] px-1.5 py-0.5 rounded text-[#721828] font-mono">+91 98765 43210</code></li>
                  <li><span className="font-semibold text-[#2d1217]">Designation:</span> <span className="text-[#2d1217] font-medium">Senior Social Media Manager</span></li>
                </ul>
              </div>

              <p className="text-[11px] text-[#968186]">
                For security resets or new staff account creation, please contact Kunal Singh or Villa Operations.
              </p>
            </div>

            <div className="pt-3 border-t border-[#e4d8cf] flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
