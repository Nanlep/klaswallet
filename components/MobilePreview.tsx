
import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { SmileIDAdapter, SmileIDStatus } from '../services/smileIDAdapter';

type Screen = 'Auth' | 'Register' | 'Home' | 'Swap' | 'Send' | 'Receive' | 'Wallet' | 'KYC' | 'AddCash' | 'Bills' | 'Merchant' | 'Advisor' | 'Settings';
type SubSetting = 'main' | 'pin' | '2fa' | 'devices' | 'notifications' | 'localization' | 'privacy' | 'agreement' | 'about';

interface TransactionLog {
  title: string;
  sub: string;
  amount: string;
  icon: string;
  positive?: boolean;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

export const MobilePreview: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('Auth');
  const [subView, setSubView] = useState<SubSetting>('main');
  const [kycStatus, setKycStatus] = useState<SmileIDStatus>(SmileIDStatus.UNVERIFIED);
  const [balances, setBalances] = useState({ 
    usd: 12450.80, 
    ngn: 250000.00, 
    btc: 0.0425, 
    eth: 1.25,
    usdt: 500.00,
    usdc: 250.00
  });
  const [history, setHistory] = useState<TransactionLog[]>([
    { title: "Naira Deposit", sub: "Bank Transfer", amount: "+₦50,000.00", icon: "fa-building-columns", positive: true },
    { title: "Swap BTC to USD", sub: "Completed", amount: "+$450.20", icon: "fa-rotate", positive: true },
    { title: "POS Sale - USDT", sub: "Merchant Store", amount: "+50.00 USDT", icon: "fa-circle-dollar-to-slot", positive: true },
    { title: "Salary Deposit", sub: "Internal", amount: "+$4,200.00", icon: "fa-money-bill-transfer", positive: true },
  ]);

  const [toast, setToast] = useState<Toast | null>(null);
  const [pinChallenge, setPinChallenge] = useState<{ active: boolean; onVerify: () => void } | null>(null);

  const gemini = new GeminiService();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const navigateTo = (s: Screen) => {
    setScreen(s);
    setSubView('main');
  };

  const addTransaction = (log: TransactionLog) => setHistory([log, ...history]);
  const updateBalance = (asset: string, amount: number) => {
    if (isNaN(amount)) return;
    setBalances(prev => ({ ...prev, [asset]: (prev as any)[asset] + amount }));
  };

  const requestPin = (onVerify: () => void) => {
    setPinChallenge({ active: true, onVerify });
  };

  if (screen === 'Auth') return <AuthScreen onLogin={() => navigateTo('Home')} onRegister={() => navigateTo('Register')} />;
  if (screen === 'Register') return <RegisterScreen onBack={() => navigateTo('Auth')} onComplete={(type: string) => { 
    if (type === 'MERCHANT') setKycStatus(SmileIDStatus.UNVERIFIED);
    navigateTo('Home'); 
    showToast(`${type === 'MERCHANT' ? 'Merchant' : 'Personal'} account created!`);
  }} />;

  return (
    <div className="relative mx-auto border-gray-900 bg-gray-900 border-[16px] rounded-[3.5rem] h-[780px] w-[360px] shadow-2xl overflow-hidden font-sans select-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[35px] bg-gray-900 rounded-b-[2.5rem] z-50 flex items-center justify-center">
        <div className="w-12 h-1.5 bg-gray-800 rounded-full"></div>
      </div>

      {toast && (
        <div className={`absolute top-16 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideDown ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 
          toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-white'
        }`}>
          <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
          <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {pinChallenge?.active && (
        <PinOverlay 
          onSuccess={() => {
            pinChallenge.onVerify();
            setPinChallenge(null);
            showToast("Transaction Authorized");
          }} 
          onCancel={() => setPinChallenge(null)} 
        />
      )}

      <div className={`bg-white h-full w-full overflow-y-auto pt-14 pb-24 transition-all duration-300`}>
        {screen === 'Home' && <HomeScreen onNavigate={navigateTo} balances={balances} history={history} kycStatus={kycStatus} />}
        {screen === 'Advisor' && <AdvisorScreen onBack={() => navigateTo('Home')} history={history} gemini={gemini} />}
        {screen === 'Wallet' && <WalletScreen onNavigate={navigateTo} balances={balances} />}
        {screen === 'KYC' && <KYCScreen onBack={() => navigateTo('Home')} onComplete={(status) => { setKycStatus(status); navigateTo('Home'); showToast(`KYC ${status}`); }} />}
        {screen === 'Settings' && <SettingsScreen onBack={() => navigateTo('Home')} onLogout={() => navigateTo('Auth')} subView={subView} setSubView={setSubView} showToast={showToast} kycStatus={kycStatus} />}
        {screen === 'Swap' && <SwapScreen onBack={() => navigateTo('Home')} balances={balances} onComplete={(f, t, fa, ta) => {
          requestPin(() => {
            updateBalance(f, -fa);
            updateBalance(t, ta);
            const symbol = t === 'ngn' ? '₦' : t === 'usd' ? '$' : '';
            const suffix = (t !== 'usd' && t !== 'ngn') ? ` ${t.toUpperCase()}` : '';
            addTransaction({ 
              title: `Swap ${f.toUpperCase()} to ${t.toUpperCase()}`, 
              sub: "Exchange", 
              amount: `+${symbol}${(ta || 0).toLocaleString()}${suffix}`, 
              icon: "fa-rotate", 
              positive: true 
            });
            navigateTo('Home');
          });
        }} />}
        {screen === 'Send' && <SendScreen onBack={() => navigateTo('Home')} balances={balances} onComplete={(amt, asset, to) => {
          requestPin(() => {
            updateBalance(asset, -amt);
            const symbol = asset === 'ngn' ? '₦' : asset === 'usd' ? '$' : '';
            const suffix = (asset !== 'usd' && asset !== 'ngn') ? ` ${asset.toUpperCase()}` : '';
            addTransaction({ 
              title: `Sent to ${to}`, 
              sub: "Transfer", 
              amount: `-${symbol}${(amt || 0).toLocaleString()}${suffix}`, 
              icon: "fa-paper-plane" 
            });
            navigateTo('Home');
          });
        }} />}
        {screen === 'Receive' && <ReceiveScreen onBack={() => navigateTo('Home')} />}
        {screen === 'Merchant' && <MerchantScreen onBack={() => navigateTo('Home')} onPayment={(amt, asset) => {
          requestPin(() => {
            updateBalance(asset, amt);
            const symbol = asset === 'ngn' ? '₦' : asset === 'usd' ? '$' : '';
            const suffix = (asset !== 'usd' && asset !== 'ngn') ? ` ${asset.toUpperCase()}` : '';
            addTransaction({ 
              title: "Merchant Sale", 
              sub: "POS Payment", 
              amount: `+${symbol}${(amt || 0).toLocaleString()}${suffix}`, 
              icon: "fa-store", 
              positive: true 
            });
            navigateTo('Home');
          });
        }} />}
        {screen === 'AddCash' && <AddCashScreen onBack={() => navigateTo('Home')} onTopUp={(amt, asset) => {
          updateBalance(asset, amt);
          addTransaction({ 
            title: "Wallet Top-up", 
            sub: "Bank Deposit", 
            amount: `+${asset === 'ngn' ? '₦' : '$'}${(amt || 0).toLocaleString()}`, 
            icon: "fa-building-columns", 
            positive: true 
          });
          showToast("Deposit Confirmed");
          navigateTo('Home');
        }} />}
        {screen === 'Bills' && <BillsScreen onBack={() => navigateTo('Home')} onPay={(bill, amt) => {
          requestPin(() => {
            updateBalance('ngn', -amt);
            addTransaction({ title: bill, sub: "Utility", amount: `-₦${(amt || 0).toLocaleString()}`, icon: "fa-bolt" });
            navigateTo('Home');
          });
        }} />}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around py-5 z-40 px-4">
        <Nav icon="fa-house" active={screen === 'Home'} onClick={() => navigateTo('Home')} label="Home" />
        <Nav icon="fa-wallet" active={screen === 'Wallet'} onClick={() => navigateTo('Wallet')} label="Wallet" />
        <Nav icon="fa-brain" active={screen === 'Advisor'} onClick={() => navigateTo('Advisor')} label="Advisor" />
        <Nav icon="fa-store" active={screen === 'Merchant'} onClick={() => navigateTo('Merchant')} label="Store" />
        <Nav icon="fa-gear" active={screen === 'Settings'} onClick={() => navigateTo('Settings')} label="Settings" />
      </div>
    </div>
  );
};

const SettingsScreen = ({ onBack, onLogout, subView, setSubView, showToast, kycStatus }: any) => {
  const [biometrics, setBiometrics] = useState(true);
  const [currency, setCurrency] = useState('NGN');
  const [isAgreed, setIsAgreed] = useState(false);
  const [devices, setDevices] = useState([
    { id: '1', name: "iPhone 15 Pro", location: "Lagos, Nigeria", current: true },
    { id: '2', name: "MacBook Pro 16\"", location: "London, UK", current: false },
    { id: '3', name: "Samsung Galaxy S24", location: "Abuja, Nigeria", current: false }
  ]);

  const handleRevoke = (id: string) => {
    if (confirm("Revoke this device's access immediately?")) {
      setDevices(devices.filter(d => d.id !== id));
      showToast("Session Revoked", "info");
    }
  };

  const renderSubView = () => {
    switch (subView) {
      case 'pin':
        return (
          <div className="space-y-6 animate-slideUp">
            <SubHeader label="Secure Terminal PIN" onBack={() => setSubView('main')} />
            <div className="bg-gray-50 p-6 rounded-[2rem] space-y-4 shadow-inner">
              <p className="text-xs font-bold text-gray-500">Your Terminal PIN is required for every POS transaction and internal transfer.</p>
              <input type="password" placeholder="Current 4-digit PIN" className="w-full p-4 rounded-xl border-none outline-none font-mono" maxLength={4} />
              <input type="password" placeholder="New 4-digit PIN" className="w-full p-4 rounded-xl border-none outline-none font-mono" maxLength={4} />
              <button onClick={() => { showToast("PIN Updated"); setSubView('main'); }} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Update PIN</button>
            </div>
          </div>
        );
      case '2fa':
        return (
          <div className="space-y-6 animate-slideUp">
            <SubHeader label="Two-Factor Security" onBack={() => setSubView('main')} />
            <div className="space-y-4">
              <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex justify-between items-center">
                <div>
                  <p className="text-[11px] font-black text-indigo-900 uppercase">SMS Verification</p>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase mt-1">Active: +234 803 ••• ••91</p>
                </div>
                <i className="fa-solid fa-circle-check text-indigo-600"></i>
              </div>
              <div className="p-6 bg-gray-50 rounded-[2rem] flex justify-between items-center">
                <div>
                  <p className="text-[11px] font-black text-gray-900 uppercase">Email OTP</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Active: john@doe.com</p>
                </div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
              </div>
              <button className="w-full py-4 text-indigo-600 font-black text-[10px] uppercase tracking-widest border border-dashed border-indigo-200 rounded-2xl hover:bg-indigo-50 transition">Add Authenticator App</button>
            </div>
          </div>
        );
      case 'devices':
        return (
          <div className="space-y-6 animate-slideUp">
            <SubHeader label="Linked Devices" onBack={() => setSubView('main')} />
            <div className="space-y-3">
              {devices.map(d => (
                <DeviceItem key={d.id} name={d.name} location={d.location} current={d.current} onRevoke={() => handleRevoke(d.id)} />
              ))}
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6 animate-slideUp">
            <SubHeader label="Notifications" onBack={() => setSubView('main')} />
            <div className="space-y-4">
              <SettingToggle label="Push Notifications" sub="Transaction & activity alerts" enabled={true} />
              <SettingToggle label="Email Reports" sub="Daily & Weekly summaries" enabled={false} />
              <SettingToggle label="SMS Alerts" sub="High-value tx confirmations" enabled={true} />
              <SettingToggle label="Marketing" sub="New features & promos" enabled={false} />
            </div>
          </div>
        );
      case 'localization':
        return (
          <div className="space-y-6 animate-slideUp">
            <SubHeader label="Localization" onBack={() => setSubView('main')} />
            <div className="space-y-4">
              <div className="p-5 bg-gray-50 rounded-[2rem]">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">App Language</label>
                <select className="w-full bg-white p-4 rounded-xl text-xs font-black outline-none border-none shadow-sm cursor-pointer">
                  <option>English (Nigeria)</option>
                  <option>English (US)</option>
                  <option>French (Regional)</option>
                  <option>Hausa</option>
                  <option>Yoruba</option>
                  <option>Igbo</option>
                </select>
              </div>
              <div className="p-5 bg-gray-50 rounded-[2rem]">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Region / Format</label>
                <select className="w-full bg-white p-4 rounded-xl text-xs font-black outline-none border-none shadow-sm cursor-pointer">
                  <option>Nigeria (+234)</option>
                  <option>United States (+1)</option>
                  <option>United Kingdom (+44)</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-6 animate-slideUp">
            <SubHeader label="Privacy & Security" onBack={() => setSubView('main')} />
            <div className="bg-gray-50 p-6 rounded-[2rem] max-h-[450px] overflow-y-auto space-y-4 text-[10px] font-bold text-gray-600 leading-relaxed shadow-inner">
              <h4 className="text-gray-900 font-black uppercase">1. Data Encryption</h4>
              <p>KlasWallet employs military-grade AES-256 encryption for all data at rest and TLS 1.3 for data in transit. Your private keys are never stored on our servers; they are managed by institutional-grade HSMs.</p>
              <h4 className="text-gray-900 font-black uppercase">2. Privacy Commitment</h4>
              <p>We do not sell user data. Your financial history is strictly used for platform integrity and the Smart Advisor AI engine (processed locally or via zero-knowledge proofs where applicable).</p>
              <h4 className="text-gray-900 font-black uppercase">3. Third-Party Sharing</h4>
              <p>Data is only shared with essential partners (like Bani.africa for on-ramps and KYC providers) to fulfill regulatory requirements.</p>
            </div>
          </div>
        );
      case 'agreement':
        return (
          <div className="space-y-6 animate-slideUp">
            <SubHeader label="Merchant Agreement" onBack={() => setSubView('main')} />
            <div className="bg-gray-50 p-6 rounded-[2rem] max-h-[400px] overflow-y-auto space-y-4 text-[10px] font-bold text-gray-600 leading-relaxed shadow-inner border border-gray-100">
              <h4 className="text-gray-900 font-black uppercase">1. Merchant Responsibilities</h4>
              <p>As a KlasWallet Merchant, you agree to process only legal transactions and adhere to local AML/CFT guidelines. High-risk industries must be disclosed during Tier 3 verification.</p>
              <h4 className="text-gray-900 font-black uppercase">2. Fees & Settlements</h4>
              <p>Settlements are processed via Bani.africa. Standard POS fees apply (1.5% for local transfers, variable for crypto). All fees are visible in the Transaction Ledger.</p>
              <h4 className="text-gray-900 font-black uppercase">3. Terminal Security</h4>
              <p>The merchant is responsible for terminal PIN security. Multiple failed attempts will trigger a system-wide freeze on the merchant account for 24 hours.</p>
              <h4 className="text-gray-900 font-black uppercase">4. Service Integrity</h4>
              <p>Merchants must ensure the integrity of the POS environment. Use of unauthorized hardware or modified software versions of KlasWallet is strictly prohibited.</p>
            </div>

            <div className="space-y-4 pt-2">
              <button 
                onClick={() => setIsAgreed(!isAgreed)}
                className="flex items-center gap-4 w-full text-left p-4 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 transition active:scale-[0.98] group"
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isAgreed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-200 bg-white group-hover:border-indigo-200'}`}>
                  {isAgreed && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                </div>
                <p className="text-[10px] font-black uppercase tracking-tight text-gray-600 leading-tight">
                  I have read and agree to the institutional merchant terms and conditions.
                </p>
              </button>

              <button 
                disabled={!isAgreed}
                onClick={() => { showToast("Merchant Terms Accepted"); setSubView('main'); }}
                className={`w-full py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl transition-all ${isAgreed ? 'bg-indigo-600 text-white active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}`}
              >
                Accept & Activate
              </button>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-10 animate-slideUp flex flex-col items-center pt-8">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl shadow-2xl animate-pulse">
              <i className="fa-solid fa-wallet"></i>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter">KlasWallet</h3>
              <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Version 1.0.4-LTS (Launch Ready)</p>
            </div>
            <div className="w-full space-y-4 px-2">
              <AboutRow label="Developer" value="Klas Enterprises Inc." />
              <AboutRow label="Gateway Partner" value="Bani.africa" />
              <AboutRow label="HSM Security" value="FIPS 140-2 Certified" />
              <AboutRow label="Region" value="Nigeria / Global" />
            </div>
            <p className="text-[9px] text-gray-400 font-bold text-center px-10">© 2024 Klas Enterprises. Distributed under institutional-grade financial license #429-A. Compliance: PCI-DSS v4.0</p>
            <button onClick={() => setSubView('main')} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Back to Settings</button>
          </div>
        );
      default:
        return (
          <div className="animate-fadeIn space-y-8">
            <div className="flex flex-col items-center pb-4">
              <div className="relative group">
                <div className="w-24 h-24 bg-indigo-100 rounded-[2.5rem] flex items-center justify-center text-indigo-600 text-3xl font-black shadow-xl shadow-indigo-100/50">JD</div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs border-4 border-white shadow-lg active:scale-90 transition">
                  <i className="fa-solid fa-camera"></i>
                </button>
              </div>
              <h3 className="mt-4 text-xl font-black text-gray-900 leading-none">John Doe</h3>
              <p className="mt-2 text-xs font-bold text-gray-400 tracking-tight">john@doe.com • ID: 991024</p>
              <div className="mt-3 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                  {kycStatus === SmileIDStatus.VERIFIED ? 'Tier 3 Verified (Merchant)' : kycStatus === SmileIDStatus.PROCESSING ? 'Verification Pending' : 'Basic Tier (Unverified)'}
                </span>
              </div>
            </div>

            <div className="space-y-8 pb-10">
              <section>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Security & Access</label>
                <div className="space-y-4">
                  <SettingToggle label="Biometric Unlock" sub="FaceID / Fingerprint" enabled={biometrics} onToggle={() => setBiometrics(!biometrics)} />
                  <SettingRow icon="fa-key" label="Secure Terminal PIN" sub="Reset for POS transactions" onClick={() => setSubView('pin')} />
                  <SettingRow icon="fa-shield" label="Two-Factor Security" sub="SMS: +234 803 ••• ••91" onClick={() => setSubView('2fa')} />
                  <SettingRow icon="fa-laptop" label="Linked Devices" sub={`${devices.length} Active Sessions`} onClick={() => setSubView('devices')} />
                </div>
              </section>

              <section>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">System & Regional</label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem] border border-transparent">
                    <div>
                      <p className="text-[11px] font-black text-gray-900 uppercase">Settlement Currency</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Primary merchant asset</p>
                    </div>
                    <select value={currency} onChange={e => setCurrency(e.target.value)} className="bg-white px-4 py-2 rounded-xl text-xs font-black border-none outline-none shadow-sm cursor-pointer">
                      <option value="NGN">Naira (NGN)</option>
                      <option value="USD">Dollar (USD)</option>
                    </select>
                  </div>
                  <SettingRow icon="fa-bell" label="Notifications" sub="Push, SMS & Email Alerts" onClick={() => setSubView('notifications')} />
                  <SettingRow icon="fa-language" label="Localization" sub="English (Nigeria)" onClick={() => setSubView('localization')} />
                </div>
              </section>

              <section>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Legal & Compliance</label>
                <div className="space-y-4">
                  <SettingRow icon="fa-file-shield" label="Privacy & Security" onClick={() => setSubView('privacy')} />
                  <SettingRow icon="fa-file-contract" label="Merchant Agreement" onClick={() => setSubView('agreement')} />
                  <SettingRow icon="fa-circle-info" label="About KlasWallet" sub="Production v1.0.4 Build 88" onClick={() => setSubView('about')} />
                </div>
              </section>

              <button onClick={onLogout} className="w-full py-6 rounded-[2.5rem] bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition shadow-sm active:scale-95">
                Revoke Access & Logout
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="px-7 space-y-7 animate-fadeIn h-full flex flex-col">
      {subView === 'main' && (
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition shadow-sm border border-gray-100">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h2 className="text-xl font-black tracking-tight text-gray-900">Account Settings</h2>
        </div>
      )}

      {renderSubView()}
    </div>
  );
};

const SubHeader = ({ label, onBack }: any) => (
  <div className="flex items-center gap-4">
    <button onClick={onBack} className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition shadow-sm border border-indigo-100 active:scale-90">
      <i className="fa-solid fa-chevron-left text-xs"></i>
    </button>
    <h3 className="text-base font-black tracking-tight text-gray-900 uppercase">{label}</h3>
  </div>
);

const AboutRow = ({ label, value }: any) => (
  <div className="flex justify-between border-b border-gray-100 pb-4">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{value}</span>
  </div>
);

const DeviceItem = ({ name, location, current, onRevoke }: any) => (
  <div className="p-5 bg-gray-50 rounded-[2rem] flex justify-between items-center border border-transparent hover:border-indigo-100 transition shadow-sm">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
        <i className={`fa-solid ${name.includes('iPhone') || name.includes('Galaxy') ? 'fa-mobile' : 'fa-laptop'} text-sm`}></i>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-black text-gray-900 uppercase">{name}</p>
          {current && <span className="text-[8px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase font-black">Local</span>}
        </div>
        <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5 tracking-tight">{location}</p>
      </div>
    </div>
    {!current && (
      <button onClick={onRevoke} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition flex items-center justify-center">
        <i className="fa-solid fa-trash-can text-[10px]"></i>
      </button>
    )}
  </div>
);

const SettingToggle = ({ label, sub, enabled, onToggle }: any) => (
  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem] border border-transparent shadow-sm">
    <div>
      <p className="text-[11px] font-black text-gray-900 uppercase">{label}</p>
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{sub}</p>
    </div>
    <button onClick={onToggle} className={`w-12 h-6 rounded-full transition-all relative ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${enabled ? 'left-7' : 'left-1'}`}></div>
    </button>
  </div>
);

const SettingRow = ({ icon, label, sub, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 bg-gray-50 rounded-[2rem] hover:bg-white border border-transparent hover:border-indigo-100 transition active:scale-[0.98] shadow-sm group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 group-hover:text-indigo-600 transition-colors">
        <i className={`fa-solid ${icon} text-sm`}></i>
      </div>
      <div className="text-left">
        <p className="text-[11px] font-black text-gray-900 uppercase leading-none">{label}</p>
        {sub && <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{sub}</p>}
      </div>
    </div>
    <i className="fa-solid fa-chevron-right text-[10px] text-gray-300 transition-transform group-hover:translate-x-1"></i>
  </button>
);

const AuthScreen = ({ onLogin, onRegister }: any) => (
  <div className="h-full w-full flex flex-col items-center justify-center p-10 bg-white animate-fadeIn">
    <div className="w-24 h-24 bg-indigo-600 rounded-[3rem] flex items-center justify-center text-white text-4xl mb-10 shadow-2xl shadow-indigo-100 rotate-6">
      <i className="fa-solid fa-wallet"></i>
    </div>
    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">KlasWallet</h1>
    <p className="text-gray-400 font-bold text-sm mb-14 text-center">Your Universal Asset Hub</p>
    <div className="w-full space-y-4">
      <input type="email" placeholder="Email Address" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 transition" defaultValue="john@doe.com" />
      <input type="password" placeholder="Password" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 transition" defaultValue="••••••••" />
      <button onClick={onLogin} className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 mt-6 active:scale-95 transition-transform">Get Started</button>
      <button onClick={onRegister} className="w-full text-gray-400 py-4 font-black text-[10px] uppercase tracking-widest">Create Enterprise Account</button>
    </div>
  </div>
);

const RegisterScreen = ({ onBack, onComplete }: any) => {
  const [accountType, setAccountType] = useState<'PERSONAL' | 'MERCHANT'>('PERSONAL');
  const [loading, setLoading] = useState(false);

  const handleComplete = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete(accountType);
    }, 1200);
  };

  return (
    <div className="h-full w-full p-10 bg-white flex flex-col animate-slideUp overflow-y-auto pb-24">
      <button onClick={onBack} className="self-start text-indigo-600 mb-8 font-black text-xs uppercase tracking-widest flex items-center">
        <i className="fa-solid fa-chevron-left mr-2"></i> Back
      </button>
      
      <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">
        {accountType === 'PERSONAL' ? 'New Account' : 'Merchant Setup'}
      </h2>
      <p className="text-gray-400 font-bold text-sm mb-10">
        {accountType === 'PERSONAL' 
          ? 'Join thousands of users managing assets globally.' 
          : 'Enable global crypto-fiat payments for your business.'}
      </p>

      <div className="w-full space-y-6 flex-1">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Profile Type</label>
          <div className="flex gap-2 bg-gray-50 p-1.5 rounded-3xl border border-gray-100">
            <button 
              onClick={() => setAccountType('PERSONAL')}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${accountType === 'PERSONAL' ? 'bg-white text-indigo-600 shadow-md border border-gray-100' : 'text-gray-400'}`}
            >
              Personal
            </button>
            <button 
              onClick={() => setAccountType('MERCHANT')}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${accountType === 'MERCHANT' ? 'bg-white text-indigo-600 shadow-md border border-gray-100' : 'text-gray-400'}`}
            >
              Merchant
            </button>
          </div>
        </div>

        <div className="space-y-4 animate-fadeIn">
          {accountType === 'PERSONAL' ? (
            <>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 transition" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Email</label>
                <input type="email" placeholder="john@doe.com" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 transition" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Legal Name</label>
                <input type="text" placeholder="Enter Company Name" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 transition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Reg Number (RC)</label>
                  <input type="text" placeholder="1234567" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Industry</label>
                  <select className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-xs font-bold outline-none focus:border-indigo-600 transition appearance-none cursor-pointer">
                    <option>Retail</option>
                    <option>Tech</option>
                    <option>Logistics</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Email</label>
                <input type="email" placeholder="ops@company.com" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 transition" />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Create Secure PIN</label>
            <input type="password" placeholder="••••" maxLength={4} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 transition tracking-[1em]" />
            <p className="text-[8px] font-bold text-gray-300 uppercase mt-1 px-1">Required for every checkout & transaction.</p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleComplete} 
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 mt-10 active:scale-95 transition-all flex items-center justify-center"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        ) : (
          accountType === 'PERSONAL' ? 'Finish Registration' : 'Create Merchant Account'
        )}
      </button>
      
      <p className="text-[9px] text-center text-gray-400 font-bold mt-6 uppercase tracking-widest px-8">
        By continuing, you agree to our Terms of Service and Merchant Merchant Guidelines.
      </p>
    </div>
  );
};

const HomeScreen = ({ onNavigate, balances, history, kycStatus }: any) => (
  <div className="px-7 space-y-7 animate-fadeIn">
    <header className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('Settings')} className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl shadow-indigo-500/10 active:scale-90 transition-transform">JD</button>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Portfolio</p>
          <p className="text-base font-black text-gray-900 leading-none">John Doe <i className="fa-solid fa-circle-check text-indigo-500 text-[10px] ml-1"></i></p>
        </div>
      </div>
      <button className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 active:bg-gray-100 transition shadow-sm"><i className="fa-solid fa-bell"></i></button>
    </header>

    {kycStatus !== SmileIDStatus.VERIFIED && (
      <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-white text-xs">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-900 uppercase">Limit Reached</p>
            <p className="text-[8px] font-bold text-amber-600 uppercase">Upgrade KYC for higher limits</p>
          </div>
        </div>
        <button onClick={() => onNavigate('KYC')} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-amber-200">Verify</button>
      </div>
    )}

    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
      <div className="relative z-10">
        <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Estimated Net Value</p>
        <h2 className="text-4xl font-black tracking-tight">${(balances.usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
        <div className="mt-8 flex gap-3">
          <button onClick={() => onNavigate('AddCash')} className="flex-1 bg-white text-indigo-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition shadow-lg">Deposit</button>
          <button onClick={() => onNavigate('Send')} className="flex-1 bg-white/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition backdrop-blur-sm">Send</button>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-4">
      <QuickAction icon="fa-rotate" label="Swap" onClick={() => onNavigate('Swap')} />
      <QuickAction icon="fa-bolt" label="Bills" onClick={() => onNavigate('Bills')} />
      <QuickAction icon="fa-qrcode" label="Receive" onClick={() => onNavigate('Receive')} />
      <QuickAction icon="fa-store" label="Store" onClick={() => onNavigate('Merchant')} />
    </div>

    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Activity</h3>
        <button className="text-[10px] font-black text-indigo-600 hover:underline">See All</button>
      </div>
      <div className="space-y-3">
        {history.slice(0, 4).map((tx: any, i: number) => (
          <TransactionItem key={i} {...tx} />
        ))}
      </div>
    </div>
  </div>
);

const SendScreen = ({ onBack, onComplete, balances }: any) => {
  const [asset, setAsset] = useState<'ngn' | 'usd' | 'btc' | 'eth' | 'usdt' | 'usdc'>('ngn');
  const [recipient, setRecipient] = useState('');
  const [bank, setBank] = useState('Select Bank');
  const [amount, setAmount] = useState('');

  const handleSend = () => {
    const val = parseFloat(amount);
    if (!recipient || isNaN(val) || val <= 0) return;
    if (val > (balances as any)[asset]) {
      alert(`Insufficient ${asset.toUpperCase()} balance.`);
      return;
    }
    onComplete(val, asset, asset === 'ngn' ? `${bank} - ${recipient}` : recipient);
  };

  return (
    <div className="px-7 space-y-7 animate-fadeIn h-full flex flex-col">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm"><i className="fa-solid fa-chevron-left"></i></button>
        <h2 className="text-xl font-black tracking-tight text-gray-900">Send Assets</h2>
      </div>

      <div className="bg-gray-100 p-1.5 rounded-3xl flex overflow-x-auto whitespace-nowrap scrollbar-hide">
        {(['ngn', 'usd', 'usdt', 'usdc', 'btc', 'eth'] as const).map(a => (
          <button key={a} onClick={() => setAsset(a)} className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${asset === a ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>
            {a}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-6">
        {asset === 'ngn' && (
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Destination Bank</label>
            <select value={bank} onChange={e => setBank(e.target.value)} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 transition shadow-sm">
              <option>Select Bank</option>
              <option>Wema Bank</option>
              <option>Access Bank</option>
              <option>GTBank</option>
              <option>Zenith Bank</option>
              <option>Kuda Bank</option>
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
            {asset === 'ngn' ? 'Account Number' : asset === 'usd' ? "@username or Email" : `Enter ${asset.toUpperCase()} Address`}
          </label>
          <input 
            value={recipient} 
            onChange={e => setRecipient(e.target.value)} 
            maxLength={asset === 'ngn' ? 10 : 100}
            placeholder={asset === 'ngn' ? "0123456789" : asset === 'usd' ? "@username" : "Enter wallet address"} 
            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 transition shadow-sm" 
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end mb-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount</label>
            <span className="text-[9px] font-bold text-indigo-600 uppercase">Available: {((balances as any)[asset] || 0).toLocaleString()} {asset.toUpperCase()}</span>
          </div>
          <div className="relative">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-3xl font-black outline-none focus:border-indigo-600 transition shadow-sm" />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-gray-300 uppercase">{asset === 'ngn' ? '₦' : (asset === 'usd' || asset === 'usdt' || asset === 'usdc') ? '$' : asset}</span>
          </div>
        </div>
      </div>

      <button onClick={handleSend} disabled={!recipient || !amount || (asset === 'ngn' && bank === 'Select Bank')} className="mb-8 w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50">
        Confirm Transfer
      </button>
    </div>
  );
};

const ReceiveScreen = ({ onBack }: any) => {
  const [asset, setAsset] = useState<'ngn' | 'usd' | 'btc' | 'eth' | 'usdt' | 'usdc'>('ngn');
  const addrs = {
    btc: 'bc1qf0...v9x',
    eth: '0x742d...443',
    usd: '992011032',
    ngn: '7821004432',
    usdt: '0x742d...usdt',
    usdc: '0x742d...usdc'
  };

  return (
    <div className="px-7 space-y-7 animate-fadeIn h-full flex flex-col items-center">
      <div className="w-full flex items-center gap-4">
        <button onClick={onBack} className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm"><i className="fa-solid fa-chevron-left"></i></button>
        <h2 className="text-xl font-black tracking-tight text-gray-900">Receive</h2>
      </div>

      <div className="w-full bg-gray-100 p-1.5 rounded-3xl flex overflow-x-auto whitespace-nowrap scrollbar-hide">
        {(['ngn', 'usd', 'usdt', 'usdc', 'btc', 'eth'] as const).map(a => (
          <button key={a} onClick={() => setAsset(a)} className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${asset === a ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>
            {a}
          </button>
        ))}
      </div>

      {(asset === 'usd' || asset === 'ngn') ? (
        <div className="w-full space-y-8 mt-4 animate-slideUp">
          <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-6">{asset.toUpperCase()} Virtual Account</p>
             <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Bank Name</p>
                  <p className="text-xl font-black">{asset === 'ngn' ? 'Wema Bank (NG)' : 'Klas Partner Bank (USD)'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Account Number</p>
                  <p className="text-2xl font-black tracking-widest">{addrs[asset]}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Account Name</p>
                  <p className="text-lg font-black">KLAS-{asset.toUpperCase()}-JD</p>
                </div>
             </div>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(addrs[asset]); alert('Account Number Copied'); }} className="w-full py-5 rounded-3xl bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-900 border border-gray-100 active:bg-gray-100 transition shadow-sm">Copy Account Details</button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8 mt-10 animate-slideUp">
          <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-50 relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20">
              <i className={asset === 'btc' ? "fa-brands fa-bitcoin" : asset === 'eth' ? "fa-brands fa-ethereum" : "fa-solid fa-circle-dollar-to-slot"}></i>
            </div>
            <div className="w-48 h-48 bg-gray-50 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-gray-200 shadow-inner">
               <i className="fa-solid fa-qrcode text-[120px] text-gray-900"></i>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Your {asset.toUpperCase()} Address</p>
            <p className="text-[11px] font-mono font-black text-gray-900 break-all px-10">{(addrs as any)[asset]}</p>
          </div>
          <div className="flex gap-4 w-full px-4">
            <button onClick={() => { navigator.clipboard.writeText((addrs as any)[asset]); alert('Address Copied'); }} className="flex-1 bg-gray-900 text-white py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition shadow-lg">Copy Address</button>
            <button className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 flex items-center justify-center active:scale-90 transition shadow-sm"><i className="fa-solid fa-share-nodes"></i></button>
          </div>
        </div>
      )}
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center px-10 leading-relaxed mt-auto mb-6 opacity-70">Send only {asset.toUpperCase()} to this {asset === 'usd' || asset === 'ngn' ? 'account' : 'address'}. Other assets will be permanently lost.</p>
    </div>
  );
};

const SwapScreen = ({ onBack, balances, onComplete }: any) => {
  const [from, setFrom] = useState<'ngn' | 'usd' | 'btc' | 'eth' | 'usdt' | 'usdc'>('ngn');
  const [to, setTo] = useState<'ngn' | 'usd' | 'btc' | 'eth' | 'usdt' | 'usdc'>('btc');
  const [amount, setAmount] = useState('');
  
  // Simulated rates
  const rates: any = {
    ngn: { btc: 1 / 102000000, eth: 1 / 5400000, usd: 1 / 1550, usdt: 1 / 1545, usdc: 1 / 1545 },
    btc: { ngn: 102000000, usd: 64250, eth: 18.5, usdt: 64200, usdc: 64200 },
    eth: { ngn: 5400000, usd: 3420, btc: 1/18.5, usdt: 3415, usdc: 3415 },
    usd: { ngn: 1550, btc: 1/64250, eth: 1/3420, usdt: 1, usdc: 1 },
    usdt: { usd: 1, ngn: 1545, btc: 1/64200, eth: 1/3415, usdc: 1 },
    usdc: { usd: 1, ngn: 1545, btc: 1/64200, eth: 1/3415, usdt: 1 }
  };

  const currentRate = rates[from]?.[to] || 1;

  const handleSwap = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || val > (balances as any)[from]) return;
    onComplete(from, to, val, val * currentRate);
  };

  return (
    <div className="px-7 space-y-7 animate-fadeIn h-full flex flex-col">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm active:scale-95 transition"><i className="fa-solid fa-chevron-left"></i></button>
        <h2 className="text-xl font-black tracking-tight text-gray-900">Exchange</h2>
      </div>

      <div className="flex-1 space-y-4">
        <div className="bg-gray-50 p-7 rounded-[2.5rem] border border-gray-100 shadow-inner">
           <div className="flex justify-between mb-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sell Assets</label>
             <span className="text-[10px] font-black text-indigo-600">Bal: {((balances as any)[from] || 0).toLocaleString()}</span>
           </div>
           <div className="flex justify-between items-center">
             <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-3xl font-black w-1/2 outline-none" />
             <select value={from} onChange={e => setFrom(e.target.value as any)} className="bg-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-sm border-none cursor-pointer">
                <option value="ngn">NGN</option>
                <option value="usd">USD</option>
                <option value="usdt">USDT</option>
                <option value="usdc">USDC</option>
                <option value="btc">BTC</option>
                <option value="eth">ETH</option>
             </select>
           </div>
        </div>

        <div className="flex justify-center -my-4 relative z-10">
          <button onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }} className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-indigo-600 border border-gray-50 active:scale-90 transition group">
            <i className="fa-solid fa-repeat group-hover:rotate-180 transition-transform duration-500"></i>
          </button>
        </div>

        <div className="bg-indigo-50/50 p-7 rounded-[2.5rem] border border-indigo-100 shadow-inner">
           <div className="flex justify-between mb-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Buy Assets</label>
             <span className="text-[10px] font-black text-indigo-600">Rate: 1 {from.toUpperCase()} ≈ {currentRate < 0.000001 ? currentRate.toExponential(4) : currentRate.toFixed(4)} {to.toUpperCase()}</span>
           </div>
           <div className="flex justify-between items-center">
             <div className="text-3xl font-black text-indigo-900">{(parseFloat(amount) * currentRate || 0).toLocaleString(undefined, { maximumFractionDigits: (to === 'btc' || to === 'eth') ? 8 : 2 })}</div>
             <select value={to} onChange={e => setTo(e.target.value as any)} className="bg-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-sm border-none cursor-pointer">
                <option value="ngn">NGN</option>
                <option value="usd">USD</option>
                <option value="usdt">USDT</option>
                <option value="usdc">USDC</option>
                <option value="btc">BTC</option>
                <option value="eth">ETH</option>
             </select>
           </div>
        </div>
      </div>

      <button onClick={handleSwap} disabled={!amount || from === to} className="mb-8 w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-50">
        Execute Order
      </button>
    </div>
  );
};

const MerchantScreen = ({ onBack, onPayment }: any) => {
  const [amount, setAmount] = useState('0');
  const [checkout, setCheckout] = useState(false);
  
  const handleKey = (k: string) => {
    if (k === 'C') setAmount('0');
    else setAmount(amount === '0' ? k : amount + k);
  };

  if (checkout) {
    const parsedAmt = parseFloat(amount) || 0;
    return (
      <div className="px-7 space-y-6 animate-fadeIn h-full flex flex-col items-center justify-center overflow-y-auto pb-10">
        <div className="text-center">
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Collect Payment</h3>
          <p className="text-indigo-600 text-3xl font-black mt-1">₦{parsedAmt.toLocaleString()}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full px-2">
           <PaymentCard icon="fa-building-columns" label="Bank Transfer" onClick={() => onPayment(parsedAmt, 'ngn')} />
           <PaymentCard icon="fa-qrcode" label="POS QR Pay" onClick={() => onPayment(parsedAmt, 'ngn')} />
           <PaymentCard icon="fa-circle-dollar-to-slot" label="USDT Stable" onClick={() => onPayment(parsedAmt/1550, 'usdt')} />
           <PaymentCard icon="fa-circle-dollar-to-slot" label="USDC Stable" onClick={() => onPayment(parsedAmt/1550, 'usdc')} />
           <PaymentCard icon="fa-bitcoin" label="BTC Network" brand onClick={() => onPayment(parsedAmt/102000000, 'btc')} />
           <PaymentCard icon="fa-ethereum" label="ETH Network" brand onClick={() => onPayment(parsedAmt/5400000, 'eth')} />
        </div>
        
        <button onClick={() => setCheckout(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4 active:underline hover:text-indigo-600 transition">Cancel Checkout</button>
      </div>
    );
  }

  return (
    <div className="px-7 space-y-7 animate-fadeIn h-full flex flex-col">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm active:scale-95 transition"><i className="fa-solid fa-chevron-left"></i></button>
        <h2 className="text-xl font-black tracking-tight text-gray-900">Merchant Terminal</h2>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-gray-900 rounded-[3rem] p-10 text-white mb-8 text-center shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-500 to-transparent"></div>
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Sale Amount (NGN)</p>
           <h3 className="text-5xl font-black tracking-tighter transition-all duration-300 transform scale-105">₦{(parseFloat(amount) || 0).toLocaleString()}</h3>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 flex-1 content-start">
           {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'C'].map(k => (
             <button key={k} onClick={() => handleKey(k.toString())} className="h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-xl font-black hover:bg-indigo-50 hover:text-indigo-600 transition active:scale-90 border border-transparent hover:border-indigo-100 shadow-sm">{k}</button>
           ))}
        </div>
      </div>

      <button onClick={() => setCheckout(true)} disabled={amount === '0'} className="mb-8 w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-50">Charge Customer</button>
    </div>
  );
};

const PaymentCard = ({ icon, label, brand, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 p-5 bg-gray-50 rounded-[2.5rem] border border-transparent hover:border-indigo-600 group transition-all active:scale-95 shadow-sm">
    <i className={`${brand ? 'fa-brands' : 'fa-solid'} ${icon} text-2xl text-gray-300 group-hover:text-indigo-600 transition-colors`}></i>
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">{label}</span>
  </button>
);

const AdvisorScreen = ({ onBack, history, gemini }: any) => {
  const [advice, setAdvice] = useState<string>("Analyzing your local and global assets...");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchAdvice = async () => {
      setIsTyping(true);
      const historyStr = history.map((h: any) => `${h.title}: ${h.amount}`).join(', ');
      try {
        const res = await gemini.getFinancialAdvice(historyStr, "Suggest a strategy for managing my Naira, USD, and Crypto (BTC, ETH, USDT, USDC) balances given the current exchange rates.");
        setAdvice(res);
      } catch (err) {
        setAdvice("Advisor currently evaluating market volatility. Please check back in a moment.");
      }
      setIsTyping(false);
    };
    fetchAdvice();
  }, []);

  return (
    <div className="px-7 space-y-7 animate-fadeIn h-full flex flex-col">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 active:scale-95 border border-gray-100 shadow-sm"><i className="fa-solid fa-chevron-left"></i></button>
        <h2 className="text-xl font-black tracking-tight text-gray-900">Smart Advisor</h2>
      </div>

      <div className="bg-indigo-50 rounded-[2.5rem] p-8 relative overflow-hidden flex-1 border border-indigo-100 flex flex-col shadow-inner">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl mb-6 shadow-xl shadow-indigo-100">
           <i className="fa-solid fa-brain"></i>
        </div>
        
        <div className="flex-1 space-y-6">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Localized Insights (Nigeria)</p>
          <div className="relative">
            {isTyping && (
              <div className="flex gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            )}
            <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">
              "{advice}"
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-indigo-100">
           <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition">Optimize Portfolio</button>
           <p className="text-[9px] text-center text-indigo-400 font-bold mt-4 uppercase tracking-widest">Gemini 3.0 Pro Insights • v1.0.4 Live</p>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
    <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-gray-100 group-hover:border-indigo-100 shadow-sm">
      <i className={`fa-solid ${icon} text-xl`}></i>
    </div>
    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
  </button>
);

const TransactionItem = ({ title, sub, amount, icon, positive }: any) => (
  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[2.5rem] border border-transparent hover:border-gray-100 transition-all cursor-pointer shadow-sm">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
        <i className={`fa-solid ${icon} text-lg`}></i>
      </div>
      <div>
        <p className="text-[12px] font-black text-gray-900 leading-tight">{title}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-tight mt-1">{sub}</p>
      </div>
    </div>
    <span className={`text-[13px] font-black ${positive ? 'text-emerald-500' : 'text-gray-900'}`}>{amount}</span>
  </div>
);

const Nav = ({ icon, active, onClick, label }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
    <i className={`fa-solid ${icon} text-xl transition ${active ? 'text-indigo-600 scale-110' : 'text-gray-300'}`}></i>
    <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${active ? 'text-indigo-600' : 'text-gray-400'}`}>{label}</span>
  </button>
);

const WalletScreen = ({ onNavigate, balances }: any) => (
  <div className="px-7 space-y-7 animate-fadeIn h-full pb-10">
    <h2 className="text-3xl font-black tracking-tight text-gray-900">Your Assets</h2>
    <div className="space-y-4">
      <AssetCard name="Nigerian Naira" code="NGN" amount={`₦${(balances.ngn || 0).toLocaleString()}`} icon="fa-naira-sign" bg="bg-emerald-600" onClick={() => onNavigate('AddCash')} />
      <AssetCard name="US Dollar" code="USD" amount={`$${(balances.usd || 0).toLocaleString()}`} icon="fa-dollar-sign" bg="bg-indigo-600" onClick={() => onNavigate('AddCash')} />
      <AssetCard name="Tether" code="USDT" amount={`${(balances.usdt || 0).toLocaleString()}`} icon="fa-circle-dollar-to-slot" bg="bg-teal-500" onClick={() => onNavigate('Swap')} />
      <AssetCard name="USD Coin" code="USDC" amount={`${(balances.usdc || 0).toLocaleString()}`} icon="fa-circle-dollar-to-slot" bg="bg-blue-500" onClick={() => onNavigate('Swap')} />
      <AssetCard name="Bitcoin" code="BTC" amount={(balances.btc || 0).toString()} val="$2,730.42" icon="fa-bitcoin" bg="bg-orange-500" isBrand onClick={() => onNavigate('Swap')} />
      <AssetCard name="Ethereum" code="ETH" amount={(balances.eth || 0).toString()} val="$4,312.11" icon="fa-ethereum" bg="bg-indigo-500" isBrand onClick={() => onNavigate('Swap')} />
    </div>
  </div>
);

const AssetCard = ({ name, code, amount, val, icon, bg, isBrand, onClick }: any) => (
  <div onClick={onClick} className="p-6 bg-white rounded-[3rem] border border-gray-100 shadow-sm flex justify-between items-center group active:scale-[0.98] transition-transform cursor-pointer">
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-current/20 transition-transform group-hover:scale-110`}>
        <i className={`${isBrand ? 'fa-brands' : 'fa-solid'} ${icon}`}></i>
      </div>
      <div>
        <h4 className="font-black text-base text-gray-900 leading-tight">{name}</h4>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{code}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-lg font-black text-gray-900 leading-tight">{amount}</p>
      {val && <p className="text-[11px] font-bold text-gray-400 mt-1">{val}</p>}
    </div>
  </div>
);

const AddCashScreen = ({ onBack, onTopUp }: any) => {
  const [amt, setAmt] = useState('');
  const [asset, setAsset] = useState<'ngn' | 'usd'>('ngn');
  
  const handleTopUp = () => {
    const val = parseFloat(amt);
    if (isNaN(val) || val <= 0) return;
    onTopUp(val, asset);
  };

  return (
    <div className="px-7 space-y-7 animate-fadeIn h-full flex flex-col">
       <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm active:scale-95 transition"><i className="fa-solid fa-chevron-left"></i></button>
        <h2 className="text-xl font-black tracking-tight text-gray-900">Funding</h2>
      </div>

      <div className="bg-gray-100 p-1.5 rounded-3xl flex shadow-inner">
        <button onClick={() => setAsset('ngn')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${asset === 'ngn' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>NGN</button>
        <button onClick={() => setAsset('usd')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${asset === 'usd' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>USD</button>
      </div>

      <div className="flex-1 space-y-6">
        <div className="bg-gray-50 p-7 rounded-[2.5rem] border border-gray-100 shadow-inner">
           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4">Amount to deposit ({asset.toUpperCase()})</label>
           <div className="flex items-center">
             <span className="text-3xl font-black text-gray-300 mr-2">{asset === 'ngn' ? '₦' : '$'}</span>
             <input type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-4xl font-black outline-none" />
           </div>
        </div>
        <div className="space-y-3">
           <DepositMethod icon="fa-building-columns" label="Bank Transfer" sub={asset === 'ngn' ? "Instant Virtual Account" : "International Wire"} onClick={handleTopUp} />
           <DepositMethod icon="fa-credit-card" label="Card Checkout" sub="Global Visa/Mastercard" onClick={handleTopUp} />
        </div>
      </div>
    </div>
  );
};

const DepositMethod = ({ icon, label, sub, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-indigo-600 group transition active:scale-95 text-left shadow-sm">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 shadow-sm transition-colors border border-gray-100">
        <i className={`fa-solid ${icon} text-lg`}></i>
      </div>
      <div>
        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{label}</p>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{sub}</p>
      </div>
    </div>
    <i className="fa-solid fa-chevron-right text-[10px] text-gray-300 group-hover:translate-x-1 transition-transform"></i>
  </button>
);

const BillsScreen = ({ onBack, onPay }: any) => {
  return (
    <div className="px-7 space-y-7 animate-fadeIn h-full flex flex-col">
       <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm active:scale-95 transition"><i className="fa-solid fa-chevron-left"></i></button>
        <h2 className="text-xl font-black tracking-tight text-gray-900">Bill Payments</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <BillItem icon="fa-lightbulb" label="Power (IKEDC)" onClick={() => onPay('Electricity (IKEDC)', 5000)} />
        <BillItem icon="fa-wifi" label="Data (MTN)" onClick={() => onPay('Data Plan (MTN)', 2500)} />
        <BillItem icon="fa-tv" label="Cable (DStv)" onClick={() => onPay('Cable TV (DStv)', 12000)} />
        <BillItem icon="fa-mobile-screen" label="Airtime (Airtel)" onClick={() => onPay('Airtime (Airtel)', 1000)} />
      </div>
    </div>
  );
};

const BillItem = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-[2.5rem] border border-transparent hover:border-indigo-600 hover:bg-white group transition-all active:scale-95 shadow-sm">
    <i className={`fa-solid ${icon} text-3xl text-gray-300 group-hover:text-indigo-600 transition-colors mb-3`}></i>
    <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-gray-900 tracking-tighter text-center">{label}</span>
  </button>
);

// FIX: Added missing PinOverlay component to handle secure transaction authorization within the mobile sandbox.
const PinOverlay = ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => {
  const [pin, setPin] = useState('');
  const handleKey = (k: string) => {
    if (k === 'C') setPin('');
    else if (pin.length < 4) {
      const newPin = pin + k;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === '1234') { // Mock PIN for Demo
          setTimeout(onSuccess, 500);
        } else {
          alert("Invalid PIN. Access Denied.");
          setPin('');
        }
      }
    }
  };

  return (
    <div className="absolute inset-0 bg-indigo-950/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-10 animate-fadeIn">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-2xl">
          <i className="fa-solid fa-lock"></i>
        </div>
        <h3 className="text-white text-2xl font-black tracking-tighter">Secure Terminal PIN</h3>
        <p className="text-indigo-300/60 text-[10px] font-black uppercase tracking-widest mt-2">Authorization Required</p>
      </div>

      <div className="flex gap-4 mb-12">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 border-indigo-500 transition-all ${pin.length > i ? 'bg-indigo-500 scale-125 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-transparent'}`}></div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'X'].map(k => (
          <button 
            key={k} 
            onClick={() => k === 'X' ? onCancel() : handleKey(k.toString())}
            className={`h-16 rounded-2xl flex items-center justify-center text-xl font-black transition-all active:scale-90 ${
              k === 'C' ? 'text-rose-500' : k === 'X' ? 'text-indigo-400' : 'text-white hover:bg-white/10'
            }`}
          >
            {k === 'X' ? <i className="fa-solid fa-xmark"></i> : k}
          </button>
        ))}
      </div>
    </div>
  );
};

// FIX: Added missing KYCScreen component to implement the identity verification pipeline using SmileIDAdapter.
const KYCScreen = ({ onBack, onComplete }: { onBack: () => void; onComplete: (status: SmileIDStatus) => void }) => {
  const [loading, setLoading] = useState(false);
  const [idNumber, setIdNumber] = useState('');
  const smileID = SmileIDAdapter.getInstance();

  const handleVerify = async () => {
    if (!idNumber) return;
    setLoading(true);
    try {
      const result = await smileID.submitIDVerification({
        userId: 'usr_jdoe_99',
        idType: 'NIN',
        idNumber,
        firstName: 'John',
        lastName: 'Doe',
        dob: '1990-01-01'
      });
      onComplete(result.status);
    } catch (err) {
      alert("Verification failed. Please check network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-7 space-y-7 animate-slideUp h-full flex flex-col">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm active:scale-95 transition"><i className="fa-solid fa-chevron-left"></i></button>
        <h2 className="text-xl font-black tracking-tight text-gray-900">Identity Verification</h2>
      </div>

      <div className="flex-1 space-y-8">
        <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <i className="fa-solid fa-shield-halved text-4xl text-indigo-600 mb-6 block"></i>
          <h3 className="text-lg font-black text-indigo-900 tracking-tight">Institutional Trust</h3>
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Tier 3 Enrollment</p>
          <p className="text-xs font-bold text-indigo-900/60 mt-4 leading-relaxed">Verifying your identity increases your daily transaction limit to ₦10,000,000 and enables merchant POS features.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Document Type</label>
            <div className="p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-black flex justify-between items-center cursor-pointer hover:bg-white transition-colors">
              <span>National ID (NIN)</span>
              <i className="fa-solid fa-chevron-down text-gray-300"></i>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">NIN Number</label>
            <input 
              type="text" 
              value={idNumber}
              onChange={e => setIdNumber(e.target.value)}
              placeholder="Enter 11-digit NIN" 
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold outline-none focus:border-indigo-600 transition shadow-sm" 
              maxLength={11}
            />
            <p className="text-[8px] font-bold text-gray-300 uppercase mt-1 px-1">Use 12345678901 for demo success.</p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleVerify}
        disabled={loading || idNumber.length < 11}
        className="mb-8 w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Start Verification'}
      </button>
    </div>
  );
};
