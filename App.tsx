
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { AdminDashboard } from './components/AdminDashboard';
import { MobilePreview } from './components/MobilePreview';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admin' | 'mobile'>('mobile');

  return (
    <View style={styles.container}>
      {/* Simulation Toggle - Web Only Helper */}
      <View style={styles.webNav}>
         <TouchableOpacity 
           onPress={() => setActiveTab('admin')}
           style={[styles.navBtn, activeTab === 'admin' && styles.navBtnActive]}
         >
           <Text style={[styles.navText, activeTab === 'admin' && styles.navTextActive]}>Admin Dashboard</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           onPress={() => setActiveTab('mobile')}
           style={[styles.navBtn, activeTab === 'mobile' && styles.navBtnActive]}
         >
           <Text style={[styles.navText, activeTab === 'mobile' && styles.navTextActive]}>Mobile App (Native Primitives)</Text>
         </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'admin' ? (
          <AdminDashboard />
        ) : (
          <MobilePreview />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  webNav: { 
    flexDirection: 'row', 
    backgroundColor: '#111827', 
    padding: 10, 
    justifyContent: 'center',
    gap: 20
  },
  navBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  navBtnActive: { backgroundColor: '#4f46e5' },
  navText: { color: '#9ca3af', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  navTextActive: { color: '#fff' },
  content: { flex: 1 }
});

export default App;
