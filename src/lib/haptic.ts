import vkBridge from '@vkontakte/vk-bridge';

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

const styleMap: Record<HapticStyle, 'light' | 'medium' | 'heavy'> = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  rigid: 'heavy',
  soft: 'light',
};

export function triggerHaptic(style: HapticStyle = 'medium'): void {
  try {
    if (vkBridge.supports('VKWebAppTapticImpactOccurred')) {
      void vkBridge.send('VKWebAppTapticImpactOccurred', { style: styleMap[style] });
      return;
    }
  } catch {
    // fall through to navigator.vibrate
  }
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(50);
    }
  } catch {
    // ignore
  }
}
