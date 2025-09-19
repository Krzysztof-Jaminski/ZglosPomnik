import { useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useHapticFeedback = () => {
  const triggerHaptic = useCallback(async (style: ImpactStyle = ImpactStyle.Medium) => {
    try {
      // Sprawdź czy jesteśmy na urządzeniu mobilnym z Capacitor
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        await Haptics.impact({ style });
      }
    } catch (error) {
      // Ignoruj błędy haptic feedback - nie jest krytyczne dla działania aplikacji
      console.log('Haptic feedback not available:', error);
    }
  }, []);

  const triggerLightHaptic = useCallback(() => {
    triggerHaptic(ImpactStyle.Light);
  }, [triggerHaptic]);

  const triggerMediumHaptic = useCallback(() => {
    triggerHaptic(ImpactStyle.Medium);
  }, [triggerHaptic]);

  const triggerHeavyHaptic = useCallback(() => {
    triggerHaptic(ImpactStyle.Heavy);
  }, [triggerHaptic]);

  const triggerSelectionHaptic = useCallback(async () => {
    try {
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        await Haptics.selectionStart();
        await Haptics.selectionChanged();
        await Haptics.selectionEnd();
      }
    } catch (error) {
      console.log('Selection haptic feedback not available:', error);
    }
  }, []);

  const triggerNotificationHaptic = useCallback(async (type: 'success' | 'warning' | 'error' = 'success') => {
    try {
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        await Haptics.notification({
          type: type === 'success' ? 'SUCCESS' : type === 'warning' ? 'WARNING' : 'ERROR'
        });
      }
    } catch (error) {
      console.log('Notification haptic feedback not available:', error);
    }
  }, []);

  return {
    triggerHaptic,
    triggerLightHaptic,
    triggerMediumHaptic,
    triggerHeavyHaptic,
    triggerSelectionHaptic,
    triggerNotificationHaptic
  };
};
