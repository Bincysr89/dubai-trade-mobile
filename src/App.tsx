import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Eye, EyeOff, Fingerprint, Bell, Settings, Home,
  LayoutGrid, List, Wallet, CreditCard, Truck, Ship, Package, FileText,
  MapPin, Search, X, User, Key, Info, Shield, FileCheck, LogOut, Award,
  Type, Box, ClipboardList, ArrowRight, Building2, Boxes,
  AlertCircle, Upload, Calendar, Mail, Phone, FileCheck2, CheckCircle2, Plus, Download,
  Trash2, Copy, Check, Clock, Receipt, Share2, Sun, Moon,
} from 'lucide-react';
import dubaiTradeLogo from './assets/dubai-trade-logo.svg';
import uaePassLogoSvg from './assets/uaepass-logo.svg?raw';
import Dh from './Dh';

type Screen =
  | 'onboarding'
  | 'login' | 'customerProfile' | 'accessibility'
  | 'dashboard' | 'services' | 'profile' | 'payments'
  | 'requestDDO' | 'ddoSearch' | 'blParty' | 'ddoParty' | 'ddoDocuments'
  | 'importFCL' | 'gatePass' | 'gatePassDetails' | 'addVehicle' | 'boeDetails' | 'containers' | 'vessels'
  | 'forgotPassword' | 'verifyCode' | 'resetPassword' | 'notifications' | 'notificationsSettings' | 'subscription'
  | 'cargoMgmt' | 'invoiceDownload';

type View = 'grid' | 'list';
type ModalKind = null | 'advanceDeposit' | 'autoTopup' | 'prepaidTopup' | 'prepaidEmpty' | 'addPrepaidCard' | 'paySuccess'
  | 'fclTotalPayment' | 'fclPaySuccess' | 'removeVehicle' | 'gatePassCreated'
  | 'passwordResetSuccess' | 'vatPending' | 'renewSuccess' | 'invoiceMoreInfo' | 'enableBiometrics';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [hasCompletedFirstRun, setHasCompletedFirstRun] = useState(false);
  const [view, setView] = useState<View>('grid');
  const [showCustomize, setShowCustomize] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [fontSize, setFontSize] = useState<'Small'|'Medium'|'Large'|'Extra Large'>('Medium');
  const [profileIdx, setProfileIdx] = useState(0);
  const [defaultProfileIdx, setDefaultProfileIdx] = useState<number | null>(null);
  const [a11y, setA11y] = useState({ highContrast: false, boldText: false, reduceMotion: false });
  const [theme, setTheme] = useState<'dark'|'light'>('dark');
  const [sections, setSections] = useState({ payments: true, trade: true, cargo: true });
  const [biometric, setBiometric] = useState(false);
  const [loginMode, setLoginMode] = useState<'initial'|'touchId'>('initial');
  const [hasPrepaidCard, setHasPrepaidCard] = useState(false);
  const [autoTopup, setAutoTopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'applepay'|'rosoom'>('applepay');
  const [vehicles, setVehicles] = useState<Array<{ plate: string; qty: number }>>([]);
  const [vehicleToRemove, setVehicleToRemove] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [hasShownBiometricPrompt, setHasShownBiometricPrompt] = useState(false);
  const [showDashboardTour, setShowDashboardTour] = useState(false);
  const [pendingDashboardTour, setPendingDashboardTour] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(t => (t === msg ? null : t)), 2400);
  };

  const goLogin = () => {
    setShowDashboardTour(false);
    setPendingDashboardTour(false);
    setLoginMode('touchId');
    setScreen('login');
  };

  // Auto-launch dashboard tour after every fresh login (set via pendingDashboardTour).
  useEffect(() => {
    if (screen === 'dashboard' && pendingDashboardTour) {
      const t = setTimeout(() => {
        setShowDashboardTour(true);
        setPendingDashboardTour(false);
      }, 450);
      return () => clearTimeout(t);
    }
  }, [screen, pendingDashboardTour]);

  return (
    <div className="phone-frame">
      <div className="phone-scroll">
        <div key={screen} className="dt-screen">
        {screen === 'onboarding' && (
          <Onboarding onDone={() => {
            // After onboarding: if the user has a default profile saved, skip selection.
            if (defaultProfileIdx !== null) {
              setProfileIdx(defaultProfileIdx);
              setHasCompletedFirstRun(true);
              setScreen('dashboard');
            } else if (!hasCompletedFirstRun) {
              setHasCompletedFirstRun(true);
              setScreen('customerProfile');
            } else {
              setScreen('dashboard');
            }
          }} />
        )}
        {screen === 'login' && (
          <Login mode={loginMode}
            theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            onContinue={() => {
              // First time signing in with password: ask about biometrics first.
              if (loginMode === 'initial' && !hasShownBiometricPrompt) {
                setHasShownBiometricPrompt(true);
                setModal('enableBiometrics');
                return;
              }
              // Every login now lands on the onboarding tour first,
              // and queues the dashboard guided tour to run when the user lands.
              setPendingDashboardTour(true);
              setScreen('onboarding');
            }}
            onLoginWithPassword={() => setLoginMode('initial')}
            onForgot={() => setScreen('forgotPassword')} />
        )}
        {screen === 'customerProfile' && (
          <CustomerProfile selected={profileIdx} onSelect={setProfileIdx}
            defaultIdx={defaultProfileIdx} onSetDefault={setDefaultProfileIdx}
            onBack={() => setScreen('login')}
            onContinue={() => setScreen('accessibility')} />
        )}
        {screen === 'accessibility' && (
          <Accessibility fontSize={fontSize} setFontSize={setFontSize}
            a11y={a11y} setA11y={setA11y}
            theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            onBack={() => setScreen('customerProfile')}
            onContinue={() => setScreen('dashboard')}
            onSkip={() => setScreen('dashboard')} />
        )}
        {screen === 'dashboard' && (
          <Dashboard view={view} setView={setView}
            onOpenSettings={() => setShowCustomize(true)}
            onAdvanceDeposit={() => setModal('advanceDeposit')}
            onPrepaidCard={() => setModal(hasPrepaidCard ? 'prepaidTopup' : 'prepaidEmpty')}
            onImportFCL={() => setScreen('importFCL')}
            onGatePass={() => setScreen('gatePass')}
            onContainers={() => setScreen('containers')}
            onVessels={() => setScreen('vessels')}
            onNotifications={() => setScreen('notifications')}
            onRequestDDO={() => setScreen('ddoSearch')}
            onTab={(t) => setScreen(t)} />
        )}
        {screen === 'services' && (
          <Services onTab={(t) => setScreen(t)}
            onOpenPayments={() => setScreen('payments')}
            onOpenCargoMgmt={() => setScreen('cargoMgmt')} />
        )}
        {screen === 'cargoMgmt' && (
          <CargoManagement onBack={() => setScreen('services')}
            onInvoiceDownload={() => setScreen('invoiceDownload')} />
        )}
        {screen === 'invoiceDownload' && (
          <InvoiceDownload onBack={() => setScreen('cargoMgmt')}
            onMoreInfo={() => setModal('invoiceMoreInfo')} />
        )}
        {screen === 'profile' && (
          <Profile onTab={(t) => setScreen(t)}
            biometric={biometric} setBiometric={setBiometric}
            onSignOut={goLogin}
            onResetPassword={() => setScreen('forgotPassword')}
            onNotificationsSettings={() => setScreen('notificationsSettings')}
            onRenewNow={() => setScreen('subscription')} />
        )}
        {screen === 'payments' && (
          <Payments onBack={() => setScreen('services')}
            onAdvanceDeposit={() => setModal('advanceDeposit')}
            onPrepaidCard={() => setModal(hasPrepaidCard ? 'prepaidTopup' : 'prepaidEmpty')} />
        )}
        {screen === 'ddoSearch' && (
          <DDOSearchScreen onBack={() => setScreen('dashboard')}
            onSearch={() => setScreen('requestDDO')} />
        )}
        {screen === 'requestDDO' && (
          <RequestDDO onBack={() => setScreen('ddoSearch')}
            onBLParty={() => setScreen('blParty')}
            onDDOParty={() => setScreen('ddoParty')}
            onDocs={() => setScreen('ddoDocuments')}
            onPay={() => setModal('paySuccess')} />
        )}
        {screen === 'blParty' && <BLParty onBack={() => setScreen('requestDDO')} />}
        {screen === 'ddoParty' && <DDOParty onBack={() => setScreen('requestDDO')} />}
        {screen === 'ddoDocuments' && <DDODocuments onBack={() => setScreen('requestDDO')} />}
        {screen === 'importFCL' && (
          <ImportFCL onBack={() => setScreen('dashboard')}
            onPickBill={() => setModal('fclTotalPayment')} />
        )}
        {screen === 'gatePass' && <GatePass onBack={() => setScreen('dashboard')}
          onPick={() => setScreen('gatePassDetails')} />}
        {screen === 'gatePassDetails' && (
          <GatePassDetails vehicles={vehicles}
            onBack={() => setScreen('gatePass')}
            onAddVehicle={() => setScreen('addVehicle')}
            onViewDetails={() => setScreen('boeDetails')}
            onRemoveVehicle={(i) => { setVehicleToRemove(i); setModal('removeVehicle'); }}
            onPay={() => setModal('gatePassCreated')} />
        )}
        {screen === 'addVehicle' && (
          <AddVehicle index={vehicles.length + 1}
            onCancel={() => setScreen('gatePassDetails')}
            onSave={() => {
              setVehicles(v => [...v, { plate: 'DXB - C - 1234', qty: 50 }]);
              setScreen('gatePassDetails');
            }} />
        )}
        {screen === 'boeDetails' && <BOEDetails onBack={() => setScreen('gatePassDetails')} />}
        {screen === 'containers' && <Containers onBack={() => setScreen('dashboard')} />}
        {screen === 'vessels' && <Vessels onBack={() => setScreen('dashboard')} />}
        {screen === 'forgotPassword' && (
          <ForgotPassword onBack={() => setScreen('login')}
            onContinue={() => setScreen('verifyCode')} />
        )}
        {screen === 'verifyCode' && (
          <VerifyCode onBack={() => setScreen('forgotPassword')}
            onVerify={() => setScreen('resetPassword')} />
        )}
        {screen === 'resetPassword' && (
          <ResetPassword onBack={() => setScreen('verifyCode')}
            onReset={() => setModal('passwordResetSuccess')} />
        )}
        {screen === 'notifications' && (
          <Notifications onBack={() => setScreen('dashboard')} />
        )}
        {screen === 'notificationsSettings' && (
          <NotificationsSettings onBack={() => setScreen('profile')} />
        )}
        {screen === 'subscription' && (
          <Subscription onBack={() => setScreen('profile')}
            onContinue={() => setModal('vatPending')} />
        )}
        </div>
      </div>
      {showCustomize && (
        <CustomizeDashboard sections={sections} setSections={setSections}
          onClose={() => setShowCustomize(false)} />
      )}
      {showDashboardTour && screen === 'dashboard' && (
        <DashboardTour
          onDone={() => setShowDashboardTour(false)} />
      )}
      {modal === 'advanceDeposit' && (
        <AdvanceDeposit onClose={() => setModal(null)}
          paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
          autoTopup={autoTopup}
          onToggleAutoTopup={() => { if (!autoTopup) setModal('autoTopup'); else setAutoTopup(false); }} />
      )}
      {modal === 'autoTopup' && (
        <AutoTopupModal onSave={() => { setAutoTopup(true); setModal('advanceDeposit'); }}
          onCancel={() => setModal('advanceDeposit')} />
      )}
      {modal === 'prepaidTopup' && (
        <PrepaidTopup onClose={() => setModal(null)} />
      )}
      {modal === 'prepaidEmpty' && (
        <PrepaidEmpty onClose={() => setModal(null)}
          onAdd={() => setModal('addPrepaidCard')} />
      )}
      {modal === 'addPrepaidCard' && (
        <AddPrepaidCard onClose={() => setModal(null)}
          onAdded={() => { setHasPrepaidCard(true); setModal('prepaidTopup'); }} />
      )}
      {modal === 'paySuccess' && (
        <PaySuccessModal onClose={() => { setModal(null); setScreen('dashboard'); }} />
      )}
      {modal === 'fclTotalPayment' && (
        <FCLTotalPayment onClose={() => setModal(null)}
          onPay={() => setModal('fclPaySuccess')} />
      )}
      {modal === 'fclPaySuccess' && (
        <FCLPaySuccess onClose={() => setModal(null)} />
      )}
      {modal === 'removeVehicle' && (
        <RemoveVehicleModal plate="DXB-C-12334"
          onCancel={() => setModal(null)}
          onConfirm={() => {
            if (vehicleToRemove != null) setVehicles(v => v.filter((_, i) => i !== vehicleToRemove));
            setVehicleToRemove(null); setModal(null);
          }} />
      )}
      {modal === 'gatePassCreated' && (
        <GatePassCreatedModal onClose={() => setModal(null)} />
      )}
      {modal === 'passwordResetSuccess' && (
        <PasswordResetSuccess onBack={() => { setModal(null); setLoginMode('initial'); setScreen('login'); }} />
      )}
      {modal === 'vatPending' && (
        <VATPendingModal onNo={() => setModal(null)}
          onYes={() => setModal('renewSuccess')} />
      )}
      {modal === 'renewSuccess' && (
        <RenewSuccessModal onClose={() => { setModal(null); setScreen('profile'); }} />
      )}
      {modal === 'invoiceMoreInfo' && (
        <InvoiceMoreInfoModal onClose={() => setModal(null)}
          onDownload={() => { setModal(null); showToast('Invoice download started'); }} />
      )}
      {modal === 'enableBiometrics' && (
        <EnableBiometricsModal
          onEnable={() => {
            setBiometric(true);
            setModal(null);
            setPendingDashboardTour(true);
            setScreen('onboarding');
            showToast('Biometric login enabled');
          }}
          onSkip={() => { setModal(null); setPendingDashboardTour(true); setScreen('onboarding'); }} />
      )}
      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-24 bg-[#0E1B3D] text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg z-50 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}

/* ---------- 1. LOGIN ---------- */
function Login({ onContinue, mode, theme = 'dark', onToggleTheme, onForgot, onLoginWithPassword }:
  { onContinue: () => void; mode: 'initial'|'touchId';
    theme?: 'dark'|'light'; onToggleTheme?: () => void;
    onForgot?: () => void; onLoginWithPassword?: () => void }) {
  const isDark = theme === 'dark';
  const wrapperCls = isDark
    ? 'bg-gradient-to-b from-[#0A1A3D] via-[#0E1B3D] to-[#13245C] text-white'
    : 'text-[#0E1B3D]';
  const wrapperStyle: React.CSSProperties = isDark
    ? {}
    : {
        background:
          'radial-gradient(circle at 18% 10%, rgba(120,170,255,0.55) 0%, transparent 45%),' +
          'radial-gradient(circle at 88% 18%, rgba(180,210,255,0.55) 0%, transparent 50%),' +
          'radial-gradient(circle at 82% 92%, rgba(150,190,255,0.5) 0%, transparent 55%),' +
          'radial-gradient(circle at 12% 78%, rgba(200,225,255,0.55) 0%, transparent 50%),' +
          'linear-gradient(160deg, #E4EDFB 0%, #F2F6FE 50%, #E9F0FB 100%)',
      };
  const subtitleCls = isDark ? 'text-white/75' : 'text-[#4A5565]';
  const trustCls = isDark ? 'text-white/70' : 'text-[#6B7280]';
  const trustFineCls = isDark ? 'text-white/55' : 'text-[#6B7280]';
  const trustEmphasisCls = isDark ? 'text-white' : 'text-[#0E1B3D]';
  const shieldIconCls = isDark ? '' : 'text-[#1360D2]';
  const logoCls = isDark ? 'brightness-0 invert' : '';
  const cardCls = isDark
    ? 'bg-white border border-[#E0EAFB] shadow-[0_18px_36px_-18px_rgba(14,27,61,0.18)]'
    : 'bg-white/65 backdrop-blur-xl border border-white/60 shadow-[0_25px_60px_-20px_rgba(14,27,61,0.25),inset_0_1px_0_rgba(255,255,255,0.6)]';
  const ThemeToggle = onToggleTheme && (
    <div className="relative z-10 mt-2 flex justify-center">
      <button onClick={onToggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all
          ${isDark
            ? 'bg-white/10 hover:bg-white/20 border border-white/15 text-white/85'
            : 'bg-white hover:bg-[#F4F7FE] border border-[#E0EAFB] text-[#1360D2] shadow-sm'}`}>
        {isDark ? <Sun size={13} /> : <Moon size={13} />}
        <span>{isDark ? 'Preview light theme' : 'Preview dark theme'}</span>
      </button>
    </div>
  );
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const canSubmit = username.trim().length > 0 || password.length > 0;
  if (mode === 'touchId') {
    return (
      <div className={`relative h-full min-h-full overflow-hidden ${wrapperCls}`} style={wrapperStyle}>
        {isDark ? (
          <>
            <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-[#1360D2] opacity-30 blur-[110px] pointer-events-none" />
            <div className="absolute top-20 -left-32 w-[380px] h-[380px] rounded-full bg-[#478CF7] opacity-20 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-32 right-0 w-[460px] h-[460px] rounded-full bg-[#1360D2] opacity-15 blur-[140px] pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute -top-24 -right-24 w-[340px] h-[340px] rounded-full opacity-25 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
            <div className="absolute top-[42%] -left-32 w-[280px] h-[280px] rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: '#6FA0FF' }} />
          </>
        )}

        {/* Hero — brand mark + tagline */}
        <div className="relative dt-safe-top px-7 pt-2 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <img src={dubaiTradeLogo} alt="Dubai Trade" className={`h-12 w-auto ${logoCls}`} />
          </div>
          <div className="text-[28px] font-bold leading-[34px] tracking-tight">Hi, welcome back.</div>
          <div className={`text-[15px] mt-2 max-w-[280px] leading-snug ${subtitleCls}`}>
            Use Touch ID for instant access — or sign in with your password.
          </div>
        </div>

        {/* Form card */}
        <div className={`relative mx-5 rounded-[28px] p-6 z-10 ${cardCls}`}>
          {/* Touch ID hero tile */}
          <button onClick={onContinue}
            className="group w-full flex flex-col items-center justify-center rounded-2xl border-[1.5px] border-[#E0EAFB] bg-gradient-to-b from-[#F4F7FE] to-[#EAF1FE] hover:border-[#1360D2] hover:shadow-[0_12px_24px_-12px_rgba(19,96,210,0.35)] transition-all p-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#1360D2]/15 blur-xl group-hover:bg-[#1360D2]/25 transition-all" />
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #0E47A6, #1360D2, #2950E5)' }}>
                <Fingerprint size={32} />
              </div>
            </div>
            <div className="mt-3 text-[15px] font-bold text-[#0E1B3D]">Sign in with Touch ID</div>
            <div className="text-[12px] text-[#6B7280] mt-0.5">Tap the sensor on your device</div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5 text-[11px] font-semibold text-gray-400 tracking-wider">
            <div className="flex-1 h-px bg-gray-200" /> OR <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Password login */}
          <button onClick={onLoginWithPassword}
            className="dt-btn-primary w-full text-white py-3.5 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2">
            Login with Password <ArrowRight size={18} />
          </button>

          {/* UAE Pass option (kept to match login parity) */}
          <button onClick={onContinue}
            aria-label="Sign in with UAE PASS"
            className="mt-3 w-full border border-[#1C1D1A] rounded-2xl py-3 flex items-center justify-center gap-2 active:opacity-80 transition-opacity">
            <span className="w-6 h-6 inline-flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: uaePassLogoSvg }} />
            <span style={{ fontFamily: 'Dubai, Inter, sans-serif', fontSize: 18, fontWeight: 500, color: '#1A1A1A' }}>
              Sign in with UAE PASS
            </span>
          </button>
        </div>

        {/* Trust footer */}
        <div className="relative mt-6 pb-6 px-7 text-center space-y-2.5 z-10">
          <div className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${trustCls}`}>
            <Shield size={12} className={shieldIconCls} /> Secured by end-to-end encryption
          </div>
          <div className={`text-[11px] leading-relaxed ${trustFineCls}`}>
            By signing in, you agree to our{' '}
            <span className={`font-semibold underline underline-offset-2 ${trustEmphasisCls}`}>Terms</span>{' '}
            &amp;{' '}
            <span className={`font-semibold underline underline-offset-2 ${trustEmphasisCls}`}>Privacy</span>
          </div>
          {ThemeToggle}
        </div>
      </div>
    );
  }
  return (
    <div className={`relative h-full min-h-full overflow-hidden ${wrapperCls}`} style={wrapperStyle}>
      {isDark ? (
        <>
          <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-[#1360D2] opacity-30 blur-[110px] pointer-events-none" />
          <div className="absolute top-20 -left-32 w-[380px] h-[380px] rounded-full bg-[#478CF7] opacity-20 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 right-0 w-[460px] h-[460px] rounded-full bg-[#1360D2] opacity-15 blur-[140px] pointer-events-none" />
        </>
      ) : (
        null
      )}

      {/* Hero — brand mark + tagline */}
      <div className="relative dt-safe-top px-7 pt-2 pb-8">
        <div className="flex items-center gap-3 mb-7">
          <img src={dubaiTradeLogo} alt="Dubai Trade" className={`h-12 w-auto ${logoCls}`} />
        </div>
        <div className="text-[28px] font-bold leading-[34px] tracking-tight">Welcome back.</div>
        <div className={`text-[15px] mt-2 max-w-[280px] leading-snug ${subtitleCls}`}>
          Sign in to manage your trade operations — anywhere, anytime.
        </div>
      </div>

      {/* Form card */}
      <div className={`relative mx-5 rounded-[28px] p-6 z-10 ${cardCls}`}>
        {/* Inputs — label inside the field */}
        <div className="space-y-3">
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1360D2]" />
            <input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Username or email"
              className="w-full bg-white border-[1.5px] border-[#E7EBF2] hover:border-[#1360D2]/50 focus:border-[#1360D2] focus:ring-4 focus:ring-[#1360D2]/15 rounded-2xl pl-12 pr-4 py-4 text-[15px] text-[#0E1B3D] placeholder:text-[#6B7280] outline-none transition-all" />
          </div>
          <div className="relative">
            <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1360D2]" />
            <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white border-[1.5px] border-[#E7EBF2] hover:border-[#1360D2]/50 focus:border-[#1360D2] focus:ring-4 focus:ring-[#1360D2]/15 rounded-2xl pl-12 pr-12 py-4 text-[15px] text-[#0E1B3D] placeholder:text-[#6B7280] outline-none transition-all" />
            <button onClick={() => setShow(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1360D2]">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember + Forgot row */}
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setRemember(!remember)} className="flex items-center gap-2 text-sm text-[#394B5D]">
            <span className={`w-9 h-5 rounded-full transition relative ${remember ? 'bg-[#1360D2]' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${remember ? 'left-[18px]' : 'left-0.5'}`} />
            </span>
            Remember me
          </button>
          <button onClick={onForgot} className="text-[#1360D2] font-semibold text-sm">Forgot password?</button>
        </div>

        {/* Primary action with deep brand-blue gradient + glow */}
        <button onClick={canSubmit ? onContinue : undefined}
          disabled={!canSubmit}
          className={`relative w-full mt-5 py-3.5 rounded-2xl font-bold text-[15px] transition-all
            ${canSubmit
              ? 'dt-btn-primary text-white cursor-pointer'
              : 'bg-[#E7EBF2] text-[#9CA3AF] cursor-not-allowed'}`}>
          Sign In
          <ArrowRight size={18} className="inline-block ml-2 -mt-0.5" />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5 text-[11px] font-semibold text-gray-400 tracking-wider">
          <div className="flex-1 h-px bg-gray-200" /> OR CONTINUE WITH <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* UAE Pass — official mark; 14px Dubai-font text, transparent bg, centered */}
        <button onClick={onContinue}
          aria-label="Sign in with UAE PASS"
          className="w-full border border-[#1C1D1A] rounded-2xl py-3 flex items-center justify-center gap-2 active:opacity-80 transition-opacity">
          <span className="w-6 h-6 inline-flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: uaePassLogoSvg }} />
          <span style={{ fontFamily: 'Dubai, Inter, sans-serif', fontSize: 18, fontWeight: 500, color: '#1A1A1A' }}>
            Sign in with UAE PASS
          </span>
        </button>
      </div>

      {/* Trust signals & terms */}
      <div className="relative mt-6 pb-6 px-7 text-center space-y-2.5 z-10">
        <div className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${trustCls}`}>
          <Shield size={12} className={shieldIconCls} /> Secured by end-to-end encryption
        </div>
        <div className={`text-[11px] leading-relaxed ${trustFineCls}`}>
          By signing in, you agree to our{' '}
          <span className={`font-semibold underline underline-offset-2 ${trustEmphasisCls}`}>Terms</span>
          {' '}and{' '}
          <span className={`font-semibold underline underline-offset-2 ${trustEmphasisCls}`}>Privacy Policy</span>
        </div>
        {ThemeToggle}
      </div>
    </div>
  );
}

/* ---------- 2. CUSTOMER PROFILE ---------- */
function CustomerProfile({ selected, onSelect, defaultIdx, onSetDefault, onBack, onContinue }:
  { selected: number; onSelect: (i: number) => void;
    defaultIdx: number | null; onSetDefault: (i: number | null) => void;
    onBack: () => void; onContinue: () => void }) {
  // Backend-shaped strings: "<CODE>-<COMPANY> - <ROLE>"
  const profiles = [
    { label: 'A1800-MAERSK LOGISTICS (UAE)FZE - IMPORTER',          role: 'Importer',          icon: Boxes,     tint: '#DCE7FB', tone: '#0E47A6' },
    { label: 'F0780-MAERSK LOGISTICS (UAE)FZE - FREEZONE LICENSEE', role: 'Freezone Licensee', icon: Building2, tint: '#E1ECFC', tone: '#1360D2' },
    { label: 'H00001-SONY GULF UAE LLC - HAULIER',                  role: 'Haulier',           icon: Truck,     tint: '#CFDEFA', tone: '#2950E5' },
    { label: 'F0781-CLEARWATER SEAFOOD FZCO - FREEZONE LICENSEE',   role: 'Freezone Licensee', icon: Building2, tint: '#DDE9FF', tone: '#1B59C9' },
  ];
  const active = profiles[selected] ?? profiles[0];
  return (
    <div className="flex flex-col h-full min-h-full bg-[#F4F7FE]">
      <DarkHeader title="Customer Profile" onBack={onBack} />

      {/* Selected profile summary card */}
      <div className="px-5 pt-5">
        <div className="relative overflow-hidden rounded-2xl text-white shadow-[0_18px_36px_-18px_rgba(14,27,61,0.45)]"
          style={{ background: 'linear-gradient(135deg, #0E1B3D 0%, #14306E 50%, #2950E5 100%)' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-25 blur-2xl" style={{ background: '#6FA0FF' }} />
          <div className="absolute -bottom-12 -left-6 w-48 h-48 rounded-full opacity-20 blur-2xl" style={{ background: '#2950E5' }} />
          <div className="relative p-5">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Selected Profile</div>
              <div className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/15 border border-white/15">{active.role}</div>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
                <active.icon size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold leading-snug break-words">{active.label}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-5 pt-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#0E47A6]">Choose customer profile</div>
          <div className="text-[11px] text-[#6B7280]">{profiles.length} available</div>
        </div>
        <div className="space-y-2.5">
          {profiles.map((p, i) => {
            const Icon = p.icon;
            const isActive = i === selected;
            const isDefault = i === defaultIdx;
            const toggleDefault = (e: React.MouseEvent) => {
              e.stopPropagation();
              onSetDefault(isDefault ? null : i);
            };
            return (
              <button key={i} onClick={() => onSelect(i)}
                className={`group w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                  isActive
                    ? 'bg-white border-[#B7CDF1] shadow-[0_6px_16px_-12px_rgba(19,96,210,0.4)]'
                    : 'bg-white border-[#EAF0FA] hover:border-[#D0DBF0]'}`}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: p.tint, color: p.tone }}>
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] leading-snug break-words"
                    style={{ fontWeight: isActive ? 700 : 400, color: isActive ? '#0E1B3D' : '#4A5565' }}>
                    {p.label}
                  </div>
                  {isActive && (
                    <div className="mt-1.5">
                      <span
                        role="button" tabIndex={0}
                        onClick={toggleDefault}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDefault(e as any); }}
                        className={`inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                          isDefault
                            ? 'bg-[#EAF1FE] border-[#B7CDF1] text-[#0E47A6]'
                            : 'bg-white border-[#E0EAFB] text-[#4A5565] hover:border-[#1360D2] hover:text-[#1360D2]'}`}>
                        <Check size={11} strokeWidth={3} />
                        {isDefault ? 'Default' : 'Set as default'}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition ${
                  isActive ? 'bg-[#1360D2] text-white' : 'border-[1.5px] border-[#D0DBF0] bg-white'}`}>
                  {isActive && <Check size={14} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Helper line */}
        <div className="mt-4 flex items-start gap-2.5 text-[12px] text-[#4A5565] leading-relaxed">
          <Info size={14} className="text-[#1360D2] mt-0.5 shrink-0" />
          <span>
            Mark a profile as <span className="font-semibold text-[#0E1B3D]">Default</span> to skip this step next time.
            You can change the active profile anytime from <span className="font-semibold text-[#0E1B3D]">Profile → Customer Type</span>.
          </span>
        </div>
      </div>

      <div className="px-5 pb-6 pt-4">
        <button onClick={onContinue}
          className="dt-btn-primary w-full text-white py-4 rounded-2xl font-bold uppercase tracking-wide flex items-center justify-center gap-2">
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* ---------- 3. ACCESSIBILITY ---------- */
function Accessibility({ fontSize, setFontSize, a11y, setA11y, theme, onToggleTheme, onBack, onContinue, onSkip }: any) {
  const sizes = [
    { label: 'Small', sample: 14 },
    { label: 'Medium', sample: 16 },
    { label: 'Large', sample: 18 },
    { label: 'Extra Large', sample: 20 },
  ];
  const toggles: { key: 'highContrast'|'boldText'|'reduceMotion'; title: string; desc: string; icon: any; tint: string; tone: string }[] = [
    { key: 'highContrast', title: 'High Contrast', desc: 'Enhance color contrast for better visibility', icon: Eye,  tint: '#E1ECFC', tone: '#0E47A6' },
    { key: 'boldText',     title: 'Bold Text',     desc: 'Make all text appear bolder',                  icon: Type, tint: '#DCE7FB', tone: '#1360D2' },
    { key: 'reduceMotion', title: 'Reduce Motion', desc: 'Minimize animations and transitions',          icon: Award, tint: '#CFDEFA', tone: '#2950E5' },
  ];
  const currentPx = sizes.find(s => s.label === fontSize)?.sample ?? 16;
  return (
    <div className="bg-[#F4F7FE] min-h-full pb-10">
      <DarkHeader title="Accessibility Settings" onBack={onBack} />

      <div className="px-5 pt-5 space-y-4">
        {/* Live preview */}
        <div className="bg-white rounded-2xl p-4 border border-[#E0EAFB] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#0E47A6]">Live preview</div>
            <div className="text-[11px] font-semibold text-[#1360D2]">{fontSize} · {currentPx}px</div>
          </div>
          <div className="mt-2 rounded-xl bg-gradient-to-br from-[#F4F7FE] to-[#EAF1FE] border border-[#D5E2F8] p-4">
            <div className="text-[#0E1B3D]"
              style={{ fontSize: `${currentPx}px`, fontWeight: a11y.boldText ? 800 : 700 }}>
              The quick brown fox
            </div>
            <div className="mt-1"
              style={{
                fontSize: `${Math.max(currentPx - 2, 12)}px`,
                fontWeight: a11y.boldText ? 600 : 400,
                color: a11y.highContrast ? '#0E1B3D' : '#4A5565',
              }}>
              jumps over the lazy dog at the port of Jebel Ali.
            </div>
          </div>
        </div>

        {/* Font size selector */}
        <div className="bg-white rounded-2xl p-5 border border-[#E0EAFB] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #0E47A6, #2950E5)' }}>
              <Type size={20} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-[#0E1B3D]">Font Size</div>
              <div className="text-xs text-[#6B7280]">Pick a size that's easy on your eyes</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {sizes.map(s => {
              const active = fontSize === s.label;
              return (
                <button key={s.label} onClick={() => setFontSize(s.label)}
                  className={`group relative py-3 rounded-xl border-[1.5px] transition-all ${active ? 'border-[#1360D2] bg-[#EAF1FE]' : 'border-[#E0EAFB] bg-white hover:border-[#B7CDF1]'}`}>
                  <div className={`font-bold ${active ? 'text-[#1360D2]' : 'text-[#0E1B3D]'}`}
                    style={{ fontSize: `${s.sample - 2}px`, lineHeight: 1 }}>Aa</div>
                  <div className={`mt-1.5 text-[10px] font-semibold ${active ? 'text-[#1360D2]' : 'text-[#6B7280]'}`}>{s.label}</div>
                  {active && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1360D2] text-white flex items-center justify-center">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Appearance / theme */}
        <div className="bg-white rounded-2xl border border-[#E0EAFB] shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #0E1B3D, #1360D2)' }}>
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div className="flex-1">
              <div className="font-bold text-[#0E1B3D]">Appearance</div>
              <div className="text-xs text-[#6B7280]">Pick the look that feels best to you</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { v: 'light', label: 'Light', icon: Sun, hint: 'Bright & clean' },
              { v: 'dark',  label: 'Dark',  icon: Moon, hint: 'Easy on the eyes' },
            ].map(opt => {
              const active = theme === opt.v;
              const Ico = opt.icon;
              return (
                <button key={opt.v} onClick={() => { if (theme !== opt.v) onToggleTheme?.(); }}
                  className={`relative py-3 px-3 rounded-xl border-[1.5px] transition-all text-left ${active ? 'border-[#1360D2] bg-[#EAF1FE]' : 'border-[#E0EAFB] bg-white hover:border-[#B7CDF1]'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${active ? 'bg-[#1360D2] text-white' : 'bg-[#F4F7FE] text-[#1360D2]'}`}>
                    <Ico size={14} />
                  </div>
                  <div className={`mt-2 text-[13px] font-bold ${active ? 'text-[#1360D2]' : 'text-[#0E1B3D]'}`}>{opt.label}</div>
                  <div className="text-[10.5px] text-[#6B7280]">{opt.hint}</div>
                  {active && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1360D2] text-white flex items-center justify-center">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Display toggles */}
        <div className="bg-white rounded-2xl border border-[#E0EAFB] shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #1360D2, #6FA0FF)' }}>
              <Eye size={20} />
            </div>
            <div>
              <div className="font-bold text-[#0E1B3D]">Display & Motion</div>
              <div className="text-xs text-[#6B7280]">Fine-tune how the interface looks and moves</div>
            </div>
          </div>
          <div className="px-2 pb-2">
            {toggles.map((t, i) => {
              const Icon = t.icon;
              const on = a11y[t.key];
              return (
                <button key={t.key}
                  onClick={() => setA11y({ ...a11y, [t.key]: !on })}
                  className={`w-full text-left flex items-center gap-3 px-3 py-3.5 rounded-xl ${i < toggles.length - 1 ? 'border-b border-[#F0F3F9]' : ''} hover:bg-[#F4F7FE] transition-colors`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: t.tint, color: t.tone }}>
                    <Icon size={17} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[15px] text-[#0E1B3D]">{t.title}</div>
                    <div className="text-xs text-[#6B7280]">{t.desc}</div>
                  </div>
                  <Toggle on={on} onChange={() => setA11y({ ...a11y, [t.key]: !on })} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Action area */}
        <div className="pt-1 space-y-3">
          <button onClick={onContinue}
            className="dt-btn-primary w-full text-white py-4 rounded-2xl font-bold uppercase tracking-wide flex items-center justify-center gap-2">
            Save & Continue <ArrowRight size={18} />
          </button>
          <div className="text-center">
            <button onClick={onSkip}
              className="text-[13px] font-semibold text-[#4A5565] hover:text-[#1360D2] transition-colors">
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`w-12 h-7 rounded-full p-0.5 transition ${on ? 'bg-[#0E1B3D]' : 'bg-gray-300'}`}>
      <div className={`w-6 h-6 bg-white rounded-full shadow transform transition ${on ? 'translate-x-5' : ''}`} />
    </button>
  );
}

/* ---------- 4 / 5. DASHBOARD (grid + list) ---------- */
function Dashboard({ view, setView, onOpenSettings, onTab, onAdvanceDeposit, onPrepaidCard, onImportFCL, onGatePass, onContainers, onVessels, onNotifications, onRequestDDO }:
  { view: View; setView: (v: View) => void; onOpenSettings: () => void; onTab: (t: Screen) => void;
    onAdvanceDeposit: () => void; onPrepaidCard: () => void; onImportFCL: () => void; onGatePass: () => void; onContainers: () => void; onVessels: () => void; onNotifications: () => void; onRequestDDO: () => void }) {
  return (
    <div className="bg-[#F8FAFF] min-h-full flex flex-col" data-tour-root>
      <DashboardHeader view={view} setView={setView} onOpenSettings={onOpenSettings} onBell={onNotifications} />
      <div className="px-6 pt-4 space-y-5">
        <div data-tour="payments">
        <Section title="Payments">
          {view === 'grid' ? (
            <div className="grid grid-cols-2 gap-3">
              <PaymentCard icon={Wallet} amount="77001.18" label="Advance Deposit" onClick={onAdvanceDeposit} />
              <PaymentCard icon={CreditCard} amount="3500.00" label="Prepaid Card" onClick={onPrepaidCard} />
              <PaymentCard icon={Wallet} amount="77001.18" label="Import FCL Bills" onClick={onImportFCL} />
              <PaymentCard icon={CreditCard} amount="3500.00" label="TLUC Payments" />
            </div>
          ) : (
            <div className="space-y-2">
              <PaymentRow icon={Wallet} amount="77001.18" label="Advance Deposit" onClick={onAdvanceDeposit} />
              <PaymentRow icon={CreditCard} amount="3500.00" label="Prepaid Card" onClick={onPrepaidCard} />
              <PaymentRow icon={Wallet} amount="77001.18" label="Import FCL Bills" onClick={onImportFCL} />
              <PaymentRow icon={CreditCard} amount="3500.00" label="TLUC Payments" />
            </div>
          )}
        </Section>
        </div>

        <div data-tour="trade">
        <Section title="Trade +" action="REQUEST DDO" onAction={onRequestDDO}>
          <StatGrid stats={[
            { n: 5, l: 'Nearing Expiry', c: 'text-[#D67E74]' },
            { n: 12, l: 'Submitted', c: 'text-[#6A7BC7]' },
            { n: 3, l: 'Pending', c: 'text-[#D3AB40]' },
            { n: 5, l: 'Completed', c: 'text-[#5CB78F]' },
          ]} />
        </Section>
        </div>

        <div data-tour="declaration">
        <Section title="Custom Declaration" action="TRACK">
          <StatGrid stats={[
            { n: 5, l: 'Nearing Expiry', c: 'text-[#D67E74]' },
            { n: 12, l: 'Submitted', c: 'text-[#6A7BC7]' },
            { n: 3, l: 'Pending', c: 'text-[#D3AB40]' },
            { n: 5, l: 'Cleared', c: 'text-[#5CB78F]' },
          ]} />
        </Section>
        </div>

        <div data-tour="cargo">
        <Section title="Cargo Management">
          <div className="grid grid-cols-3 gap-3">
            <CargoCard icon={Ship} n={2} l="Vessels Added" onClick={onVessels} />
            <CargoCard icon={Package} n={10} l="Containers Added" onClick={onContainers} />
            <CargoCard icon={FileText} n={100} l="Gate Pass · BOE" />
          </div>
        </Section>
        </div>

        <div data-tour="recent">
        <Section title="Recently Used Services">
          <div className="space-y-2">
            <RecentRow icon={FileCheck} title="Delivery Order" sub="Used 2 hours ago" />
            <RecentRow icon={MapPin} title="Gate Pass" sub="Used yesterday" onClick={onGatePass} />
          </div>
        </Section>
        </div>
      </div>
      <BottomNav active="home" onTab={onTab} dataTour="nav" />
    </div>
  );
}

/* ---------- Dashboard guided tour overlay ---------- */
function DashboardTour({ onDone }: { onDone: () => void }) {
  const steps: { selector: string; title: string; body: string; placement: 'below' | 'above' }[] = [
    { selector: '[data-tour-anchor="settings"]', title: 'Customise your dashboard', body: 'Tap the gear to choose which sections appear and reorder them.', placement: 'below' },
    { selector: '[data-tour-anchor="bell"]',     title: 'Stay in the loop',         body: 'Vessel arrivals, payment receipts and approvals all land here.', placement: 'below' },
    { selector: '[data-tour="payments"]',        title: 'Manage payments fast',     body: 'Top up Advance Deposit & Prepaid Card, or pay FCL bills in one tap.', placement: 'below' },
    { selector: '[data-tour="trade"]',           title: 'Trade + at a glance',      body: 'Track Delivery Orders by status: nearing expiry, pending and completed.', placement: 'above' },
    { selector: '[data-tour="declaration"]',     title: 'Custom Declarations',      body: 'Monitor declarations as they move from submitted to cleared.', placement: 'above' },
    { selector: '[data-tour="cargo"]',           title: 'Cargo Management',         body: 'Jump into your saved vessels, containers and Gate Pass · BOE records.', placement: 'above' },
    { selector: '[data-tour="nav"]',             title: 'Get around quickly',       body: 'Use the bottom bar to switch between Home, Services and Profile.', placement: 'above' },
  ];
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const phone = document.querySelector('.phone-frame') as HTMLElement | null;
    if (!phone) return;
    const target = document.querySelector(steps[idx].selector) as HTMLElement | null;
    if (!target) { setRect(null); return; }
    // Scroll the target into the visible area of the phone scroller before measuring.
    const scroller = phone.querySelector('.phone-scroll') as HTMLElement | null;
    if (scroller) {
      const t = target.getBoundingClientRect();
      const s = scroller.getBoundingClientRect();
      const within = t.top - s.top + scroller.scrollTop;
      // Center the target vertically when possible.
      scroller.scrollTo({ top: Math.max(within - 220, 0), behavior: 'smooth' });
    }
    const measure = () => {
      const t = target.getBoundingClientRect();
      const p = phone.getBoundingClientRect();
      setRect({
        top: t.top - p.top - 6,
        left: t.left - p.left - 6,
        width: t.width + 12,
        height: t.height + 12,
      });
    };
    // Measure now and again after the scroll settles.
    measure();
    const t1 = setTimeout(measure, 360);
    return () => clearTimeout(t1);
  }, [idx]);

  const last = idx === steps.length - 1;
  const cardTop = rect
    ? (steps[idx].placement === 'below'
        ? Math.min(rect.top + rect.height + 14, 700)
        : Math.max(rect.top - 150, 80))
    : 280;

  return (
    <div className="dt-tour-mask" onClick={onDone}>
      {rect && (
        <div className="dt-tour-highlight"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />
      )}
      <div className="dt-tour-card" style={{ top: cardTop }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#1360D2]">
          <span>Tour · {idx + 1} of {steps.length}</span>
          <button onClick={onDone}
            className="px-2.5 py-1 rounded-full bg-[#F0F4FB] hover:bg-[#E1E9F8] text-[#4A5565] text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
            Skip tour <X size={11} />
          </button>
        </div>
        <div className="mt-1.5 text-[16px] font-bold text-[#0E1B3D] leading-snug">{steps[idx].title}</div>
        <div className="mt-1 text-[13px] text-[#4A5565] leading-relaxed">{steps[idx].body}</div>
        <div className="mt-3 flex items-center gap-1.5">
          {steps.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              aria-label={`Tour step ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === idx ? 22 : 6, background: i === idx ? '#1360D2' : '#D1D5DC' }} />
          ))}
          <div className="flex-1" />
          {idx > 0 && (
            <button onClick={() => setIdx(i => Math.max(0, i - 1))}
              className="dt-btn-secondary px-3 py-1.5 rounded-lg text-[12px] font-bold">
              Back
            </button>
          )}
          <button onClick={() => last ? onDone() : setIdx(i => Math.min(steps.length - 1, i + 1))}
            className="dt-btn-primary text-white px-4 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1">
            {last ? 'Got it' : 'Next'} {!last && <ArrowRight size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardHeader({ view, setView, onOpenSettings, onBell }:
  { view: View; setView: (v: View) => void; onOpenSettings: () => void; onBell?: () => void }) {
  return (
    <div className="bg-[#0E1B3D] dt-safe-top px-6 pt-6 pb-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-b from-[#0E47A6] via-[#1360D2] to-[#2950E5] flex items-center justify-center text-lg font-bold">
            A
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#14C9A9] border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="font-bold">Ahmed</div>
            <div className="text-xs opacity-80">Agent Code : 123456</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button data-tour-anchor="settings" onClick={onOpenSettings} className="w-9 h-9 rounded-xl flex items-center justify-center">
            <Settings size={20} />
          </button>
          <button data-tour-anchor="bell" onClick={onBell} className="relative w-9 h-9 rounded-xl flex items-center justify-center">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F9A83D] border border-white rounded-full" />
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-lg font-bold">Dashboard</div>
        <div className="bg-white border border-gray-200 rounded-xl p-0.5 flex shadow-sm">
          <button onClick={() => setView('grid')}
            className={`w-10 h-8 rounded-lg flex items-center justify-center ${view === 'grid' ? 'bg-gradient-to-b from-[#0E47A6] via-[#1360D2] to-[#2950E5] text-white' : 'text-gray-500'}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setView('list')}
            className={`w-10 h-8 rounded-lg flex items-center justify-center ${view === 'list' ? 'bg-gradient-to-b from-[#0E47A6] via-[#1360D2] to-[#2950E5] text-white' : 'text-gray-500'}`}>
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, action, onAction, children }:
  { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-sm text-[#2D3750]">{title}</div>
        {action && (
          <button onClick={onAction} className="flex items-center gap-1 text-xs font-bold text-[#3F7DE0]">
            {action} <ChevronRight size={12} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function PaymentCard({ icon: Icon, amount, label, onClick }: any) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl px-3 py-3.5 shadow-sm flex items-center gap-2 text-left w-full">
      <Icon size={20} className="text-[#1360D2]" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[#27314B] text-[15px] truncate">
          <Dh /> {amount}
        </div>
        <div className="text-[10px] text-[#7F8A9F] font-medium truncate">{label}</div>
      </div>
      <ChevronRight size={14} className="text-gray-300" />
    </button>
  );
}

function PaymentRow({ icon: Icon, amount, label, onClick }: any) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 w-full text-left">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1360D2]">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="font-bold text-[#27314B] text-[15px]">
          <Dh /> {amount}
        </div>
        <div className="text-[11px] text-[#7F8A9F] font-medium">{label}</div>
      </div>
      <ChevronRight size={16} className="text-gray-400" />
    </button>
  );
}

function StatGrid({ stats }: { stats: { n: number; l: string; c: string }[] }) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-xl py-3 px-2 shadow-sm text-center">
          <div className="font-bold text-[#27314B] text-lg">{s.n}</div>
          <div className={`text-[9px] font-bold ${s.c}`}>{s.l}</div>
        </div>
      ))}
    </div>
  );
}

function CargoCard({ icon: Icon, n, l, onClick }: any) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl py-3.5 px-2 shadow-sm flex flex-col items-center gap-2 w-full">
      <Icon size={22} className="text-[#1360D2]" />
      <div className="font-bold text-[#27314B] text-lg">{n}</div>
      <div className="text-[10px] font-bold text-[#7F8A9F] text-center">{l}</div>
    </button>
  );
}

function RecentRow({ icon: Icon, title, sub, onClick }: any) {
  return (
    <button onClick={onClick} className="bg-white rounded-xl px-3 py-3 flex items-center gap-3 shadow-sm w-full text-left">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1360D2]">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="font-bold text-[#0E1B3D] text-sm">{title}</div>
        <div className="text-xs text-gray-500">{sub}</div>
      </div>
      <ChevronRight size={16} className="text-gray-400" />
    </button>
  );
}

/* ---------- 6. SERVICES ---------- */
function Services({ onTab, onOpenPayments, onOpenCargoMgmt }:
  { onTab: (t: Screen) => void; onOpenPayments: () => void; onOpenCargoMgmt: () => void }) {
  const [tab, setTab] = useState<'all'|'payments'|'tracking'|'requests'|'hr'|'cargoMgmt'>('all');
  const cats = [
    { label: 'Payments', n: 2, icon: Wallet, onClick: onOpenPayments },
    { label: 'Tracking', n: 2, icon: Truck },
    { label: 'Cargo Clearance', n: 3, icon: Package },
    { label: 'Requests', n: 4, icon: FileText },
    { label: 'Cargo Management', n: 4, icon: Boxes, onClick: onOpenCargoMgmt },
  ];
  return (
    <div className="bg-[#F8F9FA] min-h-full flex flex-col">
      <div className="bg-[#0E1B3D] dt-safe-top text-white pt-6 pb-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-b from-[#0E47A6] via-[#1360D2] to-[#2950E5] flex items-center justify-center font-bold">
              A
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#14C9A9] border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="font-bold">Ahmed</div>
              <div className="text-xs opacity-80">Agent Code : 123456</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Settings size={20} />
            <Bell size={20} />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-lg font-bold">All Services</div>
          <div className="text-[11px] opacity-80">13 services available</div>
        </div>
        <div className="mt-3 bg-white rounded-lg flex items-center gap-2 px-3 py-2">
          <Search size={14} className="text-gray-400" />
          <input placeholder="Search services..."
            className="flex-1 text-xs outline-none text-gray-700" />
        </div>
      </div>
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex gap-2 overflow-x-auto">
        {[
          { k: 'all', t: 'All', n: 13 },
          { k: 'payments', t: 'Payments', n: 2 },
          { k: 'tracking', t: 'Tracking', n: 2 },
          { k: 'requests', t: 'Requests', n: 4 },
          { k: 'cargoMgmt', t: 'Cargo Mgmt', n: 4 },
          { k: 'hr', t: 'HR', n: 1 },
        ].map(c => (
          <button key={c.k} onClick={() => setTab(c.k as any)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-bold ${
              tab === c.k ? 'bg-gradient-to-b from-[#0E47A6] via-[#1360D2] to-[#2950E5] text-white' : 'bg-gray-100 text-gray-600'}`}>
            {c.t} <span className={tab === c.k ? 'text-white/80' : 'text-gray-400'}>({c.n})</span>
          </button>
        ))}
      </div>
      <div className="p-6 grid grid-cols-2 gap-3">
        {cats.map(c => {
          const Icon = c.icon;
          return (
            <button key={c.label} onClick={c.onClick}
              className="bg-white border border-gray-200 rounded-2xl py-5 flex flex-col items-center gap-3 hover:shadow">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-[#1360D2]">
                <Icon size={28} />
              </div>
              <div className="text-[17px] font-semibold text-[#27314B]">{c.label}</div>
              <div className="text-xs text-[#7F8A9F]">{c.n} services</div>
            </button>
          );
        })}
      </div>
      <BottomNav active="services" onTab={onTab} />
    </div>
  );
}

/* ---------- 7. PROFILE ---------- */
function Profile({ onTab, biometric, setBiometric, onSignOut, onResetPassword, onNotificationsSettings, onRenewNow }:
  { onTab: (t: Screen) => void; biometric: boolean; setBiometric: (v: boolean) => void; onSignOut: () => void;
    onResetPassword: () => void; onNotificationsSettings: () => void; onRenewNow: () => void }) {
  return (
    <div className="bg-gradient-to-b from-[#F8F9FB] to-[#EEF2F7] min-h-full flex flex-col">
      <div className="bg-[#0E1B3D] dt-safe-top pb-20 px-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-[#478CF7]/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col items-center text-white">
          <div className="w-20 h-20 rounded-2xl border-4 border-white/20 bg-white/10 flex items-center justify-center text-3xl font-bold">A</div>
          <div className="mt-3 text-xl font-bold">Ahmed</div>
          <div className="text-sm text-white/80">Ahmed.rashid@company.ae</div>
        </div>
      </div>
      <div className="px-5 -mt-12 space-y-4 relative z-10">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#0E47A6] via-[#1360D2] to-[#2950E5] flex items-center justify-center text-white">
              <Award size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-[#27314B] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#14C9A9]" /> Annual Subscription
              </div>
              <div className="text-[#0E1B3D] font-medium">Expiring in 25 days</div>
            </div>
          </div>
          <button onClick={onRenewNow} className="w-full mt-3 bg-[#0E1B3D] text-white py-2.5 rounded-lg text-sm font-bold">RENEW NOW</button>
        </div>

        <div className="bg-gradient-to-b from-[#FAFBFC] to-[#F5F7FA] border border-gray-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-wider text-[#7F8A9F] uppercase">Customer</div>
            <div className="text-[#27314B] font-bold text-sm">M0042-CLEARING AGENT-MAERSK...</div>
          </div>
          <button className="text-[#1360D2] font-bold text-xs">CHANGE</button>
        </div>

        <div>
          <div className="text-sm font-semibold text-[#2D3750] mb-2">Quick Actions</div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-[#1360D2]">
                  <Fingerprint size={22} />
                </div>
                <div>
                  <div className="font-bold text-[#0E1B3D]">Biometric Login</div>
                  <div className="text-xs text-gray-400">Use fingerprint to login</div>
                </div>
              </div>
              <Toggle on={biometric} onChange={setBiometric} />
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-[#0E1B3D] mb-2">Settings</div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {[
              { icon: Key, label: 'Reset Password', onClick: onResetPassword },
              { icon: Info, label: 'About Dubai Trade' },
              { icon: Shield, label: 'Privacy & Security' },
              { icon: Bell, label: 'Notifications', onClick: onNotificationsSettings },
            ].map((row, i, arr) => (
              <button key={row.label} onClick={row.onClick}
                className={`w-full flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center gap-3">
                  <row.icon size={18} className="text-[#0E1B3D]" />
                  <span className="font-bold text-sm text-[#0E1B3D]">{row.label}</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        <button onClick={onSignOut}
          className="w-full bg-red-50 text-red-600 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2">
          <LogOut size={18} /> SIGN OUT
        </button>
      </div>
      <BottomNav active="profile" onTab={onTab} />
    </div>
  );
}

/* ---------- 8. CUSTOMIZE DASHBOARD (modal) ---------- */
function CustomizeDashboard({ sections, setSections, onClose }: any) {
  const rows = [
    { key: 'payments', icon: Wallet, title: 'Payments', desc: 'Financial accounts overview' },
    { key: 'trade', icon: Box, title: 'Trade +', desc: 'Ongoing applications' },
    { key: 'cargo', icon: Truck, title: 'Cargo Movements', desc: 'Current orders & services' },
  ];
  return (
    <div className="absolute inset-0 bg-black/75 flex items-end z-50">
      <div className="bg-white w-full rounded-t-3xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="text-lg font-bold text-[#0E1B3D]">Customize Dashboard</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <div className="text-xs text-gray-500">Choose which sections to display on your dashboard</div>
          {rows.map(r => (
            <div key={r.key} className="bg-gray-50 rounded-xl px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <r.icon size={26} className="text-[#0E1B3D]" />
                <div>
                  <div className="font-semibold text-sm text-[#27314B]">{r.title}</div>
                  <div className="text-xs text-[#7F8A9F]">{r.desc}</div>
                </div>
              </div>
              <Toggle on={sections[r.key]} onChange={(v) => setSections({ ...sections, [r.key]: v })} />
            </div>
          ))}
          <button onClick={onClose}
            className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold shadow mt-2">
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 9. PAYMENTS (service detail) ---------- */
function Payments({ onBack, onAdvanceDeposit, onPrepaidCard }:
  { onBack: () => void; onAdvanceDeposit: () => void; onPrepaidCard: () => void }) {
  const [tab, setTab] = useState<'Payments'|'Tracking'|'Cargo'|'Requests'>('Payments');
  const services = [
    { title: 'Advance Deposit', desc: 'Add funds to your account for quick transactions', popular: true, icon: Wallet, onClick: onAdvanceDeposit },
    { title: 'Prepaid Card', desc: 'Add funds to your account for quick transactions', icon: CreditCard, onClick: onPrepaidCard },
    { title: 'Import FCL Bills', desc: 'Add funds to your account for quick transactions', icon: FileText, onClick: () => {} },
  ];
  const tabs = [
    { k: 'Payments', icon: Wallet }, { k: 'Tracking', icon: Truck },
    { k: 'Cargo', icon: Package }, { k: 'Requests', icon: ClipboardList },
  ] as const;
  return (
    <div className="bg-[#F8F9FA] min-h-full">
      <div className="bg-[#0E1B3D] dt-safe-top px-6 pt-6 pb-5 text-white">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="text-xl font-bold">Payment Services</div>
            <div className="text-sm text-white/70">2 available</div>
          </div>
        </div>
      </div>
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-2 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k as any)}
              className={`shrink-0 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                active ? 'bg-gradient-to-b from-[#0E47A6] via-[#1360D2] to-[#2950E5] text-white shadow'
                       : 'bg-gray-100 text-[#4A5565]'}`}>
              <Icon size={16} /> {t.k}
            </button>
          );
        })}
      </div>
      <div className="p-6 space-y-3">
        {services.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.title} onClick={s.onClick} className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex gap-4 items-start text-left hover:shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white shrink-0 shadow">
                <Icon size={26} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#0A1628]">{s.title}</div>
                  {s.popular && (
                    <span className="bg-[#2B7FFF] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">Popular</span>
                  )}
                </div>
                <div className="text-sm text-[#7F8A9F] mt-1">{s.desc}</div>
              </div>
              <ArrowRight size={18} className="text-gray-300 mt-2" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Shared bits ---------- */
function DarkHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="bg-[#0E1B3D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
      {onBack && (
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={18} />
        </button>
      )}
      <div className="font-medium text-white">{title}</div>
    </div>
  );
}

function BottomNav({ active, onTab, dataTour }: { active: 'home'|'services'|'profile'; onTab: (t: Screen) => void; dataTour?: string }) {
  const items = [
    { k: 'home', label: 'Home', icon: Home, screen: 'dashboard' as Screen },
    { k: 'services', label: 'Services', icon: LayoutGrid, screen: 'services' as Screen },
    { k: 'profile', label: 'Profile', icon: User, screen: 'profile' as Screen },
  ];
  return (
    <div data-tour={dataTour} className="sticky bottom-0 left-0 right-0 z-30 mt-auto bg-white border-t border-gray-200 shadow-[0_-6px_18px_-12px_rgba(14,27,61,0.18)] px-6 py-3 flex justify-between">
      {items.map(it => {
        const Icon = it.icon;
        const isActive = active === it.k;
        return (
          <button key={it.k} onClick={() => onTab(it.screen)}
            className="flex flex-col items-center gap-1 flex-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isActive ? 'dt-btn-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Icon size={20} />
            </div>
            <span className={`text-xs ${isActive ? 'text-[#1360D2] font-bold' : 'text-gray-500'}`}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- BOTTOM SHEET WRAPPER ---------- */
function BottomSheet({ title, onClose, children }:
  { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 bg-[#0E1B3D]/70 flex items-end z-50">
      <div className="bg-white w-full rounded-t-3xl max-h-[90%] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 shrink-0">
          <div className="text-lg font-semibold text-[#1E2939]">{title}</div>
          <button onClick={onClose} className="text-gray-500"><X size={22} /></button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------- ADVANCE DEPOSIT MODAL ---------- */
function AdvanceDeposit({ onClose, paymentMethod, setPaymentMethod, autoTopup, onToggleAutoTopup }: any) {
  const [amount, setAmount] = useState('1300');
  const quick = ['250', '1300', '2000', '5000'];
  return (
    <BottomSheet title="Advance Deposit" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#364153] mb-2">Enter Top Up Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0E1B3D] font-bold text-sm"><Dh /></span>
            <input value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-4 text-lg outline-none" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Min: <span className="text-[#0E1B3D] font-medium"><Dh /> 100.00</span> | Max: <span className="text-[#0E1B3D] font-medium"><Dh /> 50,000.00</span></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#364153] mb-2">Choose from Your last 4 Transactions</label>
          <div className="grid grid-cols-4 gap-2">
            {quick.map(q => (
              <button key={q} onClick={() => setAmount(q)}
                className={`py-3 rounded-xl border text-sm font-medium ${amount === q ? 'bg-[#EFF6FF] border-[#2B7FFF] text-[#1447E6]' : 'border-gray-200 text-[#364153]'}`}>
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-[#EFF6FF] rounded-xl p-4">
          <div className="flex justify-between py-1 text-sm">
            <span className="text-[#4A5565]">Top-up Amount</span>
            <span className="font-medium text-[#1E2939]"><Dh /> {amount}.00</span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-[#4A5565]">Processing Fee</span>
            <span className="font-medium text-[#1E2939]">0.00</span>
          </div>
          <div className="border-t border-[#BEDBFF] mt-2 pt-2 flex justify-between items-center">
            <span className="font-medium text-[#1E2939]">Total Amount</span>
            <span className="font-bold text-lg text-[#155DFC]"><Dh /> {amount}.00</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-sm">Payment Method</span>
            <span className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">Default</span>
          </div>
          <button onClick={() => setPaymentMethod('applepay')}
            className={`w-full bg-white border rounded-lg py-4 flex items-center justify-center gap-2 shadow-sm
              ${paymentMethod === 'applepay' ? 'border-black' : 'border-gray-200'}`}>
            <span className="font-medium text-black">Pay with</span>
            <span className="font-bold text-black text-lg" style={{ fontFamily: 'system-ui' }}> Pay</span>
          </button>
          <div className="text-sm font-bold text-[#696F83] mt-3 mb-1">Other Method</div>
          <button onClick={() => setPaymentMethod('rosoom')}
            className={`w-full bg-white border rounded-lg py-3.5 flex items-center gap-3 px-3
              ${paymentMethod === 'rosoom' ? 'border-[#1360D2]' : 'border-gray-200'}`}>
            <CreditCard size={26} className="text-[#1360D2]" />
            <span className="font-medium text-[#1360D2]">Rosoom Payment Gateway</span>
          </button>
          <div className="flex items-center gap-2 mt-3">
            <Toggle on={false} onChange={() => {}} />
            <span className="text-xs">Mark as default</span>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 flex items-start justify-between">
          <div>
            <div className="font-bold text-sm">Auto Top-up</div>
            <div className="text-xs text-gray-500 mt-1 max-w-[260px]">Automatically top-up when balance reaches the threshold amount</div>
          </div>
          <Toggle on={autoTopup} onChange={onToggleAutoTopup} />
        </div>
        <button onClick={onClose}
          className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold shadow">TOP UP</button>
      </div>
    </BottomSheet>
  );
}

/* ---------- AUTO TOP-UP MODAL ---------- */
function AutoTopupModal({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <BottomSheet title="Advance Deposit" onClose={onCancel}>
      <div className="space-y-5">
        <div className="font-bold text-lg text-[#1E2939]">Auto Top-up</div>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium text-[#364153]">Auto Top-up</div>
            <div className="text-xs text-gray-500 mt-1 max-w-[260px]">Automatically top-up when balance reaches the threshold amount</div>
          </div>
          <Toggle on={true} onChange={() => {}} />
        </div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#364153] mb-2">Top-up when the amount reaches</label>
            <input placeholder="Enter threshold amount"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#364153] mb-2">Top-up Duration</label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none bg-white">
              <option>Weekly</option><option>Monthly</option><option>Quarterly</option>
            </select>
          </div>
        </div>
        <div className="pt-2 space-y-3">
          <button onClick={onSave}
            className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold shadow uppercase">Save</button>
          <button onClick={onCancel}
            className="w-full bg-white border border-gray-200 text-[#1360D2] py-3.5 rounded-2xl font-bold shadow uppercase">Cancel</button>
        </div>
      </div>
    </BottomSheet>
  );
}

/* ---------- PREPAID CARD TOP-UP (has card) ---------- */
function PrepaidTopup({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('1000');
  return (
    <BottomSheet title="Prepaid Card" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#364153] mb-2">Enter Top Up Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0E1B3D] font-bold text-sm"><Dh /></span>
            <input value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-4 text-lg outline-none" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Min: <span className="text-[#0E1B3D] font-medium"><Dh /> 100.00</span> | Max: <span className="text-[#0E1B3D] font-medium"><Dh /> 50,000.00</span></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#364153] mb-2">Quick Select</label>
          <div className="grid grid-cols-4 gap-2">
            {['500','1000','2000','5000'].map(q => (
              <button key={q} onClick={() => setAmount(q)}
                className={`py-3 rounded-xl border text-sm font-medium ${amount === q ? 'bg-[#EFF6FF] border-[#2B7FFF] text-[#1447E6]' : 'border-gray-200 text-[#364153]'}`}>
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-[#EFF6FF] rounded-xl p-4">
          <div className="flex justify-between py-1 text-sm">
            <span className="text-[#4A5565]">Top-up Amount</span>
            <span className="font-medium text-[#1E2939]"><Dh /> {amount}.00</span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-[#4A5565]">Processing Fee</span>
            <span className="font-medium text-[#1E2939]">0.00</span>
          </div>
          <div className="border-t border-[#BEDBFF] mt-2 pt-2 flex justify-between items-center">
            <span className="font-medium text-[#1E2939]">Total Amount</span>
            <span className="font-bold text-lg text-[#155DFC]"><Dh /> {amount}.00</span>
          </div>
        </div>
        <button onClick={onClose}
          className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold shadow">TOP UP</button>
      </div>
    </BottomSheet>
  );
}

/* ---------- PREPAID CARD EMPTY STATE ---------- */
function PrepaidEmpty({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  return (
    <BottomSheet title="Prepaid Card" onClose={onClose}>
      <div className="space-y-5">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-red-700">No prepaid card found</div>
            <div className="text-sm text-red-700 mt-1">Please add a prepaid card before making an advance deposit.</div>
          </div>
        </div>
        <button onClick={onAdd}
          className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold shadow uppercase">Add Prepaid Card First</button>
      </div>
    </BottomSheet>
  );
}

/* ---------- ADD PREPAID CARD ---------- */
function AddPrepaidCard({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  return (
    <BottomSheet title="Add Prepaid Card" onClose={onClose}>
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-[#155DFC] to-[#0E1B3D] rounded-2xl p-5 text-white relative h-[180px] shadow-lg">
          <div className="flex items-center justify-between">
            <CreditCard size={32} />
            <div className="opacity-90">Prepaid Card</div>
          </div>
          <div className="mt-8 text-xl tracking-widest font-mono">•••• •••• •••• ••••</div>
          <div className="flex justify-between mt-5">
            <div>
              <div className="text-xs opacity-75">Cardholder</div>
              <div className="text-sm font-medium">YOUR NAME</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75">Expires</div>
              <div className="text-sm font-medium">MM/YY</div>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#364153] mb-2">Card Number</label>
          <input placeholder="1234 5678 9012 3456"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#364153] mb-2">Cardholder Name</label>
          <input placeholder="JOHN DOE"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#364153] mb-2">Expiry Date</label>
            <input placeholder="MM/YY"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#364153] mb-2">CVV</label>
            <input placeholder="123"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none" />
          </div>
        </div>
        <button onClick={onAdded}
          className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold shadow uppercase">Add Card</button>
      </div>
    </BottomSheet>
  );
}

/* ---------- DDO SEARCH BOTTOM SHEET (initial) ---------- */
function DDOSearchScreen({ onBack, onSearch }: { onBack: () => void; onSearch: () => void }) {
  return (
    <div className="bg-[#F8FAFF] min-h-full">
      <div className="bg-[#0E1B3D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white">
          <div className="font-bold text-lg">Request DDO</div>
        </div>
      </div>
      <BottomSheet title="Search B/L" onClose={onBack}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#364153] mb-2">Shipping Agent</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Msk T180 s12345"
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#364153] mb-2">B/L Number</label>
            <input placeholder="BOL324565477"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none" />
          </div>
          <div className="text-center text-sm text-gray-500">2 requests available</div>
          <button onClick={onSearch}
            className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold shadow uppercase">Search & Request</button>
        </div>
      </BottomSheet>
    </div>
  );
}

/* ---------- REQUEST DDO (full form) ---------- */
function RequestDDO({ onBack, onBLParty, onDDOParty, onDocs, onPay }:
  { onBack: () => void; onBLParty: () => void; onDDOParty: () => void; onDocs: () => void; onPay: () => void }) {
  return (
    <div className="bg-[#F9FBFF] min-h-full pb-8">
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow sticky top-0 z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white font-bold text-xl">Request DDO</div>
      </div>
      <div className="p-6 space-y-5">
        <div className="bg-gradient-to-r from-[#EFF6FF] to-[#EEF2FF] border border-blue-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2B7FFF] to-[#155DFC] flex items-center justify-center text-white">
            <FileText size={26} />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500">Bill of Lading</div>
            <div className="text-xl font-bold text-[#1E2939]">BOL324565477</div>
            <button className="mt-2 text-xs font-bold text-[#1E6FFF] border border-[#1E6FFF] rounded-full px-3 py-1">View Details</button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#1360D2]"><Calendar size={20} /></div>
            <div className="font-medium text-[#364153]">DDO Validity</div>
          </div>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400">›</button>
        </div>

        <div>
          <div className="font-bold text-lg text-[#1E2939] mb-3">Party Information</div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-7 rounded-full border-2 border-[#155DFC] bg-[#EFF6FF] flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-[#155DFC]" />
                </div>
                <div>
                  <div className="font-bold text-[#155DFC]">Requesting Party</div>
                  <div className="text-sm text-gray-600 max-w-[200px]">MAERSK KANOO LLC UNITED DUBAI</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
            <PartyRow label="B/L Party" sub="Tap to add details" onClick={onBLParty} />
            <PartyRow label="DDO Party" sub="Tap to add details" onClick={onDDOParty} />
            <PartyRow label="Documents" sub="Tap to upload" onClick={onDocs} last />
          </div>
        </div>

        <div>
          <div className="font-bold text-lg text-[#1E2939] mb-3">OBL Drop-Off Appointment</div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <button className="text-[#155DFC] font-medium text-sm">‹ Previous</button>
              <div className="bg-[#EFF6FF] rounded-xl px-4 py-2 flex items-center gap-2 font-bold text-[#1E2939]">
                <Calendar size={16} /> 12-11-2023
              </div>
              <button className="text-[#155DFC] font-medium text-sm">Next ›</button>
            </div>
            <div className="text-sm text-[#4A5565] mb-3">Available Slots:</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { t: '8 - 9 AM' }, { t: '9 - 10 AM' }, { t: '10 - 11 AM', active: true },
                { t: '11 - 12 AM' }, { t: '12 - 1 PM' }, { t: '2 - 3 PM' },
                { t: '3 - 4 PM' },
              ].map(s => (
                <button key={s.t}
                  className={`py-4 rounded-xl text-sm font-bold ${s.active
                    ? 'bg-gradient-to-b from-[#1E6FFF] to-[#155DFC] text-white shadow'
                    : 'bg-white border border-gray-200 text-[#364153]'}`}>
                  {s.t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="font-bold text-lg text-[#1E2939]">Invoices</div>
          <div className="text-xs text-gray-500 mb-3">Credit/Debit Card Online Payments Only, Once User Enter The Request Form</div>
          <div className="space-y-2">
            {[{n:'INVSIT10899', a:'100 AED'},{n:'INVSIT10901', a:'200 AED'}].map(i => (
              <div key={i.n} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#155DFC]"><FileText size={18} /></div>
                  <div>
                    <div className="font-bold text-[#1E2939]">{i.n}</div>
                    <div className="text-sm font-bold text-[#155DFC]">{i.a}</div>
                  </div>
                </div>
                <span className="bg-orange-50 text-orange-600 text-xs font-bold rounded-full px-3 py-1">Pending</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-bold text-lg text-[#1E2939] mb-3">Payment Breakups</div>
          <div className="bg-gradient-to-r from-[#EFF6FF] to-indigo-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between py-1.5">
              <span className="text-[#364153]">Total Invoice Amount</span>
              <span className="font-bold text-[#1E2939]">300.00 AED</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#364153]">Total Service Charge</span>
              <span className="font-bold text-[#1E2939]">1.67 AED</span>
            </div>
            <div className="border-t border-blue-200 mt-2 pt-3 flex justify-between items-center">
              <span className="font-bold text-lg text-[#1E2939]">Total Amount</span>
              <span className="font-bold text-2xl text-[#1E6FFF]">301.67 AED</span>
            </div>
          </div>
        </div>

        <button onClick={onPay}
          className="w-full dt-btn-primary text-white py-4 rounded-2xl font-bold shadow uppercase">Pay</button>
      </div>
    </div>
  );
}

function PartyRow({ label, sub, onClick, last }: any) {
  return (
    <button onClick={onClick}
      className={`w-full px-5 py-4 flex items-center justify-between ${last ? '' : 'border-b border-gray-100'}`}>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full border border-gray-300 bg-gray-50" />
        <div className="text-left">
          <div className="font-bold text-[#6A7282]">{label}</div>
          <div className="text-sm text-gray-400">{sub}</div>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </button>
  );
}

/* ---------- B/L PARTY ---------- */
function BLParty({ onBack }: { onBack: () => void }) {
  return (
    <PartyForm title="B/L Party" subtitle="Bill of Lading Party Information"
      nameLabel="B/L Party Name" onBack={onBack}>
      <ToggleCheckbox color="blue" label="Same As Requesting Party" />
    </PartyForm>
  );
}

/* ---------- DDO PARTY ---------- */
function DDOParty({ onBack }: { onBack: () => void }) {
  return (
    <PartyForm title="DDO Party" subtitle="Delivery Order Party Information"
      nameLabel="DDO Party Name" onBack={onBack}>
      <ToggleCheckbox color="blue" label="Same As Requesting Party" />
      <ToggleCheckbox color="pink" label="Same As B/L Party" />
    </PartyForm>
  );
}

function ToggleCheckbox({ color, label }: { color: 'blue'|'pink'; label: string }) {
  const stripes = color === 'blue'
    ? 'from-[#EFF6FF] to-[#EEF2FF] border-blue-100'
    : 'from-purple-50 to-pink-50 border-pink-100';
  const border = color === 'blue' ? 'border-[#1E6FFF]' : 'border-[#FF5A83]';
  return (
    <div className={`bg-gradient-to-r ${stripes} border rounded-2xl p-4 flex items-center gap-3 shadow-sm`}>
      <div className={`w-6 h-6 border-2 ${border} rounded`} />
      <span className="font-medium text-[#1E2939]">{label}</span>
    </div>
  );
}

function PartyForm({ title, subtitle, nameLabel, onBack, children }: any) {
  return (
    <div className="bg-[#F8FAFF] min-h-full">
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white">
          <div className="font-bold text-xl">{title}</div>
          <div className="text-xs opacity-80">{subtitle}</div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-3">{children}</div>
        <FormField label={nameLabel} placeholder="Enter party name" icon={Building2} />
        <FormField label="Representative Person" placeholder="Enter representative name" icon={User} />
        <FormField label="Email" placeholder="Enter email address" icon={Mail} />
        <FormField label="Phone Number" placeholder="Enter phone number" icon={Phone} />
        <div className="pt-2 space-y-3">
          <button onClick={onBack}
            className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold shadow uppercase">Save and return</button>
          <button onClick={onBack}
            className="w-full bg-white border border-gray-200 text-[#1360D2] py-3.5 rounded-2xl font-bold shadow uppercase">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, placeholder, icon: Icon }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#364153] mb-2">{label}</label>
      <div className="relative">
        <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input placeholder={placeholder}
          className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none shadow-sm" />
      </div>
    </div>
  );
}

/* ---------- DOCUMENTS ---------- */
function DDODocuments({ onBack }: { onBack: () => void }) {
  const docs = [
    { label: 'Authorization Letter', required: true },
    { label: 'B/L Copy' },
    { label: 'Emirates ID' },
    { label: 'Other Documents' },
  ];
  return (
    <div className="bg-[#F9FAFB] min-h-full">
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white">
          <div className="font-bold text-xl">Documents</div>
          <div className="text-xs opacity-80">Upload Required Documents</div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {docs.map(d => (
          <div key={d.label} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1360D2]">
                <FileCheck2 size={22} />
              </div>
              <div>
                <div className="font-medium text-[#1E2939]">
                  {d.label}{d.required && <span className="text-red-500 ml-1">*</span>}
                </div>
                <div className="text-xs text-gray-400">Tap to upload file</div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-dashed border-blue-300 flex items-center justify-center text-[#155DFC]">
              <Upload size={16} />
            </div>
          </div>
        ))}
        <div className="bg-gradient-to-r from-[#EFF6FF] to-cyan-50 border border-blue-200 rounded-2xl p-5 shadow-sm flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2B7FFF] flex items-center justify-center text-white shrink-0"><Info size={18} /></div>
          <div>
            <div className="font-bold text-[#1E2939]">Supported File Formats</div>
            <div className="text-sm text-[#364153] mt-1">
              Upload Document Only Of File Type <b>(PNG/JPG/GIF/PDF)</b> And Maximum File Size <b>1 MB</b>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-red-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> * Mandatory Files
            </div>
          </div>
        </div>
        <div className="pt-2 space-y-3">
          <button onClick={onBack}
            className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold shadow uppercase">Save and return</button>
          <button onClick={onBack}
            className="w-full bg-white border border-gray-200 text-[#1360D2] py-3.5 rounded-2xl font-bold shadow uppercase">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- PAY SUCCESS POPUP ---------- */
function PaySuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-[#0E1B3D]/70 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto">
          <CheckCircle2 size={48} className="text-teal-600" />
        </div>
        <div className="mt-5 text-2xl font-bold text-[#155DFC]">DDO Request Submitted</div>
        <div className="border-t border-gray-200 mt-5 pt-5">
          <div className="font-bold text-[#1E2939] mb-3">Summary</div>
          <div className="flex justify-between items-center">
            <span className="text-[#4A5565]">Reference Number</span>
            <span className="font-bold text-[#1E2939]">81000006077</span>
          </div>
        </div>
        <button onClick={onClose}
          className="mt-6 w-full border border-gray-300 text-[#1E2939] py-3.5 rounded-full font-bold uppercase">Close</button>
        <button className="mt-2 w-full bg-gray-200 text-[#364153] py-3.5 rounded-full font-bold">CANCEL ORDER</button>
      </div>
    </div>
  );
}

/* ---------- IMPORT FCL BILLS LIST ---------- */
function ImportFCL({ onBack, onPickBill }: { onBack: () => void; onPickBill: () => void }) {
  const bills = Array.from({ length: 6 }, (_, i) => ({
    id: `101-805852323-${10 + i}`, date: '25-05-2025', containers: 10,
  }));
  return (
    <div className="bg-[#F8FAFF] min-h-full">
      <div className="bg-[#0E1B3D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white">
          <div className="font-medium">Import FCL</div>
          <div className="text-xs opacity-50">Pending Bills</div>
        </div>
      </div>
      <div className="p-4 space-y-5">
        <div className="bg-white border border-gray-200 rounded-xl p-2.5 flex items-center gap-2">
          <Search size={18} className="text-gray-400" />
          <span className="text-sm text-[#696F83]">Search services...</span>
        </div>
        <div>
          <div className="flex items-center justify-end gap-1 text-[#1360D2] text-sm font-medium mb-3">
            <ArrowRight size={14} className="-rotate-90" />
            Recent Bills
          </div>
          <div className="space-y-3">
            {bills.map(b => (
              <button key={b.id} onClick={onPickBill}
                className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-[#1360D2]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#0E1B3D] text-sm">{b.id}</span>
                      <span className="bg-orange-50 text-[#F9A83D] text-[10px] font-bold rounded-full px-2 py-0.5">PENDING</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-[#696F83]">
                      <Calendar size={14} className="opacity-75" />
                      {b.date}
                      <span>|</span>
                      <span>{b.containers} Containers</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1 mt-4 text-[#1360D2] font-medium text-sm">
            View More <ChevronRight size={16} className="rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- FCL TOTAL PAYMENT BOTTOM SHEET ---------- */
function FCLTotalPayment({ onClose, onPay }: { onClose: () => void; onPay: () => void }) {
  return (
    <BottomSheet title="Total Payment" onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#696F83]">Declaration No.</span>
            <span className="font-bold text-[#0E1B3D]">101-805852323-10</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#696F83]">Declaration Date</span>
            <span className="font-bold text-[#0E1B3D]">25-02-2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#696F83]">Total Containers</span>
            <span className="font-bold text-[#0E1B3D]">25</span>
          </div>
        </div>
        <div className="bg-[#EFF6FF] rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#696F83]">Total Amount</span>
            <span className="font-bold text-[#0E1B3D]"><Dh /> 80,010.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#696F83]">VAT Amount</span>
            <span className="font-bold text-[#0E1B3D]"><Dh /> 20.00</span>
          </div>
          <div className="border-t border-[#BEDBFF] mt-2 pt-3 flex justify-between items-center">
            <span className="font-bold text-[#0E1B3D]">Total Due</span>
            <span className="font-bold text-lg text-[#1360D2]"><Dh /> 80,010.00</span>
          </div>
        </div>
        <button onClick={onPay}
          className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold shadow uppercase">CONFIRM & PAY</button>
      </div>
    </BottomSheet>
  );
}

/* ---------- FCL PAY SUCCESS POPUP ---------- */
function FCLPaySuccess({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-[#0E1B3D]/30 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex flex-col items-center px-6 py-5 gap-3">
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
            <CheckCircle2 size={44} className="text-teal-600" />
          </div>
          <div className="text-lg font-medium text-[#1360D2]">FCL Payment Successful</div>
        </div>
        <div className="border-t border-gray-200" />
        <div className="px-6 py-5 space-y-4">
          <div className="text-center font-medium text-[#2D3750]">Payment Details</div>
          <div className="flex justify-between items-center">
            <span className="text-[#696F83] text-sm">Transaction ID</span>
            <span className="font-bold text-[#051937]">810232344002</span>
          </div>
        </div>
        <div className="border-t border-gray-200" />
        <div className="p-4 space-y-2">
          <button className="w-full dt-btn-primary text-white py-2.5 rounded-2xl font-semibold flex items-center justify-center gap-2">
            <Download size={18} /> Download Receipt
          </button>
          <button onClick={onClose}
            className="w-full border border-[#1360D2] text-[#1360D2] py-2.5 rounded-2xl font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- GATE PASS ---------- */
function GatePass({ onBack, onPick }: { onBack: () => void; onPick: () => void }) {
  const passes = [
    { withChevron: true },
    { withChevron: true },
    { withChevron: false },
    { withChevron: false },
    { withChevron: false },
    { withChevron: false },
  ];
  return (
    <div className="bg-[#F8FAFF] min-h-full">
      <div className="bg-[#0E1B3D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white font-medium">Gate Pass</div>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2">
          <Search size={18} className="text-gray-400" />
          <span className="text-sm text-[#696F83]">Search</span>
        </div>
        <div>
          <div className="text-sm text-[#0E1B3D] mb-2">Select Period for the Declaration of Gate Passes</div>
          <div className="bg-white border border-[#D9D9D9] rounded-xl px-3 py-3 inline-flex items-center gap-2 text-sm font-medium text-[#0E1B3D]">
            <Calendar size={18} /> 01st Jan 2025 <span>-</span> 01st Jan 2026
          </div>
        </div>
        <div className="space-y-3">
          {passes.map((p, i) => (
            <button key={i} onClick={p.withChevron ? onPick : undefined}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-[#1360D2]">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <div className="font-medium text-[#0E1B3D] text-sm">101-805852323-10</div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[#696F83]">
                    <Calendar size={14} className="opacity-75" />
                    25-05-2025
                    <span>|</span>
                    <span>50 Passes</span>
                  </div>
                </div>
              </div>
              {p.withChevron ? (
                <ChevronRight size={18} className="text-gray-400" />
              ) : (
                <span className="flex items-center gap-1.5 text-[#3F7DE0] font-semibold text-xs">
                  <Download size={16} /> Download
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-1 mt-2 text-[#1360D2] font-medium text-sm">
          View More <ChevronRight size={16} className="rotate-90" />
        </div>
      </div>
    </div>
  );
}

/* ---------- GATE PASS DETAILS ---------- */
function GatePassDetails({ vehicles, onBack, onAddVehicle, onViewDetails, onRemoveVehicle, onPay }:
  { vehicles: Array<{ plate: string; qty: number }>; onBack: () => void; onAddVehicle: () => void;
    onViewDetails: () => void; onRemoveVehicle: (i: number) => void; onPay: () => void }) {
  const total = vehicles.length > 0 ? 18 : 0;
  const vat = vehicles.length > 0 ? 20 : 0;
  const due = total + vat;
  return (
    <div className="bg-[#F8FAFF] min-h-full pb-8">
      <div className="bg-[#0E1B3D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white font-medium">Gate Pass Details</div>
      </div>
      <div className="p-4 space-y-5">
        <div className="bg-gradient-to-r from-[#EFF6FF] to-[#EEF2FF] border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1360D2] flex items-center justify-center text-white"><ClipboardList size={22} /></div>
            <div>
              <div className="font-bold text-[#0E1B3D]">BOL <span className="font-bold">101-805852323-10</span></div>
              <div className="flex items-center gap-3 text-sm text-[#696F83] mt-1">
                <span>Gate Pass Type</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-[#14C9A9]" /> IN</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full border-2 border-gray-300 inline-block" /> Out</span>
              </div>
            </div>
          </div>
          <button onClick={onViewDetails}
            className="mt-3 text-[#1360D2] font-bold text-sm border border-[#1360D2] rounded-full px-4 py-1.5">View Details</button>
        </div>

        <div>
          <div className="font-bold text-[#0E1B3D] mb-3">Vehicle Information</div>
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center text-center py-6 gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><Truck size={22} /></div>
              <div className="font-bold text-[#0E1B3D]">No Vehicle Added Yet</div>
              <div className="text-sm text-[#696F83] max-w-[260px]">You can add vehicles for your declaration to start transporting your products</div>
              <button onClick={onAddVehicle}
                className="mt-2 inline-flex items-center gap-1.5 border border-[#1360D2] text-[#1360D2] font-bold rounded-full px-4 py-2 text-sm">
                <Plus size={16} /> Add Vehicle
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {vehicles.map((v, i) => (
                <div key={i} className="bg-white rounded-2xl p-3 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-[#1360D2]"><Truck size={18} /></div>
                    <div>
                      <div className="font-bold text-[#0E1B3D]">{v.plate}</div>
                      <div className="text-xs text-[#696F83]">Total Quantity <span className="text-[#0E1B3D] font-medium">{v.qty}</span></div>
                    </div>
                  </div>
                  <button onClick={() => onRemoveVehicle(i)} className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <div className="flex justify-center pt-2">
                <button onClick={onAddVehicle}
                  className="inline-flex items-center gap-1.5 border border-[#1360D2] text-[#1360D2] font-bold rounded-full px-4 py-2 text-sm">
                  <Plus size={16} /> Add Vehicle
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="font-bold text-[#0E1B3D] mb-3">Payment Details</div>
          <div className="bg-[#EFF6FF] rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#696F83]">Total Amount</span>
              <span className="font-medium text-[#0E1B3D]"><Dh /> {total === 0 ? '0' : total + '.00'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#696F83]">VAT Amount</span>
              <span className="font-medium text-[#0E1B3D]"><Dh /> {vat === 0 ? '0' : vat + '.00'}</span>
            </div>
            <div className="border-t border-[#BEDBFF] mt-1 pt-2 flex justify-between items-center">
              <span className="font-bold text-[#0E1B3D]">Total Due</span>
              <span className="font-bold text-[#1360D2]"><Dh /> {due === 0 ? '0' : due + '.00'}</span>
            </div>
          </div>
        </div>

        <button onClick={onPay} disabled={vehicles.length === 0}
          className={`w-full py-4 rounded-2xl font-bold text-white ${vehicles.length === 0 ? 'bg-[#1360D2]/60' : 'bg-[#1360D2] shadow'}`}>
          Pay & Submit
        </button>
      </div>
    </div>
  );
}

/* ---------- ADD VEHICLE ---------- */
function AddVehicle({ index, onCancel, onSave }: { index: number; onCancel: () => void; onSave: () => void }) {
  const [selectAll, setSelectAll] = useState(true);
  return (
    <div className="bg-[#F8FAFF] min-h-full">
      <div className="bg-[#0E1B3D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
        <button onClick={onCancel} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white font-medium">Add Vehicle</div>
      </div>
      <div className="p-4 space-y-4">
        <div className="font-bold text-[#0E1B3D]">Vehicle 0{index}</div>
        <div>
          <label className="block text-sm font-bold text-[#0E1B3D] mb-2">Choose Vehicle City</label>
          <input placeholder="Enter city name"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#0E1B3D] mb-2">Enter Vehicle Plate Number</label>
          <input placeholder="Enter number"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#0E1B3D] mb-2">Enter Vehicle Number</label>
          <input placeholder="Enter number"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm outline-none" />
        </div>
        <div>
          <div className="font-bold text-[#0E1B3D] mb-2">Product Description</div>
          <label className="inline-flex items-center gap-2 mb-3">
            <input type="checkbox" checked={selectAll} onChange={e => setSelectAll(e.target.checked)}
              className="w-5 h-5 rounded accent-[#1360D2]" />
            <span className="font-medium text-[#0E1B3D]">Select All Products</span>
          </label>
          {[
            { name: 'Flat Rolled Sheets - Boats', code: '54200' },
            { name: 'Spiral Rolled Sheets - Boats', code: '54200' },
          ].map(p => (
            <div key={p.name} className="mb-3">
              <div className="font-medium text-sm text-[#0E1B3D]">{p.name}</div>
              <div className="flex items-center gap-3 mt-1">
                <div className="text-[#0E1B3D] font-bold">{p.code}</div>
                <input placeholder="200" defaultValue="200"
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm outline-none" />
              </div>
            </div>
          ))}
        </div>
        <div className="pt-2 space-y-3">
          <button onClick={onSave}
            className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold shadow">Save Data & Add Vehicle</button>
          <button onClick={onCancel}
            className="w-full bg-white border border-[#1360D2] text-[#1360D2] py-3.5 rounded-2xl font-bold">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- BOE DETAILS ---------- */
function BOEDetails({ onBack }: { onBack: () => void }) {
  const rows = [
    ['BOE Type', 'Goods'],
    ['BOE No.', 'LGP - 10002014 - 23'],
    ['BOE Date', '20-11-23'],
    ['Exit Port', 'AED01'],
    ['Rotation', '-'],
    ['Discharge Port', 'SONY GULF FZE'],
    ['Vessel', 'F7100'],
    ['Arrival Date', '-'],
    ['Customer Code', 'NO'],
    ['Customer Name', '150'],
    ['Container BOE', '-'],
    ['Total Quantity', '2'],
    ['Cancel Flag', 'NO'],
    ['Clearance No.', '-'],
    ['Shipment Description', 'Recorder TV, Cameras'],
  ];
  return (
    <div className="bg-[#F8FAFF] min-h-full pb-6">
      <div className="bg-[#0E1B3D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white font-medium">BOE Details</div>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 py-2">
          <div className="w-12 h-12 rounded-xl bg-[#1360D2] flex items-center justify-center text-white"><ClipboardList size={22} /></div>
          <div>
            <div className="font-bold text-[#0E1B3D]">BOL <span className="font-bold">101-805852323-10</span></div>
            <div className="flex items-center gap-3 text-xs text-[#696F83] mt-1">
              <span>Gate Pass Type</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-[#14C9A9]" /> IN</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-gray-300 inline-block" /> Out</span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {rows.map(([k, v]) => (
            <div key={k} className="py-3 flex items-start justify-between gap-4">
              <span className="font-bold text-[#0E1B3D] text-sm">{k}</span>
              <span className="text-sm text-[#696F83] text-right">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- REMOVE VEHICLE POPUP ---------- */
function RemoveVehicleModal({ plate, onCancel, onConfirm }: { plate: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="absolute inset-0 bg-[#0E1B3D]/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <X size={32} className="text-red-500" />
        </div>
        <div className="mt-4 text-lg font-bold text-[#0E1B3D]">Remove Vehicle</div>
        <div className="mt-2 text-sm text-[#696F83]">
          Are you sure you want to removed {plate}, this action is undoable
        </div>
        <button onClick={onConfirm}
          className="mt-5 w-full bg-red-500 text-white py-3 rounded-2xl font-bold">Yes-Remove Vehicle</button>
        <button onClick={onCancel}
          className="mt-2 w-full border border-[#1360D2] text-[#1360D2] py-3 rounded-2xl font-bold">Cancel</button>
      </div>
    </div>
  );
}

/* ---------- GATE PASS CREATED POPUP ---------- */
function GatePassCreatedModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-[#0E1B3D]/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex flex-col items-center px-6 py-5 gap-3">
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
            <CheckCircle2 size={44} className="text-teal-600" />
          </div>
          <div className="text-lg font-medium text-[#1360D2]">Gate Pass Created</div>
        </div>
        <div className="border-t border-gray-200" />
        <div className="px-6 py-5 space-y-3">
          <div className="text-center font-bold text-[#0E1B3D]">Generated Gate Pass Numbers</div>
          {['810232344002', '810232344002'].map((id, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[#696F83] text-sm">Gate Pass Vehicle {i + 1}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0E1B3D]">{id}</span>
                <button className="text-gray-400"><Copy size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200" />
        <div className="p-4 space-y-2">
          <button className="w-full dt-btn-primary text-white py-2.5 rounded-2xl font-semibold flex items-center justify-center gap-2">
            <Download size={18} /> Download Receipt
          </button>
          <button onClick={onClose}
            className="w-full border border-[#1360D2] text-[#1360D2] py-2.5 rounded-2xl font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- CONTAINERS ---------- */
function Containers({ onBack }: { onBack: () => void }) {
  const containers = [
    {
      id: 'CUST150564', i: 0, size: '40 ft', status: 'MT FROM TOWN', statusColor: 'text-[#F9A83D]',
      steps: 2, dates: ['21-OCT-23 00:30', '23-OCT-23 00:30', ''],
      cta: 'ADD TO HOME', filled: true,
    },
    {
      id: 'CUST150565', i: 1, size: '20 ft', status: 'IN STORAGE', statusColor: 'text-[#1360D2]',
      steps: 1, dates: ['20-OCT-23 12:00', '', ''],
      cta: 'ADDED TO HOME', filled: false,
    },
    {
      id: 'CUST150566', i: 2, size: '40 ft', status: 'DELIVERED', statusColor: 'text-emerald-500',
      steps: 3, dates: ['19-OCT-23 08:00', '20-OCT-23 14:30', '21-OCT-23 16:00'],
      cta: 'ADD TO HOME', filled: true,
    },
  ];
  return (
    <div className="bg-[#F8FAFF] min-h-full pb-6">
      <div className="bg-[#0E1B3D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white font-bold">Container</div>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2">
          <Search size={18} className="text-gray-400" />
          <input placeholder="Enter Container Number"
            className="flex-1 text-sm text-[#696F83] outline-none bg-transparent" />
        </div>
        {containers.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="font-bold text-[#0E1B3D]">{c.id} ({c.i}) - {c.size}</div>
            <div className={`text-xs font-bold ${c.statusColor} mt-1`}>{c.status}</div>
            <ContainerStepper steps={c.steps} dates={c.dates} />
            {c.filled ? (
              <button className="mt-3 w-full dt-btn-primary text-white py-3 rounded-2xl font-bold">{c.cta}</button>
            ) : (
              <button className="mt-3 w-full border border-[#1360D2] text-[#1360D2] py-3 rounded-2xl font-bold">{c.cta}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContainerStepper({ steps, dates }: { steps: number; dates: string[] }) {
  const labels = [
    { t: 'Landed', sub: 'Import Full' },
    { t: 'From Town', sub: 'Storage Empty' },
    { t: 'To Town', sub: 'Import Full' },
  ];
  return (
    <div className="mt-3">
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {labels.map(l => (
          <div key={l.t}>
            <div className="font-bold text-[#0E1B3D]">{l.t}</div>
            <div className="text-[#696F83]">{l.sub}</div>
          </div>
        ))}
      </div>
      <div className="relative my-3 h-8 flex items-center">
        <div className="absolute left-[16%] right-[16%] top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-200" />
        <div className={`absolute left-[16%] top-1/2 -translate-y-1/2 h-0.5 bg-[#1360D2]`}
             style={{ width: steps === 3 ? '68%' : steps === 2 ? '34%' : '0%' }} />
        <div className="absolute inset-x-0 top-0 grid grid-cols-3">
          {[0,1,2].map(i => (
            <div key={i} className="flex justify-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${i < steps ? 'dt-btn-primary text-white' : 'bg-white border-2 border-gray-200 text-transparent'}`}>
                {i < steps ? <Check size={14} /> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-[#696F83]">
        {dates.map((d, i) => <div key={i}>{d}</div>)}
      </div>
    </div>
  );
}

/* ---------- VESSELS ---------- */
function Vessels({ onBack }: { onBack: () => void }) {
  const vessels = [
    { code: '908471', name: 'Jebel Ali -T1', line: 'ALLIANCE FAIRFAX', added: true, eta: '21-OCT-23 00:30', etd: '21-OCT-23 00:30', cutoff: '21-OCT-23 00:30' },
    { code: '908471', name: 'Jebel Ali -T2', line: 'ALLIANCE FAIRFAX', added: false, eta: '21-OCT-23 00:30', etd: '21-OCT-23 00:30', cutoff: '21-OCT-23 00:30' },
    { code: '908472', name: 'Jebel Ali -T3', line: 'ALLIANCE FAIRFAX', added: false, eta: '22-OCT-23 01:30', etd: '22-OCT-23 01:30', cutoff: '22-OCT-23 01:30' },
  ];
  return (
    <div className="bg-[#F8FAFF] min-h-full pb-6">
      <div className="bg-[#0E1B3D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white font-bold">Vessel</div>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2">
          <Search size={18} className="text-gray-400" />
          <input placeholder="Enter a Rotation Number"
            className="flex-1 text-sm text-[#696F83] outline-none bg-transparent" />
        </div>
        {vessels.map((v, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm relative">
            {v.added && (
              <button className="absolute right-3 top-3 w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-500"><Trash2 size={18} /></button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-[#1360D2]"><Ship size={20} /></div>
              <div>
                <div className="font-bold text-[#0E1B3D]">{v.code} - {v.name}</div>
                <div className="text-xs font-bold text-[#696F83]">{v.line}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
              <div>
                <div className="flex items-center gap-1 text-[#696F83]"><Calendar size={12} className="text-[#1360D2]" /> ETA</div>
                <div className="font-bold text-[#0E1B3D] mt-1">{v.eta.split(' ')[0]}</div>
                <div className="text-[10px] text-[#696F83]">{v.eta.split(' ')[1]}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-[#696F83]"><Calendar size={12} className="text-emerald-500" /> ETD</div>
                <div className="font-bold text-[#0E1B3D] mt-1">{v.etd.split(' ')[0]}</div>
                <div className="text-[10px] text-[#696F83]">{v.etd.split(' ')[1]}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-[#696F83]"><Clock size={12} className="text-orange-500" /> Cut Off</div>
                <div className="font-bold text-[#0E1B3D] mt-1">{v.cutoff.split(' ')[0]}</div>
                <div className="text-[10px] text-[#696F83]">{v.cutoff.split(' ')[1]}</div>
              </div>
            </div>
            {v.added ? (
              <button className="mt-3 w-full border border-[#1360D2] text-[#1360D2] py-3 rounded-2xl font-bold">ADDED TO HOME</button>
            ) : (
              <button className="mt-3 w-full dt-btn-primary text-white py-3 rounded-2xl font-bold">ADD TO HOME</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- FORGOT PASSWORD ---------- */
/** Shared light auth shell — white/blue wash like the onboarding slides. */
function AuthShell({ onBack, title, subtitle, illustration, children }:
  { onBack?: () => void; title: string; subtitle: string; illustration?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative h-full min-h-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #DBEAFE 0%, #FFFFFF 55%, #F4F7FE 100%)' }}>
      {/* Soft decorative blobs */}
      <div className="absolute -top-24 -right-24 w-[340px] h-[340px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
      <div className="absolute top-[42%] -left-32 w-[280px] h-[280px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#6FA0FF' }} />

      {/* Back button row */}
      <div className="relative dt-safe-top px-5 pt-2 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} aria-label="Back"
            className="w-9 h-9 rounded-full bg-white border border-[#E0EAFB] shadow-sm flex items-center justify-center text-[#0E1B3D] hover:bg-[#F4F7FE]">
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Illustration */}
      {illustration && (
        <div className="relative flex justify-center mt-2 mb-3">{illustration}</div>
      )}

      {/* Title + subtitle */}
      <div className="relative px-7 text-center">
        <div className="text-[26px] font-bold leading-[32px] tracking-tight text-[#0E1B3D]">{title}</div>
        <div className="text-[14px] text-[#4A5565] mt-2 max-w-[320px] mx-auto leading-relaxed">{subtitle}</div>
      </div>

      {/* Content card */}
      <div className="relative mx-5 mt-6 bg-white rounded-[24px] border border-[#E0EAFB] shadow-[0_18px_36px_-18px_rgba(14,27,61,0.18)] p-6 z-10">
        {children}
      </div>

      {/* Trust footer */}
      <div className="relative mt-5 pb-6 px-7 text-center z-10">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280]">
          <Shield size={12} className="text-[#1360D2]" /> Secured by end-to-end encryption
        </div>
      </div>
    </div>
  );
}

/* ---------- Auth illustrations ---------- */
function MailIllustration() {
  return (
    <svg width="180" height="130" viewBox="0 0 180 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ml-env" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1360D2" />
          <stop offset="1" stopColor="#0E47A6" />
        </linearGradient>
        <linearGradient id="ml-flap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2950E5" />
          <stop offset="1" stopColor="#1360D2" />
        </linearGradient>
      </defs>
      <circle cx="90" cy="68" r="56" fill="#DBEAFE" />
      <rect x="48" y="34" width="84" height="60" rx="8" fill="#fff" stroke="#C7D8F4" strokeWidth="1.5" />
      <rect x="58" y="46" width="64" height="3" rx="1.5" fill="#C7D8F4" />
      <rect x="58" y="54" width="50" height="3" rx="1.5" fill="#DCE7FB" />
      <rect x="58" y="62" width="58" height="3" rx="1.5" fill="#DCE7FB" />
      <rect x="40" y="56" width="100" height="50" rx="10" fill="url(#ml-env)" />
      <path d="M40 66 L90 96 L140 66" fill="url(#ml-flap)" />
      <path d="M40 66 L90 96 L140 66" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1.5" />
      <g className="dt-anim-float-mid" style={{ transformOrigin: '128px 38px' }}>
        <circle cx="128" cy="38" r="14" fill="#fff" stroke="#1360D2" strokeWidth="2" />
        <path d="M124 38v-3a4 4 0 1 1 8 0v3" stroke="#1360D2" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <rect x="122" y="38" width="12" height="9" rx="2" fill="#1360D2" />
      </g>
      <g className="dt-anim-pulse" style={{ transformOrigin: '38px 36px' }}>
        <path d="M38 32l1.4 3 3 1.4-3 1.4L38 41l-1.4-3-3-1.4 3-1.4L38 32z" fill="#2950E5" />
      </g>
      <g className="dt-anim-pulse" style={{ transformOrigin: '152px 96px', animationDelay: '0.8s' }}>
        <path d="M152 92l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1 1-2.2z" fill="#0E47A6" />
      </g>
    </svg>
  );
}

function CodeIllustration() {
  return (
    <svg width="180" height="130" viewBox="0 0 180 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cd-phone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E47A6" />
          <stop offset="1" stopColor="#13245C" />
        </linearGradient>
      </defs>
      <circle cx="90" cy="68" r="56" fill="#DBEAFE" />
      <rect x="62" y="22" width="56" height="92" rx="12" fill="url(#cd-phone)" />
      <rect x="68" y="30" width="44" height="76" rx="6" fill="#fff" />
      <rect x="71" y="48" width="8"  height="12" rx="2" fill="#1360D2" />
      <rect x="82" y="48" width="8"  height="12" rx="2" fill="#1360D2" />
      <rect x="93" y="48" width="8"  height="12" rx="2" fill="#DCE7FB" />
      <rect x="104" y="48" width="8" height="12" rx="2" fill="#DCE7FB" />
      <rect x="73" y="68" width="34" height="3" rx="1.5" fill="#DCE7FB" />
      <rect x="73" y="76" width="24" height="3" rx="1.5" fill="#DCE7FB" />
      <g className="dt-anim-float-mid" style={{ transformOrigin: '140px 44px' }}>
        <rect x="116" y="32" width="48" height="28" rx="8" fill="#fff" stroke="#1360D2" strokeWidth="1.5" />
        <circle cx="128" cy="46" r="2.5" fill="#1360D2" />
        <circle cx="140" cy="46" r="2.5" fill="#1360D2" />
        <circle cx="152" cy="46" r="2.5" fill="#1360D2" />
        <path d="M120 60 l-4 6 l8 -2 z" fill="#fff" stroke="#1360D2" strokeWidth="1.5" />
      </g>
      <g className="dt-anim-pulse" style={{ transformOrigin: '38px 56px' }}>
        <path d="M38 52l1.4 3 3 1.4-3 1.4L38 61l-1.4-3-3-1.4 3-1.4L38 52z" fill="#2950E5" />
      </g>
    </svg>
  );
}

function LockIllustration() {
  return (
    <svg width="180" height="130" viewBox="0 0 180 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lk-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1360D2" />
          <stop offset="1" stopColor="#0E47A6" />
        </linearGradient>
        <linearGradient id="lk-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2950E5" />
          <stop offset="1" stopColor="#0E47A6" />
        </linearGradient>
      </defs>
      <circle cx="90" cy="68" r="56" fill="#DBEAFE" />
      <g className="dt-anim-float-slow" style={{ transformOrigin: '128px 50px' }}>
        <path d="M128 26 l16 6 v18 c0 12 -8 22 -16 26 c-8 -4 -16 -14 -16 -26 v-18 z" fill="url(#lk-shield)" />
        <path d="M120 50 l6 6 l12 -12" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="dt-anim-float-mid" style={{ transformOrigin: '78px 70px' }}>
        <path d="M64 60v-8a14 14 0 1 1 28 0v8" stroke="#0E47A6" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <rect x="50" y="58" width="56" height="44" rx="10" fill="url(#lk-body)" />
        <circle cx="78" cy="80" r="6" fill="#fff" />
        <rect x="76" y="80" width="4" height="10" rx="2" fill="#fff" />
      </g>
      <g className="dt-anim-pulse" style={{ transformOrigin: '40px 38px' }}>
        <path d="M40 34l1.4 3 3 1.4-3 1.4L40 43l-1.4-3-3-1.4 3-1.4L40 34z" fill="#2950E5" />
      </g>
      <g className="dt-anim-pulse" style={{ transformOrigin: '152px 98px', animationDelay: '0.6s' }}>
        <path d="M152 94l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1 1-2.2z" fill="#0E47A6" />
      </g>
    </svg>
  );
}

function ForgotPassword({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const [email, setEmail] = useState('');
  const [remember, setRemember] = useState(true);
  const canSubmit = email.trim().length > 0;
  return (
    <AuthShell onBack={onBack}
      illustration={<MailIllustration />}
      title="Forgot password?"
      subtitle="Enter the email tied to your Dubai Trade account — we'll send a verification code.">
      <div className="space-y-3">
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1360D2]" />
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full bg-white border-[1.5px] border-[#E7EBF2] hover:border-[#1360D2]/50 focus:border-[#1360D2] focus:ring-4 focus:ring-[#1360D2]/15 rounded-2xl pl-12 pr-4 py-4 text-[15px] text-[#0E1B3D] placeholder:text-[#6B7280] outline-none transition-all" />
        </div>
        <button onClick={() => setRemember(!remember)} className="flex items-center gap-2 text-sm text-[#394B5D] mt-2">
          <span className={`w-9 h-5 rounded-full transition relative ${remember ? 'bg-[#1360D2]' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${remember ? 'left-[18px]' : 'left-0.5'}`} />
          </span>
          Remember me
        </button>
      </div>

      <button onClick={canSubmit ? onContinue : undefined} disabled={!canSubmit}
        className={`w-full mt-5 py-3.5 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all
          ${canSubmit ? 'dt-btn-primary text-white' : 'bg-[#E7EBF2] text-[#9CA3AF] cursor-not-allowed'}`}>
        Send verification code <ArrowRight size={18} />
      </button>
      <div className="text-center mt-3">
        <button onClick={onBack}
          className="text-[13px] font-semibold text-[#4A5565] hover:text-[#1360D2] transition-colors">
          Back to login
        </button>
      </div>
    </AuthShell>
  );
}

/* ---------- VERIFY CODE ---------- */
function VerifyCode({ onBack, onVerify }: { onBack: () => void; onVerify: () => void }) {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const filled = code.some(c => c.length === 1);
  const setAt = (i: number, v: string) => {
    const next = [...code];
    next[i] = v.replace(/[^0-9]/g, '').slice(0, 1);
    setCode(next);
  };
  return (
    <AuthShell onBack={onBack}
      illustration={<CodeIllustration />}
      title="Verify your code"
      subtitle="We sent a 6-digit verification code to your email — enter it below to continue.">
      <div className="grid grid-cols-6 gap-2">
        {code.map((v, i) => (
          <input key={i} value={v} maxLength={1} inputMode="numeric"
            onChange={(e) => setAt(i, e.target.value)}
            className={`w-full aspect-square text-center text-[20px] font-bold rounded-xl bg-white border-[1.5px] outline-none transition-all ${v ? 'border-[#1360D2] text-[#0E1B3D] shadow-[0_4px_12px_-6px_rgba(19,96,210,0.4)]' : 'border-[#E7EBF2] text-[#0E1B3D]'} focus:border-[#1360D2] focus:ring-4 focus:ring-[#1360D2]/15`} />
        ))}
      </div>

      <button onClick={filled ? onVerify : undefined} disabled={!filled}
        className={`w-full mt-5 py-3.5 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all
          ${filled ? 'dt-btn-primary text-white' : 'bg-[#E7EBF2] text-[#9CA3AF] cursor-not-allowed'}`}>
        Verify &amp; continue <ArrowRight size={18} />
      </button>

      <div className="text-center mt-4 text-[12.5px] text-[#4A5565]">
        Didn't get a code? Resend in{' '}
        <span className="text-[#1360D2] font-bold">58s</span>
      </div>
    </AuthShell>
  );
}

/* ---------- RESET PASSWORD ---------- */
function ResetPassword({ onBack, onReset }: { onBack: () => void; onReset: () => void }) {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  return (
    <AuthShell onBack={onBack}
      illustration={<LockIllustration />}
      title="Reset password"
      subtitle="Create a new password to secure your Dubai Trade account.">
      <div className="space-y-3">
        <div className="relative">
          <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1360D2]" />
          <input value={pw1} onChange={e => setPw1(e.target.value)}
            type={show1 ? 'text' : 'password'} placeholder="New password"
            className="w-full bg-white border-[1.5px] border-[#E7EBF2] hover:border-[#1360D2]/50 focus:border-[#1360D2] focus:ring-4 focus:ring-[#1360D2]/15 rounded-2xl pl-12 pr-12 py-4 text-[15px] text-[#0E1B3D] placeholder:text-[#6B7280] outline-none transition-all" />
          <button onClick={() => setShow1(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1360D2]">
            {show1 ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="relative">
          <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1360D2]" />
          <input value={pw2} onChange={e => setPw2(e.target.value)}
            type={show2 ? 'text' : 'password'} placeholder="Confirm new password"
            className="w-full bg-white border-[1.5px] border-[#E7EBF2] hover:border-[#1360D2]/50 focus:border-[#1360D2] focus:ring-4 focus:ring-[#1360D2]/15 rounded-2xl pl-12 pr-12 py-4 text-[15px] text-[#0E1B3D] placeholder:text-[#6B7280] outline-none transition-all" />
          <button onClick={() => setShow2(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1360D2]">
            {show2 ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button onClick={onReset}
        className="dt-btn-primary w-full mt-5 py-3.5 rounded-2xl font-bold text-white text-[15px] flex items-center justify-center gap-2">
        Reset password <ArrowRight size={18} />
      </button>
    </AuthShell>
  );
}

/* ---------- PASSWORD RESET SUCCESS POPUP ---------- */
function PasswordResetSuccess({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(7, 16, 38, 0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
      <div className="dt-screen relative w-full max-w-sm bg-white rounded-[28px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(7,16,38,0.55)]">
        {/* Blue-wash hero with success illustration */}
        <div className="relative overflow-hidden px-6 pt-7 pb-4"
          style={{ background: 'linear-gradient(180deg, #DBEAFE 0%, #FFFFFF 100%)' }}>
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-30 blur-3xl" style={{ background: '#1360D2' }} />
          <div className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: '#6FA0FF' }} />
          <div className="relative flex justify-center">
            <SuccessIllustration />
          </div>
        </div>

        {/* Copy */}
        <div className="px-6 pt-2 pb-5 text-center">
          <div className="text-[20px] font-bold leading-snug text-[#0E1B3D]">Password reset!</div>
          <div className="mt-1.5 text-[13.5px] text-[#4A5565] leading-relaxed">
            Your password has been updated.<br />
            You can now sign in with your new credentials.
          </div>

          {/* Action stack */}
          <div className="mt-5 space-y-2.5">
            <button onClick={onBack}
              className="dt-btn-primary w-full text-white py-3.5 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 uppercase tracking-wide">
              Continue to login <ArrowRight size={16} />
            </button>
            <button onClick={onBack}
              className="dt-btn-secondary w-full py-3 rounded-2xl font-bold text-[12.5px] uppercase tracking-wide">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Success illustration (animated check medallion) ---------- */
function SuccessIllustration() {
  return (
    <svg width="170" height="130" viewBox="0 0 170 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ok-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2950E5" />
          <stop offset="1" stopColor="#0E47A6" />
        </linearGradient>
        <linearGradient id="ok-medallion" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1360D2" />
          <stop offset="1" stopColor="#0E47A6" />
        </linearGradient>
      </defs>
      {/* Outer halo */}
      <circle cx="85" cy="65" r="58" fill="#DBEAFE" />
      <circle cx="85" cy="65" r="46" fill="none" stroke="#C7D8F4" strokeWidth="1.5" strokeDasharray="3 5" className="dt-anim-pulse" style={{ transformOrigin: '85px 65px' }} />
      {/* Medallion */}
      <g className="dt-anim-float-slow" style={{ transformOrigin: '85px 65px' }}>
        <circle cx="85" cy="65" r="34" fill="url(#ok-medallion)" />
        <circle cx="85" cy="65" r="34" stroke="url(#ok-ring)" strokeWidth="2" fill="none" />
        <path d="M70 66 l10 10 l20 -20" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      {/* Confetti */}
      <g className="dt-anim-pulse" style={{ transformOrigin: '34px 36px' }}>
        <circle cx="34" cy="36" r="3" fill="#2950E5" />
      </g>
      <g className="dt-anim-float-fast" style={{ transformOrigin: '140px 30px' }}>
        <rect x="138" y="26" width="6" height="6" rx="1.5" fill="#1360D2" transform="rotate(20 141 29)" />
      </g>
      <g className="dt-anim-pulse" style={{ transformOrigin: '22px 96px', animationDelay: '0.6s' }}>
        <path d="M22 92l1.4 3 3 1.4-3 1.4L22 101l-1.4-3-3-1.4 3-1.4L22 92z" fill="#0E47A6" />
      </g>
      <g className="dt-anim-float-mid" style={{ transformOrigin: '150px 100px' }}>
        <circle cx="150" cy="100" r="4" fill="#6FA0FF" />
      </g>
      <g className="dt-anim-float-fast" style={{ transformOrigin: '46px 110px' }}>
        <rect x="43" y="107" width="6" height="6" rx="1.5" fill="#2950E5" transform="rotate(-15 46 110)" />
      </g>
    </svg>
  );
}

/* ---------- NOTIFICATIONS ---------- */
function Notifications({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-[#F8FAFF] min-h-full">
      <div className="bg-[#0E1B3D] dt-safe-top px-6 pt-6 pb-5 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
              <ChevronLeft size={18} />
            </button>
            <div>
              <div className="text-white font-bold text-xl">Notifications</div>
              <div className="text-xs text-white/70">3 unread</div>
            </div>
          </div>
          <button className="text-white font-bold text-sm">Mark all read</button>
        </div>
      </div>
      <div className="p-4 space-y-5">
        <div>
          <div className="text-xs font-bold text-gray-400 mb-2">TODAY</div>
          <div className="space-y-3">
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500"><Wallet size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-[#0E1B3D]">Low Balance Alert</div>
                  <div className="text-sm text-[#696F83]">Your Advance Deposit balance is running low. Top up now to avoid service interruptions.</div>
                  <div className="mt-2 inline-flex items-center gap-1 border border-orange-200 bg-white rounded-md px-2 py-0.5 text-xs font-bold text-orange-500">Balance: 1250.50</div>
                </div>
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">4h ago</span>
                <button className="dt-btn-primary text-white px-4 py-2 rounded-2xl text-sm font-bold">Top Up Now</button>
              </div>
            </div>
            <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#1360D2]"><FileText size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-[#0E1B3D]">LGP Document Expiring Soon</div>
                  <div className="text-sm text-[#696F83]">Your Export LGP document will expire in 7 days. Please renew to avoid delays.</div>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-flex items-center border border-blue-200 bg-white rounded-md px-2 py-0.5 text-xs font-bold text-[#1360D2]">Export</span>
                    <span className="inline-flex items-center gap-1 border border-blue-200 bg-white rounded-md px-2 py-0.5 text-xs font-bold text-[#1360D2]"><Clock size={11} /> 7 days left</span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              </div>
              <div className="text-xs text-gray-400 mt-2">5h ago</div>
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-400 mb-2">YESTERDAY</div>
          <div className="space-y-3">
            <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#1360D2]"><FileText size={20} /></div>
                <div>
                  <div className="font-bold text-[#0E1B3D]">LGP Document Expiring Soon</div>
                  <div className="text-sm text-[#696F83]">Your Storage LGP document will expire in 14 days. Renewal recommended.</div>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-flex items-center border border-blue-200 bg-white rounded-md px-2 py-0.5 text-xs font-bold text-[#1360D2]">Storage</span>
                    <span className="inline-flex items-center gap-1 border border-blue-200 bg-white rounded-md px-2 py-0.5 text-xs font-bold text-[#1360D2]"><Clock size={11} /> 14 days left</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">Yesterday</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#1360D2]"><FileText size={20} /></div>
                <div>
                  <div className="font-bold text-[#0E1B3D]">LGP Document Expiring Soon</div>
                  <div className="text-sm text-[#696F83]">Your Repair and Return LGP document will expire in 7 days.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- NOTIFICATIONS SETTINGS ---------- */
function NotificationsSettings({ onBack }: { onBack: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState({ lgp: false, advance: false, general: true, payment: true });
  const groups = [
    { key: 'lgp', icon: FileText, color: 'bg-blue-100 text-[#1360D2]', title: 'LGP Expiry Notifications',
      desc: 'Alerts for License, Guarantee & Permit documents (12 types)', expandable: true },
    { key: 'advance', icon: Wallet, color: 'bg-emerald-100 text-emerald-600', title: 'Advance Deposit Alerts',
      desc: 'Low balance warnings and auto top-up notifications', status: 'Inactive' },
    { key: 'general', icon: Bell, color: 'bg-purple-100 text-purple-600', title: 'General Notifications',
      desc: 'System updates, announcements, and alerts', status: 'Active' },
    { key: 'payment', icon: AlertCircle, color: 'bg-orange-100 text-orange-500', title: 'Payment Notifications',
      desc: 'Transaction confirmations and payment reminders', status: 'Active' },
  ] as const;
  const enabled = Object.values(prefs).filter(Boolean).length;
  return (
    <div className="bg-[#F8FAFF] min-h-full">
      <div className="bg-[#0E1B3D] dt-safe-top px-6 pt-6 pb-5 shadow">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
            <ChevronLeft size={18} />
          </button>
          <div>
            <div className="text-white font-bold text-xl">Notifications Settings</div>
            <div className="text-xs text-white/70">Manage notification preferences</div>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-4 flex gap-2">
          <Info size={20} className="text-[#1360D2] shrink-0" />
          <div className="text-sm text-[#1360D2]">Control which notifications you receive. Tap on items with details to customize specific settings.</div>
        </div>
        {groups.map(g => (
          <div key={g.key} className="bg-white rounded-2xl shadow-sm">
            <div className="p-4 flex items-start justify-between">
              <div className="flex gap-3">
                <div className={`w-12 h-12 rounded-xl ${g.color} flex items-center justify-center`}>
                  <g.icon size={22} />
                </div>
                <div>
                  <div className="font-bold text-[#0E1B3D]">{g.title}</div>
                  <div className="text-sm text-[#696F83] max-w-[200px]">{g.desc}</div>
                  {'expandable' in g && (
                    <button onClick={() => setExpanded(e => !e)}
                      className="mt-2 text-[#1360D2] font-bold text-sm">View Notification Types</button>
                  )}
                  {'status' in g && (
                    <div className={`mt-1.5 text-xs flex items-center gap-1.5 ${g.status === 'Active' ? 'text-emerald-500' : 'text-gray-400'}`}>
                      <span className={`w-2 h-2 rounded-full ${g.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {g.status}
                    </div>
                  )}
                </div>
              </div>
              <Toggle on={(prefs as any)[g.key]} onChange={(v: boolean) => setPrefs(p => ({ ...p, [g.key]: v }))} />
            </div>
            {g.key === 'lgp' && expanded && (
              <div className="bg-gray-50 mx-4 mb-4 rounded-xl p-3">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="py-1.5 text-sm text-[#0E1B3D]">Notification Type {i + 1}</div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="font-bold text-[#0E1B3D] mb-2">Notification Summary</div>
          <div className="flex justify-between text-sm">
            <span className="text-[#696F83]">Total notification types</span>
            <span className="font-bold text-[#0E1B3D]">4</span>
          </div>
          <div className="flex justify-between text-sm mt-1.5">
            <span className="text-[#696F83]">Currently enabled</span>
            <span className="font-bold text-emerald-500">{enabled}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- SUBSCRIPTION (RENEW NOW) ---------- */
function Subscription({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const [plan, setPlan] = useState<'Annual'|'Monthly'|'Weekly'>('Annual');
  const plans = [
    { k: 'Annual', label: 'Annual', amount: 630, suffix: 'Per Year' },
    { k: 'Monthly', label: 'Monthly', amount: 630, suffix: 'Per Month' },
    { k: 'Weekly', label: 'Weekly', amount: 210, suffix: 'Per Month' },
  ] as const;
  return (
    <div className="bg-[#F8FAFF] min-h-full">
      <div className="bg-[#0E1B3D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white font-bold">Subscription</div>
      </div>
      <div className="p-6">
        <div className="text-center font-bold text-[#0E1B3D] mb-5">Choose your Plan</div>
        <div className="space-y-3">
          {plans.map(p => {
            const active = plan === p.k;
            return (
              <button key={p.k} onClick={() => setPlan(p.k)}
                className={`w-full bg-white border rounded-2xl p-4 flex items-center justify-between ${active ? 'border-[#1360D2] bg-[#EFF6FF]' : 'border-gray-200'}`}>
                <div className="text-left">
                  <div className="font-bold text-[#0E1B3D]">{p.label}</div>
                  <div className="mt-1"><span className="text-xl font-bold text-[#0E1B3D]">{p.amount}</span> <span className="text-sm text-[#696F83]">{p.suffix} <span className="text-xs">(Incl. VAT 5%)</span></span></div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${active ? 'dt-btn-primary text-white' : 'border-2 border-gray-300'}`}>
                  {active && <Check size={14} />}
                </div>
              </button>
            );
          })}
        </div>
        <div className="text-center text-sm text-[#696F83] mt-5">
          By using this service agree to our
        </div>
        <div className="text-center font-bold text-[#1360D2] mt-1">Terms and Conditions of Use</div>
        <button onClick={onContinue}
          className="mt-5 w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold uppercase shadow">Continue</button>
      </div>
    </div>
  );
}

/* ---------- VAT PENDING POPUP ---------- */
function VATPendingModal({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className="absolute inset-0 bg-[#0E1B3D]/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
          <AlertCircle size={32} className="text-orange-500" />
        </div>
        <div className="mt-3 text-lg font-bold text-orange-500">VAT Details Pending</div>
        <div className="mt-2 text-sm text-[#0E1B3D]">Dear User, Your VAT details is still pending, Do you want to proceed?</div>
        <button onClick={onYes}
          className="mt-5 w-full dt-btn-primary text-white py-3 rounded-2xl font-bold uppercase">Yes - Proceed</button>
        <button onClick={onNo}
          className="mt-2 w-full bg-white border border-gray-200 text-[#0E1B3D] py-3 rounded-2xl font-bold">NO</button>
      </div>
    </div>
  );
}

/* ---------- RENEW SUCCESS POPUP ---------- */
function RenewSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-[#0E1B3D]/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} className="text-teal-600" />
        </div>
        <div className="mt-3 text-lg font-bold text-[#1360D2]">Renew Subscription Successful</div>
        <div className="border-t border-gray-200 mt-5 pt-4">
          <div className="font-bold text-[#0E1B3D] mb-3">Payment Details</div>
          <div className="flex justify-between text-sm">
            <span className="text-[#696F83]">Transaction ID</span>
            <span className="font-bold text-[#0E1B3D]">81000006077</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-[#696F83]">Receipt ID.</span>
            <span className="font-bold text-[#0E1B3D]">81002385</span>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-5 pt-4 space-y-2">
          <button className="w-full dt-btn-primary text-white py-3 rounded-2xl font-bold uppercase">Print Receipt</button>
          <button className="w-full dt-btn-primary text-white py-3 rounded-2xl font-bold uppercase">Print Invoice</button>
          <button onClick={onClose}
            className="w-full border border-gray-200 text-[#0E1B3D] py-3 rounded-2xl font-bold uppercase">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- CARGO MANAGEMENT MENU ---------- */
function CargoManagement({ onBack, onInvoiceDownload }:
  { onBack: () => void; onInvoiceDownload: () => void }) {
  const items = [
    { icon: Receipt, title: 'Invoice Download', desc: 'Download and share invoices', onClick: onInvoiceDownload },
    { icon: Ship, title: 'Vessel Schedule', desc: 'View vessel rotation schedule' },
    { icon: Boxes, title: 'Container Tracking', desc: 'Track containers in real-time' },
    { icon: FileText, title: 'BOE Reports', desc: 'View Bill of Entry reports' },
  ];
  return (
    <div className="bg-[#F8F9FA] min-h-full">
      <div className="bg-[#0E1B3D] dt-safe-top px-6 pt-6 pb-5 text-white">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="text-xl font-bold">Cargo Management</div>
            <div className="text-sm text-white/70">4 available</div>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-3">
        {items.map(it => (
          <button key={it.title} onClick={it.onClick}
            className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex gap-4 items-start text-left hover:shadow">
            <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white shrink-0 shadow">
              <it.icon size={26} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-[#0A1628]">{it.title}</div>
              <div className="text-sm text-[#7F8A9F] mt-1">{it.desc}</div>
            </div>
            <ArrowRight size={18} className="text-gray-300 mt-2" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- INVOICE DOWNLOAD ---------- */
function InvoiceDownload({ onBack, onMoreInfo }:
  { onBack: () => void; onMoreInfo: () => void }) {
  const [rotation, setRotation] = useState('');
  const [invoice, setInvoice] = useState('');
  const [results, setResults] = useState<any[] | null>(null);

  const runSearch = () => {
    setResults([
      { type: 'BL Invoice', line: 'MSK0123', no: 'INV-20251101-001', from: '01-Nov-2025', to: '15-Nov-2025' },
      { type: 'Cargo Invoice', line: 'CMA0456', no: 'INV-20251108-014', from: '08-Nov-2025', to: '20-Nov-2025' },
      { type: 'Storage Invoice', line: 'MSK0123', no: 'INV-20251110-027', from: '10-Nov-2025', to: '25-Nov-2025' },
    ]);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-full">
      <div className="bg-[#0E1B3D] dt-safe-top flex items-center gap-3 px-6 py-5 shadow">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0E1B3D]">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white">
          <div className="font-bold">Invoice Download</div>
          <div className="text-xs text-white/70">Search & download invoices</div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {/* Search Parameters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div className="font-bold text-[#0E1B3D]">Search Parameters</div>
          <div>
            <label className="block text-sm font-medium text-[#364153] mb-2">Rotation Number</label>
            <input value={rotation} onChange={e => setRotation(e.target.value)}
              placeholder="Enter rotation number"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#364153] mb-2">Invoice Number</label>
            <input value={invoice} onChange={e => setInvoice(e.target.value)}
              placeholder="Enter invoice number"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none text-sm" />
          </div>
          <button onClick={runSearch}
            className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold shadow flex items-center justify-center gap-2">
            <Search size={18} /> Search
          </button>
        </div>

        {/* Results */}
        {results && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-[#0E1B3D]">Search Results</div>
              <div className="text-xs text-[#696F83]">{results.length} found</div>
            </div>
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-[#1360D2] shrink-0">
                      <Receipt size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-[#0E1B3D] text-[15px] truncate">{r.no}</div>
                        <button onClick={onMoreInfo}
                          aria-label="More info"
                          className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[#1360D2] shrink-0">
                          <Info size={14} />
                        </button>
                      </div>
                      <div className="text-[13px] mt-1 flex items-center flex-wrap gap-x-1.5">
                        <span className="text-[#1360D2] font-semibold">{r.line}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[#364153] font-medium">{r.type}</span>
                      </div>
                      <div className="text-[13px] text-[#4A5565] mt-1.5 flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-[#1360D2]" /> {r.from} – {r.to}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button className="flex-1 dt-btn-primary text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                      <Download size={16} /> Download
                    </button>
                    <button className="flex-1 border border-[#1360D2] text-[#1360D2] py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                      <Share2 size={16} /> Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- INVOICE MORE INFO BOTTOM SHEET ---------- */
function InvoiceMoreInfoModal({ onClose, onDownload }: { onClose: () => void; onDownload: () => void }) {
  const rows: [string, string][] = [
    ['Port', 'Jebel Ali (AEJEA)'],
    ['Invoice Type', 'BL Invoice'],
    ['Line Code', 'MSK0123'],
    ['Date', '15-Nov-2025'],
    ['Invoice No / From – To', 'INV-20251101-001 · 01-Nov-2025 → 15-Nov-2025'],
    ['Rotation Number', 'ROT-908471'],
    ['Vessel Name', 'Jebel Ali – T1 · ALLIANCE FAIRFAX'],
    ['Size', '142 KB · PDF'],
  ];
  return (
    <BottomSheet title="More Information" onClose={onClose}>
      <div className="space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="py-2 flex items-start justify-between gap-4 border-b border-gray-100 last:border-0">
            <span className="text-sm font-bold text-[#0E1B3D] shrink-0">{k}</span>
            <span className="text-sm text-[#696F83] text-right">{v}</span>
          </div>
        ))}
        <div className="pt-5 flex gap-2">
          <button onClick={onDownload}
            className="flex-1 dt-btn-primary text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2">
            <Download size={18} /> Download
          </button>
          <button className="flex-1 border border-[#1360D2] text-[#1360D2] py-3 rounded-2xl font-bold flex items-center justify-center gap-2">
            <Share2 size={18} /> Share
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

/* ---------- ENABLE BIOMETRICS — simple center-aligned prompt ---------- */
function EnableBiometricsModal({ onEnable, onSkip }:
  { onEnable: () => void; onSkip: () => void }) {
  return (
    <div className="absolute inset-0 bg-[#0E1B3D]/55 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm px-6 py-7 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0E47A6] via-[#1360D2] to-[#2950E5] flex items-center justify-center text-white shadow-[0_12px_24px_-8px_rgba(19,96,210,0.5)]">
          <Fingerprint size={32} />
        </div>
        <div className="text-[20px] font-bold text-[#0E1B3D] mt-5">Enable Biometric Login</div>
        <div className="text-sm text-[#696F83] mt-2 leading-relaxed">
          Use your fingerprint or Face ID to sign in faster next time.
        </div>
        <button onClick={onEnable}
          className="mt-6 w-full bg-gradient-to-r from-[#0E47A6] via-[#1360D2] to-[#2950E5] text-white py-3.5 rounded-2xl font-bold shadow-[0_10px_25px_-5px_rgba(19,96,210,0.5)]">
          Enable Biometrics
        </button>
        <button onClick={onSkip}
          className="mt-2 w-full text-[#696F83] py-2.5 rounded-2xl font-medium">
          Maybe later
        </button>
      </div>
    </div>
  );
}

/* ---------- ONBOARDING (3-step parallax slider, all-blue light theme) ---------- */
function Onboarding({ onDone }: { onDone: () => void }) {
  const slides = [
    {
      tint: '#DBEAFE',          // sky-blue wash
      accent: '#1360D2',        // brand primary
      Illustration: DashboardIllustration,
      title: 'Trade ops, at a glance',
      desc: 'Customs declarations, gate passes, vessels & payments — all in one personalised dashboard.',
    },
    {
      tint: '#BFDBFE',          // medium powder blue
      accent: '#2950E5',        // button primary
      Illustration: PaymentIllustration,
      title: 'Pay & top up in seconds',
      desc: 'Advance Deposit, Prepaid Card and FCL bills with Apple Pay, Rosoom or auto top-ups.',
    },
    {
      tint: '#C7DAFB',          // cool steel blue
      accent: '#0E47A6',        // deep cobalt
      Illustration: ShippingIllustration,
      title: 'Track cargo in real-time',
      desc: 'Watch containers move from landed → from town → delivered, with live ETA & ETD updates.',
    },
  ];
  const [idx, setIdx] = useState(0);
  const last = idx === slides.length - 1;

  return (
    <div className="relative h-full min-h-full overflow-hidden bg-white">
      {/* Soft blue wash per slide (cross-fades) */}
      {slides.map((s, i) => (
        <div key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: i === idx ? 1 : 0,
            background: `linear-gradient(180deg, ${s.tint} 0%, #FFFFFF 55%, #F8FAFF 100%)`,
          }} />
      ))}

      {/* Floating decorative blobs (always blue, intensity follows accent) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-24 -right-24 w-[340px] h-[340px] rounded-full blur-3xl opacity-30 transition-all duration-700 ease-out"
          style={{ background: slides[idx].accent, transform: `translateX(${idx * -40}px) translateY(${idx * 12}px)` }} />
        <div
          className="absolute top-[40%] -left-32 w-[280px] h-[280px] rounded-full blur-3xl opacity-15 transition-all duration-700 ease-out"
          style={{ background: slides[idx].accent, transform: `translateX(${idx * 30}px)` }} />
      </div>

      {/* Skip */}
      <button onClick={onDone}
        className="absolute top-14 right-5 z-20 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-gray-200 text-[#0E1B3D] text-sm font-medium shadow-sm">
        Skip
      </button>

      {/* Slides — horizontal track */}
      <div className="absolute left-0 top-0 bottom-[210px] flex transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
        style={{ transform: `translateX(-${idx * (100 / slides.length)}%)`, width: `${slides.length * 100}%` }}>
        {slides.map((s, i) => {
          const Illustration = s.Illustration;
          const offset = (i - idx);
          const absOff = Math.min(Math.abs(offset), 1);
          // Parallax + fade for organic, layered text travel
          const titleShift = offset * 50;
          const descShift = offset * 90;
          const illoShift = offset * 110;
          const fade = 1 - absOff * 0.85;
          const scale = 1 - absOff * 0.06;
          return (
            <div key={i} className="relative h-full flex flex-col items-center justify-center px-8 text-center"
              style={{ width: `${100 / slides.length}%` }}>
              {/* Illustration */}
              <div className="relative mb-12 transition-all duration-700 ease-out"
                style={{ transform: `translateX(${illoShift}px) scale(${scale})`, opacity: fade }}>
                <div className="absolute inset-0 rounded-[40px] blur-3xl opacity-25"
                  style={{ background: s.accent }} />
                <Illustration accent={s.accent} />
              </div>

              {/* Title — medium parallax */}
              <div className="transition-all duration-700 ease-out"
                style={{ transform: `translateX(${titleShift}px)`, opacity: fade }}>
                <div className="text-[28px] font-bold leading-[34px] tracking-tight text-[#0E1B3D] max-w-[300px] mx-auto">{s.title}</div>
              </div>
              {/* Description — faster parallax, slight extra delay feel via larger shift */}
              <div className="mt-3 transition-all duration-700 ease-out"
                style={{ transform: `translateX(${descShift}px)`, opacity: fade }}>
                <div className="text-[15px] text-[#4A5565] leading-relaxed max-w-[280px] mx-auto">{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination + Next */}
      <div className="absolute inset-x-0 bottom-0 px-7 pb-10 z-10">
        <div className="flex items-center justify-center gap-2 mb-6 h-6 select-none">
          {slides.map((_, i) => (
            <button key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === idx}
              className="group relative h-6 flex items-center px-1 cursor-pointer">
              <span
                className="block h-2 rounded-full transition-all duration-500 group-hover:opacity-80"
                style={{
                  width: i === idx ? 28 : 8,
                  background: i === idx ? slides[idx].accent : '#C9D2DE',
                  boxShadow: i === idx ? `0 0 0 4px ${slides[idx].accent}1A` : 'none',
                }} />
            </button>
          ))}
        </div>
        <button onClick={() => last ? onDone() : setIdx(i => Math.min(i + 1, slides.length - 1))}
          className="dt-btn-primary w-full text-white py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2">
          {last ? 'Get Started' : 'Next'}
          <ArrowRight size={18} />
        </button>
        {!last && (
          <div className="text-center text-xs text-[#6B7280] mt-3">
            Tap the dots above or swipe to navigate
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Illustrations (composed SVG scenes) ---------- */
function DashboardIllustration({ accent }: { accent: string }) {
  return (
    <svg width="260" height="220" viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dashGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5FB" />
        </linearGradient>
        <linearGradient id="vesselBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#0E1B3D" />
        </linearGradient>
      </defs>

      {/* Soft halo */}
      <circle cx="130" cy="110" r="100" fill={accent} opacity="0.06" />

      {/* Central dashboard card */}
      <g className="dt-anim-float-slow" style={{ transformOrigin: '130px 110px' }}>
        <rect x="48" y="50" width="164" height="120" rx="20" fill="url(#dashGrad)" stroke="#E5E7EB" />
        {/* header */}
        <rect x="60" y="64" width="56" height="8" rx="4" fill={accent} opacity="0.85" />
        <rect x="60" y="76" width="34" height="6" rx="3" fill="#CBD5E1" />
        {/* mini bars + trend */}
        <rect x="60" y="100" width="6" height="22" rx="3" fill={accent} opacity="0.35" />
        <rect x="70" y="94" width="6" height="28" rx="3" fill={accent} opacity="0.55" />
        <rect x="80" y="104" width="6" height="18" rx="3" fill={accent} opacity="0.4" />
        <rect x="90" y="88" width="6" height="34" rx="3" fill={accent} />
        <rect x="100" y="98" width="6" height="24" rx="3" fill={accent} opacity="0.6" />
        <rect x="110" y="92" width="6" height="30" rx="3" fill={accent} opacity="0.5" />
        <rect x="120" y="100" width="6" height="22" rx="3" fill={accent} opacity="0.4" />
        {/* trend chip */}
        <rect x="136" y="92" width="64" height="32" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
        <path d="M142 116 L152 108 L162 112 L172 102 L182 104 L194 96"
          stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="194" cy="96" r="3" fill={accent} />
        {/* footer pills */}
        <rect x="60" y="138" width="40" height="18" rx="9" fill={accent} opacity="0.12" />
        <rect x="66" y="144" width="28" height="6" rx="3" fill={accent} />
        <rect x="108" y="138" width="40" height="18" rx="9" fill="#EFF6FF" />
        <rect x="114" y="144" width="28" height="6" rx="3" fill={accent} opacity="0.6" />
        <rect x="156" y="138" width="40" height="18" rx="9" fill="#F1F5FB" />
        <rect x="162" y="144" width="28" height="6" rx="3" fill="#94A3B8" />
      </g>

      {/* TOP-LEFT: Vessel chip (gently sailing, no labels) */}
      <g className="dt-anim-sail" style={{ transformOrigin: '38px 30px' }}>
        <rect x="6" y="10" width="64" height="48" rx="12" fill="#FFFFFF" stroke="#E5E7EB" />
        {/* sea waves */}
        <path d="M12 48 Q20 44 28 48 T44 48 T60 48 T68 48"
          stroke={accent} strokeWidth="1.5" fill="none" opacity="0.45" />
        {/* hull */}
        <path d="M14 40 L62 40 L57 50 L19 50 Z" fill="url(#vesselBody)" />
        {/* deck containers */}
        <rect x="20" y="30" width="10" height="10" fill={accent} opacity="0.85" />
        <rect x="32" y="30" width="10" height="10" fill="#FFFFFF" />
        <rect x="44" y="30" width="10" height="10" fill={accent} opacity="0.6" />
        {/* mast & flag */}
        <rect x="38" y="16" width="2" height="14" fill="#0E1B3D" />
        <path d="M40 16 L52 20 L40 22 Z" fill={accent} />
        {/* funnel smoke */}
        <circle cx="26" cy="22" r="2.5" fill="#CBD5E1" />
        <circle cx="22" cy="18" r="2" fill="#CBD5E1" opacity="0.7" />
        <circle cx="20" cy="13" r="1.5" fill="#CBD5E1" opacity="0.5" />
      </g>

      {/* TOP-RIGHT: Authority officer (subtle pulse) */}
      <g className="dt-anim-pulse" style={{ transformOrigin: '226px 36px' }}>
        {/* circular badge bg */}
        <circle cx="226" cy="36" r="28" fill="#FFFFFF" stroke="#E5E7EB" />
        <circle cx="226" cy="36" r="22" fill={accent} opacity="0.10" />
        {/* officer body */}
        <path d="M212 56 Q212 44 226 44 Q240 44 240 56 L240 60 L212 60 Z"
          fill="url(#vesselBody)" />
        {/* badge on chest */}
        <circle cx="226" cy="52" r="2" fill="#F6CB46" />
        {/* head/face */}
        <circle cx="226" cy="34" r="7" fill="#F5D7B8" />
        {/* peaked cap (top) */}
        <path d="M217 28 Q217 22 226 22 Q235 22 235 28 L235 31 L217 31 Z"
          fill="url(#vesselBody)" />
        {/* cap band */}
        <rect x="217" y="29" width="18" height="3" fill={accent} />
        {/* cap brim */}
        <path d="M214 31 L238 31 L236 33 L216 33 Z" fill="#0E1B3D" />
        {/* cap badge (gold star) */}
        <circle cx="226" cy="26.5" r="1.8" fill="#F6CB46" />
        {/* clipping circle so the body doesn't escape the badge */}
        <circle cx="226" cy="36" r="28" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
      </g>

      {/* BOTTOM-LEFT: Document (floating, no stamp text) */}
      <g className="dt-anim-float-mid" style={{ transformOrigin: '32px 188px' }}>
        {/* paper */}
        <rect x="6" y="150" width="58" height="72" rx="6" fill="#FFFFFF" stroke="#E5E7EB" />
        {/* dog-ear */}
        <path d="M52 150 L64 150 L64 162 Z" fill="#F1F5FB" stroke="#E5E7EB" />
        {/* lines */}
        <rect x="12" y="160" width="34" height="3" rx="1.5" fill="#0E1B3D" opacity="0.8" />
        <rect x="12" y="168" width="44" height="2" rx="1" fill="#94A3B8" />
        <rect x="12" y="174" width="40" height="2" rx="1" fill="#94A3B8" />
        <rect x="12" y="180" width="36" height="2" rx="1" fill="#94A3B8" />
        <rect x="12" y="186" width="44" height="2" rx="1" fill="#94A3B8" />
        <rect x="12" y="200" width="20" height="6" rx="2" fill={accent} opacity="0.25" />
        <rect x="34" y="200" width="22" height="6" rx="2" fill={accent} opacity="0.5" />
        {/* approved tick chip on doc */}
        <circle cx="48" cy="212" r="6" fill={accent} />
        <path d="M45 213 L47.5 215 L51 211" stroke="#FFFFFF" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* BOTTOM-RIGHT: Notification chip (fast float) */}
      <g className="dt-anim-float-fast" style={{ transformOrigin: '226px 188px' }}>
        <rect x="190" y="166" width="68" height="42" rx="12" fill="#FFFFFF" stroke="#E5E7EB" />
        <circle cx="206" cy="187" r="9" fill={accent} opacity="0.15" />
        <path d="M201 188 L205 192 L211 184" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="220" y="178" width="32" height="5" rx="2.5" fill="#0E1B3D" opacity="0.8" />
        <rect x="220" y="188" width="24" height="4" rx="2" fill="#94A3B8" />
        <rect x="220" y="197" width="16" height="3" rx="1.5" fill="#94A3B8" opacity="0.6" />
      </g>
    </svg>
  );
}

function PaymentIllustration({ accent }: { accent: string }) {
  return (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#0E1B3D" />
        </linearGradient>
        <linearGradient id="cardBack" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EFF6FF" />
        </linearGradient>
      </defs>
      {/* background card (slightly rotated, slow drift) */}
      <g className="dt-anim-float-slow" style={{ transformOrigin: '110px 100px' }}>
        <g transform="rotate(-8 110 100)">
          <rect x="34" y="44" width="150" height="92" rx="14" fill="url(#cardBack)" stroke="#E5E7EB" />
          <rect x="46" y="56" width="34" height="22" rx="4" fill={accent} opacity="0.2" />
          <rect x="46" y="106" width="80" height="6" rx="3" fill="#CBD5E1" />
          <rect x="46" y="118" width="50" height="5" rx="2.5" fill="#CBD5E1" />
        </g>
      </g>
      {/* foreground card (counter-floats, mid speed) */}
      <g className="dt-anim-float-mid" style={{ transformOrigin: '110px 110px' }}>
        <g transform="rotate(6 110 110)">
          <rect x="30" y="58" width="160" height="100" rx="16" fill="url(#cardGrad)" />
          {/* chip */}
          <rect x="44" y="76" width="28" height="20" rx="4" fill="#F6CB46" />
          <rect x="48" y="80" width="20" height="2" rx="1" fill="#B6892A" />
          <rect x="48" y="84" width="20" height="2" rx="1" fill="#B6892A" />
          <rect x="48" y="88" width="20" height="2" rx="1" fill="#B6892A" />
          {/* wave (contactless) */}
          <path d="M84 78 Q92 86 84 96" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M88 74 Q100 86 88 100" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* number dots */}
          <g fill="#FFFFFF">
            <circle cx="48" cy="116" r="2" /><circle cx="55" cy="116" r="2" /><circle cx="62" cy="116" r="2" /><circle cx="69" cy="116" r="2" />
            <circle cx="84" cy="116" r="2" /><circle cx="91" cy="116" r="2" /><circle cx="98" cy="116" r="2" /><circle cx="105" cy="116" r="2" />
            <circle cx="120" cy="116" r="2" /><circle cx="127" cy="116" r="2" /><circle cx="134" cy="116" r="2" /><circle cx="141" cy="116" r="2" />
          </g>
          <rect x="156" y="112" width="22" height="8" rx="3" fill="#FFFFFF" />
          <rect x="44" y="132" width="60" height="5" rx="2.5" fill="#FFFFFF" opacity="0.85" />
          <rect x="44" y="142" width="40" height="4" rx="2" fill="#FFFFFF" opacity="0.6" />
        </g>
      </g>
      {/* sparkles — each pulses on its own rhythm */}
      <g className="dt-anim-pulse" style={{ transformOrigin: '188px 47px' }}>
        <path d="M188 38 L191 44 L197 47 L191 50 L188 56 L185 50 L179 47 L185 44 Z" fill={accent} />
      </g>
      <g className="dt-anim-float-fast" style={{ transformOrigin: '24px 137px' }}>
        <path d="M22 130 L24 134 L28 136 L24 138 L22 142 L20 138 L16 136 L20 134 Z" fill={accent} opacity="0.7" />
      </g>
      <g className="dt-anim-pulse" style={{ transformOrigin: '200px 170px' }}>
        <circle cx="200" cy="170" r="4" fill={accent} opacity="0.7" />
      </g>
      <g className="dt-anim-float-mid" style={{ transformOrigin: '14px 62px' }}>
        <circle cx="14" cy="62" r="3" fill={accent} opacity="0.6" />
      </g>
    </svg>
  );
}

function ShippingIllustration({ accent }: { accent: string }) {
  return (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="truckBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#0E1B3D" />
        </linearGradient>
      </defs>
      {/* horizon line shadow */}
      <ellipse cx="110" cy="160" rx="90" ry="6" fill={accent} opacity="0.08" />
      {/* road dashes */}
      <g fill="#94A3B8" opacity="0.5">
        <rect x="10" y="156" width="14" height="3" rx="1.5" />
        <rect x="30" y="156" width="14" height="3" rx="1.5" />
        <rect x="50" y="156" width="14" height="3" rx="1.5" />
        <rect x="160" y="156" width="14" height="3" rx="1.5" />
        <rect x="180" y="156" width="14" height="3" rx="1.5" />
      </g>

      {/* stacked containers (background) — each gently float on its own */}
      <g className="dt-anim-float-mid" style={{ transformOrigin: '43px 110px' }}>
        <rect x="20" y="92" width="46" height="36" rx="4" fill="#EFF6FF" stroke="#CBD5E1" />
        <rect x="26" y="98" width="34" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="26" y="104" width="34" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="26" y="110" width="34" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="26" y="116" width="34" height="2" rx="1" fill={accent} opacity="0.3" />
      </g>
      <g className="dt-anim-float-slow" style={{ transformOrigin: '43px 75px' }}>
        <rect x="22" y="60" width="42" height="30" rx="4" fill={accent} opacity="0.15" stroke="#CBD5E1" />
        <rect x="28" y="68" width="30" height="2" rx="1" fill={accent} opacity="0.4" />
        <rect x="28" y="74" width="30" height="2" rx="1" fill={accent} opacity="0.4" />
        <rect x="28" y="80" width="30" height="2" rx="1" fill={accent} opacity="0.4" />
      </g>

      {/* TRUCK — gentle bob to suggest driving motion */}
      <g className="dt-anim-float-fast" style={{ transformOrigin: '130px 118px' }}>
        {/* trailer */}
        <rect x="70" y="80" width="92" height="68" rx="8" fill="url(#truckBody)" />
        {/* trailer lines */}
        <rect x="78" y="92" width="76" height="2" rx="1" fill="#FFFFFF" opacity="0.5" />
        <rect x="78" y="102" width="76" height="2" rx="1" fill="#FFFFFF" opacity="0.4" />
        <rect x="78" y="112" width="76" height="2" rx="1" fill="#FFFFFF" opacity="0.3" />
        <rect x="78" y="122" width="76" height="2" rx="1" fill="#FFFFFF" opacity="0.25" />
        {/* logo dot */}
        <circle cx="116" cy="138" r="3" fill="#FFFFFF" opacity="0.7" />
        {/* cabin */}
        <path d="M162 100 L186 100 Q196 100 196 110 L196 148 L162 148 Z" fill="#FFFFFF" stroke="#E5E7EB" />
        {/* window */}
        <path d="M168 106 L186 106 Q190 106 190 112 L190 122 L168 122 Z" fill={accent} opacity="0.4" />
        {/* wheels */}
        <circle cx="92" cy="156" r="10" fill="#0E1B3D" />
        <circle cx="92" cy="156" r="4" fill="#FFFFFF" />
        <circle cx="140" cy="156" r="10" fill="#0E1B3D" />
        <circle cx="140" cy="156" r="4" fill="#FFFFFF" />
        <circle cx="180" cy="156" r="10" fill="#0E1B3D" />
        <circle cx="180" cy="156" r="4" fill="#FFFFFF" />
      </g>

      {/* Motion lines — pulse rhythmically as if rushing past */}
      <g className="dt-anim-pulse" style={{ transformOrigin: '57px 112px' }}>
        <rect x="54" y="100" width="12" height="2" rx="1" fill={accent} opacity="0.55" />
        <rect x="48" y="112" width="18" height="2" rx="1" fill={accent} opacity="0.45" />
        <rect x="52" y="124" width="14" height="2" rx="1" fill={accent} opacity="0.35" />
      </g>

      {/* Location pin — bobs (like a dropping pin) */}
      <g className="dt-anim-float-mid" style={{ transformOrigin: '184px 44px' }}>
        <circle cx="184" cy="44" r="14" fill="#FFFFFF" stroke="#E5E7EB" />
        <circle cx="184" cy="42" r="5" fill={accent} />
        <path d="M184 47 L184 56" stroke={accent} strokeWidth="2" />
      </g>
    </svg>
  );
}
