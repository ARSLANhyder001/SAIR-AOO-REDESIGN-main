import React,{createContext,useContext,useRef,memo} from 'react';
import {View,StyleSheet,Platform} from 'react-native';
import {BlurView,BlurTargetView} from 'expo-blur';
import {LinearGradient} from 'expo-linear-gradient';
import {useC,radius} from '../theme';

/* Android needs a BlurTargetView (SDK 55+): wrap the screen in <GlassProvider>, put the visual
   background (gradient etc.) inside <GlassBackdrop>, and every <GlassCard> blurs it automatically.
   iOS/web blur natively without any of this; if no provider exists, Android falls back to a translucent fill. */
const TargetCtx=createContext(null);
export function GlassProvider({children,style}){const ref=useRef(null);return <TargetCtx.Provider value={ref}><View style={[{flex:1},style]}>{children}</View></TargetCtx.Provider>}
export function GlassBackdrop({children,style}){const ref=useContext(TargetCtx);return <BlurTargetView ref={ref} style={[StyleSheet.absoluteFill,style]}>{children}</BlurTargetView>}

function GlassCard({children,style,intensity=40,r=radius.card,glow,padding}){
 const C=useC(),target=useContext(TargetCtx),android=Platform.OS==='android';
 return(<View style={[{borderRadius:r,overflow:'hidden',borderWidth:1,borderColor:C.glassBorder},glow&&C.glow,padding!=null&&{padding},style]}>
  <BlurView intensity={intensity} tint={C.blurTint} style={StyleSheet.absoluteFill}
   {...(android&&target?{blurTarget:target,blurMethod:'dimezisBlurViewSdk31Plus'}:{})}/>
  <View pointerEvents="none" style={[StyleSheet.absoluteFill,{backgroundColor:C.glassFill}]}/>
  <LinearGradient pointerEvents="none" colors={C.dark?['rgba(255,255,255,0.14)','rgba(255,255,255,0)']:['rgba(255,255,255,0.7)','rgba(255,255,255,0)']} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill}/>
  {children}</View>)}
export default memo(GlassCard);
