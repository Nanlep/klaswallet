
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export enum BiometricType {
  FACE_ID = 'FaceID',
  TOUCH_ID = 'TouchID',
  NONE = 'None'
}

export class NativeSecurity {
  static async authenticateBiometrics(): Promise<{ success: boolean; error?: string }> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return { success: false, error: 'Biometrics not available' };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authorize Transaction',
      fallbackLabel: 'Use Passcode',
    });

    // Use explicit type narrowing to fix the error: Property 'error' does not exist on type 'LocalAuthenticationResult'.
    // In expo-local-authentication, 'error' is only present when 'success' is false.
    if (result.success) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: result.error 
      };
    }
  }

  static async setSecureItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  static async getSecureItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }

  static triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') {
    switch (type) {
      case 'light': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
      case 'medium': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
      case 'heavy': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); break;
      case 'success': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
      case 'warning': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); break;
      case 'error': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); break;
    }
  }
}
