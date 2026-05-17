import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Eye, EyeOff, Fingerprint, Bell, Settings, Home,
  LayoutGrid, List, Wallet, CreditCard, Truck, Ship, Package, FileText,
  MapPin, Search, X, User, Key, Info, Shield, FileCheck, LogOut, Award,
  Type, Box, ClipboardList, ArrowRight, Building2, Boxes,
  AlertCircle, Upload, Calendar, Mail, Phone, FileCheck2, CheckCircle2, Plus, Download,
  Trash2, Copy, Check, Clock, Receipt, Share2, Sun, Moon, Pin, Sparkles,
} from 'lucide-react';
import dubaiTradeLogo from './assets/dubai-trade-logo.svg';
import uaePassLogoSvg from './assets/uaepass-logo.svg?raw';
import Dh, { DhAmount } from './Dh';

type Screen =
  | 'splash'
  | 'onboarding'
  | 'login' | 'customerProfile' | 'accessibility'
  | 'dashboard' | 'services' | 'profile' | 'payments'
  | 'requestDDO' | 'ddoSearch' | 'blParty' | 'ddoParty' | 'ddoDocuments' | 'blDetails' | 'requestingParty' | 'ddoPayment' | 'ddoSuccess'
  | 'importFCL' | 'gatePass' | 'gatePassDetails' | 'addVehicle' | 'boeDetails' | 'containers' | 'vessels'
  | 'ddoRecords' | 'customsTrack' | 'gatePassList' | 'productDetails'
  | 'forgotPassword' | 'verifyCode' | 'resetPassword' | 'notifications' | 'notificationsSettings' | 'subscription'
  | 'cargoMgmt' | 'invoiceDownload'
  | 'tlucPayments'
  | 'gatePassPayment'
  | 'changePassword';

type View = 'grid' | 'list';
type ModalKind = null | 'advanceDeposit' | 'autoTopup' | 'prepaidTopup' | 'prepaidEmpty' | 'addPrepaidCard' | 'prepaidCardCreated' | 'deletePrepaidCard' | 'paySuccess'
  | 'fclTotalPayment' | 'fclPaySuccess' | 'removeVehicle' | 'gatePassCreated'
  | 'passwordResetSuccess' | 'vatPending' | 'renewSuccess' | 'invoiceMoreInfo' | 'enableBiometrics';

export default function App() {
  // Allow deep-linking via ?dt-screen=NAME, ?dt-modal=NAME, ?dt-customize=1, ?dt-tour=1
  const qp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const initialModalKind = qp.get('dt-modal') as ModalKind | null;
  const initialCustomize = qp.get('dt-customize') === '1';
  const initialTour = qp.get('dt-tour') === '1';
  // If a modal/customize/tour is requested without an explicit screen, default to dashboard
  const initialScreen: Screen = (() => {
    const q = qp.get('dt-screen');
    if (q) return q as Screen;
    if (initialModalKind || initialCustomize || initialTour) return 'dashboard';
    return 'splash';
  })();
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [gatePassOrigin, setGatePassOrigin] = useState<'dashboard'|'cargoMgmt'>('dashboard');
  const [forgotPasswordOrigin, setForgotPasswordOrigin] = useState<'login'|'profile'>('login');
  const [customerProfileOrigin, setCustomerProfileOrigin] = useState<'login'|'profile'>('login');
  const [splashReturnScreen, setSplashReturnScreen] = useState<Screen>('login');
  const [hasCompletedFirstRun, setHasCompletedFirstRun] = useState(initialScreen !== 'login' && initialScreen !== 'onboarding' && initialScreen !== 'splash');
  const [view, setView] = useState<View>('grid');
  const [showCustomize, setShowCustomize] = useState(initialCustomize);
  const [modal, setModal] = useState<ModalKind>(initialModalKind || null);
  const [fontSize, setFontSize] = useState<'Small'|'Medium'|'Large'|'Extra Large'>('Medium');
  const [profileIdx, setProfileIdx] = useState(0);
  const [defaultProfileIdx, setDefaultProfileIdx] = useState<number | null>(null);
  const [a11y, setA11y] = useState({ highContrast: false, boldText: false, reduceMotion: false });
  const [theme, setTheme] = useState<'dark'|'light'>('dark');
  const [sections, setSections] = useState({ payments: true, trade: true, cargo: true });
  const [biometric, setBiometric] = useState(false);
  const [loginMode, setLoginMode] = useState<'initial'|'touchId'>('initial');
  const [hasPrepaidCard, setHasPrepaidCard] = useState(initialModalKind === 'prepaidTopup');
  const [prepaidBalance, setPrepaidBalance] = useState('3,500.00');
  const [prepaidCardNumber, setPrepaidCardNumber] = useState('4231 9078 5512 0148');
  const [autoTopup, setAutoTopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'applepay'|'rosoom'|'advance'>('applepay');
  const [vehicles, setVehicles] = useState<Array<{ plate: string; qty: number }>>([]);
  const [vehicleToRemove, setVehicleToRemove] = useState<number | null>(initialModalKind === 'removeVehicle' ? 0 : null);
  const [toast, setToast] = useState<string | null>(null);
  const [hasShownBiometricPrompt, setHasShownBiometricPrompt] = useState(false);
  const [showDashboardTour, setShowDashboardTour] = useState(initialTour);
  const [pendingDashboardTour, setPendingDashboardTour] = useState(false);
  const [ddoChainMode, setDdoChainMode] = useState(false);
  const [ddoSearchOpen, setDdoSearchOpen] = useState(false);
  const [ddoFilterStatus, setDdoFilterStatus] = useState<string>('all');

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
        {screen === 'splash' && (
          <SplashScreen onDone={() => {
            const ret = splashReturnScreen;
            setScreen(ret);
            // Reset so login doesn't replay the entrance animation next time
            setTimeout(() => setSplashReturnScreen('login'), 1000);
          }} />
        )}
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
            onForgot={() => { setForgotPasswordOrigin('login'); setScreen('forgotPassword'); }}
            fromSplash={splashReturnScreen === 'login'}
            onViewSplash={() => { setSplashReturnScreen('login'); setScreen('splash'); }} />
        )}
        {screen === 'customerProfile' && (
          <CustomerProfile selected={profileIdx} onSelect={setProfileIdx}
            defaultIdx={defaultProfileIdx} onSetDefault={setDefaultProfileIdx}
            onBack={() => setScreen(customerProfileOrigin)}
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
            prepaidBalance={prepaidBalance} hasPrepaidCard={hasPrepaidCard}
            onOpenSettings={() => setShowCustomize(true)}
            onAdvanceDeposit={() => setModal('advanceDeposit')}
            onPrepaidCard={() => setModal(hasPrepaidCard ? 'prepaidTopup' : 'prepaidEmpty')}
            onImportFCL={() => setScreen('importFCL')}
            onTluc={() => setScreen('tlucPayments')}
            onGatePass={() => { setGatePassOrigin('dashboard'); setScreen('gatePassList'); }}
            onContainers={() => setScreen('containers')}
            onVessels={() => setScreen('vessels')}
            onNotifications={() => setScreen('notifications')}
            onRequestDDO={() => setDdoSearchOpen(true)}
            onDDORecord={(status: string) => { setDdoFilterStatus(status); setScreen('ddoRecords'); }}
            onCustomsTrack={() => setScreen('customsTrack')}
            onTab={(t) => setScreen(t)} />
        )}
        {screen === 'services' && (
          <Services onTab={(t) => setScreen(t)}
            onOpenPayments={() => setScreen('payments')}
            onOpenCargoMgmt={() => setScreen('cargoMgmt')}
            onAdvanceDeposit={() => setModal('advanceDeposit')}
            onPrepaidCard={() => setModal(hasPrepaidCard ? 'prepaidTopup' : 'prepaidEmpty')}
            onImportFCL={() => setScreen('importFCL')}
            onTluc={() => setScreen('tlucPayments')}
            onVessels={() => setScreen('vessels')}
            onContainers={() => setScreen('containers')}
            onRequestDDO={() => setDdoSearchOpen(true)}
            onCustomsTrack={() => setScreen('customsTrack')}
            onGatePass={() => { setGatePassOrigin('dashboard'); setScreen('gatePassList'); }} />
        )}
        {screen === 'cargoMgmt' && (
          <CargoManagement onBack={() => setScreen('services')}
            onInvoiceDownload={() => setScreen('invoiceDownload')}
            onGatePass={() => { setGatePassOrigin('cargoMgmt'); setScreen('gatePassList'); }} />
        )}
        {screen === 'invoiceDownload' && (
          <InvoiceDownload onBack={() => setScreen('cargoMgmt')}
            onMoreInfo={() => setModal('invoiceMoreInfo')} />
        )}
        {screen === 'profile' && (
          <Profile onTab={(t) => setScreen(t)}
            biometric={biometric} setBiometric={setBiometric}
            onSignOut={goLogin}
            onResetPassword={() => setScreen('changePassword')}
            onChangeCustomer={() => { setCustomerProfileOrigin('profile'); setScreen('customerProfile'); }}
            onNotificationsSettings={() => setScreen('notificationsSettings')}
            onRenewNow={() => setScreen('subscription')}
            />
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
          <RequestDDO onBack={() => setScreen('dashboard')}
            onBLParty={() => { setDdoChainMode(false); setScreen('blParty'); }}
            onDDOParty={() => { setDdoChainMode(false); setScreen('ddoParty'); }}
            onDocs={() => { setDdoChainMode(false); setScreen('ddoDocuments'); }}
            onBLDetails={() => setScreen('blDetails')}
            onRequestingParty={() => { setDdoChainMode(false); setScreen('requestingParty'); }}
            onPay={() => setScreen('ddoPayment')} />
        )}
        {screen === 'blParty' && (
          <BLParty
            onBack={() => ddoChainMode ? setScreen('requestingParty') : setScreen('requestDDO')}
            onSave={() => ddoChainMode ? setScreen('ddoParty') : setScreen('requestDDO')}
            chainMode={ddoChainMode}
          />
        )}
        {screen === 'ddoParty' && (
          <DDOParty
            onBack={() => ddoChainMode ? setScreen('blParty') : setScreen('requestDDO')}
            onSave={() => ddoChainMode ? setScreen('ddoDocuments') : setScreen('requestDDO')}
            chainMode={ddoChainMode}
          />
        )}
        {screen === 'ddoDocuments' && (
          <DDODocuments
            onBack={() => ddoChainMode ? setScreen('ddoParty') : setScreen('requestDDO')}
            onSave={() => { setDdoChainMode(false); setScreen('requestDDO'); }}
            chainMode={ddoChainMode}
          />
        )}
        {screen === 'ddoPayment' && (
          <DDOPaymentScreen
            onBack={() => setScreen('requestDDO')}
            onConfirm={() => setScreen('ddoSuccess')}
          />
        )}
        {screen === 'ddoSuccess' && (
          <DDOSuccessScreen onDone={() => setScreen('dashboard')} />
        )}
        {screen === 'ddoRecords' && (
          <DDORecordsScreen status={ddoFilterStatus} onBack={() => setScreen('dashboard')} />
        )}
        {screen === 'customsTrack' && (
          <CustomsTrackScreen onBack={() => setScreen('dashboard')} />
        )}
        {screen === 'gatePassList' && (
          <GatePassListScreen
            onBack={() => setScreen(gatePassOrigin === 'cargoMgmt' ? 'cargoMgmt' : 'dashboard')}
            onSelect={() => setScreen('gatePassDetails')}
          />
        )}
        {screen === 'productDetails' && (
          <ProductDetailsScreen onBack={() => setScreen('gatePassDetails')} />
        )}
        {screen === 'blDetails' && <BLDetailsScreen onBack={() => setScreen('requestDDO')} />}
        {screen === 'requestingParty' && (
          <RequestingPartyScreen
            onBack={() => setScreen('requestDDO')}
            onContinue={() => { setDdoChainMode(true); setScreen('blParty'); }}
          />
        )}
        {screen === 'importFCL' && (
          <ImportFCL onBack={() => setScreen('dashboard')}
            onPickBill={() => setModal('fclTotalPayment')} />
        )}
        {screen === 'gatePass' && <GatePass onBack={() => setScreen('dashboard')}
          onPick={() => setScreen('gatePassDetails')} />}
        {screen === 'gatePassDetails' && (
          <GatePassDetails vehicles={vehicles}
            onBack={() => setScreen('gatePassList')}
            onAddVehicle={() => setScreen('addVehicle')}
            onViewDetails={() => setScreen('boeDetails')}
            onViewProducts={() => setScreen('productDetails')}
            onRemoveVehicle={(i) => { setVehicleToRemove(i); setModal('removeVehicle'); }}
            onPay={() => setScreen('gatePassPayment')} />
        )}
        {screen === 'addVehicle' && (
          <AddVehicle index={vehicles.length + 1}
            onCancel={() => setScreen('gatePassDetails')}
            onSave={() => {
              setVehicles(v => [...v, { plate: 'DXB - C - 1234', qty: 50 }]);
              setScreen('gatePassDetails');
            }} />
        )}
        {screen === 'gatePassPayment' && (
          <GatePassPayment
            amount={vehicles.length * 38}
            onBack={() => setScreen('gatePassDetails')}
            onConfirm={() => { setModal('gatePassCreated'); setScreen('gatePassDetails'); }} />
        )}
        {screen === 'boeDetails' && <BOEDetails onBack={() => setScreen('gatePassDetails')} />}
        {screen === 'containers' && <Containers onBack={() => setScreen('dashboard')} />}
        {screen === 'vessels' && <Vessels onBack={() => setScreen('dashboard')} />}
        {screen === 'forgotPassword' && (
          <ForgotPassword onBack={() => setScreen(forgotPasswordOrigin)}
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
        {screen === 'changePassword' && (
          <ChangePassword onBack={() => setScreen('profile')} onSuccess={() => { setScreen('profile'); }} />
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
        {screen === 'tlucPayments' && (
          <TlucPayments onBack={() => setScreen('dashboard')} />
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
      {ddoSearchOpen && (
        <DDOSearchFlyout
          onClose={() => setDdoSearchOpen(false)}
          onSearch={() => { setDdoSearchOpen(false); setScreen('requestDDO'); }}
        />
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
        <PrepaidTopup onClose={() => setModal(null)}
          cardNumber={prepaidCardNumber} balance={prepaidBalance}
          onDelete={() => setModal('deletePrepaidCard')} />
      )}
      {modal === 'deletePrepaidCard' && (
        <DeletePrepaidCardModal
          cardNumber={prepaidCardNumber}
          onCancel={() => setModal('prepaidTopup')}
          onConfirm={() => {
            setHasPrepaidCard(false);
            setPrepaidBalance('0.00');
            setPrepaidCardNumber('');
            setModal(null);
          }} />
      )}
      {modal === 'prepaidEmpty' && (
        <PrepaidEmpty onClose={() => setModal(null)}
          onAdd={() => setModal('addPrepaidCard')} />
      )}
      {modal === 'addPrepaidCard' && (
        <AddPrepaidCard onClose={() => setModal(null)}
          paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
          advanceBalance="77,001.18"
          onAdded={(amount: string, cardNumber: string) => {
            setHasPrepaidCard(true);
            setPrepaidBalance(amount);
            setPrepaidCardNumber(cardNumber);
            setModal('prepaidCardCreated');
          }} />
      )}
      {modal === 'prepaidCardCreated' && (
        <PrepaidCardCreatedModal
          amount={prepaidBalance} cardNumber={prepaidCardNumber}
          onClose={() => setModal(null)} />
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

/* ---------- 0. SPLASH ---------- */
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  const exit = React.useCallback(() => {
    setExiting(true);
    setTimeout(onDone, 680);
  }, [onDone]);

  useEffect(() => {
    let p = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        p += 1.1;
        setProgress(Math.min(p, 100));
        if (p >= 100) { clearInterval(iv); setTimeout(exit, 300); }
      }, 24);
    }, 600);
    return () => clearTimeout(t);
  }, [exit]);

  return (
    <>
      <style>{`
        @keyframes sp-logo {
          0%   { opacity:0; transform: scale(0.55) translateY(24px); filter: blur(12px); }
          70%  { filter: blur(0); }
          100% { opacity:1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes sp-version {
          0%   { opacity:0; transform: translateY(14px); }
          100% { opacity:1; transform: translateY(0); }
        }
        @keyframes sp-ring {
          0%   { opacity:.5; transform: scale(.7); }
          100% { opacity:0; transform: scale(2.4); }
        }
        @keyframes sp-glow {
          0%,100% { opacity:.22; transform: scale(1); }
          50%      { opacity:.38; transform: scale(1.18); }
        }
        @keyframes sp-dot {
          0%,100% { box-shadow:0 0 5px #14C9A9; opacity:1; }
          50%      { box-shadow:0 0 14px #14C9A9, 0 0 28px #14C9A9; opacity:.7; }
        }
        @keyframes sp-bar-shimmer {
          0%   { left:-60%; }
          100% { left:120%; }
        }
        .sp-logo    { animation: sp-logo 850ms cubic-bezier(0.22,0.61,0.36,1) forwards; }
        .sp-version { animation: sp-version 550ms 820ms ease both; }
        .sp-ring1   { animation: sp-ring 2.4s 200ms ease-out infinite; }
        .sp-ring2   { animation: sp-ring 2.4s 900ms ease-out infinite; }
        .sp-glow    { animation: sp-glow 3.2s ease-in-out infinite; }
        .sp-dot     { animation: sp-dot 2s ease-in-out infinite; }
        .sp-shimmer { animation: sp-bar-shimmer 1.6s 1.2s linear infinite; }
      `}</style>

      <div
        onClick={exit}
        className="fixed inset-0 flex flex-col items-center justify-center select-none overflow-hidden"
        style={{ background: 'linear-gradient(175deg, #060E24 0%, #0A1733 50%, #0E2050 100%)' }}
      >
        {/* Pulsing radial glow — fades out on exit */}
        <div className="sp-glow absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: exiting ? 0 : undefined, transition: exiting ? 'opacity 300ms' : undefined }}>
          <div className="w-[380px] h-[380px] rounded-full blur-[80px]"
            style={{ background: 'radial-gradient(circle, rgba(19,96,210,0.5) 0%, transparent 65%)' }} />
        </div>

        {/* Expanding rings — fade out on exit */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ marginTop: '-40px', opacity: exiting ? 0 : undefined, transition: exiting ? 'opacity 200ms' : undefined }}>
          <div className="sp-ring1 absolute w-[220px] h-[220px] rounded-full"
            style={{ border: '1.5px solid rgba(78,144,248,0.35)' }} />
          <div className="sp-ring2 absolute w-[220px] h-[220px] rounded-full"
            style={{ border: '1.5px solid rgba(78,144,248,0.25)' }} />
        </div>

        {/* Logo — slides to top-left on exit (mimics moving into login header) */}
        <div
          className="sp-logo flex flex-col items-center gap-7"
          style={{
            opacity: 0,
            ...(exiting ? {
              animation: 'none',
              opacity: 1,
              transform: 'translateY(-310px) translateX(-95px) scale(0.22)',
              transition: 'transform 650ms cubic-bezier(0.22,0.61,0.36,1), opacity 100ms 550ms',
              transformOrigin: 'center center',
            } : {}),
          }}
        >
          <img src={dubaiTradeLogo} alt="Dubai Trade"
            style={{ width: 230, filter: 'brightness(0) invert(1)' }} />

          {/* Version pill — fades out on exit */}
          <div className="sp-version"
            style={{ opacity: exiting ? 0 : undefined, transition: exiting ? 'opacity 150ms' : undefined }}>
            <span className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[12.5px] font-semibold tracking-[0.14em] uppercase"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.82)' }}>
              <span className="sp-dot w-1.5 h-1.5 rounded-full bg-[#14C9A9]" />
              Version 2.0
            </span>
          </div>
        </div>

        {/* Progress bar — fades out on exit */}
        <div className="absolute bottom-14 left-12 right-12 flex flex-col items-center gap-3"
          style={{ opacity: exiting ? 0 : undefined, transition: exiting ? 'opacity 200ms' : undefined }}>
          <div className="relative w-full h-[2px] rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #4E90F8, #2950E5)', transition: 'width 24ms linear' }} />
            <div className="sp-shimmer absolute top-0 h-full w-[40%] pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)' }} />
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Tap to skip
          </span>
        </div>
      </div>
    </>
  );
}

/* ---------- 1. LOGIN ---------- */
function Login({ onContinue, mode, theme = 'dark', onToggleTheme, onForgot, onLoginWithPassword, onViewSplash, fromSplash }:
  { onContinue: () => void; mode: 'initial'|'touchId';
    theme?: 'dark'|'light'; onToggleTheme?: () => void;
    onForgot?: () => void; onLoginWithPassword?: () => void;
    onViewSplash?: () => void; fromSplash?: boolean }) {
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
  const ThemeToggle = (
    <div className="relative z-10 mt-2 flex flex-col items-center gap-2">
      {onToggleTheme && (
        <button onClick={onToggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all
            ${isDark
              ? 'bg-white/10 hover:bg-white/20 border border-white/15 text-white/85'
              : 'bg-white hover:bg-[#F4F7FE] border border-[#E0EAFB] text-[#1360D2] shadow-sm'}`}>
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
          <span>{isDark ? 'Preview light theme' : 'Preview dark theme'}</span>
        </button>
      )}
      {onViewSplash && (
        <button onClick={onViewSplash}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all
            ${isDark
              ? 'bg-white/10 hover:bg-white/20 border border-white/15 text-white/85'
              : 'bg-white hover:bg-[#F4F7FE] border border-[#E0EAFB] text-[#1360D2] shadow-sm'}`}>
          <Sparkles size={13} />
          <span>What's new in v2.0</span>
        </button>
      )}
    </div>
  );
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const canSubmit = username.trim().length > 0 || password.length > 0;
  const splashEntrance = fromSplash
    ? { animation: 'sp-login-in 650ms cubic-bezier(0.22,0.61,0.36,1) both' }
    : {};
  // Clear fromSplash flag after mount so returning to login later doesn't re-animate
  const onViewSplashRef = React.useRef(onViewSplash);
  useEffect(() => { onViewSplashRef.current = onViewSplash; }, [onViewSplash]);
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
          <div className="flex items-center gap-3 my-5 text-[11px] font-semibold text-gray-500 tracking-wider">
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
    <>
    {fromSplash && <style>{`
      @keyframes sp-login-in {
        0%   { opacity:0; transform: translateY(60px); }
        100% { opacity:1; transform: translateY(0); }
      }
      @keyframes sp-logo-settle {
        0%   { opacity:0; transform: scale(3.8) translateX(95px) translateY(310px); }
        60%  { opacity:1; }
        100% { opacity:1; transform: scale(1) translateX(0) translateY(0); }
      }
    `}</style>}
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
          <img src={dubaiTradeLogo} alt="Dubai Trade" className={`h-12 w-auto ${logoCls}`}
            style={fromSplash ? { animation: 'sp-logo-settle 650ms cubic-bezier(0.22,0.61,0.36,1) both', transformOrigin: 'left center' } : {}} />
        </div>
        <div className="text-[28px] font-bold leading-[34px] tracking-tight" style={splashEntrance}>Welcome back.</div>
        <div className={`text-[15px] mt-2 max-w-[280px] leading-snug ${subtitleCls}`} style={splashEntrance}>
          Sign in to manage your trade operations — anywhere, anytime.
        </div>
      </div>

      {/* Form card */}
      <div className={`relative mx-5 rounded-[28px] p-6 z-10 ${cardCls}`} style={{ ...splashEntrance, animationDelay: fromSplash ? '80ms' : undefined }}>
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1360D2]">
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
        <div className="flex items-center gap-3 my-5 text-[11px] font-semibold text-gray-500 tracking-wider">
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
      <div className="relative mt-6 pb-6 px-7 text-center space-y-2.5 z-10"
        style={{ ...splashEntrance, animationDelay: fromSplash ? '140ms' : undefined }}>
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
    </>
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
function Dashboard({ view, setView, prepaidBalance, hasPrepaidCard, onOpenSettings, onTab, onAdvanceDeposit, onPrepaidCard, onImportFCL, onTluc, onGatePass, onContainers, onVessels, onNotifications, onRequestDDO, onDDORecord, onCustomsTrack }:
  { view: View; setView: (v: View) => void; prepaidBalance: string; hasPrepaidCard: boolean; onOpenSettings: () => void; onTab: (t: Screen) => void;
    onAdvanceDeposit: () => void; onPrepaidCard: () => void; onImportFCL: () => void; onTluc: () => void; onGatePass: () => void; onContainers: () => void; onVessels: () => void; onNotifications: () => void; onRequestDDO: () => void; onDDORecord: (status: string) => void; onCustomsTrack: () => void }) {
  const prepaidLabel = hasPrepaidCard ? prepaidBalance : '0.00';
  return (
    <div className="min-h-full flex flex-col" data-tour-root
      style={{
        background:
          'radial-gradient(circle at 18% 0%, rgba(199,216,244,0.55) 0%, transparent 50%),' +
          'radial-gradient(circle at 88% 14%, rgba(180,210,255,0.45) 0%, transparent 50%),' +
          'radial-gradient(circle at 50% 100%, rgba(220,231,251,0.55) 0%, transparent 55%),' +
          'linear-gradient(180deg, #F4F7FE 0%, #FFFFFF 60%, #F4F7FE 100%)',
      }}>
      <DashboardHeader view={view} setView={setView} onOpenSettings={onOpenSettings} onBell={onNotifications} />

      <div className="px-5 pt-5 pb-2 relative z-10 space-y-5">
        {view === 'grid' ? (
          <>
            {/* Payments — all four items in one grouping */}
            <div data-tour="payments">
              <SectionHead title="Payments" subtitle="Balances & outstanding queue" />
              <div className="grid grid-cols-2 gap-3">
                <PaymentCard icon={Wallet}     amount="77,001.18" label="Advance Deposit"  onClick={onAdvanceDeposit} />
                <PaymentCard icon={CreditCard} amount={prepaidLabel}  label="Prepaid Card"     onClick={onPrepaidCard} />
                <PaymentCard icon={FileText} count={5} unit="declarations" label="Import FCL Bills" onClick={onImportFCL} />
                <PaymentCard icon={Ship}       count={4} unit="BRN's" label="TLUC Payments"    onClick={onTluc} />
              </div>
            </div>

            {/* Trade + */}
            <div data-tour="trade">
              <SectionHead title="Trade +" subtitle="Delivery orders" action="REQUEST DDO" onAction={onRequestDDO} />
              <StatusGrid stats={[
                { n: 5,  l: 'Nearing Expiry', tone: 'rose',   onClick: () => onDDORecord('nearing-expiry') },
                { n: 12, l: 'Submitted',      tone: 'indigo', onClick: () => onDDORecord('submitted') },
                { n: 3,  l: 'Pending',        tone: 'amber',  onClick: () => onDDORecord('pending') },
                { n: 5,  l: 'Completed',      tone: 'green',  onClick: () => onDDORecord('completed') },
              ]} />
            </div>

            {/* Custom Declaration */}
            <div data-tour="declaration">
              <SectionHead title="Custom Declaration" subtitle="Customs status" action="TRACK" onAction={onCustomsTrack} />
              <StatusGrid stats={[
                { n: 5,  l: 'Nearing Expiry', tone: 'rose'   },
                { n: 12, l: 'Submitted',      tone: 'indigo' },
                { n: 3,  l: 'Pending',        tone: 'amber'  },
                { n: 5,  l: 'Cleared',        tone: 'green'  },
              ]} />
            </div>

            {/* Cargo Management */}
            <div data-tour="cargo">
              <SectionHead title="Cargo Management" subtitle="Your saved records" />
              <div className="grid grid-cols-3 gap-3">
                <CargoTile icon={Ship}    n={2}   l="Vessels"        sub="added" onClick={onVessels} />
                <CargoTile icon={Package} n={10}  l="Containers"     sub="added" onClick={onContainers} />
                <CargoTile icon={FileText} n={100} l="Gate Pass · BOE" sub="active" onClick={onGatePass} />
              </div>
            </div>

            {/* Recently used */}
            <div data-tour="recent">
              <SectionHead title="Recently used" subtitle="Pick up where you left off" />
              <div className="space-y-2">
                <RecentRow icon={FileCheck} title="Delivery Order" sub="Used 2 hours ago" />
                <RecentRow icon={MapPin}    title="Gate Pass"      sub="Used yesterday" onClick={onGatePass} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* List view — grouped by service domain */}
            <div data-tour="payments">
              <SectionHead title="Payments" subtitle="Balances & outstanding queue" />
              <div className="space-y-2">
                <PaymentRow icon={Wallet}     amount="77,001.18" label="Advance Deposit"  onClick={onAdvanceDeposit} />
                <PaymentRow icon={CreditCard} amount={prepaidLabel}  label="Prepaid Card"     onClick={onPrepaidCard} />
                <PaymentRow icon={FileText} count={5} unit="declarations" label="Import FCL Bills" onClick={onImportFCL} />
                <PaymentRow icon={Ship}       count={4} unit="BRN's" label="TLUC Payments"    onClick={onTluc} />
              </div>
            </div>

            <div data-tour="carrier">
              <SectionHead title="Carrier Management" subtitle="Your saved records" />
              <div className="space-y-2">
                <ListRow icon={Ship}    title="Vessels added"    value={2}  unit="vessels"    onClick={onVessels} />
                <ListRow icon={Package} title="Containers added" value={10} unit="containers" onClick={onContainers} />
              </div>
            </div>

            <div data-tour="trade">
              <SectionHead title="Cargo Management" subtitle="Delivery orders" action="REQUEST DDO" onAction={onRequestDDO} />
              <div className="space-y-2">
                <ListRow icon={FileCheck} title="Trade + · DDO"
                  subtitle="12 submitted · 3 pending · 5 nearing expiry"
                  value={12} unit="active" onClick={() => onDDORecord('all')} />
              </div>
            </div>

            <div data-tour="declaration">
              <SectionHead title="Cargo Clearance" subtitle="Customs status" action="TRACK" onAction={onCustomsTrack} />
              <div className="space-y-2">
                <ListRow icon={ClipboardList} title="Customs Declaration"
                  subtitle="12 submitted · 3 pending · 5 cleared"
                  value={12} unit="active" onClick={onCustomsTrack} />
              </div>
            </div>

            <div data-tour="gate">
              <SectionHead title="Gate Management" subtitle="Gate Pass · BOE" />
              <div className="space-y-2">
                <ListRow icon={MapPin} title="Gate Pass available"
                  subtitle="Active passes ready to use"
                  value={100} unit="passes" onClick={onGatePass} />
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav active="home" onTab={onTab} dataTour="nav" />
    </div>
  );
}

/* ---------- Dashboard hero (overall balance + quick pay actions) ---------- */
function BalanceHero({ onAdvanceDeposit, onPrepaidCard }: { onAdvanceDeposit: () => void; onPrepaidCard: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 text-white shadow-[0_22px_44px_-22px_rgba(14,27,61,0.6)]"
      style={{ background: 'linear-gradient(135deg, #0E47A6 0%, #1360D2 50%, #2950E5 100%)' }}>
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Available balance</div>
          <div className="text-[28px] font-bold leading-tight mt-1 flex items-center gap-1.5">
            <Dh /> 80,501.18
          </div>
          <div className="mt-0.5 text-[12px] text-white/75">Across Advance Deposit + Prepaid Card</div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
          <Wallet size={22} />
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2.5">
        <button onClick={onAdvanceDeposit}
          className="text-left bg-white/12 backdrop-blur hover:bg-white/20 transition rounded-2xl px-3.5 py-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">Advance Deposit</div>
            <ChevronRight size={14} className="text-white/70" />
          </div>
          <div className="mt-1 text-[15px] font-bold flex items-center gap-1"><Dh /> 77,001.18</div>
        </button>
        <button onClick={onPrepaidCard}
          className="text-left bg-white/12 backdrop-blur hover:bg-white/20 transition rounded-2xl px-3.5 py-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">Prepaid Card</div>
            <ChevronRight size={14} className="text-white/70" />
          </div>
          <div className="mt-1 text-[15px] font-bold flex items-center gap-1"><Dh /> 3,500.00</div>
        </button>
      </div>
    </div>
  );
}

/* ---------- Section heading with optional subtitle + action ---------- */
function SectionHead({ title, subtitle, action, onAction }:
  { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        <div className="text-[15px] font-bold text-[#0E1B3D] tracking-tight">{title}</div>
        {subtitle && <div className="text-[11.5px] text-[#6B7280] mt-0.5">{subtitle}</div>}
      </div>
      {action && (
        <button onClick={onAction}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF1FE] text-[#1360D2] text-[10.5px] font-bold uppercase tracking-wider">
          {action} <ChevronRight size={11} />
        </button>
      )}
    </div>
  );
}

/* ---------- Pay-queue card (counts) ---------- */
function PayQueueCard({ icon: Icon, count, unit, label, tone, hint, onClick }:
  { icon: any; count: number; unit: string; label: string; tone: 'amber'|'blue'; hint?: string; onClick?: () => void }) {
  const tones = {
    amber: { bg: '#FEF6E7', fg: '#B45309', dot: '#F59E0B' },
    blue:  { bg: '#EAF1FE', fg: '#0E47A6', dot: '#1360D2' },
  } as const;
  const t = tones[tone];
  return (
    <button onClick={onClick}
      className="relative bg-white rounded-2xl p-4 text-left w-full border border-[#EAF0FA] shadow-[0_8px_18px_-14px_rgba(14,27,61,0.18)] hover:border-[#B7CDF1] transition">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: t.bg, color: t.fg }}>
          <Icon size={20} />
        </div>
        <ChevronRight size={14} className="text-gray-300" />
      </div>
      <div className="mt-3 text-[24px] font-bold text-[#0E1B3D] leading-none">
        {count}<span className="ml-1 text-[12px] font-semibold text-[#6B7280]">{unit}</span>
      </div>
      <div className="text-[11.5px] text-[#4A5565] font-medium mt-1">{label}</div>
      {hint && (
        <div className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: t.fg }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.dot }} /> {hint}
        </div>
      )}
    </button>
  );
}

function PayQueueRow({ icon: Icon, count, unit, label, tone, hint, onClick }:
  { icon: any; count: number; unit: string; label: string; tone: 'amber'|'blue'; hint?: string; onClick?: () => void }) {
  const tones = {
    amber: { bg: '#FEF6E7', fg: '#B45309', dot: '#F59E0B' },
    blue:  { bg: '#EAF1FE', fg: '#0E47A6', dot: '#1360D2' },
  } as const;
  const t = tones[tone];
  return (
    <button onClick={onClick}
      className="w-full bg-white rounded-2xl p-3.5 border border-[#EAF0FA] shadow-sm flex items-center gap-3 text-left">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.bg, color: t.fg }}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-bold text-[#0E1B3D]">
          {count} <span className="text-[12px] font-semibold text-[#6B7280]">{unit}</span>
        </div>
        <div className="text-[11.5px] text-[#4A5565] font-medium truncate">{label}</div>
        {hint && (
          <div className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: t.fg }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.dot }} /> {hint}
          </div>
        )}
      </div>
      <ChevronRight size={16} className="text-gray-500" />
    </button>
  );
}

/* ---------- Status grid (4-cell stat board with colour-coded pills) ---------- */
function StatusGrid({ stats }: { stats: { n: number; l: string; tone: 'rose'|'indigo'|'amber'|'green'; onClick?: () => void }[] }) {
  const tones = {
    rose:   { bar: '#F5B5AA', dot: '#E5634B', bg: '#FEF1EE' },
    indigo: { bar: '#B7C5F4', dot: '#3F5BD9', bg: '#EEF2FE' },
    amber:  { bar: '#F2D89E', dot: '#D08C13', bg: '#FBF4E1' },
    green:  { bar: '#A6D7BB', dot: '#1F9F5F', bg: '#E8F7EE' },
  } as const;
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {stats.map((s, i) => {
        const t = tones[s.tone];
        const inner = (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: t.bar }} />
            <div className="font-bold text-[#0E1B3D] text-[20px] leading-none">{s.n}</div>
            <div className="mt-1.5 text-[9.5px] font-bold" style={{ color: t.dot }}>
              {s.l}
            </div>
          </>
        );
        return s.onClick ? (
          <button key={i} onClick={s.onClick} className="relative bg-white rounded-2xl py-3.5 px-2 shadow-[0_6px_14px_-12px_rgba(14,27,61,0.18)] border border-[#F1F5FB] text-center w-full">
            {inner}
          </button>
        ) : (
          <div key={i} className="relative bg-white rounded-2xl py-3.5 px-2 shadow-[0_6px_14px_-12px_rgba(14,27,61,0.18)] border border-[#F1F5FB] text-center">
            {inner}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Generic list row (icon + title + sub + count) ---------- */
function ListRow({ icon: Icon, title, subtitle, value, unit, onClick }:
  { icon: any; title: string; subtitle?: string; value?: number | string; unit?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full bg-white rounded-2xl p-3.5 border border-[#EAF0FA] shadow-sm flex items-center gap-3 text-left">
      <div className="w-11 h-11 rounded-xl bg-[#EAF1FE] text-[#1360D2] flex items-center justify-center shrink-0">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-bold text-[#0E1B3D] truncate">{title}</div>
        {subtitle && <div className="text-[11.5px] text-[#6B7280] mt-0.5 truncate">{subtitle}</div>}
      </div>
      {typeof value !== 'undefined' && (
        <div className="text-right shrink-0">
          <div className="text-[16px] font-bold text-[#0E1B3D] leading-none">{value}</div>
          {unit && <div className="text-[10px] font-semibold text-[#6B7280] mt-0.5 uppercase tracking-wider">{unit}</div>}
        </div>
      )}
      <ChevronRight size={16} className="text-gray-500" />
    </button>
  );
}

/* ---------- Cargo tile (icon + count + label) ---------- */
function CargoTile({ icon: Icon, n, l, sub, onClick }: any) {
  return (
    <button onClick={onClick}
      className="bg-white rounded-2xl py-4 px-2.5 border border-[#EAF0FA] shadow-[0_6px_14px_-12px_rgba(14,27,61,0.18)] flex flex-col items-center gap-1 w-full hover:border-[#B7CDF1] transition">
      <div className="w-10 h-10 rounded-xl bg-[#EAF1FE] flex items-center justify-center text-[#1360D2]">
        <Icon size={20} />
      </div>
      <div className="font-bold text-[#0E1B3D] text-[18px] leading-none mt-1.5">{n}</div>
      <div className="text-[10.5px] font-bold text-[#0E1B3D] text-center leading-tight">{l}</div>
      {sub && <div className="text-[9.5px] text-[#6B7280] font-medium uppercase tracking-wider">{sub}</div>}
    </button>
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
    <div className="relative overflow-hidden dt-safe-top px-6 pt-6 pb-6 text-white"
      style={{ background: 'linear-gradient(165deg, #0A1A3D 0%, #0E1B3D 55%, #14306E 100%)' }}>
      <div className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full opacity-25 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
      <div className="absolute bottom-[-60px] -left-16 w-[260px] h-[260px] rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: '#478CF7' }} />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-b from-[#0E47A6] via-[#1360D2] to-[#2950E5] flex items-center justify-center text-lg font-bold shadow-[0_8px_20px_-8px_rgba(19,96,210,0.7)]">
            A
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#14C9A9] border-2 border-[#0E1B3D] rounded-full" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Good morning</div>
            <div className="text-[16px] font-bold leading-tight">Ahmed</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button data-tour-anchor="settings" onClick={onOpenSettings}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20">
            <Plus size={17} />
          </button>
          <button data-tour-anchor="bell" onClick={onBell}
            className="relative w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/20">
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F9A83D] border border-[#0E1B3D] rounded-full" />
          </button>
        </div>
      </div>

      <div className="relative mt-4 flex items-end justify-between">
        <div>
          <div className="text-[22px] font-bold leading-tight">Dashboard</div>
          <div className="text-[12px] text-white/65 mt-0.5">Agent Code · 123456</div>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl p-0.5 flex shadow-sm">
          <button onClick={() => setView('grid')}
            className={`w-9 h-7 rounded-lg flex items-center justify-center transition ${view === 'grid' ? 'bg-white text-[#0E1B3D]' : 'text-white/70'}`}>
            <LayoutGrid size={14} />
          </button>
          <button onClick={() => setView('list')}
            className={`w-9 h-7 rounded-lg flex items-center justify-center transition ${view === 'list' ? 'bg-white text-[#0E1B3D]' : 'text-white/70'}`}>
            <List size={14} />
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

function PaymentCard({ icon: Icon, amount, label, count, unit, onClick }: any) {
  const isCount = typeof count === 'number';
  return (
    <button onClick={onClick} className="bg-white rounded-2xl px-3 py-3.5 shadow-sm flex items-center gap-2 text-left w-full">
      <Icon size={20} className="text-[#1360D2]" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[#27314B] text-[15px] truncate">
          {isCount
            ? <><span>{count}</span> <span className="text-[11px] font-semibold text-[#7F8A9F]">{unit}</span></>
            : <><Dh /> {amount}</>}
        </div>
        <div className="text-[10px] text-[#7F8A9F] font-medium truncate">{label}</div>
      </div>
      <ChevronRight size={14} className="text-gray-300" />
    </button>
  );
}

function PaymentRow({ icon: Icon, amount, label, count, unit, onClick }: any) {
  const isCount = typeof count === 'number';
  return (
    <button onClick={onClick} className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 w-full text-left">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1360D2]">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="font-bold text-[#27314B] text-[15px]">
          {isCount
            ? <><span>{count}</span> <span className="text-[12px] font-semibold text-[#7F8A9F]">{unit}</span></>
            : <><Dh /> {amount}</>}
        </div>
        <div className="text-[11px] text-[#7F8A9F] font-medium">{label}</div>
      </div>
      <ChevronRight size={16} className="text-gray-500" />
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
      <ChevronRight size={16} className="text-gray-500" />
    </button>
  );
}

/* ---------- 6. SERVICES ---------- */
function Services({ onTab, onOpenPayments, onOpenCargoMgmt, onAdvanceDeposit, onPrepaidCard, onImportFCL, onTluc, onVessels, onContainers, onRequestDDO, onCustomsTrack, onGatePass }:
  { onTab: (t: Screen) => void; onOpenPayments: () => void; onOpenCargoMgmt: () => void;
    onAdvanceDeposit: () => void; onPrepaidCard: () => void; onImportFCL: () => void; onTluc: () => void;
    onVessels: () => void; onContainers: () => void; onRequestDDO: () => void;
    onCustomsTrack: () => void; onGatePass: () => void }) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  type SvcGroup = { title: string; icon: any; count: number; services: { label: string; desc: string; icon: any; onClick?: () => void }[] };
  const groups: SvcGroup[] = [
    {
      title: 'Payments', icon: Wallet, count: 4,
      services: [
        { label: 'Advance Deposit',  desc: 'Top up & manage deposit balance', icon: Wallet,     onClick: onAdvanceDeposit },
        { label: 'Prepaid Card',     desc: 'Manage your prepaid card',         icon: CreditCard, onClick: onPrepaidCard },
        { label: 'Import FCL Bills', desc: 'View & pay FCL declarations',      icon: FileText,   onClick: onImportFCL },
        { label: 'TLUC Payments',    desc: 'Pay TLUC BRN charges',             icon: Ship,       onClick: onTluc },
      ],
    },
    {
      title: 'Carrier Management', icon: Truck, count: 2,
      services: [
        { label: 'Vessels',    desc: 'Track and pin your vessels',    icon: Ship,    onClick: onVessels },
        { label: 'Containers', desc: 'Track and pin your containers', icon: Package, onClick: onContainers },
      ],
    },
    {
      title: 'Cargo Management', icon: Boxes, count: 1,
      services: [
        { label: 'Trade+ · DDO', desc: 'Request & track delivery orders', icon: FileCheck, onClick: onRequestDDO },
      ],
    },
    {
      title: 'Cargo Clearance', icon: ClipboardList, count: 1,
      services: [
        { label: 'Customs Declaration', desc: 'Track customs clearance status', icon: ClipboardList, onClick: onCustomsTrack },
      ],
    },
    {
      title: 'Gate Management', icon: MapPin, count: 1,
      services: [
        { label: 'Gate Pass', desc: 'Manage & download gate passes', icon: MapPin, onClick: onGatePass },
      ],
    },
  ];

  const activeGroup = groups.find(g => g.title === selectedGroup) ?? null;

  const bgStyle = {
    background:
      'radial-gradient(circle at 18% 0%, rgba(199,216,244,0.55) 0%, transparent 50%),' +
      'radial-gradient(circle at 88% 14%, rgba(180,210,255,0.45) 0%, transparent 50%),' +
      'linear-gradient(180deg, #F4F7FE 0%, #FFFFFF 60%, #F4F7FE 100%)',
  };

  /* ---- SERVICE DETAIL VIEW ---- */
  if (activeGroup) {
    const GroupIcon = activeGroup.icon;
    return (
      <div className="min-h-full flex flex-col" style={bgStyle}>
        <div className="relative dt-safe-top px-5 pt-3 pb-5 text-white"
          style={{ background: 'linear-gradient(160deg, #0A1A3D 0%, #0E1B3D 50%, #14306E 100%)' }}>
          <div className="absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
          <div className="absolute -bottom-20 -left-10 w-[260px] h-[260px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#478CF7' }} />
          <div className="relative flex items-center gap-3">
            <button onClick={() => setSelectedGroup(null)}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-white/20">
              <ChevronLeft size={18} />
            </button>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">All Services</div>
              <div className="text-[18px] font-bold leading-tight">{activeGroup.title}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <GroupIcon size={17} />
            </div>
          </div>
        </div>

        <div className="px-5 pt-4">
          <div className="bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_18px_36px_-18px_rgba(14,27,61,0.28)] overflow-hidden">
            {activeGroup.services.map((svc, i) => {
              const SvcIcon = svc.icon;
              return (
                <button key={svc.label} onClick={svc.onClick}
                  className={`w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-[#F8FAFF] transition-colors ${i > 0 ? 'border-t border-[#EAF0FA]' : ''}`}>
                  <div className="w-11 h-11 rounded-xl bg-[#EAF1FE] flex items-center justify-center shrink-0">
                    <SvcIcon size={20} className="text-[#1360D2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#1E2939] text-[15px]">{svc.label}</div>
                    <div className="text-[#6A7282] text-[12px] mt-0.5">{svc.desc}</div>
                  </div>
                  <ChevronRight size={16} className="text-[#C7D5EA] shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        <BottomNav active="services" onTab={onTab} />
      </div>
    );
  }

  /* ---- GROUP GRID VIEW ---- */
  return (
    <div className="min-h-full flex flex-col" style={bgStyle}>

      {/* Hero header */}
      <div className="relative dt-safe-top px-5 pt-3 pb-20 text-white"
        style={{ background: 'linear-gradient(160deg, #0A1A3D 0%, #0E1B3D 50%, #14306E 100%)' }}>
        <div className="absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
        <div className="absolute -bottom-20 -left-10 w-[260px] h-[260px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#478CF7' }} />
        <div className="relative flex items-center gap-3">
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Dubai Trade</div>
            <div className="text-[18px] font-bold leading-tight">All Services</div>
          </div>
          <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-white/20">
            <Bell size={17} />
          </button>
        </div>
      </div>

      {/* Floating search */}
      <div className="px-5 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_18px_36px_-18px_rgba(14,27,61,0.28)] p-2 flex items-center">
          <Search size={16} className="ml-2 mr-1 text-[#99A1AF] shrink-0" />
          <span className="text-[13.5px] text-[#99A1AF] py-2.5 pl-1">Search services...</span>
        </div>
      </div>

      {/* Group cards grid */}
      <div className="px-5 pt-5 pb-24 grid grid-cols-2 gap-3">
        {groups.map(group => {
          const GroupIcon = group.icon;
          return (
            <button key={group.title} onClick={() => setSelectedGroup(group.title)}
              className="bg-white border border-[#EAF0FA] rounded-2xl py-6 px-3 flex flex-col items-center gap-3 shadow-[0_4px_12px_-6px_rgba(14,27,61,0.1)] hover:border-[#B7CDF1] hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF1FE] flex items-center justify-center text-[#1360D2]">
                <GroupIcon size={26} />
              </div>
              <div className="text-[13px] font-bold text-[#1E2939] text-center leading-tight">{group.title}</div>
              <div className="text-[11px] text-[#6A7282]">{group.count} service{group.count !== 1 ? 's' : ''}</div>
            </button>
          );
        })}
      </div>

      <BottomNav active="services" onTab={onTab} />
    </div>
  );
}

/* ---------- 7. PROFILE ---------- */
function Profile({ onTab, biometric, setBiometric, onSignOut, onResetPassword, onChangeCustomer, onNotificationsSettings, onRenewNow }:
  { onTab: (t: Screen) => void; biometric: boolean; setBiometric: (v: boolean) => void; onSignOut: () => void;
    onResetPassword: () => void; onChangeCustomer: () => void; onNotificationsSettings: () => void; onRenewNow: () => void }) {
  return (
    <div className="min-h-full flex flex-col" style={{ background: '#F0F4FA' }}>

      {/* Hero header */}
      <div className="relative dt-safe-top px-5 pt-3 pb-24 text-white"
        style={{ background: 'linear-gradient(160deg, #0A1A3D 0%, #0E1B3D 50%, #14306E 100%)' }}>
        <div className="absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
        <div className="absolute -bottom-20 -left-10 w-[260px] h-[260px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#478CF7' }} />
        <div className="relative flex items-center justify-between mb-1">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Dubai Trade</div>
            <div className="text-[18px] font-bold leading-tight">My Profile</div>
          </div>
          <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-white/20">
            <Bell size={17} />
          </button>
        </div>
      </div>

      {/* Floating avatar card */}
      <div className="px-5 -mt-16 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_18px_36px_-18px_rgba(14,27,61,0.28)] p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0E47A6] to-[#2950E5] flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[17px] font-bold text-[#0E1B3D]">Ahmed Rashid</div>
              <div className="text-[13px] text-[#6A7282] truncate">Ahmed.rashid@company.ae</div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 bg-[#EAF1FE] rounded-full px-2.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14C9A9]" />
                <span className="text-[11px] font-bold text-[#1360D2] uppercase tracking-wide">Active</span>
              </div>
            </div>
          </div>

          {/* Subscription bar */}
          <div className="mt-4 pt-4 border-t border-[#EAF0FA] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF1FE] flex items-center justify-center">
                <Award size={18} className="text-[#1360D2]" />
              </div>
              <div>
                <div className="text-[11px] text-[#6A7282] uppercase tracking-wide font-semibold">Annual Subscription</div>
                <div className="text-[13px] font-bold text-[#E07B3A]">Expiring in 25 days</div>
              </div>
            </div>
            <button onClick={onRenewNow}
              className="bg-[#0E1B3D] text-white text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg tracking-wide">
              Renew
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-4 pb-24 space-y-4">

        {/* Customer */}
        <div className="bg-white rounded-2xl border border-[#EAF0FA] shadow-[0_4px_12px_-6px_rgba(14,27,61,0.08)] p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#EAF1FE] flex items-center justify-center flex-shrink-0">
            <Building2 size={20} className="text-[#1360D2]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold tracking-wider text-[#99A1AF] uppercase">Customer</div>
            <div className="text-[#1E2939] font-bold text-[13px] truncate">M0042-CLEARING AGENT-MAERSK...</div>
          </div>
          <button onClick={onChangeCustomer}
            className="text-[#1360D2] font-bold text-[12px] bg-[#EAF1FE] px-3 py-1.5 rounded-lg flex-shrink-0">
            CHANGE
          </button>
        </div>

        {/* Quick actions */}
        <div>
          <div className="text-[12px] font-bold text-[#99A1AF] uppercase tracking-wider mb-2 px-1">Quick Actions</div>
          <div className="bg-white rounded-2xl border border-[#EAF0FA] shadow-[0_4px_12px_-6px_rgba(14,27,61,0.08)] overflow-hidden">
            <div className="px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF1FE] flex items-center justify-center">
                  <Fingerprint size={20} className="text-[#1360D2]" />
                </div>
                <div>
                  <div className="font-bold text-[14px] text-[#1E2939]">Biometric Login</div>
                  <div className="text-[12px] text-[#6A7282]">Use fingerprint to login</div>
                </div>
              </div>
              <Toggle on={biometric} onChange={setBiometric} />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div>
          <div className="text-[12px] font-bold text-[#99A1AF] uppercase tracking-wider mb-2 px-1">Settings</div>
          <div className="bg-white rounded-2xl border border-[#EAF0FA] shadow-[0_4px_12px_-6px_rgba(14,27,61,0.08)] overflow-hidden">
            {[
              { icon: Key, label: 'Reset Password', onClick: onResetPassword },
              { icon: Bell, label: 'Notifications', onClick: onNotificationsSettings },
              { icon: Shield, label: 'Privacy & Security' },
              { icon: Info, label: 'About Dubai Trade' },
            ].map((row, i, arr) => (
              <button key={row.label} onClick={row.onClick}
                className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#F8FAFF] transition-colors ${i < arr.length - 1 ? 'border-b border-[#EAF0FA]' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF1FE] flex items-center justify-center">
                    <row.icon size={18} className="text-[#1360D2]" />
                  </div>
                  <span className="font-bold text-[14px] text-[#1E2939]">{row.label}</span>
                </div>
                <ChevronRight size={16} className="text-[#C7D5EA]" />
              </button>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <button onClick={onSignOut}
          className="w-full bg-white border border-[#FECACA] text-[#DC2626] py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_12px_-6px_rgba(220,38,38,0.15)]">
          <LogOut size={18} /> Sign Out
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
    <div data-tour={dataTour} className="sticky -bottom-6 left-0 right-0 z-30 mt-auto bg-white border-t border-gray-200 shadow-[0_-6px_18px_-12px_rgba(14,27,61,0.18)] px-6 pt-3 pb-9 flex justify-between">
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
            <span className="inline-flex items-center gap-1 text-black">
              <svg width="14" height="17" viewBox="0 0 14 17" fill="currentColor" aria-hidden="true">
                <path d="M11.182 9.092c-.02-2.07 1.69-3.063 1.768-3.111-.965-1.41-2.464-1.603-2.998-1.625-1.276-.13-2.49.752-3.137.752-.66 0-1.66-.737-2.733-.715-1.404.021-2.701.816-3.42 2.072-1.46 2.527-.373 6.262 1.054 8.314.699 1.005 1.529 2.131 2.616 2.091 1.05-.043 1.447-.679 2.717-.679 1.27 0 1.626.679 2.733.654 1.13-.022 1.844-1.022 2.534-2.031.798-1.165 1.125-2.293 1.144-2.352-.025-.012-2.196-.844-2.218-3.37zM9.222 3.06C9.79 2.36 10.176 1.388 10.07.42c-.83.034-1.836.555-2.424 1.254-.527.617-.988 1.605-.864 2.553.928.071 1.873-.473 2.44-1.166z"/>
              </svg>
              <span className="font-bold text-lg" style={{ fontFamily: 'system-ui' }}>Pay</span>
            </span>
          </button>
          <div className="text-sm font-bold text-[#696F83] mt-3 mb-1">Other Method</div>
          <button onClick={() => setPaymentMethod('rosoom')}
            className={`w-full bg-white border rounded-lg py-3.5 flex items-center gap-3 px-3
              ${paymentMethod === 'rosoom' ? 'border-[#1360D2]' : 'border-gray-200'}`}>
            <div className="w-9 h-9 rounded-lg bg-[#EAF1FE] flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-[#1360D2]" />
            </div>
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
function PrepaidTopup({ onClose, cardNumber, balance, onDelete }:
  { onClose: () => void; cardNumber: string; balance: string; onDelete: () => void }) {
  const [amount, setAmount] = useState('1000');
  return (
    <BottomSheet title="Prepaid Card" onClose={onClose}>
      <div className="space-y-5">
        {/* Current card snapshot */}
        <div className="relative rounded-2xl text-white p-4 shadow-[0_18px_36px_-18px_rgba(14,27,61,0.4)] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0E47A6 0%, #1360D2 50%, #2950E5 100%)' }}>
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <CreditCard size={20} />
            <div className="text-[10px] uppercase tracking-wider font-bold text-white/75">Prepaid Card</div>
          </div>
          <div className="relative mt-3 text-[15px] tracking-[0.18em] font-mono">{cardNumber}</div>
          <div className="relative mt-3">
            <div className="text-[10px] uppercase tracking-wider text-white/70 font-bold">Available balance</div>
            <div className="text-[20px] font-bold mt-0.5 flex items-center gap-0.5">
              <Dh /> {balance}
            </div>
          </div>
        </div>

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
        <div className="pt-2 text-center">
          <button onClick={onDelete}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#EF4444] hover:text-[#B91C1C]">
            <Trash2 size={13} /> Delete this card
          </button>
        </div>
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
function AddPrepaidCard({ onClose, onAdded, paymentMethod, setPaymentMethod, advanceBalance }:
  { onClose: () => void;
    onAdded: (amount: string, cardNumber: string) => void;
    paymentMethod: 'applepay'|'rosoom'|'advance';
    setPaymentMethod: (m: 'applepay'|'rosoom'|'advance') => void;
    advanceBalance: string }) {
  const [amount, setAmount] = useState('1000');
  const [code, setCode] = useState('+971');
  const [mobile, setMobile] = useState('');
  const [confirmCode, setConfirmCode] = useState('+971');
  const [confirmMobile, setConfirmMobile] = useState('');

  const mobileMatches = mobile.length > 0 && mobile === confirmMobile;
  const canSubmit = !!amount && parseFloat(amount) > 0 && mobileMatches;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const cardNumber = '4231 ' +
      Math.floor(1000 + Math.random() * 9000) + ' ' +
      Math.floor(1000 + Math.random() * 9000) + ' ' +
      Math.floor(1000 + Math.random() * 9000);
    const formattedAmount = parseFloat(amount).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    onAdded(formattedAmount, cardNumber);
  };

  return (
    <BottomSheet title="Add Prepaid Card" onClose={onClose}>
      <div className="space-y-4">
        {/* Notice */}
        <div className="rounded-2xl p-4 border-[1.5px]"
          style={{ background: '#FEF6E3', borderColor: '#F5D58E' }}>
          <ul className="text-[12.5px] text-[#7A5A11] space-y-1.5 leading-relaxed list-disc pl-4">
            <li>Please ensure correct Mobile No. is provided.</li>
            <li>Your Pin Code will be sent via SMS to the Mobile No. provided below.</li>
          </ul>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-[12.5px] font-semibold text-[#4A5565] mb-1.5">
            Amount (AED)<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0E1B3D] font-bold text-sm"><Dh /></span>
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal" placeholder="0.00"
              className="w-full bg-white border border-[#E0EAFB] rounded-xl pl-11 pr-4 py-3.5 text-[15px] text-[#0E1B3D] outline-none focus:border-[#1360D2] focus:ring-4 focus:ring-[#1360D2]/15" />
          </div>
          <div className="text-[11px] text-gray-500 mt-1.5">Min: <span className="text-[#0E1B3D] font-semibold"><Dh /> 100.00</span> · Max: <span className="text-[#0E1B3D] font-semibold"><Dh /> 50,000.00</span></div>
        </div>

        {/* Mobile No. */}
        <div>
          <label className="block text-[12.5px] font-semibold text-[#4A5565] mb-1.5">
            Mobile No.<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex gap-2">
            <select value={code} onChange={(e) => setCode(e.target.value)}
              className="w-[90px] bg-white border border-[#E0EAFB] rounded-xl px-3 py-3.5 text-[14px] text-[#0E1B3D] outline-none focus:border-[#1360D2]">
              <option value="+971">+971</option>
              <option value="+91">+91</option>
              <option value="+44">+44</option>
              <option value="+1">+1</option>
            </select>
            <input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric" placeholder="50 123 4567"
              className="flex-1 bg-white border border-[#E0EAFB] rounded-xl px-4 py-3.5 text-[15px] text-[#0E1B3D] outline-none focus:border-[#1360D2] focus:ring-4 focus:ring-[#1360D2]/15" />
          </div>
        </div>

        {/* Confirm Mobile No. */}
        <div>
          <label className="block text-[12.5px] font-semibold text-[#4A5565] mb-1.5">
            Confirm Mobile No.<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex gap-2">
            <select value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)}
              className="w-[90px] bg-white border border-[#E0EAFB] rounded-xl px-3 py-3.5 text-[14px] text-[#0E1B3D] outline-none focus:border-[#1360D2]">
              <option value="+971">+971</option>
              <option value="+91">+91</option>
              <option value="+44">+44</option>
              <option value="+1">+1</option>
            </select>
            <input value={confirmMobile} onChange={(e) => setConfirmMobile(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric" placeholder="50 123 4567"
              className={`flex-1 bg-white border rounded-xl px-4 py-3.5 text-[15px] text-[#0E1B3D] outline-none focus:ring-4 transition
                ${confirmMobile && !mobileMatches
                  ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/15'
                  : 'border-[#E0EAFB] focus:border-[#1360D2] focus:ring-[#1360D2]/15'}`} />
          </div>
          {confirmMobile && !mobileMatches && (
            <div className="text-[11px] text-[#EF4444] font-medium mt-1">Mobile numbers don't match.</div>
          )}
        </div>

        {/* Mode of Payment */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-[13px] text-[#0E1B3D]">Mode of Payment</span>
            <span className="bg-gray-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Default</span>
          </div>
          <button onClick={() => setPaymentMethod('applepay')}
            className={`w-full bg-white border rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-sm transition
              ${paymentMethod === 'applepay' ? 'border-black' : 'border-gray-200'}`}>
            <span className="font-medium text-black">Pay with</span>
            <span className="inline-flex items-center gap-1 text-black">
              <svg width="14" height="17" viewBox="0 0 14 17" fill="currentColor" aria-hidden="true">
                <path d="M11.182 9.092c-.02-2.07 1.69-3.063 1.768-3.111-.965-1.41-2.464-1.603-2.998-1.625-1.276-.13-2.49.752-3.137.752-.66 0-1.66-.737-2.733-.715-1.404.021-2.701.816-3.42 2.072-1.46 2.527-.373 6.262 1.054 8.314.699 1.005 1.529 2.131 2.616 2.091 1.05-.043 1.447-.679 2.717-.679 1.27 0 1.626.679 2.733.654 1.13-.022 1.844-1.022 2.534-2.031.798-1.165 1.125-2.293 1.144-2.352-.025-.012-2.196-.844-2.218-3.37zM9.222 3.06C9.79 2.36 10.176 1.388 10.07.42c-.83.034-1.836.555-2.424 1.254-.527.617-.988 1.605-.864 2.553.928.071 1.873-.473 2.44-1.166z"/>
              </svg>
              <span className="font-bold text-lg" style={{ fontFamily: 'system-ui' }}>Pay</span>
            </span>
          </button>
          <div className="text-[11.5px] font-bold text-[#696F83] mt-3 mb-1.5 uppercase tracking-wider">Other Methods</div>
          <div className="space-y-2">
            <button onClick={() => setPaymentMethod('rosoom')}
              className={`w-full bg-white border rounded-xl py-3 flex items-center gap-3 px-3 transition
                ${paymentMethod === 'rosoom' ? 'border-[#1360D2]' : 'border-gray-200'}`}>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1FE] flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-[#1360D2]" />
              </div>
              <span className="font-medium text-[#1360D2] text-[14px]">Rosoom Payment Gateway</span>
            </button>
            <button onClick={() => setPaymentMethod('advance')}
              className={`w-full bg-white border rounded-xl py-3 flex items-center gap-3 px-3 transition
                ${paymentMethod === 'advance' ? 'border-[#1360D2]' : 'border-gray-200'}`}>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1FE] flex items-center justify-center shrink-0">
                <Wallet size={18} className="text-[#1360D2]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[#1360D2] text-[14px]">Pay from Advance Deposit</div>
                <div className="text-[11px] text-[#6B7280]">
                  Balance: <span className="font-bold text-[#0E1B3D]"><Dh /> {advanceBalance}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!canSubmit}
          className={`w-full py-4 rounded-2xl font-bold uppercase tracking-wide text-[14px] flex items-center justify-center gap-2 transition
            ${canSubmit ? 'dt-btn-primary text-white' : 'bg-[#E7EBF2] text-[#9CA3AF] cursor-not-allowed'}`}>
          Submit <ArrowRight size={16} />
        </button>
      </div>
    </BottomSheet>
  );
}

/* ---------- DDO SEARCH BOTTOM SHEET (initial) ---------- */
function DDOSearchFlyout({ onClose, onSearch }: { onClose: () => void; onSearch: () => void }) {
  return (
    <div className="absolute inset-0 bg-[#0E1B3D]/60 flex items-end z-50" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <div className="text-[#1E2939] font-bold text-lg">Request DDO</div>
            <div className="text-[#6A7282] text-xs mt-0.5">Search by shipping agent or B/L number</div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 pb-8">
          <div>
            <label className="block text-xs font-bold text-[#364153] uppercase tracking-wide mb-2">Shipping Agent</label>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Msk T180 s12345"
                className="w-full bg-[#F8FAFF] border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-[#1360D2] text-[#1E2939] transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#364153] uppercase tracking-wide mb-2">B/L Number</label>
            <input placeholder="BOL324565477"
              className="w-full bg-[#F8FAFF] border border-gray-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#1360D2] text-[#1E2939] transition-colors" />
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-sm text-[#4A5565]">2 requests available</span>
          </div>
          <button onClick={onSearch}
            className="w-full dt-btn-primary text-white py-4 rounded-2xl font-bold text-[15px] uppercase">
            Search & Request
          </button>
        </div>
      </div>
    </div>
  );
}

function DDOSearchScreen({ onBack, onSearch }: { onBack: () => void; onSearch: () => void }) {
  return (
    <div className="bg-[#F2F5FB] min-h-full">
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white">
          <div className="font-bold text-xl">Request DDO</div>
        </div>
      </div>
      <BottomSheet title="Search B/L" onClose={onBack}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#364153] mb-2">Shipping Agent</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
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
const DDO_DATES = [
  { day: 'Mon', date: '11' }, { day: 'Tue', date: '12' }, { day: 'Wed', date: '13' },
  { day: 'Thu', date: '14' }, { day: 'Fri', date: '15' }, { day: 'Sat', date: '16' }, { day: 'Sun', date: '17' },
];
const DDO_SLOTS = ['8 - 9 AM', '9 - 10 AM', '10 - 11 AM', '11 - 12 AM', '12 - 1 PM', '2 - 3 PM', '3 - 4 PM'];

const BL_TYPE = 'EBL'; // change to 'OBL' to show the appointment section

function RequestDDO({ onBack, onBLParty, onDDOParty, onDocs, onBLDetails, onRequestingParty, onPay }:
  { onBack: () => void; onBLParty: () => void; onDDOParty: () => void; onDocs: () => void;
    onBLDetails: () => void; onRequestingParty: () => void; onPay: () => void }) {
  const [selectedDate, setSelectedDate] = useState('12');
  const [selectedSlot, setSelectedSlot] = useState('10 - 11 AM');

  return (
    <div className="bg-[#F2F5FB] flex flex-col" style={{ height: '100%' }}>
      {/* Header */}
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow-lg shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-xl leading-tight">Request DDO</div>
          <div className="text-white/60 text-xs">BOL324565477</div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 pb-6">

          {/* BOL card — compact */}
          <div className="rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm" style={{ background: 'linear-gradient(135deg,#EFF6FF 0%,#E8F0FE 100%)', border: '1px solid #DBEAFE' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#2B7FFF 0%,#155DFC 100%)' }}>
              <FileText size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#1E2939] font-bold text-lg truncate">BOL324565477</div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 text-[#6A7282] text-xs"><FileText size={11} /> EBL</span>
                <span className="flex items-center gap-1 text-[#6A7282] text-xs"><Ship size={11} /> YM SUCCESS</span>
                <span className="flex items-center gap-1 text-[#6A7282] text-xs"><Package size={11} /> 0</span>
              </div>
            </div>
            <button onClick={onBLDetails} className="shrink-0 border border-[#1360D2] rounded-full px-2.5 py-1 text-[#1360D2] text-xs font-medium whitespace-nowrap">
              Details →
            </button>
          </div>

          {/* DDO Validity */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-[#1360D2]" />
                </div>
                <div>
                  <div className="text-[#4A5565] text-[11px] uppercase tracking-wide">DDO Validity</div>
                  <div className="text-[#1E2939] font-bold text-base">15-12-2023</div>
                </div>
              </div>
              <button className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#1360D2]">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Party Information */}
          <div>
            <div className="font-bold text-[17px] text-[#1E2939] mb-3">Party Information</div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
              {/* Requesting Party — tappable */}
              <button onClick={onRequestingParty} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <User size={20} className="text-[#1360D2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#4A5565] text-[11px] uppercase tracking-wide">Requesting Party</div>
                  <div className="text-[#1E2939] font-bold text-[15px] truncate">MAERSK KANOO LLC UNITED DUBAI</div>
                </div>
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check size={13} className="text-green-600" strokeWidth={3} />
                </div>
              </button>
              {/* B/L Party */}
              <button onClick={onBLParty} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#E0F2FE' }}>
                  <FileText size={20} style={{ color: '#0369A1' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#4A5565] text-[11px] uppercase tracking-wide">B/L Party</div>
                  <div className="font-bold text-[15px]" style={{ color: '#0369A1' }}>Tap to add details</div>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </button>
              {/* DDO Party */}
              <button onClick={onDDOParty} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#DBEAFE' }}>
                  <Truck size={20} style={{ color: '#1E40AF' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#4A5565] text-[11px] uppercase tracking-wide">DDO Party</div>
                  <div className="font-bold text-[15px]" style={{ color: '#1E40AF' }}>Tap to add details</div>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </button>
              {/* Documents */}
              <button onClick={onDocs} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#CFFAFE' }}>
                  <FileCheck size={20} style={{ color: '#0891B2' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#4A5565] text-[11px] uppercase tracking-wide">Documents</div>
                  <div className="font-bold text-[15px]" style={{ color: '#0891B2' }}>Tap to upload</div>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </button>
            </div>
          </div>

          {/* OBL Drop-Off Appointment — only if B/L type is OBL */}
          {BL_TYPE === 'OBL' && (
            <div>
              <div className="font-bold text-[17px] text-[#1E2939] mb-3">OBL Drop-Off Appointment</div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[15px] text-[#1E2939]">November 2023</span>
                    <div className="flex gap-1">
                      <button className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[#1360D2]"><ChevronLeft size={14} /></button>
                      <button className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[#1360D2]"><ChevronRight size={14} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {DDO_DATES.map(d => {
                      const active = d.date === selectedDate;
                      return (
                        <button key={d.date} onClick={() => setSelectedDate(d.date)}
                          className={`flex flex-col items-center py-2 rounded-xl transition-all ${active ? 'shadow-md' : 'hover:bg-gray-50'}`}
                          style={active ? { background: 'linear-gradient(160deg,#1E6FFF 0%,#155DFC 100%)' } : {}}>
                          <span className={`text-[10px] font-medium mb-1 ${active ? 'text-white/70' : 'text-gray-500'}`}>{d.day}</span>
                          <span className={`font-bold text-base ${active ? 'text-white' : 'text-[#1E2939]'}`}>{d.date}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t border-gray-50 px-4 py-4">
                  <div className="text-[#6A7282] text-xs font-medium uppercase tracking-wide mb-3">Available Slots</div>
                  <div className="grid grid-cols-2 gap-2">
                    {DDO_SLOTS.map(slot => {
                      const active = slot === selectedSlot;
                      return (
                        <button key={slot} onClick={() => setSelectedSlot(slot)}
                          className={`flex items-center gap-2 rounded-xl py-3 px-4 text-sm font-bold border-2 transition-all ${
                            active ? 'border-transparent text-white shadow-md' : 'border-gray-100 text-[#364153] bg-white'
                          }`}
                          style={active ? { background: 'linear-gradient(90deg,#1E6FFF 0%,#155DFC 100%)' } : {}}>
                          <Clock size={14} className={active ? 'text-white/70' : 'text-gray-500'} />
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoices */}
          <div>
            <div className="flex items-center mb-1">
              <div className="font-bold text-[17px] text-[#1E2939]">Invoices</div>
              <span className="ml-auto bg-blue-50 text-[#1360D2] font-bold text-xs rounded-full px-2.5 py-0.5">2 pending</span>
            </div>
            <div className="text-xs text-gray-500 mb-3">Credit/Debit Card Online Payments Only, Once User Enter The Request Form</div>
            <div className="space-y-2">
              {[{n:'INVSIT10899',a:'100.00',d:'10-11-2023'},{n:'INVSIT10901',a:'200.00',d:'10-11-2023'}].map(i => (
                <div key={i.n} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-[#1360D2]">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#1E2939] text-[14px]">{i.n}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-gray-500 text-xs">{i.d}</span>
                      <span className="bg-orange-50 text-orange-500 font-bold text-[10px] rounded-full px-2 py-0.5">Pending</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-[#1360D2] text-[14px]"><DhAmount value={i.a} /></span>
                    <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <Download size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Breakup */}
          <div>
            <div className="font-bold text-[17px] text-[#1E2939] mb-3">Payment Breakup</div>
            <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'linear-gradient(155deg,#EFF6FF 0%,#EEF2FF 100%)', border: '1px solid #DBEAFE' }}>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[#6A7282]">Invoice Amount</span>
                <span className="font-bold text-[#1E2939]"><DhAmount value="300.00" /></span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-t border-blue-100">
                <span className="text-[#6A7282]">Service Charge</span>
                <span className="font-bold text-[#1E2939]"><DhAmount value="1.67" /></span>
              </div>
              <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-blue-200">
                <span className="font-bold text-[17px] text-[#1E2939]">Total Amount</span>
                <span className="font-bold text-[26px] text-[#1360D2]"><DhAmount value="301.67" /></span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <div className="font-bold text-[17px] text-[#1E2939] mb-3">Remarks</div>
            <textarea placeholder="Add any notes or remarks for this request…"
              className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-[#1E2939] text-[15px] outline-none focus:border-[#1360D2] resize-none h-[100px] shadow-sm transition-colors placeholder:text-gray-300" />
          </div>
        </div>
      </div>

      {/* PAY footer — always visible at bottom */}
      <div className="shrink-0 px-4 pb-6 pt-3 bg-[#F2F5FB] border-t border-gray-100">
        <button onClick={onPay}
          className="w-full dt-btn-primary text-white rounded-2xl py-4 text-[15px] uppercase font-bold">
          Proceed to Pay · <DhAmount value="301.67" />
        </button>
      </div>
    </div>
  );
}

/* ---------- B/L DETAILS SCREEN ---------- */
const BL_ROWS = [
  { label: 'B/L Number',         value: 'RIP|1008|' },
  { label: 'Vessel Name',        value: 'YM SUCCESS' },
  { label: 'B/L Type',          value: 'EBL' },
  { label: 'Vessel ETA',        value: '17/04/2023' },
  { label: 'Requested Date',    value: '01-12-2023 11:17 AM' },
  { label: 'Voyager Number',    value: '1001' },
  { label: 'Importer Code',     value: '' },
  { label: 'Shipping Agent Code', value: 'A180' },
  { label: 'Shipping Agent Name', value: 'MAERSK KANOO UAE LLC' },
  { label: 'Container Count',   value: '0' },
  { label: 'Consignee Name',    value: 'MSK' },
  { label: 'Vessel ATA',        value: 'A180' },
  { label: 'Rotation Number',   value: '869088' },
];

function BLDetailsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-[#F2F5FB] flex flex-col" style={{ height: '100%' }}>
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
          <ChevronLeft size={20} />
        </button>
        <div>
          <div className="text-white font-bold text-xl">B/L Details</div>
          <div className="text-white/70 text-xs">Bill of Lading Information</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {BL_ROWS.map((row, i) => (
            <div key={row.label} className={`flex items-center justify-between px-6 py-4 ${i % 2 === 0 ? 'bg-[#F1F6FC]' : 'bg-white'}`}>
              <span className="text-[#0E1B3D] font-medium text-[16px]">{row.label}</span>
              <span className="text-[#656B81] text-[16px] text-right max-w-[55%]">{row.value || '—'}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-6">
          <button onClick={onBack}
            className="w-full dt-btn-secondary font-bold text-[15px] py-3.5 rounded-2xl uppercase">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- REQUESTING PARTY SCREEN (read-only) ---------- */
function RequestingPartyScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const fields = [
    { label: 'Party Name',            value: 'MAERSK KANOO LLC UNITED DUBAI', icon: Building2 },
    { label: 'Representative Person', value: 'AMAR PARDEEP',                  icon: User },
    { label: 'Email',                 value: 'amar.pardeep@dubaitrade.aet',   icon: Mail },
    { label: 'Phone Number',          value: '35 45 345355',                  icon: Phone },
  ];
  return (
    <div className="bg-[#F2F5FB] flex flex-col" style={{ height: '100%' }}>
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow shrink-0">
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
          <ChevronLeft size={20} />
        </button>
        <div>
          <div className="text-white font-bold text-xl">Requesting Party</div>
          <div className="text-white/70 text-xs">Party Information</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
          {fields.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-[#1360D2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#6A7282] text-[11px] uppercase tracking-wide">{label}</div>
                <div className="text-[#1E2939] font-semibold text-[15px] mt-0.5">{value}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onContinue}
          className="w-full mt-5 dt-btn-primary text-white font-bold text-[15px] py-3.5 rounded-2xl shadow uppercase">
          Continue to B/L Party →
        </button>
        <button onClick={onBack}
          className="w-full mt-3 dt-btn-secondary font-bold text-[15px] py-3.5 rounded-2xl uppercase">
          Back
        </button>
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
          <div className="text-sm text-gray-500">{sub}</div>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-500" />
    </button>
  );
}

/* ---------- B/L PARTY ---------- */
function BLParty({ onBack, onSave, chainMode }: { onBack: () => void; onSave: () => void; chainMode?: boolean }) {
  return (
    <PartyForm title="B/L Party" subtitle="Bill of Lading Party Information"
      nameLabel="B/L Party Name" onBack={onBack} onSave={onSave} chainMode={chainMode}
      nextLabel="Continue to DDO Party →">
      <ToggleCheckbox color="blue" label="Same As Requesting Party" />
    </PartyForm>
  );
}

/* ---------- DDO PARTY ---------- */
function DDOParty({ onBack, onSave, chainMode }: { onBack: () => void; onSave: () => void; chainMode?: boolean }) {
  return (
    <PartyForm title="DDO Party" subtitle="Delivery Order Party Information"
      nameLabel="DDO Party Name" onBack={onBack} onSave={onSave} chainMode={chainMode}
      nextLabel="Continue to Documents →">
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

function PartyForm({ title, subtitle, nameLabel, onBack, onSave, chainMode, nextLabel, children }: any) {
  return (
    <div className="bg-[#F2F5FB] min-h-full">
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white">
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
          <button onClick={onSave}
            className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold uppercase">
            {chainMode ? (nextLabel ?? 'Save & Continue →') : 'Save and return'}
          </button>
          <button onClick={onBack}
            className="w-full dt-btn-secondary py-3.5 rounded-2xl font-bold uppercase">
            {chainMode ? 'Back' : 'Cancel'}
          </button>
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
        <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input placeholder={placeholder}
          className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none shadow-sm" />
      </div>
    </div>
  );
}

/* ---------- DOCUMENTS ---------- */
function DDODocuments({ onBack, onSave, chainMode }: { onBack: () => void; onSave?: () => void; chainMode?: boolean }) {
  const docs = [
    { label: 'Authorization Letter', required: true },
    { label: 'B/L Copy' },
    { label: 'Emirates ID' },
    { label: 'Other Documents' },
  ];
  return (
    <div className="bg-[#F2F5FB] min-h-full">
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white">
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
                <div className="text-xs text-gray-500">Tap to upload file</div>
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
          <button onClick={onSave ?? onBack}
            className="w-full dt-btn-primary text-white py-3.5 rounded-2xl font-bold uppercase">
            {chainMode ? 'Save & Return to DDO →' : 'Save and return'}
          </button>
          <button onClick={onBack}
            className="w-full dt-btn-secondary py-3.5 rounded-2xl font-bold uppercase">
            {chainMode ? 'Back' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- DDO PAYMENT SCREEN ---------- */
type DdoPayMethod = 'applepay' | 'rosoom' | 'advance' | 'prepaid';

const APPLE_PAY_LOGO = (
  <svg width="14" height="17" viewBox="0 0 14 17" fill="currentColor" aria-hidden="true">
    <path d="M11.182 9.092c-.02-2.07 1.69-3.063 1.768-3.111-.965-1.41-2.464-1.603-2.998-1.625-1.276-.13-2.49.752-3.137.752-.66 0-1.66-.737-2.733-.715-1.404.021-2.701.816-3.42 2.072-1.46 2.527-.373 6.262 1.054 8.314.699 1.005 1.529 2.131 2.616 2.091 1.05-.043 1.447-.679 2.717-.679 1.27 0 1.626.679 2.733.654 1.13-.022 1.844-1.022 2.534-2.031.798-1.165 1.125-2.293 1.144-2.352-.025-.012-2.196-.844-2.218-3.37zM9.222 3.06C9.79 2.36 10.176 1.388 10.07.42c-.83.034-1.836.555-2.424 1.254-.527.617-.988 1.605-.864 2.553.928.071 1.873-.473 2.44-1.166z"/>
  </svg>
);

function DDOPaymentScreen({ onBack, onConfirm }: { onBack: () => void; onConfirm: () => void }) {
  const [selected, setSelected] = useState<DdoPayMethod>('applepay');

  const sel = (id: DdoPayMethod) =>
    `w-full bg-white border rounded-xl transition-all shadow-sm ${selected === id ? 'border-[#1360D2] shadow-[0_4px_12px_rgba(19,96,210,0.12)]' : 'border-gray-200'}`;

  return (
    <div className="bg-[#F2F5FB] flex flex-col" style={{ height: '100%' }}>
      {/* Header */}
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow-lg shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white">
          <ChevronLeft size={20} />
        </button>
        <div>
          <div className="text-white font-bold text-xl">Payment</div>
          <div className="text-white/60 text-xs">Select payment method</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 pb-6">

          {/* Amount summary */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'linear-gradient(155deg,#EFF6FF 0%,#EEF2FF 100%)', border: '1px solid #DBEAFE' }}>
            <div className="text-[#4A5565] text-sm font-medium mb-1">Total Amount Due</div>
            <div className="text-[#1360D2] font-bold text-[32px]"><DhAmount value="301.67" /></div>
            <div className="mt-3 pt-3 border-t border-blue-100 space-y-1.5">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#6A7282]">Invoice Amount</span>
                <span className="font-bold text-[#1E2939]"><DhAmount value="300.00" /></span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#6A7282]">Service Charge</span>
                <span className="font-bold text-[#1E2939]"><DhAmount value="1.67" /></span>
              </div>
            </div>
          </div>

          {/* Mode of Payment */}
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[13px] text-[#0E1B3D]">Mode of Payment</span>
              <span className="bg-gray-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Default</span>
            </div>

            {/* Apple Pay */}
            <button onClick={() => setSelected('applepay')}
              className={`${sel('applepay')} py-4 flex items-center justify-center gap-2`}>
              <span className="font-medium text-black">Pay with</span>
              <span className="inline-flex items-center gap-1 text-black">
                {APPLE_PAY_LOGO}
                <span className="font-bold text-lg" style={{ fontFamily: 'system-ui' }}>Pay</span>
              </span>
            </button>

            <div className="text-[11px] font-bold text-[#696F83] uppercase tracking-wider">Other Methods</div>

            {/* Rosoom */}
            <button onClick={() => setSelected('rosoom')}
              className={`${sel('rosoom')} py-3 px-4 flex items-center gap-3`}>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1FE] flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-[#1360D2]" />
              </div>
              <span className="font-medium text-[#1360D2] text-[14px]">Rosoom Payment Gateway</span>
            </button>

            {/* Advance Deposit */}
            <button onClick={() => setSelected('advance')}
              className={`${sel('advance')} py-3 px-4 flex items-center gap-3`}>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1FE] flex items-center justify-center shrink-0">
                <Wallet size={18} className="text-[#1360D2]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[#1360D2] text-[14px]">Pay from Advance Deposit</div>
                <div className="text-[11px] text-[#6B7280]">Balance: <span className="font-bold text-[#0E1B3D]"><Dh /> 77,001.18</span></div>
              </div>
            </button>

            {/* Prepaid Card */}
            <button onClick={() => setSelected('prepaid')}
              className={`${sel('prepaid')} py-3 px-4 flex items-center gap-3`}>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1FE] flex items-center justify-center shrink-0">
                <CreditCard size={18} className="text-[#1360D2]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[#1360D2] text-[14px]">Prepaid Card</div>
                <div className="text-[11px] text-[#6B7280]">Balance: <span className="font-bold text-[#0E1B3D]"><Dh /> 3,500.00</span></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 pb-6 pt-3 bg-[#F2F5FB] border-t border-gray-100">
        <button onClick={onConfirm}
          className="w-full dt-btn-primary text-white rounded-2xl py-4 text-[15px] uppercase font-bold">
          Confirm Payment · <DhAmount value="301.67" />
        </button>
      </div>
    </div>
  );
}

/* ---------- DDO SUCCESS SCREEN ---------- */
function DDOSuccessScreen({ onDone }: { onDone: () => void }) {
  const ref = `REF-${Date.now().toString().slice(-8)}`;
  return (
    <div className="bg-[#F2F5FB] flex flex-col items-center justify-center px-6" style={{ height: '100%' }}>
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-6">

        {/* Success ring */}
        <div className="size-28 rounded-full bg-[#D1FAE5] flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.25)]">
          <div className="size-20 rounded-full bg-[#A7F3D0] flex items-center justify-center">
            <Check size={40} className="text-[#059669]" strokeWidth={2.5} />
          </div>
        </div>

        <div>
          <div className="text-[#1E2939] font-bold text-[26px] mb-2">DDO Request Submitted!</div>
          <div className="text-[#6A7282] text-[15px] leading-relaxed">
            Your Delivery Order for{' '}
            <span className="text-[#1360D2] font-bold">BOL324565477</span>{' '}
            has been submitted successfully.
          </div>
        </div>

        {/* Reference card */}
        <div className="rounded-2xl p-5 w-full text-left shadow-sm" style={{ background: 'linear-gradient(135deg,#EFF6FF 0%,#EEF2FF 100%)', border: '1px solid #DBEAFE' }}>
          <div className="text-[#6A7282] text-[12px] mb-0.5">Reference Number</div>
          <div className="text-[#1360D2] font-bold text-[22px]">{ref}</div>
          <div className="mt-3 pt-3 border-t border-blue-100">
            <div className="text-[#6A7282] text-[12px] mb-0.5">B/L Number</div>
            <div className="text-[#1E2939] font-bold text-[16px]">BOL324565477</div>
          </div>
        </div>

        <div className="text-[#6A7282] text-[13px] leading-relaxed">
          You will receive a confirmation email with your DDO details shortly. Track your request status in the DDO records.
        </div>

        <button onClick={onDone} className="w-full dt-btn-primary text-white rounded-2xl py-4 text-[15px] uppercase font-bold">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

/* ---------- DDO RECORDS SCREEN ---------- */
const DDO_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  'all':              { label: 'All Records',          color: '#1360D2', bg: '#eff6ff' },
  'nearing-expiry':   { label: 'Nearing Expiry',       color: '#d67e74', bg: '#fff5f5' },
  'submitted':        { label: 'Submitted',            color: '#6a7bc7', bg: '#eef2ff' },
  'pending':          { label: 'Pending',              color: '#d3ab40', bg: '#fffbeb' },
  'pending-counter':  { label: 'Pending w/ Counter',   color: '#e07d30', bg: '#fff7ed' },
  'completed':        { label: 'Completed',            color: '#5cb78f', bg: '#f0fdf4' },
  'rejected':         { label: 'Rejected',             color: '#dc2626', bg: '#fef2f2' },
  'cancelled':        { label: 'Cancelled',            color: '#6B7280', bg: '#F9FAFB' },
};

const DDO_ALL_RECORDS = [
  { bolNumber: 'BOL324565477', referenceNumber: 'REF-12345678', status: 'nearing-expiry', doValidityDate: '15-12-2023' },
  { bolNumber: 'BOL987654321', referenceNumber: 'REF-87654321', status: 'nearing-expiry', doValidityDate: '18-12-2023' },
  { bolNumber: 'BOL556677889', referenceNumber: 'REF-55667788', status: 'submitted',      doValidityDate: '22-12-2023' },
  { bolNumber: 'BOL667788990', referenceNumber: 'REF-66778899', status: 'submitted',      doValidityDate: '23-12-2023' },
  { bolNumber: 'BOL223344556', referenceNumber: 'REF-22334455', status: 'pending',        doValidityDate: '05-01-2024' },
  { bolNumber: 'BOL334455667', referenceNumber: 'REF-33445566', status: 'pending',        doValidityDate: '06-01-2024' },
  { bolNumber: 'BOL445566778', referenceNumber: 'REF-44556677', status: 'pending-counter',doValidityDate: '07-01-2024' },
  { bolNumber: 'BOL112233111', referenceNumber: 'REF-11223311', status: 'pending-counter',doValidityDate: '08-01-2024' },
  { bolNumber: 'BOL556677001', referenceNumber: 'REF-55667700', status: 'completed',      doValidityDate: '10-01-2024' },
  { bolNumber: 'BOL667788112', referenceNumber: 'REF-66778811', status: 'completed',      doValidityDate: '11-01-2024' },
  { bolNumber: 'BOL778899223', referenceNumber: 'REF-77889922', status: 'rejected',       doValidityDate: '12-01-2024' },
  { bolNumber: 'BOL889900334', referenceNumber: 'REF-88990033', status: 'cancelled',      doValidityDate: '13-01-2024' },
];

function DDORecordsScreen({ status, onBack }: { status: string; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState(status);
  const [search, setSearch] = useState('');
  const [searchMode, setSearchMode] = useState<'bol'|'ref'>('bol');
  const tabs = Object.keys(DDO_STATUS_CFG);

  const ranges = [
    { k: '7d',     label: 'Last 7 days' },
    { k: '30d',    label: 'Last 30 days' },
    { k: '90d',    label: 'Last 90 days' },
    { k: 'custom', label: 'Custom range' },
  ] as const;
  type RangeKey = typeof ranges[number]['k'];
  const [range, setRange] = useState<RangeKey>('7d');
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [showCustomSheet, setShowCustomSheet] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const fmtD = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(d)} ${months[parseInt(m)-1]}`;
  };
  const currentLabel = range === 'custom' && customLabel ? customLabel : (ranges.find(r => r.k === range)?.label ?? '');

  const baseRecords = activeTab === 'all' ? DDO_ALL_RECORDS : DDO_ALL_RECORDS.filter(r => r.status === activeTab);
  const records = baseRecords.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return searchMode === 'bol'
      ? r.bolNumber.toLowerCase().includes(q)
      : r.referenceNumber.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-full flex flex-col" style={{ background: 'radial-gradient(circle at 18% 0%, rgba(199,216,244,0.55) 0%, transparent 50%), radial-gradient(circle at 88% 14%, rgba(180,210,255,0.45) 0%, transparent 50%), linear-gradient(180deg, #F4F7FE 0%, #FFFFFF 60%, #F4F7FE 100%)' }}>
      {/* Dark blue header */}
      <div className="relative dt-safe-top px-5 pt-3 pb-20 text-white"
        style={{ background: 'linear-gradient(160deg, #0A1A3D 0%, #0E1B3D 50%, #14306E 100%)' }}>
        <div className="absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
        <div className="absolute -bottom-20 -left-10 w-[260px] h-[260px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#478CF7' }} />
        <div className="relative flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-white/20">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Records</div>
            <div className="text-[18px] font-bold leading-tight">DDO Records</div>
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-2">
          <button onClick={() => { setSearchMode('bol'); setSearch(''); }}
            className={`flex-1 h-8 rounded-full text-[12px] font-bold border transition-all ${searchMode === 'bol' ? 'bg-white text-[#1360D2] border-white' : 'bg-white/15 text-white/80 border-white/25'}`}>
            BOL Number
          </button>
          <button onClick={() => { setSearchMode('ref'); setSearch(''); }}
            className={`flex-1 h-8 rounded-full text-[12px] font-bold border transition-all ${searchMode === 'ref' ? 'bg-white text-[#1360D2] border-white' : 'bg-white/15 text-white/80 border-white/25'}`}>
            Reference No.
          </button>
          <div className="flex-1 relative flex justify-end">
            <button onClick={() => setShowRangePicker(s => !s)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white/15 border border-white/25 text-[11px] font-bold text-white whitespace-nowrap">
              <Calendar size={11} />
              {currentLabel}
              <ChevronRight size={11} className={`transition-transform ${showRangePicker ? '-rotate-90' : 'rotate-90'}`} />
            </button>
            {showRangePicker && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[200px] bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_22px_44px_-12px_rgba(14,27,61,0.3)] overflow-hidden">
                {ranges.map(r => {
                  const active = r.k === range;
                  return (
                    <button key={r.k}
                      onClick={() => {
                        if (r.k === 'custom') { setShowRangePicker(false); setShowCustomSheet(true); }
                        else { setRange(r.k); setShowRangePicker(false); }
                      }}
                      className={`w-full text-left px-4 py-3 text-[13px] font-semibold flex items-center justify-between ${active ? 'bg-[#EAF1FE] text-[#1360D2]' : 'text-[#0E1B3D] hover:bg-[#F4F7FE]'}`}>
                      {r.label}
                      {active && <Check size={14} strokeWidth={3} className="text-[#1360D2]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating search bar */}
      <div className="px-5 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_18px_36px_-18px_rgba(14,27,61,0.28)] p-2 flex items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99A1AF]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={searchMode === 'bol' ? 'Search by BOL number' : 'Search by reference number'}
              className="w-full bg-transparent pl-9 pr-3 py-2.5 text-[13.5px] text-[#0E1B3D] placeholder:text-[#99A1AF] outline-none" />
          </div>
          {search && (
            <button onClick={() => setSearch('')}
              className="w-7 h-7 rounded-full bg-[#F4F7FE] flex items-center justify-center text-[#6B7280] mr-1">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Status chips */}
      <div className="px-5 pt-3 flex items-center gap-1.5 overflow-x-auto">
        {tabs.map(tab => {
          const c = DDO_STATUS_CFG[tab];
          const active = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`shrink-0 h-8 px-3.5 rounded-full text-[11.5px] font-bold whitespace-nowrap transition border ${active ? 'border-transparent' : 'border-[#E0EAFB] bg-white text-[#0E1B3D]'}`}
              style={active ? { backgroundColor: c.bg, color: c.color, borderColor: c.color + '40' } : {}}>
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-10 flex-1 space-y-3">
        {records.length === 0 ? (
          <div className="text-center py-16">
            <div className="size-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-[#99a1af]" />
            </div>
            <p className="text-[#6a7282] font-medium text-[16px]">No records found</p>
          </div>
        ) : records.map((record, idx) => {
          const rc = DDO_STATUS_CFG[record.status] ?? DDO_STATUS_CFG['all'];
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-[#f3f4f6]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[#1E2939] font-bold text-[16px]">{record.bolNumber}</div>
                  <div className="text-[#6A7282] text-[12px] mt-0.5">{record.referenceNumber}</div>
                </div>
                <span className="rounded-full px-3 py-1 font-bold text-[12px] shrink-0" style={{ backgroundColor: rc.bg, color: rc.color }}>
                  {rc.label}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-[#f3f4f6]">
                <Calendar size={14} className="text-[#6A7282]" />
                <span className="text-[#4A5565] text-[13px]">DO Validity: <span className="font-bold text-[#1E2939]">{record.doValidityDate}</span></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom date sheet */}
      {showCustomSheet && (
        <div className="absolute inset-0 bg-[#0E1B3D]/55 flex items-end z-50" onClick={() => setShowCustomSheet(false)}>
          <div className="bg-white w-full rounded-t-3xl shadow-2xl px-5 pt-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-[#D1D5DB] mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <p className="text-[17px] font-bold text-[#0E1B3D]">Custom Range</p>
              <button onClick={() => setShowCustomSheet(false)} className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <X size={15} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">From</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    max={customTo || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">To</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                    min={customFrom || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none" />
                </div>
              </div>
            </div>
            <button
              disabled={!customFrom || !customTo}
              onClick={() => {
                setRange('custom');
                setCustomLabel(`${fmtD(customFrom)} – ${fmtD(customTo)}`);
                setShowCustomSheet(false);
              }}
              className={`w-full py-3.5 rounded-xl text-[14px] font-bold transition-all ${customFrom && customTo ? 'dt-btn-primary' : 'bg-[#E5E7EB] text-[#99A1AF] cursor-not-allowed'}`}
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- CUSTOMS TRACK SCREEN ---------- */
const CUSTOMS_MOCK = [
  { decNumber: 'DEC-2023-001234', date: '15-12-2023', status: 'pending',   description: 'Electronic Goods' },
  { decNumber: 'DEC-2023-001235', date: '16-12-2023', status: 'cleared',   description: 'Textile Products' },
  { decNumber: 'DEC-2023-001236', date: '17-12-2023', status: 'cancelled', description: 'Machinery Parts' },
  { decNumber: 'DEC-2023-001237', date: '18-12-2023', status: 'pending',   description: 'Food Items' },
  { decNumber: 'DEC-2023-001238', date: '19-12-2023', status: 'cleared',   description: 'Auto Parts' },
  { decNumber: 'DEC-2023-001239', date: '20-12-2023', status: 'pending',   description: 'Chemical Products' },
  { decNumber: 'DEC-2023-001240', date: '21-12-2023', status: 'cleared',   description: 'Steel Products' },
  { decNumber: 'DEC-2023-001241', date: '22-12-2023', status: 'cancelled', description: 'Plastic Materials' },
];
const CUSTOMS_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: '#d3ab40', bg: '#fffbeb' },
  cleared:   { label: 'Cleared',   color: '#5cb78f', bg: '#f0fdf4' },
  cancelled: { label: 'Cancelled', color: '#6B7280', bg: '#F9FAFB' },
};

function CustomsTrackScreen({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'cleared' | 'cancelled'>('all');

  const ranges = [
    { k: '7d',     label: 'Last 7 days' },
    { k: '30d',    label: 'Last 30 days' },
    { k: '90d',    label: 'Last 90 days' },
    { k: 'custom', label: 'Custom range' },
  ] as const;
  type RangeKey = typeof ranges[number]['k'];
  const [range, setRange] = useState<RangeKey>('7d');
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [showCustomSheet, setShowCustomSheet] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const fmtD = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(d)} ${months[parseInt(m)-1]}`;
  };
  const currentLabel = range === 'custom' && customLabel ? customLabel : (ranges.find(r => r.k === range)?.label ?? '');

  const filtered = CUSTOMS_MOCK.filter(r =>
    r.decNumber.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'all' || r.status === statusFilter)
  );

  return (
    <div className="min-h-full flex flex-col" style={{ background: 'radial-gradient(circle at 18% 0%, rgba(199,216,244,0.55) 0%, transparent 50%), radial-gradient(circle at 88% 14%, rgba(180,210,255,0.45) 0%, transparent 50%), linear-gradient(180deg, #F4F7FE 0%, #FFFFFF 60%, #F4F7FE 100%)' }}>
      {/* Dark blue header */}
      <div className="relative dt-safe-top px-5 pt-3 pb-20 text-white"
        style={{ background: 'linear-gradient(160deg, #0A1A3D 0%, #0E1B3D 50%, #14306E 100%)' }}>
        <div className="absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
        <div className="absolute -bottom-20 -left-10 w-[260px] h-[260px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#478CF7' }} />
        <div className="relative flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-white/20">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Customs</div>
            <div className="text-[18px] font-bold leading-tight">Customs Declaration</div>
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-2">
          <div>
            <div className="text-[28px] font-bold leading-none">{CUSTOMS_MOCK.length}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/55 font-semibold mt-0.5">DECLARATIONS</div>
          </div>
          <div className="ml-auto relative">
            <button onClick={() => setShowRangePicker(s => !s)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white/15 border border-white/25 text-[11px] font-bold text-white whitespace-nowrap">
              <Calendar size={11} />
              {currentLabel}
              <ChevronRight size={11} className={`transition-transform ${showRangePicker ? '-rotate-90' : 'rotate-90'}`} />
            </button>
            {showRangePicker && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[200px] bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_22px_44px_-12px_rgba(14,27,61,0.3)] overflow-hidden">
                {ranges.map(r => {
                  const active = r.k === range;
                  return (
                    <button key={r.k}
                      onClick={() => {
                        if (r.k === 'custom') { setShowRangePicker(false); setShowCustomSheet(true); }
                        else { setRange(r.k); setShowRangePicker(false); }
                      }}
                      className={`w-full text-left px-4 py-3 text-[13px] font-semibold flex items-center justify-between ${active ? 'bg-[#EAF1FE] text-[#1360D2]' : 'text-[#0E1B3D] hover:bg-[#F4F7FE]'}`}>
                      {r.label}
                      {active && <Check size={14} strokeWidth={3} className="text-[#1360D2]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating search bar */}
      <div className="px-5 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_18px_36px_-18px_rgba(14,27,61,0.28)] p-2 flex items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99A1AF]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search declaration number"
              className="w-full bg-transparent pl-9 pr-3 py-2.5 text-[13.5px] text-[#0E1B3D] placeholder:text-[#99A1AF] outline-none" />
          </div>
          {search && (
            <button onClick={() => setSearch('')}
              className="w-7 h-7 rounded-full bg-[#F4F7FE] flex items-center justify-center text-[#6B7280] mr-1">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Status chips */}
      <div className="px-5 pt-3 flex items-center gap-1.5 flex-wrap">
        {(['all', 'pending', 'cleared', 'cancelled'] as const).map(s => {
          const active = statusFilter === s;
          const label = s === 'all' ? 'All' : CUSTOMS_STATUS[s]?.label ?? s;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`h-8 px-3.5 rounded-full text-[11.5px] font-bold whitespace-nowrap transition border ${
                active
                  ? 'bg-[#1360D2] border-transparent text-white shadow-[0_6px_14px_-8px_rgba(19,96,210,0.6)]'
                  : 'bg-white border-[#E0EAFB] text-[#0E1B3D]'}`}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-10 flex-1 space-y-3">
        {filtered.map((r, i) => {
          const sc = CUSTOMS_STATUS[r.status];
          return (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-[#f3f4f6] flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-[#1360D2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#1E2939] text-[15px]">{r.decNumber}</div>
                <div className="flex items-center gap-1 mt-1 text-[#4A5565] text-[11px]">
                  <Calendar size={11} />{r.date}
                </div>
              </div>
              <span className="rounded-full px-2.5 py-1 font-bold text-[11px] shrink-0" style={{ backgroundColor: sc.bg, color: sc.color }}>
                {sc.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Custom date sheet */}
      {showCustomSheet && (
        <div className="absolute inset-0 bg-[#0E1B3D]/55 flex items-end z-50" onClick={() => setShowCustomSheet(false)}>
          <div className="bg-white w-full rounded-t-3xl shadow-2xl px-5 pt-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-[#D1D5DB] mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <p className="text-[17px] font-bold text-[#0E1B3D]">Custom Range</p>
              <button onClick={() => setShowCustomSheet(false)} className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <X size={15} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">From</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    max={customTo || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">To</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                    min={customFrom || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none" />
                </div>
              </div>
            </div>
            <button
              disabled={!customFrom || !customTo}
              onClick={() => {
                setRange('custom');
                setCustomLabel(`${fmtD(customFrom)} – ${fmtD(customTo)}`);
                setShowCustomSheet(false);
              }}
              className={`w-full py-3.5 rounded-xl text-[14px] font-bold transition-all ${customFrom && customTo ? 'dt-btn-primary' : 'bg-[#E5E7EB] text-[#99A1AF] cursor-not-allowed'}`}
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- GATE PASS LIST SCREEN ---------- */
const GATEPASS_MOCK_DECL = [
  { decNumber: 'BOL-101-805852323-10', date: '20-11-2023', gatePassCount: 2 },
  { decNumber: 'BOL-101-805852323-11', date: '21-11-2023', gatePassCount: 0 },
  { decNumber: 'BOL-101-805852323-12', date: '22-11-2023', gatePassCount: 1 },
  { decNumber: 'BOL-101-805852323-13', date: '23-11-2023', gatePassCount: 0 },
];

function GatePassListScreen({ onBack, onSelect }: { onBack: () => void; onSelect: () => void }) {
  const [search, setSearch] = useState('');
  const [passFilter, setPassFilter] = useState<'active'|'all'>('active');
  const ranges = [
    { k: '7d',  label: 'Last 7 days' },
    { k: '30d', label: 'Last 30 days' },
    { k: '90d', label: 'Last 90 days' },
    { k: 'custom', label: 'Custom range' },
  ] as const;
  type RangeKey = typeof ranges[number]['k'];
  const [range, setRange] = useState<RangeKey>('7d');
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [showCustomSheet, setShowCustomSheet] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const fmtD = (iso: string) => {
    if (!iso) return '';
    const [, m, d] = iso.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(d)} ${months[parseInt(m)-1]}`;
  };
  const currentLabel = range === 'custom' && customLabel ? customLabel : (ranges.find(r => r.k === range)?.label ?? '');

  const filtered = GATEPASS_MOCK_DECL.filter(r =>
    (!search || r.decNumber.toLowerCase().includes(search.toLowerCase())) &&
    (passFilter === 'all' || r.gatePassCount > 0)
  );

  return (
    <div className="min-h-full flex flex-col" style={{ background: 'radial-gradient(circle at 18% 0%, rgba(199,216,244,0.55) 0%, transparent 50%), radial-gradient(circle at 88% 14%, rgba(180,210,255,0.45) 0%, transparent 50%), linear-gradient(180deg, #F4F7FE 0%, #FFFFFF 60%, #F4F7FE 100%)' }}>
      {/* Dark blue header */}
      <div className="relative dt-safe-top px-5 pt-3 pb-20 text-white"
        style={{ background: 'linear-gradient(160deg, #0A1A3D 0%, #0E1B3D 50%, #14306E 100%)' }}>
        <div className="absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
        <div className="absolute -bottom-20 -left-10 w-[260px] h-[260px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#478CF7' }} />
        <div className="relative flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-white/20">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Cargo Management</div>
            <div className="text-[18px] font-bold leading-tight">Gate Pass</div>
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-2">
          <button onClick={() => setPassFilter('active')}
            className={`flex-1 h-8 rounded-full text-[12px] font-bold border transition-all ${passFilter === 'active' ? 'bg-white text-[#1360D2] border-white' : 'bg-white/15 text-white/80 border-white/25'}`}>
            Active Pass
          </button>
          <button onClick={() => setPassFilter('all')}
            className={`flex-1 h-8 rounded-full text-[12px] font-bold border transition-all ${passFilter === 'all' ? 'bg-white text-[#1360D2] border-white' : 'bg-white/15 text-white/80 border-white/25'}`}>
            All
          </button>
          <div className="flex-1 relative flex justify-end">
            <button onClick={() => setShowRangePicker(s => !s)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white/15 border border-white/25 text-[11px] font-bold text-white whitespace-nowrap">
              <Calendar size={11} />
              {currentLabel}
              <ChevronRight size={11} className={`transition-transform ${showRangePicker ? '-rotate-90' : 'rotate-90'}`} />
            </button>
            {showRangePicker && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[200px] bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_22px_44px_-12px_rgba(14,27,61,0.3)] overflow-hidden">
                {ranges.map(r => {
                  const active = r.k === range;
                  return (
                    <button key={r.k}
                      onClick={() => {
                        if (r.k === 'custom') { setShowRangePicker(false); setShowCustomSheet(true); }
                        else { setRange(r.k); setShowRangePicker(false); }
                      }}
                      className={`w-full text-left px-4 py-3 text-[13px] font-semibold flex items-center justify-between ${active ? 'bg-[#EAF1FE] text-[#1360D2]' : 'text-[#0E1B3D] hover:bg-[#F4F7FE]'}`}>
                      {r.label}
                      {active && <Check size={14} strokeWidth={3} className="text-[#1360D2]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating search bar */}
      <div className="px-5 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_18px_36px_-18px_rgba(14,27,61,0.28)] p-2 flex items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99A1AF]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search declaration number"
              className="w-full bg-transparent pl-9 pr-3 py-2.5 text-[13.5px] text-[#0E1B3D] placeholder:text-[#99A1AF] outline-none" />
          </div>
          {search && (
            <button onClick={() => setSearch('')}
              className="w-7 h-7 rounded-full bg-[#F4F7FE] flex items-center justify-center text-[#6B7280] mr-1">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Records */}
      <div className="px-5 pt-5 pb-10 flex-1 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF1FE] flex items-center justify-center mx-auto mb-3">
              <FileCheck size={24} className="text-[#1360D2]" />
            </div>
            <p className="text-[#6A7282] font-medium text-[15px]">No gate passes found</p>
          </div>
        ) : filtered.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-[#EAF0FA] overflow-hidden">
            <button onClick={onSelect} className="w-full p-4 flex items-center gap-4 text-left hover:bg-[#F8FAFF] transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileCheck size={20} className="text-[#1360D2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#1E2939] text-[15px]">{r.decNumber}</div>
                <div className="flex items-center gap-1 mt-0.5 text-[#6A7282] text-[12px]">
                  <Calendar size={11} />{r.date}
                </div>
              </div>
              {r.gatePassCount > 0 ? (
                <span className="bg-blue-50 text-[#1360D2] font-bold text-[12px] rounded-full px-2.5 py-1 shrink-0">{r.gatePassCount} gate pass{r.gatePassCount > 1 ? 'es' : ''}</span>
              ) : (
                <span className="bg-gray-100 text-[#6A7282] font-bold text-[12px] rounded-full px-2.5 py-1 shrink-0">No gate pass</span>
              )}
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
            {passFilter === 'active' && r.gatePassCount > 0 && (
              <div className="border-t border-[#EAF0FA] px-4 py-2.5 flex items-center justify-between">
                <span className="text-[#6A7282] text-[12px]">Gate pass available to download</span>
                <button
                  onClick={e => { e.stopPropagation(); }}
                  className="flex items-center gap-1.5 bg-[#EAF1FE] hover:bg-[#DBEAFE] text-[#1360D2] text-[12px] font-bold px-3 py-1.5 rounded-xl transition-colors">
                  <Download size={13} />
                  Download
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom date sheet */}
      {showCustomSheet && (
        <div className="absolute inset-0 bg-[#0E1B3D]/55 flex items-end z-50" onClick={() => setShowCustomSheet(false)}>
          <div className="bg-white w-full rounded-t-3xl shadow-2xl px-5 pt-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-[#D1D5DB] mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <p className="text-[17px] font-bold text-[#0E1B3D]">Custom Range</p>
              <button onClick={() => setShowCustomSheet(false)} className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <X size={15} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">From</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} max={customTo || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">To</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} min={customFrom || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none" />
                </div>
              </div>
            </div>
            <button disabled={!customFrom || !customTo}
              onClick={() => { setRange('custom'); setCustomLabel(`${fmtD(customFrom)} – ${fmtD(customTo)}`); setShowCustomSheet(false); }}
              className={`w-full py-3.5 rounded-xl text-[14px] font-bold transition-all ${customFrom && customTo ? 'dt-btn-primary' : 'bg-[#E5E7EB] text-[#99A1AF] cursor-not-allowed'}`}>
              Apply Range
            </button>
          </div>
        </div>
      )}
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

/* ---------- PREPAID CARD CREATED — confirmation popup ---------- */
function DeletePrepaidCardModal({ cardNumber, onCancel, onConfirm }:
  { cardNumber: string; onCancel: () => void; onConfirm: () => void }) {
  const last4 = cardNumber.slice(-4);
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(7, 16, 38, 0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
      <div className="dt-pop relative w-full max-w-sm bg-white rounded-[28px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(7,16,38,0.55)] p-6 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FEECEC] flex items-center justify-center text-[#B42318]">
          <Trash2 size={24} />
        </div>
        <div className="mt-4 text-[20px] font-bold leading-snug text-[#0E1B3D]">Delete prepaid card?</div>
        <div className="mt-1.5 text-[13.5px] text-[#4A5565] leading-relaxed">
          Card ending in <span className="font-bold text-[#0E1B3D]">{last4}</span> will be permanently removed.
          Any remaining balance will be refunded to your Advance Deposit.
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button onClick={onCancel}
            className="dt-btn-secondary py-3 rounded-2xl font-bold text-[13px] uppercase tracking-wide">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="py-3 rounded-2xl font-bold text-[13px] uppercase tracking-wide text-white"
            style={{ background: 'linear-gradient(90deg, #B91C1C, #DC2626 50%, #EF4444)', boxShadow: '0 12px 24px -10px rgba(220,38,38,0.45)' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PrepaidCardCreatedModal({ amount, cardNumber, onClose }:
  { amount: string; cardNumber: string; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(7, 16, 38, 0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
      <div className="dt-pop relative w-full max-w-sm bg-white rounded-[28px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(7,16,38,0.55)]">
        {/* Blue hero with new card */}
        <div className="relative overflow-hidden px-5 pt-6 pb-5"
          style={{ background: 'linear-gradient(180deg, #DBEAFE 0%, #FFFFFF 100%)' }}>
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-30 blur-3xl" style={{ background: '#1360D2' }} />
          <div className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: '#6FA0FF' }} />
          <div className="relative rounded-2xl text-white p-4 shadow-[0_18px_36px_-18px_rgba(14,27,61,0.4)]"
            style={{ background: 'linear-gradient(135deg, #0E47A6 0%, #1360D2 50%, #2950E5 100%)' }}>
            <div className="flex items-center justify-between">
              <CreditCard size={22} />
              <div className="text-[10px] uppercase tracking-wider font-bold text-white/75">Prepaid Card</div>
            </div>
            <div className="mt-3 text-[16px] tracking-[0.18em] font-mono">{cardNumber}</div>
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-wider text-white/70 font-bold">Balance</div>
              <div className="text-[18px] font-bold mt-0.5 flex items-center gap-0.5">
                <Dh /> {amount}
              </div>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="px-6 pt-3 pb-5 text-center">
          <div className="mx-auto -mt-10 mb-2 relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_10px_24px_-8px_rgba(15,143,106,0.55),0_0_0_4px_#fff]"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #0F8F6A 100%)' }}>
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </div>
          <div className="text-[20px] font-bold leading-snug text-[#0E1B3D]">Card created successfully</div>
          <div className="mt-1.5 text-[13.5px] text-[#4A5565] leading-relaxed">
            Your new prepaid card is ready to use.<br />
            We've sent the PIN code via SMS to your registered mobile.
          </div>

          <div className="mt-5 space-y-2.5">
            <button onClick={onClose}
              className="dt-btn-primary w-full text-white py-3.5 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 uppercase tracking-wide">
              Go to dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- IMPORT FCL BILLS LIST ---------- */
function ImportFCL({ onBack, onPickBill }: { onBack: () => void; onPickBill: () => void }) {
  type FCLBill = { id: string; date: string; containers: number; amount: string };
  const bills: FCLBill[] = [
    { id: '101-805852323-10', date: '25 May 2025', containers: 10, amount: '12,450.00' },
    { id: '101-805852323-11', date: '24 May 2025', containers:  8, amount: '9,810.50'  },
    { id: '101-805852323-12', date: '23 May 2025', containers: 12, amount: '15,200.00' },
    { id: '101-805852323-13', date: '22 May 2025', containers:  4, amount: '4,825.75'  },
    { id: '101-805852323-14', date: '20 May 2025', containers:  6, amount: '7,160.00'  },
    { id: '101-805852323-15', date: '18 May 2025', containers: 14, amount: '17,540.93' },
  ];
  const ranges = [
    { k: '7d',  label: 'Last 7 days' },
    { k: '30d', label: 'Last 30 days' },
    { k: '90d', label: 'Last 90 days' },
    { k: 'custom', label: 'Custom range' },
  ] as const;
  type RangeKey = typeof ranges[number]['k'];
  const [range, setRange] = useState<RangeKey>('7d');
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [showCustomSheet, setShowCustomSheet] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [query, setQuery] = useState('');

  const fmtDate = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(d)} ${months[parseInt(m)-1]}`;
  };

  const currentLabel = range === 'custom' && customLabel ? customLabel : (ranges.find(r => r.k === range)?.label ?? '');
  const filtered = bills.filter(b => !query || b.id.toLowerCase().includes(query.toLowerCase()));
  const totalDue = filtered.reduce((s, b) => s + parseFloat(b.amount.replace(/,/g, '')), 0);
  const totalContainers = filtered.reduce((s, b) => s + b.containers, 0);

  return (
    <div className="min-h-full flex flex-col"
      style={{
        background:
          'radial-gradient(circle at 18% 0%, rgba(199,216,244,0.55) 0%, transparent 50%),' +
          'radial-gradient(circle at 88% 14%, rgba(180,210,255,0.45) 0%, transparent 50%),' +
          'linear-gradient(180deg, #F4F7FE 0%, #FFFFFF 60%, #F4F7FE 100%)',
      }}>
      {/* Header with embedded summary card */}
      <div className="relative dt-safe-top px-5 pt-3 pb-20 text-white"
        style={{ background: 'linear-gradient(160deg, #0A1A3D 0%, #0E1B3D 50%, #14306E 100%)' }}>
        <div className="absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
        <div className="absolute -bottom-20 -left-10 w-[260px] h-[260px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#478CF7' }} />
        <div className="relative flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-white/20">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Payments</div>
            <div className="text-[18px] font-bold leading-tight">Import FCL Bills</div>
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/65 font-bold">Declarations</div>
            <div className="text-[32px] font-bold leading-none mt-1">{bills.length}</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/65 font-bold">Containers</div>
            <div className="text-[32px] font-bold leading-none mt-1">{bills.reduce((s, b) => s + b.containers, 0)}</div>
          </div>
          <div className="ml-auto relative">
            <button onClick={() => setShowRangePicker(s => !s)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white/15 border border-white/25 text-[11px] font-bold text-white whitespace-nowrap">
              <Calendar size={11} />
              {currentLabel}
              <ChevronRight size={11} className={`transition-transform ${showRangePicker ? '-rotate-90' : 'rotate-90'}`} />
            </button>
            {showRangePicker && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[200px] bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_22px_44px_-12px_rgba(14,27,61,0.3)] overflow-hidden">
                {ranges.map(r => {
                  const active = r.k === range;
                  return (
                    <button key={r.k}
                      onClick={() => {
                        if (r.k === 'custom') { setShowRangePicker(false); setShowCustomSheet(true); }
                        else { setRange(r.k); setShowRangePicker(false); }
                      }}
                      className={`w-full text-left px-4 py-3 text-[13px] font-semibold flex items-center justify-between ${active ? 'bg-[#EAF1FE] text-[#1360D2]' : 'text-[#0E1B3D] hover:bg-[#F4F7FE]'}`}>
                      {r.label}
                      {active && <Check size={14} strokeWidth={3} className="text-[#1360D2]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search + date range — floating bar overlapping header */}
      <div className="px-5 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_18px_36px_-18px_rgba(14,27,61,0.28)] p-2 flex items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99A1AF]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search declaration number"
              className="w-full bg-transparent pl-9 pr-3 py-2.5 text-[13.5px] text-[#0E1B3D] placeholder:text-[#99A1AF] outline-none" />
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 pb-10 flex-1 space-y-3">
        {/* Sub-header */}
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-wider text-[#0E47A6] font-bold">Pending declarations</div>
          <div className="text-[11px] text-[#6B7280]">Sorted by latest</div>
        </div>

        {/* Bill list — premium cards */}
        <div className="space-y-3">
          {filtered.map(b => (
            <button key={b.id} onClick={onPickBill}
              className="group relative w-full bg-white rounded-2xl border border-[#EAF0FA] shadow-[0_8px_18px_-14px_rgba(14,27,61,0.18)] hover:border-[#B7CDF1] hover:shadow-[0_16px_28px_-18px_rgba(19,96,210,0.35)] transition-all text-left p-4 overflow-hidden">
              {/* Left accent stripe */}
              <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                style={{ background: 'linear-gradient(180deg, #1360D2, #2950E5)' }} />

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-[#1360D2]"
                  style={{ background: 'linear-gradient(135deg, #EAF1FE, #DCE7FB)' }}>
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[14.5px] font-bold text-[#0E1B3D] truncate tracking-tight">{b.id}</div>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11.5px] text-[#6B7280]">
                    <span className="inline-flex items-center gap-1"><Calendar size={11} className="text-[#1360D2]" /> {b.date}</span>
                    <span className="text-[#C9D2DE]">·</span>
                    <span className="inline-flex items-center gap-1"><Package size={11} className="text-[#1360D2]" /> {b.containers}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider"
                    style={{ background: '#FEF6E7', color: '#B45309', border: '1px solid #FCD9A5' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F59E0B' }} />
                    Pending
                  </span>
                  <div className="text-[16px] font-bold text-[#0E1B3D] mt-1.5 flex items-center justify-end gap-0.5">
                    <Dh /> {b.amount}
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#EAF0FA] py-10 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF1FE] mx-auto flex items-center justify-center text-[#1360D2]">
                <FileText size={20} />
              </div>
              <div className="mt-3 text-[13.5px] font-bold text-[#0E1B3D]">No declarations found</div>
              <div className="mt-1 text-[12px] text-[#6B7280]">Try a different search term or date range.</div>
            </div>
          )}
        </div>
      </div>

      {/* Custom date range bottom sheet */}
      {showCustomSheet && (
        <div className="absolute inset-0 bg-[#0E1B3D]/55 flex items-end z-50" onClick={() => setShowCustomSheet(false)}>
          <div className="bg-white w-full rounded-t-3xl shadow-2xl px-5 pt-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-[#D1D5DB] mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <p className="text-[17px] font-bold text-[#0E1B3D]">Custom Range</p>
              <button onClick={() => setShowCustomSheet(false)} className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <X size={15} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">From</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input
                    type="date"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    max={customTo || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">To</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input
                    type="date"
                    value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    min={customFrom || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none"
                  />
                </div>
              </div>
            </div>
            <button
              disabled={!customFrom || !customTo}
              onClick={() => {
                setRange('custom');
                setCustomLabel(`${fmtDate(customFrom)} – ${fmtDate(customTo)}`);
                setShowCustomSheet(false);
              }}
              className={`w-full py-3.5 rounded-xl text-[14px] font-bold transition-all ${customFrom && customTo ? 'dt-btn-primary' : 'bg-[#E5E7EB] text-[#99A1AF] cursor-not-allowed'}`}
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
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
          <Search size={18} className="text-gray-500" />
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
                <ChevronRight size={18} className="text-gray-500" />
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
function GatePassDetails({ vehicles, onBack, onAddVehicle, onViewDetails, onViewProducts, onRemoveVehicle, onPay }: any) {
  const totalAmount = vehicles.length * 18;
  const vatAmount = vehicles.length * 20;

  return (
    <div className="bg-[#F2F5FB] flex flex-col" style={{ height: '100%' }}>
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow-lg shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
          <ChevronLeft size={20} />
        </button>
        <div>
          <div className="text-white font-bold text-xl">Gate Pass Details</div>
          <div className="text-white/60 text-xs">BOL 101-805852323-10</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 pb-6">
          {/* BOL card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#f3f4f6]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#1360D2] flex items-center justify-center shrink-0">
                <FileCheck size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#1E2939] text-[15px]">BOL 101-805852323-10</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[#6A7282] text-[12px]">Gate Pass Type</span>
                  <span className="flex items-center gap-1 text-[12px] font-bold text-[#5cb78f]">
                    <div className="w-4 h-4 rounded-full bg-[#5cb78f] flex items-center justify-center"><Check size={10} className="text-white" strokeWidth={3}/></div>
                    IN
                  </span>
                  <span className="flex items-center gap-1 text-[12px] font-medium text-[#6A7282]">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    Out
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-1">
              <button onClick={onViewDetails} className="flex items-center gap-1.5 text-[#1360D2] text-[13px] font-semibold">
                <Info size={14} className="shrink-0" /> View Details
              </button>
              <button onClick={onViewProducts} className="flex items-center gap-1.5 text-[#1360D2] text-[13px] font-semibold">
                <Info size={14} className="shrink-0" /> Product Details
              </button>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <div className="font-bold text-[17px] text-[#1E2939] mb-3">Vehicle Information</div>
            {vehicles.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Truck size={28} className="text-[#D1D5DC]" />
                </div>
                <div>
                  <div className="font-bold text-[#1E2939] text-[15px]">No Vehicle Added Yet</div>
                  <div className="text-[#6A7282] text-[13px] mt-1">You can add vehicles for your declaration to start transporting your products</div>
                </div>
                <button onClick={onAddVehicle}
                  className="flex items-center gap-2 border border-[#1360D2] text-[#1360D2] rounded-xl px-5 py-2.5 font-bold text-[14px]">
                  <Plus size={16} /> Add Vehicle
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {vehicles.map((v: any, i: number) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 border border-[#f3f4f6]">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Truck size={18} className="text-[#1360D2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[#1E2939] text-[14px]">{v.plate}</div>
                      <div className="text-[#6A7282] text-[12px]">Total Quantity {v.qty}</div>
                    </div>
                    <button onClick={() => onRemoveVehicle(i)} className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button onClick={onAddVehicle}
                  className="w-full flex items-center justify-center gap-2 border border-[#1360D2] text-[#1360D2] rounded-2xl py-3 font-bold text-[14px] bg-white">
                  <Plus size={16} /> Add Vehicle
                </button>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div>
            <div className="font-bold text-[17px] text-[#1E2939] mb-3">Payment Details</div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#F8FAFF]">
                <span className="text-[#4A5565] text-[14px]">Total Amount</span>
                <span className="font-bold text-[#1E2939] text-[14px]"><Dh /> {totalAmount}.00</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-[#4A5565] text-[14px]">VAT Amount</span>
                <span className="font-bold text-[#1E2939] text-[14px]"><Dh /> {vatAmount}.00</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4 border-t-2 border-[#F2F5FB]">
                <span className="font-bold text-[#1E2939] text-[16px]">Total Due</span>
                <span className="font-bold text-[#1360D2] text-[18px]"><Dh /> {totalAmount + vatAmount}.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-6 pt-3 bg-[#F2F5FB] border-t border-gray-100">
        <button onClick={onPay}
          className="w-full dt-btn-primary text-white rounded-2xl py-4 font-bold text-[15px] uppercase">
          Pay &amp; Submit
        </button>
      </div>
    </div>
  );
}

/* ---------- GATE PASS PAYMENT ---------- */
type GatePassPayMethod = 'applepay' | 'rosoom' | 'advance' | 'prepaid';

function GatePassPayment({ amount, onBack, onConfirm }: { amount: number; onBack: () => void; onConfirm: () => void }) {
  const [selected, setSelected] = useState<GatePassPayMethod>('applepay');

  const sel = (id: GatePassPayMethod) =>
    `w-full bg-white border rounded-xl transition-all shadow-sm ${selected === id ? 'border-[#1360D2] shadow-[0_4px_12px_rgba(19,96,210,0.12)]' : 'border-gray-200'}`;

  const gatePassFee = +(amount * 0.952).toFixed(2);
  const vat = +(amount * 0.048).toFixed(2);

  return (
    <div className="bg-[#F2F5FB] flex flex-col" style={{ height: '100%' }}>
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow-lg shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white">
          <ChevronLeft size={20} />
        </button>
        <div>
          <div className="text-white font-bold text-xl">Payment</div>
          <div className="text-white/60 text-xs">Select payment method</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 pb-6">

          {/* Amount summary */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'linear-gradient(155deg,#EFF6FF 0%,#EEF2FF 100%)', border: '1px solid #DBEAFE' }}>
            <div className="text-[#4A5565] text-sm font-medium mb-1">Total Amount Due</div>
            <div className="text-[#1360D2] font-bold text-[32px]"><Dh /> {amount.toFixed(2)}</div>
            <div className="mt-3 pt-3 border-t border-blue-100 space-y-1.5">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#6A7282]">Gate Pass Fee</span>
                <span className="font-bold text-[#1E2939]"><Dh /> {gatePassFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#6A7282]">VAT (5%)</span>
                <span className="font-bold text-[#1E2939]"><Dh /> {vat.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Mode of Payment */}
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[13px] text-[#0E1B3D]">Mode of Payment</span>
              <span className="bg-gray-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Default</span>
            </div>

            {/* Apple Pay */}
            <button onClick={() => setSelected('applepay')}
              className={`${sel('applepay')} py-4 flex items-center justify-center gap-2`}>
              <span className="font-medium text-black">Pay with</span>
              <span className="inline-flex items-center gap-1 text-black">
                {APPLE_PAY_LOGO}
                <span className="font-bold text-lg" style={{ fontFamily: 'system-ui' }}>Pay</span>
              </span>
            </button>

            <div className="text-[11px] font-bold text-[#696F83] uppercase tracking-wider">Other Methods</div>

            {/* Rosoom */}
            <button onClick={() => setSelected('rosoom')}
              className={`${sel('rosoom')} py-3 px-4 flex items-center gap-3`}>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1FE] flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-[#1360D2]" />
              </div>
              <span className="font-medium text-[#1360D2] text-[14px]">Rosoom Payment Gateway</span>
            </button>

            {/* Advance Deposit */}
            <button onClick={() => setSelected('advance')}
              className={`${sel('advance')} py-3 px-4 flex items-center gap-3`}>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1FE] flex items-center justify-center shrink-0">
                <Wallet size={18} className="text-[#1360D2]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[#1360D2] text-[14px]">Pay from Advance Deposit</div>
                <div className="text-[11px] text-[#6B7280]">Balance: <span className="font-bold text-[#0E1B3D]"><Dh /> 77,001.18</span></div>
              </div>
            </button>

            {/* Prepaid Card */}
            <button onClick={() => setSelected('prepaid')}
              className={`${sel('prepaid')} py-3 px-4 flex items-center gap-3`}>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1FE] flex items-center justify-center shrink-0">
                <CreditCard size={18} className="text-[#1360D2]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[#1360D2] text-[14px]">Prepaid Card</div>
                <div className="text-[11px] text-[#6B7280]">Balance: <span className="font-bold text-[#0E1B3D]"><Dh /> 3,500.00</span></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-6 pt-3 bg-[#F2F5FB] border-t border-gray-100">
        <button onClick={onConfirm}
          className="w-full dt-btn-primary text-white rounded-2xl py-4 text-[15px] uppercase font-bold">
          Confirm Payment · <Dh /> {amount.toFixed(2)}
        </button>
      </div>
    </div>
  );
}

/* ---------- ADD VEHICLE ---------- */
function AddVehicle({ index, onCancel, onSave }: any) {
  const [city, setCity] = useState('');
  const [plate, setPlate] = useState('');
  const [vehicleNum, setVehicleNum] = useState('');
  const [selectAll, setSelectAll] = useState(true);
  const [qty1, setQty1] = useState('200');
  const [qty2, setQty2] = useState('200');

  return (
    <div className="bg-[#F2F5FB] flex flex-col" style={{ height: '100%' }}>
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow-lg shrink-0">
        <button onClick={onCancel} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white font-bold text-xl">Add Vehicle</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 pb-6">
          <div className="font-bold text-[17px] text-[#1E2939]">Vehicle {String(index).padStart(2, '0')}</div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-[#364153] uppercase tracking-wide mb-2">Choose Vehicle City</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6A7282]" />
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city name"
                className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-[#1360D2] text-[#1E2939] shadow-sm" />
            </div>
          </div>

          {/* Plate */}
          <div>
            <label className="block text-xs font-bold text-[#364153] uppercase tracking-wide mb-2">Enter Vehicle Plate Number</label>
            <div className="relative">
              <Truck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6A7282]" />
              <input value={plate} onChange={e => setPlate(e.target.value)} placeholder="Enter number"
                className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-[#1360D2] text-[#1E2939] shadow-sm" />
            </div>
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-xs font-bold text-[#364153] uppercase tracking-wide mb-2">Enter Vehicle Number</label>
            <div className="relative">
              <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6A7282]" />
              <input value={vehicleNum} onChange={e => setVehicleNum(e.target.value)} placeholder="Enter number"
                className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-[#1360D2] text-[#1E2939] shadow-sm" />
            </div>
          </div>

          {/* Product Description */}
          <div>
            <div className="font-bold text-[17px] text-[#1E2939] mb-3">Product Description</div>
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
              {/* Select all */}
              <button onClick={() => setSelectAll(s => !s)} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectAll ? 'bg-[#1360D2] border-[#1360D2]' : 'border-gray-300'}`}>
                  {selectAll && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <span className="font-medium text-[#1E2939] text-[14px]">Select All Products</span>
              </button>

              {/* Product 1 */}
              <div>
                <div className="text-[#4A5565] text-[13px] font-medium mb-2">Flat Rolled Sheets - Boats</div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#1E2939] text-[16px] w-14">54200</span>
                  <input value={qty1} onChange={e => setQty1(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#1360D2] text-[#1E2939] text-[14px]"
                    placeholder="200" />
                </div>
              </div>

              {/* Product 2 */}
              <div>
                <div className="text-[#4A5565] text-[13px] font-medium mb-2">Spiral Rolled Sheets - Boats</div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#1E2939] text-[16px] w-14">54200</span>
                  <input value={qty2} onChange={e => setQty2(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#1360D2] text-[#1E2939] text-[14px]"
                    placeholder="200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shrink-0 px-4 pb-6 pt-3 bg-[#F2F5FB] border-t border-gray-100 space-y-3">
        <button onClick={onSave} className="w-full dt-btn-primary text-white rounded-2xl py-4 font-bold text-[15px] uppercase">
          Save Data &amp; Add Vehicle
        </button>
        <button onClick={onCancel} className="w-full dt-btn-secondary rounded-2xl py-3.5 font-bold uppercase">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ---------- BOE DETAILS ---------- */
const BOE_ROWS = [
  { label: 'BOE Type',             value: 'Goods' },
  { label: 'BOE No.',              value: 'LGP - 10002014 - 23' },
  { label: 'BOE Date',             value: '20-11-23' },
  { label: 'Exit Port',            value: 'AED01' },
  { label: 'Rotation',             value: '-' },
  { label: 'Discharge Port',       value: 'SONY GULF FZE' },
  { label: 'Vessel',               value: 'F7100' },
  { label: 'Arrival Date',         value: '-' },
  { label: 'Customer Code',        value: 'NO' },
  { label: 'Customer Name',        value: '150' },
  { label: 'Container BOE',        value: '-' },
  { label: 'Total Quantity',       value: '2' },
  { label: 'Cancel Flag',          value: 'NO' },
  { label: 'Clearance No.',        value: '-' },
  { label: 'Shipment Description', value: 'Recorder TV, Cameras' },
];

function BOEDetails({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-[#F2F5FB] flex flex-col" style={{ height: '100%' }}>
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow-lg shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white font-bold text-xl">BOE Details</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* BOL card */}
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-[#f3f4f6] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#1360D2] flex items-center justify-center shrink-0">
              <FileCheck size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-[#1E2939] text-[15px]">BOL 101-805852323-10</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[#6A7282] text-[12px]">Gate Pass Type</span>
                <span className="flex items-center gap-1 text-[12px] font-bold text-[#5cb78f]">
                  <div className="w-4 h-4 rounded-full bg-[#5cb78f] flex items-center justify-center"><Check size={10} className="text-white" strokeWidth={3}/></div>
                  IN
                </span>
                <span className="flex items-center gap-1 text-[12px] font-medium text-[#6A7282]">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  Out
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-sm mx-4 rounded-2xl overflow-hidden">
          {BOE_ROWS.map((row, i) => (
            <div key={row.label} className={`flex items-start justify-between px-5 py-3.5 ${i % 2 === 0 ? 'bg-[#F8FAFF]' : 'bg-white'}`}>
              <span className="text-[#4A5565] font-medium text-[14px]">{row.label}</span>
              <span className="text-[#1E2939] text-[14px] text-right max-w-[55%]">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="h-6" />
      </div>
    </div>
  );
}

/* ---------- PRODUCT DETAILS SCREEN ---------- */
const PRODUCT_LIST = [
  { name: 'Flat-Rolled-Sheets',   packageType: 'Boats', marksNo: '-', balance: 100, totalQty: 5420 },
  { name: 'Spiral-Rolled-Sheets', packageType: 'Boats', marksNo: '-', balance: 100, totalQty: 5420 },
];

function ProductDetailsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-[#F2F5FB] flex flex-col" style={{ height: '100%' }}>
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow-lg shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
          <ChevronLeft size={20} />
        </button>
        <div>
          <div className="text-white font-bold text-xl">Gate Pass Details</div>
          <div className="text-white/60 text-xs">Product Description</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 pb-6">
          {/* BOL card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#f3f4f6]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#1360D2] flex items-center justify-center shrink-0">
                <FileCheck size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-[#1E2939] text-[15px]">BOL 101-805852323-10</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[#6A7282] text-[12px]">Gate Pass Type</span>
                  <span className="flex items-center gap-1 text-[12px] font-bold text-[#5cb78f]">
                    <div className="w-4 h-4 rounded-full bg-[#5cb78f] flex items-center justify-center"><Check size={10} className="text-white" strokeWidth={3}/></div>
                    IN
                  </span>
                  <span className="flex items-center gap-1 text-[12px] font-medium text-[#6A7282]">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    Out
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onBack} className="border border-[#1360D2] text-[#1360D2] rounded-xl px-4 py-2 text-[13px] font-bold">
              BOE Details
            </button>
          </div>

          <div className="font-bold text-[17px] text-[#1E2939]">Product Description</div>

          {PRODUCT_LIST.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#f3f4f6]">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f3f4f6]">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <Package size={18} className="text-[#6A7282]" />
                </div>
                <div className="font-bold text-[#1E2939] text-[15px]">{p.name}</div>
              </div>
              {[
                ['Package Type', p.packageType],
                ['Marks & No.', p.marksNo],
                ['Balance', String(p.balance)],
                ['Total Quantity', String(p.totalQty)],
              ].map(([label, value], ri) => (
                <div key={label} className={`flex items-center justify-between px-5 py-3.5 ${ri % 2 === 0 ? 'bg-[#F8FAFF]' : 'bg-white'}`}>
                  <span className="text-[#6A7282] text-[14px]">{label}</span>
                  <span className="font-bold text-[#1E2939] text-[14px]">{value}</span>
                </div>
              ))}
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
                <button className="text-gray-500"><Copy size={16} /></button>
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
const CONTAINER_MOCK = [
  { id: 'CUST150564', seq: 0, size: '40 ft', status: 'MT FROM TOWN', statusColor: '#e07d30', steps: ['Landed','From Town','To Town'], subLabels: ['Import Full','Storage Empty','Import Full'], stepDone: [true, true, false], dates: ['21-OCT-23 00:30','23-OCT-23 00:30',''], tracked: true },
  { id: 'CUST150565', seq: 1, size: '20 ft', status: 'IN STORAGE', statusColor: '#1360D2', steps: ['Landed','From Town','To Town'], subLabels: ['Import Full','Storage Empty','Import Full'], stepDone: [true, false, false], dates: ['20-OCT-23 12:00','',''], tracked: true },
  { id: 'CUST150566', seq: 2, size: '40 ft', status: 'DELIVERED', statusColor: '#5cb78f', steps: ['Landed','From Town','To Town'], subLabels: ['Import Full','Storage Empty','Import Full'], stepDone: [true, true, true], dates: ['19-OCT-23 08:00','20-OCT-23 14:30','21-OCT-23 16:00'], tracked: false },
];

function Containers({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState('');
  const [containers, setContainers] = useState(CONTAINER_MOCK);
  const [pinFilter, setPinFilter] = useState<'all'|'pinned'>('pinned');

  const ranges = [
    { k: '7d',     label: 'Last 7 days' },
    { k: '30d',    label: 'Last 30 days' },
    { k: '90d',    label: 'Last 90 days' },
    { k: 'custom', label: 'Custom range' },
  ] as const;
  type RangeKey = typeof ranges[number]['k'];
  const [range, setRange] = useState<RangeKey>('7d');
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [showCustomSheet, setShowCustomSheet] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const fmtD = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(d)} ${months[parseInt(m)-1]}`;
  };
  const currentLabel = range === 'custom' && customLabel ? customLabel : (ranges.find(r => r.k === range)?.label ?? '');

  const filtered = containers.filter(c =>
    c.id.toLowerCase().includes(search.toLowerCase()) &&
    (pinFilter === 'all' || c.tracked)
  );

  return (
    <div className="min-h-full flex flex-col" style={{ background: 'radial-gradient(circle at 18% 0%, rgba(199,216,244,0.55) 0%, transparent 50%), radial-gradient(circle at 88% 14%, rgba(180,210,255,0.45) 0%, transparent 50%), linear-gradient(180deg, #F4F7FE 0%, #FFFFFF 60%, #F4F7FE 100%)' }}>
      {/* Dark blue header */}
      <div className="relative dt-safe-top px-5 pt-3 pb-20 text-white"
        style={{ background: 'linear-gradient(160deg, #0A1A3D 0%, #0E1B3D 50%, #14306E 100%)' }}>
        <div className="absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
        <div className="absolute -bottom-20 -left-10 w-[260px] h-[260px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#478CF7' }} />
        <div className="relative flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-white/20">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Tracking</div>
            <div className="text-[18px] font-bold leading-tight">Containers</div>
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-2">
          <button onClick={() => setPinFilter('pinned')}
            className={`flex-1 h-8 rounded-full text-[12px] font-bold border transition-all ${pinFilter === 'pinned' ? 'bg-white text-[#1360D2] border-white' : 'bg-white/15 text-white/80 border-white/25'}`}>
            Pinned
          </button>
          <button onClick={() => setPinFilter('all')}
            className={`flex-1 h-8 rounded-full text-[12px] font-bold border transition-all ${pinFilter === 'all' ? 'bg-white text-[#1360D2] border-white' : 'bg-white/15 text-white/80 border-white/25'}`}>
            All
          </button>
          <div className="flex-1 relative flex justify-end">
            <button onClick={() => setShowRangePicker(s => !s)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white/15 border border-white/25 text-[11px] font-bold text-white whitespace-nowrap">
              <Calendar size={11} />
              {currentLabel}
              <ChevronRight size={11} className={`transition-transform ${showRangePicker ? '-rotate-90' : 'rotate-90'}`} />
            </button>
            {showRangePicker && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[200px] bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_22px_44px_-12px_rgba(14,27,61,0.3)] overflow-hidden">
                {ranges.map(r => {
                  const active = r.k === range;
                  return (
                    <button key={r.k}
                      onClick={() => {
                        if (r.k === 'custom') { setShowRangePicker(false); setShowCustomSheet(true); }
                        else { setRange(r.k); setShowRangePicker(false); }
                      }}
                      className={`w-full text-left px-4 py-3 text-[13px] font-semibold flex items-center justify-between ${active ? 'bg-[#EAF1FE] text-[#1360D2]' : 'text-[#0E1B3D] hover:bg-[#F4F7FE]'}`}>
                      {r.label}
                      {active && <Check size={14} strokeWidth={3} className="text-[#1360D2]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating search bar */}
      <div className="px-5 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_18px_36px_-18px_rgba(14,27,61,0.28)] p-2 flex items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99A1AF]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search container number"
              className="w-full bg-transparent pl-9 pr-3 py-2.5 text-[13.5px] text-[#0E1B3D] placeholder:text-[#99A1AF] outline-none" />
          </div>
          {search && (
            <button onClick={() => setSearch('')}
              className="w-7 h-7 rounded-full bg-[#F4F7FE] flex items-center justify-center text-[#6B7280] mr-1">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-10 flex-1 space-y-3">
        {filtered.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4 border border-[#f3f4f6] space-y-3">
            <div>
              <div className="font-bold text-[#1E2939] text-[15px]">{c.id} ({c.seq}) - {c.size}</div>
              <div className="font-bold text-[12px] mt-0.5" style={{ color: c.statusColor }}>{c.status}</div>
            </div>

            {/* Step tracker */}
            <div className="relative">
              <div className="grid grid-cols-3 gap-1 mb-2">
                {c.steps.map((step, si) => (
                  <div key={si} className="text-center">
                    <div className="font-bold text-[#1E2939] text-[11px]">{step}</div>
                    <div className="text-[#6A7282] text-[10px]">{c.subLabels[si]}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                {c.steps.map((_, si) => (
                  <React.Fragment key={si}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${c.stepDone[si] ? 'bg-[#5cb78f] border-[#5cb78f]' : 'border-gray-300 bg-white'}`}>
                      {c.stepDone[si] && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                    {si < c.steps.length - 1 && (
                      <div className={`flex-1 h-0.5 ${c.stepDone[si] && c.stepDone[si + 1] ? 'bg-[#5cb78f]' : c.stepDone[si] ? 'bg-[#DBEAFE]' : 'border-t-2 border-dashed border-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {c.dates.map((d, di) => (
                  <div key={di} className="text-[#6A7282] text-[10px] text-center">{d}</div>
                ))}
              </div>
            </div>

            {c.tracked ? (
              <div className="flex gap-2">
                <div className="flex-1 border-2 border-[#1360D2] text-[#1360D2] rounded-2xl py-3 font-bold text-[13px] flex items-center justify-center gap-2">
                  <Pin size={14} className="fill-[#1360D2]" /> Pinned
                </div>
                <button onClick={() => setContainers(cs => cs.map((x, j) => j === i ? { ...x, tracked: false } : x))}
                  className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-400 shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button onClick={() => setContainers(cs => cs.map((x, j) => j === i ? { ...x, tracked: true } : x))}
                className="w-full dt-btn-primary text-white rounded-2xl py-3 font-bold text-[13px] flex items-center justify-center gap-2">
                <Pin size={14} /> Pin to Track
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Custom date sheet */}
      {showCustomSheet && (
        <div className="absolute inset-0 bg-[#0E1B3D]/55 flex items-end z-50" onClick={() => setShowCustomSheet(false)}>
          <div className="bg-white w-full rounded-t-3xl shadow-2xl px-5 pt-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-[#D1D5DB] mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <p className="text-[17px] font-bold text-[#0E1B3D]">Custom Range</p>
              <button onClick={() => setShowCustomSheet(false)} className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <X size={15} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">From</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    max={customTo || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">To</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                    min={customFrom || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none" />
                </div>
              </div>
            </div>
            <button
              disabled={!customFrom || !customTo}
              onClick={() => {
                setRange('custom');
                setCustomLabel(`${fmtD(customFrom)} – ${fmtD(customTo)}`);
                setShowCustomSheet(false);
              }}
              className={`w-full py-3.5 rounded-xl text-[14px] font-bold transition-all ${customFrom && customTo ? 'dt-btn-primary' : 'bg-[#E5E7EB] text-[#99A1AF] cursor-not-allowed'}`}
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
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
const VESSEL_MOCK = [
  { rotation: '908471', terminal: 'Jebel Ali -T1', agent: 'ALLIANCE FAIRFAX', eta: '21-OCT-23 00:30', etd: '21-OCT-23 00:30', cutoff: '21-OCT-23 00:30', tracked: true },
  { rotation: '908471', terminal: 'Jebel Ali - T2', agent: 'ALLIANCE FAIRFAX', eta: '21-OCT-23 00:30', etd: '21-OCT-23 00:30', cutoff: '21-OCT-23 00:30', tracked: false },
  { rotation: '908472', terminal: 'Jebel Ali - T3', agent: 'ALLIANCE FAIRFAX', eta: '22-OCT-23 01:30', etd: '22-OCT-23 01:30', cutoff: '22-OCT-23 01:30', tracked: false },
];

function Vessels({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState('');
  const [vessels, setVessels] = useState(VESSEL_MOCK);
  const [pinFilter, setPinFilter] = useState<'all'|'pinned'>('pinned');

  const ranges = [
    { k: '7d',     label: 'Last 7 days' },
    { k: '30d',    label: 'Last 30 days' },
    { k: '90d',    label: 'Last 90 days' },
    { k: 'custom', label: 'Custom range' },
  ] as const;
  type RangeKey = typeof ranges[number]['k'];
  const [range, setRange] = useState<RangeKey>('7d');
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [showCustomSheet, setShowCustomSheet] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const fmtD = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(d)} ${months[parseInt(m)-1]}`;
  };
  const currentLabel = range === 'custom' && customLabel ? customLabel : (ranges.find(r => r.k === range)?.label ?? '');

  const filtered = vessels.filter(v =>
    (!search || v.rotation.includes(search)) &&
    (pinFilter === 'all' || v.tracked)
  );

  return (
    <div className="min-h-full flex flex-col" style={{ background: 'radial-gradient(circle at 18% 0%, rgba(199,216,244,0.55) 0%, transparent 50%), radial-gradient(circle at 88% 14%, rgba(180,210,255,0.45) 0%, transparent 50%), linear-gradient(180deg, #F4F7FE 0%, #FFFFFF 60%, #F4F7FE 100%)' }}>
      {/* Dark blue header */}
      <div className="relative dt-safe-top px-5 pt-3 pb-20 text-white"
        style={{ background: 'linear-gradient(160deg, #0A1A3D 0%, #0E1B3D 50%, #14306E 100%)' }}>
        <div className="absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
        <div className="absolute -bottom-20 -left-10 w-[260px] h-[260px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#478CF7' }} />
        <div className="relative flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-white/20">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Tracking</div>
            <div className="text-[18px] font-bold leading-tight">Vessels</div>
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-2">
          <button onClick={() => setPinFilter('pinned')}
            className={`flex-1 h-8 rounded-full text-[12px] font-bold border transition-all ${pinFilter === 'pinned' ? 'bg-white text-[#1360D2] border-white' : 'bg-white/15 text-white/80 border-white/25'}`}>
            Pinned
          </button>
          <button onClick={() => setPinFilter('all')}
            className={`flex-1 h-8 rounded-full text-[12px] font-bold border transition-all ${pinFilter === 'all' ? 'bg-white text-[#1360D2] border-white' : 'bg-white/15 text-white/80 border-white/25'}`}>
            All
          </button>
          <div className="flex-1 relative flex justify-end">
            <button onClick={() => setShowRangePicker(s => !s)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white/15 border border-white/25 text-[11px] font-bold text-white whitespace-nowrap">
              <Calendar size={11} />
              {currentLabel}
              <ChevronRight size={11} className={`transition-transform ${showRangePicker ? '-rotate-90' : 'rotate-90'}`} />
            </button>
            {showRangePicker && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[200px] bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_22px_44px_-12px_rgba(14,27,61,0.3)] overflow-hidden">
                {ranges.map(r => {
                  const active = r.k === range;
                  return (
                    <button key={r.k}
                      onClick={() => {
                        if (r.k === 'custom') { setShowRangePicker(false); setShowCustomSheet(true); }
                        else { setRange(r.k); setShowRangePicker(false); }
                      }}
                      className={`w-full text-left px-4 py-3 text-[13px] font-semibold flex items-center justify-between ${active ? 'bg-[#EAF1FE] text-[#1360D2]' : 'text-[#0E1B3D] hover:bg-[#F4F7FE]'}`}>
                      {r.label}
                      {active && <Check size={14} strokeWidth={3} className="text-[#1360D2]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating search bar */}
      <div className="px-5 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_18px_36px_-18px_rgba(14,27,61,0.28)] p-2 flex items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99A1AF]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by rotation or terminal"
              className="w-full bg-transparent pl-9 pr-3 py-2.5 text-[13.5px] text-[#0E1B3D] placeholder:text-[#99A1AF] outline-none" />
          </div>
          {search && (
            <button onClick={() => setSearch('')}
              className="w-7 h-7 rounded-full bg-[#F4F7FE] flex items-center justify-center text-[#6B7280] mr-1">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-10 flex-1 space-y-3">
        {filtered.map((v, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4 border border-[#f3f4f6] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Ship size={20} className="text-[#1360D2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#1E2939] text-[15px]">{v.rotation} - {v.terminal}</div>
                <div className="text-[#6A7282] text-[12px] uppercase tracking-wide">{v.agent}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[['ETA', v.eta], ['ETD', v.etd], ['Cut Off', v.cutoff]].map(([label, val]) => (
                <div key={label} className="bg-[#F8FAFF] rounded-xl p-2.5">
                  <div className="text-[#6A7282] text-[10px] font-bold uppercase tracking-wide mb-1">{label}</div>
                  <div className="text-[#1E2939] font-bold text-[11px] leading-tight">{(val as string).split(' ')[0]}</div>
                  <div className="text-[#6A7282] text-[10px]">{(val as string).split(' ')[1]}</div>
                </div>
              ))}
            </div>

            {v.tracked ? (
              <div className="flex gap-2">
                <div className="flex-1 border-2 border-[#1360D2] text-[#1360D2] rounded-2xl py-3 font-bold text-[13px] flex items-center justify-center gap-2">
                  <Pin size={14} className="fill-[#1360D2]" /> Pinned
                </div>
                <button onClick={() => setVessels(vs => vs.map((x, j) => j === i ? { ...x, tracked: false } : x))}
                  className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-400 shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button onClick={() => setVessels(vs => vs.map((x, j) => j === i ? { ...x, tracked: true } : x))}
                className="w-full dt-btn-primary text-white rounded-2xl py-3 font-bold text-[13px] flex items-center justify-center gap-2">
                <Pin size={14} /> Pin to Track
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Custom date sheet */}
      {showCustomSheet && (
        <div className="absolute inset-0 bg-[#0E1B3D]/55 flex items-end z-50" onClick={() => setShowCustomSheet(false)}>
          <div className="bg-white w-full rounded-t-3xl shadow-2xl px-5 pt-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-[#D1D5DB] mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <p className="text-[17px] font-bold text-[#0E1B3D]">Custom Range</p>
              <button onClick={() => setShowCustomSheet(false)} className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <X size={15} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">From</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    max={customTo || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">To</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                    min={customFrom || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none" />
                </div>
              </div>
            </div>
            <button
              disabled={!customFrom || !customTo}
              onClick={() => {
                setRange('custom');
                setCustomLabel(`${fmtD(customFrom)} – ${fmtD(customTo)}`);
                setShowCustomSheet(false);
              }}
              className={`w-full py-3.5 rounded-xl text-[14px] font-bold transition-all ${customFrom && customTo ? 'dt-btn-primary' : 'bg-[#E5E7EB] text-[#99A1AF] cursor-not-allowed'}`}
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
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
          <button onClick={() => setShow1(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1360D2]">
            {show1 ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="relative">
          <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1360D2]" />
          <input value={pw2} onChange={e => setPw2(e.target.value)}
            type={show2 ? 'text' : 'password'} placeholder="Confirm new password"
            className="w-full bg-white border-[1.5px] border-[#E7EBF2] hover:border-[#1360D2]/50 focus:border-[#1360D2] focus:ring-4 focus:ring-[#1360D2]/15 rounded-2xl pl-12 pr-12 py-4 text-[15px] text-[#0E1B3D] placeholder:text-[#6B7280] outline-none transition-all" />
          <button onClick={() => setShow2(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1360D2]">
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

/* ---------- CHANGE PASSWORD (from profile) ---------- */
function ChangePassword({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && newPw !== confirm;
  const canSubmit = current.length > 0 && newPw.length >= 6 && newPw === confirm;

  if (done) {
    return (
      <div className="bg-[#F2F5FB] flex flex-col items-center justify-center px-6" style={{ height: '100%' }}>
        <div className="w-full max-w-sm flex flex-col items-center text-center gap-6">
          <div className="size-28 rounded-full bg-[#D1FAE5] flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.25)]">
            <div className="size-20 rounded-full bg-[#A7F3D0] flex items-center justify-center">
              <Check size={40} className="text-[#059669]" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="text-[#1E2939] font-bold text-[24px] mb-2">Password Updated!</div>
            <div className="text-[#6A7282] text-[15px] leading-relaxed">Your password has been changed successfully.</div>
          </div>
          <button onClick={onSuccess} className="w-full dt-btn-primary text-white rounded-2xl py-4 font-bold text-[15px] uppercase">
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F2F5FB] flex flex-col" style={{ height: '100%' }}>
      <div className="bg-[#1E2D4D] dt-safe-top flex items-center gap-3 px-5 py-4 shadow-lg shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
          <ChevronLeft size={20} />
        </button>
        <div>
          <div className="text-white font-bold text-xl">Reset Password</div>
          <div className="text-white/60 text-xs">Change your account password</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-5 pb-8">
          <div className="bg-[#EAF1FE] rounded-2xl px-4 py-3 flex items-start gap-3">
            <Info size={16} className="text-[#1360D2] shrink-0 mt-0.5" />
            <p className="text-[#1360D2] text-[13px] leading-relaxed">Your new password must be at least 6 characters long.</p>
          </div>

          {/* Current password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#364153] mb-2">Current Password</label>
            <div className="relative">
              <Key size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1360D2]" />
              <input
                value={current} onChange={e => setCurrent(e.target.value)}
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                className="w-full bg-white border border-[#E0EAFB] focus:border-[#1360D2] focus:ring-4 focus:ring-[#1360D2]/10 rounded-2xl pl-11 pr-12 py-4 text-[14px] text-[#1E2939] placeholder:text-[#99A1AF] outline-none transition-all shadow-sm"
              />
              <button onClick={() => setShowCurrent(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6A7282] hover:text-[#1360D2]">
                {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#364153] mb-2">New Password</label>
            <div className="relative">
              <Key size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1360D2]" />
              <input
                value={newPw} onChange={e => setNewPw(e.target.value)}
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                className="w-full bg-white border border-[#E0EAFB] focus:border-[#1360D2] focus:ring-4 focus:ring-[#1360D2]/10 rounded-2xl pl-11 pr-12 py-4 text-[14px] text-[#1E2939] placeholder:text-[#99A1AF] outline-none transition-all shadow-sm"
              />
              <button onClick={() => setShowNew(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6A7282] hover:text-[#1360D2]">
                {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {newPw.length > 0 && newPw.length < 6 && (
              <p className="text-red-500 text-[12px] mt-1.5 ml-1">At least 6 characters required</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#364153] mb-2">Confirm New Password</label>
            <div className="relative">
              <Key size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1360D2]" />
              <input
                value={confirm} onChange={e => setConfirm(e.target.value)}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                className={`w-full bg-white border focus:ring-4 rounded-2xl pl-11 pr-12 py-4 text-[14px] text-[#1E2939] placeholder:text-[#99A1AF] outline-none transition-all shadow-sm ${
                  mismatch ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-[#E0EAFB] focus:border-[#1360D2] focus:ring-[#1360D2]/10'
                }`}
              />
              <button onClick={() => setShowConfirm(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6A7282] hover:text-[#1360D2]">
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {mismatch && <p className="text-red-500 text-[12px] mt-1.5 ml-1">Passwords do not match</p>}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-5 pb-6 pt-3 bg-[#F2F5FB] border-t border-gray-100">
        <button
          onClick={() => canSubmit && setDone(true)}
          disabled={!canSubmit}
          className={`w-full rounded-2xl py-4 font-bold text-[15px] uppercase transition-all ${
            canSubmit ? 'dt-btn-primary text-white' : 'bg-[#e5e7eb] text-[#99a1af] cursor-not-allowed'
          }`}
        >
          Update Password
        </button>
      </div>
    </div>
  );
}

/* ---------- PASSWORD RESET SUCCESS POPUP ---------- */
function PasswordResetSuccess({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(7, 16, 38, 0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
      <div className="dt-pop relative w-full max-w-sm bg-white rounded-[28px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(7,16,38,0.55)]">
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
          <div className="text-xs font-bold text-gray-500 mb-2">TODAY</div>
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
                <span className="text-xs text-gray-500">4h ago</span>
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
              <div className="text-xs text-gray-500 mt-2">5h ago</div>
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-500 mb-2">YESTERDAY</div>
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
                  <div className="text-xs text-gray-500 mt-2">Yesterday</div>
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
                    <div className={`mt-1.5 text-xs flex items-center gap-1.5 ${g.status === 'Active' ? 'text-emerald-500' : 'text-gray-500'}`}>
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
function CargoManagement({ onBack, onInvoiceDownload, onGatePass }:
  { onBack: () => void; onInvoiceDownload: () => void; onGatePass: () => void }) {
  const items = [
    { icon: MapPin, title: 'Gate Pass', desc: 'Manage and track gate passes', onClick: onGatePass },
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
            <div className="text-sm text-white/70">5 available</div>
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

/* ---------- TLUC PAYMENTS — list of vessels available to pay ---------- */
type Stuffing = 'TOWN/FREE ZONE' | 'FREE ZONE' | 'TOWN';

type StuffingAlloc = { stuffing: Stuffing; qty: number };

type TlucContainer = {
  type: string;
  totalQty: number;
  paidQty: number;
  pending: number;
  /** Multiple stuffing allocations — sum of qty <= pending */
  paying: StuffingAlloc[];
  /** Token Paying For dropdown — number of tokens user pays for */
  tokenPayingFor: number;
};

type TlucRecord = {
  dpwRef: string;
  agentRef: string;
  requestType: string;
  brnDate: string;
  expiryDate: string;
  shipper: string;
  reqQty: number;
  status: 'Partially Paid' | 'Unpaid';
  details: {
    agent: string;
    line: string;
    instructionType: string;
    destinationPort: string;
    dischargePort: string;
    rotationVessel: string;
    loadCutOffDate: string;
    receiveTerminal: string;
    stuffingLocation: string;
    haulier: string;
  };
  containers: TlucContainer[];
};

function TlucPayments({ onBack }: { onBack: () => void }) {
  const initialRecords: TlucRecord[] = [
    {
      dpwRef: '5021359', agentRef: '600089631', requestType: 'EXPORT FULL',
      brnDate: '20-May-25', expiryDate: '20-May-26 10:30', shipper: 'F7100 SONY GULF FZE',
      reqQty: 4, status: 'Partially Paid',
      details: {
        agent: 'A180 - MAERSK KANOO UAE LLC', line: 'MSK - MAERSK LINE',
        instructionType: 'EXPORT FULL DEPOSIT - WITH EMPTY DELIVERY',
        destinationPort: 'AEJED - JEBEL DHANNA', dischargePort: 'KWJBD - JEBEL DHANA',
        rotationVessel: '825615 - ALBERT MAERSK',
        loadCutOffDate: '20-May-26 10:30', receiveTerminal: 'T2 - TERMINAL TWO',
        stuffingLocation: 'FREE ZONE', haulier: 'H00101 - Red Arrow Transportation (LLC)',
      },
      containers: [
        { type: 'AS [AS] - 20', totalQty: 2, paidQty: 0, pending: 2, paying: [{ stuffing: 'TOWN/FREE ZONE', qty: 2 }], tokenPayingFor: 2 },
        { type: 'GP [GP] - 40', totalQty: 2, paidQty: 0, pending: 2, paying: [{ stuffing: 'FREE ZONE',      qty: 2 }], tokenPayingFor: 2 },
      ],
    },
    {
      dpwRef: '5019641', agentRef: 'ARPMNONDUBALTOW', requestType: 'Summary',
      brnDate: '23-Dec-25', expiryDate: '23-Dec-25 11:59', shipper: 'F7100 SONY GULF FZE',
      reqQty: 6, status: 'Partially Paid',
      details: {
        agent: 'A180 - MAERSK KANOO UAE LLC', line: 'MSK - MAERSK LINE', instructionType: 'EXPORT FULL DEPOSIT',
        destinationPort: 'AEJEA - JEBEL ALI', dischargePort: 'AEDXB - DUBAI',
        rotationVessel: '825120 - ALBERT MAERSK',
        loadCutOffDate: '23-Dec-25 11:59', receiveTerminal: 'T1 - TERMINAL ONE',
        stuffingLocation: 'TOWN', haulier: 'H00101 - Red Arrow Transportation (LLC)',
      },
      containers: [
        { type: 'GP [GP] - 20', totalQty: 4, paidQty: 1, pending: 3, paying: [{ stuffing: 'TOWN', qty: 3 }],            tokenPayingFor: 3 },
        { type: 'HC [HC] - 40', totalQty: 2, paidQty: 0, pending: 2, paying: [{ stuffing: 'TOWN/FREE ZONE', qty: 1 }], tokenPayingFor: 1 },
      ],
    },
    {
      dpwRef: '5019643', agentRef: 'ARPMNONDUBALTOW', requestType: 'Summary',
      brnDate: '24-Dec-25', expiryDate: '24-Dec-25 11:59', shipper: 'F7100 SONY GULF FZE',
      reqQty: 3, status: 'Unpaid',
      details: {
        agent: 'A180 - MAERSK KANOO UAE LLC', line: 'MSK - MAERSK LINE', instructionType: 'EXPORT FULL DEPOSIT',
        destinationPort: 'AEJEA - JEBEL ALI', dischargePort: 'AEDXB - DUBAI',
        rotationVessel: '825120 - ALBERT MAERSK',
        loadCutOffDate: '24-Dec-25 11:59', receiveTerminal: 'T2 - TERMINAL TWO',
        stuffingLocation: 'FREE ZONE', haulier: 'H00101 - Red Arrow Transportation (LLC)',
      },
      containers: [
        { type: 'GP [GP] - 20', totalQty: 3, paidQty: 0, pending: 3, paying: [{ stuffing: 'FREE ZONE', qty: 3 }], tokenPayingFor: 3 },
      ],
    },
  ];
  const [records, setRecords] = useState<TlucRecord[]>(initialRecords);
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'dpw'|'container'>('dpw');
  const [statusFilter, setStatusFilter] = useState<'all'|'Partially Paid'|'Unpaid'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showBrnFor, setShowBrnFor] = useState<string | null>(null);
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  const [payingRecords, setPayingRecords] = useState<TlucRecord[] | null>(null);
  const [brnFlyoutFor, setBrnFlyoutFor] = useState<TlucRecord | null>(null);
  const [billingFlyoutFor, setBillingFlyoutFor] = useState<TlucRecord | null>(null);

  const toggleSelected = (dpwRef: string) => {
    setSelectedRefs(prev => {
      const next = new Set(prev);
      if (next.has(dpwRef)) next.delete(dpwRef); else next.add(dpwRef);
      return next;
    });
  };

  const ranges = [
    { k: '7d',  label: 'Last 7 days' },
    { k: '30d', label: 'Last 30 days' },
    { k: '90d', label: 'Last 90 days' },
    { k: 'custom', label: 'Custom range' },
  ] as const;
  type RangeKey = typeof ranges[number]['k'];
  const [range, setRange] = useState<RangeKey>('7d');
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [showCustomSheet, setShowCustomSheet] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const fmtDateTluc = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(d)} ${months[parseInt(m)-1]}`;
  };

  const currentLabel = range === 'custom' && customLabel ? customLabel : (ranges.find(r => r.k === range)?.label ?? '');

  // ---------- Billing model ----------
  // Each container generates 3 tariff lines per the DP World billing calculation.
  type BillingLine = {
    stuffing: string; tariff: string; contrType: string;
    noOfContrs: number; rate: number; gross: number;
    net: number; vatPct: number; vatAmt: number; total: number;
  };
  const tariffs = [
    { code: 'TLUC',  desc: 'TLUC - TRUCK LOADING / UNLOADING',     unit: 314 },
    { code: 'TOKEN', desc: 'TOKEN PROCESSING CHARGE - ONLINE',      unit:  50 },
    { code: 'WEIGH', desc: 'WEIGHING CONTAINERS ENTERING/LEAVING',  unit:  65 },
  ];
  const containerPayingQty = (c: TlucContainer) => c.paying.reduce((s, a) => s + a.qty, 0);

  const computeBillingLines = (r: TlucRecord): BillingLine[] => {
    const lines: BillingLine[] = [];
    r.containers.forEach(c => {
      c.paying.forEach(alloc => {
        if (alloc.qty <= 0) return;
        // TLUC + Weighing lines tied to container allocation
        tariffs.slice(0, 1).concat(tariffs.slice(2)).forEach(t => {
          const gross = alloc.qty * t.unit;
          lines.push({
            stuffing: alloc.stuffing, tariff: t.desc, contrType: c.type,
            noOfContrs: alloc.qty, rate: t.unit, gross, net: gross,
            vatPct: 0, vatAmt: 0, total: gross,
          });
        });
      });
      // Token Processing line (uses tokenPayingFor)
      if (c.tokenPayingFor > 0) {
        const t = tariffs[1];
        const gross = c.tokenPayingFor * t.unit;
        lines.push({
          stuffing: c.paying[0]?.stuffing ?? 'FREE ZONE',
          tariff: t.desc, contrType: c.type,
          noOfContrs: c.tokenPayingFor, rate: t.unit, gross, net: gross,
          vatPct: 0, vatAmt: 0, total: gross,
        });
      }
    });
    return lines;
  };

  // Live "pending" totals (used inline as a hint; not authoritative until computed)
  const recordLiveTotal = (r: TlucRecord) => {
    return r.containers.reduce((acc, c) => {
      const qty = containerPayingQty(c);
      if (qty <= 0 && c.tokenPayingFor <= 0) return acc;
      const containerGross = qty * (tariffs[0].unit + tariffs[2].unit) + c.tokenPayingFor * tariffs[1].unit;
      return { total: acc.total + containerGross, payingQty: acc.payingQty + qty };
    }, { total: 0, payingQty: 0 });
  };

  // ---------- Committed (computed) state ----------
  type Committed = { lines: BillingLine[]; total: number; payingQty: number };
  const [committed, setCommitted] = useState<Record<string, Committed>>(() => {
    // Pre-compute for the initial dataset so cards show stored totals on first load.
    const seed: Record<string, Committed> = {};
    initialRecords.forEach(r => {
      const lines = computeBillingLines(r);
      seed[r.dpwRef] = {
        lines,
        total: lines.reduce((s, l) => s + l.total, 0),
        payingQty: r.containers.reduce((s, c) => s + c.paying.reduce((q, a) => q + a.qty, 0), 0),
      };
    });
    return seed;
  });
  const [dirtyRefs, setDirtyRefs] = useState<Set<string>>(new Set());

  const computeCharges = (dpwRef: string) => {
    const r = records.find(x => x.dpwRef === dpwRef);
    if (!r) return;
    const lines = computeBillingLines(r);
    const total = lines.reduce((s, l) => s + l.total, 0);
    const payingQty = r.containers.reduce((s, c) => s + containerPayingQty(c), 0);
    setCommitted(c => ({ ...c, [dpwRef]: { lines, total, payingQty } }));
    setDirtyRefs(d => { const n = new Set(d); n.delete(dpwRef); return n; });
  };

  // Totals as returned to the rest of the UI — uses last committed value when available.
  const recordTotals = (r: TlucRecord) => {
    const live = recordLiveTotal(r);
    const c = committed[r.dpwRef];
    if (c && !dirtyRefs.has(r.dpwRef)) {
      return { amount: c.total, vat: 0, total: c.total, payingQty: c.payingQty };
    }
    return { amount: live.total, vat: 0, total: live.total, payingQty: live.payingQty };
  };
  const containerRowTotals = (c: TlucContainer) => {
    const qty = containerPayingQty(c);
    const total = qty * (tariffs[0].unit + tariffs[2].unit) + c.tokenPayingFor * tariffs[1].unit;
    return { amount: total, vat: 0, total };
  };

  const updateContainer = (dpwRef: string, idx: number, patch: Partial<TlucContainer>) => {
    setRecords(rs => rs.map(r => r.dpwRef !== dpwRef ? r : {
      ...r,
      containers: r.containers.map((c, i) => i === idx ? { ...c, ...patch } : c),
    }));
    setDirtyRefs(d => { const n = new Set(d); n.add(dpwRef); return n; });
  };

  // Allocation editors
  const setAllocation = (dpwRef: string, cIdx: number, aIdx: number, patch: Partial<StuffingAlloc>) => {
    setRecords(rs => rs.map(r => r.dpwRef !== dpwRef ? r : {
      ...r,
      containers: r.containers.map((c, i) => i !== cIdx ? c : {
        ...c,
        paying: c.paying.map((a, j) => j === aIdx ? { ...a, ...patch } : a),
      }),
    }));
    setDirtyRefs(d => { const n = new Set(d); n.add(dpwRef); return n; });
  };
  const addAllocation = (dpwRef: string, cIdx: number) => {
    setRecords(rs => rs.map(r => r.dpwRef !== dpwRef ? r : {
      ...r,
      containers: r.containers.map((c, i) => i !== cIdx ? c : {
        ...c,
        paying: [...c.paying, { stuffing: 'FREE ZONE', qty: 0 }],
      }),
    }));
    setDirtyRefs(d => { const n = new Set(d); n.add(dpwRef); return n; });
  };
  const removeAllocation = (dpwRef: string, cIdx: number, aIdx: number) => {
    setRecords(rs => rs.map(r => r.dpwRef !== dpwRef ? r : {
      ...r,
      containers: r.containers.map((c, i) => i !== cIdx ? c : {
        ...c,
        paying: c.paying.filter((_, j) => j !== aIdx),
      }),
    }));
    setDirtyRefs(d => { const n = new Set(d); n.add(dpwRef); return n; });
  };

  const isFiltered = !!query || statusFilter !== 'all' || range !== '7d';
  const filtered = records.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    if (searchMode === 'dpw') return r.dpwRef.toLowerCase().includes(q) || r.agentRef.toLowerCase().includes(q);
    return r.containers.some(c => c.type.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-full flex flex-col"
      style={{
        background:
          'radial-gradient(circle at 18% 0%, rgba(199,216,244,0.55) 0%, transparent 50%),' +
          'radial-gradient(circle at 88% 14%, rgba(180,210,255,0.45) 0%, transparent 50%),' +
          'linear-gradient(180deg, #F4F7FE 0%, #FFFFFF 60%, #F4F7FE 100%)',
      }}>
      {/* Hero header */}
      <div className="relative dt-safe-top px-5 pt-3 pb-20 text-white"
        style={{ background: 'linear-gradient(160deg, #0A1A3D 0%, #0E1B3D 50%, #14306E 100%)' }}>
        <div className="absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
        <div className="absolute -bottom-20 -left-10 w-[260px] h-[260px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#478CF7' }} />
        <div className="relative flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-white/20">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Payments</div>
            <div className="text-[18px] font-bold leading-tight">TLUC Payments</div>
          </div>
        </div>
        {/* Search mode tags + range picker row */}
        <div className="relative mt-5 flex items-center gap-2">
          <button onClick={() => { setSearchMode('dpw'); setQuery(''); }}
            className={`flex-1 h-8 rounded-full text-[12px] font-bold border transition-all ${searchMode === 'dpw' ? 'bg-white text-[#1360D2] border-white' : 'bg-white/15 text-white/80 border-white/25'}`}>
            DPW Reference
          </button>
          <button onClick={() => { setSearchMode('container'); setQuery(''); }}
            className={`flex-1 h-8 rounded-full text-[12px] font-bold border transition-all ${searchMode === 'container' ? 'bg-white text-[#1360D2] border-white' : 'bg-white/15 text-white/80 border-white/25'}`}>
            Container No.
          </button>
          <div className="flex-1 relative flex justify-end">
            <button onClick={() => setShowRangePicker(s => !s)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white/15 border border-white/25 text-[11px] font-bold text-white whitespace-nowrap">
              <Calendar size={11} />
              {currentLabel}
              <ChevronRight size={11} className={`transition-transform ${showRangePicker ? '-rotate-90' : 'rotate-90'}`} />
            </button>
            {showRangePicker && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[200px] bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_22px_44px_-12px_rgba(14,27,61,0.3)] overflow-hidden">
                {ranges.map(r => {
                  const active = r.k === range;
                  return (
                    <button key={r.k}
                      onClick={() => {
                        if (r.k === 'custom') { setShowRangePicker(false); setShowCustomSheet(true); }
                        else { setRange(r.k); setShowRangePicker(false); }
                      }}
                      className={`w-full text-left px-4 py-3 text-[13px] font-semibold flex items-center justify-between ${active ? 'bg-[#EAF1FE] text-[#1360D2]' : 'text-[#0E1B3D] hover:bg-[#F4F7FE]'}`}>
                      {r.label}
                      {active && <Check size={14} strokeWidth={3} className="text-[#1360D2]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search bar — floating, overlaps header */}
      <div className="px-5 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E0EAFB] shadow-[0_18px_36px_-18px_rgba(14,27,61,0.28)] p-2 flex items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99A1AF]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={searchMode === 'dpw' ? 'Search by DPW reference number' : 'Search by container number'}
              className="w-full bg-transparent pl-9 pr-3 py-2.5 text-[13.5px] text-[#0E1B3D] placeholder:text-[#99A1AF] outline-none" />
          </div>
          {query && (
            <button onClick={() => setQuery('')}
              className="w-7 h-7 rounded-full bg-[#F4F7FE] flex items-center justify-center text-[#6B7280] mr-1">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Status filter chips */}
      <div className="px-5 pt-3 flex items-center gap-1.5 flex-wrap">
        {(['all', 'Partially Paid', 'Unpaid'] as const).map(s => {
          const active = statusFilter === s;
          const label = s === 'all' ? 'All' : s;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`h-8 px-3.5 rounded-full text-[11.5px] font-bold whitespace-nowrap transition border ${
                active
                  ? 'bg-[#1360D2] border-transparent text-white shadow-[0_6px_14px_-8px_rgba(19,96,210,0.6)]'
                  : 'bg-white border-[#E0EAFB] text-[#0E1B3D]'}`}>
              {label}
            </button>
          );
        })}
      </div>

      <div className="px-5 pt-4 pb-10 flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-wider text-[#0E47A6] font-bold">BRN records</div>
          <div className="text-[11px] text-[#6B7280]">
            {isFiltered
              ? `${filtered.length} match${filtered.length !== 1 ? 'es' : ''}`
              : `${filtered.length} record${filtered.length !== 1 ? 's' : ''} available`}
          </div>
        </div>

        {filtered.map(r => {
          const isSelected = selectedRefs.has(r.dpwRef);
          const statusStyle = r.status === 'Partially Paid'
            ? { bg: '#FFF7ED', border: '#FFD6A8', fg: '#D26A24', dot: '#F59E0B' }
            : { bg: '#FEECEC', border: '#F5B5AA', fg: '#B42318', dot: '#EF4444' };
          return (
            <div key={r.dpwRef}
              className={`bg-white rounded-2xl border overflow-hidden transition ${isSelected ? 'border-[#1360D2] shadow-[0_10px_24px_-14px_rgba(19,96,210,0.45)] ring-4 ring-[#1360D2]/8' : 'border-[#EAF0FA] shadow-[0_8px_18px_-14px_rgba(14,27,61,0.18)]'}`}>
              {/* Card header */}
              <div className="p-4 flex items-center gap-3">
                <label className="flex items-center cursor-pointer shrink-0" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={isSelected}
                    onChange={() => toggleSelected(r.dpwRef)}
                    className="w-5 h-5 rounded-md border-[#D0D5DD] accent-[#1360D2]" />
                </label>
                <button onClick={() => toggleSelected(r.dpwRef)}
                  className="flex-1 flex items-center gap-3 text-left min-w-0">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-[#1360D2]"
                    style={{ background: 'linear-gradient(135deg, #EAF1FE, #DCE7FB)' }}>
                    <Ship size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">DPW Ref</span>
                      <span className="text-[15px] font-bold text-[#0E1B3D]">{r.dpwRef}</span>
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#6B7280] truncate">
                      Agent <span className="text-[#33455F] font-semibold">{r.agentRef}</span> · {r.requestType}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider"
                      style={{ background: statusStyle.bg, color: statusStyle.fg, border: `1px solid ${statusStyle.border}` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusStyle.dot }} />
                      {r.status}
                    </span>
                  </div>
                </button>
              </div>

              {/* Compact summary grid — DPW info only, no payment numbers */}
              <div className="px-4 pb-3 grid grid-cols-2 gap-2 text-[11px]">
                <SummaryCell label="BRN Date"    value={r.brnDate} />
                <SummaryCell label="Expiry Date" value={r.expiryDate} />
                <SummaryCell label="Shipper"     value={r.shipper} />
                <SummaryCell label="Request"     value={r.requestType} />
              </div>
              <button onClick={() => setBrnFlyoutFor(r)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-[#F3F4F6] text-[12px] font-semibold text-[#1360D2] hover:bg-[#F4F7FE]">
                <Info size={13} /> View BRN details
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#EAF0FA] py-10 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF1FE] mx-auto flex items-center justify-center text-[#1360D2]">
              <Ship size={20} />
            </div>
            <div className="mt-3 text-[13.5px] font-bold text-[#0E1B3D]">No records found</div>
            <div className="mt-1 text-[12px] text-[#6B7280]">Try a different search term or date range.</div>
          </div>
        )}
      </div>

      {/* Sticky proceed bar */}
      {selectedRefs.size > 0 && !payingRecords && (() => {
        const selectedRecords = records.filter(r => selectedRefs.has(r.dpwRef));
        return (
          <div className="sticky -bottom-6 left-0 right-0 z-30 mt-auto bg-white border-t border-gray-200 shadow-[0_-6px_18px_-12px_rgba(14,27,61,0.18)] px-5 pt-3 pb-9 flex items-center gap-3">
            <div className="flex-1 text-[12.5px] font-semibold text-[#0E1B3D]">
              {selectedRefs.size} record{selectedRefs.size !== 1 ? 's' : ''} selected
            </div>
            <button onClick={() => setPayingRecords(selectedRecords)}
              className="dt-btn-primary text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-wide text-[12.5px] flex items-center gap-1.5">
              Proceed <ArrowRight size={14} />
            </button>
          </div>
        );
      })()}

      {payingRecords && (() => {
        // Resolve up-to-date records by ref from latest state (so edits inside the wizard re-render with fresh totals)
        const liveRecords = payingRecords.map(p => records.find(r => r.dpwRef === p.dpwRef) ?? p);
        const liveTotals = liveRecords.reduce((acc, r) => {
          const t = recordTotals(r);
          return { amount: acc.amount + t.amount, vat: acc.vat + t.vat, total: acc.total + t.total, payingQty: acc.payingQty + t.payingQty };
        }, { amount: 0, vat: 0, total: 0, payingQty: 0 });
        return (
          <TlucPaymentSheet records={liveRecords}
            totals={liveTotals}
            updateContainer={updateContainer}
            containerRowTotals={containerRowTotals}
            recordTotals={recordTotals}
            committed={committed}
            isDirty={(dpwRef: string) => dirtyRefs.has(dpwRef)}
            onCompute={computeCharges}
            setAllocation={setAllocation}
            addAllocation={addAllocation}
            removeAllocation={removeAllocation}
            onShowBrn={(r) => setBrnFlyoutFor(r)}
            onShowBilling={(r) => setBillingFlyoutFor(r)}
            onClose={() => setPayingRecords(null)}
            onPaid={() => {
              const paidRefs = new Set(liveRecords.map(r => r.dpwRef));
              setSelectedRefs(prev => { const n = new Set(prev); paidRefs.forEach(ref => n.delete(ref)); return n; });
              setPayingRecords(null);
            }} />
        );
      })()}

      {/* BRN details flyout — rendered after wizard so it stacks on top */}
      {brnFlyoutFor && (
        <div className="absolute inset-0 z-[60]">
          <BottomSheet title={`BRN details · ${brnFlyoutFor.dpwRef}`} onClose={() => setBrnFlyoutFor(null)}>
            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
              <BrnField label="Agent"            value={brnFlyoutFor.details.agent} />
              <BrnField label="Line"             value={brnFlyoutFor.details.line} />
              <BrnField label="Instruction Type" value={brnFlyoutFor.details.instructionType} full />
              <BrnField label="Destination Port" value={brnFlyoutFor.details.destinationPort} />
              <BrnField label="Discharge Port"   value={brnFlyoutFor.details.dischargePort} />
              <BrnField label="Rotation/Vessel"  value={brnFlyoutFor.details.rotationVessel} />
              <BrnField label="Expiry Date"      value={brnFlyoutFor.expiryDate} />
              <BrnField label="Load Cut Off"     value={brnFlyoutFor.details.loadCutOffDate} />
              <BrnField label="Receive Terminal" value={brnFlyoutFor.details.receiveTerminal} />
              <BrnField label="Stuffing"         value={brnFlyoutFor.details.stuffingLocation} />
              <BrnField label="Shipper"          value={brnFlyoutFor.shipper} />
              <BrnField label="Haulier"          value={brnFlyoutFor.details.haulier} full />
            </div>
          </BottomSheet>
        </div>
      )}

      {billingFlyoutFor && committed[billingFlyoutFor.dpwRef] && (
        <div className="absolute inset-0 z-[60]">
          <BottomSheet title={`Billing calculation · ${billingFlyoutFor.dpwRef}`} onClose={() => setBillingFlyoutFor(null)}>
            <BillingCalculationTable
              lines={committed[billingFlyoutFor.dpwRef].lines}
              total={committed[billingFlyoutFor.dpwRef].total} />
          </BottomSheet>
        </div>
      )}

      {/* Custom date range bottom sheet */}
      {showCustomSheet && (
        <div className="absolute inset-0 bg-[#0E1B3D]/55 flex items-end z-50" onClick={() => setShowCustomSheet(false)}>
          <div className="bg-white w-full rounded-t-3xl shadow-2xl px-5 pt-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-[#D1D5DB] mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <p className="text-[17px] font-bold text-[#0E1B3D]">Custom Range</p>
              <button onClick={() => setShowCustomSheet(false)} className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <X size={15} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">From</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    max={customTo || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5 block">To</label>
                <div className="flex items-center gap-2 border border-[#E0EAFB] rounded-xl px-4 py-3 bg-[#F8FAFF]">
                  <Calendar size={15} className="text-[#1360D2] shrink-0" />
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                    min={customFrom || undefined}
                    className="flex-1 bg-transparent text-[14px] text-[#0E1B3D] outline-none" />
                </div>
              </div>
            </div>
            <button
              disabled={!customFrom || !customTo}
              onClick={() => {
                setRange('custom');
                setCustomLabel(`${fmtDateTluc(customFrom)} – ${fmtDateTluc(customTo)}`);
                setShowCustomSheet(false);
              }}
              className={`w-full py-3.5 rounded-xl text-[14px] font-bold transition-all ${customFrom && customTo ? 'dt-btn-primary' : 'bg-[#E5E7EB] text-[#99A1AF] cursor-not-allowed'}`}
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-2.5 py-2 ${highlight ? 'bg-[#EAF1FE]' : 'bg-[#F4F7FE]'}`}>
      <div className="text-[9.5px] uppercase tracking-wider text-[#6B7280] font-bold">{label}</div>
      <div className={`text-[12px] font-bold mt-0.5 ${highlight ? 'text-[#0E47A6]' : 'text-[#0E1B3D]'}`}>{value}</div>
    </div>
  );
}

function BrnField({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`min-w-0 ${full ? 'col-span-2' : ''}`}>
      <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">{label}</div>
      <div className="text-[12.5px] font-semibold text-[#33455F] mt-0.5 break-words">{value}</div>
    </div>
  );
}

function SummaryLine({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[12.5px] ${bold ? 'font-bold text-[#0E1B3D]' : 'text-[#4A5565]'}`}>{label}</span>
      <span className={`flex items-center gap-0.5 ${bold ? 'text-[15px] font-bold text-[#0E47A6]' : 'text-[13px] font-semibold text-[#0E1B3D]'}`}>
        <Dh /> {value.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}

/* ---------- Billing Calculation table (per-DPW breakdown) ---------- */
function BillingCalculationTable({ lines, total }: { lines: BillingLine[]; total: number }) {
  return (
    <div className="mt-2 rounded-2xl border border-[#E0EAFB] overflow-hidden">
      <div className="bg-[#6B7280] text-white px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider">
        Billing calculation
      </div>
      <div className="bg-white divide-y divide-[#F3F4F6]">
        {lines.map((l, i) => (
          <div key={i} className="px-3 py-2.5 grid grid-cols-2 gap-2 text-[11.5px]">
            <div className="col-span-2 flex items-center justify-between">
              <span className="font-bold text-[#0E1B3D] truncate">{l.tariff}</span>
              <span className="text-[#0E47A6] font-bold">AED {l.total.toLocaleString('en-AE')}</span>
            </div>
            <div className="text-[#6B7280]">Stuffing: <span className="text-[#33455F] font-semibold">{l.stuffing}</span></div>
            <div className="text-[#6B7280] text-right">Type: <span className="text-[#33455F] font-semibold">{l.contrType}</span></div>
            <div className="text-[#6B7280]">No of Contrs: <span className="text-[#33455F] font-semibold">{l.noOfContrs}</span></div>
            <div className="text-[#6B7280] text-right">Rate: <span className="text-[#33455F] font-semibold">{l.rate}</span></div>
            <div className="text-[#6B7280]">Gross: <span className="text-[#33455F] font-semibold">{l.gross}</span></div>
            <div className="text-[#6B7280] text-right">Net: <span className="text-[#33455F] font-semibold">{l.net}</span></div>
            <div className="text-[#6B7280]">VAT: <span className="text-[#33455F] font-semibold">{l.vatPct}% ({l.vatAmt})</span></div>
          </div>
        ))}
        <div className="bg-[#F4F7FE] px-3 py-2.5 flex items-center justify-between">
          <span className="text-[12px] font-bold text-[#0E1B3D]">Total</span>
          <span className="text-[14px] font-bold text-[#0E47A6]">AED {total.toLocaleString('en-AE')}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- TLUC PAYMENT METHOD BOTTOM SHEET ---------- */
type BillingLine = {
  stuffing: string; tariff: string; contrType: string;
  noOfContrs: number; rate: number; gross: number;
  net: number; vatPct: number; vatAmt: number; total: number;
};

function TlucPaymentSheet({ records, totals, updateContainer, containerRowTotals, recordTotals, committed, isDirty, onCompute,
  setAllocation, addAllocation, removeAllocation,
  onShowBrn, onShowBilling,
  onClose, onPaid }:
  { records: TlucRecord[];
    totals: { amount: number; vat: number; total: number; payingQty: number };
    updateContainer: (dpwRef: string, idx: number, patch: Partial<TlucContainer>) => void;
    containerRowTotals: (c: TlucContainer) => { amount: number; vat: number; total: number };
    recordTotals: (r: TlucRecord) => { amount: number; vat: number; total: number; payingQty: number };
    committed: Record<string, { lines: BillingLine[]; total: number; payingQty: number }>;
    isDirty: (dpwRef: string) => boolean;
    onCompute: (dpwRef: string) => void;
    setAllocation: (dpwRef: string, cIdx: number, aIdx: number, patch: Partial<StuffingAlloc>) => void;
    addAllocation: (dpwRef: string, cIdx: number) => void;
    removeAllocation: (dpwRef: string, cIdx: number, aIdx: number) => void;
    onShowBrn: (r: TlucRecord) => void;
    onShowBilling: (r: TlucRecord) => void;
    onClose: () => void;
    onPaid?: () => void }) {
  const [method, setMethod] = useState<'applepay'|'rosoom'|'advance'>('applepay');
  const [paid, setPaid] = useState(false);
  // Step layout: [overview]? + N reviews + payment
  const hasOverview = records.length > 1;
  const [step, setStep] = useState(0);
  const reviewStartIdx = hasOverview ? 1 : 0;
  const paymentStepIdx = reviewStartIdx + records.length;
  const totalSteps = paymentStepIdx + 1;
  const isOverviewStep = hasOverview && step === 0;
  const isPaymentStep = step === paymentStepIdx;
  const reviewIdx = isOverviewStep || isPaymentStep ? -1 : step - reviewStartIdx;
  const refsLabel = records.length === 1
    ? records[0].dpwRef
    : `${records.length} DPW references`;

  if (paid) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center px-5"
        style={{ background: 'rgba(7, 16, 38, 0.55)', backdropFilter: 'blur(6px)' }}>
        <div className="dt-pop relative w-full max-w-sm bg-white rounded-[28px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(7,16,38,0.55)] p-6 text-center">
          <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_10px_24px_-8px_rgba(15,143,106,0.55)]"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #0F8F6A 100%)' }}>
            <CheckCircle2 size={28} strokeWidth={2.5} />
          </div>
          <div className="mt-3 text-[20px] font-bold text-[#0E1B3D]">Payment successful</div>
          <div className="mt-1.5 text-[13.5px] text-[#4A5565] leading-relaxed">
            <Dh /> {totals.total.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} paid for <span className="font-bold text-[#0E1B3D]">{refsLabel}</span>.
          </div>
          <button onClick={() => { onPaid?.(); onClose(); }}
            className="dt-btn-primary w-full mt-5 text-white py-3.5 rounded-2xl font-bold uppercase tracking-wide text-[13px]">
            Done
          </button>
        </div>
      </div>
    );
  }

  // Wizard title — switches per step
  const sheetTitle = isOverviewStep
    ? 'Selected records'
    : isPaymentStep
    ? 'Confirm & pay'
    : `Amend record ${records.length > 1 ? `(${reviewIdx + 1} of ${records.length})` : ''}`;

  return (
    <div className="absolute z-50 bg-[#F4F7FE] flex flex-col"
      style={{ top: 0, left: 0, right: 0, bottom: -24 }}>
      {/* Header */}
      <div className="relative overflow-hidden dt-safe-top px-5 pt-3 pb-4 text-white shrink-0"
        style={{ background: 'linear-gradient(160deg, #0A1A3D 0%, #0E1B3D 50%, #14306E 100%)' }}>
        <div className="absolute -top-24 -right-16 w-[280px] h-[280px] rounded-full opacity-25 blur-3xl pointer-events-none" style={{ background: '#1360D2' }} />
        <div className="relative flex items-center gap-3">
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-white/20"
            aria-label="Close">
            <X size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">TLUC Payment</div>
            <div className="text-[17px] font-bold leading-tight truncate">{sheetTitle}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-3">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span key={i}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === step ? 22 : 6,
              background: i <= step ? '#1360D2' : '#D1D5DC',
            }} />
        ))}
        <div className="flex-1" />
        <div className="text-[10.5px] uppercase tracking-wider text-[#6B7280] font-bold">
          Step {step + 1} of {totalSteps}
        </div>
      </div>

      {isOverviewStep && (
        <div className="space-y-3">
          <div className="text-[12.5px] text-[#4A5565]">
            You're paying for <span className="font-bold text-[#0E1B3D]">{records.length}</span> records. Review the details below, then amend each record's containers.
          </div>
          <div className="space-y-2.5">
            {records.map((r, idx) => {
              const t = recordTotals(r);
              const statusStyle = r.status === 'Partially Paid'
                ? { bg: '#FFF7ED', border: '#FFD6A8', fg: '#D26A24', dot: '#F59E0B' }
                : { bg: '#FEECEC', border: '#F5B5AA', fg: '#B42318', dot: '#EF4444' };
              return (
                <div key={r.dpwRef} className="bg-white rounded-2xl border border-[#E0EAFB] overflow-hidden">
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">DPW Ref</div>
                        <div className="text-[14px] font-bold text-[#0E1B3D]">{r.dpwRef}</div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider shrink-0"
                        style={{ background: statusStyle.bg, color: statusStyle.fg, border: `1px solid ${statusStyle.border}` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusStyle.dot }} />
                        {r.status}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                      <div><span className="text-[#6B7280]">Agent · </span><span className="font-semibold text-[#33455F]">{r.agentRef}</span></div>
                      <div><span className="text-[#6B7280]">Type · </span><span className="font-semibold text-[#33455F]">{r.requestType}</span></div>
                      <div><span className="text-[#6B7280]">BRN · </span><span className="font-semibold text-[#33455F]">{r.brnDate}</span></div>
                      <div><span className="text-[#6B7280]">Req Qty · </span><span className="font-semibold text-[#33455F]">{r.reqQty}</span></div>
                      <div><span className="text-[#6B7280]">Paying · </span><span className="font-semibold text-[#33455F]">{t.payingQty}</span></div>
                      <div><span className="text-[#6B7280]">Shipper · </span><span className="font-semibold text-[#33455F] truncate">{r.shipper}</span></div>
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#F4F7FE] rounded-xl py-1.5">
                        <div className="text-[9.5px] uppercase tracking-wider text-[#6B7280] font-bold">Amount</div>
                        <div className="text-[12px] font-bold text-[#0E1B3D] mt-0.5">{t.amount.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                      <div className="bg-[#F4F7FE] rounded-xl py-1.5">
                        <div className="text-[9.5px] uppercase tracking-wider text-[#6B7280] font-bold">VAT</div>
                        <div className="text-[12px] font-bold text-[#0E1B3D] mt-0.5">{t.vat.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                      <div className="bg-[#EAF1FE] rounded-xl py-1.5">
                        <div className="text-[9.5px] uppercase tracking-wider text-[#0E47A6] font-bold">Total</div>
                        <div className="text-[12px] font-bold text-[#0E47A6] mt-0.5">{t.total.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  </div>
                  {/* Amend link per DPW card */}
                  <button onClick={() => setStep(reviewStartIdx + idx)}
                    className="w-full border-t border-[#F3F4F6] py-2.5 text-[11.5px] font-semibold text-[#1360D2] hover:bg-[#F4F7FE] flex items-center justify-center gap-1">
                    Amend containers <ChevronRight size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Grand totals across all selected DPW records */}
          <div className="rounded-2xl bg-white border border-[#E0EAFB] shadow-[0_8px_18px_-14px_rgba(14,27,61,0.18)] p-4 space-y-2.5">
            <div className="text-[10.5px] uppercase tracking-wider text-[#0E47A6] font-bold">Grand total</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[#F4F7FE] px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">Paying Qty</div>
                <div className="text-[16px] font-bold text-[#0E1B3D] mt-0.5">{totals.payingQty}</div>
              </div>
              <div className="rounded-xl bg-[#F4F7FE] px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">Amount</div>
                <div className="text-[16px] font-bold text-[#0E1B3D] mt-0.5 flex items-center gap-0.5">
                  <Dh /> {totals.amount.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="rounded-xl bg-[#F4F7FE] px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">VAT</div>
                <div className="text-[16px] font-bold text-[#0E1B3D] mt-0.5 flex items-center gap-0.5">
                  <Dh /> {totals.vat.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="rounded-xl bg-[#EAF1FE] px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-[#0E47A6] font-bold">Total Amount</div>
                <div className="text-[16px] font-bold text-[#0E47A6] mt-0.5 flex items-center gap-0.5">
                  <Dh /> {totals.total.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => setStep(paymentStepIdx)}
            className="dt-btn-primary w-full text-white py-3.5 rounded-2xl font-bold uppercase tracking-wide text-[13px] flex items-center justify-center gap-2">
            Continue to payment <ArrowRight size={14} />
          </button>
        </div>
      )}

      {!isOverviewStep && !isPaymentStep && (() => {
        const r = records[reviewIdx];
        const dirty = isDirty(r.dpwRef);
        const recordCommitted = committed[r.dpwRef];
        const liveTotal = r.containers.reduce((s, c) => s + containerRowTotals(c).total, 0);
        return (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#F4F7FE] border border-[#E0EAFB] p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#1360D2]"
                style={{ background: 'linear-gradient(135deg, #EAF1FE, #DCE7FB)' }}>
                <Ship size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10.5px] uppercase tracking-wider text-[#6B7280] font-bold">DPW Reference</div>
                <div className="text-[14px] font-bold text-[#0E1B3D] truncate">{r.dpwRef}</div>
              </div>
              <div className="text-right">
                <div className="text-[10.5px] uppercase tracking-wider text-[#6B7280] font-bold">{dirty ? 'Pending' : 'Total'}</div>
                <div className={`text-[14px] font-bold flex items-center gap-0.5 ${dirty ? 'text-[#B45309]' : 'text-[#0E1B3D]'}`}>
                  <Dh /> {(dirty || !recordCommitted ? liveTotal : recordCommitted.total).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Editable containers */}
            <div className="text-[10.5px] uppercase tracking-wider text-[#0E47A6] font-bold">Containers</div>
            <div className="space-y-2.5">
              {r.containers.map((c, idx) => {
                const row = containerRowTotals(c);
                const allocatedQty = c.paying.reduce((s, a) => s + a.qty, 0);
                const remaining = c.pending - allocatedQty;
                const showRowTotal = !dirty && recordCommitted; // show committed amount; else "—"
                return (
                  <div key={idx} className="rounded-2xl border border-[#E0EAFB] p-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-bold text-[#0E1B3D]">{c.type}</div>
                    </div>
                    {/* Total Qty · Paid Qty · Pending for payment */}
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-[#F4F7FE] px-3 py-2 text-center">
                        <div className="text-[9.5px] uppercase tracking-wider text-[#6B7280] font-bold">Total Qty</div>
                        <div className="text-[14px] font-bold text-[#0E1B3D] mt-0.5">{c.totalQty}</div>
                      </div>
                      <div className="rounded-xl bg-[#ECFDF5] px-3 py-2 text-center">
                        <div className="text-[9.5px] uppercase tracking-wider text-[#047857] font-bold">Paid Qty</div>
                        <div className="text-[14px] font-bold text-[#0E1B3D] mt-0.5">{c.paidQty}</div>
                      </div>
                      <div className="rounded-xl bg-[#FEF6E7] px-3 py-2 text-center">
                        <div className="text-[9.5px] uppercase tracking-wider text-[#B45309] font-bold">Pending</div>
                        <div className="text-[14px] font-bold text-[#0E1B3D] mt-0.5">{c.pending}</div>
                      </div>
                    </div>

                    {/* Stuffing allocations — multi-row */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-[#0E47A6] font-bold">Stuffing locations</span>
                        <span className="text-[10px] text-[#6B7280]">
                          Allocated <span className="font-bold text-[#0E1B3D]">{allocatedQty}</span> / {c.pending}
                          {remaining > 0 && <span className="text-[#B45309] font-bold"> · {remaining} unassigned</span>}
                        </span>
                      </div>
                      {c.paying.map((alloc, aIdx) => (
                        <div key={aIdx} className="flex items-center gap-2">
                          <select value={alloc.stuffing}
                            onChange={(e) => setAllocation(r.dpwRef, idx, aIdx, { stuffing: e.target.value as Stuffing })}
                            className="flex-1 bg-[#F4F7FE] border border-[#D5E2F8] rounded-xl px-3 py-2 text-[12.5px] font-semibold text-[#0E47A6] outline-none focus:border-[#1360D2]">
                            <option value="TOWN/FREE ZONE">TOWN/FREE ZONE</option>
                            <option value="FREE ZONE">FREE ZONE</option>
                            <option value="TOWN">TOWN</option>
                          </select>
                          <input type="number" min={0} max={alloc.qty + remaining} value={alloc.qty}
                            onChange={(e) => {
                              const target = Math.max(0, parseInt(e.target.value) || 0);
                              const maxAllowed = alloc.qty + remaining;
                              setAllocation(r.dpwRef, idx, aIdx, { qty: Math.min(maxAllowed, target) });
                            }}
                            className="w-[78px] text-center bg-[#F4F7FE] border border-[#D5E2F8] rounded-xl px-2 py-2 text-[14px] font-bold text-[#0E47A6] outline-none focus:border-[#1360D2]" />
                          {c.paying.length > 1 && (
                            <button onClick={() => removeAllocation(r.dpwRef, idx, aIdx)}
                              className="w-9 h-9 rounded-xl bg-[#FEECEC] text-[#B42318] flex items-center justify-center hover:bg-[#FCD0D0]"
                              aria-label="Remove allocation">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addAllocation(r.dpwRef, idx)}
                        disabled={remaining <= 0}
                        className={`w-full text-[11.5px] font-bold uppercase tracking-wider py-2 rounded-xl border-dashed border transition flex items-center justify-center gap-1 ${
                          remaining <= 0
                            ? 'border-[#E0EAFB] text-[#9CA3AF] cursor-not-allowed'
                            : 'border-[#B7CDF1] text-[#1360D2] hover:bg-[#EAF1FE]'}`}>
                        <Plus size={12} /> Add another stuffing location
                      </button>
                    </div>

                    {/* Token Paying For */}
                    <div className="mt-3 grid grid-cols-2 gap-2 items-end">
                      <label className="block">
                        <span className="block text-[10px] uppercase tracking-wider text-[#6B7280] font-bold mb-1">Token Paying For</span>
                        <select value={c.tokenPayingFor}
                          onChange={(e) => updateContainer(r.dpwRef, idx, { tokenPayingFor: parseInt(e.target.value) || 0 })}
                          className="w-full bg-[#F4F7FE] border border-[#D5E2F8] rounded-xl px-3 py-2 text-[12.5px] font-semibold text-[#0E47A6] outline-none focus:border-[#1360D2]">
                          {Array.from({ length: c.pending + 1 }, (_, i) => (
                            <option key={i} value={i}>{i}</option>
                          ))}
                        </select>
                      </label>
                      <div className="rounded-xl bg-[#EAF1FE] px-3 py-2 flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-wider text-[#0E47A6] font-bold">Total Amount</span>
                        <span className="text-[13px] font-bold text-[#0E47A6] flex items-center gap-0.5">
                          <Dh /> {showRowTotal
                            ? row.total.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compute charges */}
            <button onClick={() => onCompute(r.dpwRef)}
              className={`w-full py-3 rounded-2xl font-bold text-[12.5px] uppercase tracking-wide flex items-center justify-center gap-2 transition
                ${dirty || !recordCommitted
                  ? 'text-white shadow-[0_12px_24px_-10px_rgba(180,83,9,0.45)]'
                  : 'dt-btn-secondary'}`}
              style={(dirty || !recordCommitted) ? { background: 'linear-gradient(90deg, #D97706, #F59E0B, #D97706)' } : undefined}>
              {dirty || !recordCommitted ? <AlertCircle size={14} /> : <Check size={14} />}
              {dirty || !recordCommitted ? 'Compute charges' : 'Charges computed'}
            </button>

            {/* Computed total summary */}
            {recordCommitted && (
              <div className="rounded-2xl bg-white border border-[#E0EAFB] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-[#4A5565]">Computed total</span>
                  <span className={`text-[16px] font-bold flex items-center gap-0.5 ${dirty ? 'line-through text-[#9CA3AF]' : 'text-[#0E47A6]'}`}>
                    <Dh /> {recordCommitted.total.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {dirty && (
                  <div className="mt-1 text-[11px] text-[#B45309] font-medium">
                    Quantities changed — recompute to update the total.
                  </div>
                )}
              </div>
            )}

            {/* BRN details + Billing calculation flyout buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onShowBrn(r)}
                className="bg-white rounded-2xl border border-[#E0EAFB] px-3 py-3 flex items-center justify-between hover:bg-[#F4F7FE]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Info size={13} className="text-[#1360D2] shrink-0" />
                  <span className="text-[11.5px] font-semibold text-[#0E1B3D] truncate">View BRN details</span>
                </div>
                <ChevronRight size={13} className="text-gray-500 shrink-0" />
              </button>
              <button onClick={() => onShowBilling(r)}
                disabled={!recordCommitted}
                className={`rounded-2xl border px-3 py-3 flex items-center justify-between transition ${
                  recordCommitted
                    ? 'bg-white border-[#E0EAFB] hover:bg-[#F4F7FE]'
                    : 'bg-[#F4F7FE] border-[#EAF0FA] cursor-not-allowed opacity-60'}`}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Info size={13} className="text-[#1360D2] shrink-0" />
                  <span className="text-[11.5px] font-semibold text-[#0E1B3D] truncate">Billing calculation</span>
                </div>
                <ChevronRight size={13} className="text-gray-500 shrink-0" />
              </button>
            </div>

            {/* Dirty hint (compute optional but recommended) */}
            {dirty && (
              <div className="rounded-xl bg-[#FEF6E7] border border-[#FCD9A5] px-3 py-2 text-[11px] text-[#7A5A11] leading-relaxed">
                You have unsaved changes. Click <span className="font-bold">Compute charges</span> to apply them, otherwise the previous total will be used.
              </div>
            )}

            {/* Wizard nav */}
            <div className="flex items-center gap-2.5 pt-1">
              {step > 0 && (
                <button onClick={() => setStep(s => Math.max(0, s - 1))}
                  className="dt-btn-secondary flex-1 py-3 rounded-2xl font-bold text-[13px] uppercase tracking-wide flex items-center justify-center gap-1.5">
                  <ChevronLeft size={14} /> Back
                </button>
              )}
              <button onClick={() => setStep(s => s + 1)}
                className="dt-btn-primary flex-[1.4] text-white py-3.5 rounded-2xl font-bold text-[13px] uppercase tracking-wide flex items-center justify-center gap-1.5">
                {reviewIdx < records.length - 1 ? 'Next record' : 'Continue to payment'} <ArrowRight size={14} />
              </button>
            </div>

            {/* Skip to payment — fast-forward */}
            {reviewIdx < records.length - 1 && (
              <div className="text-center pt-1">
                <button onClick={() => setStep(paymentStepIdx)}
                  className="text-[12px] font-semibold text-[#4A5565] hover:text-[#1360D2]">
                  Skip remaining · go to payment
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {isPaymentStep && (
        <div className="space-y-4">
          {/* Summary across all records */}
          <div className="rounded-2xl bg-[#F4F7FE] border border-[#E0EAFB] p-4">
            {records.length === 1 ? (
              <div className="flex items-center justify-between text-[12px] text-[#6B7280]">
                <span>DPW Ref</span>
                <span className="font-bold text-[#0E1B3D]">{records[0].dpwRef}</span>
              </div>
            ) : (
              <div className="space-y-1.5 text-[12px]">
                <div className="text-[10.5px] uppercase tracking-wider text-[#6B7280] font-bold">Paying {records.length} records</div>
                {records.map(r => {
                  const t = recordTotals(r);
                  const c = committed[r.dpwRef];
                  return (
                    <div key={r.dpwRef} className="bg-white rounded-xl border border-[#E0EAFB] px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[12px] font-bold text-[#0E1B3D]">DPW {r.dpwRef}</div>
                          <div className="text-[10.5px] text-[#6B7280]">{t.payingQty} container{t.payingQty !== 1 ? 's' : ''}</div>
                        </div>
                        <span className="font-bold text-[#0E1B3D] flex items-center gap-0.5 text-[13px]">
                          <Dh /> {t.total.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-3">
                        <button onClick={() => onShowBrn(r)}
                          className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#1360D2]">
                          <Info size={11} /> View BRN details
                        </button>
                        {c && (
                          <button onClick={() => onShowBilling(r)}
                            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#1360D2]">
                            <Info size={11} /> Billing calculation
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="border-t border-[#DCE7FB] mt-3 pt-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-[#4A5565]">Paying for</span>
                <span className="font-bold text-[#0E1B3D]">{totals.payingQty} container{totals.payingQty !== 1 ? 's' : ''}</span>
              </div>
              <SummaryLine label="Grand total" value={totals.total} bold />
            </div>
          </div>

          {/* Mode of Payment */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-[13px] text-[#0E1B3D]">Mode of Payment</span>
              <span className="bg-gray-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Default</span>
            </div>
            <button onClick={() => setMethod('applepay')}
              className={`w-full bg-white border rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-sm transition
                ${method === 'applepay' ? 'border-black' : 'border-gray-200'}`}>
              <span className="font-medium text-black">Pay with</span>
              <span className="inline-flex items-center gap-1 text-black">
                <svg width="14" height="17" viewBox="0 0 14 17" fill="currentColor" aria-hidden="true">
                  <path d="M11.182 9.092c-.02-2.07 1.69-3.063 1.768-3.111-.965-1.41-2.464-1.603-2.998-1.625-1.276-.13-2.49.752-3.137.752-.66 0-1.66-.737-2.733-.715-1.404.021-2.701.816-3.42 2.072-1.46 2.527-.373 6.262 1.054 8.314.699 1.005 1.529 2.131 2.616 2.091 1.05-.043 1.447-.679 2.717-.679 1.27 0 1.626.679 2.733.654 1.13-.022 1.844-1.022 2.534-2.031.798-1.165 1.125-2.293 1.144-2.352-.025-.012-2.196-.844-2.218-3.37zM9.222 3.06C9.79 2.36 10.176 1.388 10.07.42c-.83.034-1.836.555-2.424 1.254-.527.617-.988 1.605-.864 2.553.928.071 1.873-.473 2.44-1.166z"/>
                </svg>
                <span className="font-bold text-lg" style={{ fontFamily: 'system-ui' }}>Pay</span>
              </span>
            </button>
            <div className="text-[11.5px] font-bold text-[#696F83] mt-3 mb-1.5 uppercase tracking-wider">Other Methods</div>
            <div className="space-y-2">
              <button onClick={() => setMethod('rosoom')}
                className={`w-full bg-white border rounded-xl py-3 flex items-center gap-3 px-3 transition
                  ${method === 'rosoom' ? 'border-[#1360D2]' : 'border-gray-200'}`}>
                <div className="w-9 h-9 rounded-lg bg-[#EAF1FE] flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-[#1360D2]" />
                </div>
                <span className="font-medium text-[#1360D2] text-[14px]">Rosoom Payment Gateway</span>
              </button>
              <button onClick={() => setMethod('advance')}
                className={`w-full bg-white border rounded-xl py-3 flex items-center gap-3 px-3 transition
                  ${method === 'advance' ? 'border-[#1360D2]' : 'border-gray-200'}`}>
                <div className="w-9 h-9 rounded-lg bg-[#EAF1FE] flex items-center justify-center shrink-0">
                  <Wallet size={18} className="text-[#1360D2]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-[#1360D2] text-[14px]">Pay from Advance Deposit</div>
                  <div className="text-[11px] text-[#6B7280]">
                    Balance: <span className="font-bold text-[#0E1B3D]"><Dh /> 77,001.18</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Wizard nav */}
          <div className="flex items-center gap-2.5 pt-1">
            <button onClick={() => setStep(s => Math.max(0, s - 1))}
              className="dt-btn-secondary flex-1 py-3 rounded-2xl font-bold text-[13px] uppercase tracking-wide flex items-center justify-center gap-1.5">
              <ChevronLeft size={14} /> Back
            </button>
            <button onClick={() => setPaid(true)}
              className="dt-btn-primary flex-[1.4] text-white py-3.5 rounded-2xl font-bold uppercase tracking-wide text-[13px] flex items-center justify-center gap-2">
              Pay <Dh /> {totals.total.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
