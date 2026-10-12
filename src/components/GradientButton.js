import React,{memo} from 'react';
import {Pressable,Text,View,StyleSheet,ActivityIndicator} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import Animated,{useSharedValue,useAnimatedStyle,withSpring} from 'react-native-reanimated';
import {useC,type} from '../theme';
import {press} from '../lib/haptics';
const AP=Animated.createAnimatedComponent(Pressable);
// Min 48px tall, red glow, spring press. `ghost` = glass outline variant.
function GradientButton({title,onPress,icon,ghost,disabled,loading,style,height=52}){
 const C=useC(),sc=useSharedValue(1),a=useAnimatedStyle(()=>({transform:[{scale:sc.value}]}));
 return(<AP accessibilityRole="button" accessibilityLabel={title} accessibilityState={{disabled:!!(disabled||loading)}} disabled={disabled||loading}
  onPressIn={()=>{sc.value=withSpring(0.96,{damping:15,stiffness:300})}} onPressOut={()=>{sc.value=withSpring(1,{damping:12,stiffness:260})}}
  onPress={()=>{press();onPress&&onPress()}}
  style={[{height,minHeight:48,borderRadius:height/2},!ghost&&C.glow,disabled&&{opacity:0.5},a,style]}>
  {ghost?<View style={[StyleSheet.absoluteFill,{borderRadius:height/2,borderWidth:1,borderColor:C.glassBorder,backgroundColor:C.glassFill}]}/>
   :<LinearGradient colors={C.btnG} start={{x:0,y:0}} end={{x:1,y:1}} style={[StyleSheet.absoluteFill,{borderRadius:height/2}]}/>}
  <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingHorizontal:20}}>
   {loading?<ActivityIndicator color="#fff"/>:<>
    {!!icon&&<Icon name={icon} size={20} color={ghost?C.tx:'#fff'}/>}
    <Text style={[type.bodyB,{color:ghost?C.tx:'#fff'}]} numberOfLines={1}>{title}</Text></>}</View></AP>)}
export default memo(GradientButton);
