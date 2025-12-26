
/**
 * NativeSecurity Abstraction
 * Handles bridging to device hardware features.
 */

export enum BiometricType {
  FACE_ID = 'FaceID',
  TOUCH_ID = 'TouchID',
  NONE = 'None'
}

export class NativeSecurity {
  /**
   * Mocking expo-local-authentication
   */
  static async authenticateBiometrics(): Promise<{ success: boolean; error?: string }> {
    console.log("[Native] Invoking Device Biometric Prompt...");
    // In actual Expo: return await LocalAuthentication.authenticateAsync();
    await new Promise(r => setTimeout(r, 1000));
    return { success: true };
  }

  /**
   * Mocking expo-secure-store
   */
  static async setSecureItem(key: string, value: string): Promise<void> {
    console.log(`[Native] Writing to Secure Enclave: ${key}`);
    localStorage.setItem(`_secure_${key}`, value);
  }

  static async getSecureItem(key: string): Promise<string | null> {
    return localStorage.getItem(`_secure_${key}`);
  }

  /**
   * Mocking expo-haptics
   */
  static triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') {
    console.log(`[Native] Haptic Feedback: ${type}`);
    if ('vibrate' in navigator) {
      const pattern = type === 'error' ? [10, 30, 10, 30] : [10];
      navigator.vibrate(pattern);
    }
  }
}
