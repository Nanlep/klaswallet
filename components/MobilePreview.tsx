
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
  KeyboardAvoidingView,
  Platform,
  Clipboard
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { NativeSecurity } from '../services/nativeSecurity';
import { GeminiService, InsightResult } from '../services/geminiService';
import { BaniAdapter } from '../services/baniAdapter';

const { width } = Dimensions.get('window');

type Screen = 'Splash' | 'Auth' | 'Home' | 'Swap' | 'Support' | 'Wallet' | 'KYC' | 'Settings' | 'Advisor' | 'POS' | 'Deposit' | 'Withdraw' | 'Send' | 'Success';

const ScreenHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
      <FontAwesome6 name="chevron-left" size={20} color="#0f172a" />
    </TouchableOpacity>
    <Text style={styles.userName}>{title}</Text>
    <View style={{ width: 40 }} />
  </View>
);

export const MobilePreview: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Splash');
  const [balances, setBalances] = useState({ usd: 12450.80, ngn: 250000.00, btc: 0.42, usdt: 1500.00 });
  const [liveBtc, setLiveBtc] = useState(64230.15);
  const [lastTx, setLastTx] = useState<any>(null);

  useEffect(() => {
    if (currentScreen === 'Splash') {
      const timer = setTimeout(() => setCurrentScreen('Auth'), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const navigateTo = (screen: Screen) => {
    NativeSecurity.triggerHaptic('light');
    setCurrentScreen(screen);
  };

  const handleTxSuccess = (details: any) => {
    setLastTx(details);
    navigateTo('Success');
  };

  const renderScreen = () => {
    switch(currentScreen) {
      case 'Splash': return <SplashScreen />;
      case 'Auth': return <AuthScreen onLogin={() => navigateTo('Home')} />;
      case 'Home': return <HomeScreen onNavigate={navigateTo} balances={balances} liveBtc={liveBtc} />;
      case 'Support': return <SupportScreen onBack={() => navigateTo('Home')} />;
      case 'Wallet': return <WalletScreen balances={balances} onBack={() => navigateTo('Home')} />;
      case 'KYC': return <KYCScreen onBack={() => navigateTo('Home')} />;
      case 'Swap': return <SwapScreen onBack={() => navigateTo('Home')} onConfirm={handleTxSuccess} balances={balances} liveBtc={liveBtc} />;
      case 'POS': return <POSScreen onBack={() => navigateTo('Home')} onPaid={handleTxSuccess} />;
      case 'Deposit': return <DepositScreen onBack={() => navigateTo('Home')} onGenerated={handleTxSuccess} />;
      case 'Withdraw': return <WithdrawScreen onBack={() => navigateTo('Home')} onConfirm={handleTxSuccess} />;
      case 'Send': return <SendScreen onBack={() => navigateTo('Home')} onConfirm={handleTxSuccess} />;
      case 'Success': return <SuccessScreen details={lastTx} onDone={() => navigateTo('Home')} />;
      default: return <HomeScreen onNavigate={navigateTo} balances={balances} liveBtc={liveBtc} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>{renderScreen()}</View>
        {['Home', 'Advisor', 'Support', 'Settings', 'Wallet'].includes(currentScreen) && (
          <View style={styles.tabBar}>
            <Tab icon="house" label="Home" active={currentScreen === 'Home'} onPress={() => navigateTo('Home')} />
            <Tab icon="chart-line" label="Advisor" active={currentScreen === 'Advisor'} onPress={() => navigateTo('Advisor')} />
            <Tab icon="wallet" label="Wallet" active={currentScreen === 'Wallet'} onPress={() => navigateTo('Wallet')} />
            <Tab icon="headset" label="Support" active={currentScreen === 'Support'} onPress={() => navigateTo('Support')} />
            <Tab icon="gear" label="Settings" active={currentScreen === 'Settings'} onPress={() => navigateTo('Settings')} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const Tab = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.tabItem}>
    <FontAwesome6 name={icon} size={18} color={active ? '#4f46e5' : '#9ca3af'} />
    <Text style={[styles.tabLabel, { color: active ? '#4f46e5' : '#9ca3af' }]}>{label}</Text>
  </TouchableOpacity>
);

const SplashScreen = () => (
  <View style={styles.splashContainer}>
    <FontAwesome6 name="shield-halved" size={60} color="#fff" />
    <Text style={styles.splashTitle}>KlasWallet</Text>
    <View style={styles.splashFooter}>
      <ActivityIndicator color="#fff" size="large" style={{ marginBottom: 20 }} />
      <Text style={styles.complianceNoteSplash}>VASP LICENSE: NG-VASP-2024-429-A</Text>
    </View>
  </View>
);

const AuthScreen = ({ onLogin }: any) => (
  <View style={styles.screenContainerCenter}>
    <View style={styles.logoContainer}>
      <FontAwesome6 name="shield-halved" size={40} color="#fff" />
    </View>
    <Text style={styles.title}>Secure Gateway</Text>
    <Text style={styles.subtitle}>Production Node: 1.1.0-LTS</Text>
    <TouchableOpacity style={styles.primaryButton} onPress={onLogin}>
      <Text style={styles.primaryButtonText}>Unlock Terminal</Text>
    </TouchableOpacity>
  </View>
);

const HomeScreen = ({ onNavigate, balances, liveBtc }: any) => (
  <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>PROD TERMINAL</Text>
        <Text style={styles.userName}>Enterprise Admin</Text>
      </View>
      <TouchableOpacity onPress={() => onNavigate('Settings')} style={styles.avatar}>
        <FontAwesome6 name="user-tie" size={18} color="#fff" />
      </TouchableOpacity>
    </View>

    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>Main Portfolio (USD)</Text>
        <FontAwesome6 name="lock" size={12} color="rgba(255,255,255,0.4)" />
      </View>
      <Text style={styles.balanceValue}>${balances.usd.toLocaleString()}</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
        <TouchableOpacity onPress={() => onNavigate('Deposit')} style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('Swap')} style={styles.actionBtnSecondary}>
          <Text style={styles.actionBtnTextWhite}>Swap</Text>
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Merchant & Utility Ops</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 15 }}>
        <QuickAction icon="paper-plane" label="Send" onPress={() => onNavigate('Send')} />
        <QuickAction icon="money-bill-transfer" label="Withdraw" onPress={() => onNavigate('Withdraw')} />
        <QuickAction icon="cash-register" label="POS" onPress={() => onNavigate('POS')} active />
        <QuickAction icon="id-card-clip" label="KYC" onPress={() => onNavigate('KYC')} />
      </View>
    </View>
  </ScrollView>
);

const QuickAction = ({ icon, label, onPress, active }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.gridItem}>
    <View style={[styles.iconCircle, active && styles.iconCircleActive]}>
      <FontAwesome6 name={icon} size={20} color={active ? '#fff' : '#4f46e5'} />
    </View>
    <Text style={styles.gridLabel}>{label}</Text>
  </TouchableOpacity>
);

const DepositScreen = ({ onBack, onGenerated }: any) => {
  const [method, setMethod] = useState<'bank' | 'crypto' | null>(null);
  const [loading, setLoading] = useState(false);

  const generateDetails = async () => {
    setLoading(true);
    // Simulate generation of dynamic account/address
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    onGenerated({
      type: 'Deposit',
      title: method === 'bank' ? 'Virtual NGN Account' : 'BTC Deposit Address',
      value: method === 'bank' ? '9012384755 (Klas-Bani)' : 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      icon: method === 'bank' ? 'building-columns' : 'bitcoin'
    });
  };

  return (
    <View style={styles.screenContainer}>
      <ScreenHeader title="Deposit" onBack={onBack} />
      <Text style={styles.sectionTitle}>Select Inflow Source</Text>
      <TouchableOpacity 
        style={[styles.assetItem, method === 'bank' && styles.assetItemActive]} 
        onPress={() => setMethod('bank')}
      >
        <FontAwesome6 name="building-columns" size={20} color="#10b981" />
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.assetName}>Bank Transfer (NGN)</Text>
          <Text style={styles.assetCode}>Instant Settlement</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.assetItem, method === 'crypto' && styles.assetItemActive]} 
        onPress={() => setMethod('crypto')}
      >
        <FontAwesome6 name="bitcoin" size={20} color="#f59e0b" />
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.assetName}>Crypto Inflow</Text>
          <Text style={styles.assetCode}>BTC / USDT / ETH</Text>
        </View>
      </TouchableOpacity>
      {method && (
        <TouchableOpacity style={[styles.primaryButton, { marginTop: 'auto' }]} onPress={generateDetails}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Generate Details</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
};

const SwapScreen = ({ onBack, onConfirm, balances, liveBtc }: any) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const bani = BaniAdapter.getInstance();

  const handleSwap = async () => {
    if (!amount) return;
    setLoading(true);
    const auth = await NativeSecurity.authenticateBiometrics();
    if (auth.success) {
      NativeSecurity.triggerHaptic('success');
      onConfirm({
        type: 'Exchange',
        title: 'Swap Completed',
        value: `${amount} USD ➔ ${(parseFloat(amount) / (liveBtc * 1.015)).toFixed(8)} BTC`,
        icon: 'arrow-right-arrow-left'
      });
    } else {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScreenHeader title="Swap Assets" onBack={onBack} />
      <View style={styles.inputCard}>
        <Text style={styles.balanceLabel}>Sell USD</Text>
        <TextInput 
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          style={styles.largeInput}
          keyboardType="numeric"
        />
        <Text style={styles.assetCode}>Balance: ${balances.usd.toLocaleString()}</Text>
      </View>
      <FontAwesome6 name="down-up-lock" size={24} color="#4f46e5" style={{ alignSelf: 'center', marginVertical: 30 }} />
      <View style={styles.inputCard}>
        <Text style={styles.balanceLabel}>Receive BTC</Text>
        <Text style={styles.largeInput}>{(parseFloat(amount || '0') / (liveBtc * 1.015)).toFixed(8)}</Text>
        <Text style={styles.assetCode}>Rate: 1 BTC = ${(liveBtc * 1.015).toLocaleString()}</Text>
      </View>
      <TouchableOpacity style={[styles.primaryButton, { marginTop: 'auto' }]} onPress={handleSwap}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Authorize Swap</Text>}
      </TouchableOpacity>
    </View>
  );
};

const POSScreen = ({ onBack, onPaid }: any) => {
  const [amount, setAmount] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [isAwaiting, setIsAwaiting] = useState(false);

  const initiatePayment = () => {
    if (!amount) return;
    setIsAwaiting(true);
    NativeSecurity.triggerHaptic('medium');
    // Simulate real-time payment detection
    setTimeout(() => {
      onPaid({
        type: 'POS Sale',
        title: 'Merchant Paid',
        value: `₦${parseFloat(amount).toLocaleString()}`,
        icon: 'cash-register'
      });
    }, 5000);
  };

  const coins = ['USDT', 'USDC', 'BTC', 'ETH'];

  if (isAwaiting) {
    return (
      <View style={styles.screenContainerCenter}>
        <Text style={styles.userName}>Awaiting {selectedCoin}...</Text>
        <View style={styles.qrPlaceholder}>
          <FontAwesome6 name="qrcode" size={160} color="#0f172a" />
        </View>
        <Text style={styles.balanceValue}>₦{parseFloat(amount).toLocaleString()}</Text>
        <ActivityIndicator color="#4f46e5" style={{ marginTop: 20 }} />
        <Text style={styles.tickerText}>Blockchain Listening Active...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <ScreenHeader title="POS Terminal" onBack={onBack} />
      <View style={styles.posDial}>
        <Text style={styles.balanceLabel}>Charge Amount (NGN)</Text>
        <TextInput 
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          style={styles.posMainInput}
          keyboardType="numeric"
        />
      </View>
      <Text style={styles.sectionTitle}>Select Settlement Asset</Text>
      <View style={styles.coinGrid}>
        {coins.map(c => (
          <TouchableOpacity 
            key={c} 
            style={[styles.coinBtn, selectedCoin === c && styles.coinBtnActive]}
            onPress={() => setSelectedCoin(c)}
          >
            <Text style={[styles.coinBtnText, selectedCoin === c && styles.coinBtnTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={[styles.primaryButton, { marginTop: 'auto' }]} onPress={initiatePayment}>
        <Text style={styles.primaryButtonText}>Generate Invoice</Text>
      </TouchableOpacity>
    </View>
  );
};

const SendScreen = ({ onBack, onConfirm }: any) => {
  const [dest, setDest] = useState('');
  const [amt, setAmt] = useState('');
  const [loading, setLoading] = useState(false);

  const executeSend = async () => {
    if (!dest || !amt) return;
    setLoading(true);
    const auth = await NativeSecurity.authenticateBiometrics();
    if (auth.success) {
      onConfirm({
        type: 'Transfer',
        title: 'Sent Successfully',
        value: `$${amt} to ${dest.substring(0,8)}...`,
        icon: 'paper-plane'
      });
    } else {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScreenHeader title="Send Assets" onBack={onBack} />
      <TextInput placeholder="Recipient Address" style={styles.input} value={dest} onChangeText={setDest} />
      <TextInput placeholder="Amount (USD)" style={[styles.input, { marginTop: 15 }]} value={amt} onChangeText={setAmt} keyboardType="numeric" />
      <TouchableOpacity style={[styles.primaryButton, { marginTop: 'auto' }]} onPress={executeSend}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Authorize Transfer</Text>}
      </TouchableOpacity>
    </View>
  );
};

const WithdrawScreen = ({ onBack, onConfirm }: any) => {
  const [bank, setBank] = useState('');
  const [amt, setAmt] = useState('');

  const executeWithdraw = async () => {
    const auth = await NativeSecurity.authenticateBiometrics();
    if (auth.success) {
      onConfirm({
        type: 'Withdrawal',
        title: 'Settlement Initiated',
        value: `₦${parseFloat(amt).toLocaleString()} to ${bank}`,
        icon: 'money-bill-transfer'
      });
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScreenHeader title="Withdraw" onBack={onBack} />
      <TextInput placeholder="Destination Account" style={styles.input} value={bank} onChangeText={setBank} />
      <TextInput placeholder="Amount (NGN)" style={[styles.input, { marginTop: 15 }]} value={amt} onChangeText={setAmt} keyboardType="numeric" />
      <TouchableOpacity style={[styles.primaryButton, { marginTop: 'auto' }]} onPress={executeWithdraw}>
        <Text style={styles.primaryButtonText}>Withdraw Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const SuccessScreen = ({ details, onDone }: any) => (
  <View style={styles.screenContainerCenter}>
    <View style={styles.successCircle}>
      <FontAwesome6 name={details?.icon || "check"} size={40} color="#fff" />
    </View>
    <Text style={styles.title}>{details?.type} Success</Text>
    <Text style={styles.subtitle}>{details?.title}</Text>
    <View style={styles.receipt}>
      <Text style={styles.receiptValue}>{details?.value}</Text>
    </View>
    <TouchableOpacity style={styles.primaryButton} onPress={onDone}>
      <Text style={styles.primaryButtonText}>Return to Home</Text>
    </TouchableOpacity>
  </View>
);

const WalletScreen = ({ balances, onBack }: any) => (
  <View style={styles.screenContainer}>
    <ScreenHeader title="Ledger" onBack={onBack} />
    <ScrollView style={{ marginTop: 20 }}>
      <AssetItem name="US Dollar" code="USD" amount={`$${balances.usd.toLocaleString()}`} color="#4f46e5" />
      <AssetItem name="Nigerian Naira" code="NGN" amount={`₦${balances.ngn.toLocaleString()}`} color="#10b981" />
      <AssetItem name="Bitcoin" code="BTC" amount={`${balances.btc} BTC`} color="#f59e0b" />
      <AssetItem name="USDT" code="USDT" amount={`$${balances.usdt.toLocaleString()}`} color="#26a17b" />
    </ScrollView>
  </View>
);

const AssetItem = ({ name, code, amount, color }: any) => (
  <View style={styles.assetItem}>
    <View style={[styles.assetIcon, { backgroundColor: color }]} />
    <View style={styles.assetDetails}><Text style={styles.assetName}>{name}</Text><Text style={styles.assetCode}>{code}</Text></View>
    <Text style={styles.assetAmount}>{amount}</Text>
  </View>
);

// Simplified Reused Components
const SupportScreen = ({ onBack }: any) => (<View style={styles.screenContainer}><ScreenHeader title="Support" onBack={onBack} /><Text>Support Channel Active</Text></View>);
const AdvisorScreen = ({ onBack }: any) => (<View style={styles.screenContainer}><ScreenHeader title="Advisor" onBack={onBack} /><Text>AI Node Grounding...</Text></View>);
const KYCScreen = ({ onBack }: any) => (<View style={styles.screenContainer}><ScreenHeader title="KYC" onBack={onBack} /><Text>Verified VASP Status</Text></View>);
const SettingsScreen = ({ onNavigate, onLogout }: any) => (<View style={styles.screenContainer}><ScreenHeader title="Settings" onBack={() => onNavigate('Home')} /><TouchableOpacity onPress={onLogout}><Text style={{ color: '#ef4444', fontWeight: '900', marginTop: 40 }}>Terminated Session</Text></TouchableOpacity></View>);

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  content: { flex: 1 },
  tabBar: { height: 70, borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', backgroundColor: '#fff', paddingBottom: Platform.OS === 'ios' ? 15 : 5 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 9, fontWeight: '900', marginTop: 4, textTransform: 'uppercase' },
  splashContainer: { flex: 1, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  splashTitle: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 20 },
  splashFooter: { position: 'absolute', bottom: 60, alignItems: 'center' },
  complianceNoteSplash: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  screenContainer: { flex: 1, padding: 20 },
  screenContainerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  userName: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  avatar: { width: 44, height: 44, backgroundColor: '#4f46e5', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  balanceCard: { backgroundColor: '#0f172a', borderRadius: 28, padding: 25 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  balanceLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  balanceValue: { color: '#fff', fontSize: 32, fontWeight: '900' },
  actionBtn: { flex: 1, height: 48, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionBtnSecondary: { flex: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: '#0f172a', fontWeight: '900', fontSize: 12, textTransform: 'uppercase' },
  actionBtnTextWhite: { color: '#fff', fontWeight: '900', fontSize: 12, textTransform: 'uppercase' },
  section: { marginTop: 30 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 15 },
  gridItem: { alignItems: 'center', width: '22%' },
  iconCircle: { width: 56, height: 56, backgroundColor: '#f8fafc', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  iconCircleActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  gridLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
  logoContainer: { width: 70, height: 70, backgroundColor: '#4f46e5', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 8, marginBottom: 30 },
  primaryButton: { width: '100%', height: 60, backgroundColor: '#4f46e5', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  assetItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 18, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  assetItemActive: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  assetIcon: { width: 40, height: 40, borderRadius: 12 },
  assetDetails: { flex: 1, marginLeft: 15 },
  assetName: { fontSize: 15, fontWeight: '900' },
  assetCode: { fontSize: 10, color: '#94a3b8' },
  assetAmount: { fontSize: 15, fontWeight: '900' },
  inputCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  largeInput: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  posMainInput: { fontSize: 48, fontWeight: '900', textAlign: 'center', color: '#0f172a', marginTop: 20 },
  posDial: { paddingVertical: 40, alignItems: 'center' },
  coinGrid: { flexDirection: 'row', gap: 10, marginBottom: 40 },
  coinBtn: { flex: 1, height: 50, backgroundColor: '#f1f5f9', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  coinBtnActive: { backgroundColor: '#0f172a' },
  coinBtnText: { fontWeight: '900', color: '#64748b', fontSize: 12 },
  coinBtnTextActive: { color: '#fff' },
  successCircle: { width: 80, height: 80, backgroundColor: '#10b981', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  receipt: { backgroundColor: '#f8fafc', width: '100%', padding: 25, borderRadius: 24, marginVertical: 30, borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1' },
  receiptValue: { fontSize: 18, fontWeight: '900', color: '#0f172a', textAlign: 'center' },
  input: { backgroundColor: '#f8fafc', padding: 18, borderRadius: 18, borderWidth: 1, borderColor: '#f1f5f9', fontSize: 14, fontWeight: '600' },
  qrPlaceholder: { width: 220, height: 220, backgroundColor: '#fff', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginVertical: 30 },
  backBtn: { padding: 5, marginRight: 10 },
  tickerText: { fontSize: 10, fontWeight: '900', color: '#4f46e5', marginTop: 10 }
});
