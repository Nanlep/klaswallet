
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  TextInput, 
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView
} from 'react-native';
import { NativeSecurity } from '../services/nativeSecurity';
import { GeminiService } from '../services/geminiService';
import { BaniAdapter } from '../services/baniAdapter';

const { width } = Dimensions.get('window');

type Screen = 'Splash' | 'Auth' | 'Home' | 'Swap' | 'Support' | 'Wallet' | 'KYC' | 'Settings' | 'Legal';

export const MobilePreview: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Splash');
  const [balances, setBalances] = useState({ usd: 12450.80, ngn: 250000.00 });
  const [liveBtc, setLiveBtc] = useState(64230.15);

  useEffect(() => {
    if (currentScreen === 'Splash') {
      const timer = setTimeout(() => setCurrentScreen('Auth'), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  useEffect(() => {
    const pollRates = async () => {
      // Simulate real polling from BaniAdapter
      try {
        const delta = (Math.random() - 0.5) * 40;
        setLiveBtc(prev => prev + delta);
      } catch (e) {}
    };
    const interval = setInterval(pollRates, 4000);
    return () => clearInterval(interval);
  }, []);
  
  const navigateTo = (screen: Screen) => {
    NativeSecurity.triggerHaptic('light');
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch(currentScreen) {
      case 'Splash': return <SplashScreen />;
      case 'Auth': return <AuthScreen onLogin={() => navigateTo('Home')} />;
      case 'Home': return <HomeScreen onNavigate={navigateTo} balances={balances} liveBtc={liveBtc} />;
      case 'Support': return <SupportScreen />;
      case 'Wallet': return <WalletScreen balances={balances} />;
      case 'KYC': return <KYCScreen onBack={() => navigateTo('Home')} />;
      case 'Swap': return <SwapScreen onBack={() => navigateTo('Home')} onExecute={() => navigateTo('Home')} />;
      case 'Settings': return <SettingsScreen onNavigate={navigateTo} onLogout={() => navigateTo('Auth')} />;
      case 'Legal': return <LegalScreen onBack={() => navigateTo('Settings')} />;
      default: return <HomeScreen onNavigate={navigateTo} balances={balances} liveBtc={liveBtc} />;
    }
  };

  return (
    <View style={styles.deviceContainer}>
      <View style={styles.iphoneFrame}>
        <SafeAreaView style={styles.safeArea}>
          {currentScreen !== 'Splash' && (
             <View style={styles.statusBar}><View style={styles.notch} /></View>
          )}
          <View style={styles.content}>{renderScreen()}</View>
          {currentScreen !== 'Auth' && currentScreen !== 'Splash' && (
            <View style={styles.tabBar}>
              <Tab icon="house" label="Home" active={currentScreen === 'Home'} onPress={() => navigateTo('Home')} />
              <Tab icon="wallet" label="Assets" active={currentScreen === 'Wallet'} onPress={() => navigateTo('Wallet')} />
              <Tab icon="headset" label="Support" active={currentScreen === 'Support'} onPress={() => navigateTo('Support')} />
              <Tab icon="gear" label="Settings" active={currentScreen === 'Settings'} onPress={() => navigateTo('Settings')} />
            </View>
          )}
        </SafeAreaView>
      </View>
    </View>
  );
};

const SplashScreen = () => (
  <View style={styles.splashContainer}>
    <View style={styles.logoContainerLarge}><i className="fa-solid fa-shield-halved" style={{ fontSize: 60, color: '#fff' }} /></View>
    <Text style={styles.splashTitle}>KlasWallet</Text>
    <View style={styles.splashFooter}><ActivityIndicator color="#fff" style={{ marginBottom: 20 }} /><Text style={styles.complianceNoteSplash}>Verified VASP Instance</Text></View>
  </View>
);

const Tab = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.tabItem}>
    <i className={`fa-solid fa-${icon}`} style={{ fontSize: 18, color: active ? '#4f46e5' : '#9ca3af' }} />
    <Text style={[styles.tabLabel, { color: active ? '#4f46e5' : '#9ca3af' }]}>{label}</Text>
  </TouchableOpacity>
);

const HomeScreen = ({ onNavigate, balances, liveBtc }: any) => (
  <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
    <View style={styles.header}>
      <View><Text style={styles.greeting}>Good Morning</Text><Text style={styles.userName}>Enterprise Admin</Text></View>
      <TouchableOpacity onPress={() => onNavigate('Settings')} style={styles.avatar}><Text style={styles.avatarText}>JD</Text></TouchableOpacity>
    </View>

    <View style={styles.liveTicker}><Text style={styles.tickerText}>LIVE BTC: ${liveBtc.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text><View style={styles.tickerDot} /></View>

    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}><Text style={styles.balanceLabel}>Liquidity Portfolio</Text><i className="fa-solid fa-shield-check" style={{ color: 'rgba(255,255,255,0.4)' }} /></View>
      <Text style={styles.balanceValue}>${balances.usd.toLocaleString()}</Text>
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>Deposit</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('Swap')} style={styles.actionBtnSecondary}><Text style={styles.actionBtnTextWhite}>Swap</Text></TouchableOpacity>
      </div>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <QuickAction icon="paper-plane" label="Send" />
        <QuickAction icon="qrcode" label="Invoice" />
        <QuickAction icon="id-card" label="KYC" onPress={() => onNavigate('KYC')} />
        <QuickAction icon="clock-rotate-left" label="Activity" />
      </div>
    </View>
  </ScrollView>
);

const QuickAction = ({ icon, label, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.gridItem}>
    <View style={styles.iconCircle}><i className={`fa-solid fa-${icon}`} style={{ color: '#4f46e5', fontSize: 20 }} /></View>
    <Text style={styles.gridLabel}>{label}</Text>
  </TouchableOpacity>
);

const SupportScreen = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Welcome to KlasWallet Support. How can I assist you with your institutional account?' }
  ]);
  const [loading, setLoading] = useState(false);
  const gemini = new GeminiService();

  const handleSend = async () => {
    if (!query.trim()) return;
    const msg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    const reply = await gemini.getSupportResponse(msg);
    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screenContainer}>
      <Text style={styles.titleNative}>Support</Text>
      <ScrollView style={styles.chatScroll} showsVerticalScrollIndicator={false}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
            <Text style={[styles.bubbleText, m.role === 'user' ? styles.textUser : styles.textAi]}>{m.text}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator color="#4f46e5" style={{ alignSelf: 'flex-start' }} />}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput value={query} onChangeText={setQuery} placeholder="Type your issue..." style={styles.chatInput} />
        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}><i className="fa-solid fa-paper-plane" style={{ color: '#fff' }} /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const LegalScreen = ({ onBack }: any) => (
  <ScrollView style={styles.screenContainer}>
    <TouchableOpacity onPress={onBack} style={styles.backBtn}><i className="fa-solid fa-chevron-left" /></TouchableOpacity>
    <Text style={styles.titleNative}>Legal</Text>
    <View style={styles.legalSection}>
      <Text style={styles.legalTitle}>Privacy Policy</Text>
      <Text style={styles.legalText}>KlasWallet is a licensed VASP. We collect KYC data mandated by the Central Bank and share it with SmileID for verification purposes only.</Text>
    </View>
    <View style={styles.legalSection}>
      <Text style={styles.legalTitle}>Terms of Service</Text>
      <Text style={styles.legalText}>Users must be 18+. Institutional accounts require corporate registration documents and proof of beneficial ownership.</Text>
    </View>
  </ScrollView>
);

const AuthScreen = ({ onLogin }: any) => (
  <View style={styles.screenContainerCenter}>
    <View style={styles.logoContainer}><i className="fa-solid fa-shield-halved" style={{ fontSize: 40, color: '#fff' }} /></View>
    <Text style={styles.title}>Secure Gateway</Text>
    <Text style={styles.subtitle}>Institutional Protection Active</Text>
    <TouchableOpacity style={styles.primaryButton} onPress={onLogin}><Text style={styles.primaryButtonText}>Initialize Session</Text></TouchableOpacity>
  </View>
);

const WalletScreen = ({ balances }: any) => (
  <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
     <Text style={styles.titleNative}>Portfolio</Text>
     <AssetItem name="Naira" code="NGN" amount={`₦${balances.ngn.toLocaleString()}`} color="#059669" />
     <AssetItem name="US Dollar" code="USD" amount={`$${balances.usd.toLocaleString()}`} color="#4f46e5" />
  </ScrollView>
);

const AssetItem = ({ name, code, amount, color }: any) => (
  <View style={styles.assetItem}>
    <View style={[styles.assetIcon, { backgroundColor: color }]} />
    <View style={styles.assetDetails}><Text style={styles.assetName}>{name}</Text><Text style={styles.assetCode}>{code}</Text></View>
    <Text style={styles.assetAmount}>{amount}</Text>
  </View>
);

const SettingsScreen = ({ onNavigate, onLogout }: any) => (
  <View style={styles.screenContainer}>
    <Text style={styles.titleNative}>Settings</Text>
    <View style={styles.settingsBox}>
       <TouchableOpacity style={styles.settingsRow} onPress={() => onNavigate('KYC')}>
         <Text style={styles.settingsLabel}>Verification Status</Text>
         <Text style={styles.settingsVal}>Tier 3</Text>
       </TouchableOpacity>
       <TouchableOpacity style={styles.settingsRow} onPress={() => onNavigate('Legal')}>
         <Text style={styles.settingsLabel}>Legal & Privacy</Text>
         <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1', fontSize: 12 }} />
       </TouchableOpacity>
    </View>
    <Text style={styles.versionLabel}>Version 1.1.0 • Licensed VASP</Text>
    <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}><Text style={styles.logoutText}>End Session</Text></TouchableOpacity>
  </View>
);

const SwapScreen = ({ onBack, onExecute }: any) => (
  <View style={styles.screenContainer}>
    <TouchableOpacity onPress={onBack} style={styles.backBtn}><i className="fa-solid fa-chevron-left" /></TouchableOpacity>
    <Text style={styles.titleNative}>Exchange</Text>
    <View style={styles.swapBox}><Text style={styles.swapVal}>BTC -> USD</Text></View>
    <TouchableOpacity style={styles.primaryButton} onPress={onExecute}><Text style={styles.primaryButtonText}>Execute Swap</Text></TouchableOpacity>
  </View>
);

const KYCScreen = ({ onBack }: any) => (
  <View style={styles.screenContainer}>
    <TouchableOpacity onPress={onBack} style={styles.backBtn}><i className="fa-solid fa-chevron-left" /></TouchableOpacity>
    <Text style={styles.titleNative}>Verification</Text>
    <View style={styles.kycCard}>
      <Text style={styles.kycText}>Tier 3 Institutional Verification Active</Text>
      <View style={styles.safetyCard}>
        <i className="fa-solid fa-user-shield" style={{ color: '#16a34a', fontSize: 24, marginBottom: 10 }} />
        <Text style={styles.safetyTitle}>Data Safety Disclosure</Text>
        <Text style={styles.safetyText}>Your biometric data is encrypted and shared only with SmileID for regulatory compliance. We do not store plain-text IDs.</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  deviceContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  iphoneFrame: { width: 375, height: 812, backgroundColor: '#fff', borderRadius: 50, borderWidth: 10, borderColor: '#0f172a', overflow: 'hidden', position: 'relative' },
  safeArea: { flex: 1 },
  statusBar: { height: 44, alignItems: 'center', zIndex: 10 },
  notch: { width: 160, height: 34, backgroundColor: '#0f172a', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  content: { flex: 1 },
  tabBar: { height: 85, borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', backgroundColor: '#fff', paddingBottom: 25 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 9, fontWeight: '900', marginTop: 5, textTransform: 'uppercase' },
  
  splashContainer: { flex: 1, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  logoContainerLarge: { width: 100, height: 100, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  splashTitle: { color: '#fff', fontSize: 32, fontWeight: '900' },
  splashFooter: { position: 'absolute', bottom: 60, alignItems: 'center' },
  complianceNoteSplash: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  screenContainer: { flex: 1, padding: 24 },
  screenContainerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  userName: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  avatar: { width: 44, height: 44, backgroundColor: '#4f46e5', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '900' },

  liveTicker: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  tickerText: { fontSize: 10, fontWeight: '900', color: '#4f46e5', marginRight: 8 },
  tickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },

  balanceCard: { backgroundColor: '#0f172a', borderRadius: 32, padding: 28 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  balanceLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  balanceValue: { color: '#fff', fontSize: 36, fontWeight: '900' },
  actionBtn: { flex: 1, height: 50, backgroundColor: '#fff', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionBtnSecondary: { flex: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: '#0f172a', fontWeight: '900', fontSize: 12, textTransform: 'uppercase' },
  actionBtnTextWhite: { color: '#fff', fontWeight: '900', fontSize: 12, textTransform: 'uppercase' },

  section: { marginTop: 35 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 20 },
  gridItem: { alignItems: 'center', width: '22%' },
  iconCircle: { width: 56, height: 56, backgroundColor: '#f8fafc', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  gridLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },

  titleNative: { fontSize: 32, fontWeight: '900', color: '#0f172a', marginBottom: 30 },
  chatScroll: { flex: 1, marginBottom: 15 },
  bubble: { padding: 16, borderRadius: 20, marginBottom: 10, maxWidth: '85%' },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#4f46e5' },
  bubbleAi: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9' },
  bubbleText: { fontSize: 14, fontWeight: '600' },
  textUser: { color: '#fff' },
  textAi: { color: '#0f172a' },
  inputRow: { flexDirection: 'row', gap: 10, paddingBottom: 10 },
  chatInput: { flex: 1, height: 56, backgroundColor: '#f1f5f9', borderRadius: 28, paddingHorizontal: 20 },
  sendBtn: { width: 56, height: 56, backgroundColor: '#4f46e5', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },

  logoContainer: { width: 70, height: 70, backgroundColor: '#4f46e5', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 8, marginBottom: 30 },
  primaryButton: { width: '100%', height: 64, backgroundColor: '#4f46e5', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' },

  assetItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20, borderRadius: 24, marginBottom: 12 },
  assetIcon: { width: 44, height: 44, borderRadius: 14 },
  assetDetails: { flex: 1, marginLeft: 15 },
  assetName: { fontSize: 16, fontWeight: '900' },
  assetCode: { fontSize: 10, color: '#94a3b8' },
  assetAmount: { fontSize: 16, fontWeight: '900' },

  settingsBox: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 24, marginBottom: 15 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  settingsLabel: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  settingsVal: { fontSize: 12, fontWeight: '900', color: '#10b981' },
  versionLabel: { textAlign: 'center', fontSize: 9, fontWeight: '800', color: '#cbd5e1', marginBottom: 30, textTransform: 'uppercase' },
  logoutBtn: { alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '900', fontSize: 11, textTransform: 'uppercase' },

  backBtn: { width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  swapBox: { backgroundColor: '#f8fafc', padding: 30, borderRadius: 24, marginBottom: 30, alignItems: 'center' },
  swapVal: { fontSize: 24, fontWeight: '900', color: '#4f46e5' },
  kycCard: { backgroundColor: '#f0fdf4', padding: 30, borderRadius: 24, borderWidth: 1, borderColor: '#bbf7d0' },
  kycText: { color: '#166534', fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  safetyCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center' },
  safetyTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginBottom: 5 },
  safetyText: { fontSize: 11, color: '#64748b', textAlign: 'center', lineHeight: 16 },

  legalSection: { marginBottom: 25 },
  legalTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  legalText: { fontSize: 13, color: '#64748b', lineHeight: 20 }
});
