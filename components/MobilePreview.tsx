
import React, { useState, useEffect, useRef } from 'react';
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
  Platform,
  Image,
  Animated,
  KeyboardAvoidingView
} from 'react-native';
import { NativeSecurity } from '../services/nativeSecurity';
import { GeminiService } from '../services/geminiService';

const { width, height } = Dimensions.get('window');

type Screen = 'Splash' | 'Auth' | 'Home' | 'Swap' | 'Advisor' | 'Wallet' | 'KYC' | 'Settings';

export const MobilePreview: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Splash');
  const [balances, setBalances] = useState({ usd: 12450.80, ngn: 250000.00 });
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  useEffect(() => {
    if (currentScreen === 'Splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('Auth');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);
  
  const navigateTo = (screen: Screen) => {
    NativeSecurity.triggerHaptic('light');
    setCurrentScreen(screen);
  };

  const runAuthorizedAction = async (action: () => void) => {
    setIsAuthorizing(true);
    const result = await NativeSecurity.authenticateBiometrics();
    if (result.success) {
      NativeSecurity.triggerHaptic('success');
      action();
    } else {
      NativeSecurity.triggerHaptic('error');
    }
    setIsAuthorizing(false);
  };

  const renderScreen = () => {
    switch(currentScreen) {
      case 'Splash': return <SplashScreen />;
      case 'Auth': return <AuthScreen onLogin={() => navigateTo('Home')} />;
      case 'Home': return <HomeScreen onNavigate={navigateTo} balances={balances} />;
      case 'Wallet': return <WalletScreen balances={balances} />;
      case 'Advisor': return <AdvisorScreen />;
      case 'KYC': return <KYCScreen onBack={() => navigateTo('Home')} />;
      case 'Swap': return <SwapScreen onBack={() => navigateTo('Home')} onExecute={() => runAuthorizedAction(() => navigateTo('Home'))} />;
      case 'Settings': return <SettingsScreen onLogout={() => navigateTo('Auth')} />;
      default: return <HomeScreen onNavigate={navigateTo} balances={balances} />;
    }
  };

  return (
    <View style={styles.deviceContainer}>
      <View style={styles.iphoneFrame}>
        <SafeAreaView style={styles.safeArea}>
          {currentScreen !== 'Splash' && (
             <View style={styles.statusBar}>
                <View style={styles.notch} />
             </View>
          )}
          
          <View style={styles.content}>
            {renderScreen()}
          </View>

          {currentScreen !== 'Auth' && currentScreen !== 'Splash' && (
            <View style={styles.tabBar}>
              <Tab icon="house" label="Home" active={currentScreen === 'Home'} onPress={() => navigateTo('Home')} />
              <Tab icon="wallet" label="Assets" active={currentScreen === 'Wallet'} onPress={() => navigateTo('Wallet')} />
              <Tab icon="brain" label="Advisor" active={currentScreen === 'Advisor'} onPress={() => navigateTo('Advisor')} />
              <Tab icon="gear" label="Settings" active={currentScreen === 'Settings'} onPress={() => navigateTo('Settings')} />
            </View>
          )}

          {isAuthorizing && (
            <View style={styles.authOverlay}>
              <View style={styles.authModal}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.authText}>Verifying Identity...</Text>
                <Text style={styles.authSubText}>Secure Enclave Active</Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>
    </View>
  );
};

const SplashScreen = () => (
  <View style={styles.splashContainer}>
    <View style={styles.logoContainerLarge}>
      <i className="fa-solid fa-shield-halved" style={{ fontSize: 60, color: '#fff' }} />
    </View>
    <Text style={styles.splashTitle}>KlasWallet</Text>
    <View style={styles.splashFooter}>
       <ActivityIndicator color="#fff" style={{ marginBottom: 20 }} />
       <Text style={styles.complianceNoteSplash}>Verified Institutional Provider</Text>
    </View>
  </View>
);

const Tab = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.tabItem}>
    <i className={`fa-solid fa-${icon}`} style={{ fontSize: 18, color: active ? '#4f46e5' : '#9ca3af' }} />
    <Text style={[styles.tabLabel, { color: active ? '#4f46e5' : '#9ca3af' }]}>{label}</Text>
  </TouchableOpacity>
);

const AuthScreen = ({ onLogin }: any) => (
  <View style={styles.screenContainerCenter}>
    <View style={styles.logoContainer}>
      <i className="fa-solid fa-shield-halved" style={{ fontSize: 40, color: '#fff' }} />
    </View>
    <Text style={styles.title}>Secure Gateway</Text>
    <Text style={styles.subtitle}>Institutional Grade Protection</Text>
    
    <View style={styles.inputGroup}>
      <TextInput placeholder="Admin Email" style={styles.input} placeholderTextColor="#9ca3af" />
      <TextInput placeholder="Master PIN" secureTextEntry style={styles.input} placeholderTextColor="#9ca3af" maxLength={6} />
    </View>

    <TouchableOpacity style={styles.primaryButton} onPress={onLogin}>
      <Text style={styles.primaryButtonText}>Initialize Terminal</Text>
    </TouchableOpacity>
    
    <View style={styles.authFooter}>
       <i className="fa-solid fa-fingerprint" style={{ color: '#4f46e5', fontSize: 32 }} />
       <Text style={styles.biometricPrompt}>Tap for Biometrics</Text>
    </View>
  </View>
);

const AdvisorScreen = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Institutional Smart Advisor online. How can I optimize your liquidity today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const gemini = new GeminiService();

  const handleAsk = async () => {
    if (!query.trim()) return;
    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    
    try {
      const response = await gemini.getFinancialAdvice("Current balance: $12,450.80 USD, NGN 250,000. Frequent BTC swaps.", userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Strategic analysis failed. Reconnecting to Gemini..." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screenContainer}>
      <Text style={styles.titleNative}>Smart Advisor</Text>
      <ScrollView style={styles.chatScroll} showsVerticalScrollIndicator={false}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.messageBubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.messageText, m.role === 'user' ? styles.userText : styles.aiText]}>{m.text}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator color="#4f46e5" style={{ alignSelf: 'flex-start', marginLeft: 10 }} />}
      </ScrollView>
      <View style={styles.chatInputRow}>
        <TextInput 
          value={query} 
          onChangeText={setQuery} 
          placeholder="Ask AI Strategy..." 
          style={styles.chatInput} 
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity style={styles.chatSendBtn} onPress={handleAsk}>
          <i className="fa-solid fa-paper-plane" style={{ color: '#fff' }} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const HomeScreen = ({ onNavigate, balances }: any) => (
  <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Managed Portfolio</Text>
        <Text style={styles.userName}>Enterprise Terminal</Text>
      </View>
      <TouchableOpacity onPress={() => onNavigate('Settings')} style={styles.avatar}>
        <Text style={styles.avatarText}>JD</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>Total Liquidity (USD)</Text>
        <i className="fa-solid fa-shield-check" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }} />
      </View>
      <Text style={styles.balanceValue}>${balances.usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Fund</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnSecondary}>
          <Text style={styles.actionBtnTextWhite}>Swap</Text>
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Global Treasury</Text>
      <View style={styles.grid}>
        <QuickAction icon="paper-plane" label="Transfer" />
        <QuickAction icon="qrcode" label="Merchant" />
        <QuickAction icon="file-invoice-dollar" label="Settlements" />
        <QuickAction icon="user-shield" label="Compliance" onPress={() => onNavigate('KYC')} />
      </View>
    </View>

    <View style={styles.aiSnippet}>
       <View style={styles.aiSnippetHeader}>
          <i className="fa-solid fa-brain" style={{ color: '#4f46e5', marginRight: 8 }} />
          <Text style={styles.aiSnippetTitle}>Advisor Insight</Text>
       </View>
       <Text style={styles.aiSnippetText}>USD rates are volatile. Consider hedging 15% in BTC cluster for the next 72h.</Text>
    </View>
  </ScrollView>
);

const QuickAction = ({ icon, label, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.gridItem}>
    <View style={styles.iconCircle}>
      <i className={`fa-solid fa-${icon}`} style={{ color: '#4f46e5', fontSize: 20 }} />
    </View>
    <Text style={styles.gridLabel}>{label}</Text>
  </TouchableOpacity>
);

const SwapScreen = ({ onBack, onExecute }: any) => (
  <View style={styles.screenContainer}>
    <View style={styles.navHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backButtonCircle}>
        <i className="fa-solid fa-chevron-left" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Asset Exchange</Text>
      <View style={{ width: 40 }} />
    </View>

    <View style={styles.swapCard}>
       <Text style={styles.inputLabel}>Sell (From Liquidity)</Text>
       <View style={styles.swapInputRow}>
         <TextInput style={styles.swapInput} value="0.0425" keyboardType="numeric" />
         <View style={styles.currencyTag}>
            <i className="fa-brands fa-bitcoin" style={{ color: '#f59e0b', marginRight: 6 }} />
            <Text style={styles.currencyTabText}>BTC</Text>
         </View>
       </View>
    </View>

    <View style={styles.swapIconRow}>
      <View style={styles.swapDivider} />
      <View style={styles.swapIconCircle}>
        <i className="fa-solid fa-arrow-right-arrow-left" style={{ color: '#4f46e5', transform: 'rotate(90deg)' }} />
      </View>
      <View style={styles.swapDivider} />
    </View>

    <View style={styles.swapCardActive}>
       <Text style={styles.inputLabelActive}>Receive (Target Asset)</Text>
       <View style={styles.swapInputRow}>
         <Text style={styles.swapInputStatic}>2,730.42</Text>
         <View style={styles.currencyTagActive}>
            <i className="fa-solid fa-dollar-sign" style={{ color: '#fff', marginRight: 6 }} />
            <Text style={styles.currencyTabTextWhite}>USD</Text>
         </View>
       </View>
    </View>

    <TouchableOpacity style={styles.confirmBtn} onPress={onExecute}>
      <Text style={styles.primaryButtonText}>Commit To Ledger</Text>
    </TouchableOpacity>
  </View>
);

const WalletScreen = ({ balances }: any) => (
  <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
     <Text style={styles.titleNative}>Asset Registry</Text>
     <AssetItem name="Nigerian Naira" code="NGN" amount={`₦${balances.ngn.toLocaleString()}`} icon="naira-sign" color="#059669" />
     <AssetItem name="US Dollar" code="USD" amount={`$${balances.usd.toLocaleString()}`} icon="dollar-sign" color="#4f46e5" />
     <AssetItem name="Bitcoin" code="BTC" amount="0.0425" icon="bitcoin" isBrand color="#f59e0b" />
     <AssetItem name="Ethereum" code="ETH" amount="1.2501" icon="ethereum" isBrand color="#6366f1" />
  </ScrollView>
);

const AssetItem = ({ name, code, amount, icon, color, isBrand }: any) => (
  <View style={styles.assetItem}>
    <View style={[styles.assetIcon, { backgroundColor: color }]}>
      <i className={`${isBrand ? 'fa-brands' : 'fa-solid'} fa-${icon}`} style={{ color: '#fff', fontSize: 20 }} />
    </View>
    <View style={styles.assetDetails}>
      <Text style={styles.assetName}>{name}</Text>
      <Text style={styles.assetCode}>{code} Cluster</Text>
    </View>
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={styles.assetAmount}>{amount}</Text>
      <Text style={styles.assetValue}>$2,740.12</Text>
    </View>
  </View>
);

const SettingsScreen = ({ onLogout }: any) => (
  <ScrollView style={styles.screenContainer}>
    <View style={styles.profileHeader}>
      <View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>JD</Text></View>
      <Text style={styles.profileName}>Institutional Admin</Text>
      <Text style={styles.profileEmail}>NG-VASP-2024-429-A</Text>
    </View>

    <View style={styles.settingsSection}>
       <SettingRow icon="shield-halved" label="Biometric Access" value="ACTIVE" />
       <SettingRow icon="key" label="Secure Storage" value="ENCLAVE" />
       <SettingRow icon="circle-info" label="Version" value="1.1.0-PRO" />
    </View>

    <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
      <Text style={styles.logoutText}>Terminate Terminal Session</Text>
    </TouchableOpacity>
  </ScrollView>
);

const SettingRow = ({ icon, label, value }: any) => (
  <TouchableOpacity style={styles.settingRow}>
    <View style={styles.settingLeft}>
      <View style={styles.settingIconBg}>
        <i className={`fa-solid fa-${icon}`} style={{ color: '#4f46e5', fontSize: 14 }} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      <i className="fa-solid fa-chevron-right" style={{ color: '#d1d5db', fontSize: 10, marginLeft: 10 }} />
    </View>
  </TouchableOpacity>
);

const KYCScreen = ({ onBack }: any) => (
  <View style={styles.screenContainer}>
    <TouchableOpacity onPress={onBack} style={styles.backButtonCircle}>
      <i className="fa-solid fa-chevron-left" />
    </TouchableOpacity>
    <Text style={styles.titleNative}>Compliance</Text>
    <Text style={styles.kycDescription}>Verify your physical identity via SmileID to unlock institutional limits.</Text>
    <TouchableOpacity style={styles.primaryButton}><Text style={styles.primaryButtonText}>Scan Document</Text></TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  deviceContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  iphoneFrame: {
    width: 375,
    height: 812,
    backgroundColor: '#fff',
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#0f172a',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
  },
  safeArea: { flex: 1 },
  statusBar: { height: 44, alignItems: 'center' },
  notch: { width: 160, height: 34, backgroundColor: '#0f172a', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  content: { flex: 1 },
  tabBar: { height: 85, borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', backgroundColor: '#ffffff', paddingBottom: 25 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 9, fontWeight: '900', marginTop: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  splashContainer: { flex: 1, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  logoContainerLarge: { width: 120, height: 120, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  splashTitle: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: -1.5 },
  splashFooter: { position: 'absolute', bottom: 60, alignItems: 'center' },
  complianceNoteSplash: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },

  screenContainer: { flex: 1, padding: 24 },
  screenContainerCenter: { flex: 1, padding: 40, justifyContent: 'center', alignItems: 'center' },
  
  logoContainer: { width: 84, height: 84, backgroundColor: '#4f46e5', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 10 },
  title: { fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  subtitle: { fontSize: 11, fontWeight: '800', color: '#64748b', marginTop: 8, marginBottom: 40, textTransform: 'uppercase', letterSpacing: 1 },
  inputGroup: { width: '100%', gap: 16 },
  input: { width: '100%', height: 68, backgroundColor: '#f8fafc', borderRadius: 20, paddingHorizontal: 24, fontSize: 16, fontWeight: '600', borderWidth: 1, borderColor: '#f1f5f9' },
  primaryButton: { width: '100%', height: 72, backgroundColor: '#4f46e5', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: 32, shadowColor: '#4f46e5', shadowOpacity: 0.2, shadowRadius: 15 },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  authFooter: { marginTop: 45, alignItems: 'center', gap: 15 },
  biometricPrompt: { fontSize: 11, fontWeight: '900', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35 },
  greeting: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  userName: { fontSize: 26, fontWeight: '900', color: '#0f172a', marginTop: 4 },
  avatar: { width: 48, height: 48, backgroundColor: '#4f46e5', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  
  balanceCard: { backgroundColor: '#0f172a', borderRadius: 36, padding: 32, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
  balanceValue: { color: '#fff', fontSize: 42, fontWeight: '900', letterSpacing: -2 },
  actionRow: { flexDirection: 'row', marginTop: 30, gap: 12 },
  actionBtn: { flex: 1, height: 56, backgroundColor: '#fff', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  actionBtnSecondary: { flex: 1, height: 56, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: '#0f172a', fontWeight: '900', fontSize: 13, textTransform: 'uppercase' },
  actionBtnTextWhite: { color: '#fff', fontWeight: '900', fontSize: 13, textTransform: 'uppercase' },
  
  section: { marginTop: 45 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 25 },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  gridItem: { alignItems: 'center', width: '22%' },
  iconCircle: { width: 64, height: 64, backgroundColor: '#f8fafc', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  gridLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' },

  aiSnippet: { marginTop: 40, backgroundColor: '#f5f3ff', borderRadius: 28, padding: 25, borderWidth: 1, borderColor: '#ddd6fe' },
  aiSnippetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiSnippetTitle: { fontSize: 12, fontWeight: '900', color: '#4f46e5', textTransform: 'uppercase' },
  aiSnippetText: { fontSize: 14, color: '#4f46e5', fontWeight: '600', lineHeight: 22 },

  chatScroll: { flex: 1, marginBottom: 20 },
  messageBubble: { padding: 18, borderRadius: 24, marginBottom: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#4f46e5' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9' },
  messageText: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#0f172a' },
  chatInputRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  chatInput: { flex: 1, height: 60, backgroundColor: '#f1f5f9', borderRadius: 30, paddingHorizontal: 25, fontSize: 15, fontWeight: '600' },
  chatSendBtn: { width: 60, height: 60, backgroundColor: '#4f46e5', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },

  navHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35 },
  backButtonCircle: { width: 44, height: 44, backgroundColor: '#f1f5f9', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  swapCard: { backgroundColor: '#f8fafc', borderRadius: 32, padding: 28 },
  swapCardActive: { backgroundColor: '#f5f3ff', borderRadius: 32, padding: 28, borderWidth: 1, borderColor: '#ddd6fe' },
  inputLabel: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 18 },
  inputLabelActive: { fontSize: 11, fontWeight: '900', color: '#4f46e5', textTransform: 'uppercase', marginBottom: 18 },
  swapInputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  swapInput: { fontSize: 36, fontWeight: '900', color: '#0f172a', flex: 1 },
  swapInputStatic: { fontSize: 36, fontWeight: '900', color: '#4f46e5', flex: 1 },
  currencyTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  currencyTagActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4f46e5', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  currencyTabText: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  currencyTabTextWhite: { fontSize: 13, fontWeight: '900', color: '#fff' },
  swapIconRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  swapDivider: { flex: 1, height: 2, backgroundColor: '#f1f5f9' },
  swapIconCircle: { width: 52, height: 52, backgroundColor: '#fff', borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#f1f5f9' },
  confirmBtn: { width: '100%', height: 76, backgroundColor: '#4f46e5', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginTop: 'auto', marginBottom: 20 },

  authOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  authModal: { backgroundColor: '#fff', padding: 45, borderRadius: 36, alignItems: 'center', width: '85%', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 25 },
  authText: { color: '#0f172a', marginTop: 25, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 14 },
  authSubText: { color: '#94a3b8', marginTop: 8, fontWeight: '800', fontSize: 10, textTransform: 'uppercase' },

  titleNative: { fontSize: 34, fontWeight: '900', color: '#0f172a', marginBottom: 35, letterSpacing: -1.5 },
  assetItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 24, borderRadius: 32, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9' },
  assetIcon: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  assetDetails: { flex: 1, marginLeft: 20 },
  assetName: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  assetCode: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 4 },
  assetAmount: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  assetValue: { fontSize: 12, fontWeight: '800', color: '#10b981', marginTop: 4 },

  profileHeader: { alignItems: 'center', paddingVertical: 50 },
  profileAvatar: { width: 100, height: 100, backgroundColor: '#f5f3ff', borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 25, borderWidth: 5, borderColor: '#fff' },
  profileAvatarText: { fontSize: 32, fontWeight: '900', color: '#4f46e5' },
  profileName: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
  profileEmail: { fontSize: 12, fontWeight: '800', color: '#94a3b8', marginTop: 8, textTransform: 'uppercase', letterSpacing: 1.5 },
  settingsSection: { marginTop: 15, backgroundColor: '#f8fafc', borderRadius: 36, padding: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 22, paddingHorizontal: 18 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  settingIconBg: { width: 38, height: 38, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5 },
  settingLabel: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  settingValue: { fontSize: 13, fontWeight: '800', color: '#4f46e5' },
  logoutBtn: { marginTop: 50, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 },

  kycDescription: { fontSize: 17, color: '#64748b', fontWeight: '600', lineHeight: 26, marginBottom: 45 }
});
