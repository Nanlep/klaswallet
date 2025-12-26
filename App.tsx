
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { AdminDashboard } from './components/AdminDashboard';
import { MobilePreview } from './components/MobilePreview';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admin' | 'mobile'>('mobile');

  return (
    <SafeAreaView style={styles.container}>
      {/* Simulation Toggle - Web-only control layer */}
      <View style={styles.webNav}>
         <TouchableOpacity 
           onPress={() => setActiveTab('admin')}
           style={[styles.navBtn, activeTab === 'admin' && styles.navBtnActive]}
         >
           <Text style={[styles.navText, activeTab === 'admin' && styles.navTextActive]}>Admin Master</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           onPress={() => setActiveTab('mobile')}
           style={[styles.navBtn, activeTab === 'mobile' && styles.navBtnActive]}
         >
           <Text style={[styles.navText, activeTab === 'mobile' && styles.navTextActive]}>Mobile App Preview</Text>
         </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'admin' ? (
          <View style={styles.fullFill}>
            <AdminDashboard />
          </View>
        ) : (
          <View style={styles.fullFill}>
            <MobilePreview />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  webNav: { 
    flexDirection: 'row', 
    backgroundColor: '#0f172a', 
    padding: 12, 
    justifyContent: 'center',
    gap: 15,
    zIndex: 100
  },
  navBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  navBtnActive: { backgroundColor: '#4f46e5' },
  navText: { color: '#94a3b8', fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  navTextActive: { color: '#fff' },
  content: { flex: 1 },
  fullFill: { flex: 1, height: '100%' }
});

export default App;
