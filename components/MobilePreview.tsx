
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
import { GeminiService, InsightResult } from '../services/geminiService';

const { width, height } = Dimensions.get('window');

type Screen = 'Splash' | 'Auth' | 'Home' | 'Swap' | 'Support' | 'Wallet' | 'KYC' | 'Settings' | 'Legal' | 'Advisor' | 'POS' | 'Deposit' | 'Withdraw' | 'Send';

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
      case 'Support': return <SupportScreen onBack={() => navigateTo('Home')} />;
      case 'Wallet': return <WalletScreen balances={balances} />;
      case 'KYC': return <KYCScreen onBack={() => navigateTo('Home')} />;
      case 'Swap': return <SwapScreen onBack={() => navigateTo('Home')} onExecute={() => navigateTo('Home')} />;
      case 'Settings': return <SettingsScreen onNavigate={navigateTo} onLogout={() => navigateTo('Auth')} />;
      case 'Legal': return <LegalScreen onBack={() => navigateTo('Settings')} />;
      case 'Advisor': return <AdvisorScreen onBack={() => navigateTo('Home')} />;
      case 'POS': return <POSScreen onBack={() => navigateTo('Home')} />;
      case 'Deposit': return <DepositScreen onBack={() => navigateTo('Home')} />;
      case 'Withdraw': return <WithdrawScreen onBack={() => navigateTo('Home')} />;
      case 'Send': return <SendScreen onBack={() => navigateTo('Home')} />;
      default: return <HomeScreen onNavigate={navigateTo} balances={balances} liveBtc={liveBtc} />;
    }
  };

  return (
    <View style={styles.deviceContainer}>
      <View style={styles.iphoneFrameShadow}>
        <View style={styles.iphoneFrame}>
          <SafeAreaView style={styles.safeArea}>
            {currentScreen !== 'Splash' && (
              <View style={styles.statusBar}><View style={styles.notch} /></View>
            )}
            <View style={styles.content}>{renderScreen()}</View>
            {currentScreen !== 'Auth' && currentScreen !== 'Splash' && !['POS', 'Swap', 'Deposit', 'Withdraw', 'Send'].includes(currentScreen) && (
              <View style={styles.tabBar}>
                <Tab icon="house" label="Home" active={currentScreen === 'Home'} onPress={() => navigateTo('Home')} />
                <Tab icon="chart-line" label="Advisor" active={currentScreen === 'Advisor'} onPress={() => navigateTo('Advisor')} />
                <Tab icon="headset" label="Support" active={currentScreen === 'Support'} onPress={() => navigateTo('Support')} />
                <Tab icon="gear" label="Settings" active={currentScreen === 'Settings'} onPress={() => navigateTo('Settings')} />
              </View>
            )}
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
};

const Tab = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.tabItem}>
    <i className={`fa-solid fa-${icon}`} style={{ fontSize: 18, color: active ? '#4f46e5' : '#9ca3af' }} />
    <Text style={[styles.tabLabel, { color: active ? '#4f46e5' : '#9ca3af' }]}>{label}</Text>
  </TouchableOpacity>
);

const SendScreen = ({ onBack }: any) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!recipient || !amount) return;
    setIsSending(true);
    await NativeSecurity.authenticateBiometrics();
    NativeSecurity.triggerHaptic('success');
    setTimeout(() => {
      setIsSending(false);
      onBack();
    }, 2000);
  };

  return (
    <View style={styles.screenContainerFull}>
      <View style={styles.posTop}>
        <TouchableOpacity onPress={onBack} style={styles.posCloseBtn}><i className="fa-solid fa-arrow-left" /></TouchableOpacity>
        <Text style={styles.posTitle}>Send Funds</Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingVertical: 12, flex: 1 }}>
        <Text style={styles.sectionTitle}>Internal Peer Transfer</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Recipient Tag or Email</Text>
          <TextInput style={styles.addressInput} value={recipient} onChangeText={setRecipient} placeholder="@username or email" placeholderTextColor="#cbd5e1" />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Amount to Send</Text>
          <TextInput style={styles.mainInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#cbd5e1" />
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={[styles.primaryButton, (!recipient || !amount) && styles.posGenBtnDisabled]} onPress={handleSend} disabled={!recipient || !amount || isSending}>
          {isSending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Send Instantly</Text>}
        </TouchableOpacity>
        <Text style={styles.complianceNote}>Zero-fee internal transfers are atomic and irreversible.</Text>
      </View>
    </View>
  );
};

const DepositScreen = ({ onBack }: any) => (
  <View style={styles.screenContainerFull}>
    <View style={styles.posTop}>
      <TouchableOpacity onPress={onBack} style={styles.posCloseBtn}><i className="fa-solid fa-arrow-left" /></TouchableOpacity>
      <Text style={styles.posTitle}>Deposit Funds</Text>
    </View>
    <ScrollView style={{ paddingHorizontal: 24, paddingVertical: 12 }}>
      <Text style={styles.sectionTitle}>Institutional Bank Transfer</Text>
      <View style={styles.accountCard}>
        <Text style={styles.accountLabel}>Bank Name</Text>
        <Text style={styles.accountValue}>Bani Microfinance / Providus</Text>
        <View style={styles.divider} />
        <Text style={styles.accountLabel}>Account Number</Text>
        <Text style={styles.accountValueLarge}>9904218821</Text>
        <View style={styles.divider} />
        <Text style={styles.accountLabel}>Beneficiary</Text>
        <Text style={styles.accountValue}>KlasWallet Enterprise - JD</Text>
      </View>
      <View style={styles.infoBox}>
        <i className="fa-solid fa-circle-info" style={{ color: '#4f46e5', marginRight: 10 }} />
        <Text style={styles.infoText}>Funds sent to this virtual account will be credited to your NGN pool within 5-10 minutes.</Text>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onBack}>
        <Text style={styles.primaryButtonText}>I've Made the Transfer</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

const WithdrawScreen = ({ onBack }: any) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'crypto' | 'bank'>('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleWithdraw = async () => {
    if (!amount) return;
    setIsProcessing(true);
    await NativeSecurity.authenticateBiometrics();
    NativeSecurity.triggerHaptic('success');
    setTimeout(() => {
      setIsProcessing(false);
      onBack();
    }, 2000);
  };

  return (
    <View style={styles.screenContainerFull}>
      <View style={styles.posTop}>
        <TouchableOpacity onPress={onBack} style={styles.posCloseBtn}><i className="fa-solid fa-arrow-left" /></TouchableOpacity>
        <Text style={styles.posTitle}>Withdraw Funds</Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingVertical: 12, flex: 1 }}>
        <View style={styles.toggleRow}>
           <TouchableOpacity onPress={() => setMethod('bank')} style={[styles.toggleBtn, method === 'bank' && styles.toggleBtnActive]}>
             <Text style={[styles.toggleText, method === 'bank' && styles.toggleTextActive]}>Bank Transfer</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={() => setMethod('crypto')} style={[styles.toggleBtn, method === 'crypto' && styles.toggleBtnActive]}>
             <Text style={[styles.toggleText, method === 'crypto' && styles.toggleTextActive]}>Crypto Wallet</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Amount to Withdraw</Text>
          <TextInput style={styles.mainInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#cbd5e1" />
        </View>

        {method === 'bank' ? (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Saved Bank Account</Text>
            <View style={styles.savedBankCard}>
              <i className="fa-solid fa-building-columns" style={{ color: '#4f46e5', marginRight: 15 }} />
              <View>
                <Text style={{ fontWeight: '900', color: '#0f172a' }}>Kuda Bank • 2021</Text>
                <Text style={{ fontSize: 10, color: '#94a3b8' }}>JOHN DOE ENTERPRISE</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Recipient Wallet Address</Text>
            <TextInput style={styles.addressInput} placeholder="0x... or ENS" placeholderTextColor="#cbd5e1" />
          </View>
        )}

        <View style={{ flex: 1 }} />
        <TouchableOpacity style={[styles.primaryButton, !amount && styles.posGenBtnDisabled]} onPress={handleWithdraw} disabled={!amount || isProcessing}>
          {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Confirm Payout</Text>}
        </TouchableOpacity>
        <Text style={styles.complianceNote}>VASP Rule: Withdrawals over ₦500,000 may require manual audit.</Text>
      </View>
    </View>
  );
};

const SwapScreen = ({ onBack, onExecute }: any) => {
  const [isQuoting, setIsQuoting] = useState(false);
  const [quote, setQuote] = useState<any>(null);

  const getQuote = () => {
    setIsQuoting(true);
    NativeSecurity.triggerHaptic('medium');
    setTimeout(() => {
      setQuote({
        rate: 1540.25,
        fee: 1.5,
        total: 1517146.25
      });
      setIsQuoting(false);
    }, 1500);
  };

  return (
    <View style={styles.screenContainerFull}>
      <View style={styles.posTop}>
        <TouchableOpacity onPress={onBack} style={styles.posCloseBtn}><i className="fa-solid fa-arrow-left" /></TouchableOpacity>
        <Text style={styles.posTitle}>Currency Swap</Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingVertical: 12, flex: 1 }}>
        <View style={styles.swapInterface}>
          <View style={styles.swapCard}>
            <Text style={styles.swapLabel}>Sell</Text>
            <View style={styles.swapRow}>
               <Text style={styles.swapCurrency}>USD</Text>
               <TextInput style={styles.swapInput} placeholder="1,000" placeholderTextColor="#94a3b8" keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.swapArrow}>
             <View style={styles.arrowCircle}><i className="fa-solid fa-arrow-down" style={{ color: '#4f46e5' }} /></View>
          </View>
          <View style={styles.swapCard}>
            <Text style={styles.swapLabel}>Buy (Estimated)</Text>
            <View style={styles.swapRow}>
               <Text style={styles.swapCurrency}>NGN</Text>
               <Text style={styles.swapOutput}>1,540,250</Text>
            </View>
          </View>
        </View>

        {quote ? (
          <View style={styles.quoteDetails}>
             <View style={styles.quoteRow}><Text style={styles.quoteLabel}>Exchange Rate</Text><Text style={styles.quoteVal}>₦1,540.25 / $1</Text></View>
             <View style={styles.quoteRow}><Text style={styles.quoteLabel}>VASP Fee (1.5%)</Text><Text style={styles.quoteVal}>₦23,103.75</Text></View>
             <View style={styles.divider} />
             <View style={styles.quoteRow}><Text style={styles.quoteLabelTotal}>Total Settlement</Text><Text style={styles.quoteValTotal}>₦1,517,146.25</Text></View>
          </View>
        ) : null}

        <View style={{ flex: 1 }} />
        
        {!quote ? (
          <TouchableOpacity style={styles.primaryButton} onPress={getQuote} disabled={isQuoting}>
            {isQuoting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Get Live Quote</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={onExecute}>
            <Text style={styles.primaryButtonText}>Confirm Atomic Swap</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const POSScreen = ({ onBack }: any) => {
  const [amount, setAmount] = useState('0');
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceStatus, setInvoiceStatus] = useState<'idle' | 'qr' | 'confirming' | 'success'>('idle');
  
  const handlePress = (val: string) => {
    NativeSecurity.triggerHaptic('light');
    if (amount === '0') setAmount(val);
    else if (amount.length < 10) setAmount(prev => prev + val);
  };

  const handleClear = () => {
    NativeSecurity.triggerHaptic('medium');
    setAmount('0');
  };

  const generateInvoice = () => {
    NativeSecurity.triggerHaptic('success');
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setInvoiceStatus('qr');
      setTimeout(() => setInvoiceStatus('confirming'), 4000);
      setTimeout(() => setInvoiceStatus('success'), 8000);
    }, 1500);
  };

  if (invoiceStatus !== 'idle') {
    return (
      <View style={styles.posOverlay}>
        <TouchableOpacity style={styles.posBack} onPress={() => setInvoiceStatus('idle')}>
          <i className="fa-solid fa-xmark text-white" />
        </TouchableOpacity>
        
        {invoiceStatus === 'qr' && (
          <View style={styles.qrContainer}>
            <Text style={styles.posHeader}>Accept BTC</Text>
            <Text style={styles.posAmountDisplay}>₦{parseFloat(amount).toLocaleString()}</Text>
            <View style={styles.qrCodeBox}>
              <i className="fa-solid fa-qrcode text-slate-900" style={{ fontSize: 120 }} />
            </View>
            <Text style={styles.posStatusText}>Scan with any Bitcoin Wallet</Text>
            <ActivityIndicator color="#4f46e5" style={{ marginTop: 20 }} />
          </View>
        )}

        {invoiceStatus === 'confirming' && (
          <View style={styles.qrContainer}>
            <i className="fa-solid fa-hourglass-start text-amber-500 mb-6" style={{ fontSize: 60 }} />
            <Text style={styles.posHeader}>Broadcasting...</Text>
            <Text style={styles.posSubText}>Waiting for network confirmation.</Text>
            <ActivityIndicator color="#fbbf24" style={{ marginTop: 20 }} />
          </View>
        )}

        {invoiceStatus === 'success' && (
          <View style={styles.qrContainer}>
             <View style={styles.successIconCircle}>
               <i className="fa-solid fa-check text-white" style={{ fontSize: 40 }} />
             </View>
            <Text style={styles.posHeader}>Payment Received</Text>
            <View style={styles.receiptBox}>
               <ReceiptRow label="Settled To" value="NGN Liquidity" />
               <ReceiptRow label="Amount" value={`₦${parseFloat(amount).toLocaleString()}`} />
               <ReceiptRow label="VASP Ref" value="KLS-491-X" />
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={() => { setAmount('0'); setInvoiceStatus('idle'); }}>
              <Text style={styles.doneBtnText}>New Transaction</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.screenContainerFull}>
      <View style={styles.posTop}>
        <TouchableOpacity onPress={onBack} style={styles.posCloseBtn}><i className="fa-solid fa-arrow-left" /></TouchableOpacity>
        <Text style={styles.posTitle}>Crypto Terminal</Text>
        <View style={styles.posBadge}><Text style={styles.posBadgeText}>ONLINE</Text></View>
      </View>

      <View style={styles.posDisplay}>
        <Text style={styles.posCurrency}>AMOUNT IN NAIRA</Text>
        <Text style={styles.posMainValue} numberOfLines={1}>₦{parseFloat(amount).toLocaleString()}</Text>
      </View>

      <View style={styles.numpad}>
        <View style={styles.numRow}>
          <NumKey val="1" onPress={handlePress} />
          <NumKey val="2" onPress={handlePress} />
          <NumKey val="3" onPress={handlePress} />
        </View>
        <View style={styles.numRow}>
          <NumKey val="4" onPress={handlePress} />
          <NumKey val="5" onPress={handlePress} />
          <NumKey val="6" onPress={handlePress} />
        </View>
        <View style={styles.numRow}>
          <NumKey val="7" onPress={handlePress} />
          <NumKey val="8" onPress={handlePress} />
          <NumKey val="9" onPress={handlePress} />
        </View>
        <View style={styles.numRow}>
          <NumKey val="." onPress={handlePress} />
          <NumKey val="0" onPress={handlePress} />
          <TouchableOpacity style={styles.numBtn} onPress={handleClear}>
            <i className="fa-solid fa-delete-left text-rose-500 text-2xl" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.posActionArea}>
        <TouchableOpacity style={[styles.posGenBtn, amount === '0' && styles.posGenBtnDisabled]} onPress={generateInvoice} disabled={amount === '0' || isGenerating}>
          {isGenerating ? <ActivityIndicator color="#fff" /> : <Text style={styles.posGenBtnText}>Collect Payment</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HomeScreen = ({ onNavigate, balances, liveBtc }: any) => (
  <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
    <View style={styles.header}>
      <View><Text style={styles.greeting}>Good Morning</Text><Text style={styles.userName}>Enterprise Admin</Text></View>
      <TouchableOpacity onPress={() => onNavigate('Settings')} style={styles.avatar}><Text style={styles.avatarText}>JD</Text></TouchableOpacity>
    </View>

    <View style={styles.liveTicker}><Text style={styles.tickerText}>BTC TICKER: ${liveBtc.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text><View style={styles.tickerDot} /></View>

    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}><Text style={styles.balanceLabel}>Liquidity Portfolio</Text><i className="fa-solid fa-shield-check" style={{ color: 'rgba(255,255,255,0.4)' }} /></View>
      <Text style={styles.balanceValue}>${balances.usd.toLocaleString()}</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
        <TouchableOpacity onPress={() => onNavigate('Deposit')} style={styles.actionBtn}><Text style={styles.actionBtnText}>Deposit</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('Swap')} style={styles.actionBtnSecondary}><Text style={styles.actionBtnTextWhite}>Swap</Text></TouchableOpacity>
      </View>
    </View>

    <TouchableOpacity onPress={() => onNavigate('Advisor')} style={styles.advisorPulseCard}>
       <View style={styles.pulseHeader}>
          <Text style={styles.pulseTag}>Smart Insight</Text>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#fff' }} />
       </View>
       <Text style={styles.pulseTitle}>Market analysis for BTC is currently shifting. Get AI Advice.</Text>
       <Text style={styles.pulseAction}>Open Market Advisor →</Text>
    </TouchableOpacity>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <QuickAction icon="paper-plane" label="Send" onPress={() => onNavigate('Send')} />
        <QuickAction icon="wallet" label="Withdraw" onPress={() => onNavigate('Withdraw')} />
        <QuickAction icon="cash-register" label="POS" onPress={() => onNavigate('POS')} active />
        <QuickAction icon="id-card" label="KYC" onPress={() => onNavigate('KYC')} />
      </View>
    </View>
  </ScrollView>
);

const AdvisorScreen = ({ onBack }: any) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<InsightResult | null>(null);
  const gemini = new GeminiService();

  const fetchInsight = async () => {
    setLoading(true);
    const result = await gemini.getMarketInsights("Current BTC vs NGN market outlook");
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => { fetchInsight(); }, []);

  return (
    <ScrollView style={styles.screenContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}><i className="fa-solid fa-chevron-left" /></TouchableOpacity>
      <Text style={styles.titleNative}>AI Advisor</Text>
      <Text style={styles.advisorSubtitle}>Real-time analysis grounded in global search.</Text>

      {loading ? (
        <View style={styles.loadingFull}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Polling Global Markets...</Text>
        </View>
      ) : insight ? (
        <View style={styles.advisorContent}>
          <View style={styles.insightCard}>
             <Text style={styles.insightText}>{insight.text}</Text>
          </View>
          
          <Text style={styles.sourceLabel}>Grounded Sources:</Text>
          {insight.sources.map((src, i) => (
            <TouchableOpacity key={i} style={styles.sourceCard} onPress={() => window.open(src.uri, '_blank')}>
               <View style={styles.sourceIcon}><i className="fa-solid fa-link" style={{ fontSize: 10, color: '#4f46e5' }} /></View>
               <View style={{ flex: 1 }}>
                  <Text style={styles.sourceTitle} numberOfLines={1}>{src.title}</Text>
                  <Text style={styles.sourceUri} numberOfLines={1}>{src.uri}</Text>
               </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity onPress={fetchInsight} style={styles.refreshBtn}>
             <Text style={styles.refreshBtnText}>Refresh Market Pulse</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
};

const SupportScreen = ({ onBack }: any) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Welcome to KlasWallet Support. How can I assist you today?' }
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
    <View style={styles.screenContainerFull}>
      <View style={styles.posTop}>
        <TouchableOpacity onPress={onBack} style={styles.posCloseBtn}><i className="fa-solid fa-arrow-left" /></TouchableOpacity>
        <Text style={styles.posTitle}>Institutional Support</Text>
      </View>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, padding: 24 }}>
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

const QuickAction = ({ icon, label, onPress, active }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.gridItem}>
    <View style={[styles.iconCircle, active && styles.iconCircleActive]}>
      <i className={`fa-solid fa-${icon}`} style={{ color: active ? '#fff' : '#4f46e5', fontSize: 20 }} />
    </View>
    <Text style={styles.gridLabel}>{label}</Text>
  </TouchableOpacity>
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

const LegalScreen = ({ onBack }: any) => (
  <ScrollView style={styles.screenContainer}>
    <TouchableOpacity onPress={onBack} style={styles.backBtn}><i className="fa-solid fa-chevron-left" /></TouchableOpacity>
    <Text style={styles.titleNative}>Legal</Text>
    <View style={styles.legalSection}>
      <Text style={styles.legalTitle}>Privacy Policy</Text>
      <Text style={styles.legalText}>KlasWallet is a licensed VASP. We collect KYC data mandated by the Central Bank and share it with SmileID for verification purposes only.</Text>
    </View>
  </ScrollView>
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

const NumKey = ({ val, onPress }: any) => (
  <TouchableOpacity style={styles.numBtn} onPress={() => onPress(val)}>
    <Text style={styles.numText}>{val}</Text>
  </TouchableOpacity>
);

const ReceiptRow = ({ label, value }: any) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
    <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>{label}</Text>
    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  deviceContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', paddingVertical: 20 },
  iphoneFrameShadow: { shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 35, elevation: 25 },
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
  screenContainerFull: { flex: 1, backgroundColor: '#fff' },
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
  advisorPulseCard: { backgroundColor: '#4f46e5', borderRadius: 28, padding: 24, marginTop: 25, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  pulseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  pulseTag: { color: '#fff', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  pulseTitle: { color: '#fff', fontSize: 16, fontWeight: '800', lineHeight: 22, marginBottom: 15 },
  pulseAction: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  section: { marginTop: 35 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 20 },
  gridItem: { alignItems: 'center', width: '22%' },
  iconCircle: { width: 56, height: 56, backgroundColor: '#f8fafc', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  iconCircleActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  gridLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
  posTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
  posCloseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  posTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  posBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  posBadgeText: { fontSize: 10, color: '#ef4444', fontWeight: '900' },
  posDisplay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  posCurrency: { fontSize: 10, fontWeight: '900', color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  posMainValue: { fontSize: 56, fontWeight: '900', color: '#0f172a' },
  numpad: { paddingHorizontal: 20, marginBottom: 20 },
  numRow: { flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 10 },
  numBtn: { width: 75, height: 75, justifyContent: 'center', alignItems: 'center', borderRadius: 37.5 },
  numText: { fontSize: 28, fontWeight: '700', color: '#0f172a' },
  posActionArea: { paddingHorizontal: 24, paddingBottom: 40 },
  posGenBtn: { height: 70, backgroundColor: '#0f172a', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  posGenBtnDisabled: { opacity: 0.3 },
  posGenBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  posOverlay: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  posBack: { position: 'absolute', top: 60, left: 30, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  qrContainer: { alignItems: 'center', paddingHorizontal: 40, width: '100%' },
  posHeader: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 10 },
  posAmountDisplay: { color: '#fff', fontSize: 44, fontWeight: '900', marginBottom: 30 },
  qrCodeBox: { backgroundColor: '#fff', padding: 25, borderRadius: 32, marginBottom: 30 },
  posStatusText: { color: '#94a3b8', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  posSubText: { color: '#64748b', fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 10 },
  successIconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  receiptBox: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', padding: 24, borderRadius: 24, marginBottom: 30 },
  doneBtn: { width: '100%', height: 60, backgroundColor: '#4f46e5', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  doneBtnText: { color: '#fff', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 },
  accountCard: { backgroundColor: '#f8fafc', padding: 24, borderRadius: 28, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
  accountLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  accountValue: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  accountValueLarge: { fontSize: 28, fontWeight: '900', color: '#4f46e5', letterSpacing: 2 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 16 },
  infoBox: { flexDirection: 'row', backgroundColor: '#eef2ff', padding: 16, borderRadius: 16, marginBottom: 24 },
  infoText: { flex: 1, fontSize: 12, color: '#3730a3', lineHeight: 18, fontWeight: '600' },
  inputContainer: { marginBottom: 24 },
  inputLabel: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 },
  mainInput: { fontSize: 48, fontWeight: '900', color: '#0f172a', borderBottomWidth: 2, borderBottomColor: '#f1f5f9', paddingVertical: 10 },
  addressInput: { fontSize: 14, fontWeight: '700', color: '#0f172a', backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  complianceNote: { textAlign: 'center', fontSize: 10, color: '#94a3b8', marginTop: 16, fontWeight: '700', textTransform: 'uppercase' },
  swapInterface: { marginBottom: 30 },
  swapCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  swapLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 },
  swapRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  swapCurrency: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  swapInput: { fontSize: 24, fontWeight: '900', color: '#4f46e5', textAlign: 'right', flex: 1 },
  swapOutput: { fontSize: 24, fontWeight: '900', color: '#10b981' },
  swapArrow: { height: 60, justifyContent: 'center', alignItems: 'center' },
  arrowCircle: { width: 44, height: 44, backgroundColor: '#f1f5f9', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  quoteDetails: { backgroundColor: '#f1f5f9', padding: 20, borderRadius: 20 },
  quoteRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  quoteLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  quoteVal: { fontSize: 12, color: '#0f172a', fontWeight: '800' },
  quoteLabelTotal: { fontSize: 14, color: '#0f172a', fontWeight: '900' },
  quoteValTotal: { fontSize: 16, color: '#10b981', fontWeight: '900' },
  toggleRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 14, padding: 4, marginBottom: 24 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  toggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  toggleText: { fontSize: 12, fontWeight: '900', color: '#94a3b8' },
  toggleTextActive: { color: '#0f172a' },
  savedBankCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  chatScroll: { flex: 1, marginBottom: 15 },
  bubble: { padding: 16, borderRadius: 20, marginBottom: 10, maxWidth: '85%' },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#4f46e5' },
  bubbleAi: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9' },
  bubbleText: { fontSize: 14, fontWeight: '600' },
  textUser: { color: '#fff' },
  textAi: { color: '#0f172a' },
  inputRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  chatInput: { flex: 1, height: 56, backgroundColor: '#f1f5f9', borderRadius: 28, paddingHorizontal: 20 },
  sendBtn: { width: 56, height: 56, backgroundColor: '#4f46e5', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { width: 70, height: 70, backgroundColor: '#4f46e5', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 8, marginBottom: 30 },
  primaryButton: { width: '100%', height: 64, backgroundColor: '#4f46e5', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
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
  kycCard: { backgroundColor: '#f0fdf4', padding: 30, borderRadius: 24, borderWidth: 1, borderColor: '#bbf7d0' },
  kycText: { color: '#166534', fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  safetyCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center' },
  safetyTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginBottom: 5 },
  safetyText: { fontSize: 11, color: '#64748b', textAlign: 'center', lineHeight: 16 },
  legalSection: { marginBottom: 25 },
  legalTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  legalText: { fontSize: 13, color: '#64748b', lineHeight: 20 },
  titleNative: { fontSize: 32, fontWeight: '900', color: '#0f172a', marginBottom: 10 },
  advisorSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 30, lineHeight: 20 },
  advisorContent: { marginTop: 0 },
  insightCard: { backgroundColor: '#f8fafc', padding: 24, borderRadius: 28, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 30 },
  insightText: { fontSize: 16, color: '#1e293b', lineHeight: 24, fontWeight: '500' },
  sourceLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 15 },
  sourceCard: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  sourceIcon: { width: 32, height: 32, backgroundColor: '#f1f5f9', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  sourceTitle: { fontSize: 13, fontWeight: '800', color: '#1e293b' },
  sourceUri: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  refreshBtn: { marginTop: 20, padding: 20, alignItems: 'center' },
  refreshBtnText: { color: '#4f46e5', fontWeight: '900', fontSize: 12, textTransform: 'uppercase' },
  loadingFull: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  loadingText: { marginTop: 15, fontSize: 12, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
});
