import React,{memo} from 'react';
import {Pressable,Text,View} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import Animated,{useSharedValue,useAnimatedStyle,withSpring} from 'react-native-reanimated';
import GlassCard from './GlassCard';
import {useC,type} from '../theme';
import {tap} from '../lib/haptics';
const AP=Animated.createAnimatedComponent(Pressable);
function ServiceTile({icon,title,line,onPress}){
 const C=useC(),sc=useSharedValue(1),a=useAnimatedStyle(()=>({transform:[{scale:sc.value}]}));
 return(<AP accessibilityRole="button" accessibilityLabel={`${title}. ${line}`} onPress={()=>{tap();onPress()}}
  onPressIn={()=>{sc.value=withSpring(0.94,{damping:15,stiffness:300})}} onPressOut={()=>{sc.value=withSpring(1,{damping:12,stiffness:240})}} style={[{width:140},a]}>
  <GlassCard r={20} style={{minHeight:150}} padding={14}>
   <LinearGradient colors={C.btnG} style={[{width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center'},C.glow]}><Icon name={icon} size={24} color="#fff"/></LinearGradient>
   <Text numberOfLines={2} style={[type.smallB,{color:C.tx,marginTop:12}]}>{title}</Text>
   <Text numberOfLines={2} style={[type.caption,{color:C.mute,marginTop:2}]}>{line}</Text></GlassCard></AP>)}
export default memo(ServiceTile);
