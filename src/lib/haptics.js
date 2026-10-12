import * as Haptics from 'expo-haptics';
// Safe on web / unsupported devices: never throws.
const run=f=>{try{const p=f();p&&p.catch&&p.catch(()=>{})}catch{}};
export const tap=()=>run(()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const press=()=>run(()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
export const success=()=>run(()=>Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
